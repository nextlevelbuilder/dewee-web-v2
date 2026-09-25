---
title: Schedules and workflows
description: Run agents on a timetable, build versioned workflows that chain agents, knowledge and delivery steps, publish them safely and follow every run.
section: console
order: 8
screens: [schedules, workflows, workflow-runs]
updated: 2026-09-25
---

Not all agent work starts with a chat message. **Schedules** wake an agent at a set time or interval and hand it a prompt, such as a morning digest or an hourly check. **Workflows** go further: they chain steps like agent calls, knowledge search and message delivery into a fixed, versioned sequence you can test before it goes live.

## Who can use it

Both areas require `tasks.manage`. For workflows, **Publish**, rollback, **Delete**, **Dry run** and retrying a run also require the workspace owner or Admin role, checked by the runtime on top of the permission key. See [Members, roles and API keys](/docs/console/members-roles-and-api-keys).

## Schedules

The list shows each schedule with its next run, last run, owner and status (enabled, paused or errored). Search by name, filter by status and sort by schedule, next run, last run or owner. **Recent changes** lists the latest edits to schedules.

::shot{id="schedules"}

To create a schedule:

1. Select **New schedule** and give it a name.
2. Optionally enter the **Agent ID** of the agent that should run it, and set the **Timezone**, for example `UTC` or `Asia/Ho_Chi_Minh`.
3. Choose the type:
   - **One-time**: runs once at the date and time in **Run at**.
   - **Interval**: runs every so many seconds, minutes, hours or days.
   - **Advanced expression**: a five-field cron expression, for example `0 9 * * *` for 09:00 every day.
4. Write the **Prompt**: what the agent should do each time the schedule fires.
5. Tick **Stateless runs** if each run should start without the history of earlier runs. For a one-time schedule, tick **Delete after one-time run** to remove it once it has run.
6. Check the **Next runs** preview, then save.

Use **Toggle** to pause or resume a schedule. Deleting asks you to select **Delete** a second time. Failed runs are retried automatically, up to three attempts.

## Workflows

A workflow is a set of steps, called nodes, that runs from start to finish in a fixed order, with branches where you add conditions. Nodes can call an agent, create a task, search the knowledge vault or graph, read and write storage, ask a person for approval and deliver messages. Workflows cannot run arbitrary code, loop or fan out in parallel. Workflows are in beta.

::shot{id="workflows"}

To build and publish one:

1. On the **Workflows** tab, enter a name, a slug and an optional description, then select **Create draft**.
2. Open the workflow and edit the **Draft definition (JSON)**. The page lists the node types your runtime accepts.
3. Select **Save draft**, then **Validate** to check the definition.
4. Select **Dry run** to try it. Steps that would change something are simulated, so a dry run is safe.
5. Select **Publish**. Each publish creates a new, fixed version; the draft stays editable.
6. Turn the workflow on with **Enable / disable**, or start it right away with **Run now**.

Publishing always needs a person. An agent can draft and validate a workflow and request publishing, but only a workspace owner or admin can approve that request. The approver must be someone other than the requester, and the draft must not have changed since the request.

A workflow can start manually, on a schedule, from an agent or from a channel message, with up to three triggers each. Manual runs work even when the workflow is disabled; the other triggers need it enabled. To undo a bad release, roll back to an earlier version. **Delete** removes a workflow permanently.

## Workflow runs

The **Runs** tab lists recent runs across workflows with their status, mode, trigger, start time and any error. A run is queued, running, waiting for approval, succeeded, failed or cancelled.

::shot{id="workflow-runs"}

Select a run to see its node timeline, version and inputs. Inputs and node payloads are shortened and redacted; select **Open trace** for the full execution in **Traces**. While a run is in progress you can **Cancel run**, and a failed run can be retried with **Retry run**.

> [!NOTE]
> With many workflows, the **Runs** tab shows runs for the first workflows only. Open a workflow to see all of its runs.

## Related

- [Workflows](/docs/concepts/workflows)
- [Schedules and heartbeat](/docs/concepts/schedules-and-heartbeat)
- [Agent teams and approvals](/docs/console/agent-teams)
- [Usage, activity, traces and health](/docs/console/monitoring)
- [CLI reference](/docs/runtime/cli)
