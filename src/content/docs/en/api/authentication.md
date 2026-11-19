---
title: Authentication
description: "How to authenticate to the dewee API: creating API keys, choosing scopes, sending them over HTTP and WebSocket, and handling expiry and revocation."
section: api
order: 2
updated: 2026-11-08
---

Every call to the runtime, except the health checks, carries a credential. For scripts, integrations and the CLI that credential is an **API key**: bound to one tenant, limited by scopes, and revocable at any time. This page explains how to create one and how to send it.

## Credentials at a glance

| Credential | Who uses it | Notes |
|---|---|---|
| API key | Scripts, integrations, CI, the CLI, MCP clients | Scoped, bound to a tenant, can expire. The one to use |
| Gateway token | The operator of a self-hosted runtime | Full admin access to the gateway. Keep it on the server and do not hand it to integrations |
| Webhook secret | Systems that call a webhook | Only valid on that webhook. See [Webhooks and MCP](/docs/api/webhooks-and-mcp) |

A gateway bound to a loopback address without a gateway token asks for no credential at all, which is meant for local development. Behind a reverse proxy on the same host, set `GOCLAW_REQUIRE_AUTH=1` so every caller must authenticate; see [Install and run the gateway](/docs/runtime/install-and-run#behind-a-reverse-proxy-on-the-same-host).

## Create an API key

**In the console**, open **API keys & docs**, select **Create key**, choose the **Access** level and an expiry, and create the key. The levels are **Read**, **Read and write**, **MCP read** and **MCP read and write**; expiry can be 1 hour, 1 day, 30 days, 90 days or none. The key is shown once, so copy it into your secret manager straight away. Creating or rotating keys is limited to 20 per hour, and revoking to 30 per hour.

**With the CLI**, an admin can create a key with explicit scopes:

```bash
dewee api-keys create --name "ci-deploy" --scopes operator.read,operator.write
```

**Over HTTP**, send `POST /v1/api-keys` with a `name`, a list of `scopes` and, optionally, `expires_in` in seconds. Managing keys requires admin access.

Keys look like `goclaw_` followed by 32 hexadecimal characters. The runtime stores only a SHA-256 hash, so a lost key cannot be recovered, only replaced.

## Scopes

| Scope | Grants | Resulting role |
|---|---|---|
| `operator.read` | Read access | Viewer |
| `operator.write` | Read and write access for day-to-day work | Operator |
| `operator.approvals` | Approving held commands | Operator |
| `operator.pairing` | Managing paired browser devices | Operator |
| `operator.admin` | Everything, including API keys and system configuration | Admin |
| `mcp.tools.read`, `mcp.tools.write` | The public MCP endpoint only | None outside `/mcp/server` |

A key gets the highest role its scopes allow. Keys with only MCP scopes are refused everywhere except `POST /mcp/server`, and they must be tied to an owner, the person whose agent access they use.

## Send the key

Over HTTP, send the key as a bearer token:

```http
GET /v1/agents HTTP/1.1
Host: dewee.example.com
Authorization: Bearer <api-key>
```

On the WebSocket, put it in the `token` field of the first `connect` request. If you send `connect` again on the same socket, the new credential replaces the old one completely, and a `connect` that fails leaves the socket signed out. Links to files and media can also carry a token in the `?token=` query parameter, for places where you cannot set a header.

Optional headers refine a request:

| Header | Purpose |
|---|---|
| `X-GoClaw-User-Id` | The end user the request is on behalf of, up to 255 characters |
| `X-GoClaw-Tenant-Id` | The tenant to act in, when the credential can reach more than one |
| `Accept-Language` | The language for messages and errors |

The `GoClaw` in these header names is the runtime's original name; use them exactly as shown.

`X-GoClaw-User-Id` only says whose data the request works on. It never changes what the key may do: on a key without an owner, naming the workspace owner or an admin does not give the request their role. The key keeps the role its scopes allow, inside its own tenant. To act with an owner's or admin's role, use a key tied to that person.

For tenant administration, owner-bound API keys and customer sessions use their bound owner; a customer session also needs the endpoint's required scope. A caller-supplied user header cannot give an ownerless key tenant-admin authority. Gateway-token administration and global or tenant scope are separate checks.

## Check a key

`GET /v1/auth/token/status` tells you whether a key or token is valid, which is a quick way to test a new integration. From the terminal, any read command does the same:

```bash
DEWEE_SERVER=https://dewee.example.com DEWEE_API_KEY=<api-key> dewee agent list --json
```

## Expiry, revocation and tenant changes

- An expired or revoked key is refused from the next request on.
- Open WebSocket sessions are re-checked before each operation. If the key is revoked or expires, or the tenant is suspended, the session receives `TENANT_ACCESS_REVOKED`. Scope changes update the session's role.
- Revoke a key in the console, with `dewee api-keys revoke`, or with `POST /v1/api-keys/{id}/revoke`. Revocation cannot be undone.

For SQLite installations, the upgrade preserves the instant of legacy key expiry and previous-secret grace times created on non-UTC hosts. It does not change key scopes. Back up before upgrading and use the documented backup procedure for rollback; see [Install and run](/docs/runtime/install-and-run#backups-and-restores).

> [!TIP]
> Give each integration its own key with the narrowest scopes it needs and an expiry. When something goes wrong, you can revoke one key without breaking the others.

## Identity test journeys and Connect links

Where identity test mode is enabled on a development build, use a simulated test user for both session exchange and Connect handoff or OIDC verification. Real subjects are refused in test mode; use an application with test mode disabled for real-user testing. If a Connect link expires, start the connection flow again. Cleanup timing does not change that recovery.

## Common errors

| Status | Meaning |
|---|---|
| `401` | Missing, unknown, expired or revoked credential |
| `403` | The key is valid but its scopes do not allow the operation, for example writing with a Read key |
| `409` | In the console, the workspace has not finished provisioning, so keys cannot be created yet |
| `429` | Too many requests; wait for the time in `Retry-After`. On the MCP endpoints, a `tenant_` error code means the whole workspace is over its budget, not just your key; see [Limits, quota and revocation](/docs/api/webhooks-and-mcp#limits-quota-and-revocation) |
