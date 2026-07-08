// @ts-check
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import markdoc from '@astrojs/markdoc';
import tailwindcss from '@tailwindcss/vite';

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
    // react() powers Keystatic's admin UI (React). keystatic() injects /keystatic + /api/keystatic.
    react(),
    keystatic(),
    sitemap({
      // Keep the Keystatic admin UI + API and the /admin entry out of the public sitemap.
      filter: (page) => !/\/(keystatic|admin)(\/|$)/.test(page) && !page.includes('/api/keystatic'),
    }),
  ],
  // Friendly admin entry point. The Keystatic UI lives at /keystatic (its hardcoded router
  // base); /admin just redirects there so Simon has a memorable URL.
  redirects: {
    '/admin': '/keystatic',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
