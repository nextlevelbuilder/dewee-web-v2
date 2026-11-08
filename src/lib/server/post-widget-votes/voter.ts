/**
 * Who is voting, without knowing who it is. A reader who answers a Poll, Quiz or Survey gets a
 * random first-party cookie (functional: it only stops double votes). D1 stores
 * HMAC(salt, post id + cookie id), so the stored key cannot be turned back into the cookie and
 * differs per post. Rate-limit keys use the same salt for the cookie and the client IP; they
 * live in KV for one window and the raw IP is never written anywhere.
 *
 * The cookie carries the id and an HMAC of it (`<id>.<sig>`), so a made-up cookie is treated as no
 * cookie and falls under the stricter cookieless limit instead of minting fresh voters.
 *
 * The salt is a random value the worker creates in D1 on first use (`widget_secrets`), so every
 * environment gets its own without a secret to provision.
 */
import { randomHex, timingSafeEqual, toHex } from "../auth/crypto-helpers";

export const VOTER_COOKIE = "__Host-dewee_voter";
export const VOTER_COOKIE_MAX_AGE = 365 * 24 * 60 * 60;
const SALT_NAME = "voter-salt";
const enc = new TextEncoder();

const VOTER_VALUE_RE = /^([0-9a-f]{32})\.([0-9a-f]{32})$/;

/** The raw voter cookie value from the request's Cookie header, if any. */
function voterCookieValue(request: Request): string | null {
  const header = request.headers.get("cookie") ?? "";
  for (const part of header.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === VOTER_COOKIE) return rest.join("=");
  }
  return null;
}

export const hasVoterCookie = (request: Request): boolean => voterCookieValue(request) !== null;

const voterSig = async (salt: string, id: string) => (await hmacHex(salt, `cookie:${id}`)).slice(0, 32);

/** The voter id from the request's cookie, only when this server issued it (its signature checks out). */
export async function readVoterId(request: Request, salt: string): Promise<string | null> {
  const match = VOTER_VALUE_RE.exec(voterCookieValue(request) ?? "");
  if (!match) return null;
  const [, id, sig] = match;
  return timingSafeEqual(await voterSig(salt, id), sig) ? id : null;
}

export const newVoterId = (): string => randomHex(16);

export async function voterCookie(salt: string, id: string): Promise<string> {
  return `${VOTER_COOKIE}=${id}.${await voterSig(salt, id)}; Path=/; Max-Age=${VOTER_COOKIE_MAX_AGE}; HttpOnly; Secure; SameSite=Lax`;
}

let cachedSalt: { db: D1Database; salt: string } | null = null;

/** The per-environment salt, created once (INSERT OR IGNORE keeps the first writer's value). */
export async function voterSalt(db: D1Database): Promise<string> {
  if (cachedSalt?.db === db) return cachedSalt.salt;
  await db.prepare("INSERT OR IGNORE INTO widget_secrets (name, value) VALUES (?, ?)").bind(SALT_NAME, randomHex(32)).run();
  const row = await db.prepare("SELECT value FROM widget_secrets WHERE name = ?").bind(SALT_NAME).first<{ value: string }>();
  if (!row?.value) throw new Error("voter salt unavailable");
  cachedSalt = { db, salt: row.value };
  return row.value;
}

export async function hmacHex(salt: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(salt), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return toHex(new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(message))));
}

/** The stored voter key for one post. */
export const voterKey = (salt: string, postId: string, voterId: string) => hmacHex(salt, `voter:${postId}:${voterId}`);

/** Short keys for the KV rate-limit buckets (cookie and IP), never stored in D1. */
export async function rateKeys(salt: string, voterId: string, ip: string): Promise<{ voter: string; ip: string }> {
  const [voter, ipKey] = await Promise.all([hmacHex(salt, `rl-voter:${voterId}`), hmacHex(salt, `rl-ip:${ip}`)]);
  return { voter: voter.slice(0, 32), ip: ipKey.slice(0, 32) };
}
