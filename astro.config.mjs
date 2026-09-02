// @ts-check
import fs from 'node:fs';
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import markdoc from '@astrojs/markdoc';
import tailwindcss from '@tailwindcss/vite';

// Keystatic's GitHub-storage routes (/keystatic + /api/keystatic) read KEYSTATIC_SECRET (the
// session-signing secret) at request time and throw a 500 when it is absent — exactly what
// happens on a deploy where the CMS env vars were never set. Only inject those routes once a
// secret exists (or in local dev, which uses no-auth local storage and needs no secret). When
// absent, /admin (src/pages/admin.astro) shows a friendly "CMS not configured" page and the
// walkthrough in docs/content-management.md covers the one-time GitHub App setup.
// KEYSTATIC_SECRET must be a real long random secret, not just present. A too-short value passes a
// truthy check but Keystatic then fails at runtime (the "short-secret trap"), so require >= 32
// chars and say so loudly instead of registering a CMS that will 500.
const KEYSTATIC_MIN_SECRET = 32;
const rawKeystaticSecret = process.env.KEYSTATIC_SECRET ?? '';
const keystaticSecretOk = rawKeystaticSecret.length >= KEYSTATIC_MIN_SECRET;
if (rawKeystaticSecret && !keystaticSecretOk) {
  console.warn(
    `\n⚠ KEYSTATIC_SECRET is set but only ${rawKeystaticSecret.length} characters — it must be at least ` +
      `${KEYSTATIC_MIN_SECRET}. The CMS stays DISABLED until this is fixed. Generate one with: openssl rand -base64 32\n`,
  );
}
const keystaticEnabled = process.argv.includes('dev') || keystaticSecretOk;

// Canonical origin — shared by `site` and the sitemap root-slash fix below so they cannot drift.
const SITE_ORIGIN = 'https://www.manchesterrivercruises.com';

// https://astro.build/config
export default defineConfig({
  // `site` is the canonical origin — the sitemap uses it for absolute URLs.
  site: SITE_ORIGIN,
  // ── URL FORM: unslashed, to match the legacy Craft site exactly ──────────────
  // The legacy site emitted every URL WITHOUT a trailing slash (`/whats-on`), and that
  // is the form Google has indexed. Astro's default `directory` format emits
  // `<route>/index.html`, which makes canonicals and sitemap entries `/whats-on/` —
  // a different string from the indexed one. That was tolerable while it was cosmetic,
  // but the /tour/ namespace adoption (docs/url-parity.md) means ~20 product URLs now
  // depend on matching the legacy form exactly, so it is no longer cosmetic.
  //
  // `format: 'file'` emits `<route>.html`, so every URL is served unslashed and
  // Astro.url.pathname (which BaseLayout derives the canonical from) has no trailing
  // slash. `trailingSlash: 'never'` keeps dev-server matching consistent with that.
  // Nested sections still work: /tour/boat-to-old-trafford.html sits alongside the
  // directory /tour/boat-to-old-trafford/ holding the departure-point pages.
  //
  // NOTE: this does NOT affect the on-demand Keystatic routes (/keystatic,
  // /api/keystatic) — those are SSR-rendered by the Netlify function, not emitted as
  // static files, so the build format does not apply to them.
  build: { format: 'file' },
  trailingSlash: 'never',
  // Static output (default). The Netlify adapter is the deployment target and also enables
  // the on-demand (prerender:false) routes Keystatic injects: the admin UI at /keystatic and
  // its API at /api/keystatic (see keystatic.config.ts).
  adapter: netlify(),
  integrations: [
    // Markdoc renders the events + discover collections (.mdoc). typographer:true reproduces
    // the smart quotes/ellipsis the previous markdown pipeline emitted; heading slug ids are
    // restored in markdoc.config.mjs — so the built pages stay content-identical.
    markdoc({ typographer: true }),
    // react() powers Keystatic's admin UI (React). keystatic() injects /keystatic + /api/keystatic
    // — but ONLY when configured (keystaticEnabled), so an unconfigured deploy can't 500.
    react(),
    ...(keystaticEnabled ? [keystatic()] : []),
    sitemap({
      // Keep the Keystatic admin UI + API and the /admin entry out of the public sitemap.
      filter: (page) => !/\/(keystatic|admin)(\/|$)/.test(page) && !page.includes('/api/keystatic'),
    }),
    // The sitemap's homepage entry must be the SAME STRING as the canonical BaseLayout renders.
    // It was not: the canonical is "https://…com/" (a root canonical conventionally carries its
    // slash) while the sitemap emitted "https://…com". Every other URL already agrees — unslashed
    // in both, per docs/url-parity.md §6 — so the root is the single exception.
    //
    // This cannot be done with sitemap()'s own `serialize`: that hook is handed the URL WITH the
    // slash and the strip happens downstream of it, so serialize sees nothing to fix (verified by
    // logging what it receives). Patch the emitted XML instead, where the strings are final.
    // Scoped to the exact origin string, so it can never touch another entry.
    {
      name: 'mrc:sitemap-root-slash',
      hooks: {
        'astro:build:done': ({ dir, logger }) => {
          const from = '<loc>' + SITE_ORIGIN + '</loc>';
          const to = '<loc>' + SITE_ORIGIN + '/</loc>';
          let patched = 0;
          for (const file of fs.readdirSync(dir)) {
            if (!/^sitemap.*\.xml$/.test(file)) continue;
            const p = new URL(file, dir);
            const before = fs.readFileSync(p, 'utf8');
            const after = before.split(from).join(to);
            if (after !== before) {
              fs.writeFileSync(p, after);
              patched++;
            }
          }
          if (patched) logger.info('homepage <loc> aligned to the canonical trailing-slash form');
        },
      },
    },
  ],
  // /admin is served by src/pages/admin.astro — it bounces to /keystatic when the CMS is
  // configured, or shows a graceful "not configured" gate when it isn't (replaces the old
  // static redirect, which would have pointed at the crashing route).
  vite: {
    // Tailwind v4's plugin is typed against a different Vite copy than Astro 5 bundles.
    plugins: /** @type {any} */ ([tailwindcss()]),
  },
});
