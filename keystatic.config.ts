import { config, fields, collection } from '@keystatic/core';

// Keystatic CMS — Phase 2 (see docs/content-management.md).
//
// Storage: LOCAL in dev (writes straight to the working tree, no auth) and GITHUB in
// production (commits to the repo via a GitHub App → Netlify auto-deploys). The GitHub App
// env vars are documented in .env.example and docs/content-management.md.
//
// These collections mirror the Astro Content Collection schemas in src/content/config.ts.
// The gallery/vessels/attractions collections are frontmatter-only, so they are stored as
// YAML `data` files (Keystatic cannot write plain `.md`); the loaders in config.ts read
// `**/*.yaml` to match. Events + discover carry rendered markdown bodies and stay as `.md`
// for now — modelling them needs `@astrojs/markdoc` (they'd become `.mdoc`); that's a
// documented follow-up (see docs/content-management.md → "Events & Discover follow-up").

const KEBAB = { regex: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, message: 'Lowercase letters, numbers and single hyphens only.' };

// Gallery cover/image paths are TEXT, not a Keystatic `fields.image` upload. The real data
// spans several locations — per-album folders (/images/gallery/<slug>/…), shared event art
// (/images/events/…), site root (/images/…) AND some temporary external hotlink URLs — which
// a single-directory image field cannot represent without rewriting (and corrupting) paths on
// save. Text round-trips every value losslessly and lets Simon edit alt/caption/order/etc.
// safely. Adding a NEW photo: process it to WebP (800 + <=1600) and drop it in the album
// folder first, then paste its path here. In-CMS UPLOAD + build-time WebP optimisation is a
// documented follow-up (docs/content-management.md → "Image handling & follow-ups").
const galleryImagePath = (label: string) =>
  fields.text({
    label,
    description:
      'Path to an owned image (e.g. /images/gallery/<album>/<name>.webp) or a temporary hotlink URL. Process new photos to WebP and place them before referencing them here.',
    validation: { isRequired: true },
  });

export default config({
  storage:
    import.meta.env?.DEV
      ? { kind: 'local' }
      : { kind: 'github', repo: 'manchesterrivercruises/mrc-website' },
  ui: {
    brand: { name: 'Manchester River Cruises' },
  },
  collections: {
    // ---- Gallery albums (the driving use case) -------------------------------------------
    gallery: collection({
      label: 'Gallery albums',
      path: 'src/content/gallery/*',
      slugField: 'slug',
      format: { data: 'yaml' },
      columns: ['title', 'category'],
      schema: {
        title: fields.text({ label: 'Title', validation: { isRequired: true } }),
        slug: fields.slug({
          name: {
            label: 'Slug (URL + filename)',
            description:
              'Lowercase, hyphenated. Used in /gallery/<slug>, the filename, and relatedAlbums. Must match the filename.',
            validation: { pattern: KEBAB },
          },
        }),
        order: fields.integer({
          label: 'Order',
          description: 'Lower sorts first on the gallery wall. Leave blank to fall to the end.',
        }),
        summary: fields.text({ label: 'Summary', multiline: true, validation: { isRequired: true } }),
        category: fields.select({
          label: 'Category',
          description: 'Drives the gallery-wall filter pills.',
          options: [
            { label: 'Live music', value: 'live-music' },
            { label: 'DJ night', value: 'dj-night' },
            { label: 'Family', value: 'family' },
            { label: 'Seasonal', value: 'seasonal' },
            { label: 'Boats', value: 'boats' },
            { label: 'Route', value: 'route' },
            { label: 'Private hire', value: 'private-hire' },
          ],
          defaultValue: 'route',
        }),
        coverImage: galleryImagePath('Cover image'),
        coverAlt: fields.text({ label: 'Cover alt text', multiline: true, validation: { isRequired: true } }),
        images: fields.array(
          fields.object({
            src: galleryImagePath('Image'),
            alt: fields.text({
              label: 'Alt text (required)',
              description: 'Describe what is actually in the photo — used for screen readers and SEO.',
              multiline: true,
              validation: { isRequired: true },
            }),
            width: fields.integer({ label: 'Width (px)', description: 'Real pixel width — powers PhotoSwipe zoom. Blank falls back to a nominal size.' }),
            height: fields.integer({ label: 'Height (px)', description: 'Real pixel height.' }),
            caption: fields.text({ label: 'Caption' }),
            credit: fields.text({ label: 'Credit' }),
            orientation: fields.select({
              label: 'Orientation',
              options: [
                { label: 'Landscape', value: 'landscape' },
                { label: 'Portrait', value: 'portrait' },
                { label: 'Square', value: 'square' },
              ],
              defaultValue: 'landscape',
            }),
            tags: fields.array(fields.text({ label: 'Tag' }), { label: 'Tags', itemLabel: (p) => p.value }),
            isFeatured: fields.checkbox({ label: 'Featured', description: 'Hero-grade shot — candidate for product heroes, homepage cards, OG.' }),
            usage: fields.multiselect({
              label: 'Usage',
              description: 'Where this asset is cleared to appear across the site.',
              options: [
                { label: 'Gallery', value: 'gallery' },
                { label: 'Product page', value: 'product-page' },
                { label: 'Homepage', value: 'homepage' },
                { label: 'OG image', value: 'og-image' },
                { label: 'OTA listing', value: 'ota-listing' },
                { label: 'Event card', value: 'event-card' },
                { label: 'Private hire', value: 'private-hire' },
                { label: 'Press', value: 'press' },
              ],
            }),
          }),
          {
            label: 'Images',
            itemLabel: (props) => props.fields.alt.value || 'Image',
            validation: { length: { min: 1 } },
          },
        ),
        relatedAlbums: fields.array(fields.text({ label: 'Album slug' }), {
          label: 'Related albums',
          description: 'Album slugs to cross-link. Empty falls back to same-category albums.',
          itemLabel: (p) => p.value,
        }),
        relatedProduct: fields.text({ label: 'Related product path', description: 'e.g. /cruises/adele-cruise' }),
        bookingCtaLabel: fields.text({ label: 'Booking CTA label', validation: { isRequired: true } }),
        bookingCtaUrl: fields.text({ label: 'Booking CTA URL', validation: { isRequired: true } }),
        seoTitle: fields.text({ label: 'SEO title' }),
        seoDescription: fields.text({ label: 'SEO description', multiline: true }),
        draft: fields.checkbox({ label: 'Draft', description: 'Hidden from the site until unchecked.' }),
      },
    }),

    // ---- Vessels (fleet pages) -----------------------------------------------------------
    vessels: collection({
      label: 'Vessels',
      path: 'src/content/vessels/*',
      slugField: 'name',
      format: { data: 'yaml' },
      columns: ['name'],
      schema: {
        name: fields.slug({ name: { label: 'Name' } }),
        description: fields.text({ label: 'Description', multiline: true, validation: { isRequired: true } }),
        capacity: fields.integer({ label: 'Capacity' }),
        features: fields.array(fields.text({ label: 'Feature' }), { label: 'Features', itemLabel: (p) => p.value }),
        heroImage: fields.image({ label: 'Hero image', directory: 'public/images/vessels', publicPath: '/images/vessels' }),
        heroImageAlt: fields.text({ label: 'Hero image alt' }),
        order: fields.integer({ label: 'Order' }),
      },
    }),

    // ---- Attractions ("make a day of it") ------------------------------------------------
    attractions: collection({
      label: 'Attractions',
      path: 'src/content/attractions/*',
      slugField: 'name',
      format: { data: 'yaml' },
      columns: ['name'],
      schema: {
        name: fields.slug({ name: { label: 'Name' } }),
        description: fields.text({ label: 'Description', multiline: true, validation: { isRequired: true } }),
        url: fields.url({ label: 'URL', validation: { isRequired: true } }),
        image: fields.image({ label: 'Image', directory: 'public/images/attractions', publicPath: '/images/attractions' }),
        imageAlt: fields.text({ label: 'Image alt' }),
        order: fields.integer({ label: 'Order' }),
      },
    }),
  },
});
