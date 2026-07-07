// Netlify Function — What's On event-day feed.
//
// GET → { eventDays: [{ productId, date, priceFrom, state }] }
//
// One entry per PRODUCT×DATE that is on sale in the next ~3 months (so e.g. ABBA on the
// 12th and the 19th are two entries → two cards). Fans /octo/availability/calendar over the
// public allowlist in sequential ≤62-day windows (the OCTO range cap), collapses each date
// to its min from-price and an availability state. Server-side key; cached 15 minutes.

import { withGuard, jsonError } from '../lib/guard';
import { isAllowedProductId } from '../lib/products';
import { octoPost, mapConcurrent, priceFromUnits, resolveTargets } from '../lib/octo';

const CONCURRENCY = 6;
const HORIZON_DAYS = 92; // ~3 months
const WINDOW_DAYS = 60; // ≤ 62-day OCTO cap

export type EventDayState = 'available' | 'limited' | 'sold-out';
export interface EventDay {
  productId: string;
  date: string; // YYYY-MM-DD
  priceFrom: number | null;
  state: EventDayState;
}

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// Sequential ≤62-day windows covering today .. today+HORIZON.
function windows(now: Date): Array<{ start: string; end: string }> {
  const out: Array<{ start: string; end: string }> = [];
  for (let offset = 0; offset <= HORIZON_DAYS; offset += WINDOW_DAYS) {
    const start = new Date(now);
    start.setUTCDate(start.getUTCDate() + offset);
    const end = new Date(now);
    end.setUTCDate(end.getUTCDate() + Math.min(offset + WINDOW_DAYS - 1, HORIZON_DAYS));
    out.push({ start: iso(start), end: iso(end) });
  }
  return out;
}

// Map an OCTO calendar entry to an event-day state, or null to skip (closed / not on sale).
function stateOf(entry: Record<string, unknown>): EventDayState | null {
  const sc = String(entry.statusCode ?? entry.status ?? '').toUpperCase();
  if (sc === 'SOLD_OUT' || sc === 'SOLDOUT') return 'sold-out';
  if (entry.available !== true) return null; // CLOSED / no service that day
  if (sc === 'LIMITED') return 'limited';
  const vac = entry.vacancies;
  const cap = entry.capacity;
  if (typeof vac === 'number' && typeof cap === 'number' && cap > 0 && vac / cap <= 0.15) return 'limited';
  return 'available';
}

function json(payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      // Cache 15 minutes (browser + Netlify durable CDN, stale-while-revalidate).
      'Cache-Control': 'public, max-age=900',
      'Netlify-CDN-Cache-Control': 'public, durable, s-maxage=900, stale-while-revalidate=300',
    },
  });
}

export default withGuard(async (request: Request): Promise<Response> => {
  if (request.method !== 'GET') return jsonError('Method not allowed', 405);

  const key = process.env.VENTRATA_OCTO_KEY;
  if (!key) {
    console.error('event-days: VENTRATA_OCTO_KEY is not configured');
    return jsonError('Service temporarily unavailable', 503);
  }

  try {
    const targets = await resolveTargets(key, isAllowedProductId);
    const now = new Date();
    const wins = windows(now);

    // One task per product × window; per-item failures degrade to [] (partial data ok).
    const jobs = targets.flatMap((t) => wins.map((w) => ({ ...t, ...w })));
    const results = await mapConcurrent(jobs, CONCURRENCY, async (jobUnknown) => {
      const job = jobUnknown as { productId: string; optionId: string; start: string; end: string };
      try {
        const cal = await octoPost('/availability/calendar', key, {
          productId: job.productId,
          optionId: job.optionId,
          localDateStart: job.start,
          localDateEnd: job.end,
        });
        if (!Array.isArray(cal)) return [] as EventDay[];
        const days: EventDay[] = [];
        for (const eUnknown of cal) {
          const e = eUnknown as Record<string, unknown>;
          const date = e.localDate;
          if (typeof date !== 'string') continue;
          const state = stateOf(e);
          if (!state) continue;
          days.push({
            productId: job.productId,
            date,
            priceFrom: priceFromUnits(e.unitPricingFrom),
            state,
          });
        }
        return days;
      } catch (err) {
        console.error(`event-days: calendar ${job.productId} ${job.start} failed —`, (err as Error).message);
        return [] as EventDay[];
      }
    });

    // Flatten + dedupe by product×date (windows don't overlap, but guard anyway), sorted by date.
    const seen = new Set<string>();
    const eventDays: EventDay[] = [];
    for (const d of results.flat()) {
      const k = `${d.productId}|${d.date}`;
      if (seen.has(k)) continue;
      seen.add(k);
      eventDays.push(d);
    }
    eventDays.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

    return json({ eventDays });
  } catch (err) {
    console.error('event-days: failed —', (err as Error).message);
    return jsonError('Upstream service error', 502);
  }
});
