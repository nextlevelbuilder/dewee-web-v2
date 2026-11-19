import { describe, expect, it, vi } from "vitest";
import { chatLeadSchema, handleChatLead } from "../src/lib/server/webchat/webchat-lead";

const ok = { email: "An@Acme.io", name: "An", phone: "+84 90 123 4567", company: "Acme", useCase: "Support bot", consent: true, locale: "vi" };

function env() {
  const run = vi.fn().mockResolvedValue({});
  const bind = vi.fn(() => ({ run }));
  const kv = new Map<string, string>();
  return {
    run, bind,
    env: {
      ENVIRONMENT: "development",
      DB: { prepare: vi.fn(() => ({ bind })) },
      KV: { get: async (k: string) => kv.get(k) ?? null, put: async (k: string, v: string) => void kv.set(k, v) },
    } as unknown as Env,
  };
}
const post = (body: unknown, origin = "https://dewee.sh") =>
  new Request("https://dewee.sh/api/chat/lead", { method: "POST", headers: { origin, "content-type": "application/json" }, body: JSON.stringify(body) });

describe("chat lead schema", () => {
  it("requires email and explicit consent", () => {
    expect(chatLeadSchema.safeParse(ok).success).toBe(true);
    expect(chatLeadSchema.safeParse({ ...ok, consent: false }).success).toBe(false);
    expect(chatLeadSchema.safeParse({ ...ok, email: "nope" }).success).toBe(false);
    expect(chatLeadSchema.safeParse({ ...ok, extra: 1 }).success).toBe(false);
  });
});

describe("handleChatLead", () => {
  it("stores a consented lead as kind 'chat'", async () => {
    const t = env();
    const res = await handleChatLead(post(ok), t.env);
    expect(res.status).toBe(200);
    expect(t.bind).toHaveBeenCalledWith("an@acme.io", "An", "Acme", "vi", expect.stringContaining('"consent":true'));
  });
  it("refuses other origins and missing consent", async () => {
    const t = env();
    expect((await handleChatLead(post(ok, "https://evil.example"), t.env)).status).toBe(403);
    expect((await handleChatLead(post({ ...ok, consent: undefined }), t.env)).status).toBe(400);
    expect(t.run).not.toHaveBeenCalled();
  });
  it("rate-limits per IP", async () => {
    const t = env();
    for (let i = 0; i < 5; i++) await handleChatLead(post(ok), t.env);
    expect((await handleChatLead(post(ok), t.env)).status).toBe(429);
  });
});
