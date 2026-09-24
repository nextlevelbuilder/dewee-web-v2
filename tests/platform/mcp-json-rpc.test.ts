import { describe, expect, it } from "vitest";
import { z } from "zod";
import { ApiError } from "../../src/lib/server/api/api-errors";
import { handleMessage, handlePayload, LATEST_PROTOCOL_VERSION, negotiateProtocol, RPC_ERRORS, type McpServer } from "../../src/lib/server/mcp/json-rpc";

type Ctx = { scopes: string[] };

const echoInput = z.object({ text: z.string().min(1) }).strict();

const server: McpServer<Ctx> = {
  name: "test",
  title: "Test",
  version: "0.0.1",
  instructions: "Use echo.",
  tools: [
    { name: "echo", title: "Echo", description: "Echoes text", input: echoInput, annotations: { readOnlyHint: true }, run: async (args) => ({ echoed: echoInput.parse(args).text }) },
    { name: "list", title: "List", description: "Returns an array", input: z.object({}).strict(), run: async () => [1, 2] },
    { name: "secret", title: "Secret", description: "Needs a scope", input: z.object({}).strict(), enabled: (c) => c.scopes.includes("s"), run: async () => ({ ok: true }) },
    { name: "fails", title: "Fails", description: "Throws", input: z.object({}).strict(), run: async () => { throw new ApiError(409, "version_conflict", "changed", { current_version: 4 }); } },
    { name: "crashes", title: "Crashes", description: "Throws a plain error", input: z.object({}).strict(), run: async () => { throw new Error("db down"); } },
  ],
};

const ctx: Ctx = { scopes: [] };
const call = (method: string, params?: unknown, id: number | string = 1) => handleMessage(server, { jsonrpc: "2.0", id, method, params }, ctx);

describe("MCP JSON-RPC dispatcher", () => {
  it("initializes with a negotiated protocol version", async () => {
    const res = await call("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "x", version: "1" } });
    expect(res).toMatchObject({ jsonrpc: "2.0", id: 1, result: { protocolVersion: "2025-06-18", capabilities: { tools: {} }, serverInfo: { name: "test" } } });
    expect(negotiateProtocol("1999-01-01")).toBe(LATEST_PROTOCOL_VERSION);
    expect(negotiateProtocol(undefined)).toBe(LATEST_PROTOCOL_VERSION);
  });

  it("answers ping and ignores notifications and client responses", async () => {
    expect(await call("ping", undefined, "p")).toEqual({ jsonrpc: "2.0", id: "p", result: {} });
    expect(await handleMessage(server, { jsonrpc: "2.0", method: "notifications/initialized" }, ctx)).toBeNull();
    expect(await handleMessage(server, { jsonrpc: "2.0", id: 9, result: {} }, ctx)).toBeNull();
    expect(await handlePayload(server, [{ jsonrpc: "2.0", method: "notifications/initialized" }], ctx)).toBeNull();
  });

  it("lists tools with JSON Schema inputs, hiding disabled ones", async () => {
    const res = (await call("tools/list")) as { result: { tools: { name: string; inputSchema: { type: string; properties?: object } }[] } };
    const names = res.result.tools.map((t) => t.name);
    expect(names).toEqual(["echo", "list", "fails", "crashes"]);
    expect(res.result.tools[0].inputSchema.type).toBe("object");
    expect(res.result.tools[0].inputSchema.properties).toHaveProperty("text");
    const withScope = (await handleMessage(server, { jsonrpc: "2.0", id: 2, method: "tools/list" }, { scopes: ["s"] })) as { result: { tools: { name: string }[] } };
    expect(withScope.result.tools.map((t) => t.name)).toContain("secret");
  });

  it("calls tools and returns text plus structured content", async () => {
    const res = (await call("tools/call", { name: "echo", arguments: { text: "hi" } })) as { result: { content: { type: string; text: string }[]; structuredContent: unknown; isError?: boolean } };
    expect(res.result.isError).toBeUndefined();
    expect(res.result.structuredContent).toEqual({ echoed: "hi" });
    expect(JSON.parse(res.result.content[0].text)).toEqual({ echoed: "hi" });
    const list = (await call("tools/call", { name: "list" })) as { result: { structuredContent: unknown } };
    expect(list.result.structuredContent).toEqual({ result: [1, 2] });
  });

  it("reports tool failures as isError results the model can read", async () => {
    const invalid = (await call("tools/call", { name: "echo", arguments: { text: "" } })) as { result: { isError: boolean; content: { text: string }[] } };
    expect(invalid.result.isError).toBe(true);
    expect(invalid.result.content[0].text).toMatch(/^validation_failed: text/);
    const denied = (await call("tools/call", { name: "secret" })) as { result: { isError: boolean; content: { text: string }[] } };
    expect(denied.result.isError).toBe(true);
    expect(denied.result.content[0].text).toMatch(/^forbidden/);
    const conflict = (await call("tools/call", { name: "fails" })) as { result: { isError: boolean; content: { text: string }[]; structuredContent: { error: { code: string } } } };
    expect(conflict.result.content[0].text).toMatch(/^version_conflict: changed/);
    expect(conflict.result.structuredContent.error.code).toBe("version_conflict");
    const crash = (await call("tools/call", { name: "crashes" })) as { result: { isError: boolean; content: { text: string }[] } };
    expect(crash.result.isError).toBe(true);
    expect(crash.result.content[0].text).not.toMatch(/db down/);
  });

  it("uses JSON-RPC errors for protocol problems", async () => {
    expect(await call("tools/call", { name: "nope" })).toMatchObject({ error: { code: RPC_ERRORS.invalidParams } });
    expect(await call("tools/call", {})).toMatchObject({ error: { code: RPC_ERRORS.invalidParams } });
    expect(await call("resources/list")).toMatchObject({ id: 1, error: { code: RPC_ERRORS.methodNotFound } });
    expect(await handleMessage(server, { jsonrpc: "1.0", id: 3, method: "ping" }, ctx)).toMatchObject({ id: 3, error: { code: RPC_ERRORS.invalidRequest } });
    expect(await handleMessage(server, { jsonrpc: "2.0", id: {}, method: "ping" }, ctx)).toMatchObject({ id: null, error: { code: RPC_ERRORS.invalidRequest } });
    expect(await handleMessage(server, "ping", ctx)).toMatchObject({ error: { code: RPC_ERRORS.invalidRequest } });
    expect(await handlePayload(server, [], ctx)).toMatchObject({ error: { code: RPC_ERRORS.invalidRequest } });
  });

  it("answers batches in order, skipping notifications", async () => {
    const res = await handlePayload(
      server,
      [
        { jsonrpc: "2.0", id: 1, method: "ping" },
        { jsonrpc: "2.0", method: "notifications/initialized" },
        { jsonrpc: "2.0", id: 2, method: "tools/list" },
      ],
      ctx,
    );
    expect(Array.isArray(res)).toBe(true);
    expect((res as { id: number }[]).map((r) => r.id)).toEqual([1, 2]);
  });
});
