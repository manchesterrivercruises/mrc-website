# Cursor Project Rules

These rules apply to all Cursor AI assistance on this project.
They mirror AGENTS.md — both files must stay in sync.

## Core rules

1. Never expose the Ventrata OCTO connection key in client-side code
2. Checkout widget API key may appear in the DOM — OCTO key must not
3. Do not rebuild Ventrata checkout — use the official widget only
4. API data enhances static content — never replaces it
5. City River Tour is the default homepage hero — do not auto-select via API
6. All pages need static crawlable copy
7. Every page needs: title, meta description, Open Graph tags, schema, image alt text
8. Mobile-first. No blocking scripts above the fold
9. Load Ventrata widget script only on pages that need it
10. Netlify Forms: form must exist in raw HTML at build time
11. No new CMS without approval
12. No new dependencies without approval
13. Context diet: read only the relevant /docs/ file for each task
14. Dynamic routes: /cruises/[slug] only — never top-level [slug].astro

## Scope

Only modify files directly relevant to the current task.
Do not touch global nav, API functions, or other pages unless the task requires it.
Commit after each task with a clear message.

## Full rules

See AGENTS.md for complete rule text.
See CLAUDE.md for build sequence and task guidance.
