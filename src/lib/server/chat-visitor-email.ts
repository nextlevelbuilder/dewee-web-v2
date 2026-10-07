/**
 * Email addresses in a visitor's own chat text. This is a structured address parse (an email
 * typed into the chat becomes a lead), not a guess about intent: whether a visitor wants a person
 * or should be asked for an email is decided by the agent's structured actions (chat-agent-actions)
 * or, with the agent off, by the FAQ (chat-faq).
 */
import { EMAIL_RE } from "./notify";

const EMAIL_IN_TEXT = /[^\s@<>()"',;:]{1,64}@[^\s@<>()"',;:]{1,190}\.[a-z]{2,24}/gi;

/** Every valid email address in a message, lower-cased, in order. */
export function emailsIn(text: string): string[] {
  return (text.match(EMAIL_IN_TEXT) ?? [])
    .map((hit) => hit.replace(/[.]+$/, "").toLowerCase())
    .filter((hit) => EMAIL_RE.test(hit));
}

/** The first valid email address in a message, or null. */
export function emailIn(text: string): string | null {
  return emailsIn(text)[0] ?? null;
}
