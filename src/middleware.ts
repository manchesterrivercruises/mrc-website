import { defineMiddleware } from 'astro:middleware';

// Graceful "GitHub App not configured yet" guard for the Keystatic sign-in flow.
//
// Once KEYSTATIC_SECRET is set, /keystatic renders its "Log in with GitHub" button — but if no
// GitHub App has been created yet (no KEYSTATIC_GITHUB_CLIENT_ID), clicking it hits Keystatic's
// injected GitHub OAuth endpoints (/api/keystatic/github/login, /oauth/callback, …) which throw a
// hard 500. Intercept those endpoints while the client id is absent and return a clear message
// instead, so the login click fails gracefully until the App is configured (see
// docs/content-management.md → "Production setup — GitHub App"). When the id is present this is a
// no-op and Keystatic's own handlers run.
export const onRequest = defineMiddleware((context, next) => {
  if (
    context.url.pathname.startsWith('/api/keystatic/github/') &&
    !process.env.KEYSTATIC_GITHUB_CLIENT_ID
  ) {
    return new Response(
      'GitHub sign-in is not available yet — the Keystatic GitHub App has not been configured for ' +
        'this deployment. Set KEYSTATIC_GITHUB_CLIENT_ID, KEYSTATIC_GITHUB_CLIENT_SECRET and ' +
        'PUBLIC_KEYSTATIC_GITHUB_APP_SLUG in the Netlify environment and redeploy. See ' +
        'docs/content-management.md → "Production setup — GitHub App".',
      { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } },
    );
  }
  return next();
});
