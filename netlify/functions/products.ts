// Netlify Function — proxy the read-only OCTO /products endpoint.
//
// The OCTO connection key (VENTRATA_OCTO_KEY) is SERVER-SIDE ONLY. It is never sent
// to the client — the browser only ever talks to this function, never to Ventrata.
// Cache: products change rarely, so cache for 1 hour.

import { withGuard, jsonError } from '../lib/guard';
import { filterProductsResponse } from '../lib/products';

const OCTO_BASE = process.env.VENTRATA_OCTO_BASE ?? 'https://api.ventrata.com/octo';

export default withGuard(async (request: Request): Promise<Response> => {
  if (request.method !== 'GET') {
    return jsonError('Method not allowed', 405);
  }

  const key = process.env.VENTRATA_OCTO_KEY;
  if (!key) {
    // Log detail server-side; never name the env var in the client response.
    console.error('products: VENTRATA_OCTO_KEY is not configured');
    return jsonError('Service temporarily unavailable', 503);
  }

  try {
    const upstream = await fetch(`${OCTO_BASE}/products`, {
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        // MANDATORY on every OCTO request — without it the API returns 400 CAPABILITIES.
        // Confirmed against the live test API 2026-07-06 (see docs/ventrata-integration.md).
        'Octo-Capabilities': 'octo/pricing',
      },
    });

    const body = await upstream.text();
    if (!upstream.ok) {
      // Log the real upstream status server-side; return a generic message.
      console.error(`products: OCTO /products upstream error ${upstream.status}`);
      return jsonError('Upstream service error', 502);
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(body);
    } catch {
      console.error('products: OCTO /products returned non-JSON body');
      return jsonError('Upstream service error', 502);
    }

    // Drop every upstream field the frontend does not use before it leaves the proxy.
    const filtered = filterProductsResponse(parsed);

    return new Response(JSON.stringify(filtered), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // Cache products for 1 hour.
        'Cache-Control': 'public, max-age=3600',
        'Netlify-CDN-Cache-Control': 'public, durable, s-maxage=3600',
      },
    });
  } catch {
    console.error('products: failed to reach the OCTO API');
    return jsonError('Upstream service error', 502);
  }
});
