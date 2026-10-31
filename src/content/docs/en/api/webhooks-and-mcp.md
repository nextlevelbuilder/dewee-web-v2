---
title: Webhooks and MCP
description: Let other systems trigger agents and send channel messages through signed webhooks, and connect Claude Code, Cursor, VS Code or Gemini CLI to dewee over MCP.
section: api
order: 3
updated: 2026-10-13
---

Two endpoints exist for other software to call dewee. **Webhooks** let a system you run, such as a CRM, a form or a monitoring tool, start an agent or post a message to a chat app. The **public MCP server** lets an AI coding assistant search a workspace's memory and skills and work with its workflows. Both are narrow on purpose: each accepts only its own kind of credential and exposes a fixed set of actions.

## Webhooks

There are two kinds of webhook:

| Kind | Endpoint | What it does | Edition |
|---|---|---|---|
| `llm` | `POST /v1/webhooks/llm` | Runs an agent on the input you send and returns its answer | Standard and Lite |
| `message` | `POST /v1/webhooks/message` | Sends a message, with optional media, to a chat on a connected channel | Standard |

A tenant admin creates a webhook with `POST /v1/webhooks`, naming the kind and, for `llm`, the agent. The response contains the webhook secret, which starts with `wh_` and is shown only once. Webhooks need `GOCLAW_ENCRYPTION_KEY` on the gateway, because the secret is also kept encrypted to sign callbacks.

### Call an agent

```bash
curl https://dewee.example.com/v1/webhooks/llm \
  -H "Authorization: Bearer <webhook-secret>" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: <unique-request-id>" \
  -d '{"input": "Summarise the new ticket and suggest a reply", "session_key": "ticket-4812", "mode": "sync"}'
```

In `sync` mode the answer comes back in the response, and the call times out after 30 seconds with `504`. In `async` mode the gateway answers `202` straight away and posts the result to your `callback_url`, which must be HTTPS. A `session_key` keeps related calls in one conversation.

### Send a message

A `message` webhook takes a `channel_name`, a `chat_id` and `content` of up to 16 KB, plus an optional `media_url`. With `fallback_to_text`, media is dropped on channels that cannot show it instead of failing the call.

### Sign requests

A plain bearer secret is the simplest option. For stronger protection, sign each request with HMAC and set `require_hmac` so the bearer form is refused:

```text
X-Webhook-Id: <webhook-id>
X-GoClaw-Signature: t=<unix-seconds>,v1=<hex HMAC-SHA256 of "<t>.<raw body>">
```

The timestamp must be within 5 minutes of the gateway's clock, and a signature cannot be replayed. You can also restrict callers to an IP allowlist; it uses the connecting address and ignores `X-Forwarded-For`.

### Retries and idempotency

- Send an `Idempotency-Key` header. A retry with the same key and body returns the first result without running the agent again; the same key with a different body returns `409`.
- Callbacks are delivered at least once. Each carries a stable `X-Webhook-Delivery-Id` for de-duplication and an `X-Webhook-Signature` made with the same algorithm, so you can verify it with your webhook secret.
- Failed callbacks are retried after 30 seconds, 2 minutes, 10 minutes, 1 hour and 6 hours, then marked dead. A `4xx` reply other than `429` stops the retries.
- Each webhook and each tenant has a rate limit. Over it, the gateway answers `429` with `Retry-After`.

> [!WARNING]
> Rotating a secret with `POST /v1/webhooks/{id}/rotate` invalidates the old one immediately; there is no overlap. Update the sender at the same moment.

## The public MCP server

The gateway can act as an MCP server at `POST /mcp/server`, so an MCP client such as Claude Code, Cursor, VS Code or Gemini CLI can use a workspace from inside the editor. It is not the same as the MCP servers dewee itself connects to, which you manage under [Tools, MCP and hooks](/docs/console/tools-mcp-and-hooks).

`/mcp/server` is the address every generated configuration uses. The older `/mcp` path still answers MCP clients, with a `Deprecation` header and a `Link` header that points to `/mcp/server`, and will be removed in a later release, so move existing clients to `/mcp/server`.

Two switches decide whether a client can connect:

- **The runtime.** On a self-hosted gateway the endpoint is **off by default**. An operator turns it on with `GOCLAW_MCP_PUBLIC_ENABLED=1` or `tools.mcp.public.enabled` in the config.
- **The workspace.** Where the endpoint is on, each workspace is **active by default**. A workspace owner or admin can turn public MCP access off and on again; see [Turn access on or off for a workspace](#turn-access-on-or-off-for-a-workspace).

### What a client can do

| Available | Never available |
|---|---|
| `memory_search`, `memory_get` | Running commands, changing files |
| `skill_search`, `web_search` | Browser, messaging, schedules, spawning agents |
| `workflow`: list, get, validate, see node types, runs and run status | Admin, credential, provider and package operations |
| `workflow`: create and update drafts, with `mcp.tools.write` | Publishing or running workflows; tools from other MCP servers |

The client acts as one agent in its tenant, chosen with the `X-Dewee-Agent` header or the `?agent=` query parameter, and otherwise the `default` agent. The key's owner must have access to that agent, and an unknown or forbidden agent returns the same `404`.

### Connect a client in the console

In the console, open **API keys & docs** and the **Connect an MCP client** tab. It walks through five steps:

1. **Endpoint status.** Chips show whether the runtime is linked, whether the endpoint is available on this runtime, and whether MCP is enabled for the workspace. Below them are the exact endpoint address, the number of read and write tools, and the limits. A workspace admin can **Enable MCP** or **Turn off MCP** here, after a confirmation; other members see the state and are asked to contact an admin.
2. **Choose an agent.** Pick the agent the client talks to, or leave it empty to use the workspace's default agent.
3. **Issue a key.** The key works only for MCP and can read by default. Tick **Also allow write tools** only if the client needs to change data. The key is shown once, so copy it straight away.
4. **Copy the client config.** Choose Claude Code, Cursor, VS Code or Gemini CLI and copy the configuration, which already contains the endpoint and the agent you picked. It always carries the placeholder `<your-mcp-key>`, never the key itself; replace the placeholder with your key.
5. **Test the connection.** Paste a key, or use the one you just issued, and select **Test connection**. The console runs the same handshake a client does and shows the result, the next step to take, the number of tools found and the response time. **Also call a read-only tool** proves that a tool really runs.

Viewing the tab and running a test need the Monitor permission. Turning MCP on or off and a test that calls a tool need the Connect permission, and only a workspace owner or admin can turn MCP on or off. Configurations appear only when the gateway has a public address configured; without one, the tab says so and never guesses an address from your browser.

### Connect a client from the CLI

1. Create a key with the **MCP read** or **MCP read and write** access level on the console's **API keys & docs** page, or with `dewee api-keys create` with `mcp.tools.read` and an owner.
2. Export the key as `DEWEE_MCP_TOKEN` so it never lands in a config file.
3. Generate the configuration for your client and merge it into the client's settings:

```bash
export DEWEE_MCP_TOKEN=<mcp-api-key>
dewee mcp connect-config --client claude
```

`--client` accepts `claude`, `cursor`, `vscode`, `gemini` and `generic`, and `--agent` adds an agent selector. The rendered configuration refers to the environment variable and never contains the key itself.

The CLI also covers status, activation and the connection test:

| Command | What it does |
|---|---|
| `dewee mcp status` | Shows the endpoint and workspace state described below |
| `dewee mcp activate`, `dewee mcp deactivate` | Turns public MCP access on or off for the workspace. Asks for confirmation unless you pass `--yes`; `--dry-run` prints the request without sending it |
| `dewee mcp test` | Tests the key in `DEWEE_MCP_TOKEN`, or one piped in with `--mcp-token-stdin`. `--agent` picks the agent and `--call-tool` also calls a read-only tool |

The key is never accepted as a command-line argument. `dewee mcp test` prints its result even when the check fails, and exits non-zero with an exit code that follows the kind of failure, so a script can tell a rejected key from a missing permission. With `--remote` it runs the handshake from your machine against the advertised endpoint, which also checks DNS, TLS and your reverse proxy. It sends the key only to an endpoint on the same origin as the gateway the CLI is configured for; to test another host, name it explicitly with `--remote --endpoint <url>`, and the CLI warns you which host receives the key. With a server name, `dewee mcp test <server>` still tests an MCP server that dewee connects to.

### Check the status

`GET /v1/mcp/public/status` returns the state of the endpoint for the workspace of the request, and any workspace member may call it. The fields that matter most when setting up a client:

| Field | Meaning |
|---|---|
| `instance_enabled` | The runtime serves the public endpoint |
| `workspace_active` | Public MCP access is on for this workspace |
| `endpoint_url` | The exact address to give a client. Set only when the gateway's public URL (`GOCLAW_PUBLIC_URL`) is configured; it is never taken from request headers |
| `endpoint_url_source` | `configured` when `endpoint_url` is set, `unset` otherwise. When unset, `endpoint_url` is empty and `endpoint_url_next_action` says how to fix it |
| `agent_header`, `protocol_version`, `limits`, `tools` | The agent header, the MCP version, the limits the endpoint enforces, and how many read and write tools it exposes |
| `can_manage_activation` | The caller may turn access on or off |
| `can_call_tool` | The caller may run a connection test that calls a tool |

### Turn access on or off for a workspace

`PUT /v1/mcp/public/activation` with `{"active": false}` or `{"active": true}` turns public MCP access off or on for the workspace, and returns the new status. Only a workspace owner or admin can do it, with a credential that proves who they are: an API key or console session bound to that person, the gateway token, or the system owner. An API key without an owner is refused, even if it names an admin in a header.

A workspace with no setting is active, so existing workspaces keep working. While a workspace is inactive, the public endpoint refuses every credential of that workspace with `403 {"error":"workspace_inactive"}`. Keys are not revoked: they work again as soon as access is turned back on. Every change is written to the gateway log and the audit trail. Saving the workspace's other settings never changes this flag, so only this route, the console switch and `dewee mcp activate|deactivate` can.

### Test a connection

`POST /v1/mcp/public/diagnose` with `{"token": "<mcp-api-key>", "agent": "<agent-key>", "call_tool": false}` checks a key without configuring a client. Any workspace member may run it; `call_tool: true` needs the operator role or higher. The gateway runs the MCP handshake and lists the tools, and with `call_tool` it also calls the first read-only tool. The check runs inside the gateway, through the same endpoint a client uses, so it cannot be pointed at another host. The response is always `200`, with `ok`, the `stage` reached, a `result`, a `message`, a `next_action`, the `tool_count` and the `latency_ms`:

| `result` | Meaning |
|---|---|
| `ok` | Every stage passed |
| `endpoint_disabled` | The runtime does not serve the public endpoint |
| `workspace_inactive` | Public MCP access is off for this workspace |
| `key_rejected` | Unknown, revoked or expired key, or a key of another workspace |
| `missing_mcp_scope` | The key has no `mcp.*` scope |
| `owner_binding` | The key has no owner, or its owner left the workspace |
| `agent_not_found` | No agent matches the one requested |
| `rate_limited` | The endpoint's limits, or your own budget of failed checks, are used up |
| `tool_error` | The connection works but the read tool call failed |
| `internal` | Unexpected response |

The key you test is never logged, echoed back or stored. A key of another workspace reports only `key_rejected`, and no tool runs under it. Failed checks are limited to 10 per minute for each caller, so the route cannot be used to guess keys.

### Limits, quota and revocation

Each credential may send 120 requests per minute (bursts of 20) and run 4 tool calls at a time, each with a 60-second deadline. Request bodies are capped at 1 MiB. Over a limit, the endpoint answers `429`; a body over the cap gets `413`. The server speaks the stateless Streamable HTTP transport of MCP `2026-07-28`, and older clients negotiate down. Generic HTTP clients are covered by automated tests; Claude Code, Cursor, VS Code with Copilot and Gemini CLI have been verified by hand.

These budgets are **per credential, not per workspace**: a workspace with three MCP keys gets three times the budget. Some read tools spend the workspace's own paid quota, for example `web_search` uses the workspace's search providers, so treat even a read key as able to consume that quota.

A revoked or expired key fails on its very next request; there is no cache window. An MCP-only key cannot manage keys itself, so revoking a leaked key needs an owner or admin, on the console's **API keys & docs** page or with an admin credential. To cut off every client of a workspace at once without revoking keys, turn workspace access off.

If someone keeps using a key after you revoked it, or after it expired, each attempt still gets a plain `401` (the caller cannot tell it from a key that never existed), but the attempt is recorded in your workspace's **Traces** on channel `mcp_public`, with the reason `credential_revoked` or `credential_expired` and the key's ID and prefix, never the key itself. Find them in the console's Traces page or with `dewee traces list --channel mcp_public`.
