// Netlify Function — proxy the read-only OCTO /availability/calendar endpoint.
//
// POST body: { productId, optionId?, localDateStart, localDateEnd }
// Returns month-view (per-date) availability for calendar display.
// NOTE: the correct OCTO endpoint is /availability/calendar — NOT /calendar.
//
// The OCTO connection key (VENTRATA_OCTO_KEY) is server-side only — never in the DOM.
// Cache: micro-cache 1 minute with stale-while-revalidate up to 3 minutes.

import { withGuard, jsonError } from '../lib/guard';
import { readAvailabilityInput } from '../lib/validate';

const OCTO_BASE = process.env.VENTRATA_OCTO_BASE ?? 'https://api.ventrata.com/octo';

export default withGuard(async (request: Request): Promise<Response> => {
  if (request.method !== 'POST') {
    return jsonError('Method not allowed', 405);
  }

  const key = process.env.VENTRATA_OCTO_KEY;
  if (!key) {
    // Log detail server-side; never name the env var in the client response.
    console.error('availability-calendar: VENTRATA_OCTO_KEY is not configured');
    return jsonError('Service temporarily unavailable', 503);
  }

  // Validate size + every field BEFORE any upstream call. Failures return a 4xx with
  // a generic message.
  const parsed = await readAvailabilityInput(request);
  if (!parsed.ok) {
    return jsonError(parsed.message, parsed.status);
  }
  const { productId, optionId, localDateStart, localDateEnd } = parsed.value;

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
      // Log the real upstream status server-side; return a generic message.
      console.error(`availability-calendar: OCTO /availability/calendar upstream error ${upstream.status}`);
      return jsonError('Upstream service error', 502);
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
    console.error('availability-calendar: failed to reach the OCTO API');
    return jsonError('Upstream service error', 502);
  }
});
