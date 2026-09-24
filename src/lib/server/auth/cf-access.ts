/**
 * Cloudflare Access sign-in: when the admin sits behind an Access application, every request
 * carries a signed `Cf-Access-Jwt-Assertion`. We verify it ourselves (RS256 against the team's
 * published certs, then aud / iss / exp / nbf) and still require an allowlisted email.
 */
import { base64UrlDecode } from "./crypto-helpers";

type Jwk = JsonWebKey & { kid?: string };
type JwtHeader = { alg?: string; kid?: string; typ?: string };
type JwtClaims = { aud?: string | string[]; iss?: string; exp?: number; nbf?: number; email?: string; sub?: string };
export type CertsFetcher = (url: string) => Promise<{ keys: Jwk[] }>;

const CERT_TTL_MS = 60 * 60 * 1000;
const LEEWAY_S = 60;
const certCache = new Map<string, { keys: Jwk[]; until: number }>();

export function normalizeTeamDomain(input: string): string {
  return input.trim().replace(/^https?:\/\//, "").replace(/\/+$/, "").toLowerCase();
}

function decodeJson<T>(segment: string): T | null {
  try {
    return JSON.parse(new TextDecoder().decode(base64UrlDecode(segment))) as T;
  } catch {
    return null;
  }
}

/** Claim checks (pure): audience, issuer and time window. */
export function claimsValid(claims: JwtClaims, opts: { teamDomain: string; aud: string; nowSeconds: number }): boolean {
  const auds = Array.isArray(claims.aud) ? claims.aud : claims.aud ? [claims.aud] : [];
  if (!auds.includes(opts.aud)) return false;
  if (claims.iss !== `https://${normalizeTeamDomain(opts.teamDomain)}`) return false;
  if (typeof claims.exp !== "number" || claims.exp + LEEWAY_S < opts.nowSeconds) return false;
  if (typeof claims.nbf === "number" && claims.nbf - LEEWAY_S > opts.nowSeconds) return false;
  return true;
}

const defaultFetcher: CertsFetcher = async (url) => {
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`Access certs fetch failed: ${res.status}`);
  return (await res.json()) as { keys: Jwk[] };
};

async function findKey(teamDomain: string, kid: string, fetcher: CertsFetcher, now: number): Promise<Jwk | undefined> {
  const url = `https://${teamDomain}/cdn-cgi/access/certs`;
  const cached = certCache.get(url);
  let key = cached && cached.until > now ? cached.keys.find((k) => k.kid === kid) : undefined;
  if (!key) {
    // Unknown kid or stale cache: Access rotates keys, so refresh once before giving up.
    const { keys } = await fetcher(url);
    certCache.set(url, { keys: Array.isArray(keys) ? keys : [], until: now + CERT_TTL_MS });
    key = keys.find((k) => k.kid === kid);
  }
  return key;
}

/** Returns the verified email claim, or null when the token is missing, forged, expired or foreign. */
export async function verifyAccessJwt(
  token: string,
  opts: { teamDomain: string; aud: string; now?: number; fetcher?: CertsFetcher },
): Promise<string | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const header = decodeJson<JwtHeader>(parts[0]);
  const claims = decodeJson<JwtClaims>(parts[1]);
  if (!header || !claims || header.alg !== "RS256" || !header.kid) return null;
  const now = opts.now ?? Date.now();
  const teamDomain = normalizeTeamDomain(opts.teamDomain);
  if (!claimsValid(claims, { teamDomain, aud: opts.aud, nowSeconds: Math.floor(now / 1000) })) return null;
  try {
    const jwk = await findKey(teamDomain, header.kid, opts.fetcher ?? defaultFetcher, now);
    if (!jwk) return null;
    const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
    const signed = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
    const ok = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, base64UrlDecode(parts[2]), signed);
    return ok && typeof claims.email === "string" ? claims.email : null;
  } catch (err) {
    console.warn("cf-access: verification error", err instanceof Error ? err.message : err);
    return null;
  }
}

/** Test hook: forget cached certs. */
export function clearAccessCertCache(): void {
  certCache.clear();
}
