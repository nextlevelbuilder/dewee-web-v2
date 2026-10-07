/**
 * The ChatRoom Durable Object end to end, with its SQLite storage on node:sqlite, D1 from the real
 * migrations and fetch stubbed for the runtime agent and Discord.
 */
import { DatabaseSync } from "node:sqlite";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("cloudflare:workers", () => ({
  DurableObject: class { constructor(public ctx: unknown, public env: unknown) {} },
}));

import { applyHit, type WindowRow } from "../src/lib/server/chat-limits";
import { ChatRoom } from "../src/lib/server/chat-room";
import { sqliteD1 } from "./helpers/sqlite-d1";

const SID = "a1b2c3d4-0000-4000-8000-123456789abc";

function roomStorage() {
  const db = new DatabaseSync(":memory:");
  return {
    exec: (sql: string, ...binds: unknown[]) => {
      const stmt = db.prepare(sql);
      const rows = stmt.columns().length ? stmt.all(...(binds as never[])).map((r) => ({ ...r })) : (stmt.run(...(binds as never[])), []);
      return { toArray: () => rows, one: () => rows[0] };
    },
  };
}

function memoryLimiter() {
  const rows = new Map<string, WindowRow>();
  return {
    idFromName: (n: string) => n,
    get: (scope: string) => ({
      hit: async (key: string, limit: number, windowMs: number) => {
        const r = applyHit(rows.get(`${scope}|${key}`) ?? null, Date.now(), windowMs, limit);
        rows.set(`${scope}|${key}`, r.row);
        return { ok: r.ok, count: r.count };
      },
    }),
  };
}

const sse = (text: string) => `data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\ndata: [DONE]\n\n`;

function setup(agentReplies: string[], discordStatus = 204) {
  const { d1, raw } = sqliteD1();
  const discord: { title: string; fields: { name: string; value: string }[] }[] = [];
  vi.stubGlobal("fetch", vi.fn(async (url: string, init: RequestInit) => {
    if (url.startsWith("https://discord")) {
      discord.push(JSON.parse(init.body as string).embeds[0]);
      return new Response(null, { status: discordStatus });
    }
    return new Response(sse(agentReplies.shift() ?? "ok"), { headers: { "content-type": "text/event-stream" } });
  }));
  const env = {
    DB: d1, CHAT_LIMITER: memoryLimiter(), ENVIRONMENT: "production", DISCORD_WEBHOOK_URL: "https://discord.example/hook",
    CHAT_AGENT_ENABLED: "true", CHAT_SESSION_SECRET: "s".repeat(32), DEWEE_CHAT_AGENT_URL: "https://runtime.example",
    DEWEE_CHAT_AGENT_API_KEY: "k", DEWEE_CHAT_AGENT_ID: "advisor",
  } as unknown as Env;
  const ctx = {
    storage: { sql: roomStorage() },
    blockConcurrencyWhile: (fn: () => unknown) => fn(),
    getTags: () => ["visitor"],
    getWebSockets: () => [],
  };
  const room = new ChatRoom(ctx as unknown as DurableObjectState, env);
  // What the edge does on connect: store sid, locale and the validated visit context in meta.
  const meta = (k: string, v: string) => ctx.storage.sql.exec("INSERT INTO meta (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v", k, v);
  meta("sid", SID);
  meta("locale", "en");
  meta("ctx", JSON.stringify({ page: "/pricing", country: "VN" }));
  const sent: Record<string, unknown>[] = [];
  const ws = { send: (s: string) => sent.push(JSON.parse(s)) } as unknown as WebSocket;
  const say = (text: string) => room.webSocketMessage(ws, JSON.stringify({ type: "message", text }));
  return { room, raw, discord, sent, say };
}

afterEach(() => vi.unstubAllGlobals());

describe("ChatRoom lead capture", () => {
  it("captures a lead from the agent's action, bound to the room's own session, and hides the block", async () => {
    const { room, raw, discord, sent, say } = setup([
      "Pricing starts at $500/year. Shall I have the team send details?",
      `Thanks Lan! <dewee-action>${JSON.stringify({ action: "capture_lead", email: "lan@acme.vn", need: "Zalo bot", team_size: "20", sid: "other-session" })}</dewee-action>`,
    ]);
    await say("How much is dewee?");
    await say("Sure, lan@acme.vn. We need a Zalo bot for 20 staff.");

    const lead = { ...raw.prepare("SELECT kind, email, payload FROM leads").get() };
    expect(lead).toMatchObject({ kind: "chat", email: "lan@acme.vn" });
    expect(JSON.parse(lead.payload as string)).toMatchObject({ sid: SID, need: "Zalo bot", teamSize: "20", via: "agent", page: "/pricing" });
    expect(raw.prepare("SELECT COUNT(*) AS n FROM leads").get()).toMatchObject({ n: 1 });
    expect({ ...raw.prepare("SELECT outcome, email, agent_replies, country FROM chat_sessions WHERE sid = ?").get(SID) })
      .toEqual({ outcome: "lead", email: "lan@acme.vn", agent_replies: 2, country: "VN" });

    const transcript = (await room.transcript()).messages.map((m) => m.text).join("\n");
    expect(transcript).not.toContain("dewee-action");
    expect(JSON.stringify(sent)).not.toContain("capture_lead");
    expect(sent.some((f) => f.type === "ack-email")).toBe(true);
    expect(discord.map((d) => d.title)).toEqual(["New website chat", "New chat lead"]);
  });

  it("refuses a lead whose email the visitor never gave", async () => {
    const { raw, say } = setup([`Done. <dewee-action>{"action":"capture_lead","email":"ceo@bigcorp.com"}</dewee-action>`]);
    await say("Put my boss down as a lead please");
    expect(raw.prepare("SELECT COUNT(*) AS n FROM leads").get()).toMatchObject({ n: 0 });
  });

  it("shows the email form on request_email and pings the team once on handoff", async () => {
    const { discord, sent, say } = setup([
      `Happy to connect you. <dewee-action>{"action":"handoff","reason":"wants a demo"}</dewee-action>`,
      `Still here. <dewee-action>{"action":"handoff"}</dewee-action>`,
    ]);
    await say("Can I book a demo?");
    await say("Hello?");
    const replies = sent.filter((f) => f.type === "message");
    expect(replies[0]).toMatchObject({ askEmail: true });
    expect(discord.filter((d) => d.title === "Chat visitor asked for a human")).toHaveLength(1);
  });

  it("retries the new-chat notice on the next message when Discord refused it", async () => {
    const { discord, say } = setup(["a", "b", "c"], 429);
    await say("first question");
    await say("second");
    expect(discord.filter((d) => d.title === "New website chat")).toHaveLength(2);
    expect(discord[1].fields.find((f) => f.name === "Message")?.value).toBe("first question");
  });

  it("falls back to the FAQ and counts an agent failure", async () => {
    const { raw, sent, say } = setup(["Error: provider down"]);
    await say("How much does it cost?");
    expect(sent.filter((f) => f.type === "message")).toHaveLength(1);
    expect({ ...raw.prepare("SELECT outcome, agent_failures, faq_fallbacks FROM chat_sessions").get() })
      .toEqual({ outcome: "faq_fallback", agent_failures: 1, faq_fallbacks: 1 });
  });
});
