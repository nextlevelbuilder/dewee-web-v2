/**
 * Counters for the website chat, one Durable Object per scope:
 *   - "ip:<hash>" counts one visitor IP's messages and new sessions,
 *   - "global" counts agent replies per day and remembers the one budget alert.
 * A Durable Object is single-threaded, so counts are exact (KV would race).
 */
import { DurableObject } from "cloudflare:workers";
import { applyHit, CHAT_LIMITS, DAY_MS, HOUR_MS, type WindowHit, type WindowRow } from "./chat-limits";

export class ChatLimiter extends DurableObject<Env> {
  private sql: SqlStorage;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    ctx.blockConcurrencyWhile(async () => {
      this.sql.exec("CREATE TABLE IF NOT EXISTS windows (k TEXT PRIMARY KEY, start INTEGER NOT NULL, count INTEGER NOT NULL)");
      this.sql.exec("CREATE TABLE IF NOT EXISTS members (k TEXT NOT NULL, member TEXT NOT NULL, start INTEGER NOT NULL, PRIMARY KEY (k, member, start))");
    });
  }

  /**
   * Counts one hit on `key`. With a `member` (e.g. a session id) the same member is counted
   * once per window, so a returning visitor does not use up the quota again.
   */
  async hit(key: string, limit: number, windowMs: number, member?: string): Promise<{ ok: boolean; count: number }> {
    const now = Date.now();
    const start = Math.floor(now / windowMs) * windowMs;
    if (member) {
      const seen = this.sql.exec("SELECT 1 FROM members WHERE k = ? AND member = ? AND start = ?", key, member, start).toArray().length > 0;
      if (seen) return { ok: true, count: this.read(key)?.count ?? 0 };
    }
    const result: WindowHit = applyHit(this.read(key), now, windowMs, limit);
    this.sql.exec(
      "INSERT INTO windows (k, start, count) VALUES (?, ?, ?) ON CONFLICT(k) DO UPDATE SET start = excluded.start, count = excluded.count",
      key, result.row.start, result.row.count,
    );
    if (member && result.ok) this.sql.exec("INSERT OR IGNORE INTO members (k, member, start) VALUES (?, ?, ?)", key, member, start);
    // Housekeeping: member rows older than two days are never read again.
    this.sql.exec("DELETE FROM members WHERE start < ?", now - 2 * DAY_MS);
    return { ok: result.ok, count: result.count };
  }

  private read(key: string): WindowRow | null {
    return this.sql.exec<WindowRow>("SELECT start, count FROM windows WHERE k = ?", key).toArray()[0] ?? null;
  }
}

/** The limiter instance for one scope ("global" or a hashed IP). */
export function limiter(env: Env, scope: string) {
  return env.CHAT_LIMITER.get(env.CHAT_LIMITER.idFromName(scope));
}

/** Per-IP message quota across all of a visitor's conversations. Unsigned sessions (no hash) and limiter outages let the message through; the per-room limit still applies. */
export async function ipAllowsMessage(env: Env, ipHash: string | null): Promise<boolean> {
  if (!ipHash) return true;
  try {
    return (await limiter(env, `ip:${ipHash}`).hit("messages", CHAT_LIMITS.ipMessagesPerHour, HOUR_MS)).ok;
  } catch (err) {
    console.warn("chat ip limiter unavailable", err instanceof Error ? err.message : err);
    return true;
  }
}
