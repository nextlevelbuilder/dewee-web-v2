/**
 * Signed, short-lived chat sessions. A token is `<expiry ms>.<HMAC-SHA256>` over
 * (session id, hashed visitor IP, expiry), keyed by the CHAT_SESSION_SECRET Worker secret.
 * The IP is only ever kept as a keyed hash, so tokens and counters never hold a raw address.
 */

const enc = new TextEncoder();

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

function toB64Url(bytes: ArrayBuffer): string {
  let s = "";
  for (const b of new Uint8Array(bytes)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64Url(text: string): Uint8Array<ArrayBuffer> | null {
  if (!/^[A-Za-z0-9_-]{16,128}$/.test(text)) return null;
  const bin = atob(text.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

/** Keyed hash of the visitor IP (hex, 32 chars). */
export async function hashIp(secret: string, ip: string): Promise<string> {
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(secret), enc.encode(`ip:${ip}`));
  return [...new Uint8Array(sig).slice(0, 16)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

const payload = (sid: string, ipHash: string, exp: number) => enc.encode(`chat:${sid}:${ipHash}:${exp}`);

export async function signChatSession(secret: string, sid: string, ipHash: string, exp: number): Promise<string> {
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(secret), payload(sid, ipHash, exp));
  return `${exp}.${toB64Url(sig)}`;
}

/** True when `token` was signed for this session id and IP hash and has not expired. */
export async function verifyChatSession(secret: string, token: string, sid: string, ipHash: string, now = Date.now()): Promise<boolean> {
  const [expText, sigText, extra] = token.split(".");
  if (extra !== undefined || !expText || !sigText || !/^\d{13}$/.test(expText)) return false;
  const exp = Number(expText);
  if (exp <= now) return false;
  const sig = fromB64Url(sigText);
  if (!sig) return false;
  return crypto.subtle.verify("HMAC", await hmacKey(secret), sig, payload(sid, ipHash, exp));
}

/** The visitor address Cloudflare saw. */
export function clientIp(request: Request): string {
  return request.headers.get("cf-connecting-ip") ?? "unknown";
}
