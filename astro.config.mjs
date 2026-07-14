// @ts-check
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

// https://astro.build/config
export default defineConfig({
  // `site` is the canonical origin — the sitemap uses it for absolute URLs.
  site: 'https://www.manchesterrivercruises.com',
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
  ],
  // /admin is served by src/pages/admin.astro — it bounces to /keystatic when the CMS is
  // configured, or shows a graceful "not configured" gate when it isn't (replaces the old
  // static redirect, which would have pointed at the crashing route).
  vite: {
    plugins: [tailwindcss()],
  },
});
