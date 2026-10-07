import { describe, expect, it } from "vitest";
import { cleanCountry, cleanPath, cleanReferrer, cleanUtm, mergeChatContext, readChatContext, writeChatContext } from "../src/lib/chat-session-context";

describe("chat session context validation", () => {
  it("keeps same-site paths only, without query or fragment", () => {
    expect(cleanPath("/vi/pricing?x=1#plans")).toBe("/vi/pricing");
    expect(cleanPath("//evil.com/x")).toBeUndefined();
    expect(cleanPath("https://evil.com")).toBeUndefined();
    expect(cleanPath("/<script>")).toBeUndefined();
    expect(cleanPath(`/${"a".repeat(300)}`)).toBeUndefined();
  });

  it("reduces referrers to host + path and drops same-site ones", () => {
    expect(cleanReferrer("https://www.google.com/search?q=secret")).toBe("www.google.com/search");
    expect(cleanReferrer("https://news.ycombinator.com/")).toBe("news.ycombinator.com");
    expect(cleanReferrer("news.ycombinator.com/item")).toBe("news.ycombinator.com/item");
    expect(cleanReferrer("https://staging.dewee.sh/pricing", "dewee.sh")).toBeUndefined();
    expect(cleanReferrer("javascript:alert(1)")).toBeUndefined();
    expect(cleanReferrer("")).toBeUndefined();
  });

  it("normalises UTM values and country codes", () => {
    expect(cleanUtm(" Facebook ")).toBe("facebook");
    expect(cleanUtm("spring_sale-2026")).toBe("spring_sale-2026");
    expect(cleanUtm("<b>x</b>")).toBeUndefined();
    expect(cleanUtm("x".repeat(200))?.length).toBe(80);
    expect(cleanCountry("vn")).toBe("VN");
    expect(cleanCountry("T1")).toBe("T1");
    expect(cleanCountry("Vietnam")).toBeUndefined();
  });

  it("round-trips through query parameters and drops anything invalid", () => {
    const params = new URLSearchParams();
    writeChatContext(params, { page: "/pricing", landing: "/", referrer: "google.com", utmSource: "fb", country: "VN" });
    params.set("um", "<bad>");
    expect(readChatContext(params)).toEqual({ page: "/pricing", landing: "/", referrer: "google.com", utmSource: "fb", country: "VN" });
  });

  it("keeps the first visit's origin and follows the newest page", () => {
    const first = { page: "/", landing: "/", utmSource: "fb", country: "VN" };
    expect(mergeChatContext(first, { page: "/pricing", landing: "/install", utmSource: "google", country: "US" }))
      .toEqual({ page: "/pricing", landing: "/", utmSource: "fb", country: "VN" });
    expect(mergeChatContext({}, { page: "/x" })).toEqual({ page: "/x" });
  });
});
