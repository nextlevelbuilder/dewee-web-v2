import { describe, expect, it } from "vitest";
import { publicPath, RESERVED_TOP_LEVEL, slugError, slugify } from "../../src/lib/server/pages/slug-rules";
import { parseIfMatch } from "../../src/lib/server/pages/page-service";
import { createPageInput, toRecord, updatePageInput, type PageRow } from "../../src/lib/server/pages/page-schema";
import { checkUpload, decodeBase64Image, mediaKey, sniffImageType } from "../../src/lib/server/media/media-upload";
import { ApiError } from "../../src/lib/server/api/api-errors";

describe("slug rules", () => {
  it("accepts kebab-case pages up to four levels and single-segment posts", () => {
    expect(slugError("webinar", "page")).toBeNull();
    expect(slugError("events/webinar-2026", "page")).toBeNull();
    expect(slugError("a/b/c/d", "page")).toBeNull();
    expect(slugError("a/b/c/d/e", "page")).toMatch(/four levels/);
    expect(slugError("introducing-dewee", "post")).toBeNull();
    expect(slugError("news/introducing-dewee", "post")).toMatch(/without slashes/);
  });

  it("rejects bad characters, empty and overlong slugs", () => {
    for (const bad of ["", "Upper", "under_score", "-lead", "trail-", "double--dash", "space here", "a//b", "/abs", "dot.html", "../x"]) {
      expect(slugError(bad, "page"), bad).not.toBeNull();
    }
    expect(slugError("a".repeat(121), "page")).toMatch(/longer/);
  });

  it("reserves site routes as the first page segment only", () => {
    for (const r of ["pricing", "admin", "api", "mcp", "blog", "docs", "vi", "p", "media"]) {
      expect(RESERVED_TOP_LEVEL.has(r), r).toBe(true);
      expect(slugError(r, "page"), r).toMatch(/reserved/);
      expect(slugError(`${r}/sub`, "page"), r).toMatch(/reserved/);
    }
    expect(slugError("events/pricing", "page")).toBeNull();
    expect(slugError("pricing", "post")).toBeNull();
  });

  it("slugifies English and Vietnamese titles", () => {
    expect(slugify("Introducing dewee!")).toBe("introducing-dewee");
    expect(slugify("Giới thiệu dewee: nền tảng đa tác tử")).toBe("gioi-thieu-dewee-nen-tang-da-tac-tu");
    expect(slugify("  --  ")).toBe("");
    expect(slugify("a ".repeat(100)).length).toBeLessThanOrEqual(80);
  });

  it("builds public paths per kind and locale", () => {
    expect(publicPath("page", "en", "events/webinar")).toBe("/p/events/webinar");
    expect(publicPath("page", "vi", "webinar")).toBe("/vi/p/webinar");
    expect(publicPath("post", "en", "hello")).toBe("/blog/hello");
    expect(publicPath("post", "vi", "hello")).toBe("/vi/blog/hello");
  });
});

describe("page input and records", () => {
  it("parses If-Match forms", () => {
    expect(parseIfMatch('"3"')).toBe(3);
    expect(parseIfMatch('W/"12"')).toBe(12);
    expect(parseIfMatch("7")).toBe(7);
    expect(parseIfMatch("*")).toBeNull();
    expect(parseIfMatch("abc")).toBeNull();
    expect(parseIfMatch(null)).toBeNull();
  });

  it("defaults create input and rejects unknown fields", () => {
    const ok = createPageInput.parse({ title: "Hello" });
    expect(ok.locale).toBe("en");
    expect(ok.description).toBe("");
    expect(createPageInput.safeParse({ title: "x", html: "<b>" }).success).toBe(false);
    expect(createPageInput.safeParse({ title: "" }).success).toBe(false);
    expect(createPageInput.safeParse({ title: "x", cover: "javascript:alert(1)" }).success).toBe(false);
    expect(createPageInput.safeParse({ title: "x", status: "archived" }).success).toBe(false);
    expect(updatePageInput.safeParse({ version: 0 }).success).toBe(false);
    expect(updatePageInput.safeParse({ title: "New", version: 2, note: "typo" }).success).toBe(true);
  });

  it("turns rows into records with parsed JSON and a public url", () => {
    const row: PageRow = {
      id: "0b7a3a52-1111-4222-8333-444455556666",
      kind: "post",
      locale: "vi",
      slug: "hello",
      title: "Xin chào",
      description: "",
      layout: "weird",
      blocks: "not json",
      body_md: "# Hi",
      seo: "{}",
      cover: null,
      tags: '["release"]',
      author: "duy",
      status: "published",
      translation_key: "hello",
      published_at: "2026-09-01T00:00:00.000Z",
      created_at: "2026-09-01T00:00:00.000Z",
      updated_at: "2026-09-01T00:00:00.000Z",
      version: 1,
    };
    const rec = toRecord(row);
    expect(rec.layout).toBe("default");
    expect(rec.blocks).toEqual([]);
    expect(rec.tags).toEqual(["release"]);
    expect(rec.url).toBe("/vi/blog/hello");
  });
});

describe("media uploads", () => {
  const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
  const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0]);
  const svg = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');

  it("sniffs raster types and refuses SVG and HTML", () => {
    expect(sniffImageType(png)).toBe("image/png");
    expect(sniffImageType(jpeg)).toBe("image/jpeg");
    expect(sniffImageType(new TextEncoder().encode("GIF89a......"))).toBe("image/gif");
    expect(sniffImageType(new TextEncoder().encode("RIFF\0\0\0\0WEBPVP8 "))).toBe("image/webp");
    expect(sniffImageType(new TextEncoder().encode("\0\0\0\x1cftypavif\0\0"))).toBe("image/avif");
    expect(sniffImageType(svg)).toBeNull();
    expect(sniffImageType(new TextEncoder().encode("<!doctype html>"))).toBeNull();
  });

  it("checks the declared type against the bytes", () => {
    expect(checkUpload(png, "image/png")).toBe("image/png");
    expect(checkUpload(png, null)).toBe("image/png");
    expect(checkUpload(jpeg, "image/jpg")).toBe("image/jpeg");
    expect(() => checkUpload(png, "image/jpeg")).toThrow(ApiError);
    expect(() => checkUpload(svg, "image/svg+xml")).toThrow(/Only/);
    expect(() => checkUpload(new Uint8Array(), "image/png")).toThrow(/empty/);
    const big = new Uint8Array(10 * 1024 * 1024 + 1);
    big.set(png);
    expect(() => checkUpload(big, "image/png")).toThrow(/10 MB/);
  });

  it("builds dated keys and decodes base64 or data URLs", () => {
    expect(mediaKey("png", new Date("2026-09-05T10:00:00Z"), "abc")).toBe("media/2026/09/abc.png");
    const b64 = btoa(String.fromCharCode(...png));
    expect(decodeBase64Image(b64)).toEqual(png);
    expect(decodeBase64Image(`data:image/png;base64,${b64}`)).toEqual(png);
    expect(() => decodeBase64Image("%%%")).toThrow(/base64/);
  });
});
