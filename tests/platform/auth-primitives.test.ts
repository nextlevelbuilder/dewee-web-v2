import { describe, expect, it } from "vitest";
import { isSuperAdmin, normalizeEmail, SUPER_ADMIN_COUNT } from "../../src/lib/server/auth/allowlist";
import { API_SCOPES, bearerToken, generateApiKey, hashApiKey, parseApiKey, parseScopes } from "../../src/lib/server/auth/api-key-format";
import { randomAlphanumeric, randomDigits, sha256Hex, timingSafeEqual } from "../../src/lib/server/auth/crypto-helpers";
import { cleanOtpInput, evaluateOtp, generateOtp, hashOtp, OTP_MAX_ATTEMPTS, OTP_TTL_MS, otpExpiry } from "../../src/lib/server/auth/otp-logic";

describe("super-admin allowlist", () => {
  it("accepts exactly the four hard-coded addresses", () => {
    expect(SUPER_ADMIN_COUNT).toBe(4);
    for (const e of ["goon.nguyen@gmail.com", "duynguyen@wearetopgroup.com", "hello@egany.com", "hi@nextlevelbuilder.io"]) {
      expect(isSuperAdmin(e)).toBe(true);
    }
  });

  it("normalises case and whitespace", () => {
    expect(isSuperAdmin("  HI@NextLevelBuilder.IO ")).toBe(true);
    expect(normalizeEmail(" A@B.co ")).toBe("a@b.co");
  });

  it("rejects look-alikes, sub-addressing and junk", () => {
    for (const e of ["hi@nextlevelbuilder.io.evil.com", "hi+x@nextlevelbuilder.io", "evil@gmail.com", "", "goon.nguyen@gmail.com\n", null, 42, ["hi@nextlevelbuilder.io"]]) {
      expect(isSuperAdmin(e)).toBe(e === "goon.nguyen@gmail.com\n");
    }
  });
});

describe("API key format", () => {
  it("generates dwk_<8>_<40> keys whose hash is stable and not the key", async () => {
    const { key, prefix, hash } = await generateApiKey();
    expect(key).toMatch(/^dwk_[a-z0-9]{8}_[A-Za-z0-9]{40}$/);
    expect(parseApiKey(key)).toEqual({ prefix });
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hash).not.toContain(key.slice(13));
    expect(await hashApiKey(key)).toBe(hash);
    expect(await hashApiKey(` ${key} `)).toBe(hash);
  });

  it("never repeats and rejects malformed keys", async () => {
    const keys = await Promise.all(Array.from({ length: 50 }, () => generateApiKey()));
    expect(new Set(keys.map((k) => k.key)).size).toBe(50);
    for (const bad of ["dwk_short_abc", "dwk_ABCDEFGH_" + "a".repeat(40), "xyz_abcdefgh_" + "a".repeat(40), "dwk_abcdefgh_" + "a".repeat(31)]) {
      expect(parseApiKey(bad)).toBeNull();
    }
  });

  it("parses scopes canonically and drops unknown ones", () => {
    expect(parseScopes("posts:write pages:read bogus pages:read")).toEqual(["pages:read", "posts:write"]);
    expect(parseScopes(["leads:read", "admin:*"])).toEqual(["leads:read"]);
    expect(parseScopes(API_SCOPES.join(","))).toEqual([...API_SCOPES]);
    expect(parseScopes(undefined)).toEqual([]);
  });

  it("extracts bearer tokens", () => {
    expect(bearerToken("Bearer dwk_x")).toBe("dwk_x");
    expect(bearerToken("bearer   abc  ")).toBe("abc");
    expect(bearerToken("Basic abc")).toBeNull();
    expect(bearerToken(null)).toBeNull();
  });
});

describe("crypto helpers", () => {
  it("hashes, compares and draws from the right alphabets", async () => {
    expect(await sha256Hex("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
    expect(timingSafeEqual("abc", "abc")).toBe(true);
    expect(timingSafeEqual("abc", "abd")).toBe(false);
    expect(timingSafeEqual("abc", "abcd")).toBe(false);
    expect(randomDigits(12)).toMatch(/^\d{12}$/);
    expect(randomAlphanumeric(64)).toMatch(/^[A-Za-z0-9]{64}$/);
  });
});

describe("OTP logic", () => {
  const now = new Date("2026-09-25T00:00:00Z");

  it("generates six digits and hashes them per email", async () => {
    const code = generateOtp();
    expect(code).toMatch(/^\d{6}$/);
    expect(await hashOtp("a@b.co", code)).not.toBe(await hashOtp("c@d.co", code));
  });

  it("cleans user input", () => {
    expect(cleanOtpInput(" 123 456 ")).toBe("123456");
    expect(cleanOtpInput("123-456")).toBe("123456");
    expect(cleanOtpInput("12345")).toBeNull();
    expect(cleanOtpInput("abcdef")).toBeNull();
    expect(cleanOtpInput(123456)).toBeNull();
  });

  it("expires after ten minutes and locks after five wrong guesses", async () => {
    const hash = await hashOtp("a@b.co", "123456");
    const record = { code_hash: hash, attempts: 0, expires_at: otpExpiry(now) };
    expect(Date.parse(record.expires_at) - now.getTime()).toBe(OTP_TTL_MS);
    expect(evaluateOtp(record, hash, now)).toBe("ok");
    expect(evaluateOtp(record, await hashOtp("a@b.co", "000000"), now)).toBe("mismatch");
    expect(evaluateOtp(record, hash, new Date(now.getTime() + OTP_TTL_MS))).toBe("expired");
    expect(evaluateOtp({ ...record, attempts: OTP_MAX_ATTEMPTS }, hash, now)).toBe("locked");
    expect(evaluateOtp({ ...record, attempts: OTP_MAX_ATTEMPTS - 1 }, hash, now)).toBe("ok");
    expect(evaluateOtp(null, hash, now)).toBe("missing");
  });
});
