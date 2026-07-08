# Photo Inventory & Gathering Tracker

> **Jeff owns photography gathering against this list; this is the shared visual asset
> library for the whole site (gallery, product heroes, homepage cards, OG images, event
> cards, Discover, private hire, vessels, OTA listings) — not gallery-only.**

This tracks real photography as it is gathered against each album/subject.

> **⚠ Current gallery images are TEMPORARY HOTLINKS, not owned assets.** For review only,
> some album images are hotlinked straight from the current live manchesterrivercruises.com
> (marked `# TEMP` in each album's frontmatter, served from `optimise2.assets-servd.host`).
> They are **not owned/licensed for the new site**, are low-resolution thumbnails, and
> **must be replaced with owned photography before launch**. The "current image count"
> column below includes these temporaries.
>
> **Update 2026-07-07:** one **owned** image per event/product has been ingested and wired in
> as card/cover imagery (see **Owned card imagery** below). This adds one owned cover to five
> albums, but the inventory targets **remain UNMET** — the albums still need multiple hero-grade
> landscapes, and genuine owned hero-grade **photography** is only City River Tour, the ferry
> and the Santa Cruise (the rest are promotional graphics). Several owned images show
> identifiable customers/staff/performers → **usage rights TBC** (see the flagged table below).

The rest of each album is still **placeholder tiles**. As owned photos land, they replace
both the hotlinks and the placeholders, the collection switches to Astro's
`image()`/`<Image>` pipeline, and this table is updated (see `docs/image-conventions.md`).

Each image in the `gallery` collection also carries optional **`isFeatured`** (hero-grade
candidate) and **`usage`** (`gallery` | `product-page` | `homepage` | `og-image` |
`ota-listing` | `event-card` | `private-hire` | `press`) fields — set these per asset so
the same library feeds the whole site, not just the gallery wall. Keep this table in sync
when you add or reclassify assets.

**Legend:** ✅ done · ⬜ to do / TBC · ◑ partial · — not applicable

## Inventory

| Album / category | Current image count | Minimum needed | Hero-grade landscape selected? | 1200×630 crop suitable? | Product-page hero suitable? | OG suitable? | OTA suitable? | Alt text done? | Caption done? | Usage rights confirmed? | Notes / gaps |
|---|---|---|---|---|---|---|---|---|---|---|---|
| City River Tour · route | 9 (1 OWNED cover + 3 TEMP hotlink, rest placeholder) | 10+ (2–3 hero-grade landscapes) | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ (drafted) | ◑ | ⬜ | **PRIORITY 1.** Signature product — needs 2–3 hero-grade landscapes to drive the product hero, homepage card and OG image. |
| Christmas Cruises · seasonal | 9 (1 OWNED cover + 1 TEMP hotlink, rest placeholder) | 10+ (2–3 hero-grade landscapes) | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ (drafted) | ◑ | ⬜ | **PRIORITY 2.** Seasonal campaign — needs 2–3 hero-grade festive landscapes (boat lit at night, Santa visit, party night). Time-sensitive: shoot in season. |
| Dolly Night · live-music | 9 (1 OWNED cover + 2 TEMP hotlink, rest placeholder) | 8–10 (1 hero-grade) | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ (drafted) | ◑ | ⬜ | TBC. 1 hero-grade performer landscape for the event card + product page. |
| ABBA Night · live-music | 9 (1 OWNED cover + 1 TEMP hotlink, rest placeholder) | 8–10 (1 hero-grade) | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ (drafted) | ◑ | ⬜ | TBC. 1 hero-grade performer landscape (tribute act mid-song, packed deck). |
| Private Hire · private-hire | 8 (2 TEMP hotlink, rest placeholder) | 8–10 (1 hero-grade) | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ (drafted) | ◑ | ⬜ | TBC. 1 hero-grade landscape (celebration set-up / guests on deck). Get model/guest consent for usage rights. |
| Manchester Ship Canal · route | 5 OWNED (real photos) | 8–10 | ✅ | ✅ (sunset-from-bow) | ✅ | ✅ | ◑ | ✅ | ◑ | ◑ | 5 owned route photos wired (sunset-from-bow featured, IWM North, red Irwell bridge, city towers, street art). Reusable across pages. Still want more locks/heritage variety. |
| Our Boats · boats | 5 OWNED (real photos) | 8–10 | ✅ | ✅ | ✅ | ✅ | ◑ | ✅ | ◑ | ◑ | 5 owned wired (boat at Salford Quays featured, fleet at footbridge, skipper at helm [staff — rights TBC], rosé on deck, dog at window). Vessels collection is empty — no per-vessel cards yet. |
| Old Trafford Ferry · route | 9 (1 OWNED cover + 2 TEMP hotlink, rest placeholder) | 8–10 (1 hero-grade) | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ (drafted) | ◑ | ⬜ | TBC. 1 hero-grade (supporters boarding / stadium approach). Matchday access-dependent; avoid club trademarks in framing. |
| Salford Quays · route | 4 OWNED (real photos) | 8–10 | ✅ | ✅ (footbridge-skyline-dusk) | ✅ | ✅ | ◑ | ✅ | ◑ | ✅ | 4 owned wired (footbridge-skyline blue hour featured, purple footbridge, aerial sunset w/ boat, rainbow). No identifiable people. Feeds getting-here + Discover heroes. |

## Owned card imagery — ingested 2026-07-07

One owned image per event/product was ingested from Simon's `MRC Website` folder, processed to
WebP (card ~800px + a ≤1600px hero variant where the source allowed) and wired into the What's
On live feed, homepage strip, date finder, event `heroImage`, product pages and the matching
gallery album **covers** (cover only — album galleries are still Jeff's workstream). Events with
no folder (e.g. Adele) keep a temp hotlink with the branded-placeholder img-error fallback.

**These are card/hero-card images, a mix of real photographs and promotional graphics — they do
NOT yet meet the gallery albums' need for multiple hero-grade landscapes.** Genuine owned
photography is still only City River Tour, the ferry and the Santa Cruise (3 shots).

**⚠ Usage rights (identifiable people) — CONFIRM before launch:** the images below show
identifiable customers, staff or tribute performers/models. Get consent / confirm licensing.

| Product | Owned asset(s) (`public/images/…`) | Content | Identifiable people → **usage rights TBC** | Alt |
|---|---|---|---|---|
| City River Tour | `city-river-tour-card/-hero` | **Photo:** boat under the Millennium Footbridge, passengers on deck | **YES — passengers** | ✅ |
| Boat to Old Trafford (ferry) | `boat-to-old-trafford-card/-hero` | **Photo:** boat with passengers, Salford Quays skyline | **YES — passengers** | ✅ |
| Santa Cruise | `events/santa-cruise-card/-hero` | **Photo:** Father Christmas + two elf staff | **YES — Santa + staff** | ✅ |
| Boat Tropicana | `events/boat-tropicana-card` | Photo (night, passengers in cabin) + neon overlay | **YES — passengers (indistinct)** | ✅ |
| Rollin' on the River | `events/rollin-on-the-river-card/-hero` | Photo: Tina Turner tribute singer + audience | **YES — performer + audience** | ✅ |
| Decks on Deck | `events/decks-on-deck-card/-hero` | Graphic: neon-lit model in profile | **YES — model** | ✅ |
| Dolly | `events/dolly-cruise-card` | Graphic: Dolly Parton tribute performer + skyline | **YES — tribute performer** | ✅ |
| Elvis Rocks | `events/elvis-rocks-cruise-card` | Graphic: Elvis tribute performer + waterfront | **YES — tribute performer** | ✅ |
| ABBA | `events/abba-tribute-cruise-card` | Graphic: mirrorball + skyline (no person) | — | ✅ |
| Back to the 90s | `events/back-to-the-90s-card` | Graphic: retro lettering + skyline | — | ✅ |
| Diana Ross | `events/diana-ross-cruise-card/-hero` | Graphic: gold-glitter singer silhouette | — | ✅ |
| Elvis Live | `events/elvis-live-cruise-card` | Graphic: gold Elvis silhouette + lettering | — | ✅ |
| Soul River | `events/soul-river-cruise-card/-hero` | Graphic: neon lettering + MediaCityUK | — | ✅ |
| Swinging on the River | `events/swinging-on-the-river-card` | Graphic: marquee lettering + waterfront | — | ✅ |

## Owned general imagery — ingested 2026-07-08

A large mixed set of owned photography (C:\MRC Website\General, recursed) was curated —
NOT all of it. 14 hero-grade images were selected, processed to WebP (800px card + <=1600px
large, real PhotoSwipe dims) into public/images/gallery/<album>/, and wired into the matching
gallery albums images[] + covers, plus Discover guide heroes (IWM North, ship canal, Salford
Quays, Old Trafford-by-boat, The Lowry) and the shared getting-here boarding-point image.
The featured shots (isFeatured) are hero-grade landscapes suitable for 1200x630 OG crops.

**Wired (14):** Salford Quays x4 (footbridge-skyline blue hour, purple footbridge, aerial
sunset w/ boat, rainbow); Ship Canal x5 (sunset-from-the-bow, IWM North, boat under the red
Irwell bridge, canal between city towers, canalside street art); Our Boats x5 (boat at
Salford Quays, fleet moored at the footbridge, skipper at the helm, sparkling rose on deck,
dog at the window).

**Usage rights (identifiable people) — CONFIRM before launch:**
- our-boats/skipper-at-the-helm — identifiable CREW member (face). Get staff consent.
- our-boats/sparkling-rose-on-deck, our-boats/dog-at-the-boat-window — a HAND only (no face).
- All other 11 wired images are scenery / boats / landmarks with no identifiable people.

**Skipped (noted):**
- Adele event set (66 photos) — party/performance shots full of identifiable guests and the
  tribute performer. NOT wired (rights liability); available for a future Adele album once
  consent/licensing is cleared. The Adele event card keeps its temp hotlink.
- River cruise (15 of 38) — passengers incl. CHILDREN; held pending consent.
- ~55 further drone frames — sequential near-duplicates of the two aerials selected.
- ~50 older phone snaps + 18 numbered PNGs — lower grade / redundant for these albums.
- ._* files — macOS AppleDouble metadata, not images.

## How to use this tracker

1. As Jeff gathers a shot, drop the asset into `src/assets/gallery/<slug>/` (kebab-case,
   descriptive names — see `docs/image-conventions.md`).
2. Update the matching `images[]` entry in `src/content/gallery/<slug>.md`: replace the
   placeholder `src`, refine the `alt` to describe the actual photo, and set `isFeatured`
   / `usage` so the asset is picked up wherever it's cleared to appear.
3. Flip the relevant cells in the table above to ✅ and clear the note.
4. When a whole album's real assets are in, switch its collection fields to the `image()`
   helper and render with `<Image>` (see `docs/image-conventions.md` →
   "Switching collections to the `image()` helper").

**Alt text note:** the ✅ marks reflect alt text *drafted against the intended shot*.
Re-check each alt when the real photo lands so it describes what's actually in frame.
