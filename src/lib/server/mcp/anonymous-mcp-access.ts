/**
 * Who /mcp serves without credentials. A request with no Authorization header gets the public,
 * read-only docs server (search_docs, fetch_doc), so one URL works for everyone. Two cases still
 * answer 401 so OAuth clients (Claude, ChatGPT, Cursor) start sign-in:
 * - the URL asks for it with `?login` (the address the team adds to get the write tools);
 * - the call names a tool the public server does not have.
 */
import { PUBLIC_DOCS_TOOLS } from "~/lib/server/docs/public-docs-mcp-tools";

const PUBLIC_TOOL_NAMES = new Set(PUBLIC_DOCS_TOOLS.map((t) => t.name));

/** Anonymous bodies are tiny tool calls; a small cap keeps batches from becoming a load vector. */
export const ANONYMOUS_MAX_BODY_BYTES = 64_000;

/** True when the request carries no credentials at all (an invalid token still goes to sign-in). */
export function isAnonymous(request: Request): boolean {
  return !request.headers.get("authorization");
}

/** The URL opts into sign-in, e.g. https://dewee.sh/mcp?login */
export function wantsSignIn(url: URL): boolean {
  return url.searchParams.has("login");
}

/** True when any JSON-RPC message calls a tool that only signed-in callers have. */
export function callsPrivateTool(payload: unknown): boolean {
  const messages = Array.isArray(payload) ? payload : [payload];
  return messages.some((m) => {
    if (!m || typeof m !== "object") return false;
    const msg = m as { method?: unknown; params?: { name?: unknown } };
    return msg.method === "tools/call" && !PUBLIC_TOOL_NAMES.has(String(msg.params?.name ?? ""));
  });
}
