/**
 * Human handoff signals in the website chat: a visitor asking for a person, an email address
 * typed into the conversation, or an agent reply promising to connect them with the team.
 */
import { EMAIL_RE } from "./notify";

const HUMAN_RE = /\b(human|real person|someone|sales ?(team|rep)|talk to (a|your) (person|team)|call me|book a (call|demo)|demo)\b|người thật|nhân viên|tư vấn viên|gặp (người|đội)|liên hệ (với )?(đội|người)|gọi (cho )?(mình|tôi|em|anh|chị)/i;
const EMAIL_IN_TEXT = /[^\s@<>()"',;:]{1,64}@[^\s@<>()"',;:]{1,190}\.[a-z]{2,24}/i;
const PROMISE_RE = /connect you with the team|kết nối bạn với đội ngũ|your email|email của bạn/i;

/** True when the visitor asks for a person rather than an answer. */
export function wantsHuman(text: string): boolean {
  return HUMAN_RE.test(text);
}

/** The first valid email address in a message, lower-cased, or null. */
export function emailIn(text: string): string | null {
  const hit = text.match(EMAIL_IN_TEXT)?.[0]?.replace(/[.]+$/, "").toLowerCase();
  return hit && EMAIL_RE.test(hit) ? hit : null;
}

/** True when an agent reply asks for the visitor's email, so the widget shows the email form. */
export function replyAsksForEmail(text: string): boolean {
  return PROMISE_RE.test(text);
}
