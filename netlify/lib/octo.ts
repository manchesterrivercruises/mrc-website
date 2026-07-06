// Shared OCTO plumbing — the read-only Ventrata OCTO helpers used by the availability
// proxies (day-finder) and the What's On event-day feed (event-days). Keeping this in one
// place means both reuse the same auth header, capabilities, bounded concurrency, option
// resolution and from-price logic. Server-side only — the OCTO key never reaches the client.

export const OCTO_BASE = process.env.VENTRATA_OCTO_BASE ?? 'https://api.ventrata.com/octo';
export const CAPABILITIES = 'octo/pricing';

export function octoHeaders(key: string): Record<string, string> {
  return {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    // MANDATORY on every OCTO request (see docs/ventrata-integration.md).
    'Octo-Capabilities': CAPABILITIES,
  };
}

export async function octoGet(path: string, key: string): Promise<unknown> {
  const r = await fetch(`${OCTO_BASE}${path}`, { headers: octoHeaders(key) });
  if (!r.ok) throw new Error(`GET ${path} -> ${r.status}`);
  return r.json();
}

export async function octoPost(path: string, key: string, body: unknown): Promise<unknown> {
  const r = await fetch(`${OCTO_BASE}${path}`, {
    method: 'POST',
    headers: octoHeaders(key),
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`POST ${path} -> ${r.status}`);
  return r.json();
}

// Bounded-concurrency map. Callers must swallow their own per-item errors so one failure
// never sinks the whole aggregate.
export async function mapConcurrent<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
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

// From-price (pounds) from a unit-pricing array (availability slot `unitPricing` OR calendar
// `unitPricingFrom` — same shape): cheapest ADULT retail > 0, else cheapest non-zero retail.
// null when no priced unit.
export function priceFromUnits(units: unknown): number | null {
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

export interface OctoTarget {
  productId: string;
  optionId: string;
}

// Resolve each ALLOWED product to its bookable option id (availability needs a real optionId;
// 'DEFAULT' is rejected for MRC products). One GET /products, filtered by the allowlist.
export async function resolveTargets(key: string, isAllowed: (id: string) => boolean): Promise<OctoTarget[]> {
  const products = await octoGet('/products', key);
  const targets: OctoTarget[] = [];
  if (Array.isArray(products)) {
    for (const p of products as Array<Record<string, unknown>>) {
      if (!p || typeof p.id !== 'string' || !isAllowed(p.id)) continue;
      const opts = Array.isArray(p.options) ? (p.options as Array<Record<string, unknown>>) : [];
      const opt = opts.find((o) => o && o.default) || opts[0];
      if (opt && typeof opt.id === 'string') targets.push({ productId: p.id, optionId: opt.id });
    }
  }
  return targets;
}
