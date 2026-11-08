import { isSuperAdmin, normalizeEmail } from "../auth/allowlist";
import { rateLimit } from "../auth/rate-limit";
import { beginAuthorize, finishAuthorize } from "./oauth-consent";
import { emailFromUserId, oauthUserId } from "./oauth-config";
import {
  handleOAuthRoute,
  listConnectedApps,
  oauthApi,
  validateMcpAccessToken,
  type OAuthEnv,
} from "./oauth-server";
import { OAuthOperationQueue } from "./oauth-operation-queue";

type ConsentInput = { email: string; handle: string; decision: string; scopes: readonly unknown[] };

async function readTokenForm(request: Request): Promise<URLSearchParams | null> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/x-www-form-urlencoded")) return null;
  const reader = request.clone().body?.getReader();
  if (!reader) return null;
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 16_384) {
      void reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const text = new TextDecoder().decode(Uint8Array.from(chunks.flatMap((chunk) => [...chunk])));
  return new URLSearchParams(text);
}

/**
 * Runs provider operations against one strongly consistent storage authority.
 * The caller must ensure every operation for this issuer reaches the same object.
 */
export class OAuthAuthorityCore {
  private readonly queue = new OAuthOperationQueue();

  constructor(private readonly env: OAuthEnv & { OAUTH_KV: KVNamespace; DB: D1Database }) {}

  async begin(request: Request) {
    const api = oauthApi(this.env, new URL(request.url));
    if (!api) throw new Error("OAuth authority is not configured");
    return beginAuthorize(api, request);
  }

  async finish(request: Request, input: ConsentInput) {
    const email = normalizeEmail(input.email);
    if (!isSuperAdmin(email) || !input.handle || input.handle.length > 512) {
      return { kind: "error", status: 400, reason: "expired" } as const;
    }
    const api = oauthApi(this.env, new URL(request.url));
    if (!api) throw new Error("OAuth authority is not configured");
    // One handle can be submitted from more than one signed-in account in a
    // shared browser. Lock it first, then the owner, in the same order always.
    return this.queue.run(`consent:${input.handle}`, () =>
      this.queue.run(`owner:${oauthUserId(email)}`, () =>
        finishAuthorize(api, this.env.DB, request, { ...input, email }),
      ),
    );
  }

  async route(request: Request, ctx: ExecutionContext) {
    if (request.method !== "POST" || new URL(request.url).pathname !== "/oauth/token") {
      return handleOAuthRoute(request, this.env, ctx);
    }
    const invalid = () => new Response(JSON.stringify({ error: "invalid_grant" }), {
      status: 400, headers: { "content-type": "application/json", "cache-control": "no-store" },
    });
    const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
    const { ok } = await rateLimit(this.env.KV, `oauth-token-ip:${ip}`, 60, 60);
    if (!ok) return new Response(JSON.stringify({ error: "slow_down" }), {
      status: 429, headers: { "content-type": "application/json", "cache-control": "no-store", "retry-after": "60" },
    });
    // Only requests naming a real grant may enter that owner's queue. A client
    // id supplied in the form must match; the provider also supports deriving
    // it from HTTP Basic credentials or a signed client assertion.
    let form: URLSearchParams | null;
    try {
      form = await readTokenForm(request);
    } catch {
      return invalid();
    }
    if (!form) return invalid();
    const type = form.get("grant_type");
    const credential = type === "authorization_code" ? form.get("code")
      : type === "refresh_token" ? form.get("refresh_token") : null;
    const client = form.get("client_id");
    if (typeof credential !== "string" || credential.length > 1024) {
      return invalid();
    }
    const parts = credential.split(":");
    const [owner, grantId] = parts;
    const email = emailFromUserId(owner);
    if (parts.length !== 3 || !isSuperAdmin(email) || owner !== oauthUserId(email) || !/^[A-Za-z0-9_-]{1,128}$/.test(grantId)) {
      return invalid();
    }
    const grant = await this.env.OAUTH_KV.get<{ clientId?: string }>(`grant:${owner}:${grantId}`, "json");
    if (!grant || (client !== null && grant.clientId !== client)) return invalid();
    return this.queue.run(`owner:${owner}`, () => handleOAuthRoute(request, this.env, ctx, { skipTokenRateLimit: true }));
  }

  async validate(url: string, token: string) {
    const parts = token.split(":");
    const [owner, grantId] = parts;
    const email = emailFromUserId(owner);
    if (token.length > 1024 || parts.length !== 3 || !isSuperAdmin(email) ||
      owner !== oauthUserId(email) || !/^[A-Za-z0-9_-]{1,128}$/.test(grantId)) return null;
    if (!(await this.env.OAUTH_KV.get(`grant:${owner}:${grantId}`))) return null;
    return this.queue.run(`owner:${owner}`, () => validateMcpAccessToken(this.env, new URL(url), token));
  }

  async list(emails: readonly string[]) {
    const api = oauthApi(this.env);
    if (!api) throw new Error("OAuth authority is not configured");
    const pages = await Promise.all([...new Set(emails.map(normalizeEmail).filter(isSuperAdmin))].map((email) =>
      this.queue.run(`owner:${oauthUserId(email)}`, () => listConnectedApps(api, [email])),
    ));
    return pages.flat().sort((a, b) => b.createdAt - a.createdAt);
  }

  async revoke(email: string, grantId: string) {
    email = normalizeEmail(email);
    if (!isSuperAdmin(email) || !/^[A-Za-z0-9_-]{1,128}$/.test(grantId)) throw new Error("Invalid grant");
    const api = oauthApi(this.env);
    if (!api) throw new Error("OAuth authority is not configured");
    await this.queue.run(`owner:${oauthUserId(email)}`, () => api.revokeGrant(grantId, oauthUserId(email)));
  }
}
