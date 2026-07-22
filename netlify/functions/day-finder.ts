// Netlify Function — OCTO-powered "Find your date" data source.
//
// GET ?month=YYYY-MM  → { dates: [...available], soldOut: [...sold-out-only] } — which dates have
//                       ANY availability, plus dates whose scheduled sailings are ALL sold out
//                       (SOLD_OUT with nothing bookable) so the grid can offer the waitlist path.
// GET ?date=YYYY-MM-DD → { departures: [{ productId, time, priceFrom, state }] } — that day's slots,
//                       state = 'available' | 'sold-out' (sold-out drives the "Join waitlist" button).
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

// Normalise the month blob into { available, soldOut }, tolerating a stale PRE-UPGRADE blob
// (a bare array of available dates) still inside its TTL window right after a deploy.
function normMonth(v: unknown): { available: string[]; soldOut: string[] } {
  const strs = (x: unknown): string[] =>
    Array.isArray(x) ? x.filter((s): s is string => typeof s === 'string') : [];
  if (Array.isArray(v)) return { available: strs(v), soldOut: [] };
  const o = (v ?? {}) as { available?: unknown; soldOut?: unknown };
  return { available: strs(o.available), soldOut: strs(o.soldOut) };
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
      const agg = await withBlobCache(store, `month/${month}`, MONTH_TTL_MS, async () => {
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
            const avail: string[] = [];
            const sold: string[] = [];
            if (Array.isArray(cal)) {
              for (const d of cal as Array<Record<string, unknown>>) {
                const ld = d?.localDate;
                if (typeof ld !== 'string') continue;
                if (d.available) avail.push(ld);
                // SOLD_OUT = scheduled but full → waitlist. CLOSED (not on sale) is deliberately skipped.
                else if (d.status === 'SOLD_OUT') sold.push(ld);
              }
            }
            return { avail, sold };
          } catch (e) {
            console.error(`day-finder: calendar ${productId} failed —`, (e as Error).message);
            return { avail: [] as string[], sold: [] as string[] };
          }
        });
        const availSet = new Set(per.flatMap((p) => p.avail));
        // A date bookable via ANY product counts as available (the sold-out product still surfaces in
        // the day view with a waitlist button). Only dates whose scheduled sailings are ALL sold out
        // are flagged sold-out in the month grid.
        const soldOut = [...new Set(per.flatMap((p) => p.sold))].filter((d) => !availSet.has(d)).sort();
        return { available: [...availSet].sort(), soldOut };
      });
      const month_ = normMonth(agg);
      return json({ dates: month_.available, soldOut: month_.soldOut });
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
          // OCTO returns only scheduled + on-sale slots (CLOSED days come back empty), so each slot
          // is either available or SOLD_OUT — surface both; sold-out drives the waitlist button.
          return Array.isArray(slots)
            ? slots
                .filter((s) => {
                  const st = s as { available?: unknown; status?: unknown };
                  return !!s && (st.available === true || st.status === 'SOLD_OUT');
                })
                .map((s) => {
                  const st = s as { available?: unknown; localDateTimeStart?: unknown; unitPricing?: unknown };
                  return {
                    productId,
                    time: hhmm(st.localDateTimeStart),
                    priceFrom: priceFromUnits(st.unitPricing),
                    state: st.available === true ? 'available' : 'sold-out',
                  };
                })
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
