/**
 * API keys in D1: create (plaintext returned once), list, revoke, and verify a bearer token.
 * Only super admins mint keys, and a key stops working if its owner leaves the allowlist.
 */
import { isSuperAdmin } from "./allowlist";
import { generateApiKey, hashApiKey, parseApiKey, parseScopes, type ApiScope } from "./api-key-format";
import { auditStatement } from "./audit-log";

export type ApiKeyRow = {
  id: string;
  name: string;
  prefix: string;
  scopes: string;
  owner_email: string;
  created_at: string;
  last_used_at: string | null;
  expires_at: string | null;
  revoked_at: string | null;
};
export type VerifiedKey = { id: string; name: string; prefix: string; ownerEmail: string; scopes: ApiScope[] };

const LAST_USED_GRANULARITY_MS = 60_000;

export async function createApiKey(
  db: D1Database,
  input: { name: string; scopes: ApiScope[]; ownerEmail: string; expiresAt: string | null },
): Promise<{ id: string; key: string; prefix: string }> {
  if (!isSuperAdmin(input.ownerEmail)) throw new Error("only super admins can create API keys");
  const { key, prefix, hash } = await generateApiKey();
  const id = crypto.randomUUID();
  await db.batch([
    db
      .prepare("INSERT INTO api_keys (id, name, prefix, hash, scopes, owner_email, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .bind(id, input.name, prefix, hash, input.scopes.join(" "), input.ownerEmail, input.expiresAt),
    auditStatement(db, input.ownerEmail, "api_key.create", id, { name: input.name, prefix, scopes: input.scopes, expiresAt: input.expiresAt }),
  ]);
  return { id, key, prefix };
}

export async function listApiKeys(db: D1Database): Promise<ApiKeyRow[]> {
  const { results } = await db
    .prepare("SELECT id, name, prefix, scopes, owner_email, created_at, last_used_at, expires_at, revoked_at FROM api_keys ORDER BY created_at DESC LIMIT 200")
    .all<ApiKeyRow>();
  return results;
}

export async function revokeApiKey(db: D1Database, id: string, actor: string): Promise<boolean> {
  const now = new Date().toISOString();
  const [res] = await db.batch([
    db.prepare("UPDATE api_keys SET revoked_at = ? WHERE id = ? AND revoked_at IS NULL").bind(now, id),
    auditStatement(db, actor, "api_key.revoke", id),
  ]);
  return (res.meta.changes ?? 0) > 0;
}

/** Resolves a bearer token to its key; null for malformed, unknown, revoked or expired keys. */
export async function verifyApiKey(db: D1Database, token: string, waitUntil?: (p: Promise<unknown>) => void): Promise<VerifiedKey | null> {
  if (!parseApiKey(token)) return null;
  const row = await db.prepare("SELECT * FROM api_keys WHERE hash = ?").bind(await hashApiKey(token)).first<ApiKeyRow>();
  const now = Date.now();
  if (!row || row.revoked_at || (row.expires_at && Date.parse(row.expires_at) <= now) || !isSuperAdmin(row.owner_email)) return null;
  if (!row.last_used_at || Date.parse(row.last_used_at) < now - LAST_USED_GRANULARITY_MS) {
    const touch = db
      .prepare("UPDATE api_keys SET last_used_at = ? WHERE id = ?")
      .bind(new Date(now).toISOString(), row.id)
      .run()
      .catch((err) => console.warn("api-key: last_used_at update failed", err instanceof Error ? err.message : err));
    if (waitUntil) waitUntil(touch);
    else await touch;
  }
  return { id: row.id, name: row.name, prefix: row.prefix, ownerEmail: row.owner_email, scopes: parseScopes(row.scopes) };
}
