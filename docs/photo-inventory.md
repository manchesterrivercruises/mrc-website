# Photo Inventory & Gathering Tracker

> **This is the shared visual asset library for the whole site** (gallery, product heroes,
> homepage cards, OG images, event cards, Discover, private hire, vessels, OTA listings) —
> not gallery-only.

This tracks real photography as it is gathered against each album/subject.

> **Update 2026-07-08 — full image sweep.** The entire `C:\MRC Website\` tree was swept
> (all event shoots + General + Isabella, ~1,370 candidate images). Owned, processed WebP
> photography now backs most albums, including **six new event albums** (Adele, Elvis Live,
> Elvis Rocks, Soul River, Rollin on the River, Boat Tropicana). **Usage rights: releases
> confirmed by Simon across the board** — identifiable guests, staff and tribute performers
> are cleared for use, so the earlier "usage rights TBC" flags are lifted.
>
> **What this does NOT yet cover:** a few albums still lack owned photography (see
> **Gaps remaining** below) — most importantly **City River Tour** (signature product) and
> **ABBA Night**, plus a thin **Private Hire** set. Some events are promotional graphics only.

> **Update 2026-08-31 — every TEMP hotlink is gone.** The last one (the Adele event card) now
> points at an owned album frame, so **nothing on the site is served from a third-party host any
> more** — every rendered image is a processed WebP under `public/images/`. The collection will
> switch to Astro's `image()`/`<Image>` pipeline once the last owned assets land (see
> `docs/image-conventions.md`).

Each `gallery` image carries optional **`isFeatured`** (hero-grade candidate) and **`usage`**
(`gallery` | `product-page` | `homepage` | `og-image` | `ota-listing` | `event-card` |
`private-hire` | `press`) fields so the same library feeds the whole site. Keep this table in
sync when you add or reclassify assets.

**Legend:** ✅ done · ⬜ to do / TBC · ◑ partial · — not applicable

## Inventory

| Album / category | Owned photos | Minimum needed | Met? | Hero-grade landscape? | Alt done? | Rights confirmed? | Notes / gaps |
|---|---|---|---|---|---|---|---|
| City River Tour · route | 10 | 10+ (2–3 hero-grade) | ✅ | ✅ | ✅ | ✅ | **Album complete (2026-08-31).** The five remaining placeholder slots were filled from the raw tree with the route landmarks the onboard commentary actually covers: The Lowry from the water, Old Trafford from the ship canal, the ITV Coronation Street site, the MediaCityUK waterfront and the Ordsall Chord arch over the Irwell. They join the 2026-07-10 drone aerial + open-deck frame and three earlier site images. |
| ABBA Night · live-music | 8 | 8–10 (1 hero-grade) | ✅ | ✅ | ✅ | ✅ | **Album complete (2026-08-31)** — was the last album with zero photography. A real shoot landed the same day and all eight entries are now owned photographs: the tribute duo (three frames), guests dancing and celebrating under the party lights, guests in the cabin, and a group in full ABBA costume on the quayside under the Millennium Footbridge (the only landscape → cover, `isFeatured`, and the event card). The promo artwork is out of the album; the file stays for the Christmas hub's December party-nights card. |
| Private Hire · private-hire | 2 (+2 review hotlinks) | 8–10 (1 hero-grade) | ◑ | ✅ | ✅ | ✅ | Valentine's-dressed cabin (cover) + Isabella at a Salford Quays sunset (2026-07-10). Still needs weddings / corporate / celebration real photos. |
| Old Trafford Ferry · route | 4 (+ owned cover) | 8–10 | ◑ | ✅ | ✅ | ✅ | Matchday supporters onboard, ferry on the canal, + ferry approaching with open-deck supporters and supporters crossing the footbridge (2026-07-10). A stadium-approach/arrival frame would still help (matchday-access dependent; avoid club trademarks). |
| Father Christmas Cruises · seasonal | 6 (+ owned cover) | 8–10 (2–3 hero-grade) | ✅ | ✅ | ✅ | ✅ | Renamed from "Christmas Cruises" — every shot is Father Christmas Cruise material, so the album now matches the product slug (`father-christmas-cruise`). Santa & elf, child steering with Santa, grotto decor, + Santa with two elves, children with presents (2025, evening) and elf entertainers (2026-07-10). |
| Dolly Cruise · live-music | 3 (+ owned cover) | 8–10 (1 hero-grade) | ✅ | ✅ | ✅ | ✅ | Performer-with-crowd (cover), performer portrait, cowboy-hat singalong. 131-photo Oct shoot available for more (Low Res = duplicates). |
| Adele Cruise · live-music | 4 | 8–10 (1 hero-grade) | ✅ | ✅ | ✅ | ✅ | NEW album. Performer, crowd, crew serving, dancing. 66-photo set — curated to 4. |
| Elvis Live · live-music | 4 | 8–10 (1 hero-grade) | ✅ | ✅ | ✅ | ✅ | NEW album. Performer to full cabin, guest candids, dressed cabin. 93-photo set. |
| Elvis Rocks · live-music | 4 | 8–10 (1 hero-grade) | ✅ | ✅ | ✅ | ✅ | NEW album. Jumpsuit + military-uniform sets, aisle crowd work. 139-photo set. |
| Soul River · live-music | 4 | 8–10 (1 hero-grade) | ✅ | ✅ | ✅ | ✅ | NEW album. Male + female singers, guest candids. 75-photo set. |
| Rollin on the River · live-music | 4 | 8–10 (1 hero-grade) | ✅ | ✅ | ✅ | ✅ | NEW album (Tina Turner tribute). Performer + guest engagement + dancing. 110-photo set. |
| Boat Tropicana · dj-night | 4 | 8–10 (1 hero-grade) | ✅ | ✅ | ✅ | ✅ | NEW album (80s party). DJ + dancefloor + neon fancy dress. 101-photo set. |
| Our Boats · boats | 7 | 8–10 | ✅ | ✅ | ✅ | ✅ | Boat at Salford Quays (cover), fleet at footbridge, skipper at helm, rosé, dog, crew at the bar, + drone aerial of the boat moored (2026-07-10). The vessels collection now exists and `/our-vessels` renders from it, but **only Isabella has a matched photo** — see the Shot list. `crew-at-the-onboard-bar` now also carries the /about "Our team" slot, and `boats-moored-at-millennium-footbridge` the `/getting-here` boarding photo. |
| Manchester Ship Canal · route | 6 | 8–10 | ✅ | ✅ | ✅ | ✅ | Sunset-from-bow (cover), IWM North, red Irwell bridge, city towers, street art, + canal & Deansgate Square towers under a dramatic sky (2026-07-10). Want more locks / heritage variety. |
| Salford Quays · route | 7 | 8–10 | ✅ | ✅ | ✅ | ✅ | Golden-hour drone aerial (NEW cover, hero-grade), footbridge-skyline blue hour, purple footbridge, aerial sunset, rainbow, golden-hour sunset, boat cruising MediaCity. Feeds getting-here + Discover heroes. |

## Incremental ingest — 2026-07-10 (General / Drone scenery)

Third pass, using the new `scripts/ingest-images.mjs` tool (visual-content de-dup against
`public/images/`, WebP card + large). Ran over `C:\MRC Website\General\` recursed: **214 scanned →
155 not-yet-published** candidates (37 already published, 22 near-identical). Curated the strongest
**6** scenery/boat shots into the route/boats albums — **owned gallery images 49 → 55**:

- **City River Tour** (first owned photography — eases PRIORITY 1): drone aerial of the boat
  cruising past the arched footbridge (`isFeatured`) + on-board open-deck at MediaCity.
- **Salford Quays**: golden-hour drone aerial (`isFeatured`, hero/cover candidate) + boat cruising
  the open water at MediaCity.
- **Manchester Ship Canal**: the canal & Deansgate Square towers under a dramatic sky.
- **Our Boats**: drone aerial of the boat moored at the quayside.

More available without a shoot: the `Drone/` set (April–May 2026) has ~29 further usable aerials,
and the pro `untitled-*` / `River cruise (n of 38)` scenery has more frames — took the best few
this pass.

**Thin-album top-up (same day).** Ran the tool over `Boat to Old Trafford/`, `Father Christmas/`
and `Isabella/` and topped up the three thin albums with **6 more** (owned **55 → 61**): Old
Trafford Ferry **+2** (ferry approaching with open-deck supporters, supporters crossing the
footbridge), Christmas **+3** (Santa with two elves, children with presents at night, elf
entertainers), Private Hire **+1** (Isabella at a Salford Quays sunset). Also promoted the Salford
Quays golden-hour aerial to that album's **cover**. Same restraint — the Father Christmas set alone
had 127 candidates (many near-identical); curated to the best few.

## Full image sweep — ingested 2026-07-08

The whole `C:\MRC Website\` tree was recursed (~1,370 images across every event shoot,
`General/`, `General/Drone/` and `Isabella/`). Against the ~28 source files already ingested
in the two earlier passes, the new material was curated hard (professional shoots run
75–139 photos each, most with a duplicate **Low Res** copy of every **High Res** frame).
Selected images were viewed, given genuine alt text, kebab-renamed, and processed to WebP
(800px card + ≤1600px large, real PhotoSwipe dims) into `public/images/gallery/<album>/`.

**Six new event albums created** (each event had 4+ decent images and no album): `adele-night`,
`elvis-live`, `elvis-rocks`, `soul-river`, `rollin-on-the-river`, `boat-tropicana` — all linked
to their `/tour/[slug]` product pages and on the gallery wall (15 albums total).

**Existing albums filled with owned photos** (replacing leftover placeholders/hotlinks): Dolly
(3, new cover), Christmas (3), Old Trafford Ferry (2), Private Hire (1 + cover), Our Boats
(+crew at the bar), Salford Quays (+golden-hour sunset).

**Rights:** Simon has confirmed releases across the board — identifiable guests, crew and
tribute performers are cleared. The previous `skipper-at-the-helm` "usage rights TBC" credit
has been removed, and the Adele set (previously held back) is now usable.

**Notable source facts:**
- `Dolly/October Photography/` files are misnamed "Adele" but are **Dolly** content (verified by viewing).
- `Boat to Old Trafford/` uses `-N` / `-N(1)` **duplicate pairs**; `Isabella/` is the private-hire vessel (Valentine's interior + on-the-water exterior).
- **High Res** used throughout; **Low Res** folders skipped as exact duplicates.
- `._*` files are macOS AppleDouble metadata, not images — skipped.

## Placeholder fill pass — 2026-08-31

Audited **every image placeholder in the built site** and classified each one: fillable from the
processed library, fillable from the raw tree, or genuinely unfillable.

**Sweep:** `node scripts/ingest-images.mjs --source "C:/MRC Website" --recurse` over the whole
tree — 1,445 sources scanned, 1,003 staged as new, 130 content-dupes of already-published assets,
312 dupes within the batch, 0 failures. Curation was by eye afterwards, as the tool intends.

**Result:** 111 image placeholder slots before → **27 after**.
(Then **20** — the ABBA shoot later the same day closed that album's 7 slots. See the next
section; the Shot list below is kept current at 20.)

- **84 filled.** 74 from the already-processed library (the slots simply were not wired to it) and
  10 from six newly-curated raw frames.
- **6 new processed assets** (card + large WebP each), all shot by us:
  `the-lowry-quays-theatre-from-the-water`, `old-trafford-from-the-ship-canal`,
  `coronation-street-set-from-the-canal`, `mediacityuk-waterfront-from-the-water` and
  `ordsall-chord-arch-over-the-irwell` (all in `gallery/city-river-tour/`), plus
  `attractions/the-lowry-theatre-and-gallery`.
- **Highest-traffic slots cleared:** the homepage hero and City River Tour feature, the whole
  `/tour/city-river-tours` cross-sell and three of its six attraction cards, the `/getting-here`
  boarding-point photo, every Discover guide card and hero, and every event card grid on
  `/music-cruises-manchester`, `/party-boat-manchester` and `/events`.
- **New shared registry:** `src/data/siteImages.ts` holds the owned assets used by slots that have
  no collection behind them (hero, category cards, wayfinding cards, attraction cards), each with
  real dimensions and the same alt string the gallery YAML uses for that file.
- **Rule applied throughout:** a slot is filled ONLY where the photograph genuinely IS the
  subject. Nothing was filled with a near-miss — no unnamed boat under a named vessel, no borrowed
  night under a different event, no stand-in for a third-party venue.

## ABBA night shoot — ingested 2026-08-31

The gap that had sat at PRIORITY 1 since the first sweep is closed. A shoot landed in
`ABBA/` — 16 HEIC stills, 3 JPEGs, 22 video clips.

**Tool change:** the ingest walker only matched `jpg|png|webp`, so a folder of iPhone `.HEIC`
files scanned as four images. `scripts/ingest-images.mjs` now accepts `heic|heif` too. sharp
reads HEIC *containers* but its prebuilt libvips cannot decode HEVC-coded image data ("Support
for this compression format has not been built in"), so the 16 stills were transcoded to JPEG
first through the Windows WIC decoder (`System.Windows.Media.Imaging.BitmapDecoder`, which
applies the container's orientation) and the ingest ran over those. **If a future drop is HEIC,
that transcode step is still needed** — the extension change alone is not sufficient.

**Sweep:** 19 candidates → 17 staged new, 1 content-dupe of the published promo artwork, 2 dupes
within the batch, 0 failures. Curated by eye to **8 keepers**, skipping five near-identical
performer frames, a tight crop dominated by a radiator, two hen-party frames that are mostly
backs of heads and not ABBA-themed, and a higher-resolution copy of the promo artwork (still
artwork, not photography).

**What the 8 cover:** one landscape group shot on the quayside in full ABBA costume (cover +
`isFeatured` + the event card), three of the tribute duo performing in the cabin, and four
crowd/atmosphere frames — dancing under the party lights, celebrating with the crew and
champagne, mingling between the tables, and three guests laughing in 70s outfits.

**Also upgraded off the artwork:** the ABBA event page hero and its What's On / date-finder card
image, plus the City River Tour page's ABBA cross-sell tile, all now use the real photograph.
`<PageHero>` gained a second fallback while doing this — a `-card.webp` now also resolves to
the album's plain `.webp` large, not just a sibling `-hero.webp`, so album-backed event heroes
serve 1600px instead of upscaling the 800px card. That fixes the Adele hero too.

**Still wanted for ABBA:** every performer frame is portrait, so the event card and OG image lean
on the quayside group shot. A **landscape** frame of the duo mid-song under stage lighting would
be the one addition worth making, along with anything shot after dark — this set is all daytime.

## Shot list — the 20 placeholders still on the live build

These are the slots that survived the audit because **no matching photograph exists anywhere**.
Each row is a shot brief: where it goes, what the frame must contain, and how it will be cropped.
Card slots crop to **16:9** and render around 400–500px wide, so shoot landscape with the subject
off the extreme edges; supply ~2× (1600px) so the card and large variants come from one file.

### Vessels — 6 slots, one shoot fixes all of them

`/our-vessels` (4 cards) and `/private-hire` (2 cards) are blocked on the same thing: we have no
photograph in which a named boat is identifiable. **Do not** fill these with a generic fleet shot —
a card headed "Melody" showing an unnamed hull is a mislabel, not a placeholder.

| Slot | The frame must show | Orientation / crop |
|---|---|---|
| Princess Katherine (`/our-vessels`, `/private-hire`) | The whole vessel on the water, **name legible** on the bow or transom, ideally with passengers aboard | 16:9 landscape; keep the name well inside the frame so the card crop cannot cut it |
| Melody (`/our-vessels`, `/private-hire`) | As above. Melody has indoor seating throughout and no open top deck — the frame should make that readable | 16:9 landscape |
| Georgina (`/our-vessels`) | As above; smaller-group boat, so a moored quayside three-quarter view works | 16:9 landscape |
| Joyce Too (`/our-vessels`) | As above | 16:9 landscape |

### Seasonal and family events — 4 slots

| Page / slot | The frame must show | Orientation / crop |
|---|---|---|
| `/events` → "Seasonal Specials" card | Any non-Christmas seasonal sailing in progress — a Mother's/Father's Day table, Halloween costumes, an Easter family group | 16:9 landscape |
| `/whats-on` → Father's Day Cruise card | A daytime family sailing: dads and children on the open deck, daylight, relaxed | 16:9 landscape, daytime |
| `/whats-on` → Mother's Day Cruise card | A daytime family sailing: tables laid, flowers, a multi-generation group | 16:9 landscape, daytime |
| `/whats-on` → Pirates & Mermaids card | Children in pirate / mermaid costume onboard, mid-activity (parental consent needed) | 16:9 landscape |

### Plan-your-visit wayfinding cards — 4 slots (`/plan-your-visit`)

The only cards on that page with no photographable subject today. Each brief is what would make
the card honest rather than decorative; if a shot is not worth the trip, dropping the image from
the card is a legitimate alternative.

| Slot | The frame must show | Orientation / crop |
|---|---|---|
| Accessibility | Step-free boarding actually happening — a wheelchair user or pushchair crossing the gangway at the Millennium Footbridge, crew assisting | 16:9 landscape; gangway and boat side both in frame |
| FAQ | A crew member talking a passenger through boarding at the quayside — the "ask us anything" moment | 16:9 landscape |
| Gift Vouchers | A voucher (printed or on a phone) held at the boarding point with a boat behind | 16:9 landscape; keep the voucher readable at card size |
| Groups & Schools | A school or group party boarding, or seated together in the cabin (consent required) | 16:9 landscape |

### Third-party venues — 6 slots

We hold no photography of any of these and they are other people's businesses. Either shoot the
exterior from the public quayside ourselves, or drop the image from the card and let the text and
walking time carry it.

| Page / slot | The frame must show | Orientation / crop |
|---|---|---|
| `/tour/city-river-tours` → Nell's Pizza | The venue frontage, recognisable, from the public footway | 16:9 landscape |
| `/tour/city-river-tours` → Ordsall Hall | The Tudor black-and-white frontage of the hall | 16:9 landscape |
| `/whats-on` → Kargo | The waterfront container-bar frontage at the Quays | 16:9 landscape |
| `/whats-on` → The Alchemist | The venue frontage at MediaCityUK | 16:9 landscape |
| `/whats-on` → Nell's Pizza | The same frame as the City River Tour card — one shot covers both | 16:9 landscape |
| `/whats-on` → Holiday Inn MediaCity | The hotel frontage | 16:9 landscape |

### Still outstanding, but not a placeholder tile

- **Festive night exterior** (time-sensitive, December only) — the decorated boat lit up on the
  water after dark. Blocks the `christmas-on-the-water` album that does not exist yet. The
  Christmas hub currently leans on the Santa album and event card art, which is honest but thin.
- **Anything on an ABBA night after dark.** The 2026-08-31 shoot is complete but entirely
  daytime; an evening sailing would give that album its night-time register and, with the boat
  lit from outside, could cover the festive exterior above in the same trip.

### Not images — do not confuse these with photo gaps

Two dashed placeholder tiles remain in the build and are **not** image slots: `/getting-here`
carries a Google Maps `<iframe>` embed placeholder, and
`/tour/boat-to-old-trafford/stephensons-bridge` carries a Ventrata booking-widget placeholder
(that departure has no product ID yet). Two further tiles are **runtime** fallbacks in the What's
On strip and the date finder — they appear only for a product with no card image, which is
correct behaviour, not a gap.

## Gaps remaining — Jeff's shoot / selection list

> Superseded in part by the **Shot list** above, which is the per-slot brief. This section is the
> album-level view.

**Still needs a real shoot (no owned photography):**
- **Vessels** — **PRIORITY 1** now that ABBA has been shot. The `vessels` collection exists and `/our-vessels` renders from it, but four of
  the five boats have no identifiable photograph. Nothing in the raw tree names a hull except
  Isabella. This is a shoot, not a selection problem.
- **Christmas on the water (the wider festive offer)** — **time-sensitive, December only.** A
  decorated boat lit at night (exterior landscape), a December party night in full swing, a private
  Christmas do. None of this exists: every shot in the old "Christmas Cruises" album turned out to
  be Father Christmas Cruise material, which is why that album was renamed. A future
  `christmas-on-the-water` album is blocked on this shoot.

**Owned but thin (top up from existing sets or a light shoot):**
- **Private Hire** — 2 owned (Valentine's cabin + Isabella sunset); still needs weddings / corporate / celebration real photos.
- **Old Trafford Ferry** — 4 owned (added open-deck supporters + footbridge crossing); a stadium approach/arrival frame would still help.
- **Father Christmas Cruises** — 6 owned, and complete for what it now covers (the Santa product).
- **`christmas-on-the-water` (does not exist yet)** — there is currently **no album for the wider
  Christmas offer**: December party nights on a decorated boat, the festive-lit waterfront after
  dark, a private Christmas do. Those shots do not exist, which is precisely why the old
  "Christmas Cruises" album was 100% Santa material and had to be renamed. Create this album once
  the decorated-boat / festive-night photography lands — it is already on the shoot gap list below
  (festive boat-lit-at-night exterior; time-sensitive, December only). Until then the Christmas hub
  leans on event card art, and the honest routing copy on that page carries the weight.

**Graphics-only events (promo card art, no photo album):** Diana Ross, Decks on Deck, Back to
the 90s, Swinging on the River, Broadway Boat Party, Club Classics, Halloween, Pirates & Mermaids,
Wizards & Fairies, Mother's/Father's Day. Give these real albums if/when shot.

**Available to expand (already-owned, not yet ingested):** the full High Res event sets
(hundreds more frames across Adele/Elvis/Soul/Tina/80s/Santa), the 2025 Meet-Santa set, more
`General/` + `General/Drone/` scenery, and the Adele 66-set. Curated to the best few each pass;
more can be pulled in without another shoot. The 2026-08-31 sweep staged **1,003 new frames** and
only six were promoted — the rest of that pool (landmark folders for Media City, the Lowry, the
bridges, the Turning Basin, Graffiti Palace and the drone sets) is there whenever an album wants
depth. Re-run `scripts/ingest-images.mjs` to regenerate the staging dir; it is git-ignored.

## How to use this tracker

1. Drop new owned assets into `public/images/gallery/<slug>/` (kebab-case, descriptive names)
   as processed WebP — 800px card + ≤1600px large — per `docs/image-conventions.md`.
2. Add/replace the matching `images[]` entry in `src/content/gallery/<slug>.md`: real `src`,
   real `width`/`height` (for PhotoSwipe), genuine `alt`, and `isFeatured` / `usage` so the
   asset is picked up wherever it's cleared to appear.
3. Update the table above (owned count, Met?, flip cells to ✅) and clear the gap note.
4. When a whole album's real assets are in, consider switching its collection fields to the
   `image()` helper and `<Image>` (see `docs/image-conventions.md`).
