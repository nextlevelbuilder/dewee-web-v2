---
title: Skills
description: How dewee skills are packaged, found and loaded into the prompt, who can use them, how agents publish their own, and how skills improve over time with review.
section: concepts
order: 5
updated: 2026-09-25
---

A skill is a reusable set of instructions, with optional scripts and reference files, that an agent loads when a task calls for it. Skills keep the system prompt short: the agent sees a one-line summary of each skill and reads the full instructions only when it needs them.

## What a skill is

A skill is a folder with a `SKILL.md` file at its root, plus any companion files such as `scripts/` or `references/`. The file starts with front matter:

```yaml
---
name: invoice-review
slug: invoice-review
description: Check supplier invoices against purchase orders and flag mismatches.
deps:
  - pip:openpyxl
  - system:pandoc
---
```

`name` and `description` are what the agent sees when it decides which skill to use. `deps` lists what the skill needs, with the prefixes `pip:`, `npm:`, `github:` and `system:`; `exclude_deps` removes false positives when dewee scans the scripts itself. Check and install them with `dewee skills deps check` and `dewee skills deps install`.

## Where skills come from

Skills load from five tiers. When two tiers have a skill with the same name, the higher tier wins.

| Tier | Source |
|---|---|
| 1 (highest) | The agent's workspace |
| 2 | Project skills in the workspace's `.agents` folder |
| 3 | Personal skills in `~/.agents` |
| 4 | Global and managed skills stored by the runtime, including uploads |
| 5 (lowest) | Built-in skills shipped with dewee |

The built-in core skills are `pdf`, `docx`, `xlsx`, `pptx`, `skill-creator`, `workspace-organizing` (beta) and `dewee`. They are public to every agent, cannot be edited, and are archived if their dependencies are missing. Edits to a `SKILL.md` on disk are picked up on the next turn, after a 500 ms debounce.

## How an agent finds the right skill

If an agent can use 60 skills or fewer and their summaries fit in about 3,000 tokens, all summaries are placed in the prompt. Beyond that, the prompt tells the agent to call `skill_search`, which ranks skills with keyword search (BM25, top 5) blended with vector similarity, weighted 0.3 to 0.7. Up to 10 pinned skills (`other_config.pinned_skills`) are always in the prompt.

Once it has chosen, the agent calls `use_skill`, which records the skill as in use, and reads its `SKILL.md`. Users can also pick a skill directly at the start of a message:

| Command | Effect |
|---|---|
| `/<slug> <prompt>` | Runs the prompt with that skill |
| `/use <slug-or-name> <prompt>` | The same, by slug or display name |
| `/list-skills` | Lists the skills available here |
| `/help <slug-or-name>` | Shows what a skill does and how to use it |

Slash commands are on by default and can be turned off per tenant with `skills.slash_commands.enabled`.

## Access and grants

Each skill has an access mode, shown in the console as its **Visibility**:

| Mode | Who can use it |
|---|---|
| `private` | Only the user who owns it |
| `internal` | Agents and users with an explicit grant |
| `public` | Every agent and user in the tenant |

"Public" means the whole tenant, not the internet. On top of that, an agent's skill allow list can narrow what it sees: unset means every accessible skill, an empty list means none. A channel can narrow it further per request, for example per Telegram forum topic.

```bash
dewee skills access set <skill-id> --mode internal
dewee skills grant agent <skill-id> <agent-id>
dewee skills access effective <skill-id> --agent <agent-id>
```

## Adding and publishing skills

- **Upload.** `dewee skills upload <dir-or-zip>` packages a folder or sends an existing ZIP, and the skill appears under custom skills in the console. The size limit is 20 MB by default, configurable from 1 to 500 MB. `dewee skills promote <slug>` uploads a personal skill from `~/.agents`.
- **Content guard.** Before anything is written, `SKILL.md` is scanned against 25 rules covering destructive commands, code injection, credential access, path traversal, SQL drops and privilege escalation. Any match rejects the skill. `SKILL.md` is limited to 100 KB and each companion text file to 2 MB.
- **Agent publishing.** An agent can publish a folder from its workspace with `publish_skill`. The new skill is private to the user and granted to that agent, which makes it internal. Publishing the same slug again creates a new version. Built-in slugs are reserved.
- **Agent editing.** With `skill_manage`, available only when skill learning is on, an agent can create, patch or delete skills it owns. Deleted skills are moved to a trash folder, not erased.

## Improving skills over time

Two separate features help skills get better, and neither changes a skill without review.

**Skill learning** (`skill_evolve` in the agent's `other_config`, off by default, predefined agents only) teaches an agent when a task is worth saving. It adds guidance to the prompt, reminders at 70% and 90% of the iteration budget, and after a task with at least 15 tool calls (`skill_nudge_interval`) asks the user "save as skill" or "skip". Nothing is saved without that answer.

**Skill self-evolution** tracks how each skill performs. Runs of `use_skill` and slash commands are recorded, the agent can read its own recent traces as evidence, and improvement suggestions are queued. The mode is `suggest_only` (the default) or `auto_analyze`, and in neither mode is a skill patched automatically. An admin approves and applies a suggestion, which creates a new version; built-in skills are never changed.

```bash
dewee skills evolve status <skill>
dewee skills metrics <skill>
dewee skills suggestions list <skill>
dewee skills suggestions apply <skill> <suggestion-id> --approve
```

## Related

- [Skills in the console](/docs/console/skills): browsing, uploading and granting skills.
- [Tools and permissions](/docs/concepts/tools-and-permissions): the tools a skill's scripts run through.
- [The agent loop](/docs/concepts/agent-loop): how the prompt is built each turn.
- [CLI reference](/docs/runtime/cli): all `dewee skills` commands.
- [Security model](/docs/security/overview): other guards on agent-written content.
