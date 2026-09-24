/**
 * Append-only audit trail. Every write (sign-in, key change, page change, upload) records who did
 * what to which target. Prefer `auditStatement` inside a D1 batch so the write and its audit row
 * commit together.
 */
export function auditStatement(db: D1Database, actor: string, action: string, target: string | null, detail?: unknown): D1PreparedStatement {
  const text = detail === undefined ? null : JSON.stringify(detail).slice(0, 4000);
  return db.prepare("INSERT INTO audit_log (actor, action, target, detail) VALUES (?, ?, ?, ?)").bind(actor, action, target, text);
}

export async function audit(db: D1Database, actor: string, action: string, target: string | null, detail?: unknown): Promise<void> {
  try {
    await auditStatement(db, actor, action, target, detail).run();
  } catch (err) {
    // An audit failure must never be silent, but it must not undo a completed sign-in either.
    console.error("audit: insert failed", action, err instanceof Error ? err.message : err);
  }
}

export type AuditRow = { id: number; actor: string; action: string; target: string | null; detail: string | null; at: string };

export async function listAudit(db: D1Database, opts: { limit: number; before?: number }): Promise<AuditRow[]> {
  const limit = Math.min(Math.max(opts.limit, 1), 200);
  const stmt = opts.before
    ? db.prepare("SELECT * FROM audit_log WHERE id < ? ORDER BY id DESC LIMIT ?").bind(opts.before, limit)
    : db.prepare("SELECT * FROM audit_log ORDER BY id DESC LIMIT ?").bind(limit);
  const { results } = await stmt.all<AuditRow>();
  return results;
}
