import { site } from '../data/site';

// Shared breadcrumb builder. BaseLayout calls this with the current pathname so
// every page emits a BreadcrumbList (Home > [section] > [page]) with no per-page
// wiring. Pages may override by passing a `breadcrumbs` prop to BaseLayout.

export interface Crumb {
  name: string;
  url: string; // absolute
}

// Parent segments of nested routes that need a specific label and/or destination.
// `/cruises/[slug]` product pages have no `/cruises` index, so that crumb points at
// the Events hub instead.
const SECTION_MAP: Record<string, { name: string; url: string }> = {
  cruises: { name: 'Events', url: '/events' },
  discover: { name: 'Discover', url: '/discover' },
  'boat-to-old-trafford': { name: 'Boat to Old Trafford', url: '/boat-to-old-trafford' },
};

// Whole-slug label overrides (apostrophes / acronyms a word map can't cover cleanly).
const LABEL_OVERRIDES: Record<string, string> = {
  'whats-on': "What's On",
  'manage-booking': 'Manage My Booking',
  'boat-to-old-trafford': 'Boat to Old Trafford',
  'stephensons-bridge': "Stephenson's Bridge",
};

// Per-word overrides for acronyms when title-casing a slug.
const WORD_OVERRIDES: Record<string, string> = {
  iwm: 'IWM',
  mufc: 'MUFC',
  faq: 'FAQ',
  abba: 'ABBA',
  sen: 'SEN',
  dj: 'DJ',
};

function labelize(slug: string): string {
  if (LABEL_OVERRIDES[slug]) return LABEL_OVERRIDES[slug];
  return slug
    .split('-')
    .map((w) => WORD_OVERRIDES[w] ?? w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

const abs = (path: string): string => new URL(path, site.url).href;

// Build Home > [section] > [page] from a pathname. Returns [] for the homepage
// (a single-item breadcrumb is pointless — nothing is emitted there).
export function buildBreadcrumbs(pathname: string): Crumb[] {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return [];

  const crumbs: Crumb[] = [{ name: 'Home', url: abs('/') }];
  let acc = '';
  segments.forEach((seg, i) => {
    acc += `/${seg}`;
    const isLast = i === segments.length - 1;
    const section = SECTION_MAP[seg];
    if (!isLast && section) {
      crumbs.push({ name: section.name, url: abs(section.url) });
    } else {
      crumbs.push({ name: labelize(seg), url: abs(acc) });
    }
  });
  return crumbs;
}
