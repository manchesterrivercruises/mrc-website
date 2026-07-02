// ─────────────────────────────────────────────────────────────────────────────
// MUFC matchday ferry — data.
//
// Both routes ARRIVE at Trafford Wharf (the stadium end, beside IWM North).
// Customers choose their DEPARTURE point. Coordinates below are APPROXIMATE — TBC,
// confirm exact boarding locations with Simon before launch.
// ─────────────────────────────────────────────────────────────────────────────

// Shared arrival + destination (used by the landing-page map markers).
export const TRAFFORD_WHARF = { name: 'Trafford Wharf', lat: 53.4693, lng: -2.297 };
export const OLD_TRAFFORD = { name: 'Old Trafford', lat: 53.4631, lng: -2.2913 };

export interface DeparturePoint {
  slug: string;
  name: string;
  /** Short area description shown in copy (exact address still TBC). */
  location: string;
  /** Ventrata product ID for this departure's checkout widget. */
  ventrataProductId: string;
  /** Whether the product ID above is a real Ventrata product or a placeholder. */
  productReady: boolean;
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
    lat: 53.4788,
    lng: -2.2548,
  },
  {
    slug: 'stephensons-bridge',
    name: "Stephenson's Bridge",
    location: "Water Street, beside the Grade II listed 1830 railway bridge",
    // TBC: Simon to create this departure as a product in Ventrata, then replace
    // the placeholder ID below with the real product ID.
    ventrataProductId: 'PLACEHOLDER_STEPHENSONS_BRIDGE_PRODUCT_ID',
    productReady: false,
    lat: 53.4772,
    lng: -2.2588,
  },
];

export const getDeparturePoint = (slug: string) => departurePoints.find((p) => p.slug === slug);
export const otherDeparturePoint = (slug: string) => departurePoints.find((p) => p.slug !== slug);
