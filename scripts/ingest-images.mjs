// Incremental image ingest — the mechanical half of the photo-inventory workflow
// (docs/photo-inventory.md → "How to use this tracker"). Given a source folder of raw photos it:
//   1. de-dupes by VISUAL CONTENT (a resolution/format-invariant average-hash), not filename —
//      so anything already living in public/images/ (as processed WebP) is skipped, and near-
//      identical source frames (Low/High Res pairs, "-N (1)" copies) collapse to one;
//   2. processes each genuinely-new image to a card (800px) + large (≤1600px) WebP with EXIF
//      auto-orientation and real output dimensions;
//   3. writes them to a staging dir (.ingest/, git-ignored) and emits .ingest/report.json.
//
// It deliberately stops there: CURATION (which frames are worth keeping) and ALT TEXT are
// editorial judgement, done by hand afterwards — view each staged image, pick the keepers, give
// each a genuine kebab-case name + alt, move the pair into public/images/gallery/<slug>/, and add
// the images[] entry (real width/height, alt, isFeatured/usage) to the album YAML.
//
// Uses the `sharp` that ships transitively with Astro — no new dependency.
//
// Usage:
//   node scripts/ingest-images.mjs --source "C:\\MRC Website\\General" --recurse
//   [--out .ingest] [--existing public/images] [--threshold 5] [--since YYYY-MM-DD] [--dry-run]

import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const flag = (name, def = false) => argv.includes('--' + name) || def;
const opt = (name, def = null) => {
  const i = argv.indexOf('--' + name);
  if (i < 0) return def;
  const v = argv[i + 1];
  return v && !v.startsWith('--') ? v : def;
};

const SOURCE = opt('source');
const RECURSE = flag('recurse');
const OUT = opt('out', '.ingest');
const EXISTING = opt('existing', 'public/images');
const THRESHOLD = Number(opt('threshold', '5'));
const SINCE = opt('since'); // optional mtime floor (YYYY-MM-DD); unreliable if files were bulk-copied
const DRY = flag('dry-run');
const CARD_W = 800;
const LARGE_W = 1600;

if (!SOURCE) {
  console.error('Missing --source. Usage: node scripts/ingest-images.mjs --source <dir> [--recurse] [--since YYYY-MM-DD] [--threshold 5] [--dry-run]');
  process.exit(1);
}

const IMG_RE = /\.(jpe?g|png|webp)$/i;
const SKIP_DIR = /(^|\/|\\)(low res)($|\/|\\)/i; // Low Res folders are exact dupes of High Res

function walk(dir, recurse) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('._')) continue; // macOS AppleDouble metadata
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (recurse && !SKIP_DIR.test(p + path.sep)) out.push(...walk(p, recurse));
    } else if (IMG_RE.test(e.name)) {
      out.push(p);
    }
  }
  return out;
}

// Resolution- and format-invariant average hash (aHash), 64 bits as two unsigned 32-bit halves.
async function ahash(file) {
  const buf = await sharp(file).rotate().greyscale().resize(8, 8, { fit: 'fill' }).raw().toBuffer();
  let sum = 0;
  for (const b of buf) sum += b;
  const avg = sum / buf.length;
  let hi = 0;
  let lo = 0;
  for (let i = 0; i < 32; i++) if (buf[i] > avg) hi |= 1 << i;
  for (let i = 0; i < 32; i++) if (buf[i + 32] > avg) lo |= 1 << i;
  return [hi >>> 0, lo >>> 0];
}
const popcount = (x) => {
  x = x - ((x >>> 1) & 0x55555555);
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
  x = (x + (x >>> 4)) & 0x0f0f0f0f;
  return (x * 0x01010101) >>> 24;
};
const hamming = (a, b) => popcount(a[0] ^ b[0]) + popcount(a[1] ^ b[1]);

const kebab = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-') || 'image';

async function main() {
  console.log(`Ingest: source=${SOURCE} recurse=${RECURSE} existing=${EXISTING} threshold=${THRESHOLD}${SINCE ? ` since=${SINCE}` : ''}${DRY ? ' (dry-run)' : ''}`);

  // Hash everything already published so we never re-ingest it (by content, not name).
  const existingFiles = fs.existsSync(EXISTING) ? walk(EXISTING, true).filter((f) => !/gallery-placeholder\.svg$/i.test(f)) : [];
  const existingHashes = [];
  for (const f of existingFiles) {
    try {
      existingHashes.push(await ahash(f));
    } catch {
      /* unreadable — ignore */
    }
  }
  console.log(`Indexed ${existingHashes.length} already-published images for de-dup.`);

  let sources = walk(SOURCE, RECURSE);
  if (SINCE) {
    const cut = new Date(SINCE).getTime();
    sources = sources.filter((f) => fs.statSync(f).mtimeMs >= cut);
  }

  fs.mkdirSync(OUT, { recursive: true });
  const batch = [];
  const result = { newImages: [], dupOfPublished: [], dupInBatch: [], failed: [] };
  const usedSlugs = new Set();

  for (const src of sources) {
    let h;
    try {
      h = await ahash(src);
    } catch (e) {
      result.failed.push({ source: src, error: String(e.message || e) });
      continue;
    }
    if (existingHashes.some((e) => hamming(e, h) <= THRESHOLD)) {
      result.dupOfPublished.push(src);
      continue;
    }
    if (batch.some((e) => hamming(e, h) <= THRESHOLD)) {
      result.dupInBatch.push(src);
      continue;
    }
    batch.push(h);

    let slug = kebab(path.basename(src).replace(IMG_RE, ''));
    let n = 2;
    const base = slug;
    while (usedSlugs.has(slug)) slug = `${base}-${n++}`;
    usedSlugs.add(slug);

    const largePath = path.join(OUT, `${slug}.webp`);
    const cardPath = path.join(OUT, `${slug}-card.webp`);
    let width;
    let height;
    if (!DRY) {
      await sharp(src).rotate().resize({ width: LARGE_W, withoutEnlargement: true }).webp({ quality: 82 }).toFile(largePath);
      await sharp(src).rotate().resize({ width: CARD_W, withoutEnlargement: true }).webp({ quality: 80 }).toFile(cardPath);
      const m = await sharp(largePath).metadata();
      width = m.width;
      height = m.height;
    }
    const orientation = width === height ? 'square' : width > height ? 'landscape' : 'portrait';
    result.newImages.push({ source: src, slug, large: largePath, card: cardPath, width, height, orientation });
  }

  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(result, null, 2));
  console.log(
    `\nsources scanned: ${sources.length}\n  NEW (staged): ${result.newImages.length}\n  dup of published: ${result.dupOfPublished.length}\n  dup within batch: ${result.dupInBatch.length}\n  failed: ${result.failed.length}`,
  );
  console.log(`\nStaged WebP + report → ${OUT}/  (report.json lists source→staged with real dims/orientation)`);
  console.log('Next: view the staged images, keep the best, kebab-rename, move the .webp + -card.webp pair into public/images/gallery/<slug>/, and add the YAML images[] entry (alt, dims, isFeatured/usage).');
}

main().catch((e) => {
  console.error('ingest failed:', e);
  process.exit(1);
});
