---
title: Agent teams and approvals
description: Group agents into teams with a lead and a shared task board, link agents for delegation, and review the tasks and approval requests your agents raise.
section: console
order: 4
screens: [teams]
updated: 2026-09-25
---

A single agent can handle a lot, but some work goes better when several agents share it. An agent team gives one lead agent a set of member agents and a shared task board. **Tasks & approvals** is where you follow the work agents run and decide on the actions they are not allowed to take alone.

## Who can use it

| Area | Permission key | What it allows |
|---|---|---|
| Agent teams | `teams.manage` | Create and edit teams, members, tasks and delegation links |
| Tasks & approvals | `tasks.manage` | View agent tasks, approve or deny approval requests |

Changing a team also requires the workspace owner or Admin role. Anyone else sees teams read-only. See [Members, roles and API keys](/docs/console/members-roles-and-api-keys).

## How a team works

Every team has one **lead** agent and any number of member agents. The lead coordinates: it breaks work into tasks on the team's board, assigns them to members and follows them through. Members work their tasks and talk through task comments. Each member joins with the **Member** or **Reviewer** role.

Task board columns follow the task status: **Pending**, **In progress**, **In review**, **Completed**, **Blocked** and **Failed**. When a task needs a person's sign-off, it waits in **In review** until someone moves it on.

::shot{id="teams"}

The page lists each team with its lead, member count and status, plus recent team activity. Search by name, filter by status (Active or Archived) and sort by name, newest or member count.

## Create a team

1. Select **Create team**.
2. Enter a name and a description, or start from a quick preset such as **Support pod**, **Engineering swarm** or **Operations desk**.
3. Pick the **Lead agent**. A team cannot be saved without one.
4. Leave the status as **Active** and select **Save**.
5. Open the team, then under **Members** choose an agent, pick **Member** or **Reviewer**, and select **Add**.

The lead cannot be removed from its own team. To stop using a team without deleting it, set its status to **Archived**.

## Work the task board

1. Open a team and select **Create task**.
2. Enter a subject, a description and a priority, and choose an owner or leave it unassigned.
3. Switch between **Kanban** and **List** views as you prefer.
4. To change a task's status, pick a new one from the selector on its card.

## Delegation links

A delegation link lets one agent hand work to another, inside a team or on its own as a manual link.

1. Under **Delegation links**, select **Create link**.
2. Choose the **Source agent** and **Target agent**.
3. Pick a team, or leave it as **Manual link**.
4. Set the **Direction**: **Outbound** (the default), **Inbound** or **Bidirectional**. Bidirectional asks you to select **Create** a second time to confirm.

You can enable, disable or delete a link later. Deleting a team may turn its team-specific links into manual links.

## Tasks & approvals

**Tasks & approvals** has two tabs, **Tasks** and **Approvals**. The **Approvals** tab shows a badge when requests are waiting.

**Tasks** is in beta. It shows the 30 most recent agent tasks in the workspace, with their agent, model, tokens and status (running, completed, failed or cancelled). Search by subject, agent or model, filter by status, and open **Details** for a task's summary, activity and linked session. Raw task content, prompts and tool payloads are left out.

**Approvals** lists requests from agents that need a person to decide before they continue, for example running a shell command or installing a package. Each request shows a command summary, risk, working directory, the policy rule that matched, the agent's reason and expected effects, and when it expires.

1. Open the **Approvals** tab. It shows **Actionable** requests first; switch to **All**, **Pending**, **Approved**, **Denied** or **Expired** as needed.
2. Select **Details** to read the full request.
3. Select **Approve**, or **Deny** and enter a denial reason.

Every decision is written to the workspace audit trail.

> [!NOTE]
> Approvals are decided only on this page or with the `dewee packages approvals` command. Buttons in a chat conversation cannot approve a request.

## Related

- [Agent teams and delegation](/docs/concepts/agent-teams)
- [Tools and permissions](/docs/concepts/tools-and-permissions)
- [Agents](/docs/console/agents)
- [Schedules and workflows](/docs/console/schedules-and-workflows)
- [CLI reference](/docs/runtime/cli)
