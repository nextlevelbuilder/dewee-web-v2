/**
 * `dewee-web mcp`: a stdio MCP server for clients that only speak stdio (Claude Desktop, Cursor via
 * npx). Each newline-delimited JSON-RPC message on stdin is POSTed to <site>/mcp with the API key;
 * responses are written to stdout, one per line, in order. Diagnostics go to stderr only.
 */
import { createInterface } from "node:readline";

/**
 * @param {unknown} id
 * @param {number} code
 * @param {string} message
 */
function rpcError(id, code, message) {
  return JSON.stringify({ jsonrpc: "2.0", id: id ?? null, error: { code, message } });
}

/** Ids of the requests in a message (notifications have none). @param {any} msg */
function requestIds(msg) {
  const list = Array.isArray(msg) ? msg : [msg];
  return list.filter((m) => m && typeof m === "object" && "id" in m && m.id !== null && typeof m.method === "string").map((m) => m.id);
}

/**
 * @param {{ url: string, apiKey: string | null }} config
 * @returns {Promise<number>}
 */
export async function mcpProxy(config) {
  if (!config.apiKey) throw new Error("No API key. Run `dewee-web auth login --key dwk_…` or set DEWEE_WEB_API_KEY.");
  const endpoint = `${config.url}/mcp`;
  /** @type {string | null} */
  let protocolVersion = null;
  const write = (/** @type {string} */ line) => process.stdout.write(`${line}\n`);

  /** @param {string} line */
  const forward = async (line) => {
    /** @type {any} */
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      write(rpcError(null, -32700, "Parse error: stdin lines must be JSON-RPC messages."));
      return;
    }
    const ids = requestIds(msg);
    /** @type {Record<string, string>} */
    const headers = {
      authorization: `Bearer ${config.apiKey}`,
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
      "user-agent": "dewee-web-cli/0.1 (mcp stdio)",
    };
    if (protocolVersion) headers["mcp-protocol-version"] = protocolVersion;
    let res;
    try {
      res = await fetch(endpoint, { method: "POST", headers, body: line });
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      process.stderr.write(`dewee-web mcp: ${endpoint} unreachable: ${reason}\n`);
      for (const id of ids) write(rpcError(id, -32603, `Could not reach ${endpoint}: ${reason}`));
      return;
    }
    const text = (await res.text()).trim();
    if (!text) {
      if (!res.ok) for (const id of ids) write(rpcError(id, -32603, `HTTP ${res.status} from ${endpoint}`));
      return;
    }
    /** @type {any} */
    let reply;
    try {
      reply = JSON.parse(text);
    } catch {
      for (const id of ids) write(rpcError(id, -32603, `Unexpected response from ${endpoint} (HTTP ${res.status}).`));
      return;
    }
    // REST-style errors (401/403 before JSON-RPC dispatch) become JSON-RPC errors for each request.
    if (reply && typeof reply === "object" && !Array.isArray(reply) && reply.error && !reply.jsonrpc) {
      for (const id of ids) write(rpcError(id, -32001, `${reply.error.code ?? "error"}: ${reply.error.message ?? `HTTP ${res.status}`}`));
      return;
    }
    const replies = Array.isArray(reply) ? reply : [reply];
    for (const r of replies) {
      if (r?.result?.protocolVersion && typeof r.result.protocolVersion === "string") protocolVersion = r.result.protocolVersion;
    }
    write(JSON.stringify(reply));
  };

  process.stderr.write(`dewee-web mcp: bridging stdio to ${endpoint}\n`);
  const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });
  let queue = Promise.resolve();
  for await (const raw of rl) {
    const line = raw.trim();
    if (!line) continue;
    queue = queue.then(() => forward(line));
  }
  await queue;
  return 0;
}
