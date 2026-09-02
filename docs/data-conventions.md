# Data Conventions

Rules for the structured data files under `src/data/`. Read this before importing a dataset
from another system — most of it exists because an import went wrong once.

---

## `tour-stops.json` — the City River Tour map and itinerary

**What it is:** 12 curated landmarks along the City River Tour route, with
**landmark-accurate coordinates** — each `lat`/`lng` is where the *thing* is, so a pin drops on
the subject it names.

**Consumed by:** `src/pages/tour/city-river-tours.astro` only — both the Leaflet route map and
the crawlable `<ol>` itinerary beside it. They read the same file deliberately, so the map and
the list can never disagree.

### ⚠ Never import the tour app's 1–43 dataset as map POIs

The onboard tour app (`mrc-tour-app`) has a dataset of 43 numbered entries. It is tempting to
treat it as a richer version of this file. **It is not the same kind of data.**

Those 43 entries are **GPS trigger zones for the onboard audio**. Each coordinate is where the
**boat** must be for a commentary cue to fire — which is deliberately *offset* from the thing
being described, because you hear about a landmark as you approach it, not when you are level
with it. Several entries are also narrative themes ("the docks in wartime") rather than objects
a passenger can point at.

Imported as map POIs on 2026-08-31, they produced pins in open water pointing at nothing.
Measured against the real positions of their named subjects:

| Entry | Pin was off by |
|---|---|
| Ordsall Chord | **2,817 m** |
| Old Trafford Cricket Ground | 1,058 m |
| Pomona Island | 638 m |
| Digital World Centre | 245 m |
| Imperial Point | 242 m |

Reverted on 2026-09-02. Note that the import did **not** move the 12 curated stops — it added
31 trigger entries around them — so the revert was a deletion, not a re-survey.

**If a richer map is ever wanted**, the trigger dataset is still the wrong input. It would need
a genuine POI export: one entry per visible subject, coordinates on the subject, and a name a
passenger could repeat. That is new data, not a re-import.

### Sell the commentary in copy, not in pins

The commentary genuinely covers **over 40 points of interest** — that richness is real and worth
selling. State it in words next to the map (`city-river-tours.json` → the `route` section note
and the `routeMap` body) rather than drawing it as markers. The claim stays true, the map stays
legible, and the two do not have to agree pin-for-pin.

Use **"over 40"**, not an exact count: the trigger count belongs to the audio app and will drift
as the commentary is edited. An approximate claim stays true; an exact one goes stale silently.

### Shape

```jsonc
{
  "id": 1,              // 1..12, route order — drives the map sequence and the list order
  "routeId": 1,         // the id this stop had in the tour app's 1–43 numbering (provenance)
  "name": "Lowry Theatre",
  "short": "Departure point",
  "lat": 53.470857,     // ON THE LANDMARK, not on the water
  "lng": -2.295971,
  "leg": "o",           // "o" outbound / "r" return
  "emoji": "🎭",         // map marker glyph
  "description": "…"    // one or two sentences; shown in the map popup and the itinerary list
}
```

`routeId` is kept purely so a future export from the tour app can be matched back to these
stops. Nothing renders it.

There is no `highlight` flag any more. It existed only to distinguish 12 real landmarks from 31
trigger zones; with the curated set being the whole file, every stop is a landmark and a
"Highlight" badge on every row said nothing.

---

## General rule for imported datasets

Before importing any dataset from another system, ask **what its coordinates mean**. A
coordinate can be:

- **where a thing is** — correct for a map pin;
- **where the viewer must be** to see/hear about it — correct for a trigger, wrong for a pin;
- **a route vertex** — correct for a line, wrong for either.

These are not interchangeable, and nothing in a JSON file distinguishes them. If the source
system is an *experience* (audio guide, AR, geofence), assume its coordinates are trigger
positions until proven otherwise, and spot-check a handful against a real map before shipping.
