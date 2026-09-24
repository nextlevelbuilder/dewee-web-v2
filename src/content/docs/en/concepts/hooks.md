---
title: Hooks
description: How dewee hooks allow, block or observe agent activity at seven points in a run, with HTTP, prompt and script handlers, fail-closed rules and an audit log.
section: concepts
order: 11
updated: 2026-09-25
---

Hooks let you run your own checks at fixed points in an agent's run, such as before a user's message enters the pipeline or before a tool call runs. A hook can allow or block the step, or simply observe it. Hooks act on what agents do inside dewee. To send requests into dewee from another system, use [inbound webhooks](/docs/api/webhooks-and-mcp) instead.

## Events

| Event | Fires | Can block |
|---|---|---|
| `session_start` | At the start of every agent run, not only the first in a session | No |
| `user_prompt_submit` | Before a user's message enters the pipeline | Yes |
| `pre_tool_use` | Before a tool call runs, including tool calls from workflow nodes | Yes |
| `post_tool_use` | After a tool call completes | No |
| `stop` | When an agent run finishes | No |
| `subagent_start` | Before a delegation to another agent starts | Yes |
| `subagent_stop` | When a delegation completes or fails | No |

For the three blocking events, the step waits for the hooks to decide. Hooks on the other events run in the background and can only observe.

## Handler types

| Handler | Editions | How it decides |
|---|---|---|
| `http` | Standard and Lite | Posts the event as JSON to your URL and reads the decision from the reply |
| `prompt` | Standard and Lite | Asks a model, which must answer through a `decide` tool call |
| `script` | Standard and Lite | Runs a sandboxed ES5.1 `handle(event)` function, up to 32 KiB of source |
| `command` | Lite only | Runs a local shell command with the event on stdin. Exit code 2 blocks and 0 allows |

`command` is refused on Standard both when a hook is saved and when it fires. A `command` hook only receives the environment variables you list. The `http` handler refuses loopback, link-local and private addresses.

A `prompt` hook sees only the tool input, fenced off from its instructions, and never the raw user message. A free-text answer instead of a `decide` call fails closed. Because each run costs tokens, a `prompt` hook must have a matcher or `if_expr`.

A `script` hook can return `additionalContext`. On an allowed `user_prompt_submit`, that text is added to the system prompt for the turn. Scripts you write cannot change the input. Only built-in hooks can, such as `pii-redactor`, which masks email addresses and phone numbers and is off by default.

## Scopes, priority and matching

| Scope | Applies to | Created by |
|---|---|---|
| `global` | Every tenant | The operator only |
| `tenant` | Every agent in one tenant | Tenant admins |
| `agent` | Selected agents in one tenant | Tenant admins |

All hooks that match an event run as one chain, highest `priority` first, with ties in creation order. The first block ends the chain. Two optional filters narrow when a hook fires:

- **`matcher`**, a regular expression tested against the tool name, such as `^(exec|write_file)$`.
- **`if_expr`**, a CEL expression over `tool_name`, `tool_input` and `depth`, such as `tool_name == "exec" && size(tool_input.cmd) > 80`.

## Safety rules and limits

- **Fail closed.** On a blocking event, an error, an unreadable answer or an exhausted chain budget counts as a block. A timeout follows the hook's `on_timeout`, which defaults to `block` for blocking events.
- **Circuit breaker.** A hook that blocks or times out 5 times within one minute is switched off. It stays off until someone turns it back on.
- **Nesting.** Hook chains stop at a nesting depth of 3, and deeper events are refused.

| Limit | Default |
|---|---|
| Per-hook timeout | 5 seconds (`timeout_ms`, up to 10 seconds) |
| Whole chain | 10 seconds |
| `prompt` calls | 5 per user turn (`max_invocations_per_turn`) |
| `prompt` decision cache | 60 seconds for the same hook, tool and input |
| `prompt` token budget | 1,000,000 tokens per tenant per month on Standard. When it runs out, `prompt` hooks block |
| `additionalContext` | 32 KiB per hook and per chain |
| HTTP response | 1 MiB |

## The HTTP handler contract

dewee sends a `POST` with the event as a JSON body. Headers you configure, such as `Authorization`, are stored encrypted and decrypted only when the request is sent. A failed request, whether an error status or a network error, is retried once after 1 second. Your endpoint replies with:

```json
{
  "decision": "block",
  "additionalContext": "",
  "updatedInput": {},
  "continue": true
}
```

- **`decision`** is `allow` or `block`, and wins when present.
- **`continue`**, when `decision` is missing, blocks if set to `false`.
- An empty body, or a 2xx reply that is not JSON, allows the step.
- **`additionalContext`** and **`updatedInput`** are accepted but not yet applied for HTTP hooks. Only script hooks add context, and only built-in hooks change input.

> [!IMPORTANT]
> A blocking hook that points at a slow or failing endpoint blocks every matching step. Test it before you enable it, and keep `timeout_ms` well below the 10-second chain budget.

## Audit, spans and the console

Every hook run is written to an execution log with the session, event, decision, duration and any error. The log stores a hash of the input, not the input itself. Error text is cut to 256 characters, and the full detail is kept encrypted. Log entries remain after a hook is deleted.

Each run also adds an `event` span to the trace, named `hook.<handler>.<event>` (for example `hook.http.pre_tool_use`), with the decision in its metadata.

The **Hooks** page in the console is in beta. There you create tenant and agent hooks with `http`, `prompt` or `script` handlers, set their priority, and read their history. A dry run tests a hook against a sample event without writing to the log, and it redacts values that look like secrets. Global, built-in and `command` hooks are shown read-only. The CLI has no hooks command.

## Related

- [Tools, MCP and hooks in the console](/docs/console/tools-mcp-and-hooks): creating and testing hooks.
- [Tools and permissions](/docs/concepts/tools-and-permissions): how tool access is granted and restricted.
- [Agent teams and delegation](/docs/concepts/agent-teams): where `subagent_start` fires.
- [Tracing and observability](/docs/concepts/tracing): reading hook spans in a trace.
- [Webhooks and MCP](/docs/api/webhooks-and-mcp): calling dewee from outside systems.
