/**
 * Email for contact and partner leads, sent through Resend after the lead is stored:
 * one copy to the team inbox (reply-to the visitor) and one acknowledgement to the visitor
 * (reply-to the team), in the visitor's language. Newsletter sign-ups get no email.
 * A no-op when RESEND_API_KEY is not configured.
 */
import type { Lead } from "./leads";
import { escapeHtml, sendResendEmail, type ResendEnv } from "./resend-mailer";

export const TEAM_INBOX = "hi@nextlevelbuilder.io";

type MailEnv = ResendEnv & { ENVIRONMENT?: string };

const ACK = {
  en: {
    subject: "We got your message — dewee",
    hello: (name?: string) => (name ? `Hi ${name},` : "Hi,"),
    body: "Thanks for reaching out to dewee. A real person on our team will reply within one business day. You can answer this email to add anything.",
    copy: "Your message",
    sign: "— The dewee team, NextLevelBuilder",
  },
  vi: {
    subject: "Dewee đã nhận được tin nhắn của bạn",
    hello: (name?: string) => (name ? `Chào ${name},` : "Chào bạn,"),
    body: "Cảm ơn bạn đã liên hệ dewee. Người thật trong đội ngũ sẽ trả lời bạn trong vòng một ngày làm việc. Bạn có thể trả lời email này để bổ sung thông tin.",
    copy: "Nội dung bạn đã gửi",
    sign: "— Đội ngũ dewee, NextLevelBuilder",
  },
} as const;

export function teamMail(lead: Lead, fields: Record<string, string | undefined>, environment?: string) {
  const prefix = environment && environment !== "production" ? `[${environment}] ` : "";
  const label = lead.kind === "partner" ? "Partner application" : "Contact request";
  const who = [lead.name, "company" in lead ? lead.company : undefined].filter(Boolean).join(" · ") || lead.email;
  const rows = Object.entries(fields).filter((e): e is [string, string] => Boolean(e[1]));
  return {
    to: [TEAM_INBOX],
    replyTo: lead.email,
    subject: `${prefix}${label}: ${who}`.slice(0, 200),
    text: rows.map(([k, v]) => `${k}: ${v}`).join("\n"),
    html: `<table cellpadding="6" style="border-collapse:collapse;font:14px/1.5 system-ui,sans-serif">${rows
      .map(([k, v]) => `<tr><th align="left" valign="top">${escapeHtml(k)}</th><td style="white-space:pre-wrap">${escapeHtml(v)}</td></tr>`)
      .join("")}</table>`,
  };
}

export function ackMail(lead: Lead) {
  const t = ACK[lead.locale];
  const message = "message" in lead ? lead.message : "";
  const text = [t.hello(lead.name), "", t.body, "", `${t.copy}:`, message, "", t.sign, "https://dewee.sh"].join("\n");
  const html = `<div style="font:15px/1.6 system-ui,sans-serif;max-width:560px"><p>${escapeHtml(t.hello(lead.name))}</p><p>${escapeHtml(t.body)}</p><p><strong>${escapeHtml(t.copy)}:</strong></p><blockquote style="margin:0;padding:8px 12px;border-left:3px solid #5446e8;white-space:pre-wrap">${escapeHtml(message)}</blockquote><p>${escapeHtml(t.sign)}<br><a href="https://dewee.sh">dewee.sh</a></p></div>`;
  return { to: [lead.email], replyTo: TEAM_INBOX, subject: t.subject, text, html };
}

/** Sends both emails; each failure is logged on its own so one never blocks the other. */
export async function sendLeadMail(env: MailEnv, lead: Lead, fields: Record<string, string | undefined>, fetchImpl: typeof fetch = fetch): Promise<void> {
  if (!env.RESEND_API_KEY || lead.kind === "newsletter") return;
  const results = await Promise.allSettled([sendResendEmail(env, teamMail(lead, fields, env.ENVIRONMENT), fetchImpl), sendResendEmail(env, ackMail(lead), fetchImpl)]);
  for (const r of results) if (r.status === "rejected") console.warn("lead mail failed", r.reason instanceof Error ? r.reason.message : r.reason);
}
