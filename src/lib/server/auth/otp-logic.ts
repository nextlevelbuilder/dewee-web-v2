/**
 * Email sign-in codes (pure logic). Six digits, stored only as a salted SHA-256 hash,
 * valid for ten minutes and five guesses. The store (otp-store.ts) wraps this with D1.
 */
import { randomDigits, sha256Hex, timingSafeEqual } from "./crypto-helpers";

export const OTP_LENGTH = 6;
export const OTP_TTL_MS = 10 * 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;

export type OtpRecord = { code_hash: string; attempts: number; expires_at: string };
export type OtpVerdict = "ok" | "missing" | "expired" | "locked" | "mismatch";

export function generateOtp(): string {
  return randomDigits(OTP_LENGTH);
}

export function hashOtp(email: string, code: string): Promise<string> {
  return sha256Hex(`dewee-otp:${email}:${code}`);
}

export function otpExpiry(now: Date): string {
  return new Date(now.getTime() + OTP_TTL_MS).toISOString();
}

/** Normalises user input ("123 456", "123-456") to digits; null when it cannot be a code. */
export function cleanOtpInput(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const digits = input.replace(/[\s-]/g, "");
  return new RegExp(`^\\d{${OTP_LENGTH}}$`).test(digits) ? digits : null;
}

/**
 * Decide a submitted code. `attempts` counts earlier wrong guesses; the caller increments it on
 * "mismatch" and deletes the record on "ok", "expired" and "locked".
 */
export function evaluateOtp(record: OtpRecord | null, submittedHash: string, now: Date): OtpVerdict {
  if (!record) return "missing";
  if (Date.parse(record.expires_at) <= now.getTime()) return "expired";
  if (record.attempts >= OTP_MAX_ATTEMPTS) return "locked";
  return timingSafeEqual(record.code_hash, submittedHash) ? "ok" : "mismatch";
}
