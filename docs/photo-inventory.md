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

A handful of images remain **TEMP hotlinks** from the live site (marked `# TEMP` in
frontmatter, served from `optimise2.assets-servd.host`) where no owned photo exists yet —
these still must be replaced before launch. The collection will switch to Astro's
`image()`/`<Image>` pipeline once the last owned assets land (see `docs/image-conventions.md`).

Each `gallery` image carries optional **`isFeatured`** (hero-grade candidate) and **`usage`**
(`gallery` | `product-page` | `homepage` | `og-image` | `ota-listing` | `event-card` |
`private-hire` | `press`) fields so the same library feeds the whole site. Keep this table in
sync when you add or reclassify assets.

**Legend:** ✅ done · ⬜ to do / TBC · ◑ partial · — not applicable

## Inventory

| Album / category | Owned photos | Minimum needed | Met? | Hero-grade landscape? | Alt done? | Rights confirmed? | Notes / gaps |
|---|---|---|---|---|---|---|---|
| City River Tour · route | 2 (+ hotlink/placeholder images) | 10+ (2–3 hero-grade) | ⬜ | ✅ | ✅ | ✅ | **PRIORITY 1 (eased).** First owned photography added 2026-07-10 — a drone aerial of the boat cruising past the arched footbridge (hero-grade) + an on-board open-deck shot at MediaCity. Still wants a fuller set to replace the remaining hotlinks. |
| ABBA Night · live-music | 0 (1 owned card cover + hotlink/placeholder) | 8–10 (1 hero-grade) | ⬜ | ⬜ | ✅ | ✅ | **PRIORITY 2.** No ABBA shoot existed in the source tree — needs a real tribute-night shoot (performer mid-song, packed cabin). |
| Private Hire · private-hire | 1 (+2 review hotlinks) | 8–10 (1 hero-grade) | ◑ | ◑ | ✅ | ✅ | Owned Valentine's-dressed cabin (Isabella) is the new cover. Needs weddings / corporate / celebration real photos. |
| Old Trafford Ferry · route | 2 (+ owned cover) | 8–10 | ◑ | ◑ | ✅ | ✅ | Matchday supporters onboard + the ferry on the canal. Could add stadium-approach / arrival + open-deck supporters (matchday-access dependent; avoid club trademarks). |
| Christmas Cruises · seasonal | 3 (+ owned cover) | 8–10 (2–3 hero-grade) | ◑ | ◑ | ✅ | ✅ | Santa & elf, child steering with Santa, grotto decor. Full Meet-Santa sets (High/Low Res, 2024 + 2025) available for more; want a festive boat-lit-at-night landscape. |
| Dolly Cruise · live-music | 3 (+ owned cover) | 8–10 (1 hero-grade) | ✅ | ✅ | ✅ | ✅ | Performer-with-crowd (cover), performer portrait, cowboy-hat singalong. 131-photo Oct shoot available for more (Low Res = duplicates). |
| Adele Cruise · live-music | 4 | 8–10 (1 hero-grade) | ✅ | ✅ | ✅ | ✅ | NEW album. Performer, crowd, crew serving, dancing. 66-photo set — curated to 4. |
| Elvis Live · live-music | 4 | 8–10 (1 hero-grade) | ✅ | ✅ | ✅ | ✅ | NEW album. Performer to full cabin, guest candids, dressed cabin. 93-photo set. |
| Elvis Rocks · live-music | 4 | 8–10 (1 hero-grade) | ✅ | ✅ | ✅ | ✅ | NEW album. Jumpsuit + military-uniform sets, aisle crowd work. 139-photo set. |
| Soul River · live-music | 4 | 8–10 (1 hero-grade) | ✅ | ✅ | ✅ | ✅ | NEW album. Male + female singers, guest candids. 75-photo set. |
| Rollin on the River · live-music | 4 | 8–10 (1 hero-grade) | ✅ | ✅ | ✅ | ✅ | NEW album (Tina Turner tribute). Performer + guest engagement + dancing. 110-photo set. |
| Boat Tropicana · dj-night | 4 | 8–10 (1 hero-grade) | ✅ | ✅ | ✅ | ✅ | NEW album (80s party). DJ + dancefloor + neon fancy dress. 101-photo set. |
| Our Boats · boats | 7 | 8–10 | ✅ | ✅ | ✅ | ✅ | Boat at Salford Quays (cover), fleet at footbridge, skipper at helm, rosé, dog, crew at the bar, + drone aerial of the boat moored (2026-07-10). Vessels collection still EMPTY — no per-vessel pages. |
| Manchester Ship Canal · route | 6 | 8–10 | ✅ | ✅ | ✅ | ✅ | Sunset-from-bow (cover), IWM North, red Irwell bridge, city towers, street art, + canal & Deansgate Square towers under a dramatic sky (2026-07-10). Want more locks / heritage variety. |
| Salford Quays · route | 7 | 8–10 | ✅ | ✅ | ✅ | ✅ | Footbridge-skyline blue hour (cover), purple footbridge, aerial sunset, rainbow, golden-hour sunset, + golden-hour drone aerial (hero-grade) and boat cruising MediaCity (2026-07-10). Feeds getting-here + Discover heroes. |

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
this pass. The thin albums (Old Trafford Ferry, Christmas, Private Hire) need their own source
folders (`Boat to Old Trafford/`, `Father Christmas/`, `Isabella/`) — a future ingest run.

## Full image sweep — ingested 2026-07-08

The whole `C:\MRC Website\` tree was recursed (~1,370 images across every event shoot,
`General/`, `General/Drone/` and `Isabella/`). Against the ~28 source files already ingested
in the two earlier passes, the new material was curated hard (professional shoots run
75–139 photos each, most with a duplicate **Low Res** copy of every **High Res** frame).
Selected images were viewed, given genuine alt text, kebab-renamed, and processed to WebP
(800px card + ≤1600px large, real PhotoSwipe dims) into `public/images/gallery/<album>/`.

**Six new event albums created** (each event had 4+ decent images and no album): `adele-night`,
`elvis-live`, `elvis-rocks`, `soul-river`, `rollin-on-the-river`, `boat-tropicana` — all linked
to their `/cruises/[slug]` product pages and on the gallery wall (15 albums total).

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

## Gaps remaining — Jeff's shoot / selection list

**Still needs a real shoot (no owned photography):**
- **City River Tour** — PRIORITY 1 (eased). Now has 2 owned (drone aerial + on-board deck, added 2026-07-10); still wants a fuller set + more hero-grade landscapes to replace the remaining hotlinks.
- **ABBA Night** — PRIORITY 2. No ABBA shoot existed in the source tree.
- **Vessels** — the `vessels` content collection is empty; no per-vessel pages exist. The
  Isabella has photos but no vessel page to hang them on.

**Owned but thin (top up from existing sets or a light shoot):**
- **Private Hire** — only 1 owned (Valentine's cabin); needs weddings / corporate / celebration real photos.
- **Old Trafford Ferry** — 2 owned; add supporters on the open deck + stadium approach/arrival.
- **Christmas Cruises** — 3 owned; add a festive boat-lit-at-night landscape (time-sensitive).

**Graphics-only events (promo card art, no photo album):** Diana Ross, Decks on Deck, Back to
the 90s, Swinging on the River, Broadway Boat Party, Club Classics, Halloween, Pirates & Mermaids,
Wizards & Fairies, Mother's/Father's Day. Give these real albums if/when shot.

**Available to expand (already-owned, not yet ingested):** the full High Res event sets
(hundreds more frames across Adele/Elvis/Soul/Tina/80s/Santa), the 2025 Meet-Santa set, more
`General/` + `General/Drone/` scenery, and the Adele 66-set. Curated to the best few this pass;
more can be pulled in without another shoot.

## How to use this tracker

1. Drop new owned assets into `public/images/gallery/<slug>/` (kebab-case, descriptive names)
   as processed WebP — 800px card + ≤1600px large — per `docs/image-conventions.md`.
2. Add/replace the matching `images[]` entry in `src/content/gallery/<slug>.md`: real `src`,
   real `width`/`height` (for PhotoSwipe), genuine `alt`, and `isFeatured` / `usage` so the
   asset is picked up wherever it's cleared to appear.
3. Update the table above (owned count, Met?, flip cells to ✅) and clear the gap note.
4. When a whole album's real assets are in, consider switching its collection fields to the
   `image()` helper and `<Image>` (see `docs/image-conventions.md`).
