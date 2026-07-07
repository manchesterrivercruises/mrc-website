// Card images keyed by Ventrata productId, for the DateFinder departures panel (and the
// buildProductMeta fallback for City River Tour / the ferry, which aren't events).
//
// OWNED assets (processed WebP in public/images/…) for products we have photography for;
// a handful of events without owned imagery keep a TEMP hotlink (optimise2.assets-servd.host,
// NOT owned — replace before launch). Products with neither render a placeholder tile.
// Every consumer must apply the shared img-error fallback (data-img-fallback) so a broken
// hotlink degrades to the branded placeholder.
export const PRODUCT_IMAGES: Record<string, string> = {
  // ── Owned (processed) ──
  // City River Tour
  'ef45d8bd-529c-4dae-9c35-cd1b8e4e0a75': '/images/city-river-tour-card.webp',
  // Boat to Old Trafford (ferry)
  '458c8d36-8268-481d-ae47-491b41508b8e': '/images/boat-to-old-trafford-card.webp',
  // Santa Cruise
  '6cabf36f-f48f-48c7-83c0-c964983a9dff': '/images/events/santa-cruise-card.webp',
  // ABBA
  '50a5eb12-f9ad-4b1f-9a70-e880bd28152b': '/images/events/abba-tribute-cruise-card.webp',
  // Back to the 90s
  'fb15c1fc-84f9-455b-a6d6-e8de0db30b3d': '/images/events/back-to-the-90s-card.webp',
  // Boat Tropicana
  'f137c230-50c4-41e0-bc75-5485fccf2668': '/images/events/boat-tropicana-card.webp',
  // Decks on Deck
  'cf398297-36a2-4a42-878f-5e409407f059': '/images/events/decks-on-deck-card.webp',
  // Diana Ross
  '19441cae-34e1-440d-b7c1-534a9a2a163e': '/images/events/diana-ross-cruise-card.webp',
  // Dolly
  'f370910f-7d5e-49bb-89b6-dea2ca86f2a9': '/images/events/dolly-cruise-card.webp',
  // Elvis Live
  '2fe9c519-e00a-4a0d-8067-e7e5c15a023e': '/images/events/elvis-live-cruise-card.webp',
  // Elvis Rocks
  '9b61248a-b567-4cda-8b17-97d55e944b0b': '/images/events/elvis-rocks-cruise-card.webp',
  // Rollin' on the River
  'd711f0c0-7939-4d6b-9219-6995de6723c3': '/images/events/rollin-on-the-river-card.webp',
  // Soul River
  '8c425994-25e9-4bc3-bce3-1181951142c8': '/images/events/soul-river-cruise-card.webp',
  // Swinging on the River
  'ee4143b6-9c32-4db2-9d1f-807c858696fa': '/images/events/swinging-on-the-river-card.webp',

  // ── TEMP hotlink (no owned asset yet — NOT owned, replace before launch) ──
  // Adele — kept as a temp hotlink; relies on the img-error fallback if it breaks.
  '99a19bc1-64d3-4f69-bd68-fb44348053a6':
    'https://optimise2.assets-servd.host/river-cruises/production/images/Adele-Thumbnail-1200-630.webp?w=800&h=543&q=80&fm=webp&fit=crop&crop=focalpoint&fp-x=0.5&fp-y=0.5&dm=1778758996&s=57ec4847393b8dbb440de2033a0451b9',
};
