/**
 * Lead capture for the contact, partner and newsletter forms (POST /api/leads).
 *
 * Accepts JSON (the form island) or application/x-www-form-urlencoded (the no-JS fallback).
 * JSON callers get `{ ok, error? }`; form posts get a 303 back to the page they came from, with
 * `?sent=1#<form>-done` or `?error=<code>#<form>-error` so a static page can show the outcome
 * through `:target` even without JavaScript.
 *
 * Order of checks: origin → content type → size → parse → honeypot → rate limit → schema →
 * D1 insert → team notification (after the response, via waitUntil).
 */
import { z } from "zod";
import type { Plan } from "../../content/plans";
import { localePath, type Locale } from "../../i18n/config";
import { EMAIL_RE, notifyTeam } from "./notify";

export const LEAD_KINDS = ["contact", "partner", "newsletter"] as const;
export const CONTACT_TOPICS = ["sales", "integration", "use-case", "partner", "press", "other"] as const;
export const TEAM_SIZES = ["1-10", "11-50", "51-200", "201-1000", "1000+"] as const;
export const PLAN_IDS = ["saas", "dedicated", "on-premises"] as const satisfies readonly Plan["id"][];
export const PARTNER_ROLES = ["solution", "bd", "not-sure"] as const;
export const PARTNER_TIERS = ["elite", "master", "grandmaster", "legendary", "hunter", "closer", "commander", "warlord", "not-sure"] as const;

export type LeadKind = (typeof LEAD_KINDS)[number];
export type ContactTopic = (typeof CONTACT_TOPICS)[number];
export type TeamSize = (typeof TEAM_SIZES)[number];
export type PartnerRole = (typeof PARTNER_ROLES)[number];
export type PartnerTier = (typeof PARTNER_TIERS)[number];
export type LeadError = "invalid" | "rate_limited" | "forbidden_origin" | "unsupported_media_type" | "payload_too_large" | "method_not_allowed" | "server_error";

/** Name of the hidden field humans never fill in. Bots that do are thanked and ignored. */
export const HONEYPOT_FIELD = "website";
export const RATE_LIMIT = { max: 5, windowSeconds: 600 } as const;
const MAX_BODY_BYTES = 16 * 1024;
/** Same-site page path the no-JS redirect may return to: "/contact", "/vi/partners". */
const SOURCE_RE = /^\/(?!\/)[a-z0-9/_-]{0,120}$/i;
const FORM_ID_RE = /^[a-z0-9-]{1,40}$/;

const text = (max: number) => z.string().max(max);
const base = {
  email: z.string().max(254).regex(EMAIL_RE).transform((s) => s.toLowerCase()),
  locale: z.enum(["en", "vi"]).default("en"),
  source: z.string().regex(SOURCE_RE).optional(),
  form: z.string().regex(FORM_ID_RE).optional(),
};
const message = z.string().min(2).max(4000);

export const leadSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("contact"),
    ...base,
    name: text(120),
    company: text(160).optional(),
    teamSize: z.enum(TEAM_SIZES).optional(),
    topic: z.enum(CONTACT_TOPICS).default("sales"),
    plan: z.enum(PLAN_IDS).optional(),
    message,
  }),
  z.object({
    kind: z.literal("partner"),
    ...base,
    name: text(120),
    company: text(160),
    country: text(80),
    role: z.enum(PARTNER_ROLES),
    tier: z.enum(PARTNER_TIERS).optional(),
    message,
  }),
  z.object({
    kind: z.literal("newsletter"),
    ...base,
    name: text(120).optional(),
  }),
]);
export type Lead = z.infer<typeof leadSchema>;

/**
 * Trim every string and drop empty ones, so an empty optional form field means "absent".
 * Non-string values (possible in JSON) are kept as they are and rejected by the schema.
 */
export function normalizeInput(raw: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string") {
      const v = value.trim();
      if (v) out[key] = v;
    } else if (value !== undefined && value !== null) {
      out[key] = value;
    }
  }
  return out;
}

export function isHoneypotFilled(raw: Record<string, unknown>): boolean {
  const v = raw[HONEYPOT_FIELD];
  return typeof v === "string" ? v.trim().length > 0 : v !== undefined && v !== null;
}

export function parseLead(raw: Record<string, unknown>): { ok: true; lead: Lead } | { ok: false } {
  const result = leadSchema.safeParse(normalizeInput(raw));
  return result.success ? { ok: true, lead: result.data } : { ok: false };
}

const COLUMN_FIELDS = new Set(["kind", "email", "name", "company", "locale", "source", "form"]);

/** Everything that is not a first-class `leads` column goes into the JSON payload column. */
export function leadPayload(lead: Lead): Record<string, string> {
  return Object.fromEntries(Object.entries(lead).filter((e): e is [string, string] => !COLUMN_FIELDS.has(e[0]) && typeof e[1] === "string"));
}

const leadCompany = (lead: Lead): string | undefined => ("company" in lead ? lead.company : undefined);

type Mode = "json" | "form";
type WaitUntil = Pick<ExecutionContext, "waitUntil">;

export async function handleLeadRequest(request: Request, env: Env, ctx?: WaitUntil): Promise<Response> {
  if (request.method !== "POST") return methodNotAllowed();

  const origin = request.headers.get("origin");
  if (origin && !sameHost(origin, request.url)) return json({ ok: false, error: "forbidden_origin" }, 403);

  const type = (request.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  const mode: Mode | null = type === "application/json" ? "json" : type === "application/x-www-form-urlencoded" ? "form" : null;
  if (!mode) return json({ ok: false, error: "unsupported_media_type" }, 415);

  const declared = Number(request.headers.get("content-length") ?? "0");
  if (declared > MAX_BODY_BYTES) return json({ ok: false, error: "payload_too_large" }, 413);
  const body = await request.text();
  if (body.length > MAX_BODY_BYTES) return json({ ok: false, error: "payload_too_large" }, 413);

  const raw = mode === "json" ? parseJsonObject(body) : Object.fromEntries(new URLSearchParams(body));
  const reply = (outcome: "ok" | LeadError, status: number, headers?: HeadersInit) =>
    mode === "json" ? json(outcome === "ok" ? { ok: true } : { ok: false, error: outcome }, status, headers) : backToPage(request, raw ?? {}, outcome);
  if (!raw) return reply("invalid", 400);

  // Bots get the same answer as people, so they learn nothing; nothing is stored or sent.
  if (isHoneypotFilled(raw)) return reply("ok", 200);

  const rateKey = await rateLimitKey(request);
  const attempts = await readCount(env.KV, rateKey);
  if (attempts >= RATE_LIMIT.max) {
    return reply("rate_limited", 429, { "retry-after": String(RATE_LIMIT.windowSeconds) });
  }

  const parsed = parseLead(raw);
  if (!parsed.ok) return reply("invalid", 400);
  const lead = parsed.lead;
  await writeCount(env.KV, rateKey, attempts + 1);

  try {
    await env.DB.prepare("INSERT INTO leads (kind, email, name, company, locale, source, payload) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)")
      .bind(lead.kind, lead.email, lead.name ?? null, leadCompany(lead) ?? null, lead.locale, lead.source ?? null, JSON.stringify(leadPayload(lead)))
      .run();
  } catch (err) {
    console.error("lead insert failed", err instanceof Error ? err.message : err);
    return reply("server_error", 500);
  }

  const notify = notifyTeam(env, notifyTitle(lead), {
    Email: lead.email,
    Name: lead.name,
    Company: leadCompany(lead),
    Locale: lead.locale,
    Source: lead.source,
    ...Object.fromEntries(Object.entries(leadPayload(lead)).map(([k, v]) => [k[0].toUpperCase() + k.slice(1), v])),
  }).catch((err) => console.warn("lead notify failed", err instanceof Error ? err.message : err));
  if (ctx) ctx.waitUntil(notify);
  else await notify;

  return reply("ok", 200);
}

export function methodNotAllowed(): Response {
  return json({ ok: false, error: "method_not_allowed" }, 405, { allow: "POST" });
}

function json(body: { ok: boolean; error?: LeadError }, status: number, headers?: HeadersInit): Response {
  const h = new Headers(headers);
  h.set("content-type", "application/json; charset=utf-8");
  h.set("cache-control", "no-store");
  return new Response(JSON.stringify(body), { status, headers: h });
}

function parseJsonObject(body: string): Record<string, unknown> | null {
  try {
    const v: unknown = JSON.parse(body);
    return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function sameHost(origin: string, requestUrl: string): boolean {
  try {
    return new URL(origin).host === new URL(requestUrl).host;
  } catch {
    return false;
  }
}

const FALLBACK_PAGE: Record<LeadKind, string> = { contact: "/contact", partner: "/partners", newsletter: "/" };

/** 303 back to the originating page so a refresh never re-posts the form. */
export function backToPage(request: Request, raw: Record<string, unknown>, outcome: "ok" | LeadError): Response {
  const str = (k: string) => (typeof raw[k] === "string" ? (raw[k] as string).trim() : "");
  const locale: Locale = str("locale") === "vi" ? "vi" : "en";
  const kind = (LEAD_KINDS as readonly string[]).includes(str("kind")) ? (str("kind") as LeadKind) : "contact";
  const path = SOURCE_RE.test(str("source")) ? str("source") : localePath(locale, FALLBACK_PAGE[kind]);
  const form = FORM_ID_RE.test(str("form")) ? str("form") : `${kind}-form`;
  const url = new URL(path, request.url);
  if (outcome === "ok") url.searchParams.set("sent", "1");
  else url.searchParams.set("error", outcome);
  url.hash = outcome === "ok" ? `${form}-done` : `${form}-error`;
  return new Response(null, { status: 303, headers: { location: url.toString(), "cache-control": "no-store" } });
}

function notifyTitle(lead: Lead): string {
  const who = [lead.name, leadCompany(lead)].filter(Boolean).join(" · ") || lead.email;
  const label = lead.kind === "partner" ? "Partner application" : lead.kind === "newsletter" ? "Newsletter sign-up" : "Contact request";
  return `${label}: ${who}`;
}

/** Fixed 10-minute windows keyed by a hash of the client IP (the raw IP is never stored). */
async function rateLimitKey(request: Request): Promise<string> {
  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`dewee-leads:${ip}`));
  const hash = [...new Uint8Array(digest).slice(0, 12)].map((b) => b.toString(16).padStart(2, "0")).join("");
  const window = Math.floor(Date.now() / 1000 / RATE_LIMIT.windowSeconds);
  return `rl:leads:${window}:${hash}`;
}

// KV is a soft limiter: if it is unavailable we log and let the lead through rather than lose it.
async function readCount(kv: KVNamespace, key: string): Promise<number> {
  try {
    return Number((await kv.get(key)) ?? "0") || 0;
  } catch (err) {
    console.warn("lead rate-limit read failed", err instanceof Error ? err.message : err);
    return 0;
  }
}

async function writeCount(kv: KVNamespace, key: string, count: number): Promise<void> {
  try {
    await kv.put(key, String(count), { expirationTtl: RATE_LIMIT.windowSeconds + 60 });
  } catch (err) {
    console.warn("lead rate-limit write failed", err instanceof Error ? err.message : err);
  }
}
