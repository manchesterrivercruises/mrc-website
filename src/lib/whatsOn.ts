import type { CollectionEntry } from 'astro:content';
import { PRODUCT_IMAGES } from '../data/octoProductImages';
import { isRealImage } from './gallery';

// Shared What's On metadata: builds the productId → product-card map used by both the
// /whats-on listing and the homepage strip. The live event-day feed (/.netlify/functions/
// event-days) supplies dates / from-prices / availability; this supplies the per-product
// title, link, type and image so the client can render a card for each event-day.

export const CITY_RIVER_TOUR_ID = 'ef45d8bd-529c-4dae-9c35-cd1b8e4e0a75';
export const MUFC_FERRY_ID = '458c8d36-8268-481d-ae47-491b41508b8e';

export type WoType = 'crt' | 'mufc' | 'events';

export function typeKey(productId: string): WoType {
  if (productId === CITY_RIVER_TOUR_ID) return 'crt';
  if (productId === MUFC_FERRY_ID) return 'mufc';
  return 'events';
}
export function typeLabel(key: WoType): string {
  if (key === 'crt') return 'City River Tour';
  if (key === 'mufc') return 'MUFC Ferry';
  return 'Events';
}

export interface ProductMeta {
  productId: string;
  type: WoType;
  typeLabel: string;
  title: string;
  description: string;
  href: string;
  image?: string;
  imageAlt?: string;
}

// One entry per public product that has a page: City River Tour, the ferry, and every
// non-draft event with a ventrataProductId. Images prefer a real collection heroImage, else
// the temp hotlinked set, else undefined (the card renders a placeholder tile).
export function buildProductMeta(events: CollectionEntry<'events'>[]): ProductMeta[] {
  const list: ProductMeta[] = [
    {
      productId: CITY_RIVER_TOUR_ID,
      type: 'crt',
      typeLabel: 'City River Tour',
      title: 'City River Tour',
      description: 'Our signature 60-minute sightseeing cruise along the Ship Canal.',
      href: '/city-river-tour',
      image: PRODUCT_IMAGES[CITY_RIVER_TOUR_ID],
      imageAlt: 'City River Tour boat at Salford Quays',
    },
    {
      productId: MUFC_FERRY_ID,
      type: 'mufc',
      typeLabel: 'MUFC Ferry',
      title: 'Boat to Old Trafford',
      description: 'Beat the traffic — arrive at the match by boat.',
      href: '/boat-to-old-trafford',
      image: PRODUCT_IMAGES[MUFC_FERRY_ID],
      imageAlt: 'Matchday ferry to Old Trafford',
    },
  ];
  for (const e of events) {
    const pid = e.data.ventrataProductId;
    if (!pid) continue;
    const hero = e.data.heroImage && isRealImage(e.data.heroImage) ? e.data.heroImage : undefined;
    list.push({
      productId: pid,
      type: 'events',
      typeLabel: 'Events',
      title: e.data.title,
      description: e.data.shortTagline || e.data.description,
      href: `/cruises/${e.id}`,
      image: hero || PRODUCT_IMAGES[pid],
      imageAlt: e.data.heroImageAlt || e.data.title,
    });
  }
  return list;
}

export function metaMap(list: ProductMeta[]): Record<string, ProductMeta> {
  const m: Record<string, ProductMeta> = {};
  for (const p of list) m[p.productId] = p;
  return m;
}
