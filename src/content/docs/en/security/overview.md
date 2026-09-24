---
title: Security overview
description: What dewee locks down by default, which agent capabilities stay open until you tighten them, and the five layers of checks between a message and your systems.
section: security
order: 1
updated: 2026-09-25
---

This page is written for the person who has to sign off on dewee: what is protected out of the box, what you are expected to configure, and where each check lives. It describes what the runtime does today, including the defaults that are permissive. The product-level summary is on the [Security](/security) page.

## The short version

- **The edge is closed by default.** Nobody reaches the gateway without a token, strangers cannot message your agents without approval, and the public MCP endpoint is off.
- **Agent capabilities start permissive.** A new gateway gives agents the full tool set, runs commands without asking, and has the Docker sandbox off. You narrow this with policy, per gateway and per agent.
- **Secrets are encrypted when the encryption key is set.** Onboarding and the Docker setup generate the key. API keys are stored only as hashes.
- **Tenants are isolated in every query.** A request without a tenant context fails.

## Closed by default

| Area | Default |
|---|---|
| Gateway access | A token is required on any non-loopback address; the gateway will not start without one |
| WebSocket | The first frame must be an authenticated `connect`; anything else is rejected |
| RPC methods | Methods that have no permission class are denied |
| Chat-app direct messages | Unknown senders get a pairing code and wait for approval |
| Public MCP endpoint | Off until an operator enables it |
| Tenant context | Required; a missing tenant is an error, not a fallback |
| Credentialed CLI grants | If the grant check does not answer within 2 seconds, the command is refused |

## Open until you tighten it

These defaults favour getting started. Review them before agents handle real data.

| Setting | Default | Stricter options |
|---|---|---|
| Tool profile (`tools.profile`) | `full` | `minimal`, `coding`, `messaging`, plus allow and deny lists |
| Command approval (`tools.execApproval`) | Runs without asking | `ask`: `on-miss` or `always`; `security`: `allowlist` or `deny` |
| Docker sandbox (`agents.defaults.sandbox.mode`) | `off` | `non-main` or `all` |
| Prompt-injection action (`gateway.injection_action`) | `warn` | `block` |
| Web fetch (`tools.web_fetch.policy`) | `allow_all` | `allowlist` |
| WebSocket origins (`gateway.allowed_origins`) | Any origin when empty | A list of your origins |
| Group chats (`group_policy`) | `open` on most channel types | `allowlist` or `disabled` |
| Webhook IP allowlist | Empty, so any IP | Your senders' addresses |

How tool policy is layered is explained in [Tools and permissions](/docs/concepts/tools-and-permissions).

## Five layers of checks

### Transport

Tokens are compared in constant time. WebSocket frames are capped at 512 KB and HTTP bodies at 1 MB. Chat requests are rate-limited per user or IP with a token bucket, 20 requests per minute by default, and the HTTP API answers `429` with `Retry-After` when the limit is hit. Tool calls have their own limit, 150 per hour per session by default.

### Input

Every incoming message is checked for six prompt-injection patterns, such as attempts to override instructions or smuggle system tags. The action is `log`, `warn`, `block` or `off`; with the default `warn`, the message still reaches the model and a security event is logged. Messages longer than 32,000 characters are truncated, and the model is told so.

### Tools

- **Shell deny groups** block seven categories of commands: destructive file and disk operations, system commands, fork bombs, remote code execution such as `curl | sh`, reverse shells and eval injection.
- **Path protection** stops tools from leaving the agent's workspace.
- **SSRF protection** blocks private, loopback, link-local and metadata addresses, pins DNS and re-checks every redirect.
- **Command approval** can hold commands until a person approves them.

### Output

Tool output is scrubbed before the model or the user sees it. Provider keys, GitHub and AWS tokens, bearer values, database connection strings, long hex secrets and the live values of the gateway's own secrets are replaced with `[REDACTED]`, and server IPs with `[SERVER_IP]`. Content fetched from the web is wrapped in markers that label it as untrusted.

### Isolation

Each agent works in its own workspace, with a sub-directory per user. With the sandbox on, commands run in a Docker container with a read-only root filesystem, all capabilities dropped, no network, and limits of 512 MB memory, one CPU, 256 processes and 300 seconds. The gateway container itself runs as a non-root user.

## Credentials your agents use

When an agent needs a credentialed CLI such as `gh`, `aws`, `gcloud`, `kubectl` or `terraform`, dewee runs the binary for it without a shell and injects the credential at run time. The agent never sees the raw value. Before any command runs, environment variables that look like secrets (names ending in `_TOKEN`, `_SECRET`, `_KEY`, `_PASSWORD`, `_DSN` or `_CREDENTIAL`, and the gateway's own variables) are removed, and the output is scrubbed.

## Multi-tenant isolation

Every tenant-owned table carries a tenant ID, and every query filters on it. Events are filtered by tenant on the server, file links are signed, and each channel connection belongs to exactly one tenant. Suspending a tenant stops its runtime work, and revoked access is pushed to connected clients immediately. Details are in [Multi-tenancy](/docs/concepts/multi-tenancy).

## Before you go live

1. Keep `GOCLAW_ENCRYPTION_KEY` set, and store it with your backups.
2. Set a strong gateway token and put TLS in front of the gateway.
3. Narrow the tool profile and turn on command approval for agents that can run commands.
4. Turn the sandbox on for agents that execute code.
5. Set `gateway.injection_action` to `block` if your agents talk to the public.
6. List your origins in `gateway.allowed_origins`, and set an IP allowlist and HMAC signing on webhooks.
7. Give people the smallest role that works; see [Secrets, roles and audit](/docs/security/secrets-roles-and-audit).
