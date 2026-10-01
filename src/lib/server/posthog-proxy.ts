/**
 * First-party reverse proxy for PostHog US Cloud under /ingest, so analytics stays on the
 * dewee.sh origin and survives tracker blocklists. Static SDK files come from the asset host,
 * everything else from the ingestion host. Cookies and auth never leave the site.
 */
export const POSTHOG_PROXY_PREFIX = "/ingest";

const API_HOST = "us.i.posthog.com";
const ASSET_HOST = "us-assets.i.posthog.com";

export function posthogUpstreamUrl(requestUrl: string): URL {
  const url = new URL(requestUrl);
  const path = url.pathname.slice(POSTHOG_PROXY_PREFIX.length) || "/";
  const upstream = new URL(`https://${path.startsWith("/static/") ? ASSET_HOST : API_HOST}`);
  upstream.pathname = path;
  upstream.search = url.search;
  return upstream;
}

export async function proxyPosthog(request: Request): Promise<Response> {
  const upstream = posthogUpstreamUrl(request.url);
  const headers = new Headers(request.headers);
  headers.delete("cookie");
  headers.delete("authorization");
  headers.set("host", upstream.host);
  const ip = request.headers.get("cf-connecting-ip");
  if (ip) headers.set("x-forwarded-for", ip);
  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const response = await fetch(upstream, {
    method: request.method,
    headers,
    body: hasBody ? await request.arrayBuffer() : null,
    redirect: "manual",
  });
  const out = new Headers(response.headers);
  out.delete("set-cookie");
  return new Response(response.body, { status: response.status, headers: out });
}
