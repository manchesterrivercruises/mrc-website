// @ts-check
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.manchesterrivercruises.com',
  // Static output (default). The Netlify adapter is the deployment target.
  adapter: netlify(),
  vite: {
    plugins: [tailwindcss()],
  },
});
