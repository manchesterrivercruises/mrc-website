// Generates the favicon / app-icon set from the brand roundel.
//
// SOURCE: public/images/logo-colour.png is the full lockup (roundel + wordmark, 2461x686).
// A favicon must be the ROUNDEL ALONE — the wordmark is illegible at 16px and would just
// render as grey mush. So: crop the left square-ish region, trim the transparent margin to
// the mark's true bounding box, then pad back to a square so nothing is cropped off when the
// browser rounds the corners.
//
// Re-run after any logo change:
//   node scripts/make-favicons.mjs
//
// Outputs (all in public/):
//   favicon.ico          32+16px multi-size, for legacy browsers and the address bar
//   favicon.svg          scalable modern favicon (wraps the trimmed PNG, so it stays pixel-exact)
//   favicon-96.png       explicit rel=icon candidate
//   apple-touch-icon.png 180x180, opaque navy background (iOS composites onto white otherwise)
//   icon-192.png         PWA / Android manifest icon
//   icon-512.png         PWA / Android manifest icon (maskable-safe padding)
//
// Uses the `sharp` that ships with Astro's image pipeline — declared in package.json so this
// script has a supported version to rely on rather than an accident of hoisting.

import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'public/images/logo-colour.png';
const OUT = 'public';
async function roundelSquare() {
  const meta = await sharp(SRC).metadata();
  // The roundel occupies roughly the left third of the lockup; take a generous slice and let
  // trim() find the true edges, so this survives small changes to the source artwork.
  const slice = Math.round(meta.width * 0.3);
  const trimmed = await sharp(SRC)
    .extract({ left: 0, top: 0, width: slice, height: meta.height })
    .trim() // drop the transparent margin around the mark
    .toBuffer({ resolveWithObject: true });

  const { width, height } = trimmed.info;
  // Pad the short axis so the mark is centred in a true square (no distortion, no clipping).
  const side = Math.max(width, height);
  return sharp(trimmed.data)
    .extend({
      top: Math.floor((side - height) / 2),
      bottom: Math.ceil((side - height) / 2),
      left: Math.floor((side - width) / 2),
      right: Math.ceil((side - width) / 2),
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
}

// Minimal ICO container: PNG-compressed entries, which every browser since IE11 accepts.
function buildIco(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = icon
  header.writeUInt16LE(entries.length, 4);
  const dir = Buffer.alloc(16 * entries.length);
  let offset = header.length + dir.length;
  entries.forEach((e, i) => {
    const b = i * 16;
    dir.writeUInt8(e.size >= 256 ? 0 : e.size, b + 0); // 0 means 256
    dir.writeUInt8(e.size >= 256 ? 0 : e.size, b + 1);
    dir.writeUInt8(0, b + 2); // palette
    dir.writeUInt8(0, b + 3); // reserved
    dir.writeUInt16LE(1, b + 4); // colour planes
    dir.writeUInt16LE(32, b + 6); // bits per pixel
    dir.writeUInt32LE(e.data.length, b + 8);
    dir.writeUInt32LE(offset, b + 12);
    offset += e.data.length;
  });
  return Buffer.concat([header, dir, ...entries.map((e) => e.data)]);
}

const square = await roundelSquare();
const png = (size, opts = {}) =>
  sharp(square)
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 }, ...opts })
    .png()
    .toBuffer();

// ── Transparent PNG icons ─────────────────────────────────────────────────────
for (const [file, size] of [['favicon-96.png', 96], ['icon-192.png', 192], ['icon-512.png', 512]]) {
  fs.writeFileSync(path.join(OUT, file), await png(size));
  console.log(`  ${file.padEnd(22)} ${size}x${size}`);
}

// ── apple-touch-icon: iOS ignores transparency and composites the icon onto an opaque
//    background, so it must ship its own. WHITE, not brand navy: the colour roundel is a
//    dark charcoal anchor inside a light-blue wheel, drawn for a white ground — on navy the
//    anchor all but disappears (checked by eye at 180px). Inset so the mark survives iOS's
//    rounded-corner mask.
const APPLE = 180;
const inset = Math.round(APPLE * 0.12);
const appleMark = await sharp(square).resize(APPLE - inset * 2, APPLE - inset * 2, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
fs.writeFileSync(
  path.join(OUT, 'apple-touch-icon.png'),
  await sharp({ create: { width: APPLE, height: APPLE, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } } })
    .composite([{ input: appleMark, top: inset, left: inset }])
    .png()
    .toBuffer(),
);
console.log(`  apple-touch-icon.png   ${APPLE}x${APPLE} (white ground, inset ${inset}px)`);

// ── favicon.ico: 32 + 16 ──────────────────────────────────────────────────────
fs.writeFileSync(
  path.join(OUT, 'favicon.ico'),
  buildIco([
    { size: 32, data: await png(32) },
    { size: 16, data: await png(16) },
  ]),
);
console.log('  favicon.ico            32 + 16');

// ── favicon.svg: wraps the 512 raster so the vector file is pixel-identical to the PNGs
//    (the source lockup is a raster, so a true vector trace would not match the brand mark).
const b64 = (await png(512)).toString('base64');
fs.writeFileSync(
  path.join(OUT, 'favicon.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">\n` +
    `  <title>Manchester River Cruises</title>\n` +
    `  <image width="512" height="512" href="data:image/png;base64,${b64}"/>\n` +
    `</svg>\n`,
);
console.log('  favicon.svg            512 viewBox');

console.log('\nDone. Icons are referenced from src/layouts/BaseLayout.astro and public/site.webmanifest.');
