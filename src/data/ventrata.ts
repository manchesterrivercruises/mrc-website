// Single source of truth for the Ventrata CHECKOUT wiring (the client-side widget). Flip
// VENTRATA_ENV to 'live' at launch — that one change switches every checkout on the site.
//
// This is the DOM-SAFE checkout widget key (confirmed safe in the DOM by Ventrata). It is
// NOT the OCTO connection key, which must never reach the client (AGENTS rules 1–2) and
// lives only in server-side env vars.
export const VENTRATA_ENV: 'test' | 'live' = 'test';

export const VENTRATA_CHECKOUT_KEY = '29b8b50a-26b8-4dae-bf0e-995708d2f372';

export const VENTRATA_CHECKOUT_SRC =
  'https://cdn.checkout.ventrata.com/v3/production/ventrata-checkout.min.js';
