/**
 * `Idempotency-Key` support for API writes (stored in the `idempotency` table for 24 hours).
 * The first request claims the key, runs, and stores its response; a retry with the same key and
 * the same body replays that response. A different body under the same key is a 422, and a retry
 * that arrives while the first is still running is a 409. Server errors are not stored.
 */
import { sha256Hex } from "../auth/crypto-helpers";
import { ApiError, badRequest } from "./api-errors";

const TTL_MS = 24 * 60 * 60 * 1000;
const KEY_RE = /^[\x21-\x7e]{1,255}$/;

type Stored = { fingerprint: string; body?: string; contentType?: string };

export async function withIdempotency(
  db: D1Database,
  opts: { key: string | null; actor: string; method: string; path: string; fingerprint: string },
  run: () => Promise<Response>,
): Promise<Response> {
  if (!opts.key) return run();
  if (!KEY_RE.test(opts.key)) throw badRequest("Idempotency-Key must be 1-255 visible ASCII characters.");
  const id = await sha256Hex(`${opts.actor}|${opts.method}|${opts.path}|${opts.key}`);
  const cutoff = new Date(Date.now() - TTL_MS).toISOString();
  await db.prepare("DELETE FROM idempotency WHERE key = ? AND created_at < ?").bind(id, cutoff).run();

  const claim = await db
    .prepare("INSERT INTO idempotency (key, actor, status, response) VALUES (?, ?, 0, ?) ON CONFLICT (key) DO NOTHING")
    .bind(id, opts.actor, JSON.stringify({ fingerprint: opts.fingerprint } satisfies Stored))
    .run();

  if (claim.meta.changes) {
    let response: Response;
    try {
      response = await run();
    } catch (err) {
      await db.prepare("DELETE FROM idempotency WHERE key = ?").bind(id).run();
      throw err;
    }
    if (response.status >= 500) {
      await db.prepare("DELETE FROM idempotency WHERE key = ?").bind(id).run();
      return response;
    }
    const body = await response.text();
    const stored: Stored = { fingerprint: opts.fingerprint, body, contentType: response.headers.get("content-type") ?? "application/json" };
    await db.prepare("UPDATE idempotency SET status = ?, response = ? WHERE key = ?").bind(response.status, JSON.stringify(stored), id).run();
    return new Response(body, { status: response.status, headers: response.headers });
  }

  const row = await db.prepare("SELECT status, response FROM idempotency WHERE key = ?").bind(id).first<{ status: number; response: string }>();
  if (!row || row.status === 0) throw new ApiError(409, "conflict", "A request with this Idempotency-Key is still being processed. Retry shortly.");
  const stored = JSON.parse(row.response) as Stored;
  if (stored.fingerprint !== opts.fingerprint) {
    throw new ApiError(422, "validation_failed", "This Idempotency-Key was already used with a different request body.");
  }
  return new Response(stored.body ?? "", {
    status: row.status,
    headers: { "content-type": stored.contentType ?? "application/json", "idempotency-replayed": "true", "cache-control": "no-store" },
  });
}
