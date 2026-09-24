import { describe, expect, it } from "vitest";
import { escapeHtml, inlineMarkup } from "../src/lib/inline-markup";

describe("inlineMarkup", () => {
  it("escapes HTML before applying markup", () => {
    expect(inlineMarkup('<img src=x onerror="alert(1)">')).toBe("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
    expect(escapeHtml(`&<>"'`)).toBe("&amp;&lt;&gt;&quot;&#39;");
  });

  it("renders emphasis, highlight and scribble", () => {
    expect(inlineMarkup("The *future* is yours")).toBe("The <em>future</em> is yours");
    expect(inlineMarkup("==homework==")).toBe('<span class="mark">homework</span>');
    expect(inlineMarkup("~~ours~~")).toContain('<span class="scribble">ours<svg');
  });

  it("does not treat multiplication or lone asterisks as emphasis", () => {
    expect(inlineMarkup("2 * 3 * 4")).toBe("2 * 3 * 4");
  });

  it("links only to http(s), mailto and same-site paths", () => {
    expect(inlineMarkup("[Pricing](/pricing)")).toBe('<a href="/pricing">Pricing</a>');
    expect(inlineMarkup("[Mail](mailto:hi@nextlevelbuilder.io)")).toBe('<a href="mailto:hi@nextlevelbuilder.io">Mail</a>');
    expect(inlineMarkup("[x](https://dewee.sh)")).toBe('<a href="https://dewee.sh">x</a>');
    expect(inlineMarkup("[x](javascript:alert(1))")).not.toContain("<a");
    expect(inlineMarkup("[x](//evil.example)")).not.toContain("<a");
  });

  it("cannot break out of the href attribute", () => {
    expect(inlineMarkup('[x](/a"onmouseover="alert(1))')).not.toMatch(/href="[^"]*"on/);
  });
});
