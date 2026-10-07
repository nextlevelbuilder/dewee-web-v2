import { afterEach, describe, expect, it, vi } from "vitest";
import { mergeLead, saveChatLead } from "../src/lib/server/chat-lead-records";
import { announceNewChat, recordHandoff, recordTurn, recordVisitorMessage } from "../src/lib/server/chat-room-records";
import { sqliteD1 } from "./helpers/sqlite-d1";

const SID = "0f9b8c7d-1111-2222-3333-444455556666";

function setup() {
  const { d1, raw } = sqliteD1();
  const discord = vi.fn(async (_url: string, _init: RequestInit) => new Response(null, { status: 204 }));
  vi.stubGlobal("fetch", discord);
  const env = { DB: d1, DISCORD_WEBHOOK_URL: "https://discord.example/hook", ENVIRONMENT: "production" } as unknown as Env;
  const session = () => ({ ...raw.prepare("SELECT * FROM chat_sessions WHERE sid = ?").get(SID) });
  const posted = () => discord.mock.calls.map(([, init]) => JSON.parse(init.body as string).embeds[0]);
  return { env, raw, session, posted, discord };
}

afterEach(() => vi.unstubAllGlobals());

describe("chat session records (migration-backed)", () => {
  it("stores visit context on the first message, keeps the origin and follows the page", async () => {
    const { env, session } = setup();
    await recordVisitorMessage(env, SID, "vi", "Giá bao nhiêu?", { page: "/vi", landing: "/vi", referrer: "google.com", utmSource: "fb", country: "VN" });
    await recordVisitorMessage(env, SID, "vi", "Cài đặt thế nào?", { page: "/vi/install", landing: "/x", utmSource: "other", country: "US" });
    expect(session()).toMatchObject({
      messages: 2, first_message: "Giá bao nhiêu?", page_path: "/vi/install", landing_path: "/vi",
      referrer: "google.com", utm_source: "fb", utm_medium: null, country: "VN", outcome: null,
    });
  });

  it("counts replies and only ever raises the outcome", async () => {
    const { env, session } = setup();
    await recordVisitorMessage(env, SID, "en", "hi", {});
    await recordTurn(env, SID, "answered");
    expect(session()).toMatchObject({ outcome: "answered", agent_replies: 1 });
    await recordTurn(env, SID, "agent_failure");
    expect(session()).toMatchObject({ outcome: "faq_fallback", agent_failures: 1, faq_fallbacks: 1 });
    await recordHandoff(env, SID);
    await recordTurn(env, SID, "answered");
    expect(session()).toMatchObject({ outcome: "handoff", agent_replies: 2 });
    expect(session().handoff_at).toMatch(/^\d{4}-/);
  });

  it("reports whether Discord took the new-chat notice", async () => {
    const { env, discord, posted } = setup();
    expect(await announceNewChat(env, SID, "en", "Pricing?", { page: "/pricing", country: "VN" })).toBe(true);
    expect(posted()[0]).toMatchObject({ title: "New website chat" });
    expect(posted()[0].fields.map((f: { name: string }) => f.name)).toEqual(["Locale", "Page", "Country", "Message", "Session"]);
    discord.mockResolvedValueOnce(new Response("slow down", { status: 429 }));
    expect(await announceNewChat(env, SID, "en", "Pricing?", {})).toBe(false);
    expect(await announceNewChat({ ...env, DISCORD_WEBHOOK_URL: undefined }, SID, "en", "x", {})).toBe(false);
  });
});

describe("chat leads (migration-backed)", () => {
  const base = { sid: SID, locale: "en" as const, ctx: { page: "/pricing", country: "VN" }, transcript: [{ role: "user", text: "lan@acme.vn" }] };

  it("creates one lead per conversation, then enriches it", async () => {
    const { env, raw, session, posted } = setup();
    await recordVisitorMessage(env, SID, "en", "hi", {});
    const first = await saveChatLead(env, { ...base, leadId: null, previous: null, fields: { email: "lan@acme.vn" }, via: "chat" });
    expect(first.leadId).toBeTypeOf("number");
    const second = await saveChatLead(env, { ...base, leadId: first.leadId, previous: first.fields, fields: { email: "lan@acme.vn", need: "Zalo bot", teamSize: "20" }, via: "agent" });
    expect(second.leadId).toBe(first.leadId);
    const rows = raw.prepare("SELECT kind, email, source, payload FROM leads").all().map((r) => ({ ...r }));
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ kind: "chat", email: "lan@acme.vn", source: "chat-widget" });
    expect(JSON.parse(rows[0].payload as string)).toEqual({ sid: SID, need: "Zalo bot", teamSize: "20", via: "agent", page: "/pricing", country: "VN" });
    expect(session()).toMatchObject({ email: "lan@acme.vn", lead_id: first.leadId, outcome: "lead" });
    expect(posted().map((e) => e.title)).toEqual(["New chat lead", "Chat lead updated"]);
    expect(posted()[1].fields).toEqual(expect.arrayContaining([{ name: "Need", value: "Zalo bot", inline: false }, expect.objectContaining({ name: "Transcript" })]));
  });

  it("does nothing when a known lead learns nothing new", async () => {
    const { env, discord } = setup();
    const r = await saveChatLead(env, { ...base, leadId: 7, previous: { email: "a@b.co", need: "x" }, fields: { email: "a@b.co" }, via: "agent" });
    expect(r).toEqual({ leadId: 7, fields: { email: "a@b.co", need: "x" }, changed: false });
    expect(discord).not.toHaveBeenCalled();
  });

  it("merges without erasing known fields", () => {
    expect(mergeLead({ email: "a@b.co", need: "x" }, { email: "a@b.co", company: "Acme" })).toEqual({ fields: { email: "a@b.co", need: "x", company: "Acme" }, changed: true });
    expect(mergeLead(null, { email: "a@b.co" }).changed).toBe(true);
  });
});
