# Marketing & Platform Integrations

Read this before adding any tracking scripts, chat widgets, or marketing platform connections.

## Architecture — GTM first

Google Tag Manager is the single integration layer for all marketing and analytics tags. One GTM script in BaseLayout. Everything else managed in GTM dashboard — no code changes needed when adding or swapping platforms.

BaseLayout → Google Tag Manager → GA4, Facebook Pixel, Klaviyo tracking, Trengo (seasonal)

Exception: Ventrata stays as direct embed code — it is a booking widget not a marketing tag.

## Status

Google Tag Manager — To implement — Critical — Direct in BaseLayout
Google Analytics 4 — Planned, awaiting measurement ID — High — Via GTM
Facebook Pixel — Definite — High — Via GTM
Klaviyo — In use, needs website integration — High — Footer signup direct, tracking via GTM
Cookie consent — Launch blocker — High — Via GTM consent mode
Trengo — Seasonal — Medium — Via GTM, toggle on/off in dashboard

## Google Tag Manager

GTM container ID format: GTM-XXXXXXX. Add as environment variable GTM_CONTAINER_ID. Only renders script if set — keeps local dev clean. Simon to create GTM account at tagmanager.google.com.

## Google Analytics 4

Configure as tag inside GTM — no direct website code needed. Measurement ID format G-XXXXXXXXXX. Simon to provide from Google Analytics account.

## Facebook Pixel

Configure via GTM. Key events: PageView (all pages), ViewContent (product pages), InitiateCheckout (widget open), Purchase (booking confirmation). Pixel ID from Facebook Business Manager — Simon to provide. Must not fire before cookie consent given.

## Klaviyo

Already in use. Needs footer newsletter signup (name and email minimum). Ventrata to trigger Klaviyo flows — confirm with Ventrata account manager. Key flows: post-booking confirmation, pre-cruise reminder, post-trip review request, abandoned checkout, seasonal campaigns, MUFC matchday reminders.

## Cookie consent — launch blocker

Required before Facebook Pixel and GA4 go live. Use GTM consent mode with Cookiebot or CookieYes (free tiers). Must be live before go-live. Add to launch checklist.

**Ordering (critical — from review three):** the consent-mode **default state must be set to
`denied` BEFORE the GTM script loads**, not after. Consent Mode v2 reads the default at tag
initialisation — if the `gtag('consent', 'default', { ... 'denied' })` call (or the CMP's
default block) runs after GTM, tags can fire once with consent implicitly granted before the
banner is answered, defeating the whole purpose (and breaching UK GDPR / PECR pre-consent).
So in `BaseLayout` the consent-default snippet must sit in `<head>` **above** the GTM
container snippet. Verify in the built HTML that the `default … denied` call precedes the
GTM `<script>`.

## Trengo

Seasonal use (Christmas). Add as GTM tag, enable/disable in dashboard without code changes.

## Implementation order

1. Simon creates GTM account, provides container ID
2. Add GTM to BaseLayout
3. Configure GA4 in GTM dashboard
4. Configure Facebook Pixel in GTM + implement cookie consent
5. Klaviyo footer signup on website
6. Ventrata to Klaviyo booking flows
7. Trengo as GTM tag, activate seasonally

## Environment variables needed

GTM_CONTAINER_ID — GTM-XXXXXXX — from Google Tag Manager
GA4_MEASUREMENT_ID — G-XXXXXXXXXX — from Google Analytics via GTM
FACEBOOK_PIXEL_ID — from Facebook Business Manager via GTM
KLAVIYO_LIST_ID — from Klaviyo account, for newsletter signup

## What NOT to do

Do not add GA4, Facebook Pixel or Trengo directly to BaseLayout
Do not add GTM to individual pages — BaseLayout only
Do not fire Facebook Pixel before cookie consent
Do not add Segment without discussing with Simon and Jeff
