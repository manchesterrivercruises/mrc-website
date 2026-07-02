// Netlify Function — proxy the read-only OCTO /products endpoint.
//
// The OCTO connection key (VENTRATA_OCTO_KEY) is SERVER-SIDE ONLY. It is never sent
// to the client — the browser only ever talks to this function, never to Ventrata.
// Cache: products change rarely, so cache for 1 hour.

const OCTO_BASE = process.env.VENTRATA_OCTO_BASE ?? 'https://api.ventrata.com/octo';

export default async (request: Request): Promise<Response> => {
  if (request.method !== 'GET') {
    return jsonError('Method not allowed', 405);
  }

  const key = process.env.VENTRATA_OCTO_KEY;
  if (!key) {
    return jsonError('VENTRATA_OCTO_KEY is not configured', 500);
  }

  try {
    const upstream = await fetch(`${OCTO_BASE}/products`, {
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
    });

    const body = await upstream.text();
    if (!upstream.ok) {
      return jsonError(`OCTO /products request failed (${upstream.status})`, upstream.status);
    }

    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // Cache products for 1 hour.
        'Cache-Control': 'public, max-age=3600',
        'Netlify-CDN-Cache-Control': 'public, durable, s-maxage=3600',
      },
    });
  } catch {
    return jsonError('Failed to reach the OCTO API', 502);
  }
};

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
