import { describe, expect, it } from "vitest";
import { applyHit, CHAT_LIMITS, dailyBudget, HOUR_MS } from "../src/lib/server/chat-limits";
import { emailIn, emailsIn } from "../src/lib/server/chat-visitor-email";

describe("applyHit (fixed window)", () => {
  it("allows up to the limit, then refuses without counting the refusal", () => {
    let row = null;
    const now = 10 * HOUR_MS + 5;
    for (let i = 1; i <= CHAT_LIMITS.ipMessagesPerHour; i++) {
      const hit = applyHit(row, now, HOUR_MS, CHAT_LIMITS.ipMessagesPerHour);
      expect(hit.ok).toBe(true);
      expect(hit.count).toBe(i);
      row = hit.row;
    }
    const refused = applyHit(row, now, HOUR_MS, CHAT_LIMITS.ipMessagesPerHour);
    expect(refused.ok).toBe(false);
    expect(refused.row.count).toBe(CHAT_LIMITS.ipMessagesPerHour);
  });

  it("starts over in the next window", () => {
    const full = { start: 10 * HOUR_MS, count: 5 };
    expect(applyHit(full, 10 * HOUR_MS + 1, HOUR_MS, 5).ok).toBe(false);
    const next = applyHit(full, 11 * HOUR_MS, HOUR_MS, 5);
    expect(next).toEqual({ ok: true, count: 1, row: { start: 11 * HOUR_MS, count: 1 } });
  });

  it("a zero limit refuses everything (budget switched to 0)", () => {
    expect(applyHit(null, Date.now(), HOUR_MS, 0).ok).toBe(false);
  });
});

describe("dailyBudget", () => {
  it("reads the var, falling back to 500 for missing or invalid values", () => {
    expect(dailyBudget(undefined)).toBe(500);
    expect(dailyBudget("abc")).toBe(500);
    expect(dailyBudget("-3")).toBe(500);
    expect(dailyBudget("120")).toBe(120);
    expect(dailyBudget("0")).toBe(0);
  });
});

describe("visitor email parsing", () => {
  it("extracts an email typed into the chat", () => {
    expect(emailIn("sure, it's Lan.Pham@Example.com.")).toBe("lan.pham@example.com");
    expect(emailIn("no email here @ all")).toBeNull();
  });

  it("lists every valid address in order", () => {
    expect(emailsIn("me: a@b.co, or work: Lan@Acme.vn")).toEqual(["a@b.co", "lan@acme.vn"]);
    expect(emailsIn("ping @here")).toEqual([]);
  });
});
