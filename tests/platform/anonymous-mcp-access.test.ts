import { describe, expect, it } from "vitest";
import { callsPrivateTool, isAnonymous, wantsSignIn } from "~/lib/server/mcp/anonymous-mcp-access";

const call = (name: string) => ({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: {} } });

describe("anonymous /mcp access", () => {
  it("treats only a request without Authorization as anonymous", () => {
    expect(isAnonymous(new Request("https://dewee.sh/mcp", { method: "POST" }))).toBe(true);
    expect(isAnonymous(new Request("https://dewee.sh/mcp", { method: "POST", headers: { authorization: "Bearer x" } }))).toBe(false);
  });

  it("asks for sign-in only when the URL has ?login", () => {
    expect(wantsSignIn(new URL("https://dewee.sh/mcp?login"))).toBe(true);
    expect(wantsSignIn(new URL("https://dewee.sh/mcp"))).toBe(false);
  });

  it("lets the public docs tools and protocol methods through", () => {
    expect(callsPrivateTool(call("search_docs"))).toBe(false);
    expect(callsPrivateTool(call("fetch_doc"))).toBe(false);
    expect(callsPrivateTool({ jsonrpc: "2.0", id: 1, method: "tools/list" })).toBe(false);
    expect(callsPrivateTool({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} })).toBe(false);
  });

  it("flags any other tool, alone or inside a batch", () => {
    expect(callsPrivateTool(call("create_page"))).toBe(true);
    expect(callsPrivateTool([call("search_docs"), call("list_leads")])).toBe(true);
    expect(callsPrivateTool({ jsonrpc: "2.0", id: 1, method: "tools/call", params: {} })).toBe(true);
  });
});
