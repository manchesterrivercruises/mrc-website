# MRC Website Brief — AI Reference

This is the condensed build brief for Claude Code and Cursor.
Full specification: `MRC_Website_Spec_v5.docx`

---

## What we're building

Static Astro site for manchesterrivercruises.com.
Replaces existing Craft CMS site. Hosted on Netlify. Zero ongoing hosting cost.
Ventrata handles all booking — via widgets (checkout) and OCTO API (availability data).

---

## Product hierarchy

City River Tour is ~65% of revenue. It dominates the site.

| Product | Revenue share | Booking |
|---------|--------------|---------|
| City River Tour | ~65% | Ventrata widget |
| Christmas, Kids Events, Music Nights | ~10% | Ventrata widget |
| MUFC Ferry Service | ~7% | Ventrata widget |
| Private Hire | remainder | Manual — enquiry form only |
| Other Music & Party Nights | remainder | Ventrata widget |

---

## Full URL structure (Section 11.1 — authoritative page list)

```
/                                          Home
/city-river-tour                           City River Tour
/whats-on                                  What's On
/events                                    Events & Special Cruises
/christmas-cruises-manchester              Christmas Cruises (SEO page)
/santa-cruise-manchester                   Santa Cruise (SEO page)
/music-cruises-manchester                  Music Cruises (SEO page)
/party-boat-manchester                     Party Boat (SEO page)
/boat-to-old-trafford                      Boat to Old Trafford (matchday ferry)
/private-hire                              Private Hire
/private-boat-hire-manchester              Private Boat Hire (SEO page)
/cruises/[slug]                            New Tour TBC (dynamic — under /cruises/ not root)
/plan-your-visit                           Plan Your Visit
/getting-here                              Getting Here
/accessibility                             Accessibility
/gift-vouchers                             Gift Vouchers
/faq                                       FAQ
/discover                                  Discover hub
/discover/day-out-salford-quays            Guide: Salford Quays
/discover/visiting-iwm-north               Guide: IWM North
/discover/old-trafford-by-boat             Guide: Old Trafford by boat
/discover/coronation-street-tour-manchester Guide: Coronation Street Tour
/discover/things-to-do-near-the-lowry      Guide: Near The Lowry
/discover/family-day-out-salford-quays     Guide: Family day out
/discover/manchester-ship-canal-sightseeing Guide: Ship Canal
/vessels                                   Our Vessels
/about                                     About
/contact                                   Contact
/manage-booking                            Manage My Booking
```

---

## Homepage sections (in order)

1. **Hero** — City River Tour by default. Manual override for seasonal campaigns (set in config, not API)
2. **City River Tour feature** — standalone section, always present regardless of hero
3. **What's On strip** — next 6 departures, live from Ventrata OCTO API
4. **Events grid** — seasonal event cards from Ventrata, links to static SEO pages
5. **MUFC Ferry callout** — seasonal prominence
6. **Private Hire callout** — enquiry CTA
7. **Discover** — 2-3 editorial guide teasers
8. **Social proof** — Tripadvisor rating, stats

---

## City River Tour page (most important page after homepage)

Required sections:
- **At a Glance panel** (above fold): duration, price from, departure point (Millennium Footbridge, Salford Quays, M50 3RB), boarding time, nearest tram (MediaCity UK), parking (Quayside), onboard facilities, accessibility, mobile ticket, cancellation summary, Book Now
- **Getting Here block**: Where to board heading, exact address, landmark description, photo of boarding point, Google Maps link, Metrolink directions, parking, taxi drop-off
- **Book Direct messaging**: near the widget — official source, latest availability, direct support, Manage My Booking, no third-party errors
- Full description
- Route itinerary (static content — 43 stops from GPS commentary app, content TBC from Simon)
- Photo gallery
- Ventrata embedded widget (desktop) + sticky Book Now (mobile)
- Make a day of it section (IWM North, Lowry, Coronation Street Tour, sightseeing bus)
- FAQ
- Reviews

The Getting Here block is a fixed template used on every bookable product page.

---

## Private Hire

Manual booking only — no Ventrata widget.
Enquiry form: name, email, phone, event type, preferred date, guest numbers, message.
Form must be raw Astro/HTML at build time (Netlify Forms requirement — see AGENTS.md rule 10).
Submissions go to MRC email. Team records confirmed bookings in Ventrata to block capacity.

---

## Design

- Dark navy background, warm gold/amber accent
- Maritime, premium, confident tone
- Match or exceed quality of current manchesterrivercruises.com
- Assets to be provided by Simon: SVG logo, HEX colour codes, fonts, photography

---

## SEO requirements (every page)

- Unique title tag and meta description
- Open Graph tags (og:title, og:description, og:image)
- Schema.org structured data (TouristAttraction on product pages, Article on guides)
- XML sitemap
- robots.txt (noindex on staging)
- Canonical tags where needed
- WebP images with descriptive alt text

---

## Key constraints (from AGENTS.md)

- OCTO key: server-side only
- City River Tour: default hero, never changed by API
- Dynamic routes: /cruises/[slug] only — never root level
- Netlify Forms: raw HTML at build time
- No new CMS without approval
- No new dependencies without approval
