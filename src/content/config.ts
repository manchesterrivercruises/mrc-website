import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Astro Content Collections — schema definitions.
// The collections are populated (events, gallery, discover, attractions, vessels).
// Image fields are typed as strings (paths / hotlinked temp URLs) for now; switch to the
// image() helper once owned assets are added (docs/image-conventions.md).

// Editorial "Discover" guides (rendered as Article-schema pages).
const discover = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/discover' }),
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
const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    shortTagline: z.string().optional(),
    ventrataProductId: z.string().optional(),
    category: z.enum(['live-music', 'dj-night', 'family', 'seasonal']).optional(),
    duration: z.string().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    priceFrom: z.number().optional(),
    whatToExpect: z.array(z.string()).optional(),
    faqs: z.array(z.object({ question: z.string(), answer: z.string() })).optional(),
    heroImage: z.string().optional(),
    heroImageAlt: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

// "Make a day of it" attractions.
const attractions = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/attractions' }),
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
  loader: glob({ pattern: '**/*.md', base: './src/content/vessels' }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
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
  loader: glob({ pattern: '**/*.md', base: './src/content/gallery' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    // Explicit gallery-wall ordering; lower sorts first. Albums without an order fall to
    // the end (999) and then sort by title. See src/lib/gallery.ts → getAlbums.
    order: z.number().optional(),
    summary: z.string(),
    // Events taxonomy (live-music / dj-night / family / seasonal) + gallery-specific
    // categories. Drives the wall filter pills.
    category: z.enum(['live-music', 'dj-night', 'family', 'seasonal', 'boats', 'route', 'private-hire']),
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
    // Optional page path of the product this album relates to, e.g. "/cruises/dolly-cruise".
    relatedProduct: z.string().optional(),
    bookingCtaLabel: z.string(),
    bookingCtaUrl: z.string(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { discover, events, attractions, vessels, gallery };
