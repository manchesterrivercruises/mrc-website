// Verifies that the Keystatic singletons resolve to the exact files the site imports.
//
// WHY THIS EXISTS: the Keystatic admin UI cannot currently be driven in local dev — a
// rolldown / react-refresh "Missing field `moduleType`" error makes /@id/astro:scripts/
// before-hydration.js return 500, so no React island hydrates. That reproduces on a clean
// checkout with the CMS changes stashed, so it is a toolchain issue, not a config one.
//
// This reads both singletons through Keystatic's OWN reader, which resolves `path` and
// `format` with exactly the same logic the admin uses to read and write. If the reader
// returns the same bytes the site imports, then the admin edits the file the site renders.
// It caught a real mistake: a singleton `path` of 'src/data/site-settings' resolves to
// src/data/site-settings.json, NOT site-settings/index.json.
//
//   node scripts/verify-cms-singletons.mjs
//
// Requires Node >= 22 (imports the TypeScript config directly via type stripping).

import fs from 'node:fs';
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

// ---- Site settings ---------------------------------------------------------------------
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

  // The NAP guarantee: derived values must follow the edited parts, so the displayed
  // address/phone can never drift from the structured ones.
  const expectedTel = `tel:${file.phone.replace(/(?!^\+)[^\d]/g, '')}`;
  const expectedAddr = [file.address.streetAddress, file.address.addressLocality, file.address.postalCode].join(', ');
  console.log(`  ..  derives phoneHref      → ${expectedTel}`);
  console.log(`  ..  derives addressDisplay → ${expectedAddr}`);
}

// ---- Private hire page copy ------------------------------------------------------------
console.log('\n=== singleton: pagePrivateHire → src/content/pages/private-hire.json ===');
const page = await reader.singletons.pagePrivateHire.read();
if (!page) {
  console.log('  FAIL reader returned null — path/format mismatch');
  failures++;
} else {
  const file = readJson('src/content/pages/private-hire.json');
  check('heroHeading', page.heroHeading, file.heroHeading);
  check('aboutBody', page.aboutBody, file.aboutBody);
  check('christmasHeading', page.christmasHeading, file.christmasHeading);
  check('schoolsBody', page.schoolsBody, file.schoolsBody);
  check('keyFacts', [...page.keyFacts], file.keyFacts);
  check('occasions', [...page.occasions], file.occasions);
  check('faq count', page.faqs.length, file.faqs.length);
  check('first FAQ', { question: page.faqs[0].question, answer: page.faqs[0].answer }, file.faqs[0]);
}

console.log(
  failures === 0
    ? '\nPASS — both singletons resolve to the files the site imports.'
    : `\nFAIL — ${failures} problem(s).`,
);
process.exit(failures === 0 ? 0 : 1);
