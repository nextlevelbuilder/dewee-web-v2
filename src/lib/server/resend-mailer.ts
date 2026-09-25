/**
 * Minimal Resend HTTP client shared by admin sign-in codes and contact-form mail.
 * The sender comes from RESEND_FROM_EMAIL (falls back to noreply@dewee.sh).
 */
export const DEFAULT_FROM = "dewee <noreply@dewee.sh>";

export interface ResendEnv {
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
}

export interface MailMessage {
  to: string[];
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}

export function resendFrom(env: ResendEnv): string {
  return env.RESEND_FROM_EMAIL?.trim() || DEFAULT_FROM;
}

/** Sends one email; throws with Resend's status and a short detail when it is rejected. */
export async function sendResendEmail(env: ResendEnv, msg: MailMessage, fetchImpl: typeof fetch = fetch): Promise<void> {
  if (!env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");
  const res = await fetchImpl("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ from: resendFrom(env), to: msg.to, subject: msg.subject, text: msg.text, html: msg.html, ...(msg.replyTo ? { reply_to: msg.replyTo } : {}) }),
  });
  if (!res.ok) {
    const detail = (await res.text().catch(() => "")).slice(0, 300);
    throw new Error(`Resend rejected the email (${res.status}): ${detail}`);
  }
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
