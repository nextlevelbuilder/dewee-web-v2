---
title: Skills and templates
description: Upload custom skills as ZIP archives, check their dependencies, decide which agents and people can use them, and start new agents from skill templates.
section: console
order: 6
screens: [skills, skill-templates]
updated: 2026-09-25
---

A skill is a packaged set of instructions, and sometimes scripts, that an agent can load when a task calls for it. Each skill lives in a `SKILL.md` file with YAML front matter. The **Skills** page has two tabs: **Skills**, where you upload and manage the skills in your workspace, and **Templates**, where you start new agents from ready-made skills.

## Who can use it

Managing skills requires `skills.manage`. The workspace owner and the built-in Admin role hold it; for a Member, grant it through a custom role. See [Members, roles and API keys](/docs/console/members-roles-and-api-keys).

## What you see

The **Skills** tab lists every skill with its type, status, version and dependency health. There are two types:

- **Custom**: skills you or your agents uploaded or published. You can edit, grant, download and delete them.
- **Core**: skills bundled with the runtime, such as the document skills for PDF, Word, Excel and PowerPoint files. The runtime manages them, so they are read-only here.

Search by name, slug or description, filter by status (Active, Archived or Deleted) and sort by name, status or missing dependencies.

::shot{id="skills"}

## Upload skills

1. Select **Upload skills**.
2. Drop one or more ZIP archives, or choose files. Each skill in an archive needs a `SKILL.md` with YAML front matter that includes a `name`. An archive with several skills is split into one upload per skill, up to 50 skills per archive.
3. Optionally, under **Manager agents**, pick agents that should get manager grants on the new skills.
4. Select **Upload** and review the result for each skill: installed, skipped because nothing changed, warning, or failed.

Archives are limited to 20 MB each by default. Your runtime operator can set the limit anywhere from 1 to 500 MB. Slugs use lowercase letters, digits and hyphens.

## Manage a skill

Select **Open** on a row. The detail has four tabs:

- **Profile**: edit the name and description, set the **Visibility** and change the status.
- **Dependencies**: see the packages the skill needs and select **Scan dependencies** to check what is missing.
- **Grants**: give a named agent access, optionally pinned to one version, or give a member access by email.
- **Evolution**: see how often the skill ran, its success rate and its average duration.

Use **Download** to get a copy of a custom skill, and **Delete** to remove it.

### Who can use a skill

**Visibility** decides who can find and load a skill:

| Visibility | Who can use it |
|---|---|
| Private | Only the skill's owner |
| Internal | Only agents and members with an explicit grant |
| Public | Every agent and member in the workspace |

> [!NOTE]
> Public means public inside your workspace. It does not publish the skill to other workspaces or to the internet.

A skill with missing dependencies may not run correctly. Packages come from the **Runtime packages** page, where what you can install depends on your deployment mode; see [Built-in tools, MCP servers and hooks](/docs/console/tools-mcp-and-hooks).

## Start from a template

The **Templates** tab shows skills from the runtime's curated catalog that you can use as starting points for new agents. Browse by category, or scroll through all templates.

::shot{id="skill-templates"}

Each template carries a **ready** or **needs action** badge. Select **Preview requirements** to see why. A template is ready when all three checks pass:

1. The workspace runtime is connected.
2. The template skill is active.
3. No dependencies are reported missing.

When a template is ready, select **Use template**. The agent wizard opens with that template selected; continue from the **Profile** step described in [Agents](/docs/console/agents).

If the tab is empty, no skills have been published to the runtime catalog yet, or the runtime is not reachable.

## Related

- [Skills](/docs/concepts/skills)
- [Agents](/docs/console/agents)
- [Built-in tools, MCP servers and hooks](/docs/console/tools-mcp-and-hooks)
- [Tools and permissions](/docs/concepts/tools-and-permissions)
- [CLI reference](/docs/runtime/cli)
