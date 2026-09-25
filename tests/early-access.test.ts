import { describe, expect, it } from "vitest";
import { fillTemplate, formatUsd, isEarlyAccessOpen, parseEarlyAccess, timeLeft } from "../src/lib/early-access";
import { EARLY_ACCESS, earlyAccessBlock } from "../src/content/early-access";

const valid = {
  active: true,
  discountPercent: 50,
  totalSlots: 50,
  remainingSlots: 37,
  endsAt: "2026-10-15T16:59:59Z",
  priceCents: 50000,
  discountedPriceCents: 25000,
  checkoutUrl: "https://app.dewee.sh/checkout/early-access",
};
const before = Date.parse("2026-10-01T00:00:00Z");

describe("Early Access terms", () => {
  it("ends at 23:59:59 on 15 October 2026 in Vietnam time", () => {
    expect(new Date(EARLY_ACCESS.endsAt).toLocaleString("en-GB", { timeZone: "Asia/Ho_Chi_Minh" })).toBe("15/10/2026, 23:59:59");
    expect(EARLY_ACCESS.discountedPriceUsd).toBe((EARLY_ACCESS.priceUsd * (100 - EARLY_ACCESS.discountPercent)) / 100);
  });

  it("builds block props with no unfilled placeholders except the live ones", () => {
    for (const locale of ["en", "vi"] as const) {
      const b = earlyAccessBlock(locale, { cta: "/contact?plan=self-hosted" });
      const staticText = JSON.stringify({ ...b, slotsLeft: "", countdown: "" });
      expect(staticText).not.toMatch(/\{\w+\}/);
      expect(b.slotsTotal).toContain("50");
      expect(b.price).toEqual({ now: "$250", was: "$500", period: expect.stringContaining("$500") });
      expect(b.slotsLeft).toContain("{n}");
    }
    expect(earlyAccessBlock("en", { cta: "/c" }).deadline).toBe("until October 15, 2026");
    expect(earlyAccessBlock("vi", { cta: "/c" }).deadline).toBe("đến hết ngày 15/10/2026");
  });
});

describe("parseEarlyAccess", () => {
  it("accepts the documented shape", () => {
    expect(parseEarlyAccess(valid)).toEqual({ ...valid, endsAt: "2026-10-15T16:59:59.000Z" });
  });

  it("drops a checkout URL that is not https", () => {
    expect(parseEarlyAccess({ ...valid, checkoutUrl: "javascript:alert(1)" })).not.toHaveProperty("checkoutUrl");
    expect(parseEarlyAccess({ ...valid, checkoutUrl: "http://example.com" })).not.toHaveProperty("checkoutUrl");
    expect(parseEarlyAccess({ ...valid, checkoutUrl: undefined })).not.toHaveProperty("checkoutUrl");
  });

  it.each([
    ["null", null],
    ["a string", "nope"],
    ["missing active", { ...valid, active: undefined }],
    ["more slots left than exist", { ...valid, remainingSlots: 51 }],
    ["negative slots", { ...valid, remainingSlots: -1 }],
    ["fractional slots", { ...valid, remainingSlots: 1.5 }],
    ["zero total", { ...valid, totalSlots: 0 }],
    ["a bad date", { ...valid, endsAt: "soon" }],
    ["a discount above the price", { ...valid, discountedPriceCents: 60000 }],
    ["a discount over 100%", { ...valid, discountPercent: 120 }],
  ])("rejects %s", (_name, raw) => {
    expect(parseEarlyAccess(raw)).toBeNull();
  });
});

describe("isEarlyAccessOpen", () => {
  it("is open before the deadline without live data", () => {
    expect(isEarlyAccessOpen(before, EARLY_ACCESS.endsAt)).toBe(true);
  });

  it("closes after the deadline", () => {
    expect(isEarlyAccessOpen(Date.parse("2026-10-15T17:00:00Z"), EARLY_ACCESS.endsAt)).toBe(false);
  });

  it("closes when the endpoint says it is inactive or full", () => {
    expect(isEarlyAccessOpen(before, EARLY_ACCESS.endsAt, { ...valid, active: false })).toBe(false);
    expect(isEarlyAccessOpen(before, EARLY_ACCESS.endsAt, { ...valid, remainingSlots: 0 })).toBe(false);
    expect(isEarlyAccessOpen(before, EARLY_ACCESS.endsAt, valid)).toBe(true);
  });

  it("follows the live deadline when there is one", () => {
    expect(isEarlyAccessOpen(before, EARLY_ACCESS.endsAt, { ...valid, endsAt: "2026-09-30T00:00:00Z" })).toBe(false);
  });
});

describe("helpers", () => {
  it("counts whole days and hours left, never below zero", () => {
    expect(timeLeft(Date.parse("2026-10-14T14:59:59Z"), "2026-10-15T16:59:59Z")).toEqual({ days: 1, hours: 2 });
    expect(timeLeft(Date.parse("2026-10-16T00:00:00Z"), "2026-10-15T16:59:59Z")).toEqual({ days: 0, hours: 0 });
  });

  it("formats cents as dollars", () => {
    expect(formatUsd(25000)).toBe("$250");
    expect(formatUsd(123456)).toBe("$1,234.56");
  });

  it("fills known placeholders and leaves unknown ones", () => {
    expect(fillTemplate("{n} of {total} {x}", { n: 3, total: 50 })).toBe("3 of 50 {x}");
  });
});

describe("Early Access proxy", () => {
  const req = new Request("https://dewee.sh/api/early-access");
  const upstream = (body: unknown, status = 200) => (async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;

  it("passes through a valid upstream body, validated", async () => {
    const { handleEarlyAccessRequest } = await import("../src/lib/server/early-access-proxy");
    const res = await handleEarlyAccessRequest(req, upstream(valid));
    expect(res.headers.get("cache-control")).toContain("max-age=60");
    expect(await res.json()).toMatchObject({ remainingSlots: 37, checkoutUrl: valid.checkoutUrl });
  });

  it("answers null (200) when the upstream fails, is missing or is malformed", async () => {
    const { handleEarlyAccessRequest } = await import("../src/lib/server/early-access-proxy");
    const down = (async () => { throw new Error("offline"); }) as unknown as typeof fetch;
    for (const f of [down, upstream({}, 404), upstream({ active: "yes" })]) {
      const res = await handleEarlyAccessRequest(req, f);
      expect(res.status).toBe(200);
      expect(await res.json()).toBeNull();
    }
  });
});
