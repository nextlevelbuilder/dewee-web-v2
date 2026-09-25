/**
 * Anti-abuse limits for the website chat and the fixed-window counter behind them.
 * The counter is pure so it can be unit-tested; ChatLimiter (a Durable Object) stores the rows.
 */

export const HOUR_MS = 60 * 60_000;
export const DAY_MS = 24 * HOUR_MS;

export const CHAT_LIMITS = {
  /** Visitor messages per hashed IP per hour, across all of that IP's conversations. */
  ipMessagesPerHour: 60,
  /** New chat sessions (distinct session ids) per hashed IP per hour. */
  ipSessionsPerHour: 5,
  /** Visitor messages in one conversation. */
  turnsPerConversation: 40,
  /** Characters per visitor message. */
  maxChars: 2000,
  /** Agent replies per UTC day across the whole site, unless CHAT_AGENT_DAILY_BUDGET says otherwise. */
  defaultDailyBudget: 500,
  /** How long a signed chat session stays valid. */
  sessionTtlMs: HOUR_MS,
} as const;

export type WindowRow = { start: number; count: number };
export type WindowHit = { ok: boolean; count: number; row: WindowRow };

/**
 * One hit against a fixed window of `windowMs`. A row from an older window starts over.
 * A refused hit does not count, so a blocked visitor cannot push the window further.
 */
export function applyHit(row: WindowRow | null, now: number, windowMs: number, limit: number): WindowHit {
  const start = Math.floor(now / windowMs) * windowMs;
  const count = row && row.start === start ? row.count : 0;
  if (count >= limit) return { ok: false, count, row: { start, count } };
  return { ok: true, count: count + 1, row: { start, count: count + 1 } };
}

/** The daily agent budget from the CHAT_AGENT_DAILY_BUDGET var; invalid or missing values use the default. */
export function dailyBudget(raw: string | undefined): number {
  const n = Number.parseInt(raw ?? "", 10);
  return Number.isFinite(n) && n >= 0 ? n : CHAT_LIMITS.defaultDailyBudget;
}
