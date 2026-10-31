---
title: Memory, knowledge base and storage
description: Review and curate what your agents remember, build a knowledge base of documents they can search, edit the knowledge graph, and manage workspace files.
section: console
order: 10
screens: [memory, knowledge-base, storage]
updated: 2026-10-14
---

Agents answer better when they can recall what they learned and look things up. The **Data** group of the menu holds the areas for that: **Memory**, what agents keep across sessions, **Knowledge base** and **Knowledge graph**, the documents and entities they can search, and **Storage**, the files shared across the workspace. Everything here stays inside your workspace.

## Who can use it

| Area | Permission key |
|---|---|
| Memory, view only | `memory.read` |
| Memory, create and edit | `memory.manage` |
| Knowledge base and knowledge graph | `vault.manage` |
| Storage | `storage.manage` |

All of these areas need a connected runtime. See [Members, roles and API keys](/docs/console/members-roles-and-api-keys).

## Memory

**Memory** has three tabs: **Documents**, **Facts** and **Conversation summaries**. Each agent keeps its own memory, so pick one with the **Agent** selector first; it starts on **Workspace assistant**. **Search memory** finds content by meaning, not only by exact words.

::shot{id="memory"}

### Documents

**Documents** lists the memory documents with their path, scope, status, size and when they last changed. The stats at the top show **Documents**, **Visible**, **Archived** and your **Access level**, which is **Manage** or **Read**. Search with **Search paths…**, filter by scope, and turn on **Include archived** to see archived documents too. There are two scopes:

- **Shared**: memory for the whole workspace.
- **Personal**: memory tied to one member.

To add a memory document:

1. Select **New document**.
2. Enter the **Path**, for example `support/refund-policy.md`.
3. Choose the **Scope**. For **Personal**, pick the **Owner** from the members list, or enter their user ID.
4. Write the **Content** and select **Create document**.

Path and scope cannot change after the document is created. Open a document to edit its content and select **Save changes**; the dialog also shows how many chunks it has and whether they are **Embedded**. **Show searchable pieces** lists the chunks, and **Refresh in search** re-reads one document. **Refresh search** re-reads every document so search finds the latest content.

From a row's menu, use **Archive** to take a stale document out of use and **Restore** to bring it back. **Delete document** removes it, and agents can no longer recall it. With `memory.read` only, you can open and read documents but not change them.

> [!NOTE]
> Agents search these documents when they need to recall something, so an outdated document can lead to an outdated answer. Correct or archive stale memory rather than leaving it in place.

### Facts and conversation summaries

**Facts** lists typed facts the agent learned about people and things, with **Subject**, **Predicate**, **Value**, **User**, **Status** and **Valid from**. Open a fact to see where it was learned from and its history. A fact is **Active**, **Disputed**, **Replaced** or **Deleted**. **Accept** or **Reject** a disputed fact, or **Delete fact** to remove a wrong one; the agent stops using it at once.

**Conversation summaries** shows the short summaries the agent writes after conversations. Search them by topic. You see summaries of your own conversations only. Some runtime editions do not keep facts or summaries; the tab then says so.

## Knowledge base

The **Knowledge base** has two tabs: **Documents** for the text your agents can search, and **Graph** for the entities extracted from documents and conversations, with the relations between them. **Knowledge graph** in the menu opens the **Graph** tab directly.

::shot{id="knowledge-base"}

### Documents

Switch the view between **List**, **Folders** and **Link graph**. Search with **Search documents…**, and filter by **Type** (**Document**, **Note**, **Context**, **Memory**, **Skill**, **Episodic** or **Media**) and **Scope** (**Shared**, **Team** or **Personal**). **Semantic search** finds documents by meaning.

To add a document:

1. Select **New document**.
2. Enter a **Title**. The **Path** fills in from the title.
3. Choose the **Type** (**Document**, **Note** or **Context**) and the **Scope**.
4. Write the content in Markdown, check it in **Content preview**, then select **Create document**.

Path and scope cannot change after the document is created. To load files instead, select **Import** and add Markdown, text, JSON or CSV files of up to 2 MB each. Each file becomes a searchable shared document.

Select a document to preview it, see its summary and manage its **Links** to other documents with **Add link**. New documents wait for enrichment, which writes a summary, embeddings for semantic search and suggested links; until then, semantic search may miss them. When documents are waiting, **Rescan** queues them. **Delete document** removes a document from the knowledge base after a confirmation.

### Graph

The **Graph** tab shows **Entities**, **Relations** and **Entity types**. Switch the **View** between **Graph** and **Table**, search with **Search entities…**, filter by entity type, and set a **Node limit**. **Zoom in**, **Zoom out**, **Fit to view** and **Reset view** keep large graphs readable. The runtime returns at most 500 entities and 200 relations, so more may exist.

You can edit the graph:

- **Add entity**: add a person, company, product or topic with a **Name**, **Type** and **Description**.
- **Extract from text**: paste up to 50 KB of notes or a document, and the workspace assistant's model finds the entities and relations in it.
- **Find duplicates**: select **Scan for duplicates**, then for each pair either keep one, which merges the other into it, or select **Not the same**.

Select an entity to see its description, confidence and relations. Set a **Traverse depth** and select **Run traversal** to see what is connected to it. **Delete entity** also removes its relations.

## Storage

**Storage** is a file browser for the workspace. A folder tree sits on the left with **Storage used**, and a breadcrumb path leads back to the top **Storage** folder.

::shot{id="storage"}

1. Open a folder to browse into it, or use the tree or breadcrumb to go back. **Search this folder…** filters the current folder.
2. Select **Upload** to add files to the current folder. Any file type works, uploaded one at a time.
3. Select a file to preview it. Some file types and sizes have no inline preview; download those instead.
4. From a row's menu, use **Download**, **Rename**, **Move** to pick a **Destination folder**, or **Delete**. Deleting a folder also deletes everything inside it.

> [!WARNING]
> Deleting a memory document, a knowledge document, a graph entity or a stored file cannot be undone from the console. Archive memory you might need again instead of deleting it.

## Related

- [Memory and knowledge vault](/docs/concepts/memory-and-knowledge)
- [Agents](/docs/console/agents)
- [Channels, pairing and contacts](/docs/console/channels-and-contacts)
- [Settings and backup](/docs/console/settings-and-backup)
- [Tools and permissions](/docs/concepts/tools-and-permissions)
