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

import { getStore } from '@netlify/blobs';
import { withGuard, jsonError } from '../lib/guard';
import { isAllowedProductId } from '../lib/products';
import { readDayFinderQuery } from '../lib/validate';
import { octoPost, mapConcurrent, priceFromUnits, resolveTargets } from '../lib/octo';

const CONCURRENCY = 6;
// Blobs TTLs. The month view (which dates have ANY availability) changes slowly, so amortize the
// expensive ~19-product fan-out over an hour. The day view (a date's departures/times) stays
// short — it's closer to the booking decision. Either way the checkout widget revalidates live
// at booking time, so a slightly-stale calendar mark costs nothing real. (The CDN Cache-Control
// on the response is still 10 min for both — CDN revalidations within the hour are served from
// Blobs without re-fanning-out.)
const MONTH_TTL_MS = 60 * 60 * 1000; // 60 min
const DAY_TTL_MS = 10 * 60 * 1000; // 10 min

// Netlify Blobs shared cache. The CDN durable cache still fronts this, but on a CDN miss (cold
// start, new edge node, expired window) the function reads the aggregated result from Blobs —
// one read — instead of re-paying the ~19-product OCTO fan-out every time. Keyed by month/date,
// per-view TTL. Degrades gracefully: if Blobs is unavailable the store is null and we always compute.
function safeStore(name: string) {
  try {
    return getStore(name);
  } catch {
    return null;
  }
}

async function withBlobCache<T>(
  store: ReturnType<typeof safeStore>,
  key: string,
  ttlMs: number,
  producer: () => Promise<T>,
): Promise<T> {
  if (store) {
    try {
      const hit = (await store.get(key, { type: 'json' })) as { t: number; v: T } | null;
      if (hit && typeof hit.t === 'number' && Date.now() - hit.t < ttlMs) return hit.v;
    } catch {
      /* unreadable/absent — fall through and compute */
    }
  }
  const v = await producer();
  if (store) {
    try {
      await store.setJSON(key, { t: Date.now(), v });
    } catch {
      /* best-effort write */
    }
  }
  return v;
}

function monthRange(month: string): { start: string; end: string } {
  const [y, m] = month.split('-').map(Number);
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate(); // day 0 of next month = last day of this
  return { start: `${month}-01`, end: `${month}-${String(last).padStart(2, '0')}` };
}

function hhmm(iso: unknown): string {
  return typeof iso === 'string' && iso.length >= 16 ? iso.slice(11, 16) : '';
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

  const store = safeStore('day-finder');

  try {
    // resolveTargets + the fan-out live INSIDE the cache producer, so a Blobs hit skips the
    // GET /products option resolution AND the per-product fan-out entirely.
    if (parsed.value.mode === 'month') {
      const month = parsed.value.month;
      const dates = await withBlobCache(store, `month/${month}`, MONTH_TTL_MS, async () => {
        const targets = await resolveTargets(key, isAllowedProductId);
        const { start, end } = monthRange(month);
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
        return [...new Set(per.flat())].sort();
      });
      return json({ dates });
    }

    // day mode
    const date = parsed.value.date;
    const departures = await withBlobCache(store, `date/${date}`, DAY_TTL_MS, async () => {
      const targets = await resolveTargets(key, isAllowedProductId);
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
      return per.flat().filter((d) => d.time).sort((a, b) => a.time.localeCompare(b.time));
    });
    return json({ departures });
  } catch (e) {
    console.error('day-finder: failed —', (e as Error).message);
    return jsonError('Upstream service error', 502);
  }
});
