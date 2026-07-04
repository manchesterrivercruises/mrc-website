// Shared guard for the OCTO proxy functions:
//   - CORS locked to our own origins (production domain + *.netlify.app staging)
//   - a simple in-memory per-IP rate limiter (~30 req/min) returning 429.
//
// The rate-limit state is in-memory and therefore PER WARM INSTANCE — it resets on
// cold start and is not shared across concurrent instances. That's fine here: it's a
// basic abuse throttle in front of already-cached, read-only proxies, not a hard quota.
// For durable limiting use a shared store (e.g. Netlify Blobs / Upstash).

const ALLOWED_ORIGINS = ['https://www.manchesterrivercruises.com', 'https://manchesterrivercruises.com'];

function originAllowed(origin: string): boolean {
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  try {
    // Staging: Netlify deploy previews / branch deploys are served from *.netlify.app.
    return new URL(origin).hostname.endsWith('.netlify.app');
  } catch {
    return false;
  }
}

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;
const hits = new Map<string, { count: number; reset: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const cur = hits.get(ip);
  if (!cur || now > cur.reset) {
    hits.set(ip, { count: 1, reset: now + WINDOW_MS });
    return false;
  }
  cur.count += 1;
  return cur.count > MAX_REQUESTS;
}

function clientIp(request: Request): string {
  return (
    request.headers.get('x-nf-client-connection-ip') ||
    (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() ||
    'unknown'
  );
}

function corsHeaders(origin: string | null): Record<string, string> {
  const h: Record<string, string> = { Vary: 'Origin' };
  if (origin) {
    h['Access-Control-Allow-Origin'] = origin;
    h['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
    h['Access-Control-Allow-Headers'] = 'Content-Type';
    h['Access-Control-Max-Age'] = '86400';
  }
  return h;
}

export function jsonError(message: string, status: number, origin: string | null = null): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

type Handler = (request: Request) => Promise<Response>;

// Wrap a function handler with origin locking + rate limiting + CORS response headers.
export function withGuard(handler: Handler): Handler {
  return async (request: Request): Promise<Response> => {
    const origin = request.headers.get('origin');

    // Block cross-origin calls from anywhere but our own sites. Same-origin requests
    // (and server-to-server) send no Origin header and are allowed through.
    if (origin && !originAllowed(origin)) {
      return jsonError('Forbidden origin', 403, null);
    }

    // CORS preflight.
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (rateLimited(clientIp(request))) {
      const res = jsonError('Too many requests', 429, origin);
      res.headers.set('Retry-After', '60');
      return res;
    }

    // Attach CORS headers to whatever the handler returns (success or error).
    const res = await handler(request);
    const headers = new Headers(res.headers);
    for (const [k, v] of Object.entries(corsHeaders(origin))) headers.set(k, v);
    return new Response(res.body, { status: res.status, headers });
  };
}
