import { getCollection, type CollectionEntry } from 'astro:content';

// Shared helpers for the photo gallery: label map, album loading, related-album
// resolution (explicit slugs → same-category fallback) and product cross-link lookup.

export type Album = CollectionEntry<'gallery'>;

// Human labels for the category filter pills / badges.
export const CATEGORY_LABELS: Record<Album['data']['category'], string> = {
  'live-music': 'Live Music',
  'dj-night': 'DJ Nights',
  family: 'Family',
  seasonal: 'Seasonal',
  boats: 'Our Boats',
  route: 'Route & Scenery',
  'private-hire': 'Private Hire',
};

// All published albums, sorted by title.
export async function getAlbums(): Promise<Album[]> {
  return (await getCollection('gallery', ({ data }) => !data.draft)).sort((a, b) =>
    a.data.title.localeCompare(b.data.title),
  );
}

// Related albums: explicit relatedAlbums slugs first; if none resolve, fall back to
// other albums in the same category. Never includes the album itself.
export function resolveRelated(album: Album, all: Album[], limit = 3): Album[] {
  const bySlug = new Map(all.map((a) => [a.data.slug, a]));
  let related = album.data.relatedAlbums
    .map((s) => bySlug.get(s))
    .filter((a): a is Album => !!a && a.data.slug !== album.data.slug);

  if (!related.length) {
    related = all.filter((a) => a.data.slug !== album.data.slug && a.data.category === album.data.category);
  }
  return related.slice(0, limit);
}

// Find the album that cross-links to a given product: either its relatedProduct matches
// the page path (e.g. "/cruises/dolly-cruise"), or its slug matches the event slug.
export function findAlbumForProduct(
  all: Album[],
  productPath: string,
  eventSlug?: string,
): Album | undefined {
  return all.find(
    (a) => a.data.relatedProduct === productPath || (!!eventSlug && a.data.slug === eventSlug),
  );
}

// Nominal pixel dimensions for a placeholder image, by orientation. PhotoSwipe needs
// width/height up front; real assets will supply their own once the image() pipeline
// lands. Landscape is the default.
export function imageDims(orientation?: 'landscape' | 'portrait' | 'square'): { w: number; h: number } {
  if (orientation === 'portrait') return { w: 1067, h: 1600 };
  if (orientation === 'square') return { w: 1400, h: 1400 };
  return { w: 1600, h: 1067 };
}
