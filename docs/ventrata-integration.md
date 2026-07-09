# Ventrata Integration Reference

This document covers all Ventrata integration for the MRC website.
Read this when working on API functions, booking widgets, or availability data.

---

## Two separate API keys — critical distinction

| Key | Purpose | Where it lives |
|-----|---------|----------------|
| **Checkout API key** | Powers the booking widget | In page HTML (DOM) — safe by design |
| **OCTO connection key** | Read-only product/availability data | Server-side only — Netlify Function env var |

The OCTO connection key must **never** appear in client-side code or the DOM.
The checkout widget API key is designed to be in the DOM — do not proxy it.

---

## Checkout widget

### Script tag (once per page, on booking pages only)

```html
<script
  src="https://cdn.checkout.ventrata.com/v3/production/ventrata-checkout.min.js"
  type="module"
  data-config='{"apiKey":"29b8b50a-26b8-4dae-bf0e-995708d2f372", "env": "test"}'
></script>
```

Change `"env": "test"` to `"env": "live"` before launch.
Load this script only on pages that have a booking widget — not globally.

### Pop-up mode (mobile sticky button, CTA buttons)

```html
<button ventrata-checkout data-config='{"productID": "<PRODUCT_ID>"}'>
  Book Now
</button>
```

### Embedded mode (desktop product pages)

```html
<aside
  class="min-h-[50rem] h-auto w-full"
  ventrata-embedded-widget
  data-config='{"productID": "<PRODUCT_ID>", "embedded": true}'
>
  <!-- Loading skeleton goes here -->
  <div class="widget-loading">Loading availability...</div>
</aside>
```

Use `min-h-[50rem] h-auto` — never a fixed height. The widget expands during date picking, add-ons, and payment.

### Pre-selected date/time (What's On page links)

```html
<button
  ventrata-checkout
  data-config='{
    "productID": "<PRODUCT_ID>",
    "dateToPreselect": "2025-08-15",
    "timeslotToPreselect": "10:00"
  }'
>
  Book 10am departure
</button>
```

---

## Recommended widget features

Enable these in the Ventrata dashboard or via `data-config` features object.
Confirm availability in MRC's specific Ventrata checkout before enabling.

```json
"features": {
  "showRemainingSeats": true,
  "preselectFirstAvailableDateModalCalendar": true,
  "preselectFirstUnit": true,
  "waitlistsAllowed": true,
  "enableMoreDetailsToggle": true,
  "openGiftFlow": true
}
```

For MUFC Ferry — also consider:
```json
"timePickerType": "select",
"showTourGroupsHeadlines": true
```

---

## Per-product widget modes

| Product | Mode |
|---------|------|
| City River Tour | Embedded (desktop) + Pop-up (mobile) |
| Events | Pop-up (triggered from event cards) |
| MUFC Ferry | Embedded (desktop) + Pop-up (mobile) |
| New Tour (TBC) | Embedded (desktop) + Pop-up (mobile) |

Product IDs are stored in `.env` — use placeholders during build.

---

## Newly researched widget capabilities

Each capability below is tagged as a **website-task** (something we implement in this
repo — embed config, files, links, or code) or a **dashboard-task** (something MRC/Simon
enables in the Ventrata dashboard, no code change). Some need both — the tag names the
primary owner and the note calls out the other side.

Exact `data-config` key names should be confirmed against MRC's specific Ventrata
checkout before shipping — Ventrata occasionally versions these. Treat the JSON below as
the intended shape, not a guaranteed literal.

### Calendar First mode — date-led browsing · **website-task**

Opens the widget on the calendar/date step first, so customers browse by date before
picking a product/option. Good fit for the What's On flow and seasonal event pages where
"what's on *this date*" is the natural entry point.

```html
<button
  ventrata-checkout
  data-config='{"productID": "<PRODUCT_ID>", "calendarFirst": true}'
>
  Check dates
</button>
```

Set per embed via `data-config`. May also expose a dashboard default — if enabled there,
the site config still wins per widget. Confirm the exact key in MRC's checkout.

### Bottom Bar — persistent cart visibility · **website-task**

Shows a persistent bottom bar summarising the current cart (items + total) so customers
can see and return to their basket while browsing. Pairs naturally with Multibooking.

```html
<script
  src="https://cdn.checkout.ventrata.com/v3/production/ventrata-checkout.min.js"
  type="module"
  data-config='{"apiKey":"<CHECKOUT_API_KEY>", "env": "test", "bottomBar": true}'
></script>
```

Enabled via the checkout config on pages that carry the widget. May also be toggled in
the dashboard — confirm which layer controls it in MRC's account.

### Multibooking — multi-product cart · **dashboard-task** (+ website-task)

Lets a customer add multiple products/departures to one cart and check out together
(e.g. City River Tour + a Christmas event). Primarily a **dashboard-task**: Multibooking
must be enabled on the MRC Ventrata account. Once on, the widget honours it and the
**Bottom Bar** (above) becomes the recommended way to surface the growing cart, so treat
the bar as the paired website-task. No per-product code beyond normal embeds.

### Apple Pay domain association file · **website-task**

Apple Pay in the checkout requires a domain association file served at a fixed path:

```
/.well-known/apple-developer-merchantid-domain-association
```

Place the file (obtained from Ventrata/the payment provider) in `public/` so Astro copies
it to the site root at build:

```
public/.well-known/apple-developer-merchantid-domain-association
```

Must be served as-is (no extension, correct raw content, HTTP 200) from the production
domain. Add to the launch checklist — Apple Pay will silently not offer if the file is
missing or wrong. Verify after DNS cutover with `curl -i https://manchesterrivercruises.com/.well-known/apple-developer-merchantid-domain-association`.

### Marketing links that auto-open checkout · **website-task**

The widget can auto-open over the product page when the URL carries the right query
params — useful for email/social campaigns that drop customers straight into checkout,
optionally with a promo code pre-applied.

```
https://manchesterrivercruises.com/city-river-tour?openWidget=true&promoCode=XMAS25
```

- `openWidget=true` — the checkout script on that page opens the widget on load.
- `promoCode=<CODE>` — pre-applies the code in the cart.

**Website-task:** ensure the target page loads the checkout script (so the params are
read) and build campaign URLs correctly. Promo codes themselves are created and managed
in the dashboard (**dashboard-task**). Confirm exact param names against MRC's checkout.

### Order Recovery Email — abandoned cart recovery · **dashboard-task**

Ventrata can automatically email customers who start but don't complete a booking. This
is a pure **dashboard setting** — no website code. Note it overlaps with the Klaviyo
"abandoned checkout" flow in `docs/integrations.md`; confirm with the Ventrata account
manager which system owns recovery so customers aren't emailed twice.

### GTM dataLayer e-commerce events · **website-task**

Per Ventrata's tracking manual, the checkout widget pushes GA4-style e-commerce events to
`window.dataLayer`, which Google Tag Manager picks up:

| Event | Fires when |
|-------|-----------|
| `view_item` | Product/widget viewed |
| `add_to_cart` | Item added to cart |
| `begin_checkout` | Checkout started |
| `purchase` | Booking completed |

**Website-task:** GTM must be present to capture these — it lives in `BaseLayout` per
`docs/integrations.md` (GTM is the single tag layer; GA4/Pixel are configured inside GTM,
not in code). The events fire automatically from the widget; our job is to make sure GTM
is loaded on widget-bearing pages and to build the matching triggers/tags in the GTM
dashboard. Ventrata-side tracking may need switching on in the dashboard — confirm in
MRC's account. See `docs/integrations.md` for the full GTM architecture.

---

## OCTO API (read-only, server-side only)

Base URL: `https://api.ventrata.com/octo`
Auth: `Authorization: Bearer <VENTRATA_OCTO_KEY>`
Capabilities: `Octo-Capabilities: octo/pricing` — **required on every request** (see below).

> **Note:** The current OCTO key in `.env.example` is Ventrata's test key (EdinExplore fictional supplier). It is useful for testing function architecture but will not return real MRC products. The live MRC OCTO key must be obtained from the MRC Ventrata account before launch.

### Mandatory `Octo-Capabilities` header

**Every** OCTO request (products, availability, availability-calendar) MUST send an
`Octo-Capabilities` header (or `_capabilities` query param) declaring the capabilities it
needs — otherwise the API returns `400 BAD_REQUEST` / `CAPABILITIES` ("Every request must
specify what capabilities they require…"). We send `octo/pricing`, which also enriches the
response with pricing. All three Netlify Functions include this header.

### Request field names — confirmed (2026-07-06)

> **Confirmed empirically against the live test API (EdinExplore key) on 2026-07-06.**
> Ventrata's dashboard docs show `localDateTimeStart` / `localDateTimeEnd`, but those are
> **response** fields (each returned slot carries them) — they are **NOT** accepted as
> request params. The availability request body uses **date-only** fields:
>
> - `localDateStart` / `localDateEnd` as `YYYY-MM-DD` → **accepted (200)** on both
>   `/octo/availability` and `/octo/availability/calendar`.
> - `localDateTimeStart` / `localDateTimeEnd` (with or without a `T…` time) → **rejected
>   (400)**: `AVAILABILITY_FIELDS_REQUIRED` / `param … invalid: localDateStart`.
>
> So our public function interface stays date-only (`YYYY-MM-DD`) and maps straight through
> to `localDateStart` / `localDateEnd` — **no server-side time expansion is needed.** (The
> API does also accept a full `…T00:00:00` value in those same date fields, but date-only
> is the documented, simplest form.)

### Live MRC key & product allowlist — verified (2026-07-06)

> **The live MRC OCTO key was verified against `/octo/products` (with the
> `Octo-Capabilities` header) on 2026-07-06.** It authenticates (200) and returns **37**
> active products.
>
> - **Allowlist is correct.** All **19** IDs in `netlify/lib/products.ts`
>   (`PUBLIC_PRODUCT_IDS`) exist on the live account — no stale/wrong IDs.
> - The other **18** live products are all intentionally excluded and match the
>   "Not on public website" list in `.env.example` (Quick Pay Tour, Old Trafford Ferry,
>   City River - Return, both Private Hires, MUFC Membership discount, Wizards & Fairies,
>   Halloween, Rugby Old Trafford, Father's Day Cruise, Mother's Day (alt), Mothering
>   Sunday, Quays Trips, Evening Cruise, Broadway Boat Party, Heritage Cruise, Santa SEN,
>   Quick Pay Tour 30%). No public product is missing from the allowlist.
> - **Pricing is provisioned** (`octo/pricing` capability): real prices come back at the
>   **unit** level as `unit.pricingFrom` — e.g. Adult `{ original: 4500, retail: 4500,
>   currency: "GBP", currencyPrecision: 2 }` → **£45.00**. Product/option carry
>   `pricingPer` / `hidePricingFrom` metadata; the numeric price sits on the units.
>
> ⚠ Note: our `products` proxy filter (`filterProduct` in `netlify/lib/products.ts`)
> currently drops `options[].units`, so pricing is **not yet surfaced** to the frontend.
> Add units/`pricingFrom` to the projection when wiring live pricing (build sequence step 9).

### Endpoints

| Endpoint | Method | Used for |
|----------|--------|----------|
| `/octo/products` | GET | All active products with options, images, pricing |
| `/octo/availability` | POST | Availability for a product+option+date range |
| `/octo/availability/calendar` | POST | Month-view availability for calendar display |

Note: the correct calendar endpoint is `/octo/availability/calendar` — not `/octo/calendar`.

### Product options

- Every availability request needs both `productId` and `optionId`
- Where a product has no options, the OCTO spec allows `DEFAULT` as the optionId — **but
  MRC's products reject it.** Confirmed against the live MRC key (2026-07-06): both
  `/octo/availability` and `/octo/availability/calendar` return `400 INVALID_OPTION_ID`
  ("The optionId was missing or invalid") for `optionId: "DEFAULT"`. **Callers MUST supply
  each product's REAL optionId**, resolved from `/octo/products` (`options[].id`, preferring
  the option with `default: true`). See `netlify/functions/day-finder.ts`, which builds a
  productId → optionId map from `/products` before fanning availability.
- Adult/child ticket types are **units**, not options — handle separately for pricing context

---

## Netlify Functions

Three functions proxy all OCTO API calls. The frontend never calls Ventrata directly.

```
/.netlify/functions/products
/.netlify/functions/availability
/.netlify/functions/availability-calendar
```

### Caching policy

| Data | Cache TTL |
|------|-----------|
| Products | 1 hour |
| Availability | 1–3 minutes (stale-while-revalidate) |

Availability is micro-cached to protect against traffic spikes (matchdays, Christmas booking surges).
Final booking availability is always confirmed inside the Ventrata checkout widget.

All three send the mandatory `Octo-Capabilities: octo/pricing` header (see above).

### products function

```typescript
// GET /octo/products
// Header: Octo-Capabilities: octo/pricing (required)
// Returns all active products with their options
// Cache: 1 hour
```

### availability function

```typescript
// POST /octo/availability
// Header: Octo-Capabilities: octo/pricing (required)
// Body: { productId, optionId, localDateStart, localDateEnd }   // dates: YYYY-MM-DD
// Returns: availability slots with capacity (each slot has localDateTimeStart/End)
// Cache: 1-3 minutes SWR
```

### availability-calendar function

```typescript
// POST /octo/availability/calendar
// Header: Octo-Capabilities: octo/pricing (required)
// Body: { productId, optionId, localDateStart, localDateEnd }   // dates: YYYY-MM-DD
// Returns: month-view date availability (per-date localDate + availabilityLocalStartTimes)
// Cache: 1-3 minutes SWR
```

---

## Static fallback pricing

Static pages must include stable fallback copy for SEO and layout stability.
Example: "from £18" in the static HTML, updated to live price after hydration.

Do not leave schema fields (price, availability) dependent only on client-side JS.
Crawlers read the static HTML — schema must be valid at build time.

### Price drift — follow-up (queued)

**Problem observed:** event pages render a static `priceFrom` from the markdown
frontmatter (e.g. Dolly "From £28") while the live checkout widget shows the real
OCTO price (£40). Static values silently drift as Ventrata pricing changes.

**Short-term (done):** the event `priceFrom` values were audited against live OCTO
pricing (the same `pricingFrom` the `products` function returns, cheapest ADULT
retail — see `netlify/lib/octo.ts` → `priceFromUnits`) and corrected. This is a
point-in-time snapshot and will drift again.

**Longer-term (TODO — queued as a follow-up task):** product-page price panels
should render **live pricing with the static value as fallback** — fetch the live
from-price (via the `products` function / `pricingFrom`) client-side and swap it in
after hydration, keeping the build-time static price as the crawlable SEO fallback
and the value shown if the fetch fails. That removes the manual-audit treadmill.
Until then, re-run the price audit whenever Ventrata pricing changes.

---

## Manage My Booking

Ventrata provides a self-service MMB portal. Embed on `/manage-booking` page.
Implementation mirrors the checkout widget — single script tag + container element.
Link from booking confirmation emails and the site footer.
