import { describe, expect, it } from "vitest";
import { insertDirective, uniqueWidgetId } from "../../src/components/admin/post-widget-insert";

describe("post editor widget insert", () => {
  it("derives an unused id from the type", () => {
    expect(uniqueWidgetId("VideoEmbed", [])).toBe("video-embed-1");
    expect(uniqueWidgetId("Gallery", [{ id: "gallery-1" }, { id: "gallery-2" }, null, "x"])).toBe("gallery-3");
  });

  it("puts the directive on its own line at the cursor", () => {
    expect(insertDirective("", 0, "a")).toEqual({ text: '::widget{id="a"}\n', cursor: 17 });
    const body = "First paragraph.\n\nSecond paragraph.\n";
    const r = insertDirective(body, body.indexOf("Second"), "a");
    expect(r.text).toBe('First paragraph.\n\n::widget{id="a"}\n\nSecond paragraph.\n');
    expect(r.text.slice(r.cursor)).toBe("Second paragraph.\n");
  });

  it("never splits a line: mid-line inserts go after it", () => {
    const r = insertDirective("One sentence here.\nNext line", 4, "a");
    expect(r.text).toBe('One sentence here.\n\n::widget{id="a"}\n\nNext line');
    expect(insertDirective("End", 3, "a").text).toBe('End\n\n::widget{id="a"}\n');
  });
});
