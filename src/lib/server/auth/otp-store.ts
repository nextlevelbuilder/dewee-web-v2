/**
 * Email sign-in flow on D1 + KV. The response to "send me a code" never depends on whether the
 * address is allowlisted: same status, same shape, and the email itself is sent in the background.
 */
import type { PlatformEnv } from "../api/platform-env";
import { isSuperAdmin, normalizeEmail } from "./allowlist";
import { audit } from "./audit-log";
import { emailLoginAvailable, sendLoginCode } from "./login-mailer";
import { cleanOtpInput, evaluateOtp, generateOtp, hashOtp, otpExpiry, type OtpRecord } from "./otp-logic";
import { rateLimit } from "./rate-limit";

const WINDOW = 15 * 60;

export type CodeRequestResult = "sent" | "unavailable" | "rate_limited";
export type CodeVerifyResult = { ok: true; email: string } | { ok: false; reason: "invalid" | "rate_limited" };

export async function requestLoginCode(env: PlatformEnv, rawEmail: unknown, ip: string, waitUntil: (p: Promise<unknown>) => void): Promise<CodeRequestResult> {
  if (!emailLoginAvailable(env)) return "unavailable";
  const email = normalizeEmail(rawEmail);
  const ipOk = await rateLimit(env.KV, `otp-send-ip:${ip}`, 10, WINDOW);
  if (!ipOk.ok) return "rate_limited";
  if (!email) return "sent";
  const emailOk = await rateLimit(env.KV, `otp-send-email:${email}`, 5, WINDOW);
  if (!emailOk.ok) return "rate_limited";
  if (!isSuperAdmin(email)) return "sent";

  const code = generateOtp();
  const now = new Date();
  await env.DB.prepare(
    "INSERT INTO login_codes (email, code_hash, attempts, expires_at) VALUES (?, ?, 0, ?) ON CONFLICT (email) DO UPDATE SET code_hash = excluded.code_hash, attempts = 0, expires_at = excluded.expires_at",
  )
    .bind(email, await hashOtp(email, code), otpExpiry(now))
    .run();
  waitUntil(
    sendLoginCode(env, email, code).catch((err) => {
      console.error("otp: delivery failed", err instanceof Error ? err.message : err);
    }),
  );
  await audit(env.DB, email, "auth.code_requested", null, { ip });
  return "sent";
}

export async function verifyLoginCode(env: PlatformEnv, rawEmail: unknown, rawCode: unknown, ip: string): Promise<CodeVerifyResult> {
  const ipOk = await rateLimit(env.KV, `otp-verify-ip:${ip}`, 20, WINDOW);
  if (!ipOk.ok) return { ok: false, reason: "rate_limited" };
  const email = normalizeEmail(rawEmail);
  const code = cleanOtpInput(rawCode);
  if (!email || !code || !isSuperAdmin(email)) return { ok: false, reason: "invalid" };

  const record = await env.DB.prepare("SELECT code_hash, attempts, expires_at FROM login_codes WHERE email = ?").bind(email).first<OtpRecord>();
  const verdict = evaluateOtp(record, await hashOtp(email, code), new Date());
  if (verdict === "mismatch") {
    await env.DB.prepare("UPDATE login_codes SET attempts = attempts + 1 WHERE email = ?").bind(email).run();
    await audit(env.DB, email, "auth.code_rejected", null, { ip });
    return { ok: false, reason: "invalid" };
  }
  if (verdict !== "missing") await env.DB.prepare("DELETE FROM login_codes WHERE email = ?").bind(email).run();
  if (verdict !== "ok") return { ok: false, reason: "invalid" };
  return { ok: true, email };
}
