---
title: Memory, knowledge base and storage
description: Review and curate what your agents remember, build a knowledge base of documents they can search, explore the knowledge graph, and manage workspace files.
section: console
order: 10
screens: [memory, knowledge-base, storage]
updated: 2026-09-25
---

Agents answer better when they can recall what they learned and look things up. The **Data** group of the menu holds three areas for that: **Memory**, the notes agents keep across sessions, **Knowledge base**, the documents and graph of facts they can search, and **Storage**, the files shared across the workspace. Everything here stays inside your workspace.

## Who can use it

| Area | Permission key |
|---|---|
| Memory, view only | `memory.read` |
| Memory, create and edit | `memory.manage` |
| Knowledge base and knowledge graph | `vault.manage` |
| Storage | `storage.manage` |

All three areas need a connected runtime. See [Members, roles and API keys](/docs/console/members-roles-and-api-keys).

## Memory

**Memory** lists the documents that make up your agents' memory, with their path, scope, status and when they last changed. The summary at the top counts runtime documents, the ones visible after filtering and the archived ones, and shows whether your access is **Manage** or **Read**.

::shot{id="memory"}

Search by path, filter by scope and turn on **Include archived** to see archived documents too. There are two scopes:

- **Shared**: memory for the whole workspace.
- **Personal**: memory tied to one user.

To add or change a memory document:

1. Select **New memory**, or open an existing document.
2. Enter the **Path**, for example `support/refund-policy.md`.
3. Leave **User ID** blank for workspace-shared memory, or enter a user ID to make it personal.
4. Write the **Content** and select **Save**.

An open document also shows how many chunks it was split into and whether they are embedded for search. Use **Archive** to take a stale document out of use and **Restore** to bring it back. **Delete** removes it permanently from the runtime. With `memory.read` only, you can open and read documents but not change them.

> [!NOTE]
> Agents search these documents when they need to recall something, so an outdated document can lead to an outdated answer. Correct or archive stale memory rather than leaving it in place.

## Knowledge base

The **Knowledge base** has two tabs: **Documents** for the text your agents can search, and **Graph** for the people, organisations, products and other entities extracted from memory, with the links between them. The menu also opens the graph directly as **Knowledge graph**.

::shot{id="knowledge-base"}

On **Documents**, filter by scope (**Shared**, **Team** or **Personal**) and type (**Document**, **Note** or **Context**). To add a document:

1. Select **Create or import**.
2. Enter a **Title** and choose the **Type** and **Scope**.
3. Type the content, or use **Import text file** to load a `.md`, `.txt`, `.json` or `.csv` file.
4. Check the **Content preview**, then select **Create document**.

Previews are redacted before they reach your browser. Deleting a document asks for confirmation and is recorded in the audit log.

On **Graph**, search entities, filter by entity type and select an entity to see its description, confidence and relations. **Traverse** follows its relations to show what is connected to it. Zoom, fit to view and a node limit keep large graphs readable. The graph is read-only: the runtime builds it from memory and merges duplicate entities for you, so an empty graph fills in as agents work.

## Storage

**Storage** is a file browser for the workspace. It shows how many items, folders and files the current folder holds, with a breadcrumb path back to **Root**.

::shot{id="storage"}

1. Open a folder to browse into it, or use the breadcrumb to go back.
2. Select **Upload** to add a file to the current folder.
3. Use **Preview** to view a file in the browser. Large files and some file types are download-only.
4. Use **Download** to save a file, **Move** to move or rename it by entering a new path, and **Delete** to remove it after confirming.

Paths always stay inside the workspace, so a move to an absolute path or outside the workspace is refused.

> [!WARNING]
> Deleting a memory document, a knowledge document or a stored file cannot be undone from the console. Archive memory you might need again instead of deleting it.

## Related

- [Memory and knowledge vault](/docs/concepts/memory-and-knowledge)
- [Agents](/docs/console/agents)
- [Channels, pairing and contacts](/docs/console/channels-and-contacts)
- [Settings and backup](/docs/console/settings-and-backup)
- [Tools and permissions](/docs/concepts/tools-and-permissions)
