---
title: Memory and knowledge vault
description: How dewee agents remember across sessions, how memory is searched and consolidated, and how the knowledge vault and graph organise what agents know.
section: concepts
order: 6
updated: 2026-09-25
---

A dewee agent remembers in layers: the conversation in front of it, summaries of past sessions, and a knowledge graph of the people and things it has learned about. The knowledge vault sits on top, linking documents together and searching every layer at once. All of it is scoped to the tenant and the agent, and usually to the user as well.

## Three tiers of memory

| Tier | What it holds | How long it lasts |
|---|---|---|
| Working (L0) | The current session's messages | Until compaction summarises them |
| Episodic (L1) | A summary of each finished session, with a short abstract and key topics | 90 days by default (`episodic_ttl_days`) |
| Semantic (L2) | A knowledge graph of entities and the relations between them | Until a fact is superseded |

Each agent also has memory files: `MEMORY.md` and anything under `memory/`. Just before a session's history is compacted, the agent gets one short turn (up to 5 iterations, 90 seconds) to save durable notes to `memory/YYYY-MM-DD.md`.

## Searching memory

Memory files are split into chunks of up to 1,000 characters and indexed for full-text and vector search. Scores are blended 0.7 vector and 0.3 full-text. A user's own memory gets a 1.2× boost over agent-wide memory and wins when both hold the same passage.

| Tool | What it does |
|---|---|
| `memory_search` | Searches memory files and past session summaries, returning snippets with their path and lines |
| `memory_get` | Reads only the lines it needs from a memory file |
| `memory_expand` | Loads the full summary of a past session by ID |

Agents also get relevant memory without asking. Before each turn, dewee checks the user's message against past session summaries and adds up to 5 abstracts that score at least 0.3 to the system prompt, within about 200 tokens. Tune it with `auto_inject_enabled`, `auto_inject_threshold` and `auto_inject_max_tokens`.

## Consolidation

When a run completes, background workers turn it into long-term memory. Consolidation is on by default (`consolidation_enabled`).

1. **Episodic.** Summarises the session, reusing the compaction summary when there is one, and writes an abstract of about 50 tokens.
2. **Semantic.** Extracts entities and relations from the summary into the knowledge graph.
3. **Dedup.** Merges entities that embeddings show to be the same thing.
4. **Dreaming.** Waits 10 minutes after new summaries arrive, then synthesises a batch of summaries (10 by default) into longer-term knowledge.

## Group chats and passive channel memory

In a Telegram group, memory and workspace files belong to the group, so every member builds on the same context. Permission checks, audit entries and ownership still follow the individual sender.

Passive channel memory lets an agent learn from group conversation that was not addressed to it. A channel admin turns it on per channel instance in `passive_memory`.

| Setting | Default |
|---|---|
| `enabled` | Off |
| `review_mode` | On, so extracted items wait in a review queue |
| `interval_minutes` | 360 (15 to 10,080) |
| `message_cap` / `min_messages` | 100 per run, and at least 5 new messages |
| `allowed_types` | people, projects, decisions, todos, preferences, events |
| Scope | Group chats only |

Messages are redacted before extraction: secrets, tokens, connection strings, payment-like numbers, email addresses, phone numbers, and any users or patterns you exclude. Approved items become session summaries and reach the knowledge graph the same way as session memory.

## The knowledge vault

The vault, shown in the console as **Knowledge Base**, is a registry of documents. It keeps each document's path, title, type, hash and embedding; the content stays in the file.

| Scope | Visible to |
|---|---|
| `personal` | The owning agent |
| `team` | Members of one agent team |
| `shared` | Every agent in the tenant |
| `custom` | A scope you define |

An agent sees its own documents and shared ones, plus team documents when it works for that team.

**Wikilinks.** Writing `[[notes/pricing.md]]` or `[[SOUL.md|persona]]` in a document creates a link, and the target records a backlink. `.md` is added when missing, and a target is matched by exact path, then by file name. You can also link documents yourself:

```bash
dewee vault search --query "renewal terms" --agent <agent-id>
dewee vault link create --from <doc-id> --to <doc-id>
```

**Agent tools.** `vault_search` queries vault documents, session summaries and graph entities in parallel, weighted 0.4, 0.3 and 0.3, and returns 10 results by default. `vault_read` returns a document's full text by ID, including shared and team documents outside the agent's workspace, up to 500,000 bytes by default. There is no agent tool for creating links.

**Limits.** Only registered documents sync from disk, one way from file to vault, after a 500 ms debounce. Full-text search covers title and path; content is found through embeddings. The last write wins, and there is no version history yet.

## The knowledge graph

The graph holds entities such as people, organisations, projects, tasks and locations, and the relations between them. Each fact carries a validity window (`valid_from`, `valid_until`), so an outdated fact is closed instead of deleted. Agents query it with `knowledge_graph_search`, which suits multi-hop questions such as who works on which project.

```bash
dewee kg entities --agent <agent-id> --query "Acme"
dewee kg traverse --agent <agent-id> --entity <entity-id> --depth 2
dewee kg extract --agent <agent-id> --file ./meeting-notes.md --provider <provider> --model <model>
dewee kg dedup scan --agent <agent-id>
```

Manual extraction keeps entities with confidence of at least 0.75, and the dedup scan flags pairs at 0.90 similarity or above for you to merge or dismiss. The console's graph view is in beta. Per agent, `knowledge_graph_enabled` and `knowledge_vault_enabled` in `other_config` are on by default.

Batch writes (vault bulk upload, graph ingest, memory batch upsert) fail as a whole on the first invalid ID.

## Storage and editions

| | Standard (PostgreSQL) | Lite (SQLite) |
|---|---|---|
| Memory and vault search | Full-text and vector (pgvector) | Keyword only |
| Episodic memory and vault | Yes | Yes |
| Knowledge graph | Yes | Off in the Lite edition |

Vector search also needs an embedding provider. Without one, search falls back to full-text.

## Related

- [Memory and knowledge in the console](/docs/console/memory-and-knowledge): browsing memory, the Knowledge Base and the graph.
- [The agent loop](/docs/concepts/agent-loop): compaction and how the prompt is built.
- [Providers, fallback and reasoning](/docs/concepts/providers-and-routing): embedding providers.
- [Multi-tenant isolation](/docs/concepts/multi-tenancy): how memory stays inside a tenant.
- [CLI reference](/docs/runtime/cli): all `dewee memory`, `dewee vault` and `dewee kg` commands.
