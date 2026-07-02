// ─────────────────────────────────────────────────────────────────────────────
// Canonical site / business data — the single source of truth.
//
// IMPORTANT: All NAP data (Name / Address / Phone) MUST come from this file.
// Do not hardcode the business name, address, phone or email anywhere else —
// import from here so schema.org markup, the footer and contact details stay
// consistent (inconsistent NAP hurts local SEO). Update once, here.
// ─────────────────────────────────────────────────────────────────────────────

export const site = {
  name: 'Manchester River Cruises',
  url: 'https://www.manchesterrivercruises.com',
  email: 'info@manchesterrivercruises.com',

  // Phone — display form and tel: href (digits only, no spaces).
  phone: '+44 7856 016 801',
  phoneHref: 'tel:+447856016801',

  // Address — keys match schema.org PostalAddress so consumers can spread it:
  //   { '@type': 'PostalAddress', ...site.address }
  address: {
    streetAddress: 'Millennium Footbridge, The Quays',
    addressLocality: 'Salford',
    postalCode: 'M50 3RB',
    addressCountry: 'GB',
  },
  // Human-readable one-line address for display in the UI.
  addressDisplay: 'Millennium Footbridge, The Quays, Salford, M50 3RB',

  // Geo — spread into a schema.org GeoCoordinates node.
  geo: { latitude: 53.4705, longitude: -2.296 },

  // Google rating — confirm against the live Google listing before launch (TBC).
  rating: { value: 4.5, count: 518 },
} as const;

export type Site = typeof site;
