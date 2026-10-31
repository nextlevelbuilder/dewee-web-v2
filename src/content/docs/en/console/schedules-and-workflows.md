---
title: Schedules and workflows
description: Run agents on a timetable, build versioned workflows that chain agents, knowledge and delivery steps, then publish them and follow every run.
section: console
order: 8
screens: [schedules, workflows, workflow-runs]
updated: 2026-10-14
---

Not all agent work starts with a chat message. **Schedules** send a message to an agent at a set time or interval, such as a morning digest or an hourly check. **Workflows** go further: they chain steps like agent calls, knowledge search and message delivery into a versioned sequence you can test before it goes live. Both sit in the **Capabilities** group of the menu.

## Who can use it

Both areas require `tasks.manage`. For workflows, creating, publishing, rolling back, enabling and deleting also need the workspace owner or an admin; the runtime checks this on top of the permission key. A publish by anyone else becomes an approval request, described under [Workflows](#workflows). See [Members, roles and API keys](/docs/console/members-roles-and-api-keys).

## Schedules

The list shows each schedule with its **Status**, **Owner**, **Next run** and **Last run**. Status is **Enabled**, **Paused** or **Errored**. The stats at the top count **Schedules**, **Enabled** and **Errors**. Search with **Search schedules…** and filter by **Status**.

::shot{id="schedules"}

To create a schedule:

1. Select **New schedule**.
2. Enter a **Name** in lowercase letters, numbers and dashes.
3. Pick the **Agent** that runs it. If you cannot list agents, enter the **Agent ID** instead, or leave it blank for the default agent.
4. Set the **Time zone**. Runs use this time zone regardless of the viewer's own.
5. Under **Repeat**, choose:
   - **Once**: runs one time at the date and time in **Run at**.
   - **At a fixed interval**: runs **Every** so many **Seconds**, **Minutes**, **Hours** or **Days**.
   - **On a calendar schedule**: under **Run on**, pick **Hourly**, **Daily**, **Weekly** or **Custom**. **Custom** takes a five-field **Cron expression**, for example `0 9 * * 1-5` for 09:00 on weekdays. The other options show the **Next runs**.
6. Write the **Message**: what the agent receives each time the schedule runs.
7. Turn on **Stateless run** if each run should start a fresh session instead of continuing the last one. Turn on **Delete after run** to remove the schedule once it has run. Turn off **Enabled** to keep the schedule without running it.
8. Optionally, under **Delivery**, turn on **Deliver output to a channel**, then pick the **Channel** and enter the **Recipient**: a chat, group or user ID on that channel. Without delivery, the output stays in the schedule's session.
9. Turn on **Wake heartbeat on run** to trigger the agent's heartbeat right after each run.
10. Check the runtime's preview of upcoming runs, then select **Create schedule**.

From a row's menu, use **Pause** or **Resume**, **Run now** to start a run at once, **Edit** to change it with **Save changes**, or **Delete**. Deleting asks you to confirm with **Delete schedule**; the schedule stops running immediately and this cannot be undone.

By default, a failed scheduled run is retried up to three times, with a wait that starts at 2 seconds and doubles up to 30 seconds between attempts. The operator's runtime configuration can change this.

Select a schedule to open its detail, with four tabs:

- **Overview**: the agent, time zone, message, options, delivery and the **Last error**, if any.
- **Run history**: each run with **Started**, **Duration**, **Status**, **Tokens** and **Output**.
- **Activities**: configuration changes to the schedule.
- **Access**: the roles that can manage schedules, with **Manage roles**. Schedule access is workspace-wide.

## Workflows

A workflow is a graph of steps, called nodes, that runs from **Start** to **End**. The **Workflows** page has two tabs: **Workflows** and **Runs**.

::shot{id="workflows"}

The **Workflows** tab lists each workflow with **Name**, **Enabled**, **Version**, **Last run** and **Next run**; **Next run** is not reported yet. Search with **Search workflows…**. A row's switch turns the workflow on or off, and its menu offers **Open editor**, **Run now**, **Duplicate**, **Enable** or **Disable**, and **Delete**.

To build and publish one:

1. Select **New workflow**. Enter a **Name**, check the **Slug**, the stable identifier the runtime uses, and add an optional **Description**.
2. Under **Start from**, choose **Blank canvas** or **Basic template**, then select **Create and open editor**.
3. In the editor, select **Add node** to place steps on the canvas: **Agent**, **Approval**, **Compare**, **Condition**, **Deliver**, **Deliver to many**, **Knowledge graph**, **MCP tool**, **Read file**, **Write file**, **Create task**, **Transform** and **Vault search**. Select a node to edit it under **Properties**.
4. The draft saves on its own; the toolbar shows **Saving…** and **Draft saved**. The **Validation** panel checks the saved draft and lists issues, or **No issues found**. Use **Check again** to re-run it.
5. Select **Publish**. In **Publish current draft**, confirm with **Publish as version** and the new version number. The runtime validates the draft and publishes it as a new version; runs always use the published version, and the draft stays editable.
6. Select **Test run** to try the published version. Enter the **Inputs** as a JSON object, choose **Dry run** or **Live run**, then **Start dry run** or **Start live run**.

Owners and admins publish directly. When an agent, or a member who is not the workspace owner or an admin, publishes a workflow, the runtime creates a publish approval request instead. Someone other than the requester must approve it, and the approval covers the draft as it was: if the draft changes, the approval is refused. These requests appear on the **Approvals** tab of **Tasks & approvals**; see [Agent teams and approvals](/docs/console/agent-teams).

> [!WARNING]
> A live run performs real actions: messages are delivered and files and tasks are written. Use **Dry run** first.

To edit settings, schemas or triggers the canvas does not cover, open **Edit definition JSON** from the toolbar menu. The **Definition JSON** sheet holds the full draft, and **Save draft** replaces the draft exactly as written.

**Versions** lists published versions. Select **Rollback** on an earlier version to make runs use it from now on; the draft does not change. A published version is read-only; select **Start a new draft** to change it. **Delete workflow** removes the workflow, its draft and its published versions, and triggers that target it stop running. This cannot be undone.

## Workflow runs

The **Runs** tab lists runs across this workspace's workflows, most recent first, with **Workflow**, **Trigger**, **Status**, **Started** and **Duration**. Search with **Search by workflow or run ID…** and filter by **Status**.

::shot{id="workflow-runs"}

- **Trigger** is **Manual**, **Schedule**, **Agent** or **Channel event**. Runs started from **Test run** are marked **Test**.
- **Status** is **Queued**, **Running**, **Waiting for approval**, **Succeeded**, **Failed** or **Cancelled**.

Select a run to open it. The page shows the run's status, trigger, mode, version and node count, then **Inputs and outputs**, the **Node timeline** and **Node executions**, with the input and output of each node. Select **Open trace** for the full execution in [Traces](/docs/console/monitoring), or **Open workflow** to go to the editor. While a run is active you can **Cancel run**. A failed run offers **Retry run**, which starts a new attempt from the beginning with the same input.

> [!NOTE]
> The runtime returns only the latest 50 runs of each workflow, and with many workflows the **Runs** tab covers only the first ones. A banner says when the list is incomplete. Open a workflow and check **Recent runs** to see its own runs.

## Related

- [Workflows](/docs/concepts/workflows)
- [Schedules and heartbeat](/docs/concepts/schedules-and-heartbeat)
- [Agent teams and approvals](/docs/console/agent-teams)
- [Usage, activity, traces and health](/docs/console/monitoring)
- [CLI reference](/docs/runtime/cli)
