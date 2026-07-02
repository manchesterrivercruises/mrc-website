# Launch Checklist

Complete every item before switching the domain to the new site.

---

## Pre-launch — build complete

- [ ] All pages built and reviewed on mobile and desktop
- [ ] All Ventrata widget embed codes in place with live product IDs
- [ ] Ventrata widget env set to "live" (not "test")
- [ ] API integration tested — hero, What's On, Events listing pulling live Ventrata data
- [ ] Private hire enquiry form tested end-to-end — submissions arriving at correct email
- [ ] All 301 redirects configured and verified on staging
- [ ] SEO meta tags verified on all pages
- [ ] Open Graph tags verified (og:title, og:description, og:image)
- [ ] Schema.org structured data validated (Google Rich Results Test)
- [ ] XML sitemap generated and accessible at /sitemap.xml
- [ ] robots.txt configured — staging set to noindex, production set to allow
- [ ] Google Analytics 4 confirmed firing on all pages
- [ ] Page speed tested — target 90+ on Google PageSpeed Insights
- [ ] All images in WebP format at appropriate sizes
- [ ] Staging environment confirmed as noindex before sharing externally
- [ ] Manage My Booking page live and linked from footer

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
