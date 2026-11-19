import { DurableObject } from "cloudflare:workers";
import { OAuthAuthorityCore } from "./oauth-authority-core";
import { OAuthDurableStorage } from "./oauth-durable-storage";
import type { AuthorizeOutcome } from "./oauth-consent";

type ConsentInput = { email: string; handle: string; decision: string; scopes: readonly string[] };
export type WireOutcome =
  | { kind: "redirect"; location: string; headers: string[][] }
  | { kind: "consent"; view: Extract<AuthorizeOutcome, { kind: "consent" }>["view"]; headers: string[][] }
  | Extract<AuthorizeOutcome, { kind: "error" }>;

function wireOutcome(outcome: AuthorizeOutcome): WireOutcome {
  if (outcome.kind === "error") return outcome;
  const headers: [string, string][] = [];
  outcome.headers?.forEach((value, name) => {
    if (name !== "set-cookie") headers.push([name, value]);
  });
  for (const cookie of outcome.headers?.getSetCookie() ?? []) headers.push(["set-cookie", cookie]);
  return { ...outcome, headers };
}

/**
 * One object owns the website OAuth store. Provider operations for each owner
 * are sequenced by the core; the stored grant/token records are never read from
 * eventually consistent Workers KV.
 */
export class OAuthAuthority extends DurableObject<Env> {
  private readonly store: OAuthDurableStorage;
  private readonly core: OAuthAuthorityCore;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.store = new OAuthDurableStorage(ctx.storage);
    this.core = new OAuthAuthorityCore({
      ...env,
      OAUTH_KV: this.store as unknown as KVNamespace,
    });
  }

  async begin(request: Request): Promise<WireOutcome> {
    return wireOutcome(await this.core.begin(request));
  }

  async finish(request: Request, input: ConsentInput): Promise<WireOutcome> {
    return wireOutcome(await this.core.finish(request, input));
  }

  async route(request: Request): Promise<Response | null> {
    return this.core.route(request, this.ctx as unknown as ExecutionContext);
  }

  async validate(url: string, token: string) {
    return this.core.validate(url, token);
  }

  async list(emails: string[]) {
    return this.core.list(emails);
  }

  async revoke(email: string, grantId: string): Promise<void> {
    await this.core.revoke(email, grantId);
  }

  async purge(): Promise<void> {
    await this.store.purgeExpired();
  }
}
