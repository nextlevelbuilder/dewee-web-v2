import { describe, expect, it } from "vitest";
import { GETTING_STARTED, MCP_SNIPPETS, MCP_URL } from "./home-getting-started";

describe("homepage getting started copy", () => {
  it.each(["en", "vi"] as const)("%s links the terms and privacy pages and places the MCP URL", (locale) => {
    const t = GETTING_STARTED[locale];
    expect(t.saas.legal).toContain("{terms}");
    expect(t.saas.legal).toContain("{privacy}");
    expect(t.mcp.body).toContain("{url}");
  });

  it("never names Early Access", () => {
    expect(JSON.stringify(GETTING_STARTED)).not.toMatch(/early access/i);
  });

  it("points every client snippet at the MCP endpoint", () => {
    for (const code of Object.values(MCP_SNIPPETS)) expect(code).toContain(MCP_URL);
  });
});
