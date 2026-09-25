import { describe, expect, it, vi } from "vitest";

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }));

import { agentConfig, askAgent, buildAgentMessage, completionText, parseSse } from "../src/lib/server/chat-agent-client";
import { agentReply } from "../src/lib/server/chat-agent-turn";
import { applyHit, type WindowRow } from "../src/lib/server/chat-limits";
import { verifyTurnstile } from "../src/lib/server/chat-turnstile";

const baseEnv = {
  CHAT_AGENT_ENABLED: "true",
  CHAT_SESSION_SECRET: "secret-0123456789abcdef",
  DEWEE_CHAT_AGENT_URL: "https://runtime.example/",
  DEWEE_CHAT_AGENT_API_KEY: "key",
  DEWEE_CHAT_AGENT_ID: "dewee-web-advisor",
  ENVIRONMENT: "staging",
} as unknown as Env;

const sse = (...events: string[]) => events.map((e) => `data: ${e}\n\n`).join("");
const chunk = (content: string) => JSON.stringify({ choices: [{ delta: { content } }] });

describe("agentConfig (kill switch and settings)", () => {
  it("is on only with the switch, a session secret and all agent settings", () => {
    expect(agentConfig(baseEnv)).toEqual({ url: "https://runtime.example", apiKey: "key", agentId: "dewee-web-advisor" });
    expect(agentConfig({ ...baseEnv, CHAT_AGENT_ENABLED: "false" })).toBeNull();
    expect(agentConfig({ ...baseEnv, CHAT_AGENT_ENABLED: undefined })).toBeNull();
    expect(agentConfig({ ...baseEnv, CHAT_SESSION_SECRET: undefined })).toBeNull();
    expect(agentConfig({ ...baseEnv, DEWEE_CHAT_AGENT_API_KEY: undefined })).toBeNull();
    expect(agentConfig({ ...baseEnv, DEWEE_CHAT_AGENT_URL: "http://runtime.example" })).toBeNull();
  });
});

describe("parseSse", () => {
  it("collects deltas from complete events and keeps the unfinished tail", () => {
    const out = parseSse(`${sse(chunk("Hel"), chunk("lo"))}data: {"choi`);
    expect(out).toEqual({ deltas: ["Hel", "lo"], done: false, rest: 'data: {"choi' });
  });

  it("stops at [DONE] and ignores keep-alives and junk", () => {
    const out = parseSse(`: ping\n\n${sse("not json", chunk("ok"), "[DONE]")}`);
    expect(out.deltas).toEqual(["ok"]);
    expect(out.done).toBe(true);
  });

  it("reads non-streamed completions", () => {
    expect(completionText({ choices: [{ message: { content: "hi" } }] })).toBe("hi");
    expect(completionText({ nope: true })).toBe("");
  });
});

describe("buildAgentMessage", () => {
  it("keeps only recent turns, drops system lines and fences the newest message", () => {
    const history = Array.from({ length: 20 }, (_, i) => ({ role: i % 2 ? "agent" : "user", text: `m${i}` }) as const);
    const msg = buildAgentMessage([...history, { role: "system", text: "slow down" }, { role: "user", text: "Giá bao nhiêu?" }], "vi");
    expect(msg).toContain("Page language: Vietnamese");
    expect(msg).not.toContain("m0\n");
    expect(msg).not.toContain("slow down");
    expect(msg.endsWith("[Visitor's new message]\nGiá bao nhiêu?")).toBe(true);
  });
});

function fakeFetch(body: string, init: ResponseInit = { headers: { "content-type": "text/event-stream" } }) {
  return vi.fn(async () => new Response(body, init)) as unknown as typeof fetch;
}

describe("askAgent", () => {
  const cfg = { url: "https://runtime.example", apiKey: "key", agentId: "dewee-web-advisor" };

  it("streams text and sends the agent id and visitor id", async () => {
    const fetcher = fakeFetch(sse(chunk("Self-install "), chunk("is free."), "[DONE]"));
    const seen: string[] = [];
    const text = await askAgent(cfg, "hi", "web-abc", (t) => seen.push(t), { fetcher });
    expect(text).toBe("Self-install is free.");
    expect(seen.at(-1)).toBe("Self-install is free.");
    const [url, init] = (fetcher as unknown as { mock: { calls: [string, RequestInit][] } }).mock.calls[0];
    expect(url).toBe("https://runtime.example/v1/chat/completions");
    expect(JSON.parse(init.body as string).model).toBe("agent:dewee-web-advisor");
    expect((init.headers as Record<string, string>)["x-goclaw-user-id"]).toBe("web-abc");
  });

  it("treats HTTP errors and runtime 'Error:' replies as failures, without showing them", async () => {
    await expect(askAgent(cfg, "hi", "v", () => {}, { fetcher: fakeFetch("nope", { status: 403 }) })).rejects.toThrow("403");
    const onText = vi.fn();
    await expect(askAgent(cfg, "hi", "v", onText, { fetcher: fakeFetch(sse(chunk("Error: provider down"), "[DONE]")) })).rejects.toThrow();
    expect(onText).not.toHaveBeenCalled();
  });

  it("accepts a JSON (non-streamed) answer", async () => {
    const fetcher = fakeFetch(JSON.stringify({ choices: [{ message: { content: "hello" } }] }), { headers: { "content-type": "application/json" } });
    expect(await askAgent(cfg, "hi", "v", () => {}, { fetcher })).toBe("hello");
  });
});

/** An in-memory stand-in for the ChatLimiter Durable Object namespace. */
function memoryLimiter() {
  const rows = new Map<string, WindowRow>();
  const stub = (scope: string) => ({
    hit: async (key: string, limit: number, windowMs: number) => {
      const r = applyHit(rows.get(`${scope}|${key}`) ?? null, Date.now(), windowMs, limit);
      rows.set(`${scope}|${key}`, r.row);
      return { ok: r.ok, count: r.count };
    },
  });
  return { idFromName: (n: string) => n, get: (id: string) => stub(id) };
}

describe("agentReply daily budget", () => {
  it("falls back (null) once the budget is spent and alerts Discord exactly once", async () => {
    const discord = vi.fn(async () => new Response(null, { status: 204 }));
    const runtime = vi.fn(async (_url: string, _init: RequestInit) => new Response(sse(chunk("answer"), "[DONE]"), { headers: { "content-type": "text/event-stream" } }));
    vi.stubGlobal("fetch", vi.fn((url: string, init: RequestInit) => (url.startsWith("https://discord") ? discord() : runtime(url, init))));
    const env = { ...baseEnv, CHAT_AGENT_DAILY_BUDGET: "2", DISCORD_WEBHOOK_URL: "https://discord.example/hook", CHAT_LIMITER: memoryLimiter() } as unknown as Env;
    const history = [{ role: "user" as const, text: "hi" }];
    expect(await agentReply(env, history, "en", "sid", () => {})).toBe("answer");
    expect(await agentReply(env, history, "en", "sid", () => {})).toBe("answer");
    expect(await agentReply(env, history, "en", "sid", () => {})).toBeNull();
    expect(await agentReply(env, history, "en", "sid", () => {})).toBeNull();
    expect(runtime).toHaveBeenCalledTimes(2);
    expect(discord).toHaveBeenCalledTimes(1);
    vi.unstubAllGlobals();
  });

  it("returns null without calling anything when the kill switch is off", async () => {
    const f = vi.fn();
    vi.stubGlobal("fetch", f);
    const env = { ...baseEnv, CHAT_AGENT_ENABLED: "false", CHAT_LIMITER: memoryLimiter() } as unknown as Env;
    expect(await agentReply(env, [{ role: "user", text: "hi" }], "en", "sid", () => {})).toBeNull();
    expect(f).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});

describe("verifyTurnstile", () => {
  const env = { TURNSTILE_SECRET_KEY: "s", TURNSTILE_SITE_KEY: "k" } as unknown as Env;
  const reply = (body: unknown) => vi.fn(async () => Response.json(body)) as unknown as typeof fetch;

  it("passes when Turnstile is not configured", async () => {
    expect(await verifyTurnstile({} as Env, "", "1.2.3.4")).toBe(true);
  });

  it("requires a successful siteverify for the chat action", async () => {
    expect(await verifyTurnstile(env, "tok", "1.2.3.4", reply({ success: true, action: "chat" }))).toBe(true);
    expect(await verifyTurnstile(env, "tok", "1.2.3.4", reply({ success: false }))).toBe(false);
    expect(await verifyTurnstile(env, "tok", "1.2.3.4", reply({ success: true, action: "login" }))).toBe(false);
    expect(await verifyTurnstile(env, "", "1.2.3.4", reply({ success: true }))).toBe(false);
  });
});
