// Netlify Function — live Google reviews for the business.
//
// Calls the Google Places API (New, v1) Place Details endpoint server-side and returns a
// small, trimmed shape. GOOGLE_PLACES_API_KEY is SERVER-SIDE ONLY — it must never reach
// the client (same rule as the OCTO connection key). Reviews change slowly, so cache
// aggressively (12h).
//
// The client uses this only as PROGRESSIVE ENHANCEMENT: the page server-renders a static
// aggregate for SEO and silently falls back to it on any failure. NO schema.org markup is
// generated from these reviews — Google prohibits marking up Google-sourced reviews.

import { withGuard, jsonError } from '../lib/guard';

const PLACES_BASE = 'https://places.googleapis.com/v1/places';
const MIN_RATING = 4; // only surface 4- and 5-star reviews
const TEXT_CAP = 280; // cap review text length

interface PlacesReview {
  rating?: number;
  relativePublishTimeDescription?: string;
  text?: { text?: string };
  authorAttribution?: { displayName?: string };
}
interface PlacesDetails {
  rating?: number;
  userRatingCount?: number;
  reviews?: PlacesReview[];
}

// First name only — we don't surface surnames.
function firstName(displayName: string | undefined): string {
  const first = (displayName ?? '').trim().split(/\s+/)[0];
  return first || 'Guest';
}

// Trim to ~TEXT_CAP characters, adding an ellipsis when truncated.
function capText(text: string | undefined): string {
  const s = (text ?? '').replace(/\s+/g, ' ').trim();
  return s.length > TEXT_CAP ? `${s.slice(0, TEXT_CAP).trimEnd()}…` : s;
}

export default withGuard(async (request: Request): Promise<Response> => {
  if (request.method !== 'GET') {
    return jsonError('Method not allowed', 405);
  }

  const key = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!key || !placeId) {
    // Log detail server-side; never name the env vars in the client response.
    console.error('reviews: GOOGLE_PLACES_API_KEY and/or GOOGLE_PLACE_ID not configured');
    return jsonError('Service temporarily unavailable', 503);
  }

  try {
    const upstream = await fetch(`${PLACES_BASE}/${encodeURIComponent(placeId)}`, {
      headers: {
        'X-Goog-Api-Key': key,
        // Only request what we use — keeps the response (and billing SKU) minimal.
        'X-Goog-FieldMask': 'rating,userRatingCount,reviews',
      },
    });

    const body = await upstream.text();
    if (!upstream.ok) {
      // Log the real upstream status server-side; return a generic message.
      console.error(`reviews: Google Places upstream error ${upstream.status}`);
      return jsonError('Upstream service error', 502);
    }

    let data: PlacesDetails;
    try {
      data = JSON.parse(body) as PlacesDetails;
    } catch {
      console.error('reviews: Google Places returned non-JSON body');
      return jsonError('Upstream service error', 502);
    }

    const reviews = (Array.isArray(data.reviews) ? data.reviews : [])
      .filter((r) => typeof r.rating === 'number' && r.rating >= MIN_RATING)
      .map((r) => ({
        author: firstName(r.authorAttribution?.displayName),
        rating: r.rating as number,
        time: r.relativePublishTimeDescription ?? '',
        text: capText(r.text?.text),
      }))
      .filter((r) => r.text.length > 0);

    const payload = {
      rating: typeof data.rating === 'number' ? data.rating : null,
      count: typeof data.userRatingCount === 'number' ? data.userRatingCount : null,
      reviews,
    };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // Reviews change slowly — cache 12h (browser + Netlify durable CDN).
        'Cache-Control': 'public, max-age=43200',
        'Netlify-CDN-Cache-Control': 'public, durable, s-maxage=43200, stale-while-revalidate=86400',
      },
    });
  } catch {
    console.error('reviews: failed to reach the Google Places API');
    return jsonError('Upstream service error', 502);
  }
});
