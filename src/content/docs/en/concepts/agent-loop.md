---
title: The agent loop
description: How one message becomes a reply in dewee, from the think, act and observe cycle and its limits to prompt modes, context files and post-run cleanup.
section: concepts
order: 1
updated: 2026-09-25
---

Every agent run in dewee follows the same loop. The runtime builds a prompt, asks the model what to do, runs the tools the model asks for, feeds the results back, and repeats until the model gives a final answer or a limit stops it. This page explains each stage, the defaults that bound it, and the controls you have while a run is in progress.

## Think, act, observe

A run has one setup stage, a repeating loop, and a finish.

| Stage | When | What happens |
|---|---|---|
| Context | Once, at the start | Resolves the agent, the user, the workspace folder and the context files for this conversation. |
| Think | Every iteration | Builds the system prompt, filters the tool list through policy and roles, and calls the model. |
| Prune | Every iteration | Keeps the history inside the context budget (see below). |
| Tool | Every iteration | Runs the tool calls the model returned. |
| Observe | Every iteration | Adds the tool results to the conversation. |
| Checkpoint | Every iteration | Counts the iteration and stops the loop at the cap or on cancellation. |
| Finalize | Once, at the end | Cleans the output, saves the messages in one write and updates session metadata. |

If the model answers without asking for a tool, the loop ends and the reply is delivered.

## Limits and defaults

| Setting | Default | Notes |
|---|---|---|
| Iteration cap | 30 | Override per agent with `max_tool_iterations`, or per request. |
| Context window | 200,000 tokens | Per agent. |
| Output tokens (`max_tokens`) | 8,192 | Per agent. |
| Temperature | 0.7 | Per agent. |
| Message length (`max_message_chars`) | 32,000 characters | Longer input is truncated and the model is told so; it is never rejected. |
| Large tool results | 48,000 characters | A longer result is written to a file in the workspace and the conversation keeps a 3,000-character preview. |

## How tools run

When the model asks for several tools at once, dewee runs the read-only ones in parallel, with a bounded pool, and then processes the results in the order the model asked for them. Anything that can change state runs one call at a time: `exec`, file writes and other mutating tools, asynchronous tools, MCP tools, `wait`, and any tool the runtime does not recognise. A `pre_tool_use` [hook](/docs/concepts/hooks) runs before the tool and can block it.

## The system prompt

### Prompt modes

Each agent has a prompt mode (`prompt_mode` in the agent's `other_config`) that decides how much of the system prompt it receives.

| Mode | Intended for |
|---|---|
| `full` | The main conversational agent. All sections. This is the default. |
| `task` | Lean automation that still needs skills search, memory and tools. |
| `minimal` | Short, simple runs with a reduced set of sections. |
| `none` | An identity line only. |

dewee resolves the mode in this order: a runtime override for the request wins; heartbeat runs are capped at `minimal`; sub-agent and cron runs are capped at `task`; then the agent's own setting; then `full`. A cap only lowers a mode, it never raises one.

### Context files

The prompt includes the agent's context files: `AGENTS.md`, `SOUL.md`, `IDENTITY.md`, `TOOLS.md`, `USER.md`, `BOOTSTRAP.md` and `USER_PREDEFINED.md`, plus generated files such as `DELEGATION.md` and `TEAM.md` when the agent can delegate or belongs to a team. A safety baseline file is loaded in every mode except `none`. Lower modes load fewer files.

Each file is capped at 20,000 characters and all files together at 24,000. A file over the cap keeps its first 70% and last 20%, with a marker in between that tells the model to read the full file.

### Predefined and open agents

- A **predefined** agent shares one persona across all users: `AGENTS.md`, `SOUL.md`, `IDENTITY.md` and `USER_PREDEFINED.md` live at agent level, and each user gets a personal `USER.md`.
- An **open** agent keeps a full set of context files per user, seeded from templates on the first chat.

Use predefined agents for support desks and shared assistants; use open agents when each person should shape their own assistant.

## Keeping the context in budget

- **Tool-result pruning** (opt-in, `contextPruning.mode: "cache-ttl"`). Past 25% of the context, old tool results are trimmed to their start and end; past 50%, large ones are replaced with a placeholder. System messages, the first user message and the last three assistant replies are never pruned.
- **Mid-loop compaction.** The runtime reserves 20,000 tokens and compacts when history passes 85% of the remaining budget. The model writes a summary within 30 seconds; if it cannot, a deterministic fallback keeps the existing summary, complete tool call groups and the newest messages.
- **Post-run summary.** After a run, a session with more than 50 messages or more than 75% of the context in use is summarised in the background. The last four messages are kept as they are.
- **Memory flush.** Before that summary, the agent gets one short turn (at most 5 iterations, 90 seconds) to save durable notes to `memory/YYYY-MM-DD.md`. It is configured under `compaction.memory_flush`. See [Memory and knowledge vault](/docs/concepts/memory-and-knowledge).

## Stopping and watching a run

- **Stop.** In a chat channel, `/stop` cancels the oldest running task in the session and `/stopall` cancels all of them and drains the queue. The trace is still saved.
- **Stream events.** Clients on the WebSocket API receive `run.started`, `activity`, `tool.call`, `tool.result`, `block.reply`, `run.retrying`, then `run.completed`, `run.failed` or `run.cancelled`, with the reply text arriving as `chunk` and `thinking` chat events.
- **Input guard.** Each incoming message is checked against six prompt-injection patterns. The action is set with `gateway.injection_action`: `off`, `log`, `warn` (the default) or `block`. Only `block` stops the message before it reaches the model.

> [!NOTE]
> Every iteration is recorded as spans in a trace: model calls, tool calls, tokens and cost. See [Tracing and observability](/docs/concepts/tracing).

## Related

- [Agents in the console](/docs/console/agents): where you create agents and set their model and instructions.
- [Chat and sessions](/docs/console/chat-and-sessions): sessions, history and stopping runs.
- [Tools and permissions](/docs/concepts/tools-and-permissions): what the Tool stage is allowed to run.
- [Providers, fallback and reasoning](/docs/concepts/providers-and-routing): what happens when a model call fails.
- [Security model](/docs/security/overview): the input guard in context.
- [API overview](/docs/api/overview): the chat endpoints and WebSocket events.
