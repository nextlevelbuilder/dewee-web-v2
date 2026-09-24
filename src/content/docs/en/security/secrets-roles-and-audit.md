---
title: Secrets, roles and audit
description: How dewee stores credentials, who can do what in the console and the runtime, how API keys and chat senders get access, and where to find the audit trail.
section: security
order: 2
updated: 2026-09-25
---

The [Security overview](/docs/security/overview) covers the checks around agents. This page covers the people and the credentials: what is stored and how, which roles exist, and what leaves a record you can review later.

## How secrets are stored

| What | How it is stored |
|---|---|
| Model provider keys, MCP server keys and OAuth tokens, custom tool environment, CLI credentials | AES-256-GCM, when `GOCLAW_ENCRYPTION_KEY` is set |
| Channel credentials, per-user MCP credentials, browser cookies, workstation SSH keys | AES-256-GCM, when `GOCLAW_ENCRYPTION_KEY` is set |
| API keys | SHA-256 hash only; compared in constant time |
| Webhook secrets | A SHA-256 hash to verify callers, plus an encrypted copy to sign outgoing callbacks. Webhooks require the encryption key |

Without the encryption key, the gateway logs a warning at startup and stores the first two rows as plain text. `dewee onboard`, `prepare-env.sh` and the self-hosted Docker setup all generate the key; the plain `docker-compose.yml` leaves it empty, so set it yourself if you use that file directly.

The HTTP API never returns a stored provider key; it shows `***` instead. API keys and webhook secrets are shown once, when you create them. If you lose one, create a new one and revoke the old one.

## Workspace roles in the console

The console has three built-in roles and any number of custom ones.

| Role | What it can do |
|---|---|
| Owner | Everything, including billing, licence binding and changes to other owners and admins |
| Admin | Every permission, but cannot change owners or other admins |
| Member | Only what their custom role grants |

A custom role is a set of permission keys, such as `provider.manage`, `agents.manage`, `chat.use`, `observability.read`, `api_keys.manage` or `billing.manage`. A role needs at least one permission, and nobody except an owner can grant a permission they do not hold themselves. Invitations are single-use links that expire after 7 days. Managing members and roles step by step is covered in [Members, roles and API keys](/docs/console/members-roles-and-api-keys).

## Roles in the runtime

The runtime has its own four roles, which decide which API and WebSocket methods a caller may use:

- **Owner**: everything an admin can do, plus tenant management.
- **Admin**: every method, including API keys and system configuration.
- **Operator**: read and write access for day-to-day work, without admin operations.
- **Viewer**: read-only access.

Tenant members are mapped onto these roles: owners and admins become admin, operators and members become operator, and viewers stay viewer. Access to an individual agent is checked separately: the agent must be the default agent, owned by the caller, or shared with them.

## API keys

API keys authenticate scripts, integrations and the CLI. Each key is bound to a tenant and carries scopes, and the role follows from the scopes: `operator.admin` gives admin, `operator.write`, `operator.approvals` or `operator.pairing` give operator, and `operator.read` gives viewer. Keys with `mcp.tools.read` or `mcp.tools.write` only work on the public MCP endpoint.

Keys can expire or be revoked at any time. A revoked key is refused from the next request on, and open WebSocket sessions that used it are cut off. Formats, headers and examples are in [Authentication](/docs/api/authentication).

## Admitting chat-app senders

On chat apps, direct messages default to pairing. When someone new writes to an agent, they get an 8-character code that is valid for 60 minutes, and nothing reaches the agent until an admin approves the code, in the console's **Pairing inbox** or with `dewee pairing approve`. Each account can have at most three codes waiting. You can switch a channel to an allowlist, open it, or disable direct messages, and in groups only designated writers can change files or reset the conversation. See [Channels, pairing and contacts](/docs/console/channels-and-contacts).

## Audit trail

- **Activity log.** Changes are recorded with the actor, the entity and the action. Read them on the console's **Activity** page, with `dewee activity list`, or through `GET /v1/activity`.
- **API key audit.** The console's **API keys** page includes an audit view for your keys.
- **Security events.** Detected or blocked prompt injections and truncated messages are logged as `security.injection_detected`, `security.injection_blocked` and `security.message_truncated`.
- **Traces.** Every agent run records its model calls and tool calls, so you can see what an agent did and why. See [Tracing](/docs/concepts/tracing).

> [!NOTE]
> Calls to the public MCP endpoint are written to the gateway log. They do not appear in the trace views yet.

## Rotating and revoking

| Credential | How to replace it |
|---|---|
| API key | Create a new key, switch your clients, then revoke the old one |
| Webhook secret | Rotate it and update the sender straight away: there is no grace period, so the old secret stops working at once |
| Provider key | Update it in **Providers & models** and verify |
| Gateway token | Change `GOCLAW_GATEWAY_TOKEN` and restart the gateway, then update clients that use it |
| Encryption key | Do not change it casually: secrets encrypted with the old key cannot be read with a new one |
