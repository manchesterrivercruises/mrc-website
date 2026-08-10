// ─────────────────────────────────────────────────────────────────────────────
// Page copy — accessors for the Keystatic "Page copy" collection.
//
// Every bespoke page's editable copy lives in src/content/page-copy/<page>.json,
// one entry per page, edited via the CMS. Templates import their own JSON
// synchronously (same reasoning as src/data/site.ts — see docs/content-management.md)
// and read it through the helpers here.
//
// WHY A COLLECTION AND NOT ONE SINGLETON PER PAGE: sixteen singletons would bury the
// sidebar. A collection means ONE schema shared by every page, so the schema has to be
// shape-based (sections, cards, FAQ groups, loose strings) rather than naming each
// page's fields individually. These helpers give the templates back the readability
// that costs — `sec(copy, 'about').heading` instead of a raw .find().
//
// EVERY LOOKUP IS STRICT. A missing key throws at BUILD time with the page and key
// named. That is deliberate: a typo'd key must fail the build, never render an empty
// heading or silently drop a paragraph into the void.
// ─────────────────────────────────────────────────────────────────────────────

export interface CopySection {
  key: string;
  heading?: string;
  body?: string[];
  note?: string;
}
export interface CopyCard {
  key: string;
  name: string;
  desc?: string;
  linkText?: string;
}
export interface CopyFaqItem {
  question: string;
  answer: string;
}
export interface CopyFaqGroup {
  key: string;
  title?: string;
  items: CopyFaqItem[];
}
export interface CopyList {
  key: string;
  items: string[];
}
export interface CopyString {
  key: string;
  value: string;
}

export interface PageCopy {
  page: string;
  seoTitle?: string;
  seoDescription?: string;
  eyebrow?: string;
  heading?: string;
  intro?: string;
  keyFacts?: string[];
  sections?: CopySection[];
  lists?: CopyList[];
  cards?: CopyCard[];
  faqGroups?: CopyFaqGroup[];
  strings?: CopyString[];
}

const fail = (copy: PageCopy, kind: string, key: string): never => {
  throw new Error(
    `[page-copy] ${kind} "${key}" not found in src/content/page-copy/${copy.page}.json. ` +
      `Add it in the CMS (Page copy → ${copy.page}) or fix the key in the template.`,
  );
};

/** A named section: heading, body paragraphs, optional small note. */
export function sec(copy: PageCopy, key: string): CopySection {
  return (copy.sections ?? []).find((s) => s.key === key) ?? fail(copy, 'section', key);
}

/** Just a section's body paragraphs (most common use). */
export function para(copy: PageCopy, key: string): string[] {
  return sec(copy, key).body ?? [];
}

/** A named list of plain strings — bullets, pills, checklist items. */
export function list(copy: PageCopy, key: string): string[] {
  return ((copy.lists ?? []).find((l) => l.key === key) ?? fail(copy, 'list', key)).items ?? [];
}

/** Cards belonging to a group — `name`/`desc`/`linkText` only; every href stays in code. */
export function cards(copy: PageCopy, group: string): CopyCard[] {
  const found = (copy.cards ?? []).filter((c) => c.key.startsWith(`${group}:`));
  if (!found.length) fail(copy, 'card group', group);
  return found;
}

/** One card by its exact key. */
export function card(copy: PageCopy, key: string): CopyCard {
  return (copy.cards ?? []).find((c) => c.key === key) ?? fail(copy, 'card', key);
}

/** A named FAQ group. */
export function faqGroup(copy: PageCopy, key: string): CopyFaqGroup {
  return (copy.faqGroups ?? []).find((g) => g.key === key) ?? fail(copy, 'FAQ group', key);
}

/** FAQ items in the { q, a } shape FAQSection expects. */
export function faqs(copy: PageCopy, key = 'main'): { q: string; a: string }[] {
  return faqGroup(copy, key).items.map((i) => ({ q: i.question, a: i.answer }));
}

/** A one-off label or sentence that doesn't belong to a section. */
export function str(copy: PageCopy, key: string): string {
  return ((copy.strings ?? []).find((s) => s.key === key) ?? fail(copy, 'string', key)).value;
}

/**
 * Fill `{token}` placeholders in a piece of copy from a code-owned data source.
 *
 * Some pages are one template rendered per item — the two ferry departure points
 * being the case in hand. Their wording is the same sentence with the point's name
 * and location dropped in, and the CMS must hold the sentence, not one copy of it
 * per point. So the copy carries tokens ("The {name} ferry departs from {location}.")
 * and the template supplies the values, which stay in code (src/data/mufcFerry.ts).
 *
 * STRICT, like every other lookup here: an unknown token in the copy throws at BUILD
 * time naming the token, rather than rendering a literal "{nmae}" to a customer. The
 * editor can reword freely around a token; deleting one is caught by the build.
 */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_m, token: string) => {
    if (!(token in vars)) {
      throw new Error(
        `[page-copy] unknown placeholder "{${token}}" in copy: "${template}". ` +
          `Known placeholders here: ${Object.keys(vars).join(', ') || '(none)'}.`,
      );
    }
    return String(vars[token]);
  });
}
