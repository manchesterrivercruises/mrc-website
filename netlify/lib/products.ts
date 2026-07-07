// Server-side allowlist of confirmed PUBLIC Ventrata product IDs, plus the
// projection that trims an OCTO product down to what the frontend actually renders.
//
// The IDs are held as a CONST here — deliberately NOT read from env — so the OCTO
// proxy functions validate `productId` against a fixed, known-good set that cannot
// be widened by a misconfigured or attacker-influenced environment. These mirror the
// public product sections of `.env.example`; the "Not on public website" products
// (internal variants, private hire, discount codes, superseded events) are excluded.
//
// Keep in sync with `.env.example` when public products are added or removed.

export const PUBLIC_PRODUCT_IDS = [
  // Core products
  'ef45d8bd-529c-4dae-9c35-cd1b8e4e0a75', // City River Tour
  '458c8d36-8268-481d-ae47-491b41508b8e', // Boat to Old Trafford
  // Christmas & kids events
  '6cabf36f-f48f-48c7-83c0-c964983a9dff', // Santa Cruise
  'e264599a-9a49-4f3a-a693-fd31f962f8ac', // Pirates & Mermaids
  // Music & party events
  '19441cae-34e1-440d-b7c1-534a9a2a163e', // Diana Ross
  '50a5eb12-f9ad-4b1f-9a70-e880bd28152b', // ABBA
  '9b61248a-b567-4cda-8b17-97d55e944b0b', // Elvis Rocks
  '2fe9c519-e00a-4a0d-8067-e7e5c15a023e', // Elvis Live
  '99a19bc1-64d3-4f69-bd68-fb44348053a6', // Adele
  '46688aed-c6e3-4d6d-933b-efcba00d34fe', // Club Classics
  'cf398297-36a2-4a42-878f-5e409407f059', // Decks on Deck
  '8c425994-25e9-4bc3-bce3-1181951142c8', // Soul River
  'f370910f-7d5e-49bb-89b6-dea2ca86f2a9', // Dolly
  'd711f0c0-7939-4d6b-9219-6995de6723c3', // Rollin' on the River
  'fb15c1fc-84f9-455b-a6d6-e8de0db30b3d', // Back to 90s
  'f137c230-50c4-41e0-bc75-5485fccf2668', // Boat Tropicana
  'ee4143b6-9c32-4db2-9d1f-807c858696fa', // Swinging on the River
  // Seasonal events
  '6424be77-a91a-4dc4-96dd-9a1745a1738e', // Father's Day
  '078259ea-62e1-423d-95ab-26a419d41bc6', // Mother's Day
] as const;

const ALLOWED = new Set<string>(PUBLIC_PRODUCT_IDS);

export function isAllowedProductId(id: string): boolean {
  return ALLOWED.has(id);
}

// The subset of an OCTO unit the frontend needs for "from £X" pricing. `pricingFrom` is
// the confirmed unit-level pricing (retail, GBP, currencyPrecision) — see
// docs/ventrata-integration.md.
function filterUnit(u: unknown): Record<string, unknown> {
  const unit = (u ?? {}) as Record<string, unknown>;
  return {
    id: unit.id,
    type: unit.type,
    pricingFrom: unit.pricingFrom,
  };
}

// The subset of an OCTO option the frontend needs to drive the checkout widget, render
// departure times, and show per-unit from-prices.
function filterOption(o: unknown): Record<string, unknown> {
  const opt = (o ?? {}) as Record<string, unknown>;
  return {
    id: opt.id,
    internalName: opt.internalName,
    title: opt.title,
    availabilityLocalStartTimes: opt.availabilityLocalStartTimes,
    units: Array.isArray(opt.units) ? opt.units.map(filterUnit) : [],
  };
}

// Project one OCTO product to ONLY the display/booking fields the site uses. Every
// other upstream field (internal references, connection & capability metadata,
// delivery/redemption config, pricing internals, etc.) is dropped so the proxy never
// leaks more of the upstream shape than the frontend needs. Expand this list
// deliberately if a page starts needing another field (build sequence step 9).
export function filterProduct(p: unknown): Record<string, unknown> {
  const prod = (p ?? {}) as Record<string, unknown>;
  return {
    id: prod.id,
    internalName: prod.internalName,
    title: prod.title,
    subtitle: prod.subtitle,
    shortDescription: prod.shortDescription,
    pricingFrom: prod.pricingFrom,
    defaultCurrency: prod.defaultCurrency,
    availabilityType: prod.availabilityType,
    options: Array.isArray(prod.options) ? prod.options.map(filterOption) : [],
  };
}

// Map the upstream /products array to the filtered projection. CRITICAL: only PUBLIC
// allowlisted products are surfaced — the upstream account also carries internal variants,
// private hire, discount-code and superseded products that must never reach the public
// endpoint. Non-array or malformed upstream shapes collapse to an empty array.
export function filterProductsResponse(products: unknown): Record<string, unknown>[] {
  if (!Array.isArray(products)) return [];
  return products
    .filter((p) => {
      const id = (p as Record<string, unknown> | null)?.id;
      return typeof id === 'string' && isAllowedProductId(id);
    })
    .map(filterProduct);
}
