// Request-body validation for the OCTO availability proxy functions.
//
// Everything here runs BEFORE any upstream OCTO call: oversized bodies are rejected
// before parsing, then productId / optionId / dates are validated. Any failure short-
// circuits with a 4xx and a GENERIC message (see docs — never echo upstream detail).

import { isAllowedProductId } from './products';

// The only valid body is a small JSON object (productId, optionId, two dates), so cap
// hard and reject anything larger before we even parse it.
const MAX_BODY_BYTES = 2_048;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Inclusive cap on the availability window. A month view never needs more than ~2
// months; anything wider is almost certainly abuse or a bug.
const MAX_RANGE_DAYS = 62;
const MS_PER_DAY = 86_400_000;

export interface AvailabilityInput {
  productId: string;
  optionId: string;
  localDateStart: string;
  localDateEnd: string;
}

export type ValidationResult =
  | { ok: true; value: AvailabilityInput }
  | { ok: false; status: number; message: string };

// Parse an ISO YYYY-MM-DD string to a UTC timestamp, rejecting impossible calendar
// dates that pass the regex but overflow (e.g. 2025-02-30, month 13).
function parseIsoDate(value: string): number | null {
  if (!ISO_DATE_RE.test(value)) return null;
  const [y, m, d] = value.split('-').map(Number);
  const ts = Date.UTC(y, m - 1, d);
  const back = new Date(ts);
  if (back.getUTCFullYear() !== y || back.getUTCMonth() + 1 !== m || back.getUTCDate() !== d) {
    return null;
  }
  return ts;
}

// Read the body under a size cap and validate every field. Returns the sanitised
// input on success, or a status + generic message on any failure.
export async function readAvailabilityInput(request: Request): Promise<ValidationResult> {
  // Reject oversized bodies before parsing. Trust Content-Length when present, but
  // also cap the bytes actually read so a missing/lying header can't slip past.
  const declared = Number(request.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    return { ok: false, status: 413, message: 'Request body too large' };
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return { ok: false, status: 413, message: 'Request body too large' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, status: 400, message: 'Invalid request' };
  }
  if (typeof parsed !== 'object' || parsed === null) {
    return { ok: false, status: 400, message: 'Invalid request' };
  }

  const { productId, optionId, localDateStart, localDateEnd } = parsed as Record<string, unknown>;

  // productId: string on the server-side public allowlist.
  if (typeof productId !== 'string' || !isAllowedProductId(productId)) {
    return { ok: false, status: 400, message: 'Invalid request' };
  }

  // optionId: UUID or the literal "DEFAULT"; default to DEFAULT when omitted.
  const resolvedOptionId = optionId === undefined ? 'DEFAULT' : optionId;
  if (
    typeof resolvedOptionId !== 'string' ||
    (resolvedOptionId !== 'DEFAULT' && !UUID_RE.test(resolvedOptionId))
  ) {
    return { ok: false, status: 400, message: 'Invalid request' };
  }

  // Dates: ISO YYYY-MM-DD, start <= end, span within the cap.
  if (typeof localDateStart !== 'string' || typeof localDateEnd !== 'string') {
    return { ok: false, status: 400, message: 'Invalid request' };
  }
  const startTs = parseIsoDate(localDateStart);
  const endTs = parseIsoDate(localDateEnd);
  if (startTs === null || endTs === null || startTs > endTs) {
    return { ok: false, status: 400, message: 'Invalid request' };
  }
  const spanDays = Math.round((endTs - startTs) / MS_PER_DAY) + 1;
  if (spanDays > MAX_RANGE_DAYS) {
    return { ok: false, status: 400, message: 'Invalid request' };
  }

  return {
    ok: true,
    value: { productId, optionId: resolvedOptionId, localDateStart, localDateEnd },
  };
}
