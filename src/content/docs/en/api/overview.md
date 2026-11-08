---
title: API overview
description: "The runtime's REST API, WebSocket RPC, OpenAI-compatible chat, public MCP server and webhooks: what each is for, where the reference lives, how errors look."
section: api
order: 1
updated: 2026-11-08
---

The runtime's API covers what agents do and how they are configured: agents, sessions, providers, channels, tools, memory and more, so that work can be automated as well as clicked. Console-only matters such as members, billing and support stay in the console. The gateway serves all of it on one port: a REST API under `/v1`, a WebSocket for live sessions, and a few endpoints built for other tools to call. This page maps them out; [Authentication](/docs/api/authentication) explains the keys, and [Webhooks and MCP](/docs/api/webhooks-and-mcp) covers the two integration endpoints.

## Base URL and reference

On a runtime you operate, the base URL is the address of your gateway, for example `https://dewee.example.com`. For a workspace in the console, the **Docs** tab of the **API keys & docs** page shows the base URL together with ready-to-copy examples in cURL, JavaScript, Python and WebSocket.

Every gateway also publishes its own reference:

- `/docs` serves an interactive Swagger UI.
- `/v1/openapi.json` is the OpenAPI 3.0 specification, for generating clients.

The reference on your gateway always matches the version you run, so prefer it over any copy.

## The surfaces

| Surface | Path | Use it for |
|---|---|---|
| REST API | `/v1/...` | Managing agents, sessions, providers, skills, workflows, channels, memory, files, usage and more |
| WebSocket RPC | `/ws` | Live chat with streaming, agent and team events, approvals |
| Chat completions | `POST /v1/chat/completions` | Talking to an agent from any OpenAI-compatible client |
| Responses | `POST /v1/responses` | The same, for clients that use the OpenAI Responses format |
| Public MCP server | `POST /mcp/server` | Letting Claude Code, Cursor, VS Code or Gemini CLI use a workspace's knowledge and workflows |
| Webhooks | `POST /v1/webhooks/llm`, `POST /v1/webhooks/message` | Letting another system trigger an agent or send a message on a channel |
| Health | `/health`, `/livez`, `/readyz` | Load balancer and orchestrator checks; no authentication |

## Chat with an agent

The chat endpoint speaks the OpenAI Chat Completions format, so existing SDKs work by changing the base URL and key. Choose the agent with an `agent:` prefix in `model`, or with the `X-GoClaw-Agent-Id` header; without either, the request goes to the agent called `default`.

```bash
curl https://dewee.example.com/v1/chat/completions \
  -H "Authorization: Bearer <api-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "agent:<agent-key>",
    "messages": [{"role": "user", "content": "Summarise yesterday'\''s support tickets"}],
    "stream": false
  }'
```

Set `"stream": true` to receive server-sent events, ending with `data: [DONE]`. To keep a conversation going across requests, send the same `X-GoClaw-Session-Key` header each time. The agent runs its full loop, with its own tools, skills and memory, before it answers; see [Agent loop](/docs/concepts/agent-loop).

## WebSocket RPC

The WebSocket at `/ws` is what the console uses for live chat. The first frame must be a `connect` request with your key; anything else is rejected.

```json
{"type": "req", "id": "1", "method": "connect", "params": {"token": "<api-key>", "locale": "en"}}
```

The reply tells you your role and tenant. Sending `connect` again on the same socket replaces the earlier login entirely, and a rejected `connect` logs the socket out. After that, each request is a `req` frame with a `method` and `params`, answered by a `res` frame with the same `id`. The server pushes `event` frames for streamed replies, tool calls, team tasks, approvals and trace updates. The protocol version is 3; `/health` reports it too.

When using `dewee agent chat` as the WebSocket client, its caller-context flag and environment precedence are described in the [CLI guide](/docs/runtime/cli). That context is not proof of identity or authorization; the gateway still enforces the credential's owner, role, tenant and membership.

## Errors and limits

- Errors come back as JSON with an `error` field and the usual status codes: `400`, `401`, `403`, `404`, `409`, `429` and `500`.
- On the WebSocket, failed requests return `ok: false` with an error `code`, `message`, and a `retryable` hint.

If a stopped chat turn is still being saved, `chat.send` can return `FAILED_PRECONDITION` with `retryable: true` and `details.reason: "run_in_progress"`. The HTTP chat completions and responses endpoints return the same reason with HTTP 409 before streaming begins. Keep the input and retry in the same conversation after the previous turn finishes. A connected channel receives a retry message if its wait expires; the message is not automatically resent.
- Chat is rate-limited per user or IP, 20 requests per minute by default; over the limit you get `429` with `Retry-After`.
- HTTP bodies are limited to 1 MB and WebSocket frames to 512 KB.

### Channel group writers and batch selections

An enabled Feishu webhook channel cannot claim a target already used by another enabled channel or active file configuration. The channel API returns HTTP 409 / `ALREADY_EXISTS`: switch to WebSocket mode or ask an operator for a free target. Disabled channels do not reserve targets. The save check coordinates within one Gateway process; startup checks remain necessary across replicas.

The channel instance writer API lists groups at `GET /v1/channels/instances/{id}/writers/groups`, lists writers at `GET /v1/channels/instances/{id}/writers`, and tests a user at `POST /v1/channels/instances/{id}/writers/test`. Add with `POST /v1/channels/instances/{id}/writers` and remove with `DELETE /v1/channels/instances/{id}/writers/{userId}`; writes require an admin. Successful writes return `status` (`added` or `removed`), `group_id` and `user_id`. Removing a missing writer returns 404; removing the last writer returns 409. Consult the running gateway's OpenAPI reference for request fields.

`POST /v1/contacts/merge`, `POST /v1/contacts/unmerge` and `POST /v1/vault/links/batch` accept at most 500 IDs per request, counting duplicate entries. Larger arrays receive a localized HTTP 400 validation error rather than partial processing. Split larger selections and track each result.

### Guided workspace setup

`POST /v1/workspace-setup/next` advances guided setup. When a connection test or repair question concerns a stored API-key provider, send `intent: "replace_key"` and, optionally, `step_id` to replace that question with the key card for the same provider. The response's `intents` lists the choices accepted on the next turn and may be omitted when empty. See [Overview](/docs/console/overview) for the user flow and CLI equivalent.

### Conditional workflow draft updates

For `PUT /v1/workflows/{id}`, pass the draft's current `updated_at` as `expected_version` to reject a concurrent edit. A stale value returns HTTP 409 with `VERSION_CONFLICT`; reload and reconcile before retrying. Omit it for an unconditional update. The equivalent WebSocket method is `workflows.update` with `expectedVersion`. See [Workflows](/docs/concepts/workflows) for timestamp precision and CLI and Workspace MCP usage.

### Trace export errors

`GET /v1/traces/{id}/export` returns HTTP 422 with `trace_export_too_deep` and `max_depth: 10` if a trace exceeds ten child levels, or `trace_export_cycle` if its parent links form a cycle. Export a deeper sub-trace by its own ID; a cycle beyond the depth limit can be reported as too deep. Successful exports retain the gzip JSON format. See [Tracing](/docs/concepts/tracing) for recovery and pruning details.

## Route groups

| Group | Examples of what you can manage |
|---|---|
| Agents and conversations | Agents and their sharing, sessions, tasks, skills, episodic memory, knowledge graph, vault |
| Models and tools | Providers and their models, model pricing, MCP servers dewee connects to, custom tools, voices |
| Channels and people | Channel connections, contacts, tenant users, agent teams, pending messages |
| Automation | Workflows and their runs, webhooks |
| Execution controls | CLI credentials, packages, shell deny groups |
| Observability | Traces, runs, costs, usage, activity |
| Files | Storage, media and signed file links |
| Administration | API keys, tenants, system configuration, backups and restores |

A few operations, such as schedule management and patching sessions, exist only as WebSocket methods. The [CLI](/docs/runtime/cli) wraps both surfaces, which is often the quickest way to script them.
