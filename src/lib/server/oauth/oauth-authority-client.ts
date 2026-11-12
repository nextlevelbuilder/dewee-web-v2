import { OAUTH_PATHS, oauthIssuer } from "./oauth-config";
import type { AuthorizeOutcome } from "./oauth-consent";
import type { WireOutcome } from "./oauth-authority";

export function oauthAuthority(env: Env) {
  return env.OAUTH_AUTHORITY?.getByName("content-mcp") ?? null;
}

export function authorityIssuer(env: Env, url?: URL): string | null {
  return env.OAUTH_AUTHORITY ? oauthIssuer(env, url) : null;
}

export function isOAuthRoute(path: string): boolean {
  return path === OAUTH_PATHS.resourceMetadata || path === OAUTH_PATHS.resourceMetadataRoot ||
    path === OAUTH_PATHS.asMetadata || path.startsWith(`${OAUTH_PATHS.asMetadata}/`) || path === OAUTH_PATHS.token;
}

export function fromWireOutcome(outcome: WireOutcome): AuthorizeOutcome {
  if (outcome.kind === "error") return outcome;
  return { ...outcome, headers: new Headers(outcome.headers.map(([name, value]) => [name, value] as [string, string])) };
}
