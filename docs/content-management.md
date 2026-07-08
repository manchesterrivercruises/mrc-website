# Content Management Strategy

This document records the agreed approach to content management for the MRC website.
Read this before building any new page types or adding a CMS.

## Current state

All content is hardcoded in .astro files. To change any content — pricing, descriptions, event dates — a file must be edited, committed, and pushed. This is acceptable during the initial build phase but is not a long-term solution.

## Agreed approach

### Phase 1 — During build (now)
Use Claude Code for all content changes. Low friction while the site structure is still being defined. No CMS added yet.

### Phase 2 — Before launch
Add a git-based CMS (Keystatic or Tina CMS) to give Simon a web admin interface for routine content updates. Free, works natively with Astro and Netlify, auto-deploys via Netlify on save. Do not add a headless CMS (Sanity, Contentful etc.) without explicit approval.

## Critical instruction for Jeff — use Astro Content Collections

All page types that need regular updates must use Astro Content Collections: discover guides, events, FAQ, vessels, bar menu, group travel. If built as hardcoded .astro files, adding a CMS later requires a rewrite.

Collections already set up in src/content/config.ts: discover, events, attractions, vessels.

## Content that needs to be editable

Event dates and details — High frequency — must use Content Collections
Discover guides — Medium — must use Content Collections  
Pricing — Low but critical — hardcoded acceptable short-term
FAQ — Low — hardcoded acceptable short-term
Bar/drinks menu — not yet built — use Content Collections
Group travel page — not yet built — use Content Collections

## CMS implementation — when ready

1. Choose Keystatic (simpler) or Tina CMS (more visual)
2. Install against existing Content Collections
3. Deploy to Netlify — /admin route available on live site
4. Simon logs in with GitHub credentials, edits content without touching code

Estimated: 1 day of Jeff's time once Content Collections are in place.

## What NOT to do

Do not build event or guide pages as hardcoded .astro files with inline content
Do not introduce Sanity, Contentful, or Prismic without approval
Do not add WordPress or Craft CMS

---

## Implementation — Phase 2 (Keystatic) — DONE 2026-07-08

Keystatic is installed and wired against the existing Content Collections. New dependencies:
`@keystatic/core`, `@keystatic/astro`, `@astrojs/react`, `react`, `react-dom`.

### What's editable in the CMS now

| Collection | In Keystatic? | Notes |
|---|---|---|
| **Gallery albums** | ✅ Full | The driving use case. Every field: per-image alt (required), caption, credit, width/height, orientation, tags, `isFeatured`, `usage` (multiselect); album order, category, cover, related albums, booking CTA, SEO, draft. |
| **Vessels** | ✅ Full | Empty collection — new fleet pages are created here. |
| **Attractions** | ✅ Full | Empty collection. |
| **Events** | ⏳ Follow-up | Have rendered markdown bodies; see "Events & Discover follow-up" below. |
| **Discover guides** | ⏳ Follow-up | Same — need `@astrojs/markdoc`. |

Gallery / vessels / attractions are frontmatter-only, so they are stored as **YAML** data files
(`src/content/<coll>/*.yaml`) — Keystatic cannot write plain `.md`. The Astro loaders in
`src/content/config.ts` read `**/*.yaml` for these three; the schemas are unchanged. The gallery
was converted from `.md` to `.yaml` losslessly (no bodies).

**Verified:** Keystatic's reader parses all 15 real albums with every typed field intact
(`isFeatured`, `usage` multiselect, width/height, orientation, tags), covers and per-album image
paths and legacy hotlinks all round-trip, and the admin UI mounts at `/keystatic`.

### Simon's workflow (routine gallery edit)

1. Go to **manchesterrivercruises.com/admin** (redirects to `/keystatic`) and **sign in with GitHub**.
2. Open **Gallery albums** → pick an album (e.g. *Adele Cruise*).
3. Edit as needed — fix alt text, tweak a caption, reorder images (drag), toggle **Featured**,
   set **Usage**, change the cover, reorder the album (**Order**).
4. Click **Save**. Keystatic commits the change to the repo on your behalf; **Netlify auto-deploys**
   in ~1–2 minutes and the change is live.

**Adding a NEW photo to an album** (until in-CMS upload lands — see follow-ups): process the
photo to WebP (800px card + ≤1600px large) and drop it in `public/images/gallery/<album>/`, then
in the CMS add an image row and paste its path + write the alt. (Ask Claude Code to process/place
a batch and you just fill in alt/caption.)

### Local editing (no GitHub needed)

`npm run dev`, then open `http://localhost:4331/keystatic` (or your dev port). In dev, Keystatic
uses **local storage** — saves write straight to your working tree (no login). Commit/push as normal.

### Production setup (one-time)

Storage switches to **GitHub** automatically in production (`import.meta.env.DEV` gate in
`keystatic.config.ts`, repo `manchesterrivercruises/mrc-website`). On first visit to `/keystatic`
in production, Keystatic walks you through creating a **GitHub App**; then set these in the Netlify
site environment (documented in `.env.example`): `KEYSTATIC_GITHUB_CLIENT_ID`,
`KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET`, `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`.

### Security / SEO

- `/admin` → `/keystatic` (301). The UI (`/keystatic`) + API (`/api/keystatic`) are on-demand
  (SSR) routes, **excluded from the sitemap** (filter in `astro.config.mjs`), **disallowed in
  `robots.txt`**, and carry **`X-Robots-Tag: noindex`** (netlify.toml). Production access is gated
  by **GitHub auth**.
- **CSP:** the site-wide policy is currently **Report-Only**, so it does **not** block the React
  admin UI today (confirmed).

### Follow-ups (documented, not done this pass)

1. **Events & Discover follow-up.** These collections have rendered markdown bodies (`<Content/>`),
   which Keystatic can only manage as Markdoc (`.mdoc`). Modelling them needs `@astrojs/markdoc`
   (a new dependency → needs sign-off per the stack rules) plus converting those `.md` files to
   `.mdoc` and updating the two loaders. **Dates stay non-editable** regardless — Ventrata owns
   event dates via OCTO; the events schema's legacy `startDate`/`endDate` are unused and must not
   be exposed as CMS fields.
2. **Image handling & follow-ups.** Gallery cover/image paths are **text** fields (they span
   several folders + some hotlinks, which a single-directory Keystatic image field would corrupt on
   save). So there is no in-CMS *upload* for gallery yet, and CMS-referenced images are **served
   as-is** (the pre-processed WebP already are; any new originals would not be optimised). To add
   in-CMS upload + build-time WebP optimisation, either consolidate gallery images under one
   directory and use `fields.image`, or add a small sharp build step over an uploads folder, or
   migrate the gallery to Astro's `image()` pipeline. (Vessels/attractions already use
   `fields.image` uploads — greenfield, single directory each.)
3. **CSP at enforcement.** When the CSP is switched from Report-Only to enforced at launch, give
   `/keystatic*` its own relaxed policy — the admin loads React and talks to `github.com` /
   `api.github.com` for OAuth + commits (the strict `default-src 'self'` would block it).
