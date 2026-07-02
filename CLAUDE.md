# CLAUDE.md — Instructions for Claude Code

This file governs how Claude Code behaves on the Manchester River Cruises website project.
Read this file at the start of every session. Then read only the specific /docs/ file relevant to your current task.

---

## Project overview

Static site for manchesterrivercruises.com built with Astro, hosted on Netlify.
Ventrata is the booking platform — checkout widgets handle all transactions.
Ventrata OCTO API (read-only) powers live availability data via Netlify Functions.

Full brief: `/docs/website-brief.md`

---

## Stack

- **Framework:** Astro (static site)
- **Hosting:** Netlify
- **Serverless functions:** Netlify Functions (for OCTO API proxy only)
- **Language:** Astro / HTML / CSS / TypeScript where useful
- **CSS:** TBC — plain CSS or Tailwind (confirm before writing any styles)
- **Forms:** Netlify Forms
- **Booking:** Ventrata checkout widgets
- **Live data:** Ventrata OCTO API via Netlify Functions only
- **Version control:** Git — small commits per task, one branch per feature

---

## What to read for each task

| Task | Read |
|------|------|
| API / widget work | `/docs/ventrata-integration.md` |
| SEO / metadata / schema | `/docs/seo-pages.md` |
| Missing content / assets | `/docs/content-checklist.md` |
| Images / alt text / WebP | `/docs/image-conventions.md` |
| Launch / redirects / DNS | `/docs/launch-checklist.md` |
| General architecture | `/docs/website-brief.md` |

Do not load every doc on every task. Read the brief first, then only the relevant supporting doc.

---

## Mandatory rules

See `AGENTS.md` for the full list. Key points:

1. Never expose the Ventrata OCTO connection key in client-side code
2. The checkout widget API key may appear in the DOM — the OCTO key must not
3. City River Tour is the default homepage hero — do not change this without explicit instruction
4. All pages need static crawlable copy — not just dynamically loaded content
5. Every page needs title tag, meta description, Open Graph tags, schema, and image alt text
6. Dynamic tour pages must live under `/cruises/[slug]` — never at top level

---

## Build sequence

Work through these steps in order. Complete and commit each before moving to the next.
Do not attempt multiple steps in one session unless explicitly instructed.

1. Repo structure and base Astro setup
2. Global layout — header, footer, navigation, persistent Book Now CTA
3. Placeholder pages for every URL in Section 11.1 of the brief
4. Design tokens — colours, typography, spacing, button styles
5. City River Tour page (first complete page)
6. Ventrata widget placeholders with dummy product IDs
7. Netlify Function stubs — products, availability, availability-calendar
8. What's On page with mock data
9. Replace mock data with live Ventrata API calls
10. SEO metadata and schema — page by page

---

## What not to do

- Do not build the whole site in one prompt
- Do not introduce dependencies not in the stack without asking
- Do not create a top-level `src/pages/[slug].astro` — use `/cruises/[slug]` for dynamic routes
- Do not load the Ventrata checkout script globally — only on pages that need it
- Do not implement the private hire form as a hydrated JS component — it must exist in raw Astro/HTML at build time
- Do not modify global navigation or API functions unless the task explicitly requires it
- Do not expose secrets — all API keys go in `.env` and `.env.example`

---

## Commit discipline

- One commit per completed task
- Commit message format: `task: description` (e.g. `setup: base Astro project and placeholder pages`)
- Never commit `.env` — only `.env.example`
