// Netlify Function — proxy the read-only OCTO /availability/calendar endpoint.
//
// POST body: { productId, optionId?, localDateStart, localDateEnd }
// Returns month-view (per-date) availability for calendar display.
// NOTE: the correct OCTO endpoint is /availability/calendar — NOT /calendar.
//
// The OCTO connection key (VENTRATA_OCTO_KEY) is server-side only — never in the DOM.
// Cache: micro-cache 1 minute with stale-while-revalidate up to 3 minutes.

import { withGuard, jsonError } from '../lib/guard';

const OCTO_BASE = process.env.VENTRATA_OCTO_BASE ?? 'https://api.ventrata.com/octo';

export default withGuard(async (request: Request): Promise<Response> => {
  if (request.method !== 'POST') {
    return jsonError('Method not allowed', 405);
  }

  const key = process.env.VENTRATA_OCTO_KEY;
  if (!key) {
    return jsonError('VENTRATA_OCTO_KEY is not configured', 500);
  }

  let input: { productId?: string; optionId?: string; localDateStart?: string; localDateEnd?: string };
  try {
    input = await request.json();
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  const { productId, localDateStart, localDateEnd } = input ?? {};
  const optionId = input?.optionId ?? 'DEFAULT';

  if (!productId || !localDateStart || !localDateEnd) {
    return jsonError('productId, localDateStart and localDateEnd are required', 400);
  }

  try {
    const upstream = await fetch(`${OCTO_BASE}/availability/calendar`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId, optionId, localDateStart, localDateEnd }),
    });

    const body = await upstream.text();
    if (!upstream.ok) {
      return jsonError(`OCTO /availability/calendar request failed (${upstream.status})`, upstream.status);
    }

    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // 1-minute cache, serve stale up to 3 minutes while revalidating.
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=180',
        'Netlify-CDN-Cache-Control': 'public, durable, s-maxage=60, stale-while-revalidate=180',
      },
    });
  } catch {
    return jsonError('Failed to reach the OCTO API', 502);
  }
});
