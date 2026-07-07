import { existsSync } from 'node:fs';
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

// RENDERABLE image: a src we can actually show an <img> for right now — an http(s) URL
// (the temp hotlinked review images). Placeholder paths that don't resolve yet render as a
// tile instead. Used for cover/thumbnail RENDERING only — NOT for schema/OG (see below).
export function isRealImage(src: string): boolean {
  return /^https?:\/\//.test(src);
}

// OWNED image: a real asset WE host in public/ — not an external hotlink, not a not-yet-
// created placeholder path, not the shared placeholder tile. Only owned images are honest
// to advertise in structured data / OG tags (a hotlinked third-party URL we don't control
// must never be claimed as our gallery's image). Existence is checked at BUILD time
// (server-only). When owned photography lands under /images/…, it qualifies automatically.
export function isOwnedImage(src: string): boolean {
  if (typeof src !== 'string' || !src.startsWith('/')) return false; // external/hotlink or invalid
  if (src === '/images/gallery-placeholder.svg') return false; // placeholder tile, not owned photography
  try {
    return existsSync(`${process.cwd()}/public${src}`);
  } catch {
    return false;
  }
}

// Build-time guard: each album's frontmatter `slug` must match its FILENAME, since the album
// route (/gallery/[slug]) and relatedAlbums both key off `slug`. Drift silently 404s cross-
// links. Fail the build loudly instead. (Jeff review option B; the eventual cleanup — option
// A — is to DROP the slug field and derive it from the filename, since the glob loader already
// uses the `slug` frontmatter as the entry id — hence we compare filePath, not entry.id.)
function assertSlugsMatchFilenames(albums: Album[]): void {
  for (const a of albums) {
    const filename = (a.filePath ?? '').split('/').pop()?.replace(/\.md$/, '') ?? '';
    if (filename && filename !== a.data.slug) {
      throw new Error(
        `Gallery slug drift: src/content/gallery/${filename}.md declares slug "${a.data.slug}", ` +
          `but the filename is "${filename}". Rename the file or fix the slug so they match.`,
      );
    }
  }
}

// All published albums, ordered by explicit `order` (absent → 999) then title.
export async function getAlbums(): Promise<Album[]> {
  const albums = await getCollection('gallery', ({ data }) => !data.draft);
  assertSlugsMatchFilenames(albums);
  return albums.sort((a, b) => {
    const byOrder = (a.data.order ?? 999) - (b.data.order ?? 999);
    return byOrder !== 0 ? byOrder : a.data.title.localeCompare(b.data.title);
  });
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
