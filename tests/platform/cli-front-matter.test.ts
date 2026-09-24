import { describe, expect, it } from "vitest";
import { parseFrontMatter, parseScalar } from "../../cli/src/front-matter.js";

describe("CLI front matter", () => {
  it("parses scalars, quoted strings, inline lists and a nested map", () => {
    const src = [
      "---",
      "title: \"Tháng 9/2026: sáu bản phát hành\"",
      "slug: september-2026-releases # trailing comment",
      "locale: vi",
      "tags: [phát hành, \"changelog, notes\"]",
      "author: duy",
      "seo:",
      "  title: 'It''s September'",
      "  noindex: false",
      "---",
      "",
      "Body with --- inside the text.",
    ].join("\n");
    const { data, body } = parseFrontMatter(src);
    expect(data).toEqual({
      title: "Tháng 9/2026: sáu bản phát hành",
      slug: "september-2026-releases",
      locale: "vi",
      tags: ["phát hành", "changelog, notes"],
      author: "duy",
      seo: { title: "It's September", noindex: false },
    });
    expect(body).toBe("\nBody with --- inside the text.");
  });

  it("parses block lists and handles CRLF and a BOM", () => {
    const { data, body } = parseFrontMatter("﻿---\r\ntags:\r\n  - one\r\n  - two\r\n---\r\n# Hi\r\n");
    expect(data.tags).toEqual(["one", "two"]);
    expect(body).toBe("# Hi\n");
  });

  it("returns the whole text as body when there is no front matter", () => {
    expect(parseFrontMatter("# Just markdown")).toEqual({ data: {}, body: "# Just markdown" });
  });

  it("rejects malformed front matter with the line number", () => {
    expect(() => parseFrontMatter("---\ntitle: x\n")).toThrow(/never closes/);
    expect(() => parseFrontMatter("---\njust text\n---\n")).toThrow(/line 2/);
    expect(() => parseFrontMatter("---\nseo:\n  title: a\n  - b\n---\n")).toThrow(/mixing/);
  });

  it("types scalars", () => {
    expect(parseScalar("42")).toBe(42);
    expect(parseScalar("true")).toBe(true);
    expect(parseScalar("~")).toBeNull();
    expect(parseScalar("[]")).toEqual([]);
    expect(parseScalar("v3.28")).toBe("v3.28");
  });
});
