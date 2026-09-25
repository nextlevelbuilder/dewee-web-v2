/**
 * GET /api/early-access — same-origin view of the product's Early Access state. The worker asks
 * dewee-app server-side, validates the body and answers `null` when the upstream is missing,
 * slow or malformed, so the browser never logs a CORS or network error and keeps the static copy.
 */
import { EARLY_ACCESS } from "~/content/early-access";
import { parseEarlyAccess } from "~/lib/early-access";

const UPSTREAM_TIMEOUT_MS = 3000;
const MAX_AGE_S = 60;

function json(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": `public, max-age=${MAX_AGE_S}` },
  });
}

/** Fetches and validates the upstream once; any failure becomes `null`. */
export async function readEarlyAccessUpstream(fetchImpl: typeof fetch = fetch) {
  try {
    const res = await fetchImpl(EARLY_ACCESS.upstream, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    return parseEarlyAccess(await res.json());
  } catch {
    return null;
  }
}

/** Serves the validated state, sharing one upstream call per minute per colo through the edge cache. */
export async function handleEarlyAccessRequest(request: Request, fetchImpl: typeof fetch = fetch): Promise<Response> {
  const cache = (globalThis as { caches?: { default?: Cache } }).caches?.default;
  const key = new Request(new URL(request.url).origin + "/api/early-access", { method: "GET" });
  const hit = cache ? await cache.match(key) : undefined;
  if (hit) return hit;
  const res = json(await readEarlyAccessUpstream(fetchImpl));
  if (cache) await cache.put(key, res.clone()).catch(() => {});
  return res;
}
