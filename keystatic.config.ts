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
    navigation: {
      'Site-wide': ['siteSettings'],
      Pages: ['pagePrivateHire'],
      Content: ['gallery', 'events', 'discover', 'vessels', 'attractions'],
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

    // ---- Page: Private Hire (Phase 2.5 pilot) ---------------------------------------------
    // COPY ONLY. The template (src/pages/private-hire.astro) keeps the structure: layout,
    // components, icons, every href, and the whole enquiry form. See
    // docs/content-management.md → "Extracting a page's copy into the CMS".
    pagePrivateHire: singleton({
      label: 'Page: Private Hire',
      path: 'src/content/pages/private-hire',
      format: { data: 'json' },
      schema: {
        seoTitle: fields.text({ label: 'SEO title', description: 'Browser tab + Google result title.', validation: { isRequired: true } }),
        seoDescription: fields.text({ label: 'SEO description', multiline: true, validation: { isRequired: true } }),

        heroEyebrow: fields.text({ label: 'Hero — eyebrow', description: 'Small uppercase line above the heading.' }),
        heroHeading: fields.text({ label: 'Hero — heading (H1)', validation: { isRequired: true } }),
        heroIntro: fields.text({ label: 'Hero — intro', multiline: true, validation: { isRequired: true } }),
        heroCtaLabel: fields.text({ label: 'Hero — button label', validation: { isRequired: true } }),
        heroPhotosLabel: fields.text({ label: 'Hero — photos link label', description: 'Links to the private hire gallery album (destination fixed in code).' }),

        keyFacts: fields.array(fields.text({ label: 'Fact' }), {
          label: 'Key facts strip',
          description: 'Exactly 4 — each pairs with a fixed icon by position (sparkles, guests, pin, catering).',
          itemLabel: (p) => p.value,
          validation: { length: { min: 4, max: 4 } },
        }),

        aboutHeading: fields.text({ label: 'About — heading', validation: { isRequired: true } }),
        aboutBody: fields.text({ label: 'About — body', multiline: true, validation: { isRequired: true } }),
        aboutTbcNote: fields.text({
          label: 'About — TBC note',
          description: 'The smaller grey placeholder line. Clear it once the real copy lands.',
          multiline: true,
        }),
        giftNoteBefore: fields.text({ label: 'Gift note — text before the link' }),
        giftNoteLinkText: fields.text({ label: 'Gift note — link text', description: 'Links to /gift-vouchers (destination fixed in code).' }),
        giftNoteAfter: fields.text({ label: 'Gift note — text after the link' }),

        occasions: fields.array(fields.text({ label: 'Occasion' }), {
          label: 'Occasion pills',
          itemLabel: (p) => p.value,
        }),

        vesselsHeading: fields.text({ label: 'Vessels — heading' }),
        vesselCardDesc: fields.text({ label: 'Vessels — card description', description: 'Shown on every vessel card.' }),
        hireVessels: fields.array(fields.text({ label: 'Vessel name' }), {
          label: 'Vessels for hire',
          itemLabel: (p) => p.value,
        }),

        includedHeading: fields.text({ label: "What's included — heading" }),
        included: fields.array(fields.text({ label: 'Item' }), {
          label: "What's included",
          itemLabel: (p) => p.value,
        }),

        christmasEyebrow: fields.text({ label: 'Christmas — eyebrow' }),
        christmasHeading: fields.text({ label: 'Christmas — heading' }),
        christmasBody: fields.text({ label: 'Christmas — body', multiline: true }),
        christmasEmphasis: fields.text({ label: 'Christmas — bold closing line', description: 'Rendered bold at the end of the body paragraph.' }),
        christmasTbcNote: fields.text({ label: 'Christmas — TBC note', multiline: true }),
        christmasCtaLabel: fields.text({ label: 'Christmas — button label' }),
        christmasLinkLabel: fields.text({ label: 'Christmas — link label', description: 'Links to the Christmas hub (destination fixed in code).' }),

        schoolsHeading: fields.text({ label: 'Schools — heading' }),
        schoolsBody: fields.text({ label: 'Schools — body', multiline: true }),
        schoolsCtaLabel: fields.text({ label: 'Schools — button label' }),

        enquireHeading: fields.text({ label: 'Enquiry — heading' }),
        enquireSuccess: fields.text({
          label: 'Enquiry — success message',
          description: 'Shown after the form is submitted. The form fields themselves are code.',
          multiline: true,
        }),

        faqTitle: fields.text({ label: 'FAQs — section title' }),
        faqs: fields.array(
          fields.object({
            question: fields.text({ label: 'Question' }),
            answer: fields.text({ label: 'Answer', multiline: true }),
          }),
          { label: 'FAQs', itemLabel: (p) => p.fields.question.value || 'FAQ' },
        ),
      },
    }),
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
