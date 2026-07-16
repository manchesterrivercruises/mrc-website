// Single source of truth for the Ventrata CHECKOUT wiring (the client-side widget). Flip
// VENTRATA_ENV to 'live' at launch — that one change switches every checkout on the site.
//
// This is the DOM-SAFE checkout widget key (confirmed safe in the DOM by Ventrata). It is
// NOT the OCTO connection key, which must never reach the client (AGENTS rules 1–2) and
// lives only in server-side env vars.
export const VENTRATA_ENV: 'test' | 'live' = 'live';

export const VENTRATA_CHECKOUT_KEY = '29b8b50a-26b8-4dae-bf0e-995708d2f372';

export const VENTRATA_CHECKOUT_SRC =
  'https://cdn.checkout.ventrata.com/v3/production/ventrata-checkout.min.js';

// Manage My Booking — Ventrata's HOSTED self-service portal (confirmed by Ventrata support). It is
// keyed by our checkout key: https://checkin.ventrata.com/{checkoutKey}. Customers reschedule, pick
// a date for open tickets, cancel where eligible and view tickets there. We LINK to it (their portal,
// their session/auth handling) rather than embedding — see /manage-booking for the reasoning.
export const VENTRATA_MMB_URL = `https://checkin.ventrata.com/${VENTRATA_CHECKOUT_KEY}`;
