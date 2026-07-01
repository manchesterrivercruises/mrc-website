import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Astro Content Collections — SCHEMA ONLY.
// No content has been migrated yet; each collection's folder is currently empty.
// Image fields are typed as strings (paths) for now; switch to the image() helper
// once real assets are added.

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
    ventrataProductId: z.string().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    priceFrom: z.number().optional(),
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

export const collections = { discover, events, attractions, vessels };
