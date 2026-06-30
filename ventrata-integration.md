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

## OCTO API (read-only, server-side only)

Base URL: `https://api.ventrata.com/octo`
Auth: `Authorization: Bearer <VENTRATA_OCTO_KEY>`

> **Note:** The current OCTO key in `.env.example` is Ventrata's test key (EdinExplore fictional supplier). It is useful for testing function architecture but will not return real MRC products. The live MRC OCTO key must be obtained from the MRC Ventrata account before launch.

### Endpoints

| Endpoint | Method | Used for |
|----------|--------|----------|
| `/octo/products` | GET | All active products with options, images, pricing |
| `/octo/availability` | POST | Availability for a product+option+date range |
| `/octo/availability/calendar` | POST | Month-view availability for calendar display |

Note: the correct calendar endpoint is `/octo/availability/calendar` — not `/octo/calendar`.

### Product options

- Every availability request needs both `productId` and `optionId`
- Where a product has no options, use `DEFAULT` as the optionId
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

### products function

```typescript
// GET /octo/products
// Returns all active products with their options
// Cache: 1 hour
```

### availability function

```typescript
// POST /octo/availability
// Body: { productId, optionId, localDateStart, localDateEnd }
// Returns: availability slots with capacity
// Cache: 1-3 minutes SWR
```

### availability-calendar function

```typescript
// POST /octo/availability/calendar
// Body: { productId, optionId, localDateStart, localDateEnd }
// Returns: month-view date availability
// Cache: 1-3 minutes SWR
```

---

## Static fallback pricing

Static pages must include stable fallback copy for SEO and layout stability.
Example: "from £18" in the static HTML, updated to live price after hydration.

Do not leave schema fields (price, availability) dependent only on client-side JS.
Crawlers read the static HTML — schema must be valid at build time.

---

## Manage My Booking

Ventrata provides a self-service MMB portal. Embed on `/manage-booking` page.
Implementation mirrors the checkout widget — single script tag + container element.
Link from booking confirmation emails and the site footer.
