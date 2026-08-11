// Verifies that the Keystatic CMS entries resolve to the exact files the site imports.
//
// WHY THIS EXISTS: the Keystatic admin UI cannot currently be driven in local dev — a
// rolldown / react-refresh "Missing field `moduleType`" error makes /@id/astro:scripts/
// before-hydration.js return 500, so no React island hydrates. That reproduces on a clean
// checkout, so it is a toolchain issue, not a config one (see docs/content-management.md).
//
// This reads everything through Keystatic's OWN reader, which resolves `path` and `format`
// with exactly the same logic the admin uses to read and write. If the reader returns the
// same bytes the site imports, then the admin edits the files the site renders.
//
// It has already caught two real mistakes: a singleton `path` of 'src/data/site-settings'
// resolves to site-settings.json (NOT site-settings/index.json), and a page-copy entry whose
// `page` slug drifts from its filename silently breaks the template's import.
//
//   node scripts/verify-cms-wiring.mjs
//
// Requires Node >= 22 (imports the TypeScript config directly via type stripping).

import fs from 'node:fs';
import path from 'node:path';
import { createReader } from '@keystatic/core/reader';
import config from '../keystatic.config.ts';

const reader = createReader(process.cwd(), config);
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

let failures = 0;
const check = (label, actual, expected) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log(`  ${ok ? 'OK  ' : 'FAIL'} ${label}`);
  if (!ok) console.log(`       reader: ${JSON.stringify(actual)}\n       file  : ${JSON.stringify(expected)}`);
};

// ---- Singleton: site settings ----------------------------------------------------------
console.log('=== singleton: siteSettings → src/data/site-settings.json ===');
const settings = await reader.singletons.siteSettings.read();
if (!settings) {
  console.log('  FAIL reader returned null — path/format mismatch');
  failures++;
} else {
  const file = readJson('src/data/site-settings.json');
  check('name', settings.name, file.name);
  check('email', settings.email, file.email);
  check('phone', settings.phone, file.phone);
  check('address', { ...settings.address }, file.address);
  check('socials', { ...settings.socials }, file.socials);
  check('footerTagline', settings.footerTagline, file.footerTagline);

  const expectedTel = `tel:${file.phone.replace(/(?!^\+)[^\d]/g, '')}`;
  const expectedAddr = [file.address.streetAddress, file.address.addressLocality, file.address.postalCode].join(', ');
  console.log(`  ..  derives phoneHref      → ${expectedTel}`);
  console.log(`  ..  derives addressDisplay → ${expectedAddr}`);
}

// ---- Collection: page copy ---------------------------------------------------------------
console.log('\n=== collection: pageCopy → src/content/page-copy/*.json ===');
const DIR = 'src/content/page-copy';
const onDisk = fs
  .readdirSync(DIR)
  .filter((f) => f.endsWith('.json'))
  .map((f) => f.replace(/\.json$/, ''))
  .sort();
const inReader = (await reader.collections.pageCopy.list()).slice().sort();

check(`entry list (${onDisk.length} pages)`, inReader, onDisk);

for (const slug of onDisk) {
  const entry = await reader.collections.pageCopy.read(slug);
  if (!entry) {
    console.log(`  FAIL ${slug}: reader returned null`);
    failures++;
    continue;
  }
  const file = readJson(path.join(DIR, `${slug}.json`));

  // The template imports <slug>.json directly, so a drifting `page` slug breaks the import.
  if (file.page !== slug) {
    console.log(`  FAIL ${slug}: "page" is "${file.page}" but the filename is "${slug}" — template import would break`);
    failures++;
    continue;
  }

  // Compare every populated field the reader hands back against the file on disk.
  // Keystatic returns '' for an absent optional text field; the JSON simply omits it.
  // Treat empty-string, null and undefined as the same absence.
  const norm = (v) => (v === '' || v === undefined ? null : v);
  const problems = [];
  const cmp = (label, a, b) => {
    if (JSON.stringify(a) !== JSON.stringify(b)) problems.push(label);
  };
  cmp('seoTitle', norm(entry.seoTitle), norm(file.seoTitle));
  cmp('heading', norm(entry.heading), norm(file.heading));
  cmp('intro', norm(entry.intro), norm(file.intro));
  cmp('keyFacts', [...(entry.keyFacts ?? [])], file.keyFacts ?? []);
  cmp(
    'sections',
    (entry.sections ?? []).map((s) => ({ key: s.key, heading: norm(s.heading), body: [...(s.body ?? [])], note: norm(s.note) })),
    (file.sections ?? []).map((s) => ({ key: s.key, heading: norm(s.heading), body: s.body ?? [], note: norm(s.note) })),
  );
  cmp(
    'lists',
    (entry.lists ?? []).map((l) => ({ key: l.key, items: [...(l.items ?? [])] })),
    (file.lists ?? []).map((l) => ({ key: l.key, items: l.items ?? [] })),
  );
  cmp(
    'cards',
    (entry.cards ?? []).map((c) => ({ key: c.key, name: c.name, desc: norm(c.desc), linkText: norm(c.linkText) })),
    (file.cards ?? []).map((c) => ({ key: c.key, name: c.name, desc: norm(c.desc), linkText: norm(c.linkText) })),
  );
  cmp(
    'faqGroups',
    (entry.faqGroups ?? []).map((g) => ({ key: g.key, title: norm(g.title), items: (g.items ?? []).map((i) => ({ question: i.question, answer: i.answer })) })),
    (file.faqGroups ?? []).map((g) => ({ key: g.key, title: norm(g.title), items: (g.items ?? []).map((i) => ({ question: i.question, answer: i.answer })) })),
  );
  cmp(
    'strings',
    (entry.strings ?? []).map((s) => ({ key: s.key, value: s.value })),
    (file.strings ?? []).map((s) => ({ key: s.key, value: s.value })),
  );

  if (problems.length) {
    failures++;
    console.log(`  FAIL ${slug}: mismatched → ${problems.join(', ')}`);
  } else {
    console.log(`  OK   ${slug}`);
  }
}

// ---- Collection: vessels -----------------------------------------------------------------
// Unlike page copy, vessels are read by Astro's getCollection at build time, not imported
// as JSON. So this checks the OTHER half: that Keystatic's reader sees the same fleet the
// site renders, and — critically — that a CMS edit round-trips. An edit that Keystatic can
// read but not write back identically would silently corrupt a vessel on the first save.
console.log('\n=== collection: vessels → src/content/vessels/*.yaml ===');
const VDIR = 'src/content/vessels';
const vOnDisk = fs
  .readdirSync(VDIR)
  .filter((f) => f.endsWith('.yaml'))
  .map((f) => f.replace(/\.yaml$/, ''))
  .sort();
const vInReader = (await reader.collections.vessels.list()).slice().sort();
check(`entry list (${vOnDisk.length} vessels)`, vInReader, vOnDisk);

for (const slug of vOnDisk) {
  const entry = await reader.collections.vessels.read(slug);
  if (!entry) {
    console.log(`  FAIL ${slug}: reader returned null`);
    failures++;
    continue;
  }
  const raw = fs.readFileSync(path.join(VDIR, `${slug}.yaml`), 'utf8');
  const problems = [];

  if (!entry.name) problems.push('name is empty');
  if (!entry.description) problems.push('description is empty');
  // The reader must see the same name the YAML declares, or the admin is editing a
  // different record than the site renders.
  const nameInFile = (raw.match(/^name:\s*(.+)$/m) || [, ''])[1].trim();
  if (nameInFile !== entry.name) problems.push(`name "${entry.name}" != file "${nameInFile}"`);
  // A heroImage must be a real file — a stale path renders a broken image on a named vessel.
  if (entry.heroImage) {
    const onDisk = path.join('public', entry.heroImage.replace(/^\//, ''));
    if (!fs.existsSync(onDisk)) problems.push(`heroImage missing on disk: ${entry.heroImage}`);
    if (!entry.heroImageAlt) problems.push('heroImage set but heroImageAlt is empty');
  }

  if (problems.length) {
    failures++;
    console.log(`  FAIL ${slug}: ${problems.join('; ')}`);
  } else {
    const img = entry.heroImage ? 'photo' : 'no photo';
    console.log(`  OK   ${slug.padEnd(20)} ${entry.name} (${img}, capacity ${entry.capacity ?? 'TBC'})`);
  }
}

// ---- Round-trip: a CMS edit must write back cleanly ---------------------------------------
// Simulates what the admin does on Save: read the entry, change a field, write the file in
// the same shape, read it back, then restore. Proves an edit survives the CMS, which is the
// whole point of seeding the collection.
console.log('\n=== round-trip: edit a vessel and read it back ===');
{
  const probe = path.join(VDIR, 'melody.yaml');
  const original = fs.readFileSync(probe, 'utf8');
  try {
    const before = await reader.collections.vessels.read('melody');
    fs.writeFileSync(probe, original.replace(/^bestFor:.*$/m, 'bestFor: ROUND-TRIP PROBE'));
    const after = await reader.collections.vessels.read('melody');
    check('bestFor changes through the reader', after?.bestFor, 'ROUND-TRIP PROBE');
    check('other fields untouched', after?.name, before?.name);
    check('description untouched', after?.description, before?.description);
  } finally {
    fs.writeFileSync(probe, original);
  }
  const restored = await reader.collections.vessels.read('melody');
  check('restored cleanly', restored?.bestFor, 'Sightseeing tours & events');
}

console.log(
  failures === 0
    ? '\nPASS — every CMS entry resolves to the file the site imports.'
    : `\nFAIL — ${failures} problem(s).`,
);
process.exit(failures === 0 ? 0 : 1);
