import { beforeEach, describe, expect, it } from "vitest";
import { claimsValid, clearAccessCertCache, verifyAccessJwt } from "../../src/lib/server/auth/cf-access";

const TEAM = "nlb.cloudflareaccess.com";
const AUD = "aud-tag-123";
const NOW = Date.parse("2026-09-25T00:00:00Z");

const b64url = (data: Uint8Array | string) => {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

async function keypair(kid: string) {
  const pair = (await crypto.subtle.generateKey(
    { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
    true,
    ["sign", "verify"],
  )) as CryptoKeyPair;
  const jwk = { ...(await crypto.subtle.exportKey("jwk", pair.publicKey)), kid };
  return { pair, jwk };
}

async function sign(privateKey: CryptoKey, kid: string, claims: Record<string, unknown>) {
  const head = b64url(JSON.stringify({ alg: "RS256", kid, typ: "JWT" }));
  const body = b64url(JSON.stringify(claims));
  const sig = new Uint8Array(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", privateKey, new TextEncoder().encode(`${head}.${body}`)));
  return `${head}.${body}.${b64url(sig)}`;
}

const good = { aud: [AUD], iss: `https://${TEAM}`, exp: NOW / 1000 + 600, email: "hi@nextlevelbuilder.io" };

describe("Cloudflare Access JWT", () => {
  beforeEach(() => clearAccessCertCache());

  it("verifies a correctly signed assertion and caches certs", async () => {
    const { pair, jwk } = await keypair("k1");
    let fetches = 0;
    const fetcher = async () => ((fetches += 1), { keys: [jwk] });
    const token = await sign(pair.privateKey, "k1", good);
    expect(await verifyAccessJwt(token, { teamDomain: `https://${TEAM}/`, aud: AUD, now: NOW, fetcher })).toBe("hi@nextlevelbuilder.io");
    expect(await verifyAccessJwt(token, { teamDomain: TEAM, aud: AUD, now: NOW, fetcher })).toBe("hi@nextlevelbuilder.io");
    expect(fetches).toBe(1);
  });

  it("rejects a forged signature, wrong audience, wrong issuer and expiry", async () => {
    const { pair, jwk } = await keypair("k1");
    const other = await keypair("k1");
    const fetcher = async () => ({ keys: [jwk] });
    const opts = { teamDomain: TEAM, aud: AUD, now: NOW, fetcher };
    expect(await verifyAccessJwt(await sign(other.pair.privateKey, "k1", good), opts)).toBeNull();
    expect(await verifyAccessJwt(await sign(pair.privateKey, "k1", { ...good, aud: ["other"] }), opts)).toBeNull();
    expect(await verifyAccessJwt(await sign(pair.privateKey, "k1", { ...good, iss: "https://evil.cloudflareaccess.com" }), opts)).toBeNull();
    expect(await verifyAccessJwt(await sign(pair.privateKey, "k1", { ...good, exp: NOW / 1000 - 3600 }), opts)).toBeNull();
    expect(await verifyAccessJwt(await sign(pair.privateKey, "unknown-kid", good), opts)).toBeNull();
    expect(await verifyAccessJwt("not.a.jwt", opts)).toBeNull();
  });

  it("refuses alg other than RS256", async () => {
    const token = `${b64url(JSON.stringify({ alg: "none", kid: "k1" }))}.${b64url(JSON.stringify(good))}.`;
    expect(await verifyAccessJwt(token, { teamDomain: TEAM, aud: AUD, now: NOW, fetcher: async () => ({ keys: [] }) })).toBeNull();
  });

  it("checks claims with a small leeway", () => {
    const base = { teamDomain: TEAM, aud: AUD, nowSeconds: NOW / 1000 };
    expect(claimsValid({ ...good, aud: AUD }, base)).toBe(true);
    expect(claimsValid({ ...good, exp: NOW / 1000 - 30 }, base)).toBe(true);
    expect(claimsValid({ ...good, nbf: NOW / 1000 + 3600 }, base)).toBe(false);
    expect(claimsValid({ ...good, exp: undefined }, base)).toBe(false);
  });
});
