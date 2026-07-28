# URL Parity — legacy Craft site vs new Astro site

**Status: the `/tour/` product namespace has been ADOPTED and is live in the codebase.**
The remaining ADOPT rows (§1) are still decisions awaiting Simon's mark-up — nothing in §1 has
been renamed.

**Source of the old-URL inventory:** `https://manchesterrivercruises.com/sitemap.xml`
(a sitemap index) plus its five child sitemaps, cross-checked against a crawl of the live
homepage header, body and footer. Captured 2026-07-27. **46 legacy URLs total.**

| Child sitemap | URLs |
|---|---|
| `sitemaps-1-section-page-1-sitemap.xml` | 15 |
| `sitemaps-1-section-tour-1-sitemap.xml` | 17 |
| `sitemaps-1-section-tourCategory-1-sitemap.xml` | 7 |
| `sitemaps-1-section-tourEvent-1-sitemap.xml` | 1 |
| `sitemaps-1-section-amenities-1-sitemap.xml` | 6 |

---

## Status key

| Status | Meaning | Action |
|---|---|---|
| **ALREADY-IDENTICAL** | Old path and new path are the same string. | Nothing. Never add a redirect — it would shadow a real page. |
| **ADOPTED** ✅ | Done. Our page now renders **at** the legacy path. | None. The URL never moved, so it needs no rule. |
| **ADOPT** | Decision pending: rename our page to the old path. | Rename, update internal links + `docs/seo-pages.md`. No redirect. |
| **REDIRECT** | Old path is poor, or the page was consolidated away. | 301 in `netlify.toml`. |

---

## 0. What the `/tour/` adoption changed (executed)

Products previously served at `/cruises/[slug]`. They now render at `/tour/[legacy-slug]`, the
exact addresses the Craft site used, so **no legacy product URL redirects at all** — each one is
a live page. `src/pages/cruises/` → `src/pages/tour/`; content filenames follow the slugs.

⚠️ **CMS edit URLs changed.** Keystatic addresses entries by filename, so every event's edit URL
moved (e.g. `…/collection/events/item/santa-cruise` → `…/item/father-christmas-cruise`). Any
bookmarks Simon has into the CMS need re-saving.

### Slug mapping

| Was (`/cruises/…`) | Now (`/tour/…`) | Pairing source |
|---|---|---|
| `abba-tribute-cruise` | `mamma-mia-cruise-abba-tribute` | sitemap + Simon |
| `back-to-the-90s` | `back-to-90s` | sitemap + Simon |
| `decks-on-deck` | `decks-on-deck-day-party` | sitemap + Simon |
| `diana-ross-cruise` | `diana-ross-the-supreme-experience` | sitemap + Simon |
| `elvis-live-cruise` | `elvis-live` | sitemap + Simon |
| `elvis-rocks-cruise` | `elvis-rocks` | sitemap |
| `fathers-day-cruise` | `fathers-day` | sitemap |
| `mothers-day-cruise` | `mothering-sunday` | sitemap |
| `pirates-and-mermaids` | `pirates-and-mermaid-cruise` | **Simon only — not in the sitemap** |
| `santa-cruise` | `father-christmas-cruise` | sitemap |
| `soul-river-cruise` | `soul-river` | sitemap |
| `swinging-on-the-river` | `swing-cruise-live-music` | sitemap + Simon |
| `adele-cruise` | `adele-cruise` | identical — namespace only |
| `boat-tropicana` | `boat-tropicana` | identical — namespace only |
| `dolly-cruise` | `dolly-cruise` | identical — namespace only |
| `rollin-on-the-river` | `rollin-on-the-river` | identical — namespace only |

**No legacy counterpart — kept their current slug under `/tour/`** (all four are `draft: true`
already, so none is published yet): `broadway-boat-party`, `club-classics-cruise`,
`halloween-boat-party`, `wizards-and-fairies`.

### ⚠️ Flags on the mapping — please confirm

1. **`santa-cruise` → `father-christmas-cruise`.** Your note said Santa "remains as-is if already
   executed". It had **not** been executed — what existed was a 301 `/tour/father-christmas-cruise`
   → `/cruises/santa-cruise`, which under full adoption would have pointed at the product's own
   new home. I applied the rule you stated (product with a legacy counterpart adopts the legacy
   slug), so Santa now **renders at** `/tour/father-christmas-cruise` and the old 301 was removed
   and reversed. Say the word if you wanted Santa left on `santa-cruise` instead.
2. **`pirates-and-mermaids` → `pirates-and-mermaid-cruise`.** Taken from your instruction only —
   **there is no GA/GSC export in the repo**, and this URL is absent from the Craft sitemap. I
   have not verified it exists. If the real legacy path differs, this is a one-line fix.
3. **`wizards-and-fairies` may have a legacy counterpart I cannot see.** Pirates had one that the
   sitemap missed, and the legacy `/kids-takeover` page advertises "Pirates to Wizards, Elves to
   Mermaids". Without the export I cannot rule out `/tour/wizards-and-fairies-cruise` or similar —
   and an **"Elves"** cruise may exist with no new-site equivalent at all. Worth a look.
4. **`mothering-sunday` is a worse slug than `mothers-day-cruise` for search** (people search
   "mothers day", not "mothering sunday"). Adopted as instructed; flagging the trade-off since
   this is the one adoption that arguably costs more than it preserves.
5. **`/tour-type/*` does not exist.** Your note listed it among the retired paths; `/tour-type/live-music`
   returns 404 on the live site. The category facets are at `/tour/<category>` — *inside* the
   adopted namespace. Verified none of their slugs collides with a product slug, so the redirects
   are safe; noting it because it means the namespace is shared, not exclusively ours.

### Breadcrumbs

Several adopted slugs no longer resemble the product name, so the auto-derived breadcrumb leaf
was wrong (`/tour/swing-cruise-live-music` read "Swing Cruise Live Music"). `src/pages/tour/[slug].astro`
now passes an explicit trail using the product title. Verified in the built output.

---

## 1. Core pages (`page` sitemap — 15 URLs) — **decisions still open**

Unchanged from the original audit. Nothing here has been renamed.

| # | Old URL | Closest new page | Status | Notes |
|---|---|---|---|---|
| 1 | `/` | `/` | **ALREADY-IDENTICAL** | — |
| 2 | `/whats-on` | `/whats-on` | **ALREADY-IDENTICAL** | — |
| 3 | `/private-hire` | `/private-hire` | **ALREADY-IDENTICAL** | ⭐ Full parity already. |
| 4 | `/about` | `/about` | **ALREADY-IDENTICAL** | — |
| 5 | `/privacy-policy` | `/privacy-policy` | **ALREADY-IDENTICAL** | — |
| 6 | `/our-vessels` | `/vessels` | **ADOPT** *(pending)* | Rename `vessels.astro` → `our-vessels.astro`. **3 internal links:** `about.astro:111`, `private-boat-hire-manchester.astro:187`, `private-hire.astro:163`. ⚠️ Also retarget the `/amenities/bar-on-board` 301, which currently points at `/vessels`. |
| 7 | `/manage-bookings` | `/manage-booking` | **ADOPT** *(pending)* | Plural vs singular. **2 internal links:** `BookingPanel.astro:18` (default prop), `Footer.astro:100`. |
| 8 | `/contact-us` | `/contact` | **ADOPT** *(pending)* | **6 internal links:** `accessibility.astro:70`, `faq.astro:85`, `groups.astro:53/94/179/268`. Check the Netlify Forms action/success path too. |
| 9 | `/terms-conditions` | *(none)* | **ADOPT** *(pending)* | ⚠️ Content gap — no T&Cs page exists, and no footer link. Build at the legacy path. **Launch blocker.** |
| 10 | `/help` | `/faq` | **REDIRECT** → `/faq` | Genuinely close; `/faq` is shorter and carries our `FAQPage` schema. Check GSC impressions before confirming. |
| 11 | `/our-events` | `/whats-on` | **REDIRECT** → `/whats-on` | Retargeted from `/events` on your instruction. ⚠️ Note `/tour/on-board-events` — the same listing under a different legacy path — goes to `/events`. Two legacy URLs for one page now split across two targets; worth unifying. |
| 12 | `/our-tours` | `/whats-on` | **REDIRECT** → `/whats-on` | Not a tour index despite the name — thin marketing page duplicating homepage copy. |
| 13 | `/salford-quays` | `/getting-here` | **REDIRECT** → `/getting-here` | ⚠️ Still the strongest case for building a page to *match* an old URL. ~800–1000 words of boarding-point detail on a short, high-intent path; `/getting-here` covers all three boarding points so a rename would mis-title it. |
| 14 | `/kids-takeover` | `/events` | **REDIRECT** → `/events` | No family hub page exists. See flag 3 above re: an "Elves" cruise. |
| 15 | `/thank-you` | *(none)* | **REDIRECT** → `/` | Craft form landing page; our forms use an inline success reveal. |

---

## 2. Tour pages (`tour` sitemap — 17 URLs)

### 2a. Adopted — these are live pages, not redirects ✅

All 15 legacy event URLs below now **render** at exactly these addresses.

| Legacy URL (now live) | Product | Status |
|---|---|---|
| `/tour/mamma-mia-cruise-abba-tribute` | ABBA Cruise | **ADOPTED** ✅ |
| `/tour/diana-ross-the-supreme-experience` | Diana Ross Cruise | **ADOPTED** ✅ |
| `/tour/decks-on-deck-day-party` | Decks on Deck | **ADOPTED** ✅ |
| `/tour/soul-river` | Soul River | **ADOPTED** ✅ |
| `/tour/adele-cruise` | Adele Cruise | **ADOPTED** ✅ |
| `/tour/rollin-on-the-river` | Rollin' on the River | **ADOPTED** ✅ |
| `/tour/elvis-live` | Elvis Live | **ADOPTED** ✅ |
| `/tour/elvis-rocks` | Elvis Rocks | **ADOPTED** ✅ |
| `/tour/fathers-day` | Father's Day Cruise | **ADOPTED** ✅ |
| `/tour/mothering-sunday` | Mother's Day Cruise | **ADOPTED** ✅ |
| `/tour/swing-cruise-live-music` | Swinging on the River | **ADOPTED** ✅ |
| `/tour/dolly-cruise` | Dolly Cruise | **ADOPTED** ✅ |
| `/tour/boat-tropicana` | Boat Tropicana | **ADOPTED** ✅ |
| `/tour/back-to-90s` | Back to the 90s | **ADOPTED** ✅ |
| `/tour/father-christmas-cruise` | Cruise with Father Christmas | **ADOPTED** ✅ |

Plus `/tour/pirates-and-mermaid-cruise` (Pirates & Mermaids) — adopted from your pairing, not
present in the Craft sitemap.

### 2b. Products that live at a top-level page — still redirects

| Old URL | New page | Status | Notes |
|---|---|---|---|
| `/tour/city-river-tours` | `/city-river-tour` | **REDIRECT** | Left as-is per instruction. CRT keeps its own top-level page. |
| `/tour/boat-to-old-trafford` | `/boat-to-old-trafford` | **REDIRECT** | Left as-is per instruction. Points straight at the live page — no chain via `/mufc-ferry`. |

---

## 3. Retired legacy category facets — REDIRECT

Thin listing pages sharing the `/tour/` namespace. No slug collides with an adopted product.

| Old URL | Target | Notes |
|---|---|---|
| `/tour/city-sightseeing` | `/city-river-tour` | |
| `/tour/live-music` | `/music-cruises-manchester` | |
| `/tour/party-event` | `/party-boat-manchester` | |
| `/tour/old-trafford-event` | `/boat-to-old-trafford` | |
| `/tour/kids-event` | `/events` | |
| `/tour/museum-tours` | `/discover` | ⚠️ Target unconfirmed — may be better at `/discover/visiting-iwm-north`. |
| `/tour/eat-drink` | `/whats-on` | ⚠️ Target unconfirmed — no food-and-drink equivalent exists. |
| `/tour/on-board-events` | `/events` | See the split-target note on row 11. |

## 4. Retired legacy amenity facets — REDIRECT

Craft filter facets with no unique content; `/amenities/18` is a bare numeric ID.

| Old URL | Target |
|---|---|
| `/amenities/old-trafford` | `/boat-to-old-trafford` |
| `/amenities/bar-on-board` | `/vessels` *(retarget if row 6 is adopted)* |
| `/amenities/groups-allowed` | `/groups` |
| `/amenities/pets-allowed` | `/faq` |
| `/amenities/toilets` | `/faq` |
| `/amenities/18` | `/faq` |

**Alternative:** `410 Gone` is arguably more honest than six 301s into `/faq`.

## 5. Our own history — `/cruises/*` → `/tour/*` REDIRECT

Not legacy URLs, but the new site did briefly ship products at `/cruises/[slug]`, so staging
links and shared previews must not 404. 12 explicit rules (slug also changed) ordered **before**
a `/cruises/*` splat (slug already identical), plus `/cruises` → `/events`. Bare `/tour` → `/events`.

---

## 6. Trailing slash — SITE-WIDE, unchanged by this work

- **Legacy site emits no trailing slash** (`…/whats-on`). That is what Google has indexed.
- **We emit one.** No `trailingSlash`/`build.format` in `astro.config.mjs`, so Astro's `directory`
  default applies. Verified in the current build: canonical is
  `https://www.manchesterrivercruises.com/tour/mamma-mia-cruise-abba-tribute/`.

So the adopted product URLs still differ from the indexed form by a trailing slash. Netlify serves
both and nothing breaks, but if the point of the adoption is that these URLs never move, setting
`build: { format: 'file' }` (or `trailingSlash: 'never'`) completes the job. **Recommended, and
more clearly worth doing now that 16 product URLs depend on it.** Add one normalising 301 so only
one form is reachable. Do not write per-page rules — Netlify already matches
trailing-slash-insensitively.

## 7. Casing and host — unchanged

Every legacy URL is lowercase; no conflicts. Sitemap lives at the apex but all URLs inside are
`www.`, matching our `astro.config.mjs` `site` and `src/data/site.ts` `url`. Confirm the apex →
`www` 301 survives the DNS cutover.

---

## Summary

| Status | Count |
|---|---|
| ALREADY-IDENTICAL | 5 |
| **ADOPTED** ✅ (live) | **15** |
| ADOPT (pending decision) | 4 |
| REDIRECT | 22 |
| **Total legacy URLs** | **46** |

`netlify.toml` now holds **38 redirect rules**. Verified against the built output: **zero chains,
zero dead targets, zero rules shadowed by a real page.**

---

## Verification performed

- All 16 published products render at their legacy addresses (`dist/tour/*`). The 4 absent events
  are pre-existing `draft: true` entries — and are exactly the 4 with no legacy counterpart.
- **Zero** `/cruises` references anywhere in `dist/`, `src/`, `docs/`, `public/`, `netlify.toml`,
  `keystatic.config.ts`, or the governing rule files.
- Sitemap: 16 `/tour/<slug>` entries, no `/cruises`.
- Spot-checked `/tour/mamma-mia-cruise-abba-tribute`, `/tour/swing-cruise-live-music`,
  `/tour/father-christmas-cruise` — canonical, `Product` schema `url`, `Offer` `url` and
  `BreadcrumbList` all on `/tour/`, with correct product-title leaf labels.
- What's On `productId → slug` map, the date-finder map, gallery `relatedProduct`,
  `bookingCtaUrl` and "View photos" matching all resolve to `/tour/` in built HTML.
- Rule ordering confirmed: the 12 explicit `/cruises/<slug>` rules precede the `/cruises/*` splat.

## Still outstanding

1. **The GA/GSC export is not in the repo** — it drove flags 2 and 3 above and is still needed for
   malformed/historic slug variants and any blog section the Craft sitemap never listed.
2. Rows 6–9 (`/our-vessels`, `/manage-bookings`, `/contact-us`, `/terms-conditions`) — decisions open.
3. `/help` vs `/faq` (row 10) — decide from GSC impressions.
4. `/salford-quays` (row 13) — the case for building a page rather than redirecting.
5. `/tour/museum-tours` and `/tour/eat-drink` redirect targets — confirm from the live pages.
6. Trailing-slash decision (§6) — now load-bearing for 16 adopted product URLs.
7. `/private-hire` vs `/private-boat-hire-manchester` — parity is fine, but confirm which is
   canonical for "private boat hire Manchester" so they don't compete.
