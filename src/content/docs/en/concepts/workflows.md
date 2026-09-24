---
title: Workflows
description: How dewee workflows run a fixed graph of steps the same way every time, how drafts are published and versioned, and which limits and retries apply to each run.
section: concepts
order: 7
updated: 2026-09-25
---

A workflow is a fixed graph of steps that dewee runs the same way every time. Use one when a process must not skip a step, such as checking an order before replying or reviewing a post before it goes out. The model only works inside bounded nodes, and the graph decides what happens next. Workflows are in beta.

## How a workflow is built

A workflow is a directed acyclic graph (DAG) of nodes and edges, owned by one tenant. Its definition declares an input schema, an output schema, the nodes, the edges between them, and optional triggers. There are 15 node types:

| Family | Nodes | What they do |
|---|---|---|
| Control | `start`, `end`, `condition`, `transform`, `compare`, `approval` | Take inputs, return outputs, branch, reshape data, compare values and pause for a human |
| Capability | `agent`, `task_create` | Run one bounded model turn, or create a task |
| Knowledge and data | `vault_search`, `kg_query`, `storage_read`, `storage_write` | Query the knowledge vault and graph, read and write tenant storage |
| Delivery and tools | `deliver`, `deliver_multi`, `mcp_tool` | Send to one or several channels, call an MCP tool |

- **`agent`** runs a single model turn that must return JSON matching its `output_schema`. It times out after 120 seconds by default.
- **`condition`** evaluates a CEL expression and has exactly two outgoing edges, `true` and `false`.
- **`approval`** pauses the run in `waiting_approval` until a person decides, for up to 3,600 seconds by default.
- **`mcp_tool`** stays off until an operator adds the server and tool to the tenant's workflow MCP allowlist.

Only the deterministic nodes `condition`, `transform` and `compare` can write to the run's state. A model node cannot, so it cannot flip a check such as "verified" on its own.

## Drafts, publishing and versions

You edit a draft, validate it and dry-run it. A dry run mocks every node that would change something, and its traces are tagged `dry_run`. Publishing turns the draft into an immutable, numbered version, and runs always use a published version. You can roll back to an earlier one.

At publish time, dewee saves the authoring agent's tool permissions with the version. Later changes to that agent cannot widen what a published version is allowed to do.

A tenant admin or owner can publish directly. Anyone else, including an agent, creates a publish request instead. Only a human admin who is not the requester can approve it, and only while the draft still matches the one that was submitted. If the draft changed in between, the approval is rejected.

## Runs and triggers

| Status | Meaning |
|---|---|
| `queued` | Waiting for a worker |
| `running` | Executing nodes |
| `waiting_approval` | Paused at an `approval` node |
| `succeeded`, `failed`, `cancelled` | Finished |

A run starts from one of four triggers:

- **manual**, from the console, CLI or API. Manual runs work even when the workflow is disabled.
- **cron**, from a schedule whose payload kind is `workflow_run`.
- **agent_tool**, when an agent calls the `workflow` tool.
- **channel_event**, when an inbound channel message matches one of the definition's `channel_inbound` triggers. Each trigger names a channel and a CEL match expression.

Every trigger except manual needs the workflow to be enabled.

## Limits and retries

| Limit | Value |
|---|---|
| Nodes per workflow | 100 |
| Edges per workflow | 200 |
| Definition size | 256 KiB |
| Triggers per workflow | 3 |
| Workflow started by another workflow | Up to 3 levels deep; a workflow cannot start itself |

A failed node gets 3 attempts by default (`settings.max_attempts_default`, or `max_attempts` on the node). The wait starts at 1 second and doubles up to 60 seconds. Only timeouts, provider errors and transient errors are retried. Before a node sends a message, writes to storage or creates a task, dewee saves an idempotency key, so a retry or a restart does not repeat the side effect. A failed run can also be retried from a chosen node.

## What workflows do not do

- There is no exec or script node. Workflows use dewee's own nodes and allowed MCP tools.
- There are no loops and no parallel fan-out. The only branching is through `condition`.
- Public inbound webhooks cannot start a run.
- The Lite edition can create and edit workflows but does not run them.

## Agents, tracing and the CLI

Agents work with workflows through the `workflow` tool. Its actions are `list`, `get`, `draft`, `update_draft`, `validate`, `dry_run`, `request_publish`, `run`, `runs` and `run_status`. There is no publish action: an agent can draft a workflow from a plain-language request, but a person approves it.

Each run creates one trace tagged `workflow`, with a `workflow_node` span for every node attempt and the model calls of each `agent` node beneath it. Stored node inputs and outputs are redacted previews.

```bash
dewee workflows validate -f order-check.json
dewee workflows apply -f order-check.json
dewee workflows publish order-check --yes
dewee workflows trigger order-check --input order_id=A-1042
dewee workflows runs tail <run-id>
dewee workflows runs retry <run-id> --from-node <node-id>
```

Add `-o json` to any command for machine-readable output.

## Related

- [Schedules and workflows in the console](/docs/console/schedules-and-workflows): the canvas, versions and run history.
- [Schedules and heartbeat](/docs/concepts/schedules-and-heartbeat): starting a workflow from a cron job.
- [Tracing and observability](/docs/concepts/tracing): reading a run's spans.
- [Tools and permissions](/docs/concepts/tools-and-permissions): the permissions a published version keeps.
- [CLI reference](/docs/runtime/cli): all `dewee workflows` commands.
