---
title: Usage, activity, traces and health
description: See how much your agents run and what it costs, review who changed what, inspect every agent run span by span, and check your workspace runtime is healthy.
section: console
order: 11
screens: [usage, activity, traces, monitoring]
updated: 2026-10-14
---

Once agents are running, four areas show you what they do. **Usage** counts requests, tokens and estimated cost. **Activity** is the history of changes in the workspace. **Traces** records every agent run in detail. **Runtime health** tells you whether your runtime is reachable and working. All four only show data from your own workspace.

## Who can use it

All four areas require `observability.read`. The workspace owner and the built-in Admin role hold it; give it to a Member through a custom role. See [Members, roles and API keys](/docs/console/members-roles-and-api-keys).

## Usage

**Usage** starts with totals for the selected range: **Requests**, **Tokens**, **Estimated cost** and **Error rate**. A **Requests over time** chart follows, and a table breaks the totals down.

::shot{id="usage"}

1. Pick a date range. The page opens on the last 30 days, and a range can cover up to 366 days. Buckets are in UTC.
2. Choose **Group by**: **Agent**, **Provider**, **Model** or **Channel**.
3. Optionally narrow to one agent with **All agents**, or open **Filters** to match an exact agent ID, provider, model or channel.
4. Read the table: **Requests**, **LLM calls**, **Tool calls**, **Errors**, **Tokens**, **Cache**, **Avg duration** and **Est. cost** for each row.
5. Select **Export CSV** to download the same data.

Usage comes from hourly rollups, so the newest figures can lag by one to two hours. The page shows when the data was last updated, and a **Usage is delayed** banner when the latest rollup has not arrived. Usage holds aggregates only, never prompts or responses.

> [!NOTE]
> **Estimated cost** is an estimate, not an invoice. Your provider's own billing is the authority on what you pay.

## Activity

**Activity** lists what people and agents changed in the workspace, newest first. Each entry shows when it happened, the actor, the resource and a status: **Ok**, **Changed**, **Attention** or **Recorded**.

::shot{id="activity"}

1. Search with **Search actions, actors, resources or trace ids…**.
2. Filter by **When** (**Today**, **Last 7 days**, **Last 30 days** or **Custom range**), **Actor**, **Resource**, **Action**, **Status** or **Severity** (**Success**, **Info**, **Warning** or **Error**).
3. Switch **View** from **List** to **Breakdown** to count entries instead of listing them.
4. Select **Show older activity** to load further back.

Select an entry to open the **Activity event** detail, with its **Identifiers**, **Metadata** and **Related** links to the trace, run or session behind it.

## Traces

A trace is the full record of one agent run: every model call, tool call, hook and event, with timing and tokens. **Traces** lists them with the number of matching traces and, for the current page, errors, tokens and cost. Columns are **Trace**, **Name**, **Agent**, **Channel**, **Started**, **Duration**, **Status**, **Spans**, **Tokens** and **Cost**.

::shot{id="traces"}

To find a run:

1. Search by name, trace ID or session, or filter by status (**Completed**, **Error**, **Running** or **Cancelled**), **Agent**, **Session**, **Channel**, **Tool** and **Time range**.
2. Use **Errors only** or **Has tool calls** to narrow further.
3. Sort the columns and set **Rows per page** (25 by default, up to 200).
4. Turn on **Live tail** to check for new traces every 30 seconds.

Background traces, such as channel memory and knowledge graph work, are hidden by default; turn on **Show background traces** to include them. Use **Views** to save the current filters on this device and reuse them later.

Select a trace to preview it, or **Open full page** for the full detail. The header shows the run's status, duration, tokens and cost, with **Copy trace ID**, **Share link**, **Export JSON** and **Open session**. If the run failed, the root cause is shown first. Below that are three tabs:

- **Overview**: the conversation, the **Timeline** of spans typed as LLM, Tool, Agent, Hook or Event, and **Tool summaries** with calls, errors and average duration per tool.
- **Events & logs**: decision and delivery events, and **Hook executions**, the hooks that ran during the trace.
- **Raw JSON**: the trace data, with the **Redacted support bundle**.

Values in a trace can be redacted before they reach your browser; redacted spans are marked. To get help with a run, copy the **Redacted support bundle** and send it to support: raw prompts, tool arguments, headers and secrets are excluded or redacted.

## Runtime health

**Runtime health** checks your workspace runtime without exposing the machines behind it. The stats show **Runtime reachable**, the **Recent error rate** over the last traces and the **Last heartbeat**, the latest trace or activity.

::shot{id="monitoring"}

The **Runtime status** card shows **Health**, which is **Healthy**, **Needs attention** or **Offline**, with the region, version, uptime, setup status and **Support reference**. Health combines whether the console can reach the runtime, whether the workspace is connected and how recent traces turned out. Below it:

- **Connection & pairing**: the **Workspace connection**, **Paired identities** and **Pending pairing**, with a link to the **Pairing inbox**.
- **Capacity**: average run duration over the last 24 hours. Hourly rollups can lag by one to two hours.
- **Activity signal**: requests per hour over the last 24 hours.
- **What leaves this runtime**: which redacted, workspace-scoped signals this page uses.
- **Recent activity**, with **View all** to open Activity.

A **Runtime needs attention** banner appears when at least 10% of recent traces failed, and **Runtime is offline** when the runtime did not answer.

> [!WARNING]
> If the workspace is not connected to its runtime yet, runtime pages cannot show live data. Finish onboarding, or approve the pending pairing request, first.

## Related

- [Tracing](/docs/concepts/tracing)
- [Chat and sessions](/docs/console/chat-and-sessions)
- [Providers and models](/docs/console/providers-and-models)
- [Support and billing](/docs/console/support-and-billing)
- [Secrets, roles and audit](/docs/security/secrets-roles-and-audit)
