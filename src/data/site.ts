// ─────────────────────────────────────────────────────────────────────────────
// Canonical site / business data — the single source of truth.
//
// IMPORTANT: All NAP data (Name / Address / Phone) MUST come from this file.
// Do not hardcode the business name, address, phone or email anywhere else —
// import from here so schema.org markup, the footer and contact details stay
// consistent (inconsistent NAP hurts local SEO). Update once, here.
//
// EDITORIAL VALUES NOW LIVE IN THE CMS. Everything Simon may need to change —
// name, email, phone, address lines, social URLs, the footer tagline — is edited
// via the Keystatic "Site settings" singleton and stored in
// ./site-settings.json. This module still exports the same `site` object
// with the same shape, so all ~34 consumers are unchanged.
//
// WHY A SYNCHRONOUS JSON IMPORT, NOT A CONTENT COLLECTION: `site` is imported at
// the top level of layouts, components and lib modules (breadcrumbs.ts among
// them). Astro's content APIs are async, so modelling this as a collection would
// force `await getEntry(...)` into every one of those call sites — including
// non-component modules that cannot await. A build-time JSON import keeps the
// single source of truth intact with zero churn.
//
// WHAT STAYS IN CODE (deliberately NOT editable) — see the config description in
// keystatic.config.ts for the same reasoning:
//   • url    — the canonical origin. Deploy/DNS configuration, not copy; changing
//              it rewrites every canonical, OG and schema URL on the site.
//   • geo    — schema.org coordinates. A typo silently breaks map/rich results
//              with no visible symptom in the CMS.
//   • rating — aggregateRating must reflect the real Google listing. Editing it
//              freehand risks misrepresenting review data in structured markup.
// ─────────────────────────────────────────────────────────────────────────────

import settings from './site-settings.json';

// tel: href — digits only, keeping a leading +. Derived so the link can never
// drift from the displayed number.
const toTelHref = (phone: string): string => `tel:${phone.replace(/(?!^\+)[^\d]/g, '')}`;

// Human-readable one-line address, derived from the same parts schema.org uses,
// so the displayed address and the structured one can never disagree.
const toAddressDisplay = (a: typeof settings.address): string =>
  [a.streetAddress, a.addressLocality, a.postalCode].filter(Boolean).join(', ');

export const site = {
  name: settings.name,
  email: settings.email,

  // Phone — display form (from the CMS) and derived tel: href.
  phone: settings.phone,
  phoneHref: toTelHref(settings.phone),

  // Address — keys match schema.org PostalAddress so consumers can spread it:
  //   { '@type': 'PostalAddress', ...site.address }
  address: settings.address,
  addressDisplay: toAddressDisplay(settings.address),

  // Social profiles — used for the footer links and the schema.org `sameAs` array
  // (Object.values(site.socials)).
  socials: settings.socials,

  // Footer informational copy.
  footerTagline: settings.footerTagline,

  // ---- Code-owned below this line (see the header note) ---------------------
  // `site` is the canonical origin — also set in astro.config.mjs.
  url: 'https://www.manchesterrivercruises.com',

  // Geo — spread into a schema.org GeoCoordinates node.
  geo: { latitude: 53.4705, longitude: -2.296 },

  // Google rating — confirm against the live Google listing before launch (TBC).
  rating: { value: 4.5, count: 518 },
} as const;

export type Site = typeof site;
