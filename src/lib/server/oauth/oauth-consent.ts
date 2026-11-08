/**
 * The authorize endpoint's logic, kept out of the .astro page so it can be tested. GET validates
 * the request (client, exact redirect URI, PKCE S256, resource) and returns what the consent page
 * must show; POST approves or denies. The library binds the consent form to this browser with a
 * one-time handle and a `__Host-` cookie; the admin CSRF check runs on top of that.
 */
import { AuthorizationError, CimdFetchError, type OAuthHelpers } from "@cloudflare/workers-oauth-provider";
import { audit } from "../auth/audit-log";
import { consentDefaults, grantableScopes, oauthUserId } from "./oauth-config";
import type { GrantMetadata, OAuthProps } from "./oauth-server";

export type ConsentView = {
  handle: string;
  clientName: string;
  clientDomain: string | null;
  redirectHost: string;
  redirectIsLoopback: boolean;
  scopes: ReturnType<typeof consentDefaults>;
};

export type AuthorizeOutcome =
  | { kind: "redirect"; location: string; headers?: Headers }
  | { kind: "consent"; view: ConsentView; headers: Headers }
  | { kind: "error"; status: number; reason: "bad_request" | "client_unverified" | "expired" | "no_scope" };

/** Turns library errors into an outcome. Only a validated redirect URI is ever redirected to. */
function failure(err: unknown): AuthorizeOutcome {
  if (err instanceof AuthorizationError) {
    if (err.redirectTo) return { kind: "redirect", location: err.redirectTo };
    return { kind: "error", status: 400, reason: "bad_request" };
  }
  if (err instanceof CimdFetchError) return { kind: "error", status: 400, reason: "client_unverified" };
  throw err;
}

/** GET: validate the authorization request and describe it for the consent page. */
export async function beginAuthorize(api: OAuthHelpers, request: Request): Promise<AuthorizeOutcome> {
  try {
    const authRequest = await api.parseAuthRequest(request);
    const details = await api.describeConsent(authRequest);
    const consent = await api.beginConsent(authRequest);
    return {
      kind: "consent",
      headers: consent.headers,
      view: {
        handle: consent.handle,
        clientName: details.clientName,
        clientDomain: details.clientDomain ?? null,
        redirectHost: details.redirectHost,
        redirectIsLoopback: details.redirectIsLoopback,
        scopes: consentDefaults(details.scope),
      },
    };
  } catch (err) {
    return failure(err);
  }
}

/**
 * POST: the admin chose Allow (with the ticked scopes) or Deny. Allow stores a grant for this
 * admin with exactly the ticked scopes and redirects to the client with the code; Deny redirects
 * with `access_denied`. Both are written to the audit log.
 */
export async function finishAuthorize(
  api: OAuthHelpers,
  db: D1Database,
  request: Request,
  input: { email: string; handle: string; decision: string; scopes: readonly unknown[] },
): Promise<AuthorizeOutcome> {
  try {
    if (input.decision !== "approve") {
      const denied = await api.denyConsent(request, input.handle);
      await audit(db, input.email, "oauth.deny", denied.request.clientId.slice(0, 300));
      return { kind: "redirect", location: denied.redirectTo, headers: denied.headers };
    }
    const scope = grantableScopes(input.scopes);
    // Checked before the handle is consumed, so the admin can still tick a box and try again.
    if (scope.length === 0) return { kind: "error", status: 400, reason: "no_scope" };
    const approved = await api.approveConsent(request, input.handle, { scope });
    const details = await api.describeConsent(approved.request);
    const metadata: GrantMetadata = { clientName: details.clientName.slice(0, 120), clientDomain: details.clientDomain ?? null, redirectHost: details.redirectHost.slice(0, 200) };
    const props: OAuthProps = { email: input.email };
    // The provider treats failures while replacing old grants as best effort.
    // Revoke matching grants first and propagate errors so a successful consent
    // never leaves an earlier, potentially broader authorization active.
    const userId = oauthUserId(input.email);
    const previous: string[] = [];
    let cursor: string | undefined;
    do {
      const page = await api.listUserGrants(userId, { limit: 100, cursor });
      previous.push(...page.items.filter((grant) =>
        grant.clientId === approved.request.clientId && grant.redirectUri === approved.request.redirectUri,
      ).map((grant) => grant.id));
      cursor = page.cursor;
    } while (cursor);
    for (const grantId of previous) await api.revokeGrant(grantId, userId);
    const { redirectTo } = await api.completeAuthorization({
      request: approved.request,
      userId,
      metadata,
      scope: approved.request.scope,
      props,
      revokeExistingGrants: false,
    });
    await audit(db, input.email, "oauth.grant", approved.request.clientId.slice(0, 300), { scopes: approved.request.scope, client: metadata });
    return { kind: "redirect", location: redirectTo, headers: approved.headers };
  } catch (err) {
    if (err instanceof AuthorizationError && !err.redirectTo) return { kind: "error", status: 400, reason: "expired" };
    return failure(err);
  }
}
