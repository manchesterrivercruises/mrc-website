// ─────────────────────────────────────────────────────────────────────────────
// MUFC matchday ferry — data.
//
// Both routes ARRIVE at Trafford Wharf (the stadium end, beside IWM North).
// Customers choose their DEPARTURE point.
//
// ✅ BOARDING COORDINATES ARE OPERATOR-CONFIRMED (2026-09-04).
// Simon dropped the pins himself in Google Maps and supplied the exact values. They replace
// the earlier approximations, which were out by 275m (Ralli Quay), 135m (Stephenson's Bridge)
// and 758m (Trafford Wharf) — enough to send a matchday passenger to the wrong bank of the
// canal. Do not "tidy" these to fewer decimal places: six decimals is ~0.1m, and the whole
// point is that they are surveyed rather than estimated.
//
// If a boarding point ever moves, these must be re-confirmed by the operator — not inferred
// from a map search. See docs/data-conventions.md for why a coordinate's PROVENANCE matters
// as much as its value.
//
// ── SHOULD THIS BE A CMS FIELD? Yes — recommended, but NOT as free-text ───────
// Simon expected to edit these in the CMS and reasonably so: a boarding point is operational
// data he owns, it changes without a code change, and the Melody city-centre pier is due
// within weeks. Routing every move through a developer makes the site wrong in the window
// between the pier opening and the next deploy.
//
// The reason it has not moved yet is that a naive text field would be WORSE than code. A
// mistyped or transposed coordinate produces a page that looks completely normal and sends
// matchday passengers to the wrong bank — the failure is silent, and it is the one failure
// mode this data has. Any CMS field must therefore carry validation:
//   • numeric lat/lng fields, not one "53.4812, -2.2548" string to fat-finger;
//   • a bounding-box check on Greater Manchester (~53.35–53.55 N, −2.45–−2.10 E) so a
//     transposed or hemisphere-flipped value is rejected at save, not at sailing;
//   • the confirmation date captured alongside, so provenance travels with the value.
// See docs/post-launch-roadmap.md → "Boarding points into the CMS" for the full shape.
// ─────────────────────────────────────────────────────────────────────────────

// Arrival point — where both routes land, a short walk from the ground.
// Operator-confirmed 2026-09-04.
export const TRAFFORD_WHARF = { name: 'Trafford Wharf', lat: 53.466208, lng: -2.286799 };

// The STADIUM itself, not a boarding point — a map marker for orientation only. Deliberately
// NOT updated with the 2026-09-04 pins: Simon's "Trafford Wharf (stadium end)" pin is the
// wharf, which sits ~456m from the ground. Conflating the two would drop the arrival marker
// on the stadium and misrepresent the walk.
export const OLD_TRAFFORD = { name: 'Old Trafford', lat: 53.4631, lng: -2.2913 };

export interface DeparturePoint {
  slug: string;
  name: string;
  /** Short area description shown in copy (exact street address still TBC). */
  location: string;
  /** Ventrata product ID for this departure's checkout widget. */
  ventrataProductId: string;
  /** Whether the product ID above is a real Ventrata product or a placeholder. */
  productReady: boolean;
  /** Operator-confirmed boarding coordinates (2026-09-04) — see the file header. */
  lat: number;
  lng: number;
}

export const departurePoints: DeparturePoint[] = [
  {
    slug: 'ralli-quay',
    name: 'Ralli Quay',
    location: 'the River Irwell near New Bailey, Salford (M3)',
    ventrataProductId: '458c8d36-8268-481d-ae47-491b41508b8e',
    productReady: true,
    lat: 53.481271,
    lng: -2.254837,
  },
  {
    slug: 'stephensons-bridge',
    name: "Stephenson's Bridge",
    location: "Water Street, beside the Grade II listed 1830 railway bridge",
    // TBC: Simon to create this departure as a product in Ventrata, then replace
    // the placeholder ID below with the real product ID.
    ventrataProductId: 'PLACEHOLDER_STEPHENSONS_BRIDGE_PRODUCT_ID',
    productReady: false,
    lat: 53.478204,
    lng: -2.259941,
  },
];

export const getDeparturePoint = (slug: string) => departurePoints.find((p) => p.slug === slug);
export const otherDeparturePoint = (slug: string) => departurePoints.find((p) => p.slug !== slug);
