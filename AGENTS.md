# AGENTS.md — Mandatory AI Rules

These rules apply to all AI tools working on this repo (Claude Code, Cursor, or any other agent).
They are non-negotiable. Do not deviate from them without explicit written approval from the project owner.

---

## The 15 Rules

1. **Do not expose the Ventrata OCTO connection key in client-side code.** It must only live in server-side environment variables (Netlify environment or `.env` locally).

2. **The checkout widget API key may appear in the DOM** — it is designed for this and confirmed safe by Ventrata. The OCTO connection key must not appear in the DOM under any circumstances.

3. **Ventrata checkout must be handled by the official widget.** Do not rebuild or replicate the booking flow manually in any framework.

4. **API-driven availability data should enhance the site.** It must not replace static, crawlable SEO content. Every page must have meaningful static copy that exists in the HTML at build time.

5. **City River Tour is the default homepage hero.** The hero product is set in a config file, not auto-selected by the API. Do not change the featured product without explicit instruction from the project owner. **Confirmed:** the homepage hero is and remains City River Tour, chosen in config and never selected by the API.

6. **All product and event pages must include static, crawlable copy** — not just dynamically loaded content. Crawlers must be able to read meaningful content without executing JavaScript.

7. **Every page requires:** unique title tag, meta description, Open Graph tags (og:title, og:description, og:image), schema.org structured data, and descriptive image alt text.

8. **All code must be mobile-first and performance-conscious.** No render-blocking scripts above the fold. Images must be WebP at appropriate sizes.

9. **Ventrata widget scripts must be loaded only on pages that need them.** Implement in line with Ventrata's official embedded/pop-up guidance. Do not globally load the checkout script on every page.

10. **If Netlify Forms is used, the form element must exist in raw Astro/HTML markup at build time**, or include a hidden HTML mirror form with matching field names. Do not implement the private hire enquiry form only as a hydrated client-side component — Netlify's bots scrape at compile time and will miss JS-only forms.

11. **Do not introduce a new CMS** unless explicitly agreed by the project owner in writing.

12. **Do not add unplanned dependencies or external services** without review and approval from the project owner or Jeff.

13. **Use a context diet workflow.** Do not load every documentation file for every task. Start from `/docs/website-brief.md`, then read only the specific supporting document relevant to the current task:
    - `/docs/ventrata-integration.md` for API/widget work
    - `/docs/seo-pages.md` for metadata/schema work
    - `/docs/content-checklist.md` for missing copy and assets
    - `/docs/launch-checklist.md` for redirects, DNS, and launch steps
    - `/docs/content-management.md` for Content Collections and the CMS workflow (coming soon — file to be added)
    - `/docs/integrations.md` for third-party integrations: Mapbox/Leaflet, Google Tag Manager, Ventrata OCTO (coming soon — file to be added)

14. **Dynamic tour pages must be scoped under `/cruises/[slug]`**, not at the top level. A top-level `src/pages/[slug].astro` catch-all in Astro intercepts valid static routes like `/about`, `/contact`, and `/vessels`. Never create top-level dynamic route files.

15. **CSS convention.** Use Tailwind utility classes for layout and spacing; keep design tokens and base styles in `src/styles/global.css`; and extract repeated UI patterns into reusable Astro components under `src/components/`. Never recreate card, button, or heading patterns inline on individual pages — use the shared components (`SectionHeading`, `CTAButton`, `BookingPanel`, `ProductCard`, `AttractionCard`, `FAQSection`, `ReviewStrip`, …) and add new ones there when a pattern repeats.

---

## Scope discipline

When given a task, only modify files directly relevant to that task.
If a task says "build the City River Tour page", do not modify:
- Global navigation
- Netlify Functions
- Other product pages
- `CLAUDE.md`, `AGENTS.md`, or any docs

State what you changed and why in the commit message.
