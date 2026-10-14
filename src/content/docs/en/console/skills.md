---
title: Skills and templates
description: Upload skill bundles, review files, versions and dependencies, tune optimization, decide who can use each skill, and start agents from templates.
section: console
order: 6
screens: [skills, skill-templates]
updated: 2026-10-14
---

A skill is a packaged set of instructions, and sometimes scripts, that an agent can load when a task calls for it. Each skill is a bundle with a `SKILL.md` file that has YAML front matter. The **Skills** page has three tabs: **Installed**, where you upload and manage the skills in your workspace, **Marketplace**, and **Templates**, where you start new agents from skills.

## Who can use it

Managing skills requires `skills.manage`. The workspace owner and the built-in Admin role hold it; for a Member, grant it through a custom role. See [Members, roles and API keys](/docs/console/members-roles-and-api-keys).

## What you see

The **Installed** tab lists every skill with its tags, source, version, dependency status and an **Enabled** switch. The source is one of:

- **Custom**: skills you or your agents uploaded or published. You can edit, grant, download and delete them.
- **Built-in**: skills bundled with the runtime, such as the document skills for PDF, Word, Excel and PowerPoint files. Dewee maintains them, so they are read-only here; you can still view and download their files.
- **Marketplace**: skills installed from a marketplace.

Search by name, slug, description or tag, and filter by **Source**, **Owner** (**This workspace** or **Built-in**) and **Status** (**Enabled** or **Disabled**). Sort by name, source, version, dependencies or the switch. Each row's menu has **Open**, **Download .zip** and **Delete**.

The **Marketplace** tab does not list skills yet: browsing and installing marketplace skills is not offered to workspaces, so it points you to uploading a bundle instead.

::shot{id="skills"}

## Upload skills

1. Select **Upload skill**.
2. **Upload**: drop one or more `.zip` bundles, or choose files. Each skill in a bundle needs a `SKILL.md` with YAML front matter that includes a `name`. A bundle may hold several skills, up to 50, and each is uploaded on its own.
3. **Validate**: check each skill. A skill whose slug matches an existing one is published as a new version of it; anything else is created as a new skill.
4. **Grants**: optionally pick the agents that can manage the new skills. You can change access later.
5. Select **Create skill** for one new skill, **Publish new version** for a new version of one existing skill, or **Upload *n* skills** for several. Review the result for each skill: installed, skipped because nothing changed, warning or failed, then select **Done**.

Bundles are limited to 20 MB each. Slugs use lowercase letters, digits and hyphens.

## Manage a skill

Select a skill, or **Open** in its row menu, to open its page. The header has the **Enabled** switch, **Download** and a menu with **Edit settings** and **Delete skill**. Below it, a strip shows invocations, activation rate, the number of agents using the skill and its current version. The page has these tabs:

- **Overview**: source, author, visibility, status and tags; the skill's **Dependencies**, with **Scan again** to re-check what is missing; and the bundle's `SKILL.md` as a README.
- **Files**: browse the bundle, such as `SKILL.md`, `scripts/` and `references/`. Files are read-only here; to change them, upload a new version of the bundle. Large or binary files are listed without a preview.
- **Versions**: the published versions, with the current one marked. Only the current version can be downloaded. To publish a new version, upload a bundle with the same slug.
- **Optimization**: switch **Enable optimization** on so the runtime reviews how the skill performs and proposes improvements, and pick the **Mode**: **Suggest only** or **Auto-analyze**. **Usage** shows invocations, successes, failures, abandoned runs and the activation rate across every agent. Under **Suggestions**, **Approve** or **Reject** a pending suggestion, then **Apply** an approved one to publish it as a new version. Nothing changes until someone applies a suggestion.
- **Access**: grant agents or people access to the skill, and change or revoke grants. Agents get **Use** or **Manage**; people get **Use** or **Manage**. An agent grant is pinned to a version: when the skill has several versions, choose the **Version for new agent grants** first. Workspace admins and people with **Manage** on the skill can change access; anyone else sees a view-only notice. Built-in skills follow runtime policy and cannot be granted here. See [Access grants](/docs/security/access-grants).
- **Activities**: changes to the skill's optimization settings and suggestions, then its access activity: grant changes, denials and uses.
- **Settings**: edit the name, description, **Visibility** and **Status**, and use the **Enabled** switch. **Delete this skill**, under **Danger zone**, removes the skill and all its versions; agents lose access immediately.

### Who can use a skill

**Visibility** decides who can find and load a skill:

| Visibility | Who can use it |
|---|---|
| Private | Only the skill's owner |
| Internal | Only agents and members with an explicit grant |
| Public | Every agent and member in the workspace |

> [!NOTE]
> Public means public inside your workspace. It does not publish the skill to other workspaces or to the internet.

A skill that still has grants cannot be made private; revoke the grants first. A status of **Archived** turns the skill off for agents, and **Deleted** hides it from the list.

A skill with missing dependencies may not run correctly. Packages come from the **Runtime packages** page, where what you can install depends on your deployment mode; see [Built-in tools, MCP servers and hooks](/docs/console/tools-mcp-and-hooks).

## Start from a template

The **Templates** tab shows the workspace's skills as starting points for new agents. Filter by category, or show all templates.

::shot{id="skill-templates"}

Select **Preview requirements** on a template to see its checks. A template is ready when all three pass:

1. The workspace runtime is connected.
2. The template skill is active.
3. No dependencies are reported missing.

When a template is ready, select **Use template**. The **Agents** page opens the new-agent dialog with that template already chosen; continue as described in [Agents](/docs/console/agents).

If the tab is empty, no skill in the workspace can start an agent yet, or the runtime is not reachable.

## Related

- [Skills](/docs/concepts/skills)
- [Agents](/docs/console/agents)
- [Built-in tools, MCP servers and hooks](/docs/console/tools-mcp-and-hooks)
- [Tools and permissions](/docs/concepts/tools-and-permissions)
- [CLI reference](/docs/runtime/cli)
