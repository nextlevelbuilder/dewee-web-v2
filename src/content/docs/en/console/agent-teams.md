---
title: Agent teams and approvals
description: Group agents into teams with a lead and a shared task board, link agents for delegation, and review the tasks and approval requests your agents raise.
section: console
order: 4
screens: [teams]
updated: 2026-10-14
---

A single agent can handle a lot, but some work goes better when several agents share it. An agent team gives one lead agent a set of member agents and a shared task board. **Tasks & approvals** is where you follow the work agents run and decide on the actions they are not allowed to take alone.

## Who can use it

| Area | Permission key | What it allows |
|---|---|---|
| Agent teams | `teams.manage` | Open teams, their boards, members and delegation links |
| Tasks & approvals | `tasks.manage` | View agent tasks, approve or reject approval requests |

Without `teams.manage`, the **Agent teams** page tells you your role doesn't include team management. Changing a team, its members, tasks or links also requires the workspace owner or Admin role; anyone else with the key sees teams read-only. See [Members, roles and API keys](/docs/console/members-roles-and-api-keys).

## How a team works

Every team has one **Lead** agent and any number of member agents. The lead coordinates: it breaks work into tasks on the team's board, assigns them to members and follows them through. Members work their tasks and talk through task comments. Each member joins with the **Member** or **Reviewer** role. Teams are made of agents only; workspace people can't be added.

Task board columns follow the task status: **Pending**, **In progress**, **In review**, **Completed**, **Blocked** and **Failed**. A task in any other status, such as **Cancelled**, gets its own column after these. When a task needs a person's sign-off, it waits in **In review** until someone approves or rejects it.

::shot{id="teams"}

The **Agent teams** page shows each team as a card with its lead, members and task progress. Search by name, filter by **Status** (**Active** or **Archived**) and sort by **Name**, **Newest**, **Most members**, **Most tasks** or **Recently updated**. Below the cards are the workspace's **Delegation links** and **Recent team activity**.

## Create a team

1. Select **New team**.
2. Under **Start from**, pick a preset (**Support pod**, **Engineering swarm** or **Operations desk**) to fill in the name and description, or **Blank team**.
3. Enter the **Team name** and an optional **Description**, and leave the **Status** as **Active**.
4. Pick the **Lead agent**. A team cannot be created without one.
5. Optionally add **Member agents**. They join with the **Member** role.
6. Select **Create team**.

To change a team later, use **Edit team** and **Save changes**. To stop using a team without deleting it, set its status to **Archived**. **Delete team** removes its task board and member list; the agents themselves keep working.

## Inside a team

Open a team to see its tabs:

- **Board**: the team's tasks. Switch between **Kanban** and **List**.
- **Members**: add an agent with the **Member** or **Reviewer** role, or remove one. The lead cannot be removed here; change it from **Edit team**.
- **Links**: the delegation links scoped to this team.
- **Activities**: changes to the team's tasks, members and links.
- **Settings**: **Access control** for channels and users, **Orchestration** (how member requests, blockers and follow-up reminders work, and whether conversations share a workspace folder) and **Notifications** (**Direct**, or **Through the lead**, which rewrites updates and uses tokens).
- **Info**: the team's name, description, status, lead agent and when it was created and updated.

## Work the task board

1. Open a team and select **New task**.
2. Enter a **Title**, a **Description** and a **Priority** (0 unless you set one), and choose an **Assignee** or leave it unassigned. Once a task is assigned, it can be handed to another agent but not unassigned.
3. Select **Create task**.

Each task card has a menu:

- **View details** and **Edit task**.
- **Move to…**: change the task's status.
- **Approve** or **Reject**, for a task **In review**. Approving marks it completed. Rejecting cancels it and tells the lead why; an empty reason reads "Rejected by human".
- **Assign**, for a **Pending** task. The agent starts on it right away.
- **Delete task**, for a finished task. This removes its comments, timeline and files.

## Delegation links

A delegation link lets one agent hand work to another, inside a team or on its own as a manual link.

1. Under **Delegation links** on the **Agent teams** page, or on a team's **Links** tab, select **New link**.
2. Choose the **Source agent** and **Target agent**.
3. Pick a **Team**, or leave it as **Manual link**.
4. Set the **Direction**: **Outbound**, **Inbound** or **Bidirectional**. For **Bidirectional**, tick "I understand both agents will be able to hand work to each other."
5. Optionally add a **Description**, then select **Create link**.

A link is **Active** or **Disabled**. Use its menu to **Enable**, **Disable** or **Delete link**. Deleting a team may turn its team-specific links into manual links.

## Tasks & approvals

**Tasks & approvals** has two tabs, **Tasks** and **Approvals**. The **Tasks** tab shows how many tasks are running, and the **Approvals** tab shows how many requests are pending.

**Tasks** lists the agent tasks in the workspace, 50 per page, with their agent, status and last update. Show them as a **Board** or a **List**. Search by task, status, agent, model or progress step, and filter by status (**Running**, **Completed**, **Failed** or **Cancelled**). Select a task to open its detail: status, agent, progress, model, provider, tokens, linked session and timestamps, **Redacted runtime fields**, and **Comments & files**. Raw task content, prompts and tool payloads are left out. To create a task yourself, open a team.

**Approvals** lists requests from agents that need a person to decide before they continue, for example running a command or installing a package. Each request shows the agent, when it was requested and when it expires, its risk and a command summary, which may be redacted.

1. Open the **Approvals** tab. It shows **Actionable** requests first; switch to **All**, **Pending**, **Approved**, **Denied** or **Expired** as needed.
2. Select **Details** to read the full request, including the working directory, the policy rule that matched, the agent's reason, expected effects and evidence.
3. Select **Approve**, or **Reject** and enter a reason. A rejection cannot be sent without one.

Every decision is saved, with its reason, in the workspace audit trail.

> [!NOTE]
> When an agent asks to run a command or install a package during a chat, the request also appears in that conversation as a card with **Approve** and **Deny**. The card uses the same approval as this tab, so the same permissions apply. For a destructive action you type the resource name to confirm, and **Deny** needs a reason. See [Chat and sessions](/docs/console/chat-and-sessions). You can also decide requests with the `dewee packages approvals` command; see the [CLI reference](/docs/runtime/cli).

## Related

- [Agent teams and delegation](/docs/concepts/agent-teams)
- [Tools and permissions](/docs/concepts/tools-and-permissions)
- [Agents](/docs/console/agents)
- [Schedules and workflows](/docs/console/schedules-and-workflows)
- [CLI reference](/docs/runtime/cli)
