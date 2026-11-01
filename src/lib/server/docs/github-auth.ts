/**
 * Credentials for the docs repository. Preferred: a GitHub App installation token, minted per
 * request batch and narrowed to the one repository with `contents:write` + `pull_requests:write`.
 * Fallback: a fine-grained token (`DOCS_GITHUB_TOKEN`) limited to the same repository and rights.
 * The repository and base branch come from worker vars, never from the caller. Secrets stay in
 * this module: nothing here is logged or returned to MCP callers.
 */
import type { PlatformEnv } from "../api/platform-env";

export type DocsRepoConfig = {
  owner: string;
  repo: string;
  /** Branch that proposals target (pull requests go into it). */
  base: string;
  token: () => Promise<string>;
};

const REPO_RE = /^([A-Za-z0-9-]{1,39})\/([A-Za-z0-9._-]{1,100})$/;
const BRANCH_RE = /^[A-Za-z0-9._/-]{1,100}$/;
export const GITHUB_API = "https://api.github.com";
export const GITHUB_HEADERS = { accept: "application/vnd.github+json", "x-github-api-version": "2022-11-28", "user-agent": "dewee-web-docs" } as const;

const b64url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const textB64url = (s: string) => b64url(new TextEncoder().encode(s));

function derLength(n: number): number[] {
  if (n < 0x80) return [n];
  const out: number[] = [];
  for (let v = n; v > 0; v >>= 8) out.unshift(v & 0xff);
  return [0x80 | out.length, ...out];
}

/** GitHub hands out PKCS#1 keys ("BEGIN RSA PRIVATE KEY"); WebCrypto imports PKCS#8 only, so wrap it. */
export function pemToPkcs8(pem: string): Uint8Array<ArrayBuffer> {
  const pkcs1 = /BEGIN RSA PRIVATE KEY/.test(pem);
  const b64 = pem.replace(/-----[^-]+-----/g, "").replace(/\\n/g, "").replace(/\s+/g, "");
  const der = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  if (!pkcs1) return der;
  const algorithm = [0x30, 0x0d, 0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01, 0x05, 0x00];
  const octet = [0x04, ...derLength(der.length)];
  const inner = [0x02, 0x01, 0x00, ...algorithm, ...octet];
  return Uint8Array.from([0x30, ...derLength(inner.length + der.length), ...inner, ...der]);
}

export async function appJwt(appId: string, privateKeyPem: string, nowSec = Math.floor(Date.now() / 1000)): Promise<string> {
  const key = await crypto.subtle.importKey("pkcs8", pemToPkcs8(privateKeyPem), { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  // iat is backdated a minute for clock drift; GitHub caps exp at ten minutes.
  const unsigned = `${textB64url(JSON.stringify({ alg: "RS256", typ: "JWT" }))}.${textB64url(JSON.stringify({ iat: nowSec - 60, exp: nowSec + 540, iss: appId }))}`;
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(unsigned));
  return `${unsigned}.${b64url(new Uint8Array(sig))}`;
}

let cached: { cacheKey: string; token: string; expiresAt: number } | null = null;

/** Installation token scoped to one repository; reused until five minutes before it expires. */
async function installationToken(appId: string, installationId: string, pem: string, repo: string): Promise<string> {
  const cacheKey = `${appId}:${installationId}:${repo}`;
  if (cached && cached.cacheKey === cacheKey && cached.expiresAt - 300_000 > Date.now()) return cached.token;
  const res = await fetch(`${GITHUB_API}/app/installations/${encodeURIComponent(installationId)}/access_tokens`, {
    method: "POST",
    headers: { ...GITHUB_HEADERS, authorization: `Bearer ${await appJwt(appId, pem)}`, "content-type": "application/json" },
    body: JSON.stringify({ repositories: [repo], permissions: { contents: "write", pull_requests: "write" } }),
  });
  if (!res.ok) throw new Error(`GitHub App token request failed with HTTP ${res.status}`);
  const data = (await res.json()) as { token: string; expires_at: string };
  cached = { cacheKey, token: data.token, expiresAt: Date.parse(data.expires_at) || Date.now() + 3_000_000 };
  return data.token;
}

export function resetTokenCache(): void {
  cached = null;
}

/** Null when this deployment has no docs repository credentials (the tools then explain that). */
export function docsRepoConfig(env: PlatformEnv): DocsRepoConfig | null {
  const m = REPO_RE.exec(env.DOCS_GITHUB_REPO ?? "");
  const base = env.DOCS_GITHUB_BASE || "dev";
  if (!m || !BRANCH_RE.test(base)) return null;
  const [, owner, repo] = m;
  const { DOCS_GITHUB_APP_ID: appId, DOCS_GITHUB_APP_INSTALLATION_ID: installationId, DOCS_GITHUB_APP_PRIVATE_KEY: pem, DOCS_GITHUB_TOKEN: pat } = env;
  if (appId && installationId && pem) return { owner, repo, base, token: () => installationToken(appId, installationId, pem, repo) };
  if (pat) return { owner, repo, base, token: async () => pat };
  return null;
}
