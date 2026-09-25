---
title: Usage, activity, traces and health
description: See how much your agents run and what it costs, review who changed what, inspect every agent run span by span, and check your workspace runtime is healthy.
section: console
order: 11
screens: [usage, activity, traces, monitoring]
updated: 2026-09-25
---

Once agents are running, four areas show you what they do. **Usage** counts requests, tokens and estimated cost. **Activity** is the history of changes in the workspace. **Traces** records every agent run in detail. **Runtime health** tells you whether your runtime is reachable and working. All four only show data from your own workspace.

## Who can use it

All four areas require `observability.read`. The workspace owner and the built-in Admin role hold it; give it to a Member through a custom role. See [Members, roles and API keys](/docs/console/members-roles-and-api-keys).

## Usage

**Usage** starts with four totals for the selected period: requests, input and output tokens, estimated cost and error rate. A chart shows requests per day, and a table breaks the totals down.

::shot{id="usage"}

1. Set **From UTC** and **To UTC**. The page opens on the last 30 days, and a query can cover up to 366 days.
2. Choose a **Breakdown**: by agent (the default), provider, model or channel.
3. Optionally narrow to one agent.
4. Read the table: requests, LLM calls, tool calls, errors, tokens, cache, average duration and **Est. cost** for each row.
5. Select **Export CSV** to download the same data.

Usage is aggregated hourly from the last complete hour, so the newest figures lag by about one to two hours. The page shows the hour the data runs to, and a **Usage is delayed** banner when it falls further behind. Usage holds totals only, never prompts, responses or secrets.

> [!NOTE]
> **Est. cost** is an estimate for planning. It is not an invoice, and your provider's own billing is the authority on what you pay.

## Activity

**Activity** lists what people and agents changed in the workspace, newest first, with links to the resources involved. Each entry shows when it happened, the actor, the resource and a status: **Ok**, **Changed**, **Attention** or **Recorded**. When an entry comes from an agent run, it links to the trace, run or session.

::shot{id="activity"}

1. Search by action, actor, resource or trace ID.
2. Filter by actor, resource, action, status or severity (**Success**, **Info**, **Warning** or **Error**).
3. Pick a date range: **Today**, **7 days**, **30 days** or **Custom** with your own dates.
4. Select **Apply filters**.
5. Switch **View** from **List** to **Breakdown** to count entries by action instead of listing them.

## Traces

A trace is the full record of one agent run: every model call, tool call, hook and event, with timing and tokens. **Traces** lists them with the number of matching traces and, for the current page, errors, tokens and cost.

::shot{id="traces"}

To find a run:

1. Search, or filter by status (**Running**, **Completed**, **Error** or **Cancelled**), agent, session, channel, tool and time range.
2. Tick **Errors only** or **Tool calls** to narrow further.
3. Sort by start time, duration, tokens or cost, and set the page size (25 by default).
4. Turn on **Auto refresh** to keep the list current while you watch.

Select a trace to open its detail, or **Open full page** for more room. The detail shows the run's status, duration, tokens and estimated cost, and links to its run and session. Below that:

- **Span tree** and **Timeline**: each step in order, typed as LLM, Tool, Agent, Hook or Event, with its provider, model, tokens and finish reason.
- **Hook executions**: the hooks that ran during the trace.
- **Tool summaries**: a short summary of each tool call.
- **Permitted previews**: short input and output previews, where allowed.

Everything in a trace is redacted before it reaches your browser. To get help with a run, copy the **Redacted support bundle** and send it to support: raw prompts, tool arguments, headers and secrets are left out.

## Runtime health

**Runtime health** checks your workspace runtime without exposing the machines behind it. The summary shows whether the runtime is reachable, the tenant binding, the recent trace error rate and the last heartbeat.

::shot{id="monitoring"}

The overall status is **Healthy**, **Needs attention** or **Offline**. It combines whether the console can reach the runtime, whether the workspace is claimed and how recent traces turned out. Below it:

- **Claim / pairing** shows whether the workspace is claimed, with a link to the **Pairing Inbox**.
- **Capacity signal** is the average run duration across recent traces. It is a stand-in for load, not CPU or memory figures.
- **Activity signal** and a preview of recent activity.

This page never shows hostnames, IP addresses or raw logs.

> [!WARNING]
> If the status says **Awaiting claim**, runtime pages cannot show live data yet. Finish onboarding, or approve the pending pairing request, first.

## Related

- [Tracing](/docs/concepts/tracing)
- [Chat and sessions](/docs/console/chat-and-sessions)
- [Providers and models](/docs/console/providers-and-models)
- [Support and billing](/docs/console/support-and-billing)
- [Secrets, roles and audit](/docs/security/secrets-roles-and-audit)
