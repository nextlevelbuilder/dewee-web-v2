/**
 * Admin sessions. The cookie `__Host-dewee_admin` carries a random token; D1 stores only its
 * SHA-256, so a database leak cannot be replayed as a cookie. Sessions last seven days and die
 * early if the email ever leaves the allowlist.
 */
import type { AstroCookies } from "astro";
import { isSuperAdmin } from "./allowlist";
import { randomHex, sha256Hex, timingSafeEqual } from "./crypto-helpers";

export const SESSION_COOKIE = "__Host-dewee_admin";
export const SESSION_TTL_S = 7 * 24 * 60 * 60;

export type AdminSession = { id: string; email: string; method: string; expires_at: string; token: string };

export async function createSession(db: D1Database, email: string, method: "email" | "cf-access"): Promise<{ token: string; expiresAt: Date }> {
  const token = randomHex(32);
  const expiresAt = new Date(Date.now() + SESSION_TTL_S * 1000);
  await db
    .prepare("INSERT INTO admin_sessions (id, email, method, expires_at) VALUES (?, ?, ?, ?)")
    .bind(await sha256Hex(`session:${token}`), email, method, expiresAt.toISOString())
    .run();
  return { token, expiresAt };
}

export async function getSession(db: D1Database, token: string | undefined): Promise<AdminSession | null> {
  if (!token || !/^[0-9a-f]{64}$/.test(token)) return null;
  const row = await db
    .prepare("SELECT id, email, method, expires_at FROM admin_sessions WHERE id = ?")
    .bind(await sha256Hex(`session:${token}`))
    .first<Omit<AdminSession, "token">>();
  if (!row || Date.parse(row.expires_at) <= Date.now() || !isSuperAdmin(row.email)) return null;
  return { ...row, token };
}

export async function destroySession(db: D1Database, token: string | undefined): Promise<void> {
  if (!token) return;
  await db.prepare("DELETE FROM admin_sessions WHERE id = ?").bind(await sha256Hex(`session:${token}`)).run();
}

/** Housekeeping: expired sessions are removed opportunistically at sign-in. */
export async function purgeExpiredSessions(db: D1Database): Promise<void> {
  await db.prepare("DELETE FROM admin_sessions WHERE expires_at <= ?").bind(new Date().toISOString()).run();
}

export function setSessionCookie(cookies: AstroCookies, token: string, expiresAt: Date): void {
  cookies.set(SESSION_COOKIE, token, { httpOnly: true, secure: true, sameSite: "lax", path: "/", expires: expiresAt });
}

export function clearSessionCookie(cookies: AstroCookies): void {
  cookies.set(SESSION_COOKIE, "", { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 0 });
}

/** CSRF token bound to the session: derivable only by someone who holds the HttpOnly cookie. */
export function csrfTokenFor(sessionToken: string): Promise<string> {
  return sha256Hex(`csrf:${sessionToken}`);
}

/**
 * State-changing admin requests must come from our own origin and carry the session's CSRF token.
 * Origin is required; `Sec-Fetch-Site: same-origin` is accepted only when a browser omits Origin.
 */
export async function csrfValid(request: Request, sessionToken: string, submitted: unknown): Promise<boolean> {
  const url = new URL(request.url);
  const origin = request.headers.get("origin");
  const sameOrigin = origin ? origin === url.origin : request.headers.get("sec-fetch-site") === "same-origin";
  if (!sameOrigin || typeof submitted !== "string") return false;
  return timingSafeEqual(submitted, await csrfTokenFor(sessionToken));
}
