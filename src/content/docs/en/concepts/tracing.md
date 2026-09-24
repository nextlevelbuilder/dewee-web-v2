---
title: Tracing and observability
description: What dewee records for every agent run, how long traces are kept, how cost and usage are totalled, and how to read traces from the console, CLI, API or OTel.
section: concepts
order: 10
updated: 2026-09-25
---

Every agent run in dewee leaves a trace: a record of what the agent was asked, which models and tools it called, how long each step took, what it cost and how it ended. Traces are the first place to look when an answer is wrong, slow or expensive. They are written in the background, so recording them does not slow a run down.

## What a trace records

A trace covers one agent run. It stores:

- the agent, user, channel, session key and run ID;
- start and end time, duration, and a status of `running`, `completed`, `error` or `cancelled`;
- previews of the input and the final output;
- totals for input and output tokens, cost, model calls and tool calls;
- tags, such as `workflow` for a workflow run, and the team when the run is team work.

When one agent delegates to another, the delegate's run gets its own trace that points back through `parent_trace_id`, so you can follow a request across agents. If a cancelled run has not stopped after 3 seconds, its trace is marked `cancelled` anyway, so it is not left looking busy.

## Span types

A trace is made of spans, one for each step:

| Span type | Records |
|---|---|
| `agent` | The run as a whole; the run's other spans sit beneath it |
| `llm_call` | One model call, with the model, token counts, cost and finish reason |
| `tool_call` | One tool call, with the tool name, input, output and duration |
| `embedding` | An embedding request, for example during memory search |
| `event` | A point-in-time marker, such as `delivery.sent` or `delivery.failed` when a reply goes out to a channel |
| `workflow_node` | One attempt of a workflow node; an `agent` node's model and tool calls sit beneath it |

Token and cost totals on a trace are summed from `llm_call` spans only, so nothing is counted twice.

## Retention and previews

| Setting | Value |
|---|---|
| Retention | 7 days, after which traces and their spans are deleted |
| Pruning | Every 8 hours |
| Preview size | Up to 40,000 characters for each input or output |
| Verbose previews | Up to 200,000 characters, when an operator turns on verbose tracing |
| Span buffer | 1,000 spans, written to the database every 5 seconds |

Previews are cut at the limit, so a long prompt or tool result may be incomplete. Images in model input are replaced with a placeholder that gives their type and size. If a burst of activity fills the span buffer, the extra spans are dropped and a warning is logged.

## Cost and usage snapshots

dewee prices each model call from the rates you set under `telemetry.model_pricing`, keyed by `provider/model` or by the model name alone. Input, output, cache read and cache write tokens each have a rate, and reasoning tokens can have their own. A model with no pricing entry shows a cost of 0.

At five minutes past every hour (UTC), a background worker rolls the previous hour into usage snapshots per agent, channel, provider and model. A snapshot holds requests, errors, unique users, tokens, cost, tool calls and average duration. Snapshots are not pruned with traces, so usage history outlives the 7-day trace window.

> [!CAUTION]
> `dewee usage snapshots rebuild --from <start> --to <end>` deletes the snapshots in that range and recomputes them from traces. For hours older than 7 days the traces are already gone, so a rebuild loses those totals.

## Reading traces

In the console, the **Traces** screen searches runs and opens each one as a redacted span tree with timing and token use. The same data is available over HTTP:

| Endpoint | Returns |
|---|---|
| `GET /v1/traces` | Traces, filtered and paged (50 per page by default) |
| `GET /v1/traces/{id}` | One trace with all its spans |
| `GET /v1/traces/{id}/export` | A gzipped trace tree with spans and child traces |
| `GET /v1/traces/follow` | Changes for one session or agent, for polling |
| `GET /v1/runs/{runID}/timeline` | The saved timeline of a run |

Filters cover text search, agent, user, session, status, channel, time range, token and tool-call ranges, and tool name.

```bash
dewee traces list --status error --limit 20
dewee traces list --agent support --tool <tool-name> --since 2026-09-24T00:00:00Z
dewee traces get <trace-id> -o json
dewee traces export <trace-id> --file trace.json.gz
dewee traces follow --session <session-key> --since 2026-09-25T01:00:00Z
dewee traces timeline <trace-id>
```

`list` returns up to 200 traces a page. To read traces on a remote gateway, pass `--server` and `--token`, or set `DEWEE_SERVER` and `DEWEE_API_KEY`. Explicit flags win.

```bash
dewee --server https://dewee.example.com --token <token> traces get <trace-id> -o json
```

**Semantic evaluation** is in beta and off by default. When an operator turns it on and adds a TypeSafe API key, finished traces are sent to that external classifier, with credentials and personal data redacted, and labelled with signals such as whether the task succeeded. The labels become extra `dewee traces list` filters, such as `--semantic-decision`, and never change how an agent runs. `dewee traces semantic config get` shows whether it is on and why.

## Exporting to OpenTelemetry

Traces always go to dewee's own database. You can also send spans to an OTLP backend such as Jaeger, Grafana Tempo or Datadog. OpenTelemetry export is opt-in at build time: build with the `otel` tag, or build the Docker image with `ENABLE_OTEL=true`. Standard builds leave it out. Then turn it on in the `telemetry` section of the config:

| Key | Default | Meaning |
|---|---|---|
| `enabled` | `false` | Turns export on; an endpoint is also required |
| `endpoint` | None | For example `localhost:4317` for gRPC or `localhost:4318` for HTTP |
| `protocol` | `grpc` | `grpc` or `http` |
| `insecure` | `false` | Skips TLS, for local testing |
| `service_name` | `dewee-gateway` | The service name shown in your backend |
| `headers` | None | Extra headers, such as an auth token |

Spans are exported in batches of up to 100, every 5 seconds. The exporter is implemented but has not yet been validated in production.

## Related

- [Monitoring in the console](/docs/console/monitoring): the Traces screen and usage views.
- [Agent loop](/docs/concepts/agent-loop): the steps each span records.
- [Agent teams and delegation](/docs/concepts/agent-teams): following a request across agents.
- [Workflows](/docs/concepts/workflows): workflow runs and their node spans.
- [CLI reference](/docs/runtime/cli): all `dewee traces` and `dewee usage` commands.
