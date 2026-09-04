import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
// Single source of truth for which Ventrata products are PUBLIC. Imported from the same module
// the OCTO proxy functions validate against, so the build and the runtime can never disagree
// about what is safe to expose.
import { PUBLIC_PRODUCT_IDS } from '../../netlify/lib/products';

// Astro Content Collections — schema definitions.
// The collections are populated (events, gallery, discover, attractions, vessels).
// Image fields are typed as strings (paths / hotlinked temp URLs) for now; switch to the
// image() helper once owned assets are added (docs/image-conventions.md).

// Editorial "Discover" guides (rendered as Article-schema pages).
// Markdoc (.mdoc) so Keystatic can manage the body + frontmatter (see keystatic.config.ts);
// rendered via @astrojs/markdoc — output matches the previous markdown (typographer + heading
// slugs configured in markdoc.config.mjs).
const discover = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/discover' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    heroImage: z.string().optional(),
    heroImageAlt: z.string().optional(),
    publishDate: z.coerce.date().optional(),
    updatedDate: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }),
});

// Event / special-cruise pages (linked to a Ventrata product).
// Markdoc (.mdoc) so Keystatic can manage the body + frontmatter (see keystatic.config.ts).
// Ventrata has public products AND internal ones — private-hire variants, discount-code
// products, superseded events. Wiring an internal product to a public page would expose a
// checkout that was never meant to be sold online, and nothing about the ID itself reveals
// which kind it is. So the build checks membership rather than trusting the editor.
const PUBLIC_IDS = new Set<string>(PUBLIC_PRODUCT_IDS);

const events = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/events' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    shortTagline: z.string().optional(),
    ventrataProductId: z.string().optional(),
    // Customer-facing categories are Live Music, DJ Events and Seasonal Specials (Simon's
    // 2026-09-01 simplification). 'family' was retired as a category — Santa, Mother's Day,
    // Father's Day and the shelved family cruises all sit under 'seasonal'. The SLUGS are
    // stable ('dj-night' still means "DJ Events"); only the labels moved.
    category: z.enum(['live-music', 'dj-night', 'seasonal']).optional(),
    // When the event sails. Timing is an ATTRIBUTE, not a category — an event can run daytime,
    // evening or both. Decks on Deck = daytime; ABBA = both; most events = evening (the default).
    // Dolly joins the daytime programme in 2027 (flip to 'both' then).
    sailingTimes: z.enum(['daytime', 'evening', 'both']).default('evening'),
    duration: z.string().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    priceFrom: z.number().optional(),
    whatToExpect: z.array(z.string()).optional(),
    faqs: z.array(z.object({ question: z.string(), answer: z.string() })).optional(),
    heroImage: z.string().optional(),
    heroImageAlt: z.string().optional(),
    draft: z.boolean().default(false),
  })
    .superRefine((data, ctx) => {
      // PUBLISHED events only. Drafts legitimately carry a partial/placeholder ID while the real
      // one is confirmed (broadway-boat-party, halloween-boat-party, wizards-and-fairies-cruise
      // each hold an 8-char stub — see docs/content-checklist.md). A draft renders no page and
      // is wired to no checkout, so a stub is harmless there; the moment it is published this
      // check fires and the build fails, which is exactly when it matters.
      if (data.draft || !data.ventrataProductId) return;
      if (PUBLIC_IDS.has(data.ventrataProductId)) return;
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['ventrataProductId'],
        message:
          `"${data.title}" is published with ventrataProductId "${data.ventrataProductId}", which is NOT in the public allowlist.\n\n` +
          `  Find it:  grep -rl "${data.ventrataProductId}" src/content/events/\n\n` +
          `  Either the ID is wrong/incomplete, or it is an INTERNAL Ventrata product (private-hire\n` +
          `  variant, discount-code product, superseded event). Internal products must never be wired\n` +
          `  to a public page — they expose a checkout that was not meant to be sold online.\n\n` +
          `  If it IS a genuine new public product, add it to PUBLIC_PRODUCT_IDS in\n` +
          `  netlify/lib/products.ts (and .env.example) first — that list also gates the OCTO proxy,\n` +
          `  so an ID missing from it would fail at runtime anyway.`,
      });
    }),
});

// "Make a day of it" attractions.
const attractions = defineCollection({
  // Frontmatter-only YAML (Keystatic-managed data collection).
  loader: glob({ pattern: '**/*.yaml', base: './src/content/attractions' }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    url: z.string(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    order: z.number().optional(),
  }),
});

// Fleet / vessel pages.
const vessels = defineCollection({
  // Frontmatter-only YAML (Keystatic-managed data collection).
  loader: glob({ pattern: '**/*.yaml', base: './src/content/vessels' }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    // Who/what the vessel is used for — the one-line summary shown on /our-vessels.
    bestFor: z.string().optional(),
    // Both stay OPTIONAL and are currently unset for the whole fleet: real capacities
    // and feature lists are still TBC from Simon (docs/content-checklist.md). The page
    // renders an honest "TBC" for an absent value rather than inventing one.
    capacity: z.number().optional(),
    features: z.array(z.string()).optional(),
    heroImage: z.string().optional(),
    heroImageAlt: z.string().optional(),
    order: z.number().optional(),
  }),
});

// Photo gallery albums. Each album is a set of images with a cover, a category (for the
// gallery-wall filter), related albums and a booking CTA (commercial cross-link).
//
// IMAGE SRCS ARE STRINGS (placeholder paths) for now — no real assets exist yet. When
// real imagery lands, switch `coverImage` and each `images[].src` to Astro's image()
// helper and render with <Image>, per docs/image-conventions.md → "Switching collections
// to the image() helper".
const gallery = defineCollection({
  // Frontmatter-only YAML (no markdown body) so Keystatic can manage albums natively as a
  // `data` collection (see keystatic.config.ts). Album `id`/`slug` = filename.
  loader: glob({ pattern: '**/*.yaml', base: './src/content/gallery' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    // Explicit gallery-wall ordering; lower sorts first. Albums without an order fall to
    // the end (999) and then sort by title. See src/lib/gallery.ts → getAlbums.
    order: z.number().optional(),
    summary: z.string(),
    // Events taxonomy (live-music / dj-night / seasonal) + gallery-specific categories.
    // Drives the wall filter pills. Kept in step with the events enum above.
    category: z.enum(['live-music', 'dj-night', 'seasonal', 'boats', 'route', 'private-hire']),
    coverImage: z.string(),
    coverAlt: z.string(),
    images: z
      .array(
        z.object({
          src: z.string(),
          alt: z.string(),
          // Real pixel dimensions of the served image. Set for real/hotlinked images so
          // PhotoSwipe's data-pswp-width/height are exact; placeholders omit these and
          // fall back to orientation-nominal dims (src/lib/gallery.ts → imageDims).
          width: z.number().optional(),
          height: z.number().optional(),
          caption: z.string().optional(),
          credit: z.string().optional(),
          orientation: z.enum(['landscape', 'portrait', 'square']).optional(),
          tags: z.array(z.string()).optional(),
          // A hero-grade shot — a candidate for product-page heroes, homepage cards, etc.
          isFeatured: z.boolean().optional(),
          // Where this asset is cleared/intended to be used across the whole site — this is
          // the shared visual library, not gallery-only (see docs/photo-inventory.md).
          usage: z
            .array(
              z.enum([
                'gallery',
                'product-page',
                'homepage',
                'og-image',
                'ota-listing',
                'event-card',
                'private-hire',
                'press',
              ]),
            )
            .optional(),
        }),
      )
      .min(1),
    // Explicit related-album slugs. Empty → same-category fallback (see src/lib/gallery.ts).
    relatedAlbums: z.array(z.string()).default([]),
    // Optional page path of the product this album relates to, e.g. "/tour/dolly-cruise".
    relatedProduct: z.string().optional(),
    bookingCtaLabel: z.string(),
    bookingCtaUrl: z.string(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { discover, events, attractions, vessels, gallery };
