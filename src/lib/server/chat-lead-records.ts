/**
 * Chat leads: one `leads` row (kind 'chat') per conversation, created by the first valid email and
 * enriched as the agent learns more (need, team size, name, company). The row id lives in the
 * ChatRoom's own storage, so a conversation can never write into another conversation's lead,
 * and the session id in the payload is the room's, never one supplied by the model.
 */
import type { ChatContext } from "../chat-session-context";
import type { LeadFields } from "./chat-agent-actions";
import { contextLines, raiseOutcomeSql, transcriptText } from "./chat-room-records";
import { notifyTeam } from "./notify";

/** Who supplied the lead: the agent's capture_lead action, an email typed in chat, or the email form. */
export type LeadVia = "agent" | "chat" | "form";

export type ChatLeadInput = {
  sid: string | null;
  locale: "en" | "vi";
  leadId: number | null;
  previous: LeadFields | null;
  fields: LeadFields;
  via: LeadVia;
  ctx: ChatContext;
  transcript: { role: string; text: string }[];
};

export type ChatLeadResult = { leadId: number | null; fields: LeadFields; changed: boolean };

/** Newer non-empty values win; nothing already known is erased. */
export function mergeLead(previous: LeadFields | null, next: LeadFields): { fields: LeadFields; changed: boolean } {
  const fields: LeadFields = { ...previous, ...Object.fromEntries(Object.entries(next).filter(([, v]) => v)) } as LeadFields;
  const keys = new Set([...Object.keys(previous ?? {}), ...Object.keys(fields)]) as Set<keyof LeadFields>;
  const changed = !previous || [...keys].some((k) => previous[k] !== fields[k]);
  return { fields, changed };
}

/** The `leads.payload` JSON: the room's session id, what the visitor needs and where they came from. */
export function leadPayload(sid: string | null, fields: LeadFields, via: LeadVia, ctx: ChatContext) {
  return { sid, need: fields.need, teamSize: fields.teamSize, via, ...ctx };
}

/** Stores or enriches the conversation's lead and tells the team. Discord still hears about it if D1 fails. */
export async function saveChatLead(env: Env, input: ChatLeadInput): Promise<ChatLeadResult> {
  const { fields, changed } = mergeLead(input.previous, input.fields);
  if (!changed && input.leadId !== null) return { leadId: input.leadId, fields, changed: false };

  const now = new Date().toISOString();
  const payload = JSON.stringify(leadPayload(input.sid, fields, input.via, input.ctx));
  let leadId = input.leadId;
  try {
    if (leadId === null) {
      const row = await env.DB.prepare(
        "INSERT INTO leads (kind, email, name, company, locale, source, payload, created_at) VALUES ('chat', ?1, ?2, ?3, ?4, 'chat-widget', ?5, ?6) RETURNING id",
      ).bind(fields.email, fields.name ?? null, fields.company ?? null, input.locale, payload, now).first<{ id: number }>();
      leadId = row?.id ?? null;
    } else {
      await env.DB.prepare("UPDATE leads SET email = ?1, name = ?2, company = ?3, payload = ?4 WHERE id = ?5")
        .bind(fields.email, fields.name ?? null, fields.company ?? null, payload, leadId).run();
    }
    await env.DB.prepare(`UPDATE chat_sessions SET email = ?1, lead_id = ?2, last_at = ?3, ${raiseOutcomeSql("'lead'")} WHERE sid = ?4`)
      .bind(fields.email, leadId, now, input.sid).run();
  } catch (err) {
    console.error("chat lead save failed", err);
  }

  await notifyTeam(env, input.leadId === null ? "New chat lead" : "Chat lead updated", {
    Email: fields.email,
    Name: fields.name,
    Company: fields.company,
    Need: fields.need,
    "Team size": fields.teamSize,
    "Captured by": input.via === "agent" ? "advisor agent" : input.via === "form" ? "email form" : "email typed in chat",
    ...contextLines(input.ctx),
    Session: input.sid ?? undefined,
    Transcript: transcriptText(input.transcript),
  });
  return { leadId, fields, changed: true };
}
