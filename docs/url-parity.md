# URL Parity — legacy Craft site vs new Astro site

**Status: COMPLETE. Every decision in this table has been executed.**
All 46 legacy URLs are now either rendered at their original address or 301'd to a
deliberate target. What remains is confirmation, not work — see *Still outstanding*.

**Source of the old-URL inventory:** `https://manchesterrivercruises.com/sitemap.xml`
(a sitemap index) plus its five child sitemaps, cross-checked against a crawl of the live
homepage header, body and footer. Captured 2026-07-27. **46 legacy URLs**, plus two
GA-confirmed URLs the sitemap never listed.

---

## Status key

| Status | Meaning |
|---|---|
| **ALREADY-IDENTICAL** | Old path and new path are the same string. No rule — one would shadow a real page. |
| **ADOPTED** ✅ | Our page renders **at** the legacy path. The URL never moved, so it needs no rule. |
| **REDIRECT** | Old path was poor or the page was consolidated away. 301 in `netlify.toml`. |

---

## Summary

| Status | Count |
|---|---|
| ALREADY-IDENTICAL | 5 |
| **ADOPTED** ✅ | **26** |
| REDIRECT | 15 |
| **Total legacy URLs** | **46** |

`netlify.toml` holds **45 redirect rules**. Verified against the built output: **zero chains,
zero dead targets, zero unintended shadows** (one documented transient — see §7).

---

## 1. The `/tour/` namespace — fully adopted ✅

Products render at their exact Craft addresses. **No legacy product URL redirects.**
`src/pages/cruises/` → `src/pages/tour/`; content filenames follow the slugs.

⚠️ **CMS edit URLs changed.** Keystatic addresses entries by filename, so every renamed
event's edit URL moved (e.g. `…/item/santa-cruise` → `…/item/father-christmas-cruise`).
Re-save any CMS bookmarks.

### Event products

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
| `pirates-and-mermaids` | `pirates-and-mermaid-cruise` | **Simon / GA only — not in sitemap** |
| `santa-cruise` | `father-christmas-cruise` | sitemap |
| `soul-river-cruise` | `soul-river` | sitemap |
| `swinging-on-the-river` | `swing-cruise-live-music` | sitemap + Simon |
| `wizards-and-fairies` | `wizards-and-fairies-cruise` | **GA only** — 517 sessions, £1,236 |
| `adele-cruise` · `boat-tropicana` · `dolly-cruise` · `rollin-on-the-river` | unchanged | namespace only |

**No legacy counterpart — kept their current slug** (all `draft: true`):
`broadway-boat-party`, `club-classics-cruise`, `halloween-boat-party`.

### Flagship products — also adopted ✅

| Legacy URL (now live) | Page | Notes |
|---|---|---|
| `/tour/city-river-tours` | City River Tour | Moved from `/city-river-tour`. Most-wired page on the site: nav, homepage, date-finder map, What's On feed, gallery, groups/gift/Christmas/discover cross-links, schema, `llms.txt`, Lighthouse audit path. |
| `/tour/boat-to-old-trafford` | Matchday ferry | Moved from `/boat-to-old-trafford`, with the two departure points nesting beneath at `/tour/boat-to-old-trafford/<point>`. |

**Breadcrumbs.** The `/tour/` namespace crumb resolves to the Events hub, which is right for
event products but wrong for CRT and the ferry — and several adopted event slugs no longer
resemble the product name (`/tour/swing-cruise-live-music` would have read "Swing Cruise Live
Music"). The product template and both flagship pages now pass explicit trails.

### ⚠️ Flags on the mapping

1. **`santa-cruise` → `father-christmas-cruise`.** The earlier note said Santa "remains as-is if
   already executed"; it had **not** been — what existed was a 301 pointing
   `/tour/father-christmas-cruise` at the product's own new home. The stated rule was applied
   (legacy counterpart → adopt legacy slug) and the old redirect reversed.
2. **`pirates-and-mermaid-cruise` is unverified.** Taken from instruction only; absent from the
   Craft sitemap and **there is still no GA/GSC export in the repo**. One-line fix if wrong.
3. **`mothering-sunday` is a worse slug than `mothers-day-cruise` for search** — people search
   "mothers day". Adopted as instructed; the one adoption that arguably costs more than it saves.
4. **`/tour-type/*` does not exist** — `/tour-type/live-music` 404s live. The category facets are
   at `/tour/<category>`, *inside* the adopted namespace. Verified no facet slug collides with a
   product slug, so the redirects cannot shadow a live page.
5. **Wizards is still `draft: true`, so `/tour/wizards-and-fairies-cruise` does not render.**
   GA shows it earning 517 sessions and £1,236, so launching would 404 real demand. An interim
   301 to `/whats-on` covers it and is **self-healing** — `force` is omitted, so Netlify serves
   the real page the moment the event is published. **Publishing the event is the actual fix.**
6. **An "Elves" cruise may exist with no successor.** The legacy `/kids-takeover` page advertises
   "Pirates to Wizards, Elves to Mermaids". Pirates and Wizards both turned out to have
   sitemap-invisible URLs; Elves may too. Only the GA export can settle it.

---

## 2. Core pages — all resolved

| # | Old URL | Now | Status |
|---|---|---|---|
| 1 | `/` | `/` | **ALREADY-IDENTICAL** |
| 2 | `/whats-on` | `/whats-on` | **ALREADY-IDENTICAL** |
| 3 | `/private-hire` | `/private-hire` | **ALREADY-IDENTICAL** ⭐ |
| 4 | `/about` | `/about` | **ALREADY-IDENTICAL** |
| 5 | `/privacy-policy` | `/privacy-policy` | **ALREADY-IDENTICAL** |
| 6 | `/our-vessels` | renders here | **ADOPTED** ✅ — renamed from `/vessels`; 3 CTAs, the gallery `relatedProduct` and the `/amenities/bar-on-board` target followed |
| 7 | `/manage-bookings` | renders here | **ADOPTED** ✅ — renamed from `/manage-booking`; Footer + the `BookingPanel` `manageBookingHref` default prop |
| 8 | `/contact-us` | renders here | **ADOPTED** ✅ — renamed from `/contact`; 6 CTAs **and the Netlify form `action`**, which would otherwise have broken submission |
| 9 | `/terms-conditions` | renders here | **ADOPTED** ✅ — **built from scratch**; the site had no T&Cs at all. All 17 legacy clauses transcribed verbatim, grouped by theme, original numbering preserved. Footer link added. **Needs Simon's review.** |
| 10 | `/salford-quays` | renders here | **ADOPTED** ✅ — **built from scratch** at the legacy path rather than redirected to `/getting-here`, which covers all three boarding points and would have mis-titled itself. Legacy content as base, `salford-quays` album imagery. Boarding address confirmed — Pier 8 carried as an alias. |
| 11 | `/help` | `/faq` | **REDIRECT** — close call; `/faq` is shorter and carries the `FAQPage` schema. Check GSC impressions. |
| 12 | `/our-events` | `/whats-on` | **REDIRECT** — retargeted from `/events` on instruction. ⚠️ `/tour/on-board-events`, the same legacy listing under a different path, goes to `/events`. Two legacy URLs for one page, split across two targets — worth unifying. |
| 13 | `/our-tours` | `/whats-on` | **REDIRECT** — not a tour index despite the name; thin marketing page duplicating homepage copy. |
| 14 | `/kids-takeover` | `/events` | **REDIRECT** — no family hub page exists. See flag 6. |
| 15 | `/thank-you` | `/` | **REDIRECT** — Craft form landing page; our forms use an inline success reveal. |

### ✅ Salford Quays boarding address — RESOLVED

The legacy page gave the boarding address as **Pier 8, Salford Quays, M50 3AZ**, while our
canonical NAP (`src/data/site.ts`) says **Millennium Footbridge, The Quays, Salford, M50 3RB**.
Simon has confirmed **these are the same boarding location**, not a conflict.

Resolution: the canonical `site.ts` address stays primary and remains the only one in schema and
the footer, with `Also known as Pier 8, Salford Quays.` as a secondary line on `/salford-quays`.
That keeps NAP consistency intact while giving returning customers — and anyone whose satnav
still holds the old postcode — the recognition cue. The TBC banner has been removed.

### ⚠️ Terms & conditions — still pending review

The T&Cs are Simon's own wording, transcribed not rewritten. The deposit percentage, payment
windows, refund periods and the "no wheelchair access" statement all need confirming, and ideally
a solicitor's review. That page keeps its TBC banner.

---

## 3. Retired legacy category facets — REDIRECT

| Old URL | Target | Notes |
|---|---|---|
| `/tour/city-sightseeing` | `/tour/city-river-tours` | |
| `/tour/live-music` | `/music-cruises-manchester` | |
| `/tour/party-event` | `/party-boat-manchester` | |
| `/tour/old-trafford-event` | `/tour/boat-to-old-trafford` | |
| `/tour/kids-event` | `/events` | |
| `/tour/museum-tours` | `/discover` | ⚠️ Target unconfirmed — may belong at `/discover/visiting-iwm-north`. |
| `/tour/eat-drink` | `/whats-on` | ⚠️ Target unconfirmed — no food-and-drink equivalent. |
| `/tour/on-board-events` | `/events` | See the split-target note on row 12. |

## 4. Retired legacy amenity facets — REDIRECT

`/amenities/old-trafford` → `/tour/boat-to-old-trafford` · `/amenities/bar-on-board` →
`/our-vessels` · `/amenities/groups-allowed` → `/groups` · `/amenities/pets-allowed`,
`/amenities/toilets`, `/amenities/18` → `/faq`.

Craft filter facets with no unique content; `/amenities/18` is a bare numeric ID.
**`410 Gone` is arguably more honest than six 301s into `/faq`** — Simon's call.

## 5. Our own history — REDIRECT

Never public, but real in staging links and bookmarks:
`/cruises/*` → `/tour/*` (13 explicit rules for changed slugs, ordered **before** the splat),
`/cruises` → `/events`, bare `/tour` → `/events`, `/city-river-tour` →
`/tour/city-river-tours`, `/boat-to-old-trafford(/*)` → `/tour/boat-to-old-trafford(/*)`,
`/vessels` → `/our-vessels`, `/manage-booking` → `/manage-bookings`, `/contact` → `/contact-us`.

---

## 6. Trailing slash — RESOLVED ✅

The legacy site emitted every URL **unslashed**; we were emitting `/whats-on/`. Cosmetic while it
was only cosmetic — but the adoption made ~20 product URLs depend on matching the legacy form,
so `astro.config.mjs` now sets `build: { format: 'file' }` and `trailingSlash: 'never'`.

That change bit twice, both fixed in `BaseLayout`: with `format: 'file'`, `Astro.url.pathname`
becomes the emitted **file** path (`/whats-on.html`), so canonicals and `og:url` advertised a
`.html` URL nobody should index, and the auto-derived breadcrumbs inherited the extension
(defeating the label overrides). A `publicPath()` helper strips the extension and any trailing
slash once; both consumers read it.

**Verified unaffected:** `/admin` and `/keystatic` are `prerender: false`, so they are SSR-rendered
by the Netlify function and the build format never applies to them; the six OCTO functions are
untouched; the ferry landing file coexists with the directory holding its departure-point pages.

Minor and benign: the sitemap lists the homepage as the bare origin while its canonical is the
origin with a single `/`. Those are the same URL per RFC 3986.

## 7. Known transient — one deliberate 2-hop

While Wizards is draft:
`/cruises/wizards-and-fairies` → `/tour/wizards-and-fairies-cruise` → `/whats-on`.

The first rule points at the correct **final** destination. Pointing it straight at `/whats-on`
would be a rule that silently becomes wrong once the event is published. Publishing removes the
middle hop with no edit. Everything else is single-hop.

## 8. Casing and host — unchanged

Every legacy URL is lowercase; no conflicts. All sitemap URLs are `www.`, matching
`astro.config.mjs` `site` and `src/data/site.ts` `url`. Confirm the apex → `www` 301 survives the
DNS cutover.

---

## Verification performed

- All **18** legacy `/tour/` product URLs render (16 event products + CRT + ferry). The absent
  events are pre-existing `draft: true` entries.
- Redirect audit against the built output: 45 rules, **0 chains, 0 dead targets, 0 unintended
  shadows**, plus the one documented transient above.
- Canonicals, `og:url`, sitemap and breadcrumbs are unslashed and `.html`-free. **Zero**
  trailing-slash or `.html` internal hrefs in built HTML.
- **Zero** `/cruises`, `/city-river-tour`, `/boat-to-old-trafford`, `/vessels`,
  `/manage-booking` or `/contact` references left in `src/`, `docs/`, `public/`, `netlify.toml`,
  `keystatic.config.ts` or the governing rule files.
- What's On `productId → slug` map, the date-finder map, gallery `relatedProduct`,
  `bookingCtaUrl` and "View photos" matching all resolve to `/tour/`.
- Image paths (`/images/city-river-tour-*`, `/images/gallery/salford-quays/*`) and the
  `/gallery/city-river-tour` **album** URL were deliberately excluded from every sweep.
- Contact form `action` verified as `/contact-us?success=true#contact-success`.

## Still outstanding

1. **The GA/GSC export is still not in the repo.** It drove the Pirates and Wizards pairings
   second-hand and is the only way to settle flags 2 and 6, malformed/historic slug variants, and
   any blog section the Craft sitemap never listed.
2. **Publish the Wizards & Fairies event** — the interim redirect is a net, not a fix.
3. **Simon's review of `/terms-conditions`** — the clause wording, deposit percentage, payment
   windows and refund periods. (`/salford-quays` is resolved — see §2.)
4. `/help` vs `/faq` — decide from GSC impressions.
5. `/tour/museum-tours` and `/tour/eat-drink` targets — confirm from the live pages.
6. `/our-events` and `/tour/on-board-events` currently split to `/whats-on` and `/events`.
7. `/amenities/*` — 301 or 410.
8. `/private-hire` vs `/private-boat-hire-manchester` — parity is fine, but confirm which is
   canonical for "private boat hire Manchester" so they don't compete.
