// Pre-cutover gate: fail if any built HTML still contains the string "TBC".
//
// NOT wired into `npm run build` or the PR CI workflow. The site currently ships
// TBC placeholders (boarding times, accessibility, vessel copy, etc.) and this
// script would fail every build until Simon clears them. Run explicitly before
// flipping public/robots.txt:
//
//   npm run build && npm run launch-gate
//
// See docs/launch-checklist.md → "TBC launch gate".

import fs from 'node:fs';
import path from 'node:path';

const DIST = path.join(process.cwd(), 'dist');

if (!fs.existsSync(DIST)) {
  console.error('launch-gate: dist/ not found. Run `npm run build` first.');
  process.exit(1);
}

/** @param {string} dir */
function htmlFiles(dir) {
  /** @type {string[]} */
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...htmlFiles(p));
    else if (ent.isFile() && ent.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const files = htmlFiles(DIST);
if (!files.length) {
  console.error('launch-gate: no HTML files under dist/.');
  process.exit(1);
}

/** @type {{ file: string, snippet: string }[]} */
const hits = [];
for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  const re = /TBC/g;
  let m;
  while ((m = re.exec(html))) {
    const start = Math.max(0, m.index - 48);
    const snippet = html.slice(start, m.index + 51).replace(/\s+/g, ' ').trim();
    hits.push({ file: path.relative(DIST, file), snippet });
  }
}

if (hits.length) {
  console.error(`launch-gate: ${hits.length} "TBC" occurrence(s) in dist HTML — clear them before cutover:\n`);
  for (const h of hits) {
    console.error(`  ${h.file}`);
    console.error(`    …${h.snippet}…\n`);
  }
  process.exit(1);
}

console.log(`launch-gate: no "TBC" in ${files.length} HTML file(s).`);
