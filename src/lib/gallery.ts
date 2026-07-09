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
    const filename = (a.filePath ?? '').split('/').pop()?.replace(/\.ya?ml$/, '') ?? '';
    if (filename && filename !== a.data.slug) {
      throw new Error(
        `Gallery slug drift: src/content/gallery/${filename}.yaml declares slug "${a.data.slug}", ` +
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

// Prefer the smaller `<name>-card.webp` sibling of an owned image when it exists, else the
// original. Used where an image renders small (e.g. the hero collage ~300px, thumbnails) so we
// don't ship a 1600px original into a tiny box. No-ops on non-.webp, on srcs that are already a
// `-card.webp`, and where no card sibling exists (existence checked at build time).
export function cardVariant(src: string): string {
  if (!src.endsWith('.webp') || src.endsWith('-card.webp')) return src;
  const card = src.replace(/\.webp$/, '-card.webp');
  return isOwnedImage(card) ? card : src;
}

// A gallery image ready to render as a lightbox thumbnail, carrying its album so the wall/
// lightbox can label it and link back. `src` is the full-size asset (lightbox target);
// `cardSrc` is the card-size variant used for the thumbnail (see cardVariant).
export interface GalleryImage {
  src: string;
  cardSrc: string;
  alt: string;
  width?: number;
  height?: number;
  orientation?: 'landscape' | 'portrait' | 'square';
  caption?: string;
  albumSlug: string;
  albumTitle: string;
  category: Album['data']['category'];
  isFeatured: boolean;
}

type RawImage = {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  orientation?: 'landscape' | 'portrait' | 'square';
  caption?: string;
  isFeatured?: boolean;
};

function toGalleryImage(album: Album, img: RawImage): GalleryImage {
  return {
    src: img.src,
    cardSrc: cardVariant(img.src),
    alt: img.alt ?? '',
    width: img.width,
    height: img.height,
    orientation: img.orientation,
    caption: img.caption,
    albumSlug: album.data.slug,
    albumTitle: album.data.title,
    category: album.data.category,
    isFeatured: !!img.isFeatured,
  };
}

// The N strongest OWNED images for the featured row / hero, with cross-album variety:
// one isFeatured image per album first, then any remaining featured, then covers, then any
// other owned image. De-duped by src, capped at `limit`. (Same priority as the hero collage,
// now returning full GalleryImage records so callers get album + dimension metadata.)
export function selectFeaturedImages(albums: Album[], limit = 8): GalleryImage[] {
  const picked = new Map<string, GalleryImage>();
  const add = (album: Album, img: RawImage) => {
    if (picked.size >= limit || picked.has(img.src) || !isOwnedImage(img.src)) return;
    picked.set(img.src, toGalleryImage(album, img));
  };
  const featured = albums.map((a) => ({ a, imgs: (a.data.images ?? []).filter((im) => im.isFeatured && isOwnedImage(im.src)) }));
  featured.forEach(({ a, imgs }) => imgs[0] && add(a, imgs[0])); // one featured per album
  featured.forEach(({ a, imgs }) => imgs.slice(1).forEach((im) => add(a, im))); // remaining featured
  albums.forEach((a) => add(a, { src: a.data.coverImage, alt: a.data.coverAlt })); // covers
  albums.forEach((a) => (a.data.images ?? []).forEach((im) => add(a, im))); // any other owned
  return [...picked.values()].slice(0, limit);
}

// EVERY owned image across all albums, ordered curated-first: isFeatured images lead, then by
// album `order`, then original image order — so the top of the wall stays strong as the
// library grows. De-duped by src.
export function getWallImages(albums: Album[]): GalleryImage[] {
  const rows = albums.flatMap((a) =>
    (a.data.images ?? [])
      .map((im, idx) => ({ im, idx }))
      .filter(({ im }) => isOwnedImage(im.src))
      .map(({ im, idx }) => ({ g: toGalleryImage(a, im), order: a.data.order ?? 999, idx })),
  );
  rows.sort(
    (x, y) =>
      Number(y.g.isFeatured) - Number(x.g.isFeatured) || x.order - y.order || x.idx - y.idx,
  );
  const seen = new Set<string>();
  const out: GalleryImage[] = [];
  for (const { g } of rows) {
    if (seen.has(g.src)) continue;
    seen.add(g.src);
    out.push(g);
  }
  return out;
}

// Build-time image selection for the gallery hero collage — the same isFeatured-first,
// cross-album selection as the featured row (selectFeaturedImages), returning full
// GalleryImage records so each collage tile can link back to (and label) its source album.
// Owned images only. The caller degrades to the plain hero when fewer than 2 images qualify.
export function getHeroCollageImages(albums: Album[], limit = 4): GalleryImage[] {
  return selectFeaturedImages(albums, limit);
}
