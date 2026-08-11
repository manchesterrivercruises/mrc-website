# Second tour — city centre, on Melody

**Status:** planned, not built. Blocked on four facts (see *Blockers*).
**Target:** around September.
**Vessel:** Melody.
**Where:** city centre — a different departure point from the Salford Quays fleet.

This document exists because the *shape* of the decision is settled even though the details
are not. Build nothing from this until the blockers below are answered; but when they are,
build it this way and not the other way.

---

## The decision

**The second tour is a STANDALONE Ventrata product on a STANDALONE page.**

It is **not** a reactivated option on the City River Tour product, and **not** a variant
selector on `/tour/city-river-tours`.

This is a reversal of how it used to work, and it is deliberate.

### Why not an option on the CRT product

**1. The option era caused real wrong-location confusion.** When the city-centre departure was
an option on the existing product, customers turned up at the wrong place. That is the most
expensive failure mode this business has: a customer who has paid, travelled, and is now
standing at a pier watching a boat they cannot board leave without them. It is unrecoverable
at the point it happens, and it is the operator's fault in the customer's eyes regardless of
what the booking said. One product with two departure locations makes that mistake easy to
make and hard to design out — the location is a detail *inside* the purchase rather than the
thing being purchased.

**2. Customers expected the CRT boat.** Buying "the City River Tour" set an expectation of the
City River Tour experience — including the open top deck, which is a large part of why people
choose it. Melody does not have one. Selling a Melody sailing under the CRT name means a
customer who booked what they thought was the open-deck sightseeing cruise boards an
indoor-seating boat. Even with the difference disclosed in the booking flow, the *name* did the
persuading, and the name was wrong.

Both failures share a root cause: **the product name and page did not describe what the customer
would actually get.** A separate product with its own name and its own page fixes the cause, not
the symptom.

### What being a separate product buys us

- **Tickets and confirmations carry the right location natively.** No template hack, no note
  field, no "please check your departure point" warning bolted onto a shared confirmation. The
  product *is* the location, so every downstream artefact — ticket, confirmation email, manifest,
  OTA listing — says the right thing without anyone remembering to make it say the right thing.
- **The page can set expectations honestly** in its own voice, rather than as a caveat inside
  someone else's page.
- **Availability, pricing and capacity are independent** of the CRT product.
- **Reporting separates cleanly** — the two tours' numbers do not have to be untangled from one
  product's option splits.

---

## Requirements

### 1. A distinct, location-led NAME — *the first line of defence*

The name is not branding polish here; it is the primary confusion control. It must make the
departure location obvious at the point of purchase, in a list of search results, and on a
confirmation email read three weeks later on a phone.

**TBD with Simon.** It must be led by the city-centre location, and it must not read as a
variant of "City River Tour" — if the two names look like siblings, the confusion the split was
meant to fix comes straight back.

### 2. The page sets boat expectations honestly

Melody has **indoor seating and no open top deck**. The page must say so plainly and high up —
not in a footnote, not only in an FAQ.

Frame her **genuine strengths** rather than apologising for the deck: indoor seating is warm,
dry, sheltered and comfortable, which is an advantage in Manchester for most of the year and a
real plus for some customers. The honest framing sells better than a hedge, and it means nobody
arrives disappointed.

Further vessel detail is **TBC** — see *Blockers*.

### 3. The City River Tour keeps the open deck as its differentiator

CRT copy should continue to lead on the open top deck. With two tours running, that is what
distinguishes them, and it is already what CRT customers come for. Nothing about the second tour
should dilute it.

### 4. The two boarding-point pages cross-reference each other

Salford Quays and the city-centre pier each get a page that names the other and says which tour
departs from it. A customer who lands on the wrong one should be one obvious link from the right
one. This mirrors the pattern already built for the two ferry departure points
(`/tour/boat-to-old-trafford/<point>`), which cross-link for exactly this reason.

---

## Needs, when the tour is real

Each of these is a concrete piece of work, not a nice-to-have. None can start before the
blockers clear.

| # | Work | Notes |
|---|---|---|
| 1 | **Product ID → allowlist, date finder, What's On** | The new Ventrata product ID has to be added to the OCTO product allowlist and the date-finder / What's On product maps, or the tour is invisible to every live availability surface on the site. |
| 2 | **Product page** | Built from the City River Tour template — it is the established bookable-product layout (gallery, key facts, booking panel, route, FAQ, getting here). |
| 3 | **City-centre boarding-point page** | Same shape as `/salford-quays`. Pier **TBC**. |
| 4 | **Attractions collection, location-tagged** | Add a `location` field (`quays` \| `city-centre`) so a per-departure "what's nearby" block can be authored, and a city-centre cluster written. See the note below — this is the decision this collection has been waiting for. |
| 5 | **Discover guide for the city centre** | Mirrors the existing Salford Quays guides (`/discover/day-out-salford-quays` and friends). |
| 6 | **Homepage repositioning — two tours** | The homepage currently presents one flagship sightseeing product. With two, the hero and the City River Tour feature block both need rethinking so neither tour is buried. |
| 7 | **Melody vessel entry + album** | The vessel entry exists (`src/content/vessels/melody.yaml`) but carries a TBC description, no capacity, no features and no photo. Needs a real description and a photo set — likely a new gallery album, as `our-boats` does not identify individual vessels. |
| 8 | **Commentary app — route note** | The GPS commentary app is built around the Ship Canal route. A city-centre route needs its own commentary treatment; scope TBC. |

### Note on the `attractions` collection

`attractions` was modelled for the **"Make a day of it"** block — the nearby-things-to-do card
grid at the foot of the City River Tour page. Its schema (`name`, `description`, `url`, `image`,
`imageAlt`, `order`) matches that block exactly, and `AttractionCard.astro` is its intended
renderer.

**It has never been seeded, and nothing reads it today.** The City River Tour's day-out cards are
still a hardcoded set of six, now living in that page's CMS copy entry
(`src/content/page-copy/city-river-tours.json`, card group `dayOut`) with their destinations in a
code-side map.

That is why seeding it is listed above rather than done: with one departure point, a collection
buys little over the hardcoded six. With **two** departure points in different parts of the city,
"what's nearby" becomes genuinely per-departure — IWM North and The Lowry are not near the city
centre — and a location-tagged collection stops being overhead and starts being the only sane
way to author it. **Decision pending.** If the second tour does not happen, leaving the day-out
cards as page copy is the right call.

---

## Blockers

Nothing can be built until these are answered. All four are Simon's.

| Blocker | Needed for |
|---|---|
| **The tour name** | Everything. It is the confusion defence, the page title, the URL slug, the Ventrata product name and every downstream ticket and confirmation. Naming it late means renaming it everywhere. |
| **The city-centre pier** | The boarding-point page, the map, the schema.org `BoatTerminal`, and the "getting here" copy. |
| **The Ventrata product ID** | The allowlist, the date finder, What's On, and the booking widget. Until this exists the page cannot take a booking. |
| **Melody photography + description** | The vessel entry, the product page hero, and the honest open-deck framing — which is hard to write persuasively with no photo of the indoor cabin to show. |

---

## See also

- `docs/url-parity.md` — the URL decision table; a new product page and boarding-point page
  each need a row.
- `docs/ventrata-integration.md` — the OCTO allowlist and product maps that item 1 touches.
- `docs/content-management.md` — the Page copy collection and what stays in code.
- `docs/content-checklist.md` — where the outstanding content asks are tracked.
