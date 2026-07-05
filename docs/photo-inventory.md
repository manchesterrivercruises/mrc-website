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
> column below includes these temporaries — **the inventory targets remain UNMET**; the
> count of real, owned, hero-grade assets is effectively **zero**.

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
| City River Tour · route | 8 (3 TEMP hotlink, rest placeholder) | 10+ (2–3 hero-grade landscapes) | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ (drafted) | ◑ | ⬜ | **PRIORITY 1.** Signature product — needs 2–3 hero-grade landscapes to drive the product hero, homepage card and OG image. |
| Christmas Cruises · seasonal | 8 (1 TEMP hotlink, rest placeholder) | 10+ (2–3 hero-grade landscapes) | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ (drafted) | ◑ | ⬜ | **PRIORITY 2.** Seasonal campaign — needs 2–3 hero-grade festive landscapes (boat lit at night, Santa visit, party night). Time-sensitive: shoot in season. |
| Dolly Night · live-music | 8 (2 TEMP hotlink, rest placeholder) | 8–10 (1 hero-grade) | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ (drafted) | ◑ | ⬜ | TBC. 1 hero-grade performer landscape for the event card + product page. |
| ABBA Night · live-music | 8 (1 TEMP hotlink, rest placeholder) | 8–10 (1 hero-grade) | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ (drafted) | ◑ | ⬜ | TBC. 1 hero-grade performer landscape (tribute act mid-song, packed deck). |
| Private Hire · private-hire | 8 (2 TEMP hotlink, rest placeholder) | 8–10 (1 hero-grade) | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ (drafted) | ◑ | ⬜ | TBC. 1 hero-grade landscape (celebration set-up / guests on deck). Get model/guest consent for usage rights. |
| Manchester Ship Canal · route | 8 (all placeholder) | 8–10 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ (drafted) | ◑ | ⬜ | TBC. Locks, bridges, heritage, changing light — scenery library, reusable across pages. |
| Our Boats · boats | 8 (3 TEMP hotlink, rest placeholder) | 8–10 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ (drafted) | ◑ | ⬜ | TBC. Cover each vessel plus cabin, open deck, bar and boarding — feeds the Vessels pages too. |
| Old Trafford Ferry · route | 8 (2 TEMP hotlink, rest placeholder) | 8–10 (1 hero-grade) | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ (drafted) | ◑ | ⬜ | TBC. 1 hero-grade (supporters boarding / stadium approach). Matchday access-dependent; avoid club trademarks in framing. |
| Salford Quays · route | 8 (1 TEMP hotlink, rest placeholder) | 8–10 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ (drafted) | ◑ | ⬜ | TBC. MediaCity waterfront, The Lowry, the Millennium Footbridge boarding point. |

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
