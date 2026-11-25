/**
 * Leads captured by the website chat agent (POST /api/chat/lead).
 *
 * The agent cannot write to our database: it asks the page to run the `capture_lead` page action,
 * the widget shows the visitor exactly what will be sent and asks them to confirm, and only then
 * the page posts here. So every stored chat lead is something the visitor approved, and consent
 * is required. Rows land in the same `leads` table (kind 'chat') the admin, the API (`leads:read`)
 * and the daily digest already read, so sales has one place to look.
 */
import { z } from "zod";
import { EMAIL_RE, notifyTeam } from "../notify";
import { parseJsonObject, rateLimitKey, readCount, sameHost, writeCount, RATE_LIMIT } from "../leads";

const MAX_BODY_BYTES = 8 * 1024;
const line = (max: number) => z.string().trim().max(max).optional().transform((v) => v || undefined);

export const chatLeadSchema = z.object({
  email: z.string().trim().toLowerCase().max(254).regex(EMAIL_RE),
  name: line(120),
  phone: z.string().trim().max(40).regex(/^[+()0-9 .-]{6,40}$/).optional().or(z.literal("").transform(() => undefined)),
  company: line(160),
  useCase: line(1000),
  teamSize: line(40),
  plan: line(40),
  consent: z.literal(true),
  locale: z.enum(["en", "vi"]).default("en"),
  page: z.string().max(200).regex(/^\/(?!\/)[^\s]*$/).optional(),
  conversationId: z.string().max(120).regex(/^[A-Za-z0-9:_-]+$/).optional(),
}).strict();

export type ChatLead = z.infer<typeof chatLeadSchema>;

type Reply = { ok: true } | { ok: false; error: string };
const json = (body: Reply, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

/** What goes in `leads.payload`: everything except the columns `leads` already has. */
export function chatLeadPayload(lead: ChatLead) {
  return { via: "webchat", phone: lead.phone, useCase: lead.useCase, teamSize: lead.teamSize, plan: lead.plan, page: lead.page, conversationId: lead.conversationId, consent: true, consentAt: new Date().toISOString() };
}

export async function handleChatLead(request: Request, env: Env, ctx?: { waitUntil(p: Promise<unknown>): void }): Promise<Response> {
  if (request.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405);
  // Only our own pages post here; a browser always sends Origin on a cross-site POST.
  const origin = request.headers.get("origin");
  if (!origin || !sameHost(origin, request.url)) return json({ ok: false, error: "forbidden_origin" }, 403);
  if ((request.headers.get("content-type") ?? "").split(";")[0].trim() !== "application/json") return json({ ok: false, error: "unsupported_media_type" }, 415);
  const body = await request.text();
  if (body.length > MAX_BODY_BYTES) return json({ ok: false, error: "payload_too_large" }, 413);

  const parsed = chatLeadSchema.safeParse(parseJsonObject(body) ?? {});
  if (!parsed.success) return json({ ok: false, error: "invalid" }, 400);
  const lead = parsed.data;

  // Shares the contact form's per-IP budget so the chat is not a side door around it.
  const key = await rateLimitKey(request);
  const attempts = await readCount(env.KV, key);
  if (attempts >= RATE_LIMIT.max) return json({ ok: false, error: "rate_limited" }, 429);
  await writeCount(env.KV, key, attempts + 1);

  try {
    await env.DB.prepare("INSERT INTO leads (kind, email, name, company, locale, source, payload) VALUES ('chat', ?1, ?2, ?3, ?4, 'webchat', ?5)")
      .bind(lead.email, lead.name ?? null, lead.company ?? null, lead.locale, JSON.stringify(chatLeadPayload(lead)))
      .run();
  } catch (err) {
    console.error("chat lead insert failed", err instanceof Error ? err.message : err);
    return json({ ok: false, error: "server_error" }, 500);
  }

  const who = [lead.name, lead.company].filter(Boolean).join(" · ") || lead.email;
  const notify = notifyTeam(env, `Chat lead: ${who}`, {
    Email: lead.email, Name: lead.name, Phone: lead.phone, Company: lead.company, "Use case": lead.useCase,
    "Team size": lead.teamSize, Plan: lead.plan, Page: lead.page, Locale: lead.locale,
  }).catch((err) => console.warn("chat lead notify failed", err instanceof Error ? err.message : err));
  if (ctx) ctx.waitUntil(notify); else await notify;
  return json({ ok: true }, 200);
}
