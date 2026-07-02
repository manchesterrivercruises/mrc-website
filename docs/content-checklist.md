# Content Checklist

Outstanding content and assets required before the site can go live.
Update this file as items are confirmed.

---

## From Simon — required before build completes

### Brand assets
- [ ] Logo — SVG format preferred
- [ ] Primary colour HEX (dark navy)
- [ ] Accent colour HEX (gold/amber)
- [ ] Font name(s) or font files
- [ ] High-resolution photography (boat, departure point, onboard, events)

### Ventrata API keys
- [ ] OCTO connection key (read-only — goes in Netlify environment variable)
- [ ] Checkout widget API key (goes in page HTML)

### Ventrata product IDs — CONFIRMED ✓
19 public products confirmed. See .env.example for full list.

### Page content
- [ ] City River Tour — route itinerary (43 stops from GPS commentary app)
- [ ] City River Tour — full description, highlights, what's included
- [ ] Boat to Old Trafford — service description, matchday schedule
- [ ] Private Hire — vessel capacities, catering options, pricing guidance
- [ ] About Us — company story, team
- [ ] Our Vessels — fleet detail (Princess Katherine, Isabella, Melody, Georgina, Joyce Too)
- [ ] FAQ — questions and answers
- [ ] Accessibility information

### Pricing (for static fallback copy)
- [ ] City River Tour — price from
- [ ] Boat to Old Trafford — price from
- [ ] Events — typical price from

---

## From Jeff — required before build starts

- [x] CSS approach confirmed — Tailwind CSS
- [ ] GitHub repo setup confirmed
- [ ] Deployment workflow confirmed
- [ ] Staging/noindex approach confirmed

---

## Confirmed public product list (19 products)

| # | Product | ID |
|---|---------|-----|
| 1 | Diana Ross | 19441cae-34e1-440d-b7c1-534a9a2a163e |
| 2 | ABBA | 50a5eb12-f9ad-4b1f-9a70-e880bd28152b |
| 3 | Father's Day | 6424be77-a91a-4dc4-96dd-9a1745a1738e |
| 4 | Mother's Day | 078259ea-62e1-423d-95ab-26a419d41bc6 |
| 5 | Decks on Deck | cf398297-36a2-4a42-878f-5e409407f059 |
| 6 | Elvis Rocks | 9b61248a-b567-4cda-8b17-97d55e944b0b |
| 7 | Club Classics | 46688aed-c6e3-4d6d-933b-efcba00d34fe |
| 8 | Rollin' on the River | d711f0c0-7939-4d6b-9219-6995de6723c3 |
| 9 | Soul River | 8c425994-25e9-4bc3-bce3-1181951142c8 |
| 10 | Dolly Cruise | f370910f-7d5e-49bb-89b6-dea2ca86f2a9 |
| 11 | Back to the 90s | fb15c1fc-84f9-455b-a6d6-e8de0db30b3d |
| 12 | Boat Tropicana | f137c230-50c4-41e0-bc75-5485fccf2668 |
| 13 | Elvis Live | 2fe9c519-e00a-4a0d-8067-e7e5c15a023e |
| 14 | Pirates & Mermaids | e264599a-9a49-4f3a-a693-fd31f962f8ac |
| 15 | Cruise with Father Christmas | 6cabf36f-f48f-48c7-83c0-c964983a9dff |
| 16 | Adele Cruise | 99a19bc1-64d3-4f69-bd68-fb44348053a6 |
| 17 | City River Tour | ef45d8bd-529c-4dae-9c35-cd1b8e4e0a75 |
| 18 | Boat to Old Trafford | 458c8d36-8268-481d-ae47-491b41508b8e |
| 19 | Swinging on the River | ee4143b6-9c32-4db2-9d1f-807c858696fa |

### Dormant / inactive events

The following events are not currently running. Their markdown lives in
`src/content/events/` but is set `draft: true`, so **no `/cruises/[slug]` page is
built and they are excluded from all listings**. Reactivate by flipping the flag to
`draft: false` when the event returns.

| Product | Slug | Status |
|---------|------|--------|
| Club Classics | club-classics-cruise | Dormant (draft) — product ID `46688aed-c6e3-4d6d-933b-efcba00d34fe` on file |
| Broadway Boat Party | broadway-boat-party | Dormant (draft) — full Ventrata product ID still TBC (only `d8b67a96` supplied; not in the 19-product list above) |
| Wizards & Fairies | wizards-and-fairies | Dormant (draft) — full Ventrata product ID still TBC (only `093a89af` supplied; not in the 19-product list above) |
| Halloween Boat Party | halloween-boat-party | Dormant (draft) — full Ventrata product ID still TBC (only `aec4cd6b` supplied; not in the 19-product list above) |

Before reactivating Broadway, Wizards & Fairies or Halloween, confirm the product
exists in Ventrata and replace the partial ID with the full product ID.
