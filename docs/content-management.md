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

### Production setup (one-time) — GitHub App

Storage switches to **GitHub** automatically outside local dev (`import.meta.env.DEV` gate in
`keystatic.config.ts`, repo `manchesterrivercruises/mrc-website`). GitHub mode needs a **GitHub
App** and four environment variables.

Graceful states while unconfigured:

- **No `KEYSTATIC_SECRET`** → `astro.config.mjs` doesn't register the Keystatic routes; `/admin`
  shows a "not configured" page (no 500).
- **`KEYSTATIC_SECRET` set but no GitHub App yet** (the current state) → `/keystatic` renders and
  shows **"Log in with GitHub"**, but clicking it would hit Keystatic's GitHub OAuth endpoints,
  which 500 with no App. `src/middleware.ts` intercepts `/api/keystatic/github/*` while
  `KEYSTATIC_GITHUB_CLIENT_ID` is absent and returns a clear "not configured yet" message instead.

> **Do this manually — the wizard does not appear.** With only the secret set on a deployed site,
> Keystatic goes straight to the login UI (no "Create GitHub App" wizard), so create the App by hand.
>
> **Which host?** Use the URL the new site is actually served from — today the Netlify deploy
> **`https://exquisite-gnome-3ca601.netlify.app`** (the `manchesterrivercruises.com` domain still
> serves the old site until DNS cutover). A GitHub App holds **multiple** callback URLs, so add the
> production one too (Step 2, Callback URL) for cutover.

**Step 1 — session secret (already done).** If not: `openssl rand -base64 32`, then Netlify →
**Site configuration → Environment variables → Add** → `KEYSTATIC_SECRET` = the value, marked
**"Contains secret values"**, and redeploy.

**Step 2 — create the GitHub App by hand.** Signed in as an account with admin on the repo:

1. Go to **github.com** → your avatar (top-right) → **Settings**.
2. Left sidebar, bottom → **Developer settings** → **GitHub Apps** → **New GitHub App**.
   (Direct link: `https://github.com/settings/apps/new`.)
3. **GitHub App name:** `MRC Keystatic CMS` (must be globally unique — if taken, append a suffix
   e.g. `MRC Keystatic CMS mrc`). This name becomes the **app slug** you need in Step 4.
4. **Homepage URL:** `https://www.manchesterrivercruises.com`
5. **Identifying and authorizing users → Callback URL:** add
   `https://exquisite-gnome-3ca601.netlify.app/api/keystatic/github/oauth/callback`
   Click **Add callback URL** and add the production one too, for cutover:
   `https://www.manchesterrivercruises.com/api/keystatic/github/oauth/callback`
6. Tick **"Request user authorization (OAuth) during installation"**.
7. **Post installation:** leave defaults.
8. **Webhook:** **uncheck "Active"** (Keystatic needs no webhook).
9. **Permissions → Repository permissions** (leave every other permission at *No access*):
   - **Contents:** **Read and write**
   - **Metadata:** **Read-only** (auto-selected; mandatory)
   - **Pull requests:** **Read-only**
   (These match Keystatic's own GitHub-storage app manifest: `contents: write`, `metadata: read`,
   `pull_requests: read`.)
10. **Where can this GitHub App be installed?** → **Only on this account**.
11. Click **Create GitHub App**.

**Step 3 — get the credentials.** On the new App's **General** page:

- Note the **Client ID** (shown near the top).
- Under **Client secrets**, click **Generate a new client secret** and **copy it now** (shown once).
- The **app slug** is the last path segment of the App's URL:
  `https://github.com/settings/apps/<app-slug>` (the kebab-cased name from Step 2.3).

**Step 4 — map the values to Netlify env vars** (Site configuration → Environment variables → Add),
then redeploy:

| GitHub App value | Netlify env var | Secret? |
|---|---|---|
| Client ID | `KEYSTATIC_GITHUB_CLIENT_ID` | no |
| Generated client secret | `KEYSTATIC_GITHUB_CLIENT_SECRET` | **yes — mark "Contains secret values"** |
| App slug (`…/apps/<app-slug>`) | `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | no (public — safe in the DOM) |

(`KEYSTATIC_SECRET` from Step 1 is the fourth — also **secret**.)

**Step 5 — install the App on the repo.** App page → left sidebar **Install App** → **Install**
next to your account → choose **Only select repositories** → **`manchesterrivercruises/mrc-website`**
→ **Install**. Without this, sign-in can succeed but commits fail with a permissions error.

**Step 6 — redeploy** (Deploys → Trigger deploy → *Clear cache and deploy site*). Open `/keystatic`
and click **Log in with GitHub** — the OAuth flow now completes; edits commit to the repo and
Netlify auto-deploys.

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
