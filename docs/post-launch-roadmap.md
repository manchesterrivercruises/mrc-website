# Post-launch roadmap

Candidate work for after launch, grouped by primary value. Each item is a one-paragraph spec —
enough to scope and prioritise, not a build plan. Nothing here is committed; sequence and cut are
the project owner's call. Cross-references: `docs/ventrata-integration.md`, `docs/launch-checklist.md`,
`docs/photo-inventory.md`.

## Revenue

**AI chat assistant.** A site chat widget backed by the Claude API through a Netlify function,
grounded **only** in this site's own content plus **live OCTO availability** read through the
existing availability functions (`day-finder` / `availability`) — no open-web answers. It answers
"what's on / when / how much / is X available", then **deep-links into Ventrata checkout** via the
established marketing-link pattern (`?openWidget=true&date=…`) for the relevant product. It **never
handles payment or PII** — booking always happens in the Ventrata widget. Guardrails: refuse
off-topic asks, cite the page it drew from, and fall back to "browse What's On" on any uncertainty.

**Abandoned-basket recovery.** Re-engage drop-offs using **Ventrata's Order Recovery** emails
alongside **Klaviyo** flows, **reconciled so a customer never gets double-sent** (one system owns
the send per stage; the other suppresses). Needs a clear rule for which platform triggers when, and
event/identity mapping between Ventrata carts and Klaviyo profiles. Measures recovered revenue per
channel.

**Gift voucher landing page.** A dedicated `/gift-vouchers` conversion page using Ventrata's
`openGiftFlow` deep links to open the gift-purchase flow. **Pre-Christmas priority** (seasonal
revenue window). Copy + imagery around gifting occasions; clear "buy a voucher" CTAs wired to the
gift flow, with amounts/experiences surfaced.

**Weather-aware booking strip.** A small forecast panel **beside the date selection** (date finder /
booking) showing the outlook for the chosen day from a forecast API, nudging good-weather dates. Cache
the forecast server-side (Netlify function) to respect rate limits; keep it advisory (never blocks
booking) and degrade silently if the API is down.

**Live from-pricing on product pages.** Replace the static `priceFrom` panels with **live OCTO
pricing** (via the `products` function's `pricingFrom`), keeping the static value as the crawlable
SEO / fetch-failure fallback — so displayed "from £X" never drifts from checkout. Carried over from
`docs/launch-checklist.md` and the price-drift follow-up in `docs/ventrata-integration.md`.

**Live next-departure countdown on homepage.** A "next sailing in HH:MM" element on the homepage fed
by **day-finder** data (today's departures), turning live availability into urgency. Static
crawlable fallback copy; updates client-side; hides gracefully when nothing sails today.

## Experience

**Live boat tracking ("where's my boat").** A Leaflet page showing each vessel's live position, fed
by **per-vessel GPS** through a **position-relay Netlify function** (devices POST location; the page
polls a read endpoint). **Prerequisite: a GPS source on each vessel + the operational discipline to
keep it powered/reporting** — without reliable feeds this misleads customers, so it's gated on that
being solved first. Reuses the existing Leaflet + tap-to-activate map patterns.

**Post-cruise review funnel.** A **Klaviyo** post-cruise flow that routes happy guests to **Google
reviews** (and captures the rest privately for service recovery). New Google reviews then **feed the
live review carousel** already on the site (`ReviewStrip`, live mode). Needs the post-cruise trigger
(booking → attended → send) and review-link routing.

**Commentary audio samples on the route page.** Short audio clips on the City River Tour route page
so visitors can hear the onboard commentary before booking. **The asset already exists** — the
43-stop GPS-triggered commentary — so this is selecting a few representative stops, clearing rights,
and adding an accessible audio player (transcript + captions) tied to the route map stops.

**Meet the Crew page.** A crew page — **reviews repeatedly praise crew by name**, so put faces and
short bios to those names. Photography + short profiles; cross-links from About and product pages.
Low-tech, high-warmth; a natural home for the crew imagery in the shoot archive.

**Gallery tile-mosaic hero.** The parked upgrade to the gallery hero: replace the DOM collage with a
**single build-time-composed tile mosaic** rendered to one optimised image. Gated on the owned
library reaching **~100+ images** (see `docs/photo-inventory.md`) so the mosaic has enough strong
tiles to fill.

**Deeper album curation from existing shoot archives.** Pull more of the best owned frames into the
gallery albums using the `scripts/ingest-images.mjs` tool — the event shoots (Adele/Elvis/Soul/
Tina/80s), the Meet-Santa sets, and General/Drone scenery all have more usable frames than are
currently ingested. Pure content work; no new tech.

## Operational

**Crew ops dashboard.** A staff-only view of **today's manifests / passenger lists from Ventrata** so
crew can see who's booked on each sailing. **API scope is TBC** — add "manifest / order-list read
scope for a crew dashboard" to the **Ventrata questions list** (`docs/ventrata-integration.md`)
before building. Needs auth (staff-only), and careful PII handling (server-side only, never indexed).

## Platform

**Keystatic in-CMS image upload + optimisation pipeline.** Let editors upload images directly in
Keystatic (rather than pasting paths), with a **build-time WebP optimisation** step (card + large
variants, as the ingest tool produces). Options in `docs/content-management.md`: consolidate gallery
images under one directory + `fields.image`, a small sharp build step over an uploads folder, or
migrate the gallery to Astro's `image()` pipeline. Removes the manual "process + place, then paste
path" step.

**Astro major upgrade.** Take the **deferred Dependabot major bumps** (Astro + integrations) on a
branch, run the full build + Keystatic/Markdoc verification, and merge once green. Batched
deliberately out of the launch window; revisit once the site is stable in production.

**i18n revisit.** Reassess internationalisation **against real post-launch GA4 language data** — if a
meaningful share of traffic is non-English, scope translated routes/content; if not, defer. Decision
driven by data, not assumption.
