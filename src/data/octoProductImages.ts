// TEMP hotlinked product images keyed by Ventrata productId, for the DateFinder departures
// panel. Same review-only assets as /whats-on (served from optimise2.assets-servd.host,
// already allowed by the CSP img-src) — NOT owned. Replace with owned assets before launch.
// Products without an entry render a placeholder tile in DateFinder.
export const PRODUCT_IMAGES: Record<string, string> = {
  // City River Tour
  'ef45d8bd-529c-4dae-9c35-cd1b8e4e0a75':
    'https://optimise2.assets-servd.host/river-cruises/production/images/City-River-Tours-Thumbnail-500-350-1.png?w=400&h=271&q=80&fm=webp&fit=crop&crop=focalpoint&fp-x=0.5&fp-y=0.5&dm=1715165712&s=11b98b821586bd382154b5ea94b4d7c1',
  // Boat to Old Trafford
  '458c8d36-8268-481d-ae47-491b41508b8e':
    'https://optimise2.assets-servd.host/river-cruises/production/images/Boat-to-Old-Trafford-Thumbnail-500-350.png?w=400&h=271&q=80&fm=webp&fit=crop&crop=focalpoint&fp-x=0.5&fp-y=0.5&dm=1715166524&s=9837aaf5bcf5e234155fed0bd3e48e3c',
  // ABBA
  '50a5eb12-f9ad-4b1f-9a70-e880bd28152b':
    'https://optimise2.assets-servd.host/river-cruises/production/images/ABBA/ABBA-thumbnail-500-x-350-px.webp?w=400&h=271&q=80&fm=webp&fit=crop&crop=focalpoint&fp-x=0.5&fp-y=0.5&dm=1778759103&s=923a9e0a51bb7abe75ceb987b55303c5',
  // Dolly
  'f370910f-7d5e-49bb-89b6-dea2ca86f2a9':
    'https://optimise2.assets-servd.host/river-cruises/production/images/Dolly-Cruise-Thumbnail-500-x-350.webp?w=400&h=271&q=80&fm=webp&fit=crop&crop=focalpoint&fp-x=0.5&fp-y=0.5&dm=1778759311&s=a2c066c30044a94e7946e71de0db1495',
  // Diana Ross
  '19441cae-34e1-440d-b7c1-534a9a2a163e':
    'https://optimise2.assets-servd.host/river-cruises/production/images/Diana-Ross/Diana-Ross-WEB-Thumbnail-500-x-350.webp?w=400&h=271&q=80&fm=webp&fit=crop&crop=focalpoint&fp-x=0.5&fp-y=0.5&dm=1778759283&s=9a1a52d7af1ea9c625f56ad80e63dcc8',
  // Elvis Rocks
  '9b61248a-b567-4cda-8b17-97d55e944b0b':
    'https://optimise2.assets-servd.host/river-cruises/production/images/Elvis-Rocks/Elvis-Rocks-thumbnail-500-x-300-px-1.webp?w=400&h=271&q=80&fm=webp&fit=crop&crop=focalpoint&fp-x=0.5&fp-y=0.5&dm=1778759338&s=c966f0ada6983a3dcca5e3b19680785e',
  // Boat Tropicana
  'f137c230-50c4-41e0-bc75-5485fccf2668':
    'https://optimise2.assets-servd.host/river-cruises/production/images/Boat-Tropicana-Thumbnail-500x350.png?w=400&h=271&q=80&fm=webp&fit=crop&crop=focalpoint&fp-x=0.5&fp-y=0.5&dm=1715166431&s=1837b5eb336b2dfa38bdb1e7af50fc1e',
  // Back to the 90s
  'fb15c1fc-84f9-455b-a6d6-e8de0db30b3d':
    'https://optimise2.assets-servd.host/river-cruises/production/images/90-Boat-Cruise-thumbnail-500-x-350.png?w=400&h=271&q=80&fm=webp&fit=crop&crop=focalpoint&fp-x=0.5&fp-y=0.5&dm=1715168233&s=8a41a2b3d2b256aee4a726d480f4d1e8',
};
