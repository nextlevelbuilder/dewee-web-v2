---
title: Agent teams and delegation
description: How dewee agents hand work to each other, from cloning themselves to delegating over links to running a team with a lead, members and a shared task board.
section: concepts
order: 8
updated: 2026-09-25
---

One agent does not have to do everything. A dewee agent can clone itself for side work, delegate a task to another agent it is linked to, or lead a team that shares a task board. Which of these an agent can do depends on how it is set up, not on a switch in its prompt.

## Three orchestration modes

| Mode | When it applies | Tools the agent gets |
|---|---|---|
| `spawn` | The agent has no delegation links and is in no team | `spawn` |
| `delegate` | The agent has at least one delegation link | `spawn`, `delegate` |
| `team` | The agent belongs to a team | `spawn`, `delegate`, `team_tasks` |

dewee works out the mode from the agent's setup, checking team first, then delegate, then spawn. Tools that do not fit the mode are hidden, so the model does not waste turns trying them.

## Spawn: cloning the agent

`spawn` starts a sub-agent that is a copy of the calling agent, with a focused task and a reduced tool set. It cannot target a different agent. Its actions are `spawn`, `list`, `cancel`, `steer` (send new instructions) and `wait`. A spawn is asynchronous by default and reports back when it finishes; `mode: "sync"` blocks until it is done.

| Default | Value |
|---|---|
| Sub-agents running at once | 8 (2 on Lite) |
| Spawn depth | 1, so a sub-agent cannot spawn again |
| Children per agent | 5 |
| Finished sub-agents archived after | 60 minutes |

## Delegation over agent links

An agent link lets one agent hand tasks to another. Links are directed, belong to the tenant, and can carry their own user allow and deny lists. The `delegate` tool takes the target's `agent_key`, the `task` and a `mode`:

- **async** (the default) returns at once. The target runs in the background, for up to 10 minutes, and its result is posted back into the original conversation, including Telegram forum topics.
- **sync** waits for the result. The timeout is 300 seconds by default and 600 at most.

A delegation runs in its own session. Its trace records the parent trace (`parent_trace_id`), so you can follow a request from the user through the lead to the member in the trace view. A `subagent_start` hook can block a delegation before it starts.

## Teams: a lead and members

A team has one lead agent and one or more members. Creating a team links the lead to each member automatically. Only the lead receives the `TEAM.md` coordination instructions; members learn what they need through their tools, which keeps their prompts short. Members talk to each other and to the lead through task comments. The older team mailbox has been removed.

A team's settings can limit which users and channels may trigger team work, with deny taking priority over allow. The Lite edition allows one team of up to 5 members, and its task board omits comments, reviews, approvals, attachments and `ask_user`.

## The task board

Every piece of team work is a task, and every task needs an assignee. Agents must search the board before creating a task, which stops two sessions from creating the same one.

| Status | Meaning |
|---|---|
| `pending` | Ready to be picked up |
| `blocked` | Waiting for the tasks in its `blocked_by` list |
| `in_progress` | Claimed by a member |
| `in_review` | Waiting for a person to approve or reject |
| `completed`, `failed`, `cancelled` | Finished |
| `stale` | Stuck, and picked up by recovery |

The `team_tasks` tool covers `create`, `claim`, `complete`, `cancel`, `review`, `approve`, `reject`, `comment`, `progress`, `attach`, `search`, `list`, `get`, `update`, `retry`, `ask_user` and `clear_ask_user`. Admins can also assign a task from the console.

- **Atomic claim.** A claim succeeds only if the task is still pending and unowned, so two members can never hold the same task.
- **Dependencies.** When every task in `blocked_by` is completed or cancelled, the dependent task moves to `pending` and is dispatched.
- **Human review.** A task created with `require_approval` goes to `in_review` when the member submits it, and a person approves or rejects it in the console. A rejection cancels the task and tells the lead.
- **Blocker escalation.** A member that posts a comment of type `blocker` fails the task, and the lead gets an escalation message with the reason and a prompt to retry. This is on by default and can be turned off per team with `blocker_escalation`.

When a member completes a task, the files it wrote are linked to the task and any unblocked tasks are dispatched.

## Dispatch safety and the team workspace

Tasks created during the lead's turn are dispatched after that turn ends, so dependencies are in place first. Several guards stop runaway loops:

| Guard | Behaviour |
|---|---|
| No self-dispatch | A task assigned to the lead itself is failed |
| Circuit breaker | A task fails after 3 dispatch attempts |
| Retry budget | A retry resets the attempt count at most 3 times per task and assignee; reassigning starts a new budget |
| Recovery sweep | Tasks stuck in `pending` are found periodically, and the lead is asked to retry them |

Each team has a workspace for the files its members produce. The scope is `isolated` by default, with one folder per conversation, or `shared`, with one folder for the whole team. A scope holds up to 100 files of up to 50 MB each.

The console and API receive live `delegation.*` and `team.task.*` events, so the task board updates as work moves.

## Related

- [Agent teams in the console](/docs/console/agent-teams): creating teams and reviewing tasks.
- [Tools and permissions](/docs/concepts/tools-and-permissions): what sub-agents may not use.
- [Hooks](/docs/concepts/hooks): allowing or blocking a delegation before it starts.
- [Tracing and observability](/docs/concepts/tracing): following a request across agents.
- [Workflows](/docs/concepts/workflows): fixed multi-step processes instead of open-ended teamwork.
