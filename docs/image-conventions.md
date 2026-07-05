# Image Conventions

How images are handled on the MRC site. Read this before adding any real image assets
or building components that render images.

Status: **infrastructure/convention only.** Most images are placeholder tiles today —
real assets are TBC from Simon (see `content-checklist.md`). Follow these rules as assets
land so we get WebP, correct sizing and proper alt text from day one.

> **Gathering real photography?** Track it in `docs/photo-inventory.md` — the shared visual
> asset library for the whole site (subjects, minimum counts, hero-grade/OG/OTA
> suitability, alt/caption/usage-rights status), not just the gallery. Jeff owns gathering
> against that list.

---

## Use Astro's `<Image />` component

Use `astro:assets` for all raster images — never a bare `<img>` for local assets.

```astro
---
import { Image } from 'astro:assets';
import heroImg from '../assets/city-river-tour/hero.jpg';
---
<Image src={heroImg} alt={alt} width={1600} height={900} />
```

Astro's `<Image />`:

- Emits **WebP** (and can emit AVIF) automatically, with the original as fallback.
- Prevents layout shift because `width`/`height` are required for local imports.
- Optimises at build time — no runtime cost.

For images that must stay raw (SVG logos, the OG share image, files served from
`public/`), a plain `<img>` or direct path is fine. `public/` files are **not**
processed or optimised — only files imported from `src/` go through `<Image />`.

---

## Alt text

- Alt text is **required** and must be meaningful. Never hardcode `alt=""` on content
  images.
- Source alt text from **frontmatter or a prop**, not a literal in the template.
  Collections already carry a `heroImageAlt` field for this (see `src/content/config.ts`);
  components take an `imageAlt` / `alt` prop (e.g. `EventCard`, `ProductCard`).
- `alt=""` is allowed **only** for purely decorative images, paired with
  `role="presentation"` — and that decision should be deliberate, not a fallback.
- Describe the subject, not the medium ("The City River Tour boat passing MediaCity",
  not "photo of a boat").

---

## Filenames

- **kebab-case, descriptive**, no spaces or uppercase: `city-river-tour-hero.webp`,
  `abba-cruise-card.webp`, `salford-quays-guide.webp`.
- Group by product/section in `src/assets/<section>/` (e.g. `src/assets/city-river-tour/`,
  `src/assets/events/`, `src/assets/discover/`).
- Avoid dimensions or CMS hashes in the name (`...-500x350.png?s=...`) — the temporary
  hotlinked review images on `/whats-on` are placeholders and must be replaced.

---

## Sizes per context

Provide source assets at roughly 2× the largest rendered size for crisp retina output,
then let `<Image />` downscale. Target render sizes:

| Context | Aspect ratio | Rendered width | Notes |
|---------|--------------|----------------|-------|
| Page hero | 16:9 (or 4:3 on split heroes) | up to ~1600px wide | `loading="eager"`, above the fold |
| Card (event / product / guide) | 16:9 | ~400–500px | `loading="lazy"` |
| Gallery thumbnail | 4:3 or 1:1 | ~300–400px | `loading="lazy"` |
| Full gallery / lightbox | 16:9 | up to ~1600px | lazy, loaded on demand |
| OG share image | 1200×630 | fixed | lives in `public/`, not processed |

Always set `loading="lazy"` on below-the-fold images; keep hero images eager.

---

## Switching collections to the `image()` helper

`src/content/config.ts` currently types image fields as **strings** (paths) because no
real assets exist yet. When assets land, switch each image field to Astro's `image()`
helper so the collection validates and optimises the file:

```ts
import { defineCollection, z } from 'astro:content';

const discover = defineCollection({
  // ...
  schema: ({ image }) =>
    z.object({
      // was: heroImage: z.string().optional(),
      heroImage: image().optional(),
      heroImageAlt: z.string().optional(),
      // ...
    }),
});
```

Then render collection images with `<Image src={entry.data.heroImage} alt={entry.data.heroImageAlt} />`.
Do this per collection as its real imagery is added, and update the templates that read
those fields at the same time.
