// Structured-data gate: fail if any EMITTED JSON-LD contains an unconfirmed "TBC" value.
//
// This is deliberately SEPARATE from scripts/launch-gate.mjs. That script fails on "TBC"
// anywhere in the built HTML, which is correct for cutover but fails today — the site still
// shows TBC placeholders in visible copy on purpose, while Simon confirms the details.
//
// The JSON-LD subset is different in kind, and enforceable RIGHT NOW: visible "(TBC)" is
// honest (a reader sees it is provisional), but the same text inside <script
// type="application/ld+json"> is a factual claim made to a search engine. Google's
// structured-data policy requires schema to reflect real page content, and rich results built
// from a placeholder answer are wrong-by-construction. So: zero tolerance in schema, tolerated
// in visible copy until launch.
//
// Wired into the PR CI workflow (.github/workflows/ci.yml) so a new TBC answer cannot reach
// production inside schema:
//
//   npm run build && npm run check-schema
//
// Also validates that every JSON-LD block PARSES — a malformed block is invisible to us but
// silently discards the whole graph for Google.

import fs from 'node:fs';
import path from 'node:path';

const DIST = path.join(process.cwd(), 'dist');

if (!fs.existsSync(DIST)) {
  console.error('check-schema: dist/ not found. Run `npm run build` first.');
  process.exit(1);
}

/** @param {string} dir @returns {string[]} */
function htmlFiles(dir) {
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
  console.error('check-schema: no HTML files under dist/.');
  process.exit(1);
}

const LD_RE = /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
/** Walk a parsed JSON-LD value, yielding every string with its dotted path. */
function* strings(node, trail = '') {
  if (typeof node === 'string') {
    yield [trail, node];
  } else if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) yield* strings(node[i], `${trail}[${i}]`);
  } else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) yield* strings(v, trail ? `${trail}.${k}` : k);
  }
}

const tbcHits = [];
const parseErrors = [];
let blocks = 0;

for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  const rel = path.relative(DIST, file).split(path.sep).join('/');
  LD_RE.lastIndex = 0;
  let m;
  while ((m = LD_RE.exec(html))) {
    blocks++;
    let parsed;
    try {
      parsed = JSON.parse(m[1]);
    } catch (e) {
      parseErrors.push({ file: rel, error: String(e.message || e) });
      continue;
    }
    for (const [where, value] of strings(parsed)) {
      // \bTBC\b, case-insensitive: catches "(TBC)", "TBC.", and a trailing "times TBC".
      if (/\bTBC\b/i.test(value)) {
        tbcHits.push({ file: rel, where, value: value.length > 110 ? value.slice(0, 107) + '…' : value });
      }
    }
  }
}

let failed = false;

if (parseErrors.length) {
  failed = true;
  console.error(`check-schema: ${parseErrors.length} JSON-LD block(s) failed to parse:\n`);
  for (const p of parseErrors) console.error(`  ${p.file}\n    ${p.error}\n`);
}

if (tbcHits.length) {
  failed = true;
  console.error(
    `check-schema: ${tbcHits.length} "TBC" value(s) inside emitted JSON-LD — schema must only ` +
      `assert CONFIRMED facts. Filter them out of the schema (see schemaSafeFaqs in ` +
      `src/lib/pageCopy.ts); the visible copy can keep its marker.\n`,
  );
  for (const h of tbcHits) {
    console.error(`  ${h.file}`);
    console.error(`    ${h.where}`);
    console.error(`    "${h.value}"\n`);
  }
}

if (failed) process.exit(1);

console.log(`check-schema: ${blocks} JSON-LD block(s) across ${files.length} page(s) — all parse, none assert a TBC value.`);
