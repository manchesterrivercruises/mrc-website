# Manchester River Cruises — Website

Static site for [manchesterrivercruises.com](https://www.manchesterrivercruises.com)

Built with Astro, hosted on Netlify. Ventrata handles all booking.

---

## Stack

- **Framework:** [Astro](https://astro.build)
- **Hosting:** [Netlify](https://netlify.com)
- **Functions:** Netlify Functions (Ventrata OCTO API proxy)
- **Booking:** Ventrata checkout widgets
- **CSS:** Tailwind CSS

---

## Local setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Fill in .env with real values (never commit .env)

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Typecheck (same as the PR CI job)
npm run check

# Confirm Keystatic reads the same files the site imports (Node >= 22; the npm
# script passes --experimental-strip-types so it works on 22.6–22.17 too)
npm run verify-cms-wiring

# Pre-cutover only: fail if "TBC" remains in dist HTML (not part of every build)
npm run build && npm run launch-gate
```

---

## Environment variables

See `.env.example` for all required variables.

Key variables:
- `VENTRATA_OCTO_KEY` — server-side only, never in client code
- `VENTRATA_CHECKOUT_API_KEY` — safe in DOM, used in widget script tag
- `VENTRATA_ENV` — `'live'` from checkout-QA onward (`src/data/ventrata.ts`; this example var is not read by the site)

### A note on the key in old git history

Commits before the OCTO key was moved to `.env` contain the string
`a79eba1c-…` in `.env.example` and in early function code.

**That is Ventrata's PUBLIC demo-supplier key** — the "EdinExplore" fictional supplier that
Ventrata publishes in its own OCTO documentation for anyone to test against. It is **not an MRC
credential**, it has never had access to the MRC account, and it returns fictional products
only. There is nothing to rotate and no incident here.

It is recorded because a secret scanner will flag it, and the next person to see a UUID-shaped
key in git history should not have to re-derive whether it mattered. The real MRC OCTO key has
only ever lived in Netlify environment variables and a local `.env` — never in a commit.

---

## Project structure

```
/
├── src/
│   ├── layouts/          Global layout
│   ├── components/       Reusable components
│   ├── pages/            Astro pages (matches URL structure)
│   │   ├── index.astro   Home
│   │   ├── city-river-tour.astro
│   │   ├── events.astro
│   │   ├── tour/         Dynamic tour routes (/tour/[slug] — adopted legacy namespace)
│   │   └── discover/     Editorial guide pages
│   └── styles/           Global styles / design tokens
├── netlify/
│   └── functions/        Netlify Functions (OCTO / reviews proxies)
│       ├── products.ts
│       ├── day-finder.ts
│       ├── event-days.ts
│       └── reviews.ts
├── public/               Static assets
├── docs/                 Project documentation (read by AI tools)
├── CLAUDE.md             Instructions for Claude Code
├── AGENTS.md             Mandatory AI rules
├── .env.example          Environment variable template
└── netlify.toml          Netlify configuration
```

---

## Documentation

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Claude Code instructions |
| `AGENTS.md` | Mandatory AI rules (all tools) |
| `docs/website-brief.md` | Full build brief |
| `docs/ventrata-integration.md` | Ventrata API and widget reference |
| `docs/seo-pages.md` | Page keywords and schema requirements |
| `docs/content-checklist.md` | Outstanding content from Simon |
| `docs/launch-checklist.md` | Pre-launch and cutover checklist |

---

## Build sequence

1. Base Astro setup (current step)
2. Global layout — header, footer, nav, Book Now CTA
3. Placeholder pages — all URLs from `docs/website-brief.md`
4. Design tokens — colours, typography, spacing
5. City River Tour page (first complete page)
6. Ventrata widget placeholders
7. Netlify Function stubs
8. What's On page with mock data
9. Live Ventrata API integration
10. SEO metadata and schema — page by page

---

## Deployment

Connected to Netlify. Pushes to `main` trigger production deploys.
Staging runs on Netlify preview URLs — set to noindex until launch.

DNS cutover: point `manchesterrivercruises.com` CNAME to `[netlify-domain].netlify.app`
