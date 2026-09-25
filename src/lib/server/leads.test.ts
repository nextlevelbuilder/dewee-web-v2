import { describe, expect, it, vi } from "vitest";
import { HONEYPOT_FIELD, RATE_LIMIT, handleLeadRequest, isHoneypotFilled, leadPayload, normalizeInput, parseLead } from "./leads";

const contact = { kind: "contact", name: "Lan Nguyen", email: "Lan@Example.com", company: "Acme", topic: "integration", message: "We want dewee on Zalo." };
const partner = { kind: "partner", name: "Minh", email: "minh@agency.vn", company: "Agency", country: "Vietnam", role: "solution", tier: "elite", message: "We deploy agents for SMEs." };

describe("normalizeInput", () => {
  it("trims strings and drops empty ones", () => {
    expect(normalizeInput({ a: "  x ", b: "   ", c: "", d: 3, e: null })).toEqual({ a: "x", d: 3 });
  });
});

describe("isHoneypotFilled", () => {
  it("treats blank as empty and any value as filled", () => {
    expect(isHoneypotFilled({})).toBe(false);
    expect(isHoneypotFilled({ [HONEYPOT_FIELD]: "  " })).toBe(false);
    expect(isHoneypotFilled({ [HONEYPOT_FIELD]: "https://spam.example" })).toBe(true);
  });
});

describe("parseLead", () => {
  it("accepts a contact request and lowercases the email", () => {
    const r = parseLead(contact);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.lead.email).toBe("lan@example.com");
      expect(r.lead.locale).toBe("en");
    }
  });

  it("defaults the contact topic to sales and treats empty optionals as absent", () => {
    const r = parseLead({ ...contact, topic: "", company: " ", plan: "" });
    expect(r.ok && r.lead.kind === "contact" && r.lead.topic).toBe("sales");
    expect(r.ok && ("company" in r.lead || "plan" in r.lead)).toBe(false);
  });

  it("accepts known plans and rejects unknown ones", () => {
    expect(parseLead({ ...contact, plan: "on-premises" }).ok).toBe(true);
    expect(parseLead({ ...contact, plan: "enterprise-gold" }).ok).toBe(false);
  });

  it("rejects bad emails, short messages and unknown kinds", () => {
    expect(parseLead({ ...contact, email: "not-an-email" }).ok).toBe(false);
    expect(parseLead({ ...contact, message: "x" }).ok).toBe(false);
    expect(parseLead({ ...contact, kind: "spam" }).ok).toBe(false);
    expect(parseLead({ ...contact, name: 42 }).ok).toBe(false);
  });

  it("requires company, country and role for partner applications", () => {
    expect(parseLead(partner).ok).toBe(true);
    expect(parseLead({ ...partner, company: "" }).ok).toBe(false);
    expect(parseLead({ ...partner, country: undefined }).ok).toBe(false);
    expect(parseLead({ ...partner, role: "reseller" }).ok).toBe(false);
    expect(parseLead({ ...partner, tier: "platinum" }).ok).toBe(false);
  });

  it("accepts a newsletter sign-up with only an email", () => {
    expect(parseLead({ kind: "newsletter", email: "a@b.co" }).ok).toBe(true);
  });

  it("only accepts same-site paths as the source", () => {
    expect(parseLead({ ...contact, source: "/vi/contact" }).ok).toBe(true);
    expect(parseLead({ ...contact, source: "//evil.example/x" }).ok).toBe(false);
    expect(parseLead({ ...contact, source: "https://evil.example" }).ok).toBe(false);
  });

  it("keeps non-column fields for the payload column", () => {
    const r = parseLead({ ...contact, teamSize: "11-50", plan: "dedicated" });
    expect(r.ok && leadPayload(r.lead)).toEqual({ teamSize: "11-50", topic: "integration", plan: "dedicated", message: contact.message });
  });
});

/** In-memory stand-ins for the KV and D1 bindings the handler touches. */
function fakeEnv(opts: { failInsert?: boolean } = {}) {
  const kv = new Map<string, string>();
  const inserts: unknown[][] = [];
  const env = {
    ENVIRONMENT: "development",
    KV: {
      get: async (key: string) => kv.get(key) ?? null,
      put: async (key: string, value: string) => void kv.set(key, value),
    },
    DB: {
      prepare: () => ({
        bind: (...args: unknown[]) => ({
          run: async () => {
            if (opts.failInsert) throw new Error("D1 unavailable");
            inserts.push(args);
            return { success: true };
          },
        }),
      }),
    },
  };
  // The fakes implement only the calls the handler makes; the cast keeps the test free of the full binding surface.
  return { env: env as unknown as Env, kv, inserts };
}

const URL_BASE = "https://dewee.sh/api/leads";
const jsonPost = (body: unknown, headers: Record<string, string> = {}) =>
  new Request(URL_BASE, { method: "POST", headers: { "content-type": "application/json", origin: "https://dewee.sh", "cf-connecting-ip": "203.0.113.7", ...headers }, body: JSON.stringify(body) });
const formPost = (fields: Record<string, string>) =>
  new Request(URL_BASE, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded", "cf-connecting-ip": "203.0.113.8" }, body: new URLSearchParams(fields).toString() });

describe("handleLeadRequest", () => {
  it("stores a valid JSON lead and hands the notification to waitUntil", async () => {
    const { env, inserts } = fakeEnv();
    const waitUntil = vi.fn();
    const res = await handleLeadRequest(jsonPost({ ...contact, locale: "vi", source: "/vi/contact" }), env, { waitUntil });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(inserts).toHaveLength(1);
    const [kind, email, name, company, locale, source, payload] = inserts[0];
    expect([kind, email, name, company, locale, source]).toEqual(["contact", "lan@example.com", "Lan Nguyen", "Acme", "vi", "/vi/contact"]);
    expect(JSON.parse(payload as string)).toEqual({ topic: "integration", message: contact.message });
    expect(waitUntil).toHaveBeenCalledOnce();
  });

  it("answers 400 invalid for a bad body and stores nothing", async () => {
    const { env, inserts } = fakeEnv();
    const res = await handleLeadRequest(jsonPost({ ...contact, email: "nope" }), env);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ ok: false, error: "invalid" });
    const broken = new Request(URL_BASE, { method: "POST", headers: { "content-type": "application/json" }, body: "{not json" });
    expect((await handleLeadRequest(broken, env)).status).toBe(400);
    expect(inserts).toHaveLength(0);
  });

  it("rejects other methods, media types, origins and oversized bodies", async () => {
    const { env } = fakeEnv();
    const get = await handleLeadRequest(new Request(URL_BASE), env);
    expect(get.status).toBe(405);
    expect(get.headers.get("allow")).toBe("POST");
    const text = new Request(URL_BASE, { method: "POST", headers: { "content-type": "text/plain" }, body: "hi" });
    expect((await handleLeadRequest(text, env)).status).toBe(415);
    expect((await handleLeadRequest(jsonPost(contact, { origin: "https://evil.example" }), env)).status).toBe(403);
    expect((await handleLeadRequest(jsonPost({ ...contact, message: "x".repeat(20_000) }), env)).status).toBe(413);
  });

  it("pretends success for the honeypot but stores nothing", async () => {
    const { env, inserts } = fakeEnv();
    const res = await handleLeadRequest(jsonPost({ ...contact, [HONEYPOT_FIELD]: "http://spam" }), env);
    expect(res.status).toBe(200);
    expect(inserts).toHaveLength(0);
  });

  it("rate-limits an address after the allowed number of leads", async () => {
    const { env, inserts } = fakeEnv();
    for (let i = 0; i < RATE_LIMIT.max; i++) {
      expect((await handleLeadRequest(jsonPost(contact), env)).status).toBe(200);
    }
    const blocked = await handleLeadRequest(jsonPost(contact), env);
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get("retry-after")).toBe(String(RATE_LIMIT.windowSeconds));
    expect(await blocked.json()).toEqual({ ok: false, error: "rate_limited" });
    expect(inserts).toHaveLength(RATE_LIMIT.max);
    // A different address still gets through.
    expect((await handleLeadRequest(jsonPost(contact, { "cf-connecting-ip": "198.51.100.1" }), env)).status).toBe(200);
  });

  it("returns 500 server_error when the insert fails", async () => {
    const { env } = fakeEnv({ failInsert: true });
    const res = await handleLeadRequest(jsonPost(contact), env);
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ ok: false, error: "server_error" });
  });

  it("redirects no-JS form posts back to the page with the outcome", async () => {
    const { env } = fakeEnv();
    const ok = await handleLeadRequest(formPost({ ...contact, locale: "vi", source: "/vi/contact", form: "contact-form" }), env);
    expect(ok.status).toBe(303);
    expect(ok.headers.get("location")).toBe("https://dewee.sh/vi/contact?sent=1#contact-form-done");

    const bad = await handleLeadRequest(formPost({ ...partner, company: "", source: "/partners", form: "apply" }), env);
    expect(bad.status).toBe(303);
    expect(bad.headers.get("location")).toBe("https://dewee.sh/partners?error=invalid#apply-error");
  });

  it("falls back to the kind's own page when the source is unsafe", async () => {
    const { env } = fakeEnv();
    const res = await handleLeadRequest(formPost({ ...partner, locale: "vi", source: "//evil.example/steal", form: "<script>" }), env);
    expect(res.headers.get("location")).toBe("https://dewee.sh/vi/partners?error=invalid#partner-form-error");
  });
});
