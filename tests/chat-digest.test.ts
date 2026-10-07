import { afterEach, describe, expect, it, vi } from "vitest";
import { composeDigest, digestTitle, tally, topQuestions, type DigestSession } from "../src/lib/server/chat-digest";
import { digestMarker, runDailyDigest } from "../src/lib/server/chat-digest-run";
import { recordTurn, recordVisitorMessage } from "../src/lib/server/chat-room-records";
import { memoryKv, sqliteD1 } from "./helpers/sqlite-d1";

const NOW = new Date("2026-10-08T01:17:00Z");
const SINCE = "2026-10-07T01:17:00.000Z";

const session = (over: Partial<DigestSession>): DigestSession => ({
  locale: "en", country: "VN", landing_path: "/", page_path: "/", utm_source: null, referrer: null, first_message: "hi",
  created_at: "2026-10-07T10:00:00.000Z", outcome: "answered", agent_failures: 0, faq_fallbacks: 0, handoff_at: null, ...over,
});

describe("composeDigest", () => {
  it("summarises sessions, questions, fallbacks, handoffs and leads", () => {
    const d = composeDigest({
      since: SINCE,
      sessions: [
        session({ locale: "vi", landing_path: "/vi/pricing", utm_source: "fb", first_message: "Giá bao nhiêu?", outcome: "lead" }),
        session({ first_message: "giá bao nhiêu", faq_fallbacks: 2, agent_failures: 1, outcome: "faq_fallback", referrer: "google.com/search" }),
        session({ first_message: "Can I self-host?", handoff_at: "2026-10-07T12:00:00.000Z", outcome: "handoff", country: "US" }),
        session({ created_at: "2026-10-01T00:00:00.000Z", first_message: "old question", faq_fallbacks: 1 }),
      ],
      leads: [{ email: "lan@acme.vn", payload: JSON.stringify({ sid: "x", need: "Zalo bot for 20 staff" }), created_at: "2026-10-07T11:00:00.000Z" }],
    }, NOW);
    expect(d.title).toBe("Website chat digest · 2026-10-08");
    expect(d.lines.Sessions).toBe("3 new · 4 active in the last 24 h");
    expect(d.lines["By locale"]).toBe("en 2 · vi 1");
    expect(d.lines["By country"]).toBe("VN 2 · US 1");
    expect(d.lines.Sources).toBe("direct 1 · google.com 1 · utm:fb 1");
    expect(d.lines["Top questions"].split("\n")[0]).toBe("• Giá bao nhiêu? (×2)");
    expect(d.lines["Top questions"]).not.toContain("old question");
    expect(d.lines.Agent).toBe("3 FAQ fallbacks · 1 agent failures");
    expect(d.lines.Handoffs).toBe("1");
    expect(d.lines["New leads"]).toBe("• lan@acme.vn · Zalo bot for 20 staff");
  });

  it("says so on a quiet day", () => {
    expect(composeDigest({ since: SINCE, sessions: [], leads: [] }, NOW).lines).toEqual({ Sessions: "No website chats in the last 24 hours." });
  });

  it("clips, escapes and limits", () => {
    expect(topQuestions([{ first_message: `**${"x".repeat(200)}**`, created_at: SINCE }])).toMatch(/^• \\\*\\\*x+…$/);
    expect(tally(["a", "b", "c"], 2)).toBe("a 1 · b 1 · +1 more");
    expect(digestTitle(new Date("2026-10-07T18:30:00Z"))).toBe("Website chat digest · 2026-10-08");
  });
});

describe("runDailyDigest (once per day)", () => {
  afterEach(() => vi.unstubAllGlobals());

  function setup(status = 204) {
    const { d1 } = sqliteD1();
    const { kv, map } = memoryKv();
    const discord = vi.fn(async (_url: string, _init: RequestInit) => new Response(null, { status }));
    vi.stubGlobal("fetch", discord);
    const env = { DB: d1, KV: kv, DISCORD_WEBHOOK_URL: "https://discord.example/hook", ENVIRONMENT: "staging" } as unknown as Env;
    return { env, map, discord };
  }

  it("waits for 01:00 UTC, posts once, then skips the rest of the day", async () => {
    const { env, map, discord } = setup();
    await recordVisitorMessage(env, "0f9b8c7d-1111-2222-3333-444455556666", "en", "Pricing?", { country: "VN" });
    await recordTurn(env, "0f9b8c7d-1111-2222-3333-444455556666", "agent_failure");
    expect(await runDailyDigest(env, new Date("2026-10-08T00:17:00Z"))).toBe("not-due");
    // Today at 01:17 UTC: the session recorded just now falls inside its 24-hour window.
    const at = new Date();
    at.setUTCHours(1, 17, 0, 0);
    expect(await runDailyDigest(env, at)).toBe("sent");
    expect(await runDailyDigest(env, new Date(at.getTime() + 3_600_000))).toBe("already-sent");
    expect(discord).toHaveBeenCalledTimes(1);
    expect(map.has(digestMarker(at))).toBe(true);
    const embed = JSON.parse(discord.mock.calls[0][1].body as string).embeds[0];
    expect(embed.title).toMatch(/^\[staging\] Website chat digest/);
    expect(embed.fields).toEqual(expect.arrayContaining([{ name: "Agent", value: "1 FAQ fallbacks · 1 agent failures", inline: false }]));
  });

  it("does not mark the day when Discord refuses, so the next hour retries", async () => {
    const { env, map } = setup(500);
    expect(await runDailyDigest(env, NOW)).toBe("failed");
    expect(map.size).toBe(0);
  });

  it("does nothing without a webhook", async () => {
    const { env } = setup();
    expect(await runDailyDigest({ ...env, DISCORD_WEBHOOK_URL: undefined }, NOW)).toBe("not-configured");
  });
});
