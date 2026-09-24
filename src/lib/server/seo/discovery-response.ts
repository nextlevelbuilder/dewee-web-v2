/**
 * Shared plumbing for the discovery routes (sitemaps, robots, llms, feeds): the public origin for
 * the current environment, and the response headers agents and crawlers expect.
 */

/** Public origin: SITE_URL of the deployed environment, else the request's own origin. */
export function siteOrigin(env: Pick<Env, "SITE_URL">, requestUrl: URL): string {
  return (env.SITE_URL || requestUrl.origin).replace(/\/$/, "");
}

export function isProduction(env: Pick<Env, "ENVIRONMENT">): boolean {
  return env.ENVIRONMENT === "production";
}

/** Edge-cached for a few minutes, served stale while it refreshes; readable from any origin. */
export const DISCOVERY_CACHE = "public, max-age=300, s-maxage=600, stale-while-revalidate=86400";

export function discoveryResponse(body: string, contentType: string, cacheControl = DISCOVERY_CACHE): Response {
  return new Response(body, {
    headers: {
      "content-type": contentType,
      "cache-control": cacheControl,
      "access-control-allow-origin": "*",
    },
  });
}

export const XML = "application/xml; charset=utf-8";
export const ATOM = "application/atom+xml; charset=utf-8";
export const TEXT = "text/plain; charset=utf-8";
