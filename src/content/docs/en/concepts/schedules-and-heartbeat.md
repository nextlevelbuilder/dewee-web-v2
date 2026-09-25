---
title: Schedules and heartbeat
description: How dewee runs agents on a timer, from cron jobs with retries and run history to the heartbeat checklist, and how queued messages share the scheduler.
section: concepts
order: 9
updated: 2026-09-25
---

A dewee agent does not have to wait for someone to message it. A cron job runs an agent turn or a workflow at a set time or interval. A heartbeat wakes an agent on a fixed interval to work through its own checklist. Both go through the same scheduler that queues chat messages, so timed work and live conversations do not collide.

## Cron jobs and schedule types

A cron job belongs to one agent and pairs a schedule with a payload. The scheduler checks for due jobs every second.

| Kind | Runs | `--schedule` value |
|---|---|---|
| `at` | Once, at a point in time | `at:2026-10-01T09:00:00+07:00` |
| `every` | At a fixed interval | `@every 30m` or `every:30m` |
| `cron` | On a cron expression | `0 9 * * 1-5` |

You can also pass the schedule as JSON, which is how a job gets its own timezone: `{"kind":"cron","expr":"0 9 * * 1-5","tz":"Asia/Ho_Chi_Minh"}`. Cron expressions without `tz` use the gateway's `default_timezone`.

The payload decides what a run does. `agent_turn` sends the job's message to the agent as a normal turn. `workflow_run` starts a workflow with the inputs you give it, and the workflow must be enabled. A job can also carry these options:

| Option | Effect |
|---|---|
| `deliver`, `deliverChannel`, `deliverTo` | Post the result to a channel and chat. Without them, the result stays in run history |
| `stateless` | Run without keeping session state |
| `wakeHeartbeat` | Wake the agent's heartbeat once the job completes |
| `deleteAfterRun` | Remove the job after it has run |

If the agent's reply contains `NO_REPLY` as a word, delivery is skipped for that run.

## Retries, timeouts and run history

The `cron` section of the gateway config sets these defaults:

| Setting | Default |
|---|---|
| `max_retries` | 3 retries after the first attempt (0 turns retries off) |
| `retry_base_delay` | 2 seconds, doubling each time |
| `retry_max_delay` | 30 seconds, with ±25% jitter |
| `job_timeout` | 10 minutes per run |
| `default_timezone` | IANA name for cron expressions without their own `tz` |

Every run is recorded with its status, any error, a summary of the output, its duration and token counts. `dewee cron runs` pages through that history.

```bash
dewee cron create --name morning-brief --agent <agent-id> --schedule "0 8 * * 1-5" --message "Summarise overnight tickets" --deliver --channel telegram --to <chat-id>
dewee cron create --name order-sweep --agent <agent-id> --schedule "@every 1h" --workflow order-check --input region=south
dewee cron list --all
dewee cron run morning-brief --force
dewee cron runs morning-brief --limit 50
dewee cron toggle <job-id> false
```

`--force` runs a job now even if it is not due.

## The session queue and lanes

Every agent run goes through the scheduler, and messages to a session wait in that session's queue. A DM session runs one turn at a time, and a group session runs three or more. When a session's history passes 60% of the model's context window, it drops back to one.

| Queue setting | Default | Meaning |
|---|---|---|
| `mode` | `queue` | `queue` and `followup` wait their turn; `interrupt` cancels the current run and starts the new message |
| `cap` | 10 | Messages held per session |
| `drop` | `old` | When full, `old` drops the oldest message and `new` rejects the incoming one |
| `debounce_ms` | 800 | Messages sent in quick succession are merged into one turn |

In a chat, `/stop` cancels the oldest running turn and `/stopall` cancels all of them and empties the queue.

Across the gateway, runs are split into lanes so one kind of work cannot starve another: `main` allows 30 runs at once, `subagent` 50, `team` 100 and `cron` 30. Cron jobs and heartbeats both use the `cron` lane.

## Heartbeat

A heartbeat is a periodic check-in. Each agent can have one, driven by a `HEARTBEAT.md` checklist among its context files. Set it up on the **Heartbeat** tab of the agent's page in the console, with the CLI, or through the agent's own `heartbeat` tool.

| Setting | Default |
|---|---|
| Interval | 1,800 seconds, with a minimum of 300 |
| Isolated session | On, so each run starts fresh and its session is deleted afterwards |
| Light context | Off. When on, only the checklist is loaded, not the other context files |
| Retries | 2 (0 to 10), waiting 1 second, then 2 |
| Active hours | None, so it runs around the clock. Set a start and end as HH:MM in an IANA timezone (UTC by default); the window can pass midnight |
| Delivery | A channel and chat ID; `dewee heartbeat targets` lists the chats the agent already uses |

The gateway checks for due heartbeats every 30 seconds. A run is skipped when it falls outside active hours, when the agent is busy with other work, or when `HEARTBEAT.md` is empty or missing. A busy agent is tried again on the next check. When a heartbeat is first enabled, its start is offset by up to 10% of the interval, so agents with the same interval do not all run together.

If the reply contains `HEARTBEAT_OK`, the run is logged as suppressed and nothing is sent. Otherwise the reply goes to the delivery chat. A heartbeat can also be woken early by **Test** in the console, by the agent calling its `heartbeat` tool with `test`, or by a cron job with `wakeHeartbeat`.

```bash
dewee heartbeat get <agent-id>
dewee heartbeat set <agent-id> --enabled --interval-sec 3600 --timezone Asia/Ho_Chi_Minh
dewee heartbeat test <agent-id>
dewee heartbeat logs <agent-id> --limit 50
dewee heartbeat targets <agent-id>
dewee heartbeat toggle <agent-id> --enabled=false
```

## Heartbeat or cron?

| | Heartbeat | Cron job |
|---|---|---|
| Best for | Routine checks with nothing to say most of the time | Any scheduled task or workflow |
| Per agent | One | Many |
| Schedule | Fixed interval, at least 5 minutes | `at`, `every` or a cron expression |
| Instructions | `HEARTBEAT.md` | The message stored in the job |
| Quiet runs | `HEARTBEAT_OK` suppresses delivery | `NO_REPLY` suppresses delivery |
| Active hours | Built in | Not built in |
| Agent busy | Skips and tries again | Runs anyway |
| Retries | 2 by default, 1 to 2 seconds apart | 3 by default, 2 to 30 seconds apart |
| Model override | Yes | No |

## Related

- [Schedules and workflows in the console](/docs/console/schedules-and-workflows): creating jobs and reading run history.
- [Workflows](/docs/concepts/workflows): what a `workflow_run` job starts.
- [Agent loop](/docs/concepts/agent-loop): what happens inside each scheduled turn.
- [Tracing and observability](/docs/concepts/tracing): inspecting a scheduled run.
- [CLI reference](/docs/runtime/cli): all `dewee cron` and `dewee heartbeat` commands.
