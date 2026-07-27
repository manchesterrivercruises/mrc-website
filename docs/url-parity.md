# URL Parity — legacy Craft site vs new Astro site

**Status: DECISION TABLE ONLY. Nothing has been changed.**
This document exists for Simon to mark up. No page has been renamed, no redirect has been
added, no internal link has been touched as a result of this audit. Once the `Decision` column
is confirmed, the ADOPT rows become rename tasks and the REDIRECT rows feed
`netlify.toml` → the legacy redirect map (which is currently, and deliberately, incomplete).

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

The nav/footer crawl surfaced no page that the sitemap missed, so the sitemap is treated as
complete for indexable pages. It does **not** cover: paginated/filter URLs, `?`-query variants,
or any old blog/news section (there is no evidence the Craft site had one). See
*Gaps and open questions* at the bottom.

---

## Status key

| Status | Meaning | Action it implies |
|---|---|---|
| **ALREADY-IDENTICAL** | The old path and our new path are the same string. | Nothing. Do not add a redirect — a redirect here would shadow a real page. |
| **ADOPT** | Rename our page to the old path, so the URL never moves. | Rename the `.astro` file, update every internal link, update `docs/seo-pages.md`, let the sitemap regenerate. **No redirect needed** (the URL was never lost). |
| **REDIRECT** | The old path is poor, or the page was consolidated away. | 301 in `netlify.toml` to the stated target. |

---

## 1. Core pages (`page` sitemap — 15 URLs)

| # | Old URL | Closest new page | Status | Notes |
|---|---|---|---|---|
| 1 | `/` | `/` | **ALREADY-IDENTICAL** | — |
| 2 | `/whats-on` | `/whats-on` | **ALREADY-IDENTICAL** | — |
| 3 | `/private-hire` | `/private-hire` | **ALREADY-IDENTICAL** | ⭐ **Simon's priority page already has full parity.** Nothing to do. Note we *also* ship `/private-boat-hire-manchester` as a separate keyword landing page — that is additive and does not affect this row, but the two must not compete: see *Open questions*. |
| 4 | `/about` | `/about` | **ALREADY-IDENTICAL** | — |
| 5 | `/privacy-policy` | `/privacy-policy` | **ALREADY-IDENTICAL** | — |
| 6 | `/our-vessels` | `/vessels` | **ADOPT** | Rename `src/pages/vessels.astro` → `our-vessels.astro`. Old path is perfectly good and indexed. **Internal links to update (3):** `about.astro:111`, `private-boat-hire-manchester.astro:187`, `private-hire.astro:163`. Canonical + sitemap regenerate automatically. |
| 7 | `/manage-bookings` | `/manage-booking` | **ADOPT** | Plural vs singular — a pointless URL change to inherit. Rename `manage-booking.astro` → `manage-bookings.astro`. **Internal links to update (2):** `components/BookingPanel.astro:18` (the `manageBookingHref` default prop) and `components/Footer.astro:100`. |
| 8 | `/contact-us` | `/contact` | **ADOPT** | `/contact` is marginally tidier, but not enough to justify losing the equity on a page people link to. Rename `contact.astro` → `contact-us.astro`. **Internal links to update (6):** `accessibility.astro:70`, `faq.astro:85`, `groups.astro:53`, `groups.astro:94`, `groups.astro:179`, `groups.astro:268`. Also check the Netlify Forms `action`/success path on the contact form itself. |
| 9 | `/terms-conditions` | *(none — we have no terms page)* | **ADOPT** | ⚠️ **This is a content gap, not just a URL decision.** The new site has no terms & conditions page at all, and the footer has no link to one. Build it at the exact legacy path `/terms-conditions` so the URL is never lost, and add a footer link next to Privacy Policy. **Launch blocker** — a booking site needs live T&Cs. |
| 10 | `/help` | `/faq` | **REDIRECT** → `/faq` | Honest read: this one is genuinely close. `/help` has equity and is a legitimate path; `/faq` is shorter, keyword-exact, and is what our `FAQPage` schema is attached to. Recommending REDIRECT — but if Search Console shows `/help` carrying real impressions, ADOPT is the defensible alternative. **Simon: check GSC before confirming.** |
| 11 | `/our-events` | `/events` | **REDIRECT** → `/events` | Already live in `netlify.toml`. `/events` is the cleaner path and the possessive "our-" prefix adds nothing. |
| 12 | `/our-tours` | `/whats-on` | **REDIRECT** → `/whats-on` | Old path is poor value: despite the name it is *not* a tour index. It's a thin marketing page (company heritage blurb + a single link to City River Tours) that largely duplicates homepage copy. Consolidated away. Alternative target `/city-river-tour` if GSC shows it ranking for sightseeing terms rather than as a hub. |
| 13 | `/salford-quays` | `/getting-here` | **REDIRECT** → `/getting-here` | ⚠️ **Flag for Simon — the one place where the old URL is better than anything we have.** The legacy page is "Salford Quays Boarding Point": ~800–1000 words of boarding times, tram/car/parking, access notes. Our `/getting-here` covers the same ground but for *all* boarding points (Salford Quays + Ralli Quay + Stephenson's Bridge), so a rename would mis-title it. `/salford-quays` is a short, high-intent URL ("Salford Quays boat trip") that we'd be throwing away. **Recommended follow-up (not this task):** build a dedicated `/salford-quays` boarding-point page and downgrade this row to ALREADY-IDENTICAL. Note `/discover/day-out-salford-quays` and `/discover/family-day-out-salford-quays` are editorial day-out pages, not boarding-point pages — they are *not* the right target. |
| 14 | `/kids-takeover` | `/events` | **REDIRECT** → `/events` | Legacy page is a light hub for kids' themed cruises (pirates, wizards, elves, mermaids) with a Santa banner. We have the individual cruises (`/cruises/pirates-and-mermaids`, `/cruises/wizards-and-fairies`, `/cruises/santa-cruise`) but **no family hub page**. `/events` is the honest closest match today. Secondary flag: a `/kids-cruises-manchester`-style hub is a real SEO gap — see `docs/post-launch-roadmap.md`. |
| 15 | `/thank-you` | *(none)* | **REDIRECT** → `/` | Craft form-submission landing page. Our forms use an inline success reveal instead, so there is no equivalent and no reason to build one. Only inbound source would be old form posts. Low value — redirect to home. |

---

## 2. Tour pages (`tour` sitemap — 17 URLs)

Every one of these is a **REDIRECT**. The `/tour/` prefix is the wrong shape: the legacy site
puts individual products, product *categories*, and an events hub all under the same `/tour/`
namespace, so it carries no meaning. `AGENTS.md` rule 6 / `CLAUDE.md` also mandate that dynamic
product pages live at `/cruises/[slug]`. There is no ADOPT candidate in this block.

### 2a. The two flagship products

| Old URL | New page | Status | Notes |
|---|---|---|---|
| `/tour/city-river-tours` | `/city-river-tour` | **REDIRECT** | ✅ already in `netlify.toml`. Old path also plural where the product is singular. |
| `/tour/boat-to-old-trafford` | `/boat-to-old-trafford` | **REDIRECT** | ✅ already in `netlify.toml`, pointing straight at the live page (no chain via `/mufc-ferry`). |

### 2b. Event cruises → `/cruises/[slug]`

Slug changes are ours, not theirs — several legacy slugs are worse (`fathers-day`,
`mothering-sunday`, `back-to-90s`, `swing-cruise-live-music`). All 15 need adding to the
redirect map; only one exists today.

| Old URL | New page | Status | In `netlify.toml` yet? |
|---|---|---|---|
| `/tour/mamma-mia-cruise-abba-tribute` | `/cruises/abba-tribute-cruise` | **REDIRECT** | ✗ |
| `/tour/diana-ross-the-supreme-experience` | `/cruises/diana-ross-cruise` | **REDIRECT** | ✗ |
| `/tour/decks-on-deck-day-party` | `/cruises/decks-on-deck` | **REDIRECT** | ✗ |
| `/tour/soul-river` | `/cruises/soul-river-cruise` | **REDIRECT** | ✗ |
| `/tour/adele-cruise` | `/cruises/adele-cruise` | **REDIRECT** | ✗ — slug identical, path differs |
| `/tour/rollin-on-the-river` | `/cruises/rollin-on-the-river` | **REDIRECT** | ✗ — slug identical, path differs |
| `/tour/elvis-live` | `/cruises/elvis-live-cruise` | **REDIRECT** | ✗ |
| `/tour/elvis-rocks` | `/cruises/elvis-rocks-cruise` | **REDIRECT** | ✗ |
| `/tour/fathers-day` | `/cruises/fathers-day-cruise` | **REDIRECT** | ✗ |
| `/tour/mothering-sunday` | `/cruises/mothers-day-cruise` | **REDIRECT** | ✗ |
| `/tour/swing-cruise-live-music` | `/cruises/swinging-on-the-river` | **REDIRECT** | ✗ |
| `/tour/dolly-cruise` | `/cruises/dolly-cruise` | **REDIRECT** | ✗ — slug identical, path differs |
| `/tour/boat-tropicana` | `/cruises/boat-tropicana` | **REDIRECT** | ✗ — slug identical, path differs |
| `/tour/back-to-90s` | `/cruises/back-to-the-90s` | **REDIRECT** | ✗ |
| `/tour/father-christmas-cruise` | `/cruises/santa-cruise` | **REDIRECT** | ✅ already in `netlify.toml` |

**New-site events with no legacy equivalent** (nothing to redirect, listed for completeness):
`broadway-boat-party`, `club-classics-cruise`, `halloween-boat-party`, `pirates-and-mermaids`,
`wizards-and-fairies`.

---

## 3. Tour categories (`tourCategory` sitemap — 7 URLs)

All **REDIRECT**. These are category/facet listings sitting at `/tour/<category>` —
indistinguishable by path from actual products, and thin (event tiles + boilerplate, almost no
unique copy). Poor URLs; consolidated into our keyword landing pages.

| Old URL | New page | Status | Notes |
|---|---|---|---|
| `/tour/city-sightseeing` | `/city-river-tour` | **REDIRECT** | |
| `/tour/live-music` | `/music-cruises-manchester` | **REDIRECT** | Confirmed thin: event tiles + footer boilerplate, no editorial copy. |
| `/tour/party-event` | `/party-boat-manchester` | **REDIRECT** | |
| `/tour/old-trafford-event` | `/boat-to-old-trafford` | **REDIRECT** | |
| `/tour/kids-event` | `/events` | **REDIRECT** | Same missing-family-hub caveat as `/kids-takeover` (row 14). |
| `/tour/museum-tours` | `/discover` | **REDIRECT** | ⚠️ **Target needs confirming.** Likely IWM North / Lowry content — if so `/discover/visiting-iwm-north` may be the better target. Verify the legacy page's actual content before writing the rule. |
| `/tour/eat-drink` | `/whats-on` | **REDIRECT** | ⚠️ **Target needs confirming.** No new-site equivalent for a food-and-drink category. `/whats-on` is the safe catch-all. |

---

## 4. Events hub (`tourEvent` sitemap — 1 URL)

| Old URL | New page | Status | Notes |
|---|---|---|---|
| `/tour/on-board-events` | `/events` | **REDIRECT** | The real "On Board Events" listing (the legacy footer links here, while the header links to `/our-events`). Both legacy paths collapse to our single `/events`. |

---

## 5. Amenities (`amenities` sitemap — 6 URLs)

All **REDIRECT**. These are Craft filter-facet pages ("boats with a bar", "pets allowed") with
essentially no unique content — and `/amenities/18` is a bare numeric ID, an unambiguously bad
URL. Nothing here is worth adopting.

| Old URL | New page | Status | Notes |
|---|---|---|---|
| `/amenities/old-trafford` | `/boat-to-old-trafford` | **REDIRECT** | |
| `/amenities/bar-on-board` | `/vessels` *(→ `/our-vessels` if row 6 is ADOPTed)* | **REDIRECT** | Target depends on row 6 — write the rule *after* that rename to avoid a chain. |
| `/amenities/groups-allowed` | `/groups` | **REDIRECT** | |
| `/amenities/pets-allowed` | `/faq` | **REDIRECT** | Dogs-on-board is an FAQ answer. |
| `/amenities/toilets` | `/faq` | **REDIRECT** | |
| `/amenities/18` | `/faq` | **REDIRECT** | Presumably the over-18s facet. Numeric ID — zero equity, zero meaning. |

**Alternative worth considering:** serve `410 Gone` rather than 301 for the whole `/amenities/*`
block. These are facet pages with no user intent behind them; six 301s into `/faq` is a mild
soft-404 signal. Recommendation: 301 anyway (harmless, and cheaper than arguing about it), but
Simon may prefer to drop them.

---

## 6. Trailing slash — SITE-WIDE, redirect-level, affects every URL above

**This is separate from the rename decisions and must be settled independently.**

- **Legacy site emits no trailing slash.** Every `<loc>` in the Craft sitemap is
  `https://www.manchesterrivercruises.com/whats-on` — that is the form Google has indexed.
- **Our new site emits a trailing slash.** `astro.config.mjs` sets no `trailingSlash` or
  `build.format`, so Astro's default `directory` format applies. Verified in the current build:
  - `dist/whats-on/index.html` → `<link rel="canonical" href="https://www.manchesterrivercruises.com/whats-on/">`
  - `dist/sitemap-0.xml` → `<loc>https://www.manchesterrivercruises.com/about/</loc>`

So even the five **ALREADY-IDENTICAL** rows — including `/private-hire` — change their canonical
form at launch, from `/private-hire` to `/private-hire/`. Netlify serves both, so nothing breaks,
but the canonical/sitemap URL Google sees is a different string from the one it has indexed.

**Options:**

1. **Match the legacy form** — set `build: { format: 'file' }` (or `trailingSlash: 'never'`) so
   we emit `/whats-on` exactly as before. Truest parity; zero canonical churn. *Recommended*,
   given the whole point of this exercise is not moving URLs.
2. **Keep trailing slashes** and let Google re-settle on the slashed form. Works, but it means
   every page — even the ones we're being careful not to move — technically moves.

Whichever is chosen, add a single normalising 301 so only one form is reachable, and confirm the
canonical tag, `og:url`, sitemap and internal links all agree. **Do not** write per-page
trailing-slash rules — Netlify already matches redirects trailing-slash-insensitively, which is
why the existing `netlify.toml` rules cover both forms.

## 7. Casing and host — redirect-level

- **Casing:** every legacy URL in all five sitemaps is lowercase. No casing conflicts, and no
  mixed-case rename decisions to make. If GSC shows mixed-case inbound links, add one
  lowercase-normalising rule rather than per-URL rules.
- **Host:** the sitemap lives at the apex (`manchesterrivercruises.com/sitemap.xml`) but every
  URL inside it is `www.`, and the apex redirects to `www`. Our `astro.config.mjs` `site` and
  `src/data/site.ts` `url` are both `https://www.manchesterrivercruises.com` — **consistent, no
  action**. Just confirm the apex → `www` 301 survives the Netlify DNS cutover
  (`docs/launch-checklist.md`).

---

## Summary

| Status | Count |
|---|---|
| ALREADY-IDENTICAL | 5 |
| ADOPT | 4 (`/our-vessels`, `/manage-bookings`, `/contact-us`, `/terms-conditions`) |
| REDIRECT | 37 |
| **Total legacy URLs** | **46** |

Redirects already in `netlify.toml`: **4** of 37. **33 still to write**, once decisions are confirmed.

---

## Gaps and open questions for Simon

1. **Google Search Console export.** This audit is sitemap-derived, so it only sees pages Craft
   chose to list. It cannot see: URLs with real traffic that were dropped from the sitemap, old
   query-string variants, or anything from before the current site structure. The GSC top-pages
   export (already flagged in `netlify.toml` and `docs/launch-checklist.md`) is still required
   before launch, and may add ADOPT rows this table doesn't have.
2. **`/help` vs `/faq` (row 10)** — decide from GSC impressions, not taste.
3. **`/salford-quays` (row 13)** — the strongest case for building a new page to *match* an old
   URL rather than redirecting it. Worth a decision on its own.
4. **`/terms-conditions` (row 9)** — content gap and a launch blocker, independent of URL parity.
5. **`/tour/museum-tours` and `/tour/eat-drink`** — redirect targets are best-guess; confirm from
   the live legacy pages.
6. **`/private-hire` vs `/private-boat-hire-manchester`** — parity is fine, but two hire pages
   risk competing for the same query. Confirm which is canonical for "private boat hire
   Manchester" and make sure the other links to it rather than duplicating it.
7. **No legacy blog/news section found.** If one ever existed at a path Craft no longer lists,
   it will only show up in the GSC export.
