/**
 * Public, read-only MCP server for the published docs (Streamable HTTP, stateless, JSON responses).
 * No credentials: it only offers search_docs and fetch_doc (src/lib/server/docs/public-docs-mcp-tools.ts).
 * It is a separate endpoint on purpose: /mcp must keep answering 401 so OAuth clients start sign-in.
 */
import type { APIRoute } from "astro";
import { errorResponse, forbidden, json } from "~/lib/server/api/api-errors";
import { platformEnv } from "~/lib/server/api/platform-env";
import { handlePayload, parseError, SUPPORTED_PROTOCOL_VERSIONS } from "~/lib/server/mcp/json-rpc";
import { PUBLIC_DOCS_MCP_SERVER } from "~/lib/server/docs/public-docs-mcp-tools";

export const prerender = false;

/** Tool calls here are tiny; a small cap keeps batches from becoming a load vector. */
const MAX_BODY_BYTES = 64_000;

const noStream = () =>
  json(
    { error: { code: "method_not_allowed", message: "This MCP server answers POST requests with JSON; it does not open a server-sent event stream." } },
    { status: 405, headers: { allow: "POST" } },
  );

export const GET: APIRoute = noStream;
export const DELETE: APIRoute = noStream;

export const POST: APIRoute = async ({ request, url }) => {
  try {
    // DNS-rebinding protection: browsers send Origin; it must be this site.
    const origin = request.headers.get("origin");
    if (origin && origin !== url.origin) throw forbidden("Cross-origin MCP requests are not allowed.");

    const version = request.headers.get("mcp-protocol-version");
    if (version && !(SUPPORTED_PROTOCOL_VERSIONS as readonly string[]).includes(version)) {
      return json({ error: { code: "bad_request", message: `Unsupported MCP-Protocol-Version ${version}. Supported: ${SUPPORTED_PROTOCOL_VERSIONS.join(", ")}.` } }, { status: 400 });
    }

    if (Number(request.headers.get("content-length") ?? "0") > MAX_BODY_BYTES) {
      return json({ error: { code: "payload_too_large", message: "The request body is too large." } }, { status: 413 });
    }
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return json({ error: { code: "payload_too_large", message: "The request body is too large." } }, { status: 413 });

    let payload: unknown;
    try {
      payload = JSON.parse(text);
    } catch {
      return json(parseError(), { status: 400 });
    }

    const result = await handlePayload(PUBLIC_DOCS_MCP_SERVER, payload, { env: platformEnv() });
    if (result === null) return new Response(null, { status: 202, headers: { "cache-control": "no-store" } });
    return json(result);
  } catch (err) {
    return errorResponse(err);
  }
};
