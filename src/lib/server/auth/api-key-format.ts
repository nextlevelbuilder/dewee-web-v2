/**
 * API key format and scopes (pure). A key looks like `dwk_<prefix>_<secret>`:
 * the 8-char prefix is stored in clear so humans can tell keys apart, the whole key is stored
 * only as a SHA-256 hash, and the plaintext is shown exactly once at creation.
 */
import { randomAlphanumeric, sha256Hex } from "./crypto-helpers";

export const API_SCOPES = ["pages:read", "pages:write", "posts:read", "posts:write", "media:write", "leads:read"] as const;
export type ApiScope = (typeof API_SCOPES)[number];

const KEY_RE = /^dwk_([a-z0-9]{8})_([A-Za-z0-9]{32,128})$/;
const SECRET_LENGTH = 40;

export function isApiScope(v: unknown): v is ApiScope {
  return typeof v === "string" && (API_SCOPES as readonly string[]).includes(v);
}

/** Accepts "a b", "a,b" or an array; drops unknown scopes and duplicates, keeps canonical order. */
export function parseScopes(input: unknown): ApiScope[] {
  const raw = Array.isArray(input) ? input : typeof input === "string" ? input.split(/[\s,]+/) : [];
  const wanted = new Set(raw.filter(isApiScope));
  return API_SCOPES.filter((s) => wanted.has(s));
}

export async function generateApiKey(): Promise<{ key: string; prefix: string; hash: string }> {
  const prefix = randomAlphanumeric(8).toLowerCase();
  const key = `dwk_${prefix}_${randomAlphanumeric(SECRET_LENGTH)}`;
  return { key, prefix, hash: await hashApiKey(key) };
}

export function parseApiKey(input: string): { prefix: string } | null {
  const m = KEY_RE.exec(input.trim());
  return m ? { prefix: m[1] } : null;
}

export function hashApiKey(key: string): Promise<string> {
  return sha256Hex(`dewee-api-key:${key.trim()}`);
}

/** Extracts the token from `Authorization: Bearer <token>`; null when absent or malformed. */
export function bearerToken(header: string | null): string | null {
  if (!header) return null;
  const m = /^Bearer\s+(\S+)\s*$/i.exec(header);
  return m ? m[1] : null;
}
