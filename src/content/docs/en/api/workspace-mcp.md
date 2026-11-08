---
title: Workspace MCP
description: Connect Claude Code, Cursor, VS Code, ChatGPT or Gemini CLI to /mcp/workspace with Dewee sign-in, read agents, workflows and schedules, and toggle a schedule.
section: api
order: 4
updated: 2026-11-08
---

The workspace MCP endpoint, `/mcp/workspace`, lets an AI client manage a workspace **as you**: list agents, workflows and schedules, check usage and health, and switch a schedule on or off. It is a different endpoint from the [public MCP server](/docs/api/webhooks-and-mcp#the-public-mcp-server) at `/mcp/server`, where a client acts as one agent with an MCP API key. Here there is no agent and no API key: you sign in with your Dewee account and approve the client on a consent page.

> [!WARNING]
> The endpoint shipped in dewee v3.47.0, is **off by default** and is **not yet approved for production**. It is being tested on staging first. Until an operator enables it for your workspace, `/mcp/workspace` answers `404` and the steps below do not work.

## Before you start

An operator enables the endpoint, OAuth and reads for the environment. Eligible existing and newly provisioned workspaces can then connect; users still sign in and grant consent. A configured workspace list restricts availability, and an explicitly empty list denies all workspaces. Configure and elevated operations remain separately controlled:

| Setting | Env variable | Effect |
|---|---|---|
| `tools.mcp.workspace.enabled` | `GOCLAW_MCP_WORKSPACE_ENABLED` | Master switch. Off: the route does not exist and answers `404` |
| `tools.mcp.workspace.read` | `GOCLAW_MCP_WORKSPACE_READ` | Serves the read tools |
| `tools.mcp.workspace.config_write` | `GOCLAW_MCP_WORKSPACE_CONFIG_WRITE` | Controls configuration writes |
| `tools.mcp.workspace.oauth` | `GOCLAW_MCP_WORKSPACE_OAUTH` | Accepts Dewee sign-in tokens. Off: the route stays but refuses every credential with `401` |
| `tools.mcp.workspace.resource_origin` | `GOCLAW_MCP_WORKSPACE_RESOURCE_ORIGIN` | The gateway's public origin, set explicitly. Required when the endpoint is on; it is never guessed from request headers |
| `tools.mcp.workspace.tenants` | `GOCLAW_MCP_WORKSPACE_TENANTS` | Optional workspace allowlist. An omitted list admits eligible workspaces for reads; an explicitly empty list admits none |

The `privileged_write` switch separately controls privileged actions. Enabling read access does not enable configuration writes or privileged actions; each keeps its own admission and approval requirements.

With `oauth` on, the gateway refuses to start unless the Dewee sign-in issuer and its keys (`GOCLAW_MCP_PUBLIC_OAUTH_ISSUER`, `GOCLAW_MCP_PUBLIC_OAUTH_JWKS_URI`), a gateway token and the PostgreSQL grant registry (migration `000178` or later) are in place. The Lite edition has no grant registry, so it cannot serve this endpoint.

To connect, you need a member account in an enabled workspace with permission to manage API access there; otherwise the consent page says you cannot connect apps to that workspace.

## Connect a client

The address is your gateway's public origin followed by `/mcp/workspace`, for example `https://dewee.example.com/mcp/workspace`. Add it to your client as a remote (HTTP) MCP server without any key or header. On the first request the gateway answers `401` and points the client at `/.well-known/oauth-protected-resource/mcp/workspace`; from there the client finds Dewee's sign-in and opens it in your browser.

On the consent page, pick the workspace and choose what the client may do:

- **See the workspace** (`workspace.read`) is always included.
- **Also change the workspace's configuration** (`workspace.configure`) is off unless you tick it. Leave it off unless you want the client to make changes.

Dewee does not offer dynamic client registration. A client identifies itself with a Client ID Metadata Document, the newer OAuth method for MCP clients, or with a client id the operator registered for it. A client that can only register dynamically cannot sign in.

### Claude Code

```bash
claude mcp add --transport http dewee-workspace https://dewee.example.com/mcp/workspace
```

Then run `/mcp` in Claude Code, select `dewee-workspace` and authenticate.

### Cursor

In `~/.cursor/mcp.json` (or `.cursor/mcp.json` in a project):

```json
{
  "mcpServers": {
    "dewee-workspace": {
      "url": "https://dewee.example.com/mcp/workspace"
    }
  }
}
```

Cursor shows a sign-in prompt for the server in its MCP settings.

### VS Code

In `.vscode/mcp.json`:

```json
{
  "servers": {
    "dewee-workspace": {
      "type": "http",
      "url": "https://dewee.example.com/mcp/workspace"
    }
  }
}
```

Start the server from the file or from the MCP server list, and VS Code asks you to sign in.

### Gemini CLI

In `~/.gemini/settings.json`:

```json
{
  "mcpServers": {
    "dewee-workspace": {
      "httpUrl": "https://dewee.example.com/mcp/workspace"
    }
  }
}
```

Gemini CLI starts sign-in when the server answers `401`; you can also run `/mcp auth dewee-workspace`.

### ChatGPT

Create a custom connector in ChatGPT's settings (it needs developer mode), give it the endpoint address and choose OAuth as the authentication. ChatGPT connects from the internet, so the origin must be publicly reachable; a gateway on a private network will not work.

> [!NOTE]
> Menu names and sign-in support change between client versions. If a client cannot sign in, check that its version supports OAuth for remote MCP servers with a Client ID Metadata Document.

## What the client can see

The token lasts 5 minutes and the client refreshes it on its own. It carries the permissions (`customer.*` scopes) your role gives you when the token is issued, and they are read again at every refresh, so a change applies within 5 minutes. A removal from the workspace or a lower role is refused on the next request. `tools/list` shows only the tools that the gateway serves, your connection's consent covers and your permissions allow.

| Tool | Returns | Needs |
|---|---|---|
| `agents_list` | Active agents you can use: your own, defaults and agents shared with you (key, name, model, provider, type, status) | `customer.agents.manage` |
| `agents_links_list` | The delegation links of an agent you can access (`agentId`, optional `direction`: `from`, `to` or `all`) | `customer.agents.manage` |
| `cron_list` | Your own schedules, without their bound credentials (`includeDisabled` to add disabled ones) | `customer.tasks.manage` |
| `workflows_list` | The workspace's workflows, filtered by `enabled` or `query`, with `limit` and `offset` | `customer.tasks.manage` |
| `workflows_get` | One workflow by `id` or `slug`, including its draft | `customer.tasks.manage` |
| `workflows_node_types` | The workflow node types the gateway supports, with their settings | `customer.tasks.manage` |
| `channels_list` | The names and types of the workspace's channels | `customer.integrations.manage` |
| `channels_writers_read`, `channels_writers_write` | List, test, add or remove group writers; each call requires approval, and writes require an owner or admin | `customer.integrations.manage` |
| `quota_usage` | Today's requests, tokens and cost for the workspace, with the busiest users' counts | `customer.observability.read` |
| `workspace_setup_readiness_read` | Workspace health: a verified model provider, the Super Agent, running channels, pending approvals, and how to fix each failed check | `customer.observability.read` |

Each tool runs through the same checks as the console, as you. Objects of other workspaces are never returned; another workspace's workflow id is `NOT_FOUND`.

Each operation enforces the signed-in user's current workspace role and permissions. Elevated tools can require an owner or admin and separate approval; read access alone does not grant those operations.

Arguments are checked against each tool's schema. An argument the tool does not list, such as `cron_list`'s admin-only `createdVia`, is refused with `invalid_arguments` before anything runs.

`cron_list` returns up to 20 jobs by default; the maximum requested limit is 100. Its result contains `jobs`, `hasMore` and `nextCursor`. Continue with that cursor and the same filters, or omit it to restart. Empty or invalid cursors are errors. Cursors mark a position, not a snapshot: start a fresh traversal to see newly inserted newer jobs.

When workflow configuration writes are enabled, `workflows_update` can replace a draft. Read `updated_at` with `workflows_get` and pass its full value as `expected_version` to prevent overwriting a concurrent edit. A stale version returns `VERSION_CONFLICT`; read the workflow again and reconcile the changes. Updating requires a workspace owner or admin and approval from another owner or admin; repeat the identical call with the approved `approval_id`. See [Workflows](/docs/concepts/workflows) for timestamp precision and the CLI, HTTP and WebSocket equivalents.

`cron_status`, `cron_runs` and `hooks_list` are not available.

### Connected browsers

The following tools require a gateway and control plane that include the connected-browser MCP update; check `tools/list` for availability. The connection receives `customer.browser.manage` for these operations without raising its general role. Only your own browsers and their grants are visible, even to a workspace owner or admin; another person's ID returns `NOT_FOUND`.

| Tool | Use |
|---|---|
| `browser_devices_list` | List your connected browsers and their online and control state |
| `browser_grants_list` | List active grants for one browser, including a shared tab when present |
| `browser_devices_rename` | Rename your browser; `validate_only` previews the trimmed name |
| `browser_devices_revoke` | Revoke your browser, its grants and live connection |
| `browser_grants_revoke` | Revoke one grant and cancel commands running under it |

Rename is a configuration operation; the two revocations are destructive operations. The first revoke call opens a human approval; another workspace owner or admin must approve it, then the caller repeats the same request with `approval_id`. If there is no second owner or admin, revoke in the extension or with `dewee browser devices revoke` or `dewee browser grants revoke` instead. Expired or already-revoked grants and revoked browsers return `NOT_FOUND` on the MCP revoke precheck; the CLI treats those inactive records as already revoked. Enrollment, connection and grant creation remain in the extension.

## Change a schedule

`cron_toggle` switches one of your schedules on or off. It needs both the `config_write` switch on the gateway and the `workspace.configure` consent on your connection.

| Argument | Meaning |
|---|---|
| `jobId` | Required. The schedule id from `cron_list` |
| `enabled` | Required. `true` to switch the schedule on, `false` to switch it off |
| `expected_version` | Optional. The schedule's `updatedAtMs` from `cron_list`, as a string. The change is refused if the schedule moved since you read it |
| `validate_only` | Optional. Preview the change without making it |
| `idempotency_key` | Optional, 8 to 128 characters. A retry with the same key and arguments returns the first result instead of switching again |

A safe first write reads, previews, then writes:

1. Call `cron_list` and note the schedule's `id` and `updatedAtMs`.
2. Call `cron_toggle` with `{"jobId": "<id>", "enabled": false, "expected_version": "<updatedAtMs>", "validate_only": true}`. The answer shows `enabled` from and to and the current `version`; nothing changes.
3. Call it again without `validate_only` and with an `idempotency_key`. The answer includes `previousEnabled`, and the change is written to the workspace audit log as `cron.toggled`.

The version is checked just before the switch, not in the same step, and a schedule's own runs also move `updatedAtMs`. If you get `VERSION_CONFLICT`, read the schedule again and retry with the new version.

| Error | Meaning |
|---|---|
| `VERSION_CONFLICT` | The schedule changed since you read it |
| `IDEMPOTENCY_KEY_REUSED` | The key was used before with other arguments |
| `IDEMPOTENCY_IN_PROGRESS` | A call with this key is still running |
| `NOT_FOUND` | No schedule with that id in your own list, including another member's schedule |
| `UNAVAILABLE` | The gateway cannot store the idempotency key right now |

Errors come back as tool errors that contain only the code; an unexpected failure is `operation_failed`. A tool your connection may not call is answered as an unknown tool.

## Disconnect a client

A workspace member with permission to manage API access can disconnect any connected app from the workspace's MCP connection settings in the Dewee app. The client's refresh token stops working at once and its access token is refused on the next request, because the gateway re-reads the grant every time. A client can also revoke its own token at Dewee's OAuth revocation endpoint.

To cut off every client at once, an operator removes the workspace from `tools.mcp.workspace.tenants` or turns the endpoint off.

## Errors and limits

| Status | Code | Meaning |
|---|---|---|
| `401` | `workspace_credential_rejected` | Not a Dewee sign-in token for this endpoint. MCP API keys, the gateway token, console sessions and `/mcp/server` tokens are all refused here |
| `401` | `workspace_membership_revoked` | You are no longer a member of the workspace |
| `401` | `workspace_tenant_inactive` | The workspace is inactive or gone |
| `403` | `workspace_tenant_not_enabled` | The workspace is not on the endpoint's allowlist |
| `429` | `rate_limited`, `too_many_concurrent_calls`, `tenant_rate_limited`, `tenant_too_many_concurrent_calls` | Over the limits below; the `tenant_` codes mean the whole workspace is over its budget. Wait for `Retry-After` |
| `503` | `workspace_oauth_verifier_unavailable` | The gateway cannot check tokens right now; retry later |

The endpoint uses the same limit settings as `/mcp/server` (requests per minute, concurrent tool calls, call timeout and body size) but keeps its own budget for each connection, so traffic on one endpoint never spends the other's. The [workspace budget](/docs/api/webhooks-and-mcp#limits-quota-and-revocation) that all connections of a workspace share applies here too, counted separately from `/mcp/server`. Neither endpoint accepts the other's tokens.

The gateway logs every call with the operation, outcome, workspace, user, client id and token id, never the arguments, the results or the token.
