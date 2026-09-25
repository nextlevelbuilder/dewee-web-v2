---
title: Multi-tenant isolation
description: How dewee keeps each tenant's agents, sessions, memory and credentials apart, how a request finds its tenant, and how tenant data is backed up or moved.
section: concepts
order: 2
updated: 2026-09-25
---

A tenant is the isolation boundary in dewee. Agents, conversations, memory, providers and tools all belong to exactly one tenant, and the runtime refuses to answer a query that does not name one. In the console the same boundary is called a workspace: each workspace is bound to one tenant on its runtime.

## Single-tenant and multi-tenant

| Mode | How it works | Typical use |
|---|---|---|
| Single-tenant | All data lives in one default tenant. No tenant setup is needed. | One team or one company running its own runtime. |
| Multi-tenant | An administrator creates more tenants on the same runtime. Each one is isolated from the others. | Several departments, clients or products on one runtime. |

You can start single-tenant and add tenants later. Multi-tenant features switch on as soon as a second tenant exists; no migration is required.

## How a request gets its tenant

The tenant is taken from the credential, never from what the client says about itself.

| Entry point | Where the tenant comes from |
|---|---|
| HTTP API with a tenant-bound API key | The key's tenant. No extra header is needed. |
| WebSocket `connect` with a tenant-bound API key | The key's tenant, fixed for the whole connection. |
| System-level API key | The `X-GoClaw-Tenant-Id` header (UUID or slug). The key keeps its own role. |
| Chat channel (Telegram, Slack, Zalo and others) | The channel instance, which is bound to a tenant when it is created. |
| Console | Your membership in the workspace. |
| Gateway token | The owner IDs in `GOCLAW_OWNER_IDS` (default `system`) get cross-tenant administration; everyone else is scoped to a tenant they belong to. |

A tenant hint that does not match a real tenant is rejected, not quietly replaced with the default tenant. WebSocket clients get `TENANT_NOT_FOUND`; HTTP clients get a plain 401, so the response does not reveal which tenants exist.

## What is scoped

Every tenant has its own:

- agents, agent links, teams and team tasks;
- sessions and message history;
- memory, episodic summaries, the knowledge graph and the knowledge vault;
- LLM providers and their keys, MCP servers and skills;
- channel instances, cron jobs, hooks and workflows;
- agent evolution metrics and suggestions.

More than 40 tables carry a mandatory tenant column, and every query filters on it. If the tenant is missing from the request context, the query fails with an error. It never falls back to unfiltered data.

## Guards around the boundary

- **Server-side event filtering.** Live events on the WebSocket are filtered on the server, so a client only receives events for its own tenant.
- **No impersonation.** A tenant-bound key cannot switch tenants with a header, and roles are derived from the key's scopes, not from client claims.
- **Master scope for global writes.** Writes to runtime-wide settings, such as built-in tool defaults and package installs, require master scope. A tenant administrator cannot change them.
- **Signed file links.** Links to files use HMAC-signed `?ft=` tokens instead of carrying a gateway token in the URL.

## Roles and access

A tenant has members with one of five roles. The runtime maps them onto its three permission levels:

| Membership role | Runtime role |
|---|---|
| owner, admin | admin |
| operator, member | operator |
| viewer | viewer |

API keys get their role from their scopes instead: `operator.admin` is admin, `operator.write` is operator and `operator.read` is viewer. See [Secrets, roles and audit](/docs/security/secrets-roles-and-audit).

A suspended tenant, or a workspace whose entitlement is suspended, cannot run agents, chat, create API keys or change channels. System owners can still inspect the tenant and change its status.

Access changes take effect on the next request. When a key is revoked or its scopes change, or a membership is removed, open WebSocket sessions receive `TENANT_ACCESS_REVOKED` on their next call.

## Per-tenant overrides

Tenants can change their own environment without touching anyone else's:

- **LLM providers**: each tenant registers its own provider accounts and models.
- **Built-in tools**: enable, disable or change settings per tenant, on top of the runtime default.
- **Skills**: enable or disable per tenant.
- **MCP servers**: a shared server-level credential, with per-user credentials that override it. With `require_user_credentials` set on a server, users without their own credentials cannot use it.

## Moving tenant data

### Backup and restore

A tenant backup is a `.tar.gz` archive of the tenant's database rows plus its workspace and data folders. Tenant administrators can create one over HTTP (`POST /v1/tenant/backup`), and operators can run it on the runtime host:

```bash
dewee tenant-backup --tenant acme -o ./acme-backup.tar.gz
dewee tenant-restore ./acme-backup.tar.gz --dry-run
dewee tenant-restore ./acme-backup.tar.gz --mode new --new-tenant-slug acme-copy
```

Restore has three modes: `upsert` (the default, adds missing rows and changes nothing else), `replace` (wipes the tenant's data first and needs `--force`), and `new` (creates a new tenant from the archive). Tenant backup and restore need PostgreSQL; the Lite edition has a single tenant and uses the full-system `dewee backup` instead.

### Transfer between tenants

Newer runtimes can copy or move selected resources between two tenants on the same runtime: agents, teams, MCP servers, custom skills, hooks, channels, cron jobs, providers, tasks and tenant storage. A copy gets new identities; a move keeps them. Agent memories and knowledge are included only when you ask. The caller must be an administrator of both tenants, every transfer starts from a saved preview, and it is available on PostgreSQL only. Use `dewee tenant-transfer` or the `/v1/tenant/resource-transfers` endpoints.

## Related

- [Members, roles and API keys](/docs/console/members-roles-and-api-keys): managing who belongs to a workspace.
- [Settings and backup](/docs/console/settings-and-backup): workspace export and restore requests.
- [Security model](/docs/security/overview): the other defence layers.
- [API authentication](/docs/api/authentication): tenant-bound keys and headers.
- [CLI reference](/docs/runtime/cli): the tenant commands in full.
