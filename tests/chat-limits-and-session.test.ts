import { describe, expect, it } from "vitest";
import { applyHit, CHAT_LIMITS, dailyBudget, HOUR_MS } from "../src/lib/server/chat-limits";
import { hashIp, signChatSession, verifyChatSession } from "../src/lib/server/chat-session-token";
import { emailIn, replyAsksForEmail, wantsHuman } from "../src/lib/server/chat-handoff";

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

describe("signed chat sessions", () => {
  const secret = "test-secret-with-enough-entropy-0123456789";
  const sid = "0f8e2f6c-3a1b-4c55-9d1e-7b2a6c9e0d11";

  it("verifies a fresh token for the same sid and IP", async () => {
    const ih = await hashIp(secret, "203.0.113.7");
    expect(ih).toMatch(/^[0-9a-f]{32}$/);
    const token = await signChatSession(secret, sid, ih, Date.now() + 60_000);
    expect(await verifyChatSession(secret, token, sid, ih)).toBe(true);
  });

  it("rejects another IP, another sid, another secret, expiry and tampering", async () => {
    const ih = await hashIp(secret, "203.0.113.7");
    const other = await hashIp(secret, "198.51.100.9");
    const exp = Date.now() + 60_000;
    const token = await signChatSession(secret, sid, ih, exp);
    expect(await verifyChatSession(secret, token, sid, other)).toBe(false);
    expect(await verifyChatSession(secret, token, `${sid.slice(0, -1)}2`, ih)).toBe(false);
    expect(await verifyChatSession("another-secret-0123456789abcdef", token, sid, ih)).toBe(false);
    expect(await verifyChatSession(secret, token, sid, ih, exp + 1)).toBe(false);
    expect(await verifyChatSession(secret, token.replace(/^\d+/, String(exp + 3_600_000)), sid, ih)).toBe(false);
    expect(await verifyChatSession(secret, "garbage", sid, ih)).toBe(false);
    expect(await verifyChatSession(secret, `${token}.x`, sid, ih)).toBe(false);
  });
});

describe("handoff signals", () => {
  it("spots requests for a person in English and Vietnamese", () => {
    expect(wantsHuman("I'd like to talk to a human")).toBe(true);
    expect(wantsHuman("Mình muốn nói chuyện với người thật")).toBe(true);
    expect(wantsHuman("How much does dewee cost?")).toBe(false);
  });

  it("extracts an email typed into the chat", () => {
    expect(emailIn("sure, it's Lan.Pham@Example.com.")).toBe("lan.pham@example.com");
    expect(emailIn("no email here @ all")).toBeNull();
  });

  it("notices a reply that asks for the visitor's email", () => {
    expect(replyAsksForEmail("I'll connect you with the team. What's your email?")).toBe(true);
    expect(replyAsksForEmail("Mình sẽ kết nối bạn với đội ngũ dewee.")).toBe(true);
    expect(replyAsksForEmail("Self-install is free.")).toBe(false);
  });
});
