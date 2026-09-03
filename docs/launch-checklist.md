# Launch Checklist

Complete every item before switching the domain to the new site.

---

## Pre-launch — build complete

- [ ] All pages built and reviewed on mobile and desktop
- [x] PR CI — `.github/workflows/ci.yml` runs `astro check`, `npm run build`, and `npm run verify-cms-wiring` on every pull request (Node 22). Netlify production stays on Node 20. `npm run launch-gate` is **not** in that workflow.
- [ ] All Ventrata widget embed codes in place with live product IDs
- [x] Ventrata widget env set to "live" (not "test") — `VENTRATA_ENV` in `src/data/ventrata.ts`.
  > ⚠ **Widget QA now runs against LIVE checkout — real bookings and card charges are
  > possible.** For any QA booking: use an obviously fake test name (e.g. "TEST TEST"),
  > then **cancel and refund it in the Ventrata dashboard immediately**, or use a 100%-off
  > promo code if one exists. Do not leave live test bookings on real availability.
- [ ] API integration tested — hero, What's On, Events listing pulling live Ventrata data
- [ ] **Live from-pricing on product/event pages** — replace the static `priceFrom` panels (and the hardcoded "from £X" on the SEO landing pages) with live OCTO pricing, keeping the static value as the crawlable SEO / fetch-failure fallback, so displayed prices never drift from checkout. See `docs/ventrata-integration.md` → "Price drift — follow-up". *(Interim: static prices were audited against live OCTO and corrected 2026-07-09; they will drift again until this lands.)*
- [ ] Private hire enquiry form tested end-to-end — submissions arriving at correct email
- [ ] All 301 redirects configured and verified on staging
- [ ] SEO meta tags verified on all pages
- [ ] Open Graph tags verified (og:title, og:description, og:image)
- [ ] Schema.org structured data validated (Google Rich Results Test)
- [ ] XML sitemap generated and accessible at /sitemap.xml
- [ ] robots.txt configured — staging set to noindex, production set to allow
- [ ] Cookie consent (GTM consent mode) live — **and the consent-mode default (`denied`) is set BEFORE the GTM script loads** (the default snippet sits above the GTM container in `<head>`; verify in built HTML the `default … denied` call precedes the GTM `<script>`). See `docs/integrations.md` → Cookie consent.
- [ ] Google Analytics 4 confirmed firing on all pages (only after consent granted)
- [ ] **Lighthouse ≥90 Performance on key pages (mobile)** — homepage and `/tour/city-river-tours`. Every deploy self-reports via `@netlify/plugin-lighthouse` (netlify.toml → Deploys → the deploy's "Lighthouse" section); read the gate against the **production** deploy's log, not a branch/preview build. ⚠ On staging/preview the **SEO** category is artificially low because those contexts are deliberately `noindex` (`[context.*]` in netlify.toml) — judge SEO only on production. Cross-check with Google PageSpeed Insights on the live URL. See `docs/lighthouse-triage.md` for the accepted third-party cost (Ventrata checkout JS) and open items.
- [ ] All images in WebP format at appropriate sizes
- [ ] Staging environment confirmed as noindex before sharing externally
- [ ] Manage My Booking page live and linked from footer
- [ ] **Re-enforce Content-Security-Policy (LAUNCH BLOCKER)** — see section below
- [ ] **Apple Pay domain association file (LAUNCH BLOCKER)** — replace `public/.well-known/apple-developer-merchantid-domain-association.placeholder` with the real file (exact name, no extension) from Ventrata/the payment provider, then verify it returns HTTP 200 post-cutover. See `public/.well-known/README.md` and `docs/ventrata-integration.md`.
- [ ] **TBC launch gate (LAUNCH BLOCKER)** — `npm run build && npm run launch-gate` must exit 0. See section below. Do this **before** flipping `public/robots.txt`.

---

## OCTO function origin gate and rate limiting

All remaining Netlify functions (`day-finder`, `event-days`, `reviews`) reject a request unless its `Origin` **or** `Referer` matches the exact-origin allowlist in `netlify/lib/guard.ts` (`www`, bare domain, `new.` subdomain, current Netlify staging, optional `STAGING_ORIGIN`). (`products.ts` was deleted — it had no caller.)

Every function also declares `allowedQueryKeys` and **rejects an unknown query key with 400 before any upstream call**. That closes a cache-busting amplification: unknown keys form part of the CDN cache key, so `?cb=1`, `?cb=2`, … were unlimited distinct entries that all missed and all paid the full upstream fan-out.

Each function is also backed by a **Netlify Blobs cache** (`netlify/lib/cache.ts`) behind the CDN, so a CDN miss reads one aggregated blob rather than re-paying an ~19-product OCTO fan-out or a *billed* Google Places call.

This all **raises the bar** against casual curl/bot quota burn. It does **not** guarantee anything: both headers are attacker-controlled, and privacy browsers may strip them (those clients then get 403). The in-memory per-IP limiter (~30 req/min) is per warm instance only — it resets on cold start and is not shared across concurrent instances.

### ⛔ LAUNCH BLOCKER — enable Netlify account-level rate limiting

- [ ] **Enable account-level rate limiting on the production site** (Team settings → Rate limiting / WAF) **before public traffic.**

This was previously written up as a "global option… if OCTO quota or function cost is a concern". It is not optional. Everything above is either per-instance (the in-memory limiter, which an attacker defeats by simply spreading requests across cold starts) or defeatable by forging a header (the Origin/Referer gate). **Account-level limiting is the only control here that is durable across instances and not attacker-controlled** — without it there is no real ceiling on what an anonymous caller can spend of our OCTO quota and Google Places billing.

The Blobs cache lowers the cost of each miss but does not cap the request rate, and Places is billed per request on a genuine miss.

A shared store (Blobs / Upstash) counter is the code-side alternative if the account-level control turns out not to be available on the plan — but it is strictly a fallback, not a substitute, since it still runs after the request has reached us.

The unused `availability` / `availability-calendar` **browser proxies** were removed (OCTO `/availability` is still called server-side from `day-finder` / `event-days` via `netlify/lib/octo.ts`).

---

## Form spam protection — reCAPTCHA quota

Both forms (`/contact-us`, `/private-hire`) use **Netlify's native reCAPTCHA 2**
(`data-netlify-recaptcha`) alongside the existing honeypot. Netlify verifies the token
**server-side** before accepting a submission, so a bot POSTing straight to the form endpoint is
rejected there — which the honeypot alone cannot do. Both are kept: they catch different bots and
cost nothing together.

- [ ] **Submit both forms on the deploy preview and confirm the challenge renders and the
      submission arrives.** The widget is injected by Netlify at serve time, so it does **not**
      appear in a local `dist` build — local HTML only proves the attributes are present.

⚠ **Quota exhaustion is the known failure mode.** Netlify's bundled reCAPTCHA runs on Netlify's
own Google account under a shared quota. If it is exhausted — by our traffic or by noisy
neighbours — the challenge stops verifying and **form submissions can start failing**, which for
`/private-hire` means silently losing enquiries. This is not hypothetical; it is the documented
tradeoff of using the bundled integration rather than our own keys.

**Fallback, in order of preference:**

1. **Bring our own reCAPTCHA keys** — create a Google reCAPTCHA site, then set
   `SITE_RECAPTCHA_KEY` and `SITE_RECAPTCHA_SECRET` in Netlify env. Netlify uses ours instead of
   the shared pair, with our own quota. Free, and the markup does not change.
2. **Netlify's paid form-spam add-on** (Forms-level spam filtering) if reCAPTCHA proves too
   much friction for enquiry conversion.

- [ ] Decide before launch whether to ship our own keys from day one. Given `/private-hire` is a
      revenue path, option 1 is cheap insurance and is the recommendation.

- [ ] **Monitor the first fortnight**: check submissions are arriving (post-launch monitoring
      already lists this) and watch for any drop that coincides with the challenge failing.

---

## TBC launch gate

Copy still contains `TBC` placeholders (boarding times, accessibility, vessel details, some FAQ answers, ProductCard image fallbacks). Those strings are crawlable once robots allow indexing.

`npm run launch-gate` walks `dist/**/*.html` and **fails if the string `TBC` appears anywhere**. It is **not** wired into `npm run build` or the PR CI workflow — it would fail every build today.

Before flipping `public/robots.txt`:

```bash
npm run build && npm run launch-gate
```

Clear every hit (CMS page-copy, vessel YAML, component fallbacks such as `imageLabel = 'Image (TBC)'`) and re-run until it exits 0.

### The schema half is ALREADY enforced

`npm run check-schema` (scripts/check-schema.mjs) is the strict subset of this gate, and it runs in
PR CI **today**. It fails if `TBC` appears inside any emitted JSON-LD value, and if any JSON-LD
block does not parse.

The split is deliberate. Visible "(TBC)" is honest — a reader sees the detail is provisional.
The same string inside `<script type="application/ld+json">` is a factual claim made to a search
engine, and Google requires structured data to reflect real page content. So schema is zero-
tolerance from now, while visible copy stays tolerated until cutover.

Pages build their FAQ schema through `schemaSafeFaqs()` (src/lib/pageCopy.ts), which drops
unconfirmed answers from the schema while leaving them on the page — and omits the `FAQPage`
node entirely if nothing survives, since an empty `mainEntity` asserts an FAQ that does not
exist. **As TBC answers get confirmed they rejoin the schema automatically**, with no code
change.

---

## Re-enforce Content-Security-Policy

**Launch blocker.** The CSP in `netlify.toml` is currently emitted as
`Content-Security-Policy-Report-Only` (not enforced). This was done during staging
because an over-strict enforced policy was breaking the Ventrata checkout widget
(blocked connect/frame calls — spinner hung) and the Leaflet maps (blocked
stylesheet — tiles rendered scattered). Report-Only lets the browser report what
*would* be blocked without actually blocking it, so QA can proceed while we learn
the true origin list — particularly from the **live** Ventrata checkout, which may
pull in payment-processor origins (Stripe, Apple Pay, 3-D Secure frames/workers)
that the test/placeholder checkout does not.

All other security headers (HSTS, X-Frame-Options, X-Content-Type-Options,
Referrer-Policy, Permissions-Policy) remain **enforced** — only the CSP is
report-only.

Before cutover:

- [ ] Run live-checkout QA (real Ventrata `env: "live"`) and collect every CSP
      violation report — from the browser console and/or a `report-uri`/`report-to`
      collector.
- [ ] Add any legitimate missing origins (payment processors, additional Ventrata
      sub-origins, etc.) to the relevant directives in `netlify.toml`.
- [ ] Confirm zero violations remain for a full booking flow (browse → add to cart
      → checkout → payment) and for both maps (City River Tour + boat-to-old-trafford).
- [ ] Rename the header back from `Content-Security-Policy-Report-Only` to
      `Content-Security-Policy` in `netlify.toml` (enforce).
- [ ] Re-verify the full booking + payment flow and maps work with the policy
      **enforced** on a deploy preview before promoting to production.

### Google Maps embed — origins to add before enforcing (added 2026-09-02)

`/getting-here` now carries a real Google Maps embed (it replaced a "(TBC)" placeholder tile).
It needs **two** frame-src origins:

```
frame-src … https://maps.google.com https://www.google.com
```

Both, not one: the iframe `src` is `maps.google.com`, which **301s to
`www.google.com/maps/embed`** (confirmed by request), and `frame-src` is enforced against the
redirect target as well as the initial URL. Allowing only the first blanks the map.

Nothing else is required. Our CSP does **not** govern subresources *inside* a cross-origin
iframe — the map tiles, fonts and XHRs load under Google's own document and its own policy —
so no `img-src` or `connect-src` entry is needed for the embed.

⚠ These are **not** in the Report-Only policy yet, so the report-only console will not warn
about them. Enforcing without adding them silently blanks the map.

### Confirmed origins from live violation harvest (report-only console, 2026-07-15)

Live-checkout QA produced real CSP violation reports (report-only mode doing its job).
Fold these concrete directive changes into `netlify.toml` when re-enforcing:

- **`frame-src`** — add `https://www.recaptcha.net` **and** `https://www.gstatic.com`.
  The Ventrata checkout embeds Google reCAPTCHA; enforcing without these two origins
  blocks the reCAPTCHA frame and **breaks payment**.
- **`style-src`** — add `https://fonts.googleapis.com` back, and **`font-src`** — add
  `https://fonts.gstatic.com` back. Ventrata injects its **own** Open Sans stylesheet
  from Google Fonts. Ours (Inter) is self-hosted, so *our* pages need no Google Fonts
  origin — but Ventrata's checkout does, so these two must be present for the widget.
- **Inline-script hashes are stale.** The `script-src` `'sha256-…'` list in
  `netlify.toml` is confirmed stale against the live console. Do **not** hand-patch
  individual hashes — regenerate the whole list from the production `dist/` at
  re-enforcement (audit one-liner in the `netlify.toml` `script-src` comment) and
  replace the block wholesale.

---

## Launch robots.txt

The live `public/robots.txt` is currently the **pre-launch** version (`User-agent: * / Disallow: /`) so the staging build stays out of the index. **Do not change it until cutover.**

**Gate before this flip:** `npm run build && npm run launch-gate` must be green (no `TBC` in built HTML). See "TBC launch gate" above.

At go-live, replace `public/robots.txt` with the block below. It allows all crawlers, explicitly welcomes the major AI crawlers, and points to the sitemap index emitted by `@astrojs/sitemap`:

```txt
User-agent: *
Allow: /

# AI crawlers — explicitly allowed
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: https://www.manchesterrivercruises.com/sitemap-index.xml
```

Note: `@astrojs/sitemap` outputs `/sitemap-index.xml` (which references `/sitemap-0.xml`), so reference the index URL above. An AI-crawler description lives at `/llms.txt`.

---

## URL redirect map

Before cutover, map every current URL to its new equivalent.
Export from Google Search Console or Craft CMS.

| Old URL | New URL | Status |
|---------|---------|--------|
| (export from GSC) | | |

Configure all 301 redirects at Netlify level — not in Ventrata.
Ventrata redirects only fire on 404s, not live page changes.

---

## Cutover sequence

- [ ] Full staging sign-off from Simon
- [ ] 301 redirects confirmed working on staging
- [ ] Ventrata product IDs all live (not placeholders)
- [ ] **Ventrata dashboard toggles enabled** — Allow Gift Voucher (gift flow) and Waitlists (sold-out
  "Notify me" step). See `docs/ventrata-integration.md` → "Ventrata dashboard settings to enable".
- [ ] **DNS at the registrar — both records.** `www` CNAME to the Netlify site, and the
  **apex** (`manchesterrivercruises.com`) pointed at Netlify too. The apex cannot be a CNAME
  (RFC 1034), so use Netlify DNS (an ALIAS/ANAME on their nameservers) or the registrar's
  own apex-flattening record. Getting only `www` up means every apex link and bookmark —
  including the ones in the legacy 301 map — fails to resolve.
- [ ] **Apex → www redirect confirmed at Netlify.** `www` is canonical everywhere on this
  site (`site` in `astro.config.mjs`, every canonical, the sitemap), so the apex must 301 to
  it. Netlify does this automatically once the apex is registered as a domain alias with
  `www` set primary — verify it rather than assume: `curl -sI https://manchesterrivercruises.com`
  should return 301 with `location: https://www.manchesterrivercruises.com/`.
- [ ] **HTTP → HTTPS forced at Netlify.** Enable "Force HTTPS" once the certificate is live.
  HSTS is already sent (`max-age=31536000; includeSubDomains`), but HSTS only protects a
  browser that has *already* seen an HTTPS response — the first plain-HTTP hit still needs a
  server-side 301. Check all four entry points: apex and www, HTTP and HTTPS.
- [ ] SSL certificate provisioned (automatic on Netlify)
- [ ] manchesterrivercruises.com confirmed live on new site
- [ ] Notify current developer — Craft CMS site to be decommissioned
- [ ] New sitemap submitted to Google Search Console
- [ ] Google Search Console monitoring set up for crawl errors
- [ ] **Rich Results Test on the five schema-bearing page types.** Run
  <https://search.google.com/test/rich-results> against the LIVE URLs — a local build can pass
  while production differs (redirects, CSP, or a Netlify transform). One page per schema shape,
  because they fail independently:

  | Page | URL | What must validate |
  |---|---|---|
  | Homepage | `/` | `WebSite` + `TouristAttraction`/`LocalBusiness` with `aggregateRating` |
  | City River Tour | `/tour/city-river-tours` | the flagship product page + breadcrumbs |
  | FAQ | `/faq` | `FAQPage` — confirm it lists only CONFIRMED answers (see the TBC gate below) |
  | Ferry | `/tour/boat-to-old-trafford` | product + `BreadcrumbList` on a nested route |
  | Santa | `/santa-cruise-manchester` | the seasonal landing page's schema |

  `npm run check-schema` already guarantees every block parses and asserts no TBC value, but it
  cannot tell you whether Google *accepts* the shape — that is what this step is for.

---

## Post-launch monitoring (first 2 weeks)

- [ ] Google Search Console — check for crawl errors daily
- [ ] Check key pages ranking for core terms
- [ ] Monitor Ventrata bookings — confirm live widget working correctly
- [ ] Check private hire enquiry form submissions arriving
- [ ] Verify GA4 tracking across all pages
- [ ] Check 301 redirects working for top traffic URLs

---

## Post-launch (not cutover blockers)

These are recorded so they are not mistaken for launch work. Do **not** take them in the cutover window.

- **`@astrojs/netlify` major bump** (and the batched Astro + `@astrojs/*` majors Dependabot already ignores). Held until the site is stable in production. See `docs/post-launch-roadmap.md` → Platform, and `.github/dependabot.yml`.
- **`VentrataWidget.astro` refactor.** The shared checkout component is a ~630-line mega-file (loader + embedded + popup + gift + date-preselect + focus handling). Split by mode after launch; behaviour must stay identical (exactly one loader per page, rule 9).

---

## Notes

- DNS propagation: up to 48 hours. Current Craft CMS site continues serving during this window.
- Do not decommission Craft CMS site until new site is confirmed fully live.
- Keep Craft CMS login credentials until 2 weeks post-launch in case rollback is needed.
