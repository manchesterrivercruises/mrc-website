# Lighthouse triage

Triage of a **mobile** Lighthouse run on `/city-river-tour` (CRT):
**Performance 68 · Accessibility 87 · Best Practices 92 · SEO 69.**

This records what we changed, what is an accepted third-party cost, and what stays open.
Runtime re-verification is deferred to the per-deploy Lighthouse plugin (see §4) — we cannot run
a headless browser in this build environment, so the fixes below are static-analysis + code
changes, confirmed against the **built** HTML in `dist/`.

> **SEO 69 is a staging artefact, not a real defect.** Preview/branch deploys are deliberately
> `noindex` (`[context.*]` in `netlify.toml`), which tanks the SEO category. Judge SEO only on the
> **production** deploy. See `docs/launch-checklist.md`.

---

## 1. LCP 4.9s — hero image (Performance)

**LCP element (mobile):** the first, largest photo tile in the CRT gallery mosaic —
`/images/city-river-tour-hero.webp` in `src/pages/city-river-tour.astro`. On mobile the mosaic is
`grid-cols-1`, so this tile is full-width and paints as the LCP.

**What was wrong:**
- The tile was `loading="eager"` but had **no `fetchpriority="high"`**, so the browser gave it
  default priority and it competed with (and could queue behind) the deferred Ventrata checkout
  module and the other images.
- **No preload** — the image wasn't discoverable until the parser reached the `<img>` well down the
  body.
- The single 1600×1200 source (**222 KB**) was served to every viewport, including mobile where the
  tile renders ~380 px CSS wide.

**Fixes (`src/pages/city-river-tour.astro`):**
- Added `fetchpriority="high"` to the LCP `<img>` (kept `loading="eager"`).
- Added a responsive `srcset`/`sizes`: mobile now takes the existing **800×600 card variant
  (66 KB)** instead of the 1600 px hero; desktop (tile ≈ 680 px CSS, at 2× ≈ 1360 px) still takes the
  1600 px source.
  `srcset="…-card.webp 800w, …-hero.webp 1600w"`, `sizes="(min-width: 640px) 60vw, calc(100vw - 2rem)"`.
- Added a matching `<link rel="preload" as="image">` in `<head>` (via `slot="head"`) whose
  `imagesrcset`/`imagesizes` **mirror the `<img>` exactly**, so the browser preloads the same
  candidate it will paint (an `href`-only preload would fetch the 1600 px hero and waste the mobile
  saving).

**Verified in `dist/city-river-tour/index.html`:** the preload sits inside `<head>`; the `<img>`
carries `srcset`, `sizes`, `loading="eager"`, and `fetchpriority="high"`.

**Homepage (the other key page):** its hero is currently a **placeholder box** (no real image —
`src/pages/index.astro` "swap for a real WebP asset"), so the homepage LCP is the `<h1>` text and
there is nothing to preload yet. **When the real hero WebP lands, give it the same treatment**
(eager + `fetchpriority="high"` + a `<head>` preload + responsive `srcset`).

---

## 2. ~726 KB unused JavaScript — Ventrata checkout (Best Practices / Performance)

**Identified:** the bundle is Ventrata's checkout script,
`https://cdn.checkout.ventrata.com/v3/production/ventrata-checkout.min.js`. It is **ours to load but
not ours to shrink** — a third-party, minified payment widget.

**It loads site-wide — by design.** Confirmed in `dist/`: the module is present on non-booking pages
too (homepage, `/about`, `/contact`, `/privacy-policy`). This is **AGENTS rule 9** — the persistent
**Book Now** trigger in `<Header>` makes every page booking-capable, so the checkout loader ships
once site-wide (`<VentrataWidget mode="loader">` rendered once in `Header.astro`). Rule 9 explicitly
**supersedes** the earlier "load only on booking pages" guidance.

**Disposition: accepted cost.** Lighthouse reports it as "unused JS" on pages where checkout isn't
opened, which is expected — the widget only executes when Book Now is clicked. We do **not** ship a
second copy (exactly one loader per page), and it is `type="module"` (deferred), so it doesn't
block rendering. Nothing of *ours* contributes materially to the unused-JS figure.

**Stale docs corrected as part of this pass** (they contradicted rule 9 and would mislead a future
change): the `VentrataWidget.astro` header comment ("must never load globally") and the CLAUDE.md
"what not to do" line now both state the site-wide-once rule.

_If the site-wide cost is ever judged too high:_ the lever is a product decision (drop the
persistent Book Now on content pages and load the widget only where a booking CTA exists) — i.e. a
rule-9 reversal, not a code optimisation. Not recommended pre-launch.

---

## 3. Accessibility 87 — our components vs the Ventrata iframe

Audited every component that renders on `/city-river-tour` (Header, Nav, Footer, KeyFacts,
SectionHeading, BookingPanel, VentrataWidget, ProductCard, AttractionCard, FAQSection, ReviewStrip,
GettingHere, StarRating, MapTapActivate) plus BaseLayout and the global-css theme tokens. The split:

**ARIA roles/attributes — clean in our markup.** `aria-controls`/`aria-expanded` on the header
hamburger resolve correctly; `role="region"`+`aria-roledescription="carousel"` (ReviewStrip),
`role="img"`+`aria-label` (StarRating), and `aria-pressed` (DateFinder day buttons) are all valid;
no `aria-hidden` sits on a focusable element.

**Accessible names — clean in our markup.** Every icon-only control is named: the hamburger and
map-tap overlay (`sr-only` / `aria-label`), footer social links (`aria-label`), the ReviewStrip
prev/next/dot buttons (`aria-label`), and the rating block (`sr-only` "Rated 4.5 out of 5"). All
form fields have `<label for>`. Our Ventrata **host** elements are named too (the header Book Now has
visible text; the popup renders a labelled `CTAButton`).

**Fixed (OURS):**
- **Touch targets — Footer social icons** (`Footer.astro`): 20×20px `<a>` with no padding → added
  `p-2` for a ~36px target.
- **Touch targets — Footer stacked links** (`Footer.astro`, Discover/Gallery/Manage): ~20px tall,
  `gap-3` → added `py-1.5` (targets ≥24px) with `gap-1`.
- **Touch targets — ReviewStrip carousel dots** (`ReviewStrip.astro`): 8×8px → content-box padding
  gives a 24px hit box while the visual dot stays 8px (`background-clip: content-box`).
- **Contrast — homepage hero placeholder** (`index.astro`): `text-white/40` (~3.5:1) → `text-white/70`.
  (Off the audited page, but same codebase; the placeholder box disappears once a real hero image
  lands.)

**Not fixable — third-party (report-only, for the Ventrata/Leaflet feedback list):**
- Anything inside the **Ventrata checkout `<iframe>`** — its own inputs, roles, contrast, and target
  sizes are cross-origin and out of our markup. Any Lighthouse a11y hit that resolves to an iframe
  node belongs to Ventrata; raise via the Ventrata questions list (`docs/ventrata-integration.md`).
- **Leaflet** CDN map chrome — the zoom `+/−` controls, attribution link, and the emoji `divIcon`
  route markers (Leaflet makes markers focusable; their name is the raw emoji). Library-rendered;
  if Lighthouse flags a marker, add a `title` per marker via the Leaflet API.

**Watch (not a current failure):** gold `#e8b84b` (`text-accent`) is only ever placed on the navy
background today (≈8:1, passes) — as text on white it would be ≈1.8:1. Keep gold off light
backgrounds. The `SectionHeading` gold bar is a decorative rule (exempt).

**Cosmetic nit (deferred):** `city-river-tour.astro` puts `aria-label` on the bare
`<div id="route-map">` (no role) — ARIA names are ignored on a generic container, so it's a no-op
until Leaflet populates the node. Harmless; the enclosing `<section>` is already labelled.

---

## 4. Per-deploy Lighthouse scoring

Added `@netlify/plugin-lighthouse` in `netlify.toml` (`[[plugins]]`). Netlify auto-installs it from
its registry — **no `package.json` dependency**. It audits two key pages on **every deploy** and
prints the scores in the deploy log (Deploys → a deploy → the "Lighthouse" section):

- `index.html` — homepage (CRT is the default hero, AGENTS rule 3)
- `city-river-tour/index.html` — the LCP-tuned booking page

**Report-only — no `thresholds`, so a low score never fails a deploy.** Rationale: branch/preview
deploys are `noindex` (artificially low SEO), and CI-runner performance varies run to run. The real
**"Lighthouse ≥90 Performance on key pages"** gate is a **human launch check**
(`docs/launch-checklist.md`), read against the **production** deploy's log.
