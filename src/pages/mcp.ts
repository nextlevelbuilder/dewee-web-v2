/**
 * Remote MCP server (Streamable HTTP, stateless, JSON responses). Clients POST JSON-RPC 2.0 with
 * `Authorization: Bearer dwk_…`; tools are defined in src/lib/server/mcp/mcp-tools.ts.
 * There is no server-initiated stream, so GET and DELETE answer 405.
 */
import type { APIRoute } from "astro";
import { errorResponse, forbidden, json } from "~/lib/server/api/api-errors";
import { platformEnv } from "~/lib/server/api/platform-env";
import { authenticate } from "~/lib/server/auth/request-auth";
import { handlePayload, parseError, SUPPORTED_PROTOCOL_VERSIONS } from "~/lib/server/mcp/json-rpc";
import { MCP_SERVER } from "~/lib/server/mcp/mcp-tools";

export const prerender = false;

/** Base64 image uploads (10 MB) plus the JSON-RPC envelope. */
const MAX_BODY_BYTES = 14_500_000;

const noStream = () =>
  json(
    { error: { code: "method_not_allowed", message: "This MCP server answers POST requests with JSON; it does not open a server-sent event stream." } },
    { status: 405, headers: { allow: "POST" } },
  );

export const GET: APIRoute = noStream;
export const DELETE: APIRoute = noStream;

export const POST: APIRoute = async (ctx) => {
  const { request, url } = ctx;
  try {
    // DNS-rebinding protection: browsers send Origin; it must be this site.
    const origin = request.headers.get("origin");
    if (origin && origin !== url.origin) throw forbidden("Cross-origin MCP requests are not allowed.");

    const version = request.headers.get("mcp-protocol-version");
    if (version && !(SUPPORTED_PROTOCOL_VERSIONS as readonly string[]).includes(version)) {
      return json({ error: { code: "bad_request", message: `Unsupported MCP-Protocol-Version ${version}. Supported: ${SUPPORTED_PROTOCOL_VERSIONS.join(", ")}.` } }, { status: 400 });
    }

    const principal = await authenticate({ request, cookies: ctx.cookies, locals: ctx.locals, clientAddress: ctx.clientAddress }, { allowSession: false });

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

    const result = await handlePayload(MCP_SERVER, payload, { env: platformEnv(), principal });
    if (result === null) return new Response(null, { status: 202, headers: { "cache-control": "no-store" } });
    return json(result);
  } catch (err) {
    return errorResponse(err);
  }
};
