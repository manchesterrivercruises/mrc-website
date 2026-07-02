// @ts-check
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // `site` is the canonical origin — the sitemap uses it for absolute URLs.
  site: 'https://www.manchesterrivercruises.com',
  // Static output (default). The Netlify adapter is the deployment target.
  adapter: netlify(),
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
