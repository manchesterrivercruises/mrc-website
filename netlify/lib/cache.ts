// Shared Netlify Blobs cache for the read-only upstream proxies.
//
// Extracted verbatim from day-finder, which has run this pattern in production; event-days and
// reviews now use the same code rather than three near-copies that can drift.
//
// WHY BLOBS AS WELL AS THE CDN. Every one of these functions already sets a durable
// Netlify-CDN-Cache-Control, and that absorbs most repeat traffic. But a CDN miss — cold start,
// a new edge node, an expired window, or a cache-busting query — goes straight to the upstream
// fan-out. Blobs is the shared second tier behind the CDN: on a miss the function reads ONE
// aggregated blob instead of re-paying an ~19-product OCTO fan-out or a Places call. That is
// what turns "expensive on a cache miss" into "cheap on a cache miss", which is the whole point
// under rate-limit pressure.
//
// DEGRADES GRACEFULLY. If Blobs is unavailable (not configured, transient error) the store is
// null and every path just computes as before. A cache is never allowed to become a hard
// dependency of a page rendering.

import { getStore } from '@netlify/blobs';

/** A Blobs store, or null if Blobs is unavailable in this environment. */
export function safeStore(name: string) {
  try {
    return getStore(name);
  } catch {
    return null;
  }
}

/**
 * Read `key` from `store` if present and younger than `ttlMs`, else run `producer` and write
 * the result back. The stored envelope is `{ t: <written-at-ms>, v: <value> }` — the TTL is
 * enforced HERE on read rather than relying on any store-side expiry, so the same blob can be
 * read with a different TTL later without surprises.
 *
 * Keying discipline (same as day-finder): the key must contain every input that changes the
 * value — `month/2026-09`, `date/2026-09-12` — and nothing else. Never key on anything
 * attacker-controlled beyond the validated inputs, or an unbounded key space lets a caller
 * fill the store.
 */
export async function withBlobCache<T>(
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
      /* best-effort write — never fail the request because the cache write failed */
    }
  }
  return v;
}
