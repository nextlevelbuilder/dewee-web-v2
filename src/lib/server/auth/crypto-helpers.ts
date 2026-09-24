/**
 * Small WebCrypto helpers shared by sessions, OTP codes and API keys.
 * Pure (no bindings), so they run the same in the worker and in vitest.
 */
const encoder = new TextEncoder();
const ALPHANUMERIC = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(input));
  return toHex(new Uint8Array(digest));
}

export function toHex(bytes: Uint8Array): string {
  let out = "";
  for (const b of bytes) out += b.toString(16).padStart(2, "0");
  return out;
}

/** Hex string of `bytes` random bytes (session ids, CSRF salts). */
export function randomHex(bytes = 32): string {
  return toHex(crypto.getRandomValues(new Uint8Array(bytes)));
}

/**
 * Uniform random string over [a-zA-Z0-9] using rejection sampling (no modulo bias).
 * 62^32 ≈ 2^190 bits of entropy for the default API-key secret length.
 */
export function randomAlphanumeric(length: number): string {
  let out = "";
  while (out.length < length) {
    const batch = crypto.getRandomValues(new Uint8Array(length * 2));
    for (const b of batch) {
      if (b < 248) out += ALPHANUMERIC[b % 62];
      if (out.length === length) break;
    }
  }
  return out;
}

/** Uniform random decimal digits (OTP codes). */
export function randomDigits(length: number): string {
  let out = "";
  while (out.length < length) {
    const batch = crypto.getRandomValues(new Uint8Array(length * 2));
    for (const b of batch) {
      if (b < 250) out += String(b % 10);
      if (out.length === length) break;
    }
  }
  return out;
}

/** Constant-time comparison for equal-length hex/ASCII strings. */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function base64UrlDecode(input: string): Uint8Array {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(input.length / 4) * 4, "=");
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
