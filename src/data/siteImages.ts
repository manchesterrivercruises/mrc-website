// Shared, OWNED image library for non-collection UI slots.
//
// Collections carry their own imagery (events → heroImage, discover → heroImage, gallery →
// images[]). This module covers the slots that have no collection behind them: the homepage
// hero and City River Tour feature, category/wayfinding cards, cross-sell tiles and the
// "make a day of it" attraction cards.
//
// Every entry is an OWNED processed WebP under public/images/ with REAL pixel dimensions and
// alt text describing what is actually in the frame (docs/image-conventions.md → Alt text).
// Alt strings mirror the gallery album YAML for the same asset so a photo reads the same
// wherever it appears. Cards render at ~400–500px, so the 800px `-card` variant is the right
// source; heroes use the 1600px large variant.
//
// NOT here: the homepage hero, the homepage City River Tour feature and the /getting-here
// boarding photo. Those pages declare their own `*_IMAGE` / `*_IMAGE_CARD` constant pairs so
// they can emit a responsive `srcset`; duplicating the paths here would give the same asset two
// sources of truth.
//
// A slot with NO genuine subject match stays absent here on purpose — the component then
// renders its honest placeholder tile rather than a near-miss photo. The outstanding shots
// are specced in docs/photo-inventory.md → "Shot list".

export interface SiteImage {
  /** Absolute, site-rooted path to an owned processed WebP in public/images/. */
  src: string;
  /** What is visible in the frame — never the medium, never a product slogan. */
  alt: string;
  /** Real intrinsic pixel dimensions of `src` (prevents layout shift). */
  width: number;
  height: number;
}

const img = (src: string, width: number, height: number, alt: string): SiteImage => ({ src, alt, width, height });

export const siteImages = {
  // ── Staple products ────────────────────────────────────────────────────────
  cityRiverTourCard: img(
    '/images/city-river-tour-card.webp',
    800,
    600,
    'A Manchester River Cruises sightseeing boat with a full open top deck of passengers passing beneath the white arched Millennium Footbridge at Salford Quays',
  ),
  ferryCard: img(
    '/images/boat-to-old-trafford-card.webp',
    800,
    534,
    'A Manchester River Cruises boat with passengers on the open top deck cruising Salford Quays past the Central Bay waterfront and the MediaCityUK apartment towers under a grey sky',
  ),
  abbaCruiseCard: img(
    '/images/gallery/abba-night/guests-in-abba-costume-at-the-boarding-point-card.webp',
    800,
    600,
    'A group of guests in ABBA-inspired costumes — blue sequinned flares, silver dresses, white platform boots and a floral 70s minidress — posing together on the quayside beneath the white arched Millennium Footbridge, with a Manchester River Cruises boat moored behind them',
  ),
  santaCruiseCard: img(
    '/images/events/santa-cruise-card.webp',
    800,
    534,
    'Father Christmas seated in a red armchair aboard the Santa Cruise, flanked by two smiling elf helpers beside a decorated Christmas tree and wrapped presents',
  ),

  // ── Category cards (music / party / DJ / family / Christmas / private hire) ─
  // Each is a real photograph OF that category, not a stand-in for a specific product.
  musicCruises: img(
    '/images/gallery/soul-river/soul-singer-among-the-crowd-card.webp',
    800,
    533,
    'A soul singer in a gold sequinned dress performs to a lively table of guests with their hands in the air, red-white-and-blue tinsel behind',
  ),
  partyNights: img(
    '/images/gallery/boat-tropicana/dj-and-the-dancefloor-card.webp',
    800,
    534,
    'A smiling DJ raises his arms behind the decks as guests in glow necklaces and 80s fancy dress dance in front, red and teal tinsel behind',
  ),
  djEvents: img(
    '/images/gallery/boat-tropicana/dj-and-dancers-card.webp',
    800,
    534,
    'A DJ in headphones mixes at the decks as guests in neon 80s outfits dance around him under green party lighting',
  ),
  liveMusic: img(
    '/images/gallery/elvis-rocks/elvis-performing-in-blue-light-card.webp',
    800,
    534,
    'An Elvis tribute in uniform performs in blue and pink light with a disco ball glittering in the foreground',
  ),
  familyEvents: img(
    '/images/gallery/christmas-cruises/child-at-the-wheel-with-santa-card.webp',
    800,
    533,
    "A young child sits at the boat's wheel pretending to steer while Father Christmas stands alongside and a parent films the moment",
  ),
  christmasOnTheWater: img(
    '/images/gallery/christmas-cruises/santa-and-elves-in-the-cabin-card.webp',
    800,
    534,
    'Father Christmas seated in a red velvet chair between two smiling elf entertainers in green dungarees and striped tops, in the festively decorated boat cabin with a Christmas tree',
  ),
  privateHire: img(
    '/images/gallery/private-hire/boat-dressed-for-valentines-card.webp',
    800,
    533,
    "The boat's cabin dressed for a Valentine's charter with red heart balloons and tables laid with heart-themed decorations",
  ),

  // ── Wayfinding / information cards ─────────────────────────────────────────
  boardingPoint: img(
    '/images/gallery/our-boats/boats-moored-at-millennium-footbridge-card.webp',
    800,
    600,
    'Two Manchester River Cruises boats moored at the Salford Quays boarding point beside the Millennium Footbridge and The Lowry on a sunny day',
  ),
  crewTeam: img(
    '/images/gallery/our-boats/crew-at-the-onboard-bar-card.webp',
    800,
    801,
    "Two smiling Manchester River Cruises crew members behind the boat's bar, spirits and optics lined up on the wall behind them",
  ),
  galleryCard: img(
    '/images/gallery/salford-quays/salford-quays-boat-golden-hour-aerial-card.webp',
    800,
    600,
    'Golden-hour aerial view of a Manchester River Cruises boat on the still water at Salford Quays, with the Lowry lift footbridge and the MediaCityUK skyline glowing in warm evening light',
  ),
  whatsOnCard: img(
    '/images/gallery/rollin-on-the-river/tina-tribute-and-the-crowd-card.webp',
    800,
    534,
    'The Tina Turner tribute performs in profile as guests cheer with raised arms, colourful tinsel and party lights behind',
  ),

  // ── "Make a day of it" attractions, shot from our own boats ────────────────
  theLowry: img(
    '/images/attractions/the-lowry-theatre-and-gallery-card.webp',
    800,
    533,
    "The Lowry's angular stainless-steel theatre and gallery building at Salford Quays, its glass frontage carrying coloured panels of L. S. Lowry matchstick figures, with the Digital World Centre behind under a clear blue sky",
  ),
  coronationStreet: img(
    '/images/gallery/city-river-tour/coronation-street-set-from-the-canal-card.webp',
    800,
    533,
    "The ITV Coronation Street production site seen across the Manchester Ship Canal, the 'CORONATION ST.' street sign and the ITV logo mounted on its dark brick and grey-panelled frontage",
  ),
  oldTrafford: img(
    '/images/gallery/city-river-tour/old-trafford-from-the-ship-canal-card.webp',
    800,
    533,
    "Old Trafford's steel roof trusses and red 'MANCHESTER UNITED' lettering rising above the trees on the far bank of the Manchester Ship Canal",
  ),
  iwmNorth: img(
    '/images/gallery/manchester-ship-canal/imperial-war-museum-north-from-canal-card.webp',
    800,
    533,
    "Imperial War Museum North's angular aluminium-clad building seen from across the Manchester Ship Canal under a cloudy sky",
  ),
} as const satisfies Record<string, SiteImage>;

export type SiteImageKey = keyof typeof siteImages;
