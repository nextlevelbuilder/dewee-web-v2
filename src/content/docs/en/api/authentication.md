---
title: Authentication
description: "How to authenticate to the dewee API: creating API keys, choosing scopes, sending them over HTTP and WebSocket, and handling expiry and revocation."
section: api
order: 2
updated: 2026-09-25
---

Every call to the runtime, except the health checks, carries a credential. For scripts, integrations and the CLI that credential is an **API key**: bound to one tenant, limited by scopes, and revocable at any time. This page explains how to create one and how to send it.

## Credentials at a glance

| Credential | Who uses it | Notes |
|---|---|---|
| API key | Scripts, integrations, CI, the CLI, MCP clients | Scoped, bound to a tenant, can expire. The one to use |
| Gateway token | The operator of a self-hosted runtime | Full admin access to the gateway. Keep it on the server and do not hand it to integrations |
| Webhook secret | Systems that call a webhook | Only valid on that webhook. See [Webhooks and MCP](/docs/api/webhooks-and-mcp) |

## Create an API key

**In the console**, open **API keys**, choose a preset and an expiry, and create the key. The presets are **Read**, **Read and write**, **MCP read** and **MCP read and write**; expiry can be 1 hour, 1 day, 30 days, 90 days or none. The key is shown once, so copy it into your secret manager straight away. Creating or rotating keys is limited to 20 per hour, and revoking to 30 per hour.

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
| `mcp.tools.read`, `mcp.tools.write` | The public MCP endpoint only | None outside `/mcp` |

A key gets the highest role its scopes allow. Keys with only MCP scopes are refused everywhere except `POST /mcp`, and they must be tied to an owner, the person whose agent access they use.

## Send the key

Over HTTP, send the key as a bearer token:

```http
GET /v1/agents HTTP/1.1
Host: dewee.example.com
Authorization: Bearer <api-key>
```

On the WebSocket, put it in the `token` field of the first `connect` request. Links to files and media can also carry a token in the `?token=` query parameter, for places where you cannot set a header.

Optional headers refine a request:

| Header | Purpose |
|---|---|
| `X-GoClaw-User-Id` | The end user the request is on behalf of, up to 255 characters |
| `X-GoClaw-Tenant-Id` | The tenant to act in, when the credential can reach more than one |
| `Accept-Language` | The language for messages and errors |

The `GoClaw` in these header names is the runtime's original name; use them exactly as shown.

## Check a key

`GET /v1/auth/token/status` tells you whether a key or token is valid, which is a quick way to test a new integration. From the terminal, any read command does the same:

```bash
DEWEE_SERVER=https://dewee.example.com DEWEE_API_KEY=<api-key> dewee agent list --json
```

## Expiry, revocation and tenant changes

- An expired or revoked key is refused from the next request on.
- Open WebSocket sessions are re-checked before each operation. If the key is revoked or expires, or the tenant is suspended, the session receives `TENANT_ACCESS_REVOKED`. Scope changes update the session's role.
- Revoke a key in the console, with `dewee api-keys revoke`, or with `POST /v1/api-keys/{id}/revoke`. Revocation cannot be undone.

> [!TIP]
> Give each integration its own key with the narrowest scopes it needs and an expiry. When something goes wrong, you can revoke one key without breaking the others.

## Common errors

| Status | Meaning |
|---|---|
| `401` | Missing, unknown, expired or revoked credential |
| `403` | The key is valid but its scopes do not allow the operation, for example writing with a Read key |
| `409` | In the console, the workspace has not finished provisioning, so keys cannot be created yet |
| `429` | Too many requests; wait for the time in `Retry-After` |
