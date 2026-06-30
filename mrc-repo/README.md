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
```

---

## Environment variables

See `.env.example` for all required variables.

Key variables:
- `VENTRATA_OCTO_KEY` — server-side only, never in client code
- `VENTRATA_CHECKOUT_API_KEY` — safe in DOM, used in widget script tag
- `VENTRATA_ENV` — set to `test` during development, `live` before launch

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
│   │   ├── cruises/      Dynamic tour routes (/cruises/[slug])
│   │   └── discover/     Editorial guide pages
│   └── styles/           Global styles / design tokens
├── netlify/
│   └── functions/        Netlify Functions (OCTO API proxy)
│       ├── products.ts
│       ├── availability.ts
│       └── availability-calendar.ts
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
