/**
 * The daily website-chat digest for Discord: what happened in the last 24 hours, composed from
 * rows already in D1 (chat_sessions, chat leads). Pure, so it is tested without a database; the
 * scheduled run, the D1 queries and the once-per-day guard live in chat-digest-run.
 */

export type DigestSession = {
  locale: string | null;
  country: string | null;
  landing_path: string | null;
  page_path: string | null;
  utm_source: string | null;
  referrer: string | null;
  first_message: string | null;
  created_at: string;
  outcome: string | null;
  agent_failures: number;
  faq_fallbacks: number;
  handoff_at: string | null;
};
export type DigestLead = { email: string | null; payload: string; created_at: string };
/** `sessions` holds every session active since `since`; new ones are those created since then. */
export type DigestData = { since: string; sessions: DigestSession[]; leads: DigestLead[] };
export type Digest = { title: string; lines: Record<string, string> };

const TOP_QUESTIONS = 8;
const QUESTION_CHARS = 120;
const MAX_LEADS = 10;

/** "Website chat digest · 2026-10-08", dated in Vietnam time (the team's morning). */
export function digestTitle(now: Date): string {
  const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
  return `Website chat digest · ${day}`;
}

export function composeDigest(data: DigestData, now: Date): Digest {
  const title = digestTitle(now);
  const fresh = data.sessions.filter((s) => s.created_at >= data.since);
  if (!data.sessions.length && !data.leads.length) {
    return { title, lines: { Sessions: "No website chats in the last 24 hours." } };
  }
  const sum = (pick: (s: DigestSession) => number) => data.sessions.reduce((n, s) => n + (pick(s) || 0), 0);
  const handoffs = data.sessions.filter((s) => s.handoff_at && s.handoff_at >= data.since).length;
  return {
    title,
    lines: {
      Sessions: `${fresh.length} new · ${data.sessions.length} active in the last 24 h`,
      "By locale": tally(fresh.map((s) => s.locale ?? "?")),
      "By country": tally(fresh.map((s) => s.country ?? "unknown"), 8),
      "Top pages": tally(fresh.map((s) => s.landing_path ?? s.page_path ?? "unknown"), 6),
      Sources: tally(fresh.map(sourceOf), 6),
      Outcomes: tally(data.sessions.map((s) => s.outcome ?? "no reply")),
      "Top questions": topQuestions(fresh) || "none",
      Agent: `${sum((s) => s.faq_fallbacks)} FAQ fallbacks · ${sum((s) => s.agent_failures)} agent failures`,
      Handoffs: String(handoffs),
      "New leads": leadLines(data.leads),
    },
  };
}

/** UTM source when tagged, otherwise the referrer's host, otherwise direct. */
function sourceOf(s: DigestSession): string {
  if (s.utm_source) return `utm:${s.utm_source}`;
  if (s.referrer) return s.referrer.split("/")[0];
  return "direct";
}

/** "en 5 · vi 3", most frequent first, at most `limit` entries. */
export function tally(values: string[], limit = 10): string {
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  const sorted = [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const shown = sorted.slice(0, limit).map(([k, n]) => `${escapeMarkdown(k)} ${n}`).join(" · ");
  return shown ? (sorted.length > limit ? `${shown} · +${sorted.length - limit} more` : shown) : "none";
}

/** First messages, deduplicated case- and space-insensitively, most asked first, then newest. */
export function topQuestions(sessions: Pick<DigestSession, "first_message" | "created_at">[]): string {
  const groups = new Map<string, { text: string; n: number; latest: string }>();
  for (const s of sessions) {
    const text = s.first_message?.replace(/\s+/g, " ").trim();
    if (!text) continue;
    const key = text.toLowerCase().replace(/[\s!?.…,]+$/u, "");
    const g = groups.get(key);
    if (g) { g.n++; if (s.created_at > g.latest) g.latest = s.created_at; } else groups.set(key, { text, n: 1, latest: s.created_at });
  }
  return [...groups.values()]
    .sort((a, b) => b.n - a.n || b.latest.localeCompare(a.latest))
    .slice(0, TOP_QUESTIONS)
    .map((g) => `• ${escapeMarkdown(clip(g.text, QUESTION_CHARS))}${g.n > 1 ? ` (×${g.n})` : ""}`)
    .join("\n");
}

function leadLines(leads: DigestLead[]): string {
  if (!leads.length) return "none";
  const lines = leads.slice(0, MAX_LEADS).map((l) => {
    const need = parseNeed(l.payload);
    return `• ${escapeMarkdown(l.email ?? "?")}${need ? ` · ${escapeMarkdown(clip(need, 80))}` : ""}`;
  });
  if (leads.length > MAX_LEADS) lines.push(`… and ${leads.length - MAX_LEADS} more in /admin`);
  return lines.join("\n");
}

function parseNeed(payload: string): string | undefined {
  try {
    const need = (JSON.parse(payload) as { need?: unknown }).need;
    return typeof need === "string" && need ? need : undefined;
  } catch {
    return undefined;
  }
}

const clip = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);

/** Visitor text is shown as text: Discord Markdown characters are escaped. */
export const escapeMarkdown = (text: string) => text.replace(/([\\*_~`|>#[\]()])/g, "\\$1");
