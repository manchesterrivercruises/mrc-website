import { config, fields, collection, singleton } from '@keystatic/core';

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

// Gallery images are now Keystatic UPLOADS (fields.image). A new upload is committed to
// public/images/gallery/ and the field stores its /images/gallery/<file> path. All hotlinks were
// migrated to owned local files first, so every value is a real repo file the field can resolve.
//
// One-directory caveat: fields.image writes NEW uploads to the single `public/images/gallery` dir
// (flat), whereas legacy photos live in per-album subfolders (/images/gallery/<album>/…). Those
// legacy nested paths still render and round-trip as stored strings; new uploads simply sit flat in
// /images/gallery. That's the accepted v1 shape.
//
// OPTIMISATION (v1, pragmatic): uploads are stored AS-IS — Astro's astro:assets does not optimise
// files referenced by a public/ path string, so there is no build-time resize/re-encode yet. The
// field descriptions therefore ask editors to size images DOWN before uploading (max-dimension
// guidance). Build-time optimisation via the image() helper is the documented follow-up
// (docs/content-management.md → "Image handling & follow-ups").
const galleryImage = (label: string) =>
  fields.image({
    label,
    directory: 'public/images/gallery',
    publicPath: '/images/gallery',
    validation: { isRequired: true },
    description:
      'Upload a WebP or JPG. Stored as-is (no auto-optimise in v1) — please SIZE IT DOWN first: ≤1600px on the longest edge, ideally WebP. New uploads land in /images/gallery.',
  });

export default config({
  storage:
    import.meta.env?.DEV
      ? { kind: 'local' }
      : { kind: 'github', repo: 'manchesterrivercruises/mrc-website' },
  ui: {
    brand: { name: 'Manchester River Cruises' },
    // Sidebar grouping. Ordered by how often Simon touches them: content he edits routinely
    // first, page wording next, site-wide settings last (rarely changed, easy to get wrong).
    navigation: {
      Content: ['gallery', 'events', 'discover', 'vessels', 'attractions'],
      'Page copy': ['pageCopy'],
      'Site-wide': ['siteSettings'],
    },
  },

  // ---- Singletons (Phase 2.5) ------------------------------------------------------------
  // Both write JSON (`format: { data: 'json' }`) rather than YAML, because the consuming
  // modules import them SYNCHRONOUSLY at build time — Vite handles .json natively, and a
  // sync import is what lets src/data/site.ts stay a plain module that ~34 files already
  // import at the top level (including lib/breadcrumbs.ts, which cannot await).
  singletons: {
    // ---- Site settings -------------------------------------------------------------------
    siteSettings: singleton({
      label: 'Site settings',
      path: 'src/data/site-settings',
      format: { data: 'json' },
      schema: {
        name: fields.text({
          label: 'Business name',
          description: 'The N in NAP. Used in the footer, page titles and every schema.org block.',
          validation: { isRequired: true },
        }),
        email: fields.text({ label: 'Email address', validation: { isRequired: true } }),
        phone: fields.text({
          label: 'Phone number',
          description:
            'Display form, e.g. "+44 7856 016 801". The tel: link is generated from this automatically — do not add a second field for it.',
          validation: { isRequired: true },
        }),
        address: fields.object(
          {
            streetAddress: fields.text({ label: 'Street address', validation: { isRequired: true } }),
            addressLocality: fields.text({ label: 'Town / city', validation: { isRequired: true } }),
            postalCode: fields.text({ label: 'Postcode', validation: { isRequired: true } }),
            addressCountry: fields.text({
              label: 'Country code',
              description: 'Two-letter ISO code, e.g. GB. Rarely needs changing.',
              validation: { isRequired: true },
            }),
          },
          {
            label: 'Address',
            description:
              'The A in NAP. The one-line address shown in the footer and on Getting Here is BUILT from these parts, so the displayed and structured addresses can never disagree.',
          },
        ),
        socials: fields.object(
          {
            facebook: fields.url({ label: 'Facebook URL' }),
            instagram: fields.url({ label: 'Instagram URL' }),
            tiktok: fields.url({ label: 'TikTok URL' }),
            tripadvisor: fields.url({ label: 'Tripadvisor URL' }),
          },
          {
            label: 'Social profiles',
            description:
              'Used for the footer icons, the contact page and the schema.org sameAs array. Leave one blank only if the profile genuinely no longer exists.',
          },
        ),
        footerTagline: fields.text({
          label: 'Footer tagline',
          description: 'The line of copy under the logo in the footer.',
          multiline: true,
          validation: { isRequired: true },
        }),
      },
    }),
  },

  collections: {
    // ---- Page copy -----------------------------------------------------------------------
    // COPY ONLY, one entry per bespoke page. Filename = the page, and the template imports
    // its own JSON directly (src/content/page-copy/<page>.json), so the `page` slug MUST match
    // the filename — changing it in the CMS renames the file and breaks the import.
    //
    // A COLLECTION, not one singleton per page: sixteen singletons would bury the sidebar. The
    // cost is that every page shares this one schema, so it is shape-based (sections, lists,
    // cards, FAQ groups, loose strings) rather than naming each page's fields. Templates read it
    // through src/lib/pageCopy.ts, whose lookups THROW AT BUILD TIME on a missing key — a typo
    // fails the build instead of silently rendering an empty heading.
    //
    // WHAT NEVER COMES IN HERE (it stays in the template):
    //   • structure, layout, components, icons, CSS
    //   • every href, and the nav/footer link architecture
    //   • forms and their option values (they are submitted data, not display copy)
    //   • schema.org / JSON-LD
    //   • live data — Ventrata + OCTO feeds, availability, real prices, the CRT route/sights
    //     data, and the What's On / date-finder product maps
    pageCopy: collection({
      label: 'Page copy',
      path: 'src/content/page-copy/*',
      slugField: 'page',
      format: { data: 'json' },
      columns: ['page', 'heading'],
      schema: {
        page: fields.slug({
          name: {
            label: 'Page',
            description:
              'Must match the filename the template imports (e.g. "about" → src/content/page-copy/about.json). Do not rename.',
            validation: { pattern: KEBAB },
          },
        }),

        seoTitle: fields.text({ label: 'SEO title', description: 'Browser tab + Google result title.' }),
        seoDescription: fields.text({ label: 'SEO description', multiline: true }),

        eyebrow: fields.text({ label: 'Eyebrow', description: 'Small line above the main heading, where the design has one.' }),
        heading: fields.text({ label: 'Main heading (H1)' }),
        intro: fields.text({ label: 'Intro paragraph', multiline: true }),

        keyFacts: fields.array(fields.text({ label: 'Fact' }), {
          label: 'Key facts strip',
          description:
            'Short facts shown in the strip under the hero. Each pairs with a fixed icon by position. ⚠ PRICES: a price written here is display copy only — it does NOT drive checkout. Ventrata is the source of truth; if you change one, confirm it matches Ventrata.',
          itemLabel: (p) => p.value,
        }),

        sections: fields.array(
          fields.object({
            key: fields.text({
              label: 'Key',
              description: 'How the template finds this section. Do not change — it is a code reference, not copy.',
              validation: { isRequired: true },
            }),
            heading: fields.text({ label: 'Heading' }),
            body: fields.array(fields.text({ label: 'Paragraph', multiline: true }), {
              label: 'Body paragraphs',
              itemLabel: (p) => (p.value || '').slice(0, 60),
            }),
            note: fields.text({
              label: 'Small note',
              description: 'The smaller grey line under the body — usually a (TBC) placeholder. Clear it once real copy lands.',
              multiline: true,
            }),
          }),
          { label: 'Sections', itemLabel: (p) => p.fields.heading.value || p.fields.key.value || 'Section' },
        ),

        lists: fields.array(
          fields.object({
            key: fields.text({ label: 'Key', description: 'Code reference — do not change.', validation: { isRequired: true } }),
            items: fields.array(fields.text({ label: 'Item' }), { label: 'Items', itemLabel: (p) => p.value }),
          }),
          {
            label: 'Lists (bullets, pills, checklists)',
            description:
              '⚠ PRICES: a price written in a list item is display copy only — it does NOT drive checkout. Ventrata is the source of truth; if you change one, confirm it matches Ventrata.',
            itemLabel: (p) => p.fields.key.value || 'List',
          },
        ),

        cards: fields.array(
          fields.object({
            key: fields.text({
              label: 'Key',
              description: 'Code reference, "group:name". Do not change — the link destination is matched to it in code.',
              validation: { isRequired: true },
            }),
            name: fields.text({ label: 'Card title', validation: { isRequired: true } }),
            desc: fields.text({ label: 'Card description', multiline: true }),
            linkText: fields.text({ label: 'Link text' }),
          }),
          { label: 'Cards', itemLabel: (p) => p.fields.name.value || 'Card' },
        ),

        faqGroups: fields.array(
          fields.object({
            key: fields.text({ label: 'Key', description: 'Code reference — do not change.', validation: { isRequired: true } }),
            title: fields.text({ label: 'Group title' }),
            items: fields.array(
              fields.object({
                question: fields.text({ label: 'Question' }),
                answer: fields.text({ label: 'Answer', multiline: true }),
              }),
              { label: 'Questions', itemLabel: (p) => p.fields.question.value || 'FAQ' },
            ),
          }),
          { label: 'FAQ groups', itemLabel: (p) => p.fields.title.value || p.fields.key.value || 'FAQs' },
        ),

        strings: fields.array(
          fields.object({
            key: fields.text({ label: 'Key', description: 'Code reference — do not change.', validation: { isRequired: true } }),
            value: fields.text({ label: 'Text', multiline: true }),
          }),
          {
            label: 'Other text (labels, buttons, one-off lines)',
            description:
              '⚠ PRICES: any price written here is display copy only — it does NOT drive checkout. Ventrata is the source of truth, so if you change a price here you must confirm it matches Ventrata, or the page will advertise one price and charge another.',
            itemLabel: (p) => `${p.fields.key.value}: ${(p.fields.value.value || '').slice(0, 40)}`,
          },
        ),
      },
    }),

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
        coverImage: galleryImage('Cover image'),
        coverAlt: fields.text({ label: 'Cover alt text', multiline: true, validation: { isRequired: true } }),
        images: fields.array(
          fields.object({
            src: galleryImage('Image'),
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
        relatedProduct: fields.text({ label: 'Related product path', description: 'e.g. /tour/adele-cruise' }),
        bookingCtaLabel: fields.text({ label: 'Booking CTA label', validation: { isRequired: true } }),
        bookingCtaUrl: fields.text({ label: 'Booking CTA URL', validation: { isRequired: true } }),
        seoTitle: fields.text({ label: 'SEO title' }),
        seoDescription: fields.text({ label: 'SEO description', multiline: true }),
        draft: fields.checkbox({ label: 'Draft', description: 'Hidden from the site until unchecked.' }),
      },
    }),

    // ---- Events / special-cruise pages ---------------------------------------------------
    // Stored as Markdoc (.mdoc): frontmatter + a rendered body. DATES ARE NOT EDITABLE HERE —
    // Ventrata (OCTO) owns event dates, times and live prices; the schema's legacy
    // start/endDate are intentionally NOT modelled. See the ventrataProductId note below.
    events: collection({
      label: 'Events',
      path: 'src/content/events/*',
      slugField: 'title',
      format: { contentField: 'content' },
      columns: ['title', 'category'],
      schema: {
        title: fields.slug({
          name: {
            label: 'Title',
            description: 'Display name. The URL slug (/tour/<slug>) is the filename — edit it in the Slug field.',
            validation: { isRequired: true },
          },
        }),
        description: fields.text({ label: 'Description', multiline: true, validation: { isRequired: true } }),
        shortTagline: fields.text({ label: 'Short tagline' }),
        ventrataProductId: fields.text({
          label: 'Ventrata product ID',
          description:
            'Links this page to its Ventrata product. IMPORTANT: dates, times and live prices come from Ventrata (OCTO) and are NOT edited in the CMS.',
        }),
        category: fields.select({
          label: 'Category',
          description: 'Events taxonomy (shared with the gallery filter).',
          options: [
            { label: 'Live music', value: 'live-music' },
            { label: 'DJ night', value: 'dj-night' },
            { label: 'Family', value: 'family' },
            { label: 'Seasonal', value: 'seasonal' },
          ],
          defaultValue: 'live-music',
        }),
        sailingTimes: fields.select({
          label: 'Sailing times',
          description:
            'When this event sails. An attribute, not a category — pick Both if it runs day AND evening. (Dolly joins the daytime programme in 2027 — switch it to Both then.)',
          options: [
            { label: 'Daytime', value: 'daytime' },
            { label: 'Evening', value: 'evening' },
            { label: 'Daytime & evening (both)', value: 'both' },
          ],
          defaultValue: 'evening',
        }),
        duration: fields.text({ label: 'Duration', description: 'e.g. "Approx. 2 hours (TBC)" — display copy only.' }),
        priceFrom: fields.integer({ label: 'Price from (£)', description: 'Optional display "from" price. Live prices come from Ventrata.' }),
        whatToExpect: fields.array(fields.text({ label: 'Point' }), {
          label: 'What to expect',
          itemLabel: (p) => p.value,
        }),
        faqs: fields.array(
          fields.object({
            question: fields.text({ label: 'Question' }),
            answer: fields.text({ label: 'Answer', multiline: true }),
          }),
          { label: 'FAQs', itemLabel: (p) => p.fields.question.value || 'FAQ' },
        ),
        heroImage: fields.image({
          label: 'Hero image',
          directory: 'public/images/events',
          publicPath: '/images/events',
          description:
            'Upload a WebP or JPG hero image. Stored as-is (no auto-optimise in v1) — SIZE IT DOWN first: ≤2000px wide, ideally WebP. Lands in /images/events.',
        }),
        heroImageAlt: fields.text({ label: 'Hero image alt' }),
        draft: fields.checkbox({ label: 'Draft', description: 'Hidden from the site until unchecked.' }),
        content: fields.markdoc({ label: 'Body' }),
      },
    }),

    // ---- Discover guides -----------------------------------------------------------------
    // Markdoc (.mdoc): frontmatter + article body. publishDate/updatedDate ARE editorial dates
    // (editable) — unlike event dates, these are ours to set.
    discover: collection({
      label: 'Discover guides',
      path: 'src/content/discover/*',
      slugField: 'title',
      format: { contentField: 'content' },
      columns: ['title'],
      schema: {
        title: fields.slug({
          name: {
            label: 'Title',
            description: 'Guide title. The URL slug (/discover/<slug>) is the filename — edit it in the Slug field.',
            validation: { isRequired: true },
          },
        }),
        description: fields.text({ label: 'Description', multiline: true, validation: { isRequired: true } }),
        heroImage: fields.text({ label: 'Hero image path', description: 'Path to an owned image or a temporary hotlink URL.' }),
        heroImageAlt: fields.text({ label: 'Hero image alt' }),
        publishDate: fields.date({ label: 'Publish date' }),
        updatedDate: fields.date({ label: 'Updated date' }),
        draft: fields.checkbox({ label: 'Draft', description: 'Hidden from the site until unchecked.' }),
        content: fields.markdoc({ label: 'Body' }),
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
