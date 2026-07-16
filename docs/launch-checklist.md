# Launch Checklist

Complete every item before switching the domain to the new site.

---

## Pre-launch — build complete

- [ ] All pages built and reviewed on mobile and desktop
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
- [ ] **Lighthouse ≥90 Performance on key pages (mobile)** — homepage and `/city-river-tour`. Every deploy self-reports via `@netlify/plugin-lighthouse` (netlify.toml → Deploys → the deploy's "Lighthouse" section); read the gate against the **production** deploy's log, not a branch/preview build. ⚠ On staging/preview the **SEO** category is artificially low because those contexts are deliberately `noindex` (`[context.*]` in netlify.toml) — judge SEO only on production. Cross-check with Google PageSpeed Insights on the live URL. See `docs/lighthouse-triage.md` for the accepted third-party cost (Ventrata checkout JS) and open items.
- [ ] All images in WebP format at appropriate sizes
- [ ] Staging environment confirmed as noindex before sharing externally
- [ ] Manage My Booking page live and linked from footer
- [ ] **Re-enforce Content-Security-Policy (LAUNCH BLOCKER)** — see section below
- [ ] **Apple Pay domain association file (LAUNCH BLOCKER)** — replace `public/.well-known/apple-developer-merchantid-domain-association.placeholder` with the real file (exact name, no extension) from Ventrata/the payment provider, then verify it returns HTTP 200 post-cutover. See `public/.well-known/README.md` and `docs/ventrata-integration.md`.

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
- [ ] DNS updated at domain registrar — CNAME to Netlify
- [ ] SSL certificate provisioned (automatic on Netlify)
- [ ] manchesterrivercruises.com confirmed live on new site
- [ ] Notify current developer — Craft CMS site to be decommissioned
- [ ] New sitemap submitted to Google Search Console
- [ ] Google Search Console monitoring set up for crawl errors

---

## Post-launch monitoring (first 2 weeks)

- [ ] Google Search Console — check for crawl errors daily
- [ ] Check key pages ranking for core terms
- [ ] Monitor Ventrata bookings — confirm live widget working correctly
- [ ] Check private hire enquiry form submissions arriving
- [ ] Verify GA4 tracking across all pages
- [ ] Check 301 redirects working for top traffic URLs

---

## Notes

- DNS propagation: up to 48 hours. Current Craft CMS site continues serving during this window.
- Do not decommission Craft CMS site until new site is confirmed fully live.
- Keep Craft CMS login credentials until 2 weeks post-launch in case rollback is needed.
