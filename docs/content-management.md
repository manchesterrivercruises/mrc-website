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
