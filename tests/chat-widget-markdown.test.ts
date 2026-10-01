import { describe, expect, it } from "vitest";
import { parseInline, parseMarkdown } from "../src/components/chat/chat-widget-markdown";

describe("chat markdown", () => {
  it("turns an agent price list into a paragraph and a bullet list", () => {
    const blocks = parseMarkdown("dewee có 4 gói giá:\n\n*   **Self-install**: $0 để cài đặt.\n*   **AaaS** (AI as a Service): $500 mỗi năm.\n\nHiện tại có chương trình **Early Access**.");
    expect(blocks.map((b) => b.kind)).toEqual(["p", "ul", "p"]);
    const list = blocks[1] as { kind: "ul"; items: unknown[][] };
    expect(list.items).toHaveLength(2);
    expect(list.items[0][0]).toEqual({ kind: "strong", children: [{ kind: "text", text: "Self-install" }] });
  });

  it("parses numbered lists, headings and code fences", () => {
    expect(parseMarkdown("## Steps\n1. Install\n2. Run\n```\nnpx dewee\n```").map((b) => b.kind)).toEqual(["h", "ol", "pre"]);
    expect(parseMarkdown("```\nstill streaming")).toEqual([{ kind: "pre", text: "still streaming" }]);
  });

  it("parses inline code, emphasis and links, keeping only http(s) links", () => {
    expect(parseInline("run `dewee up` *now*")).toEqual([
      { kind: "text", text: "run " },
      { kind: "code", text: "dewee up" },
      { kind: "text", text: " " },
      { kind: "em", children: [{ kind: "text", text: "now" }] },
    ]);
    expect(parseInline("[pricing](https://dewee.sh/pricing)")).toEqual([
      { kind: "link", href: "https://dewee.sh/pricing", children: [{ kind: "text", text: "pricing" }] },
    ]);
    expect(parseInline("[x](javascript:alert(1)) <img src=x>")).toEqual([{ kind: "text", text: "[x](javascript:alert(1)) <img src=x>" }]);
    expect(parseInline("see https://dewee.sh.")[1]).toEqual({ kind: "link", href: "https://dewee.sh/", children: [{ kind: "text", text: "https://dewee.sh" }] });
  });

  it("leaves snake_case words and lone asterisks alone", () => {
    expect(parseInline("set CHAT_AGENT_ENABLED to true, 5 * 3")).toEqual([{ kind: "text", text: "set CHAT_AGENT_ENABLED to true, 5 * 3" }]);
  });
});
