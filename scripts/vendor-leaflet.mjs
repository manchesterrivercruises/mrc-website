// Re-download the vendored Leaflet into public/vendor/leaflet and verify it.
//
// Leaflet is SELF-HOSTED rather than loaded from unpkg. Two reasons:
//   1. A CDN that serves script into our origin can, if compromised or hijacked, run arbitrary
//      JS on pages that also carry the Ventrata checkout. Subresource Integrity would pin the
//      bytes, but self-hosting removes the third party from the request path entirely — and
//      makes SRI moot, because the file is ours.
//   2. The CSP no longer needs unpkg.com in script-src or style-src, so the enforced policy
//      gets meaningfully tighter.
//
// Run after any Leaflet version bump, then update VERSION here:
//   node scripts/vendor-leaflet.mjs
//
// It prints the sha256 of each downloaded file so a bump can be diffed against the upstream
// hashes if anything ever looks off.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const VERSION = '1.9.4';
const BASE = `https://unpkg.com/leaflet@${VERSION}/dist`;
const OUT = 'public/vendor/leaflet';

// leaflet.css references images/ by relative path (layers, layers-2x, marker-icon); the default
// L.Icon also uses marker-icon-2x and marker-shadow. All five are vendored so nothing reaches
// back out to the CDN — an incomplete copy fails silently as missing control glyphs.
const FILES = ['leaflet.css', 'leaflet.js'];
const IMAGES = ['layers.png', 'layers-2x.png', 'marker-icon.png', 'marker-icon-2x.png', 'marker-shadow.png'];

async function fetchTo(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buf);
  return crypto.createHash('sha256').update(buf).digest('base64');
}

console.log(`Vendoring Leaflet ${VERSION} → ${OUT}/`);
for (const f of FILES) {
  const hash = await fetchTo(`${BASE}/${f}`, path.join(OUT, f));
  console.log(`  ${f.padEnd(24)} sha256-${hash}`);
}
for (const f of IMAGES) {
  await fetchTo(`${BASE}/images/${f}`, path.join(OUT, 'images', f));
  console.log(`  images/${f}`);
}
console.log('\nDone. Both map pages load /vendor/leaflet/leaflet.{css,js}; no CDN entry is needed in the CSP.');
