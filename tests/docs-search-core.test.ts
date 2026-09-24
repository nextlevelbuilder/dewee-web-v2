import { describe, expect, it } from "vitest";
import { fold, markTerms, prepare, searchDocs, terms, type SearchDoc } from "../src/components/docs/docs-search-core";

const doc = (over: Partial<SearchDoc>): SearchDoc => ({ t: "", s: "", d: "", u: "/docs/x", h: [], x: "", ...over });

const DOCS = [
  doc({ t: "Chat channels", s: "Integrations", d: "Telegram, Slack and Zalo.", u: "/docs/integrations/channels", h: [["Pairing codes", "pairing-codes"]], x: "Unknown senders wait for approval." }),
  doc({ t: "Licence activation", s: "Runtime & CLI", d: "Activate a runtime with a key.", u: "/docs/runtime/licence", h: [["Grace period", "grace-period"]], x: "Heartbeat every five minutes." }),
  doc({ t: "Kênh chat", s: "Tích hợp", d: "Kết nối Telegram và Zalo.", u: "/vi/docs/integrations/channels", h: [["Mã ghép cặp", "ma-ghep-cap"]], x: "Người gửi mới chờ duyệt." }),
].map(prepare);

describe("fold", () => {
  it("removes Vietnamese diacritics and maps đ to d", () => {
    expect(fold("Kênh ĐĂNG ký")).toBe("kenh dang ky");
  });

  it("keeps one output unit per input unit so highlights line up", () => {
    for (const s of ["Tiếng Việt", "İstanbul", "emoji 🚀 ok", "ﬁle"]) expect(fold(s)).toHaveLength(s.length);
  });
});

describe("terms", () => {
  it("splits, folds, de-duplicates and caps the query", () => {
    expect(terms("  Kênh, kenh  (chat) ")).toEqual(["kenh", "chat"]);
    expect(terms("a b c d e f g h i j")).toHaveLength(8);
    expect(terms("   ")).toEqual([]);
  });
});

describe("searchDocs", () => {
  it("ranks a title match above a body match", () => {
    const hits = searchDocs(DOCS, "activation");
    expect(hits[0].doc.u).toBe("/docs/runtime/licence");
  });

  it("requires every term to match somewhere", () => {
    expect(searchDocs(DOCS, "telegram licence")).toEqual([]);
    expect(searchDocs(DOCS, "telegram zalo").map((h) => h.doc.u)).toEqual(expect.arrayContaining(["/docs/integrations/channels"]));
  });

  it("matches without accents and links to the best heading", () => {
    const [hit] = searchDocs(DOCS, "ghep cap");
    expect(hit.doc.u).toBe("/vi/docs/integrations/channels");
    expect(hit.url).toBe("/vi/docs/integrations/channels#ma-ghep-cap");
  });

  it("links to the page itself when the title explains the match", () => {
    const [hit] = searchDocs(DOCS, "licence");
    expect(hit.url).toBe("/docs/runtime/licence");
    expect(hit.heading).toBeUndefined();
  });

  it("returns nothing for an empty query and honours the limit", () => {
    expect(searchDocs(DOCS, "")).toEqual([]);
    expect(searchDocs(DOCS, "a", 1)).toHaveLength(1);
  });
});

describe("markTerms", () => {
  it("marks matches in the original text, accents included", () => {
    expect(markTerms("Kênh chat", "kenh")).toEqual([
      ["Kênh", true],
      [" chat", false],
    ]);
  });

  it("returns the whole text unmarked when nothing matches", () => {
    expect(markTerms("Grace period", "zalo")).toEqual([["Grace period", false]]);
  });
});
