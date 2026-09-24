import { describe, expect, it } from "vitest";
import { linkSegments } from "../src/components/chat/chat-widget-client";

describe("chat message links", () => {
  it("links http(s) URLs and leaves sentence punctuation outside", () => {
    expect(linkSegments("Details: https://dewee.sh/pricing.")).toEqual([
      { text: "Details: " },
      { text: "https://dewee.sh/pricing", href: "https://dewee.sh/pricing" },
      { text: "." },
    ]);
    expect(linkSegments("(see https://dewee.sh/pricing#on-premises)")).toEqual([
      { text: "(see " },
      { text: "https://dewee.sh/pricing#on-premises", href: "https://dewee.sh/pricing#on-premises" },
      { text: ")" },
    ]);
  });

  it("keeps plain text, other schemes and markup as text", () => {
    expect(linkSegments("no links here")).toEqual([{ text: "no links here" }]);
    expect(linkSegments("javascript:alert(1) <b>x</b>")).toEqual([{ text: "javascript:alert(1) <b>x</b>" }]);
    expect(linkSegments('https://a.io/x"onmouseover=1')).toEqual([{ text: "https://a.io/x", href: "https://a.io/x" }, { text: '"onmouseover=1' }]);
  });

  it("finds several links on separate lines", () => {
    const segs = linkSegments("a https://dewee.sh\nb http://x.io/y?z=1");
    expect(segs.filter((s) => s.href).map((s) => s.href)).toEqual(["https://dewee.sh/", "http://x.io/y?z=1"]);
  });
});
