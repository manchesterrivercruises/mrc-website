// Netlify Function — OCTO-powered "Find your date" data source.
//
// GET ?month=YYYY-MM  → { dates: ['YYYY-MM-DD', ...] } — which dates have ANY availability
// GET ?date=YYYY-MM-DD → { departures: [{ productId, time, priceFrom }] } — that day's slots
//
// Fans over the confirmed PUBLIC product allowlist against /octo/availability/calendar
// (month) and /octo/availability (day) with bounded concurrency, then aggregates. The OCTO
// key is server-side only. Every OCTO request carries the mandatory Octo-Capabilities header
// (see docs/ventrata-integration.md). Cached 10 minutes.
//
// Pricing: from-prices come from the availability slot's `unitPricing` — the min ADULT
// `retail` (falling back to the min non-zero retail across units), in GBP (currencyPrecision
// 2 → pounds). Confirmed against the live MRC key.

import { withGuard, jsonError } from '../lib/guard';
import { isAllowedProductId } from '../lib/products';
import { readDayFinderQuery } from '../lib/validate';

const OCTO_BASE = process.env.VENTRATA_OCTO_BASE ?? 'https://api.ventrata.com/octo';
const CAPABILITIES = 'octo/pricing';
const CONCURRENCY = 6;

function octoHeaders(key: string): Record<string, string> {
  return {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    'Octo-Capabilities': CAPABILITIES,
  };
}

async function octoGet(path: string, key: string): Promise<unknown> {
  const r = await fetch(`${OCTO_BASE}${path}`, { headers: octoHeaders(key) });
  if (!r.ok) throw new Error(`GET ${path} -> ${r.status}`);
  return r.json();
}

async function octoPost(path: string, key: string, body: unknown): Promise<unknown> {
  const r = await fetch(`${OCTO_BASE}${path}`, {
    method: 'POST',
    headers: octoHeaders(key),
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`POST ${path} -> ${r.status}`);
  return r.json();
}

// Bounded-concurrency map. Individual item failures are the caller's responsibility to
// swallow (so one product never fails the whole aggregate).
async function mapConcurrent<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  const worker = async () => {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

function monthRange(month: string): { start: string; end: string } {
  const [y, m] = month.split('-').map(Number);
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate(); // day 0 of next month = last day of this
  return { start: `${month}-01`, end: `${month}-${String(last).padStart(2, '0')}` };
}

function hhmm(iso: unknown): string {
  return typeof iso === 'string' && iso.length >= 16 ? iso.slice(11, 16) : '';
}

// From-price (pounds) from a slot's unitPricing: cheapest ADULT retail > 0, else cheapest
// non-zero retail across units. null when no priced unit.
function priceFromUnits(units: unknown): number | null {
  if (!Array.isArray(units)) return null;
  const priced = units.filter(
    (u): u is { unitType?: string; retail: number; currencyPrecision?: number } =>
      !!u && typeof (u as { retail?: unknown }).retail === 'number' && (u as { retail: number }).retail > 0,
  );
  const adult = priced.filter((u) => u.unitType === 'ADULT');
  const pool = adult.length ? adult : priced;
  if (!pool.length) return null;
  const min = Math.min(...pool.map((u) => u.retail));
  const prec = typeof pool[0].currencyPrecision === 'number' ? pool[0].currencyPrecision : 2;
  return Math.round((min / Math.pow(10, prec)) * 100) / 100;
}

function json(payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      // Cache 10 minutes (browser + Netlify durable CDN, stale-while-revalidate).
      'Cache-Control': 'public, max-age=600',
      'Netlify-CDN-Cache-Control': 'public, durable, s-maxage=600, stale-while-revalidate=300',
    },
  });
}

export default withGuard(async (request: Request): Promise<Response> => {
  if (request.method !== 'GET') return jsonError('Method not allowed', 405);

  const key = process.env.VENTRATA_OCTO_KEY;
  if (!key) {
    console.error('day-finder: VENTRATA_OCTO_KEY is not configured');
    return jsonError('Service temporarily unavailable', 503);
  }

  const parsed = readDayFinderQuery(new URL(request.url));
  if (!parsed.ok) return jsonError(parsed.message, parsed.status);

  try {
    // Resolve each public product's bookable option id. Availability needs a real optionId —
    // 'DEFAULT' is rejected for MRC products (confirmed against the live API).
    const products = await octoGet('/products', key);
    const targets: Array<{ productId: string; optionId: string }> = [];
    if (Array.isArray(products)) {
      for (const p of products as Array<Record<string, unknown>>) {
        if (!p || typeof p.id !== 'string' || !isAllowedProductId(p.id)) continue;
        const opts = Array.isArray(p.options) ? (p.options as Array<Record<string, unknown>>) : [];
        const opt = opts.find((o) => o && o.default) || opts[0];
        if (opt && typeof opt.id === 'string') targets.push({ productId: p.id, optionId: opt.id });
      }
    }

    if (parsed.value.mode === 'month') {
      const { start, end } = monthRange(parsed.value.month);
      const per = await mapConcurrent(targets, CONCURRENCY, async ({ productId, optionId }) => {
        try {
          const cal = await octoPost('/availability/calendar', key, {
            productId,
            optionId,
            localDateStart: start,
            localDateEnd: end,
          });
          return Array.isArray(cal)
            ? cal
                .filter((d) => d && (d as { available?: unknown }).available)
                .map((d) => (d as { localDate?: unknown }).localDate)
                .filter((x): x is string => typeof x === 'string')
            : [];
        } catch (e) {
          console.error(`day-finder: calendar ${productId} failed —`, (e as Error).message);
          return [];
        }
      });
      const dates = [...new Set(per.flat())].sort();
      return json({ dates });
    }

    // day mode
    const date = parsed.value.date;
    const per = await mapConcurrent(targets, CONCURRENCY, async ({ productId, optionId }) => {
      try {
        const slots = await octoPost('/availability', key, {
          productId,
          optionId,
          localDateStart: date,
          localDateEnd: date,
        });
        return Array.isArray(slots)
          ? slots
              .filter((s) => s && (s as { available?: unknown }).available)
              .map((s) => ({
                productId,
                time: hhmm((s as { localDateTimeStart?: unknown }).localDateTimeStart),
                priceFrom: priceFromUnits((s as { unitPricing?: unknown }).unitPricing),
              }))
          : [];
      } catch (e) {
        console.error(`day-finder: availability ${productId} failed —`, (e as Error).message);
        return [];
      }
    });
    const departures = per.flat().filter((d) => d.time).sort((a, b) => a.time.localeCompare(b.time));
    return json({ departures });
  } catch (e) {
    console.error('day-finder: failed —', (e as Error).message);
    return jsonError('Upstream service error', 502);
  }
});
