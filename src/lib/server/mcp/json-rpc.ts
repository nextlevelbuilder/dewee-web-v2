/**
 * A small, dependency-free MCP server core: JSON-RPC 2.0 dispatch for initialize, ping,
 * tools/list and tools/call (Streamable HTTP, stateless, JSON responses only).
 * Pure: bindings and auth arrive through the generic context `C`, so it runs under vitest.
 */
import { z } from "zod";
import { ApiError, zodIssues } from "../api/api-errors";

export const SUPPORTED_PROTOCOL_VERSIONS = ["2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05"] as const;
export const LATEST_PROTOCOL_VERSION = SUPPORTED_PROTOCOL_VERSIONS[0];

export const RPC_ERRORS = { parse: -32700, invalidRequest: -32600, methodNotFound: -32601, invalidParams: -32602, internal: -32603 } as const;

export type JsonRpcId = string | number;
export type JsonRpcResponse =
  | { jsonrpc: "2.0"; id: JsonRpcId | null; result: unknown }
  | { jsonrpc: "2.0"; id: JsonRpcId | null; error: { code: number; message: string; data?: unknown } };

export type ToolAnnotations = { readOnlyHint?: boolean; destructiveHint?: boolean; idempotentHint?: boolean; openWorldHint?: boolean };

export type ToolDef<C> = {
  name: string;
  title: string;
  description: string;
  input: z.ZodType;
  annotations?: ToolAnnotations;
  /** Hidden from tools/list and refused on call when false (for example, a missing scope). */
  enabled?: (ctx: C) => boolean;
  /** Receives arguments already parsed by `input`. Throw ApiError for a readable tool error. */
  run: (args: unknown, ctx: C) => Promise<unknown>;
};

export type McpServer<C> = {
  name: string;
  title: string;
  version: string;
  instructions: string;
  tools: readonly ToolDef<C>[];
};

const rpcError = (id: JsonRpcId | null, code: number, message: string, data?: unknown): JsonRpcResponse => ({
  jsonrpc: "2.0",
  id,
  error: { code, message, ...(data === undefined ? {} : { data }) },
});
const rpcResult = (id: JsonRpcId, result: unknown): JsonRpcResponse => ({ jsonrpc: "2.0", id, result });

export function negotiateProtocol(requested: unknown): string {
  return typeof requested === "string" && (SUPPORTED_PROTOCOL_VERSIONS as readonly string[]).includes(requested) ? requested : LATEST_PROTOCOL_VERSION;
}

export function toolListing<C>(server: McpServer<C>, ctx: C) {
  return server.tools
    .filter((t) => !t.enabled || t.enabled(ctx))
    .map((t) => {
      const { $schema: _s, ...inputSchema } = z.toJSONSchema(t.input, { io: "input", unrepresentable: "any" }) as Record<string, unknown>;
      return { name: t.name, title: t.title, description: t.description, inputSchema, ...(t.annotations ? { annotations: t.annotations } : {}) };
    });
}

function toolError(text: string, structured?: Record<string, unknown>) {
  return { content: [{ type: "text", text }], isError: true, ...(structured ? { structuredContent: structured } : {}) };
}

async function callTool<C>(server: McpServer<C>, params: unknown, ctx: C): Promise<{ ok: true; result: unknown } | { ok: false; error: { code: number; message: string } }> {
  const p = (params ?? {}) as { name?: unknown; arguments?: unknown };
  if (typeof p.name !== "string") return { ok: false, error: { code: RPC_ERRORS.invalidParams, message: "tools/call needs a tool `name`." } };
  const tool = server.tools.find((t) => t.name === p.name);
  if (!tool) return { ok: false, error: { code: RPC_ERRORS.invalidParams, message: `Unknown tool: ${p.name}` } };
  if (tool.enabled && !tool.enabled(ctx)) {
    return { ok: true, result: toolError(`forbidden: this API key lacks the scope needed for ${tool.name}.`, { error: { code: "forbidden" } }) };
  }
  const parsed = tool.input.safeParse(p.arguments ?? {});
  if (!parsed.success) {
    const issues = zodIssues(parsed.error);
    return { ok: true, result: toolError(`validation_failed: ${issues.map((i) => `${i.path || "(root)"}: ${i.message}`).join("; ")}`, { error: { code: "validation_failed", details: issues } }) };
  }
  try {
    const value = await tool.run(parsed.data, ctx);
    const structured = value !== null && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : { result: value };
    return { ok: true, result: { content: [{ type: "text", text: JSON.stringify(value, null, 2) }], structuredContent: structured } };
  } catch (err) {
    if (err instanceof ApiError) {
      const details = err.details === undefined ? "" : `\n${JSON.stringify(err.details, null, 2)}`;
      return { ok: true, result: toolError(`${err.code}: ${err.message}${details}`, { error: { code: err.code, message: err.message, details: err.details } }) };
    }
    console.error(`mcp: tool ${tool.name} failed`, err instanceof Error ? err.stack || err.message : err);
    return { ok: true, result: toolError("internal: the tool failed on our side. Try again later.") };
  }
}

/** Handles one JSON-RPC message; returns null for notifications and client responses. */
export async function handleMessage<C>(server: McpServer<C>, message: unknown, ctx: C): Promise<JsonRpcResponse | null> {
  if (!message || typeof message !== "object" || Array.isArray(message)) return rpcError(null, RPC_ERRORS.invalidRequest, "Invalid request: expected a JSON-RPC 2.0 object.");
  const msg = message as { jsonrpc?: unknown; id?: unknown; method?: unknown; params?: unknown; result?: unknown; error?: unknown };
  const hasId = "id" in msg && msg.id !== undefined;
  const id = typeof msg.id === "string" || (typeof msg.id === "number" && Number.isFinite(msg.id)) ? msg.id : null;
  if (msg.jsonrpc !== "2.0") return hasId ? rpcError(id, RPC_ERRORS.invalidRequest, 'Invalid request: "jsonrpc" must be "2.0".') : null;
  if (typeof msg.method !== "string") {
    // A response from the client (we never send requests) or garbage.
    if (hasId && ("result" in msg || "error" in msg)) return null;
    return rpcError(id, RPC_ERRORS.invalidRequest, "Invalid request: missing method.");
  }
  if (!hasId) return null; // notification (notifications/initialized, notifications/cancelled, ...)
  if (id === null) return rpcError(null, RPC_ERRORS.invalidRequest, "Invalid request: id must be a string or a number.");

  switch (msg.method) {
    case "initialize": {
      const params = (msg.params ?? {}) as { protocolVersion?: unknown };
      return rpcResult(id, {
        protocolVersion: negotiateProtocol(params.protocolVersion),
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: server.name, title: server.title, version: server.version },
        instructions: server.instructions,
      });
    }
    case "ping":
      return rpcResult(id, {});
    case "tools/list":
      return rpcResult(id, { tools: toolListing(server, ctx) });
    case "tools/call": {
      const outcome = await callTool(server, msg.params, ctx);
      return outcome.ok ? rpcResult(id, outcome.result) : rpcError(id, outcome.error.code, outcome.error.message);
    }
    default:
      return rpcError(id, RPC_ERRORS.methodNotFound, `Method not found: ${msg.method}`);
  }
}

/**
 * Handles a POST body (already JSON-parsed): one message or a batch. Returns the response body,
 * or null when nothing needs an answer (the transport then replies 202 Accepted).
 */
export async function handlePayload<C>(server: McpServer<C>, payload: unknown, ctx: C): Promise<JsonRpcResponse | JsonRpcResponse[] | null> {
  if (Array.isArray(payload)) {
    if (!payload.length) return rpcError(null, RPC_ERRORS.invalidRequest, "Invalid request: empty batch.");
    const out: JsonRpcResponse[] = [];
    for (const message of payload) {
      const response = await handleMessage(server, message, ctx);
      if (response) out.push(response);
    }
    return out.length ? out : null;
  }
  return handleMessage(server, payload, ctx);
}

export function parseError(): JsonRpcResponse {
  return rpcError(null, RPC_ERRORS.parse, "Parse error: the body is not valid JSON.");
}
