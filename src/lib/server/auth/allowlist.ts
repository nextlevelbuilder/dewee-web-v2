/**
 * Super-admin allowlist. Hard-coded on purpose: no env var, API call or database row can widen it.
 * Only these people can sign in to /admin and mint API keys.
 */
const SUPER_ADMINS: readonly string[] = Object.freeze([
  "goon.nguyen@gmail.com",
  "duynguyen@wearetopgroup.com",
  "hello@egany.com",
  "hi@nextlevelbuilder.io",
]);

/** Lower-case and trim; returns "" for anything that is not a plausible address. */
export function normalizeEmail(input: unknown): string {
  if (typeof input !== "string") return "";
  const email = input.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/.test(email)) return "";
  return email;
}

export function isSuperAdmin(email: unknown): boolean {
  const normalized = normalizeEmail(email);
  return normalized !== "" && SUPER_ADMINS.includes(normalized);
}

/** Count only; the list itself never leaves the server. */
export const SUPER_ADMIN_COUNT = SUPER_ADMINS.length;
