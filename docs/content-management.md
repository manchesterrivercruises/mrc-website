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
| **Gallery albums** | ✅ Full | The driving use case. Cover + per-image are **in-CMS uploads** (`fields.image` → `public/images/gallery/`). Plus per-image alt (required), caption, credit, width/height, orientation, tags, `isFeatured`, `usage` (multiselect); album order, category, related albums, booking CTA, SEO, draft. |
| **Vessels** | ✅ Full | **Seeded** — Princess Katherine, Isabella, Melody, Georgina, Joyce Too. `/our-vessels` renders from this collection. Capacities and features are deliberately blank (unconfirmed); only Isabella has a matched photo. |
| **Attractions** | ✅ Full | **Still empty, and nothing reads it.** Modelled for the City River Tour's "Make a day of it" block; those cards are currently hardcoded copy. Seeding it is pending the second-tour decision — see `docs/second-tour.md`. |
| **Events** | ⏳ Body follow-up | **Hero image is an in-CMS upload** (`fields.image` → `public/images/events/`); rendered markdown bodies still pending — see "Events & Discover follow-up" below. |
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

**Adding a NEW photo to an album — now an in-CMS upload.** In the album's **Images** list, add a
row and use the **Image** field's *upload* button to pick a file from your computer. Do the same for
an album **Cover image**, and for an event **Hero image** (Events → the event → Hero image). On
**Save**, Keystatic commits the file into `public/images/gallery/` (events → `public/images/events/`)
and stores its path automatically — no manual path pasting. Always fill in the **alt text**.

> ⚠ **Size images down before uploading.** v1 stores uploads **as-is** — there is no automatic
> resize/compression at build. Upload **WebP** where you can and keep the longest edge **≤1600px**
> for gallery photos (**≤2000px** for an event hero). Oversized files ship oversized. (The field
> descriptions in the CMS repeat this.) If you have a big batch, Claude Code can still process a folder
> to WebP for you.
>
> **Note on location:** in-CMS uploads land **flat** in `public/images/gallery/` (not the per-album
> subfolders older photos use). Both work and render the same; it's just where new uploads sit.

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
  (SSR) routes, **excluded from the sitemap** (filter in `astro.config.mjs`) and **disallowed in
  `robots.txt`**. Production access is gated by **GitHub auth**.

  **`X-Robots-Tag: noindex` covers the UI paths only** — `/keystatic`, `/keystatic/*`,
  `/admin`, `/admin/*` in `netlify.toml`. This previously read as though the header covered the
  API too. **It does not, and it cannot:** Netlify's custom `[[headers]]` apply to CDN-served
  responses, not to responses produced by a *function*, and `/api/keystatic` is a function. A
  header rule for it would look correct in the config and have no effect at runtime.

  The actual posture for the API path is therefore: **`robots.txt` disallow** (it returns JSON,
  not an indexable document, so there is nothing to rank even if fetched) plus the
  **`SameSite` session cookie** Keystatic sets, which is what actually protects it. Adding a
  `noindex` header there would be theatre.

  The bare `/keystatic` and `/admin` paths also needed their own header rules: Netlify's
  `/keystatic/*` splat does not match the bare path, so the URL people actually land on was
  shipping without the header until 2026-09-03.
- **CSP:** the site-wide policy is currently **Report-Only**, so it does **not** block the React
  admin UI today (confirmed).

### Known upstream issue — Keystatic OAuth `state` / login CSRF

**Status: upstream, low impact, tracked. Not a finding to re-raise.**

Recorded here so the next security pass recognises it as known rather than discovering it fresh.

**What it is.** Keystatic's GitHub OAuth login flow does not bind the OAuth `state` parameter to
the user's session the way the spec intends. In principle that allows a *login CSRF*: an
attacker who can get a victim to follow a crafted callback URL could sign the victim's browser
into the **attacker's** GitHub account on our admin, rather than the victim's own.

**Why the impact is low here.**

- It is **login** CSRF, not account takeover. It cannot sign an attacker into *Simon's* account,
  read his session, or exfiltrate a token. The damage is a confusing session, not stolen access.
- Our admin has a **tiny, closed user set** — the people with repo access. There is no signup,
  no untrusted user pool, and everything the CMS can do is already gated by GitHub App
  authorisation on top.
- Any commit it produced would be attributed to the *attacker's* GitHub account and land as a
  visible commit on `main`, which is monitored (and is exactly what the offboarding checklist
  says to watch).
- Exploiting it needs the victim to follow an attacker-crafted URL while an admin session is in
  flight — a narrow window against a handful of known people.

**Why we are not patching it.** The flow lives inside `@keystatic/core`, not in our code. There
is no supported configuration hook to change it, so a fix means forking or monkey-patching a
dependency that Dependabot updates regularly — materially worse for security than the issue
itself.

**What we do instead.**

- Keep `@keystatic/core` current (Dependabot already tracks it; 0.6.9 as of 2026-09-02) so an
  upstream fix arrives on its own.
- Watch `main` for unexpected commits — already a step in `docs/offboarding-checklist.md`.
- Re-check on any major Keystatic bump: if upstream fixes it, this note goes.

---

## Implementation — Phase 2.5 (site settings + page copy) — DONE 2026-08-03

Phase 2 made *content* editable. Phase 2.5 extends that to **site furniture** and to the
**copy inside bespoke pages**, which until now was hardcoded in `.astro` templates.

### Site settings singleton

**Keystatic → "Site settings"** → `src/data/site-settings.json`.

| Editable | Not editable (stays in code) |
|---|---|
| Business name, email, phone | `url` — the canonical origin. Deploy/DNS config, not copy; changing it rewrites every canonical, OG and schema URL. |
| Address (street, town, postcode, country) | `geo` — schema.org coordinates. A typo silently breaks map/rich results with no visible symptom in the CMS. |
| Social URLs (Facebook, Instagram, TikTok, Tripadvisor) | `rating` — `aggregateRating` must reflect the real Google listing; editing it freehand risks misrepresenting review data. |
| Footer tagline | **Navigation and footer link architecture** — see below. |

**Navigation stays in code, deliberately.** `src/components/Nav.astro` and the footer's link
columns are *routes and layout*, not copy. A CMS field that can point a nav item at a
non-existent path produces a 404 no editor can debug, and the link set is load-bearing for the
URL parity work (`docs/url-parity.md`). Same reasoning is recorded in the config description in
`keystatic.config.ts`, so the next person reads it where they'd change it.

**NAP stays single-source.** `src/data/site.ts` still exports the same `site` object with the
same shape — it now reads the JSON and *derives* the values that must never drift:

- `phoneHref` is generated from `phone` (there is no second field to forget).
- `addressDisplay` is built from the same parts schema.org consumes, so the footer line and the
  structured address cannot disagree.

Everything downstream — the footer, `GettingHere`, the contact page, and every schema.org block
— is unchanged and still imports `site`.

**Why a synchronous JSON import rather than a content collection:** `site` is imported at the top
level of layouts, components and lib modules (`src/lib/breadcrumbs.ts` among them, which cannot
`await`). Astro's content APIs are async, so a collection would force `await getEntry(...)` into
~34 call sites. A build-time JSON import keeps one source of truth with zero churn. This is why
both singletons use `format: { data: 'json' }` and not YAML — Vite imports `.json` natively.

### Extracting a page's copy into the CMS — the recipe

Pilot: **Private Hire** (`src/pages/private-hire.astro` → `src/content/page-copy/private-hire.json`).
The pilot originally used one singleton per page; that was replaced by the **Page copy
collection** before the other extractions landed — the steps below are the current recipe.

1. **Split copy from structure.** Copy = anything a reader sees: headings, paragraphs, list
   items, button labels, FAQ items, image alt text, SEO title/description. Structure = layout,
   components, icons, CSS classes, **every `href`**, widgets and forms. Only copy moves.
2. **Create the JSON** at `src/content/page-copy/<page>.json` with the current strings *verbatim*
   — including any `(TBC)` markers, which stay as ordinary editable text so Simon can clear them
   in the CMS as real copy lands. The `"page"` value MUST equal the filename; the template
   imports the file directly, so a drifting slug breaks the import.
3. **No new Keystatic config is needed** — the `pageCopy` collection already covers
   `src/content/page-copy/*`. Fit the page to the shared shape (`sections`, `lists`, `cards`,
   `faqGroups`, `strings`) rather than inventing fields.
4. **Import it in the template** (`import copy from '../content/page-copy/<page>.json'`) and
   read it through `src/lib/pageCopy.ts` — `sec()`, `para()`, `list()`, `cards()`, `card()`,
   `faqs()`, `str()`, `fill()`. Every lookup is strict: a missing key throws at build time naming
   the page and key, so a typo fails the build instead of rendering an empty heading.
5. **Verify losslessly** — build before and after, and diff the rendered *text*, JSON-LD,
   meta/link/image attributes and every anchor href+label, not the raw HTML (JSX reformatting
   changes whitespace but not output).
6. **Run `node scripts/verify-cms-wiring.mjs`** — it reads the new entry through Keystatic's own
   reader and asserts it matches the file the site imports.

Three sub-patterns the pilot establishes:

- **Prose containing a cross-link** — split into `…Before` / `…LinkText` / `…After` fields. The
  wording is editable; the `href` stays in code.
- **Copy paired with a fixed icon** (the key-facts strip) — the CMS holds a fixed-length list of
  labels; the template zips them against a code-owned icon array by position.
- **Form option lists stay in code.** They are submitted *values* that Netlify notifications and
  downstream routing key off, not display copy. Only the form's heading and success message moved.

### Where page copy lives — current state

The **Page copy** collection (one entry per page) is the home for editable page wording. It
replaced the per-page singleton approach, which would have buried the sidebar.

**Extracted — editable in the CMS now (Page copy → …):**

| Page | Entry |
|---|---|
| `/private-hire` | `private-hire` |
| `/about` | `about` |
| `/contact-us` | `contact-us` |
| `/faq` | `faq` |
| `/manage-bookings` | `manage-bookings` |
| `/plan-your-visit` | `plan-your-visit` |
| `/salford-quays` | `salford-quays` |
| `/events` | `events` |
| `/music-cruises-manchester` | `music-cruises-manchester` |
| `/` (homepage) | `home` |
| `/tour/city-river-tours` | `city-river-tours` |
| `/tour/boat-to-old-trafford` | `boat-to-old-trafford` |
| `/tour/boat-to-old-trafford/<point>` | `boat-to-old-trafford-point` (**one entry serves both departure points** — see below) |
| `/groups` | `groups` |
| `/christmas-cruises-manchester` | `christmas-cruises-manchester` |
| `/gift-vouchers` | `gift-vouchers` |
| `/party-boat-manchester` | `party-boat-manchester` |

**Nothing is queued.** Every bespoke page whose copy was ever earmarked for extraction is done.

**One template rendered many times → ONE entry with placeholders.** The two ferry departure
points are the same page rendered twice, so their entry writes each sentence once with
`{name}` / `{location}` / `{otherName}` / `{otherLocation}` / `{price}` placeholders, filled from
`src/data/mufcFerry.ts` by `fill()` in `src/lib/pageCopy.ts`. Editing a sentence changes it for
both departures — that is the intent. If the two ever need genuinely different wording they need
separate entries, not a forked template. `fill()` is strict: an unknown placeholder throws at
build time naming the token, so a mistyped `{nmae}` fails the build rather than reaching a
customer.

**Code-only, and deliberately so:** `/whats-on` (a live availability feed with no standing copy),
`/santa-cruise-manchester`, `/private-boat-hire-manchester`, `/getting-here`, `/accessibility`,
`/gallery`, `/discover`, `/privacy-policy` and `/terms-conditions`. The last two are legal text
that should change only under review, not in a CMS field.

`/our-vessels` is also code-only **as a page** — its heading, labels and CTA stay in the template
— but the fleet itself is no longer hardcoded: the five vessels render from the **Vessels
collection** (Content → Vessels). The content on that page was always the boats, not the chrome.

**To change copy on a code-only page:** send the wording to Claude Code (or note it in
`docs/content-checklist.md`) and it ships as a normal PR — usually minutes.

Product/event pages (`/tour/<slug>`) are **already** fully editable via the Events collection —
they are not in either list above.

### What stays in code permanently

Extraction moves *wording*. These surfaces are structural and stay in the template no matter how
many pages are extracted:

- **Navigation and footer link architecture** — routes and layout. A CMS-editable path can 404 in
  a way no editor can debug.
- **Every `href`.** Where prose contains a link, the wording either side is editable and the
  destination is not. Card destinations live in a code-side map keyed off the card key.
- **Redirects** (`netlify.toml`) and the **OCTO proxy functions** (`netlify/functions/`).
- **schema.org / JSON-LD**, and the breadcrumb trails.
- **Live data** — Ventrata + OCTO availability, real prices, the What's On and date-finder product
  maps, the City River Tour route/sights data, and any list generated from a content collection.
- **Forms**: field names, option values and the Netlify `action`. Those are submitted data that
  notifications and routing key off, not display copy. Only headings and success messages moved.
- **Icons, CSS and component choice.** Where copy pairs with a fixed icon (the key-facts strips),
  the CMS holds the labels and the template zips them against a code-owned icon array by position.
- **Derived values** — anything computed from another source stays computed, so it cannot drift:
  the review score/count from `site.ts` (the City River Tour's visible rating block reads it too,
  so the page and its `aggregateRating` cannot disagree), the homepage fleet count from the
  vessels collection, the City River Tour's "View all N sights" from `tour-stops.json`,
  `phoneHref` from
  `phone`, `addressDisplay` from the address parts.

### Admin sidebar organisation

```
Content      Gallery albums · Events · Discover guides · Vessels · Attractions
Page copy    Page copy          (one entry per page, named for the page)
Site-wide    Site settings      (NAP, socials, footer tagline)
```

Ordered by how often Simon touches them: routine content first, page wording next, site-wide
settings last — rarely changed and the easiest to get wrong.

### A note on prices in copy

Some extracted copy contains prices ("From £30 per person", "From £20 (TBC)"). Those are **display
copy only** — they do not drive checkout. **Ventrata is the source of truth.** The CMS field
descriptions say so explicitly, because a price edited here without a matching change in Ventrata
means the page advertises one price and charges another.

### Verifying the CMS wiring

```
node scripts/verify-cms-wiring.mjs
```

Reads both singletons through Keystatic's **own reader** — the same path/format resolution the
admin uses — and asserts the data matches the files the site imports. Run it after adding or
moving any singleton. It catches the `<path>.json` vs `<path>/index.json` trap directly.

> ⚠ **The admin UI cannot currently be opened in local dev.** `/@id/astro:scripts/before-hydration.js`
> returns 500 with `Missing field \`moduleType\`` from rolldown's react-refresh wrapper, so no
> React island hydrates. **This reproduces on a clean checkout with all CMS changes stashed** — it
> is an Astro/rolldown toolchain issue, not a config one, and it does not affect the production
> build (which compiles and renders fine). Until it is resolved, verify CMS wiring with the script
> above and edit content in production (GitHub mode) or by editing the JSON directly.

### Follow-ups (documented, not done this pass)

1. **Events & Discover follow-up.** These collections have rendered markdown bodies (`<Content/>`),
   which Keystatic can only manage as Markdoc (`.mdoc`). Modelling them needs `@astrojs/markdoc`
   (a new dependency → needs sign-off per the stack rules) plus converting those `.md` files to
   `.mdoc` and updating the two loaders. **Dates stay non-editable** regardless — Ventrata owns
   event dates via OCTO; the events schema's legacy `startDate`/`endDate` are unused and must not
   be exposed as CMS fields.
2. **Image handling.** ✅ **In-CMS upload is DONE (2026-07-21).** Gallery `coverImage` + per-image
   `src`, and event `heroImage`, are now Keystatic `fields.image` uploads — files commit to
   `public/images/gallery/` and `public/images/events/`. To make this safe, the six legacy external
   hotlinks (MRC-owned images on the old assets host) were downloaded to local files first, so every
   value is a real repo file. New uploads land **flat** in `public/images/gallery/`; legacy per-album
   nested paths still render and round-trip.
   - ⏳ **Still a follow-up: build-time optimisation.** Uploads are stored **as-is** — `astro:assets`
     does not optimise files referenced by a public/ path string, so there's no automatic
     resize/re-encode. v1 mitigates with max-dimension guidance in the field descriptions (≤1600px
     gallery / ≤2000px hero, WebP). To add real optimisation, migrate these collections to Astro's
     `image()` pipeline (images under `src/`, schema uses `image()`), or add a small `sharp` build
     step over the uploads directory.
   - ⚠ **Admin smoke-test after deploy:** open an album that still uses **legacy nested paths** in the
     live GitHub-mode admin and confirm saving it doesn't rewrite those paths (local dev round-trips
     them fine; verify once in production before the editor relies on it).
3. **CSP at enforcement.** When the CSP is switched from Report-Only to enforced at launch, give
   `/keystatic*` its own relaxed policy — the admin loads React and talks to `github.com` /
   `api.github.com` for OAuth + commits (the strict `default-src 'self'` would block it).
4. **Local-dev admin is broken by a toolchain bug** (see the callout above): rolldown's
   react-refresh wrapper throws `Missing field \`moduleType\``, so React never hydrates at
   `/keystatic`. Reproduces on a clean checkout. Needs an Astro/Vite/rolldown version bump to fix —
   a dependency change, so it needs sign-off per the stack rules. **Confirm the GitHub-mode admin
   works in production before Simon relies on the CMS**, since that path was never exercised
   locally for these two singletons.
5. ~~**Finish the page extractions.**~~ ✅ **DONE.** All seventeen entries are in place; the
   outstanding list is empty. Every page was verified lossless before it landed — build before and
   after, then diff the rendered TEXT, JSON-LD, meta/link/image attributes and every anchor
   href+label, rather than raw bytes (moving copy into JSON reflows the JSX, so whitespace changes
   legitimately while output must not). Across all six extraction commits the diff was zero on all
   66 pages.

6. **Seed the attractions collection.** Not started, and deliberately so — the decision is
   pending on the second tour (`docs/second-tour.md`). With one departure point a collection buys
   little over the six hardcoded day-out cards; with two, "what's nearby" becomes genuinely
   per-departure and the collection needs a `location` tag (`quays` | `city-centre`).

7. **Vessel content.** The five entries exist but carry TBC descriptions, no capacities, no
   feature lists and — apart from Isabella — no photography. Those are content asks for Simon, not
   code (`docs/content-checklist.md`).
