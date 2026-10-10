---
title: Decision layer (Jev by TypeSafe)
description: How dewee asks TypeSafe Jev small, typed questions to gate memory writes, read busy-agent intent and label traces. Each use stays off until an operator opts in.
section: concepts
order: 12
updated: 2026-10-10
---

The decision layer lets dewee ask a small, fast model narrow, typed questions instead of paying a full LLM call for them. The model is **Jev**, a "System One" model from TypeSafe. Each question has a fixed shape, such as "is this worth keeping?" or "which of these four intents is this message?", and Jev answers with a choice or a score plus a confidence.

dewee uses Jev in three places. Each one is **off by default** and is switched on separately, so turning one on never turns on another:

| Use | What Jev decides | Config switch |
|---|---|---|
| Memory admission | Whether content is worth writing to memory or the knowledge graph, and which recalled memories are worth adding to a turn | `reflex_enabled` plus `reflex_mode` and per-seam modes |
| Busy-agent intent | What a message means when it arrives while the agent is still working | `intent_classify_mode` |
| Semantic trace evaluation (beta) | Labels on finished traces, such as whether the task succeeded | `trace_semantic_enabled` |

Jev does not route models or tools, write answers or moderate what users say. It only answers the questions listed on this page.

In the console's settings the feature appears as **Decision layer: Jev by TypeSafe**. It is configured once for the whole instance by the operator.

> [!WARNING]
> When any of these uses is on, dewee sends content to a third party, `api.typesafe.ai`. Credentials, email addresses and phone numbers are redacted before each request, but the rest of the memory, message or trace text leaves your server. TypeSafe's zero data retention is available on its enterprise tier only; the early-access tier keeps data under TypeSafe's own terms. Read them before you turn this on for content you cannot disclose.

## Setup and scope

All three uses share one TypeSafe API key, one endpoint and one pinned model, `jev-1.13.0`. The moving `jev-latest` alias is never used, because thresholds are tuned per model version. Store the key without echoing it:

```bash
read -rs KEY && printf '%s' "$KEY" | dewee reflex config set-key
dewee reflex status
```

The configuration is **instance-wide**. Settings resolve from the tenant to the master tenant, so one write at master scope applies to every tenant that has not set its own value. `dewee reflex status` reports `scope: instance` and `key_present`, so you can see what is in effect. A mode other than `off` does nothing until a key is stored.

## Memory admission

Several background jobs turn conversations and documents into memory: channel batches, knowledge-graph extraction, dreaming (memory consolidation), episodic session summaries and the memory flush at the end of a turn. Each of these is a **seam** where Jev can be asked, before the expensive LLM call, whether the content is worth keeping at all. A sixth seam, `retrieval`, works on the read side: it decides which recalled memories are worth adding to the current turn.

### Modes

| Mode | Behaviour |
|---|---|
| `off` (default) | No request to TypeSafe and no span. dewee behaves exactly as if the feature did not exist. |
| `shadow` | Jev is asked and the answer is traced, but it never changes what happens. Use this to observe before you trust it. |
| `gate` | Jev can veto the call when it is confident the content is worthless. For `retrieval`, `gate` means it filters and ranks the recalled memories. |

A veto never loses work silently. Each seam has a deterministic fallback: a flush still writes memory, an episodic summary is still written from a plain summary, dreaming sets the gate aside after 3 vetoes in a row, and `retrieval` injects the normal results. Knowledge-graph extraction is the exception: a vetoed chunk gets no graph edges and is not retried. An operator who asks for extraction directly through the API is never gated.

`shadow` does not change answers but does add latency on seams that run inside a turn, so the memory flush and retrieval seams sample shadow evaluations at 20% and 25% by default.

### Turning it on

`reflex_enabled` plus a stored key is the master switch for all memory-admission traffic. `reflex_mode` sets the default mode for the five write seams. The `retrieval` seam never inherits it: you turn it on with its own per-seam mode.

```bash
dewee reflex config set --mode shadow                  # write seams observe (also sets reflex_enabled)
dewee reflex config set --seam-mode kg_chunk=gate      # one seam vetoes
dewee reflex config set --seam-mode retrieval=shadow   # read side observes
dewee reflex config set --mode off                     # write seams off
dewee reflex config set --disable                      # stop all memory-admission traffic
```

`reflex_mode=off` stops only the write seams. To stop every memory-admission request at once, clear `reflex_enabled` with `--disable`. Rollback is a single config write; nothing is migrated and no stored state needs cleaning up.

### Read-side admission

With `retrieval` on, one batched request per turn scores each recalled memory for usefulness. Admitted memories are ranked and trimmed to a token budget, and when every candidate is rejected no memory section is added at all. Admission leans towards keeping memories: a rejection needs a confident low score, and a low-confidence answer admits the memory.

| Key | Default | Meaning |
|---|---|---|
| `reflex_seam_mode_retrieval` | `off` | `off`, `shadow` or `gate` |
| `reflex_read_timeout_ms` | `1500` | Deadline per evaluation, on the user-visible path |
| `reflex_retrieval_max_candidates` | `10` | Candidates sent per turn |
| `reflex_retrieval_max_tokens` | `200` | Largest injected memory section |
| `reflex_retrieval_admit_threshold` | `0.5` | Usefulness a memory needs to be admitted |
| `reflex_retrieval_min_confidence` | `0.5` | Confidence needed before a memory can be rejected |

Run `retrieval` in `shadow` before `gate` on real traffic. The `reflex.decision` span records the counts and scores but never the memory text.

## Busy-agent intent

When a message arrives for an agent that is already working, dewee has to decide what it means before it can act:

| Intent | What dewee does |
|---|---|
| `status_query` | Replies with progress and drops the message |
| `cancel` | Stops the running work |
| `steer` | Adds the message to the running loop |
| `new_task` | Queues the message as a separate run |

The decision runs in three steps. A deterministic fast path matches obvious messages such as `stop`, `thôi`, `取消` or `?` with no network call; those never reach Jev. Ambiguous messages go to Jev when the mode allows it. Anything Jev cannot answer confidently goes to the generative LLM classifier dewee already used.

| Mode | Behaviour |
|---|---|
| `off` (default) | Fast path plus the generative classifier. No request to TypeSafe and no span. |
| `shadow` | The generative classifier decides. Jev is also asked and its choice is recorded for comparison. |
| `active` | A Jev answer at or above the confidence floor is used. Below it, or on any failure, the generative classifier decides. |

| Key | Default | Meaning |
|---|---|---|
| `intent_classify_mode` | `off` | `off`, `shadow` or `active` |
| `intent_classify_confidence_threshold` | `0.75` | Confidence floor for using a Jev answer |
| `intent_classify_confidence_threshold.<locale>` | instance floor | Per-language floor, such as `.vi` |
| `intent_classify_timeout_ms` | `1500` | Deadline per evaluation, at most 5000 |

```bash
dewee reflex config set --intent-mode shadow
dewee reflex config set --intent-confidence 0.8 --intent-confidence-by-locale vi=0.8
dewee reflex config set --intent-mode active
```

This switch is independent of memory admission: turning on intent classification sends only the incoming message, never memory content. Every failure, from a missing key to a timeout, falls back to the generative classifier with a recorded reason. If that classifier also fails, the message is treated as `new_task` and queued, never dropped.

Each decision made while the mode is on writes one `intent.decision` span showing which classifier decided, the confidence, any fallback reason and, in shadow mode, whether Jev agreed. The message text is never stored. Agreement with the generative classifier is not accuracy, so judge `active` against a human-labelled sample.

## Semantic trace evaluation

Semantic evaluation is in beta and off until `trace_semantic_enabled` is set and a key is stored. Jev reads a bounded, redacted summary of a finished trace and labels it: task outcome, tool use, retrieval quality, efficiency, whether a human should review it and the likely failure mode. You can sample traces, or always evaluate failed, delegated, multi-tool or retrieval traces.

The labels are **diagnostics only**. They add filters to `dewee traces list`, such as `--semantic-decision`, and never change an agent's behaviour, prompt, tools or trace status. A timeout records a failed evaluation and never blocks the agent. `dewee traces semantic config get` shows whether evaluation is on and why. See [Tracing and observability](/docs/concepts/tracing).

## Limits and safety

All three uses share one request budget and one circuit breaker per process:

- `reflex_budget_rpm` (default 600) caps outbound requests per minute, counting each retry. When the budget runs out, requests are skipped and dewee carries on without Jev.
- After 5 consecutive failures the breaker opens for 30 seconds. An open breaker can only make dewee more permissive: nothing is vetoed and intent falls back to the generative classifier.
- `400`, `401` and `403` errors do not trip the breaker. They mean a bad key or question set and show up in `dewee reflex status` as `misconfigured`.
- The budget, breaker and counters are per process. With several gateway replicas, each replica has its own.

Every path fails open. If TypeSafe is slow, down or unreachable, dewee behaves as it would with the decision layer off.

## Commands

| Command | Use it to |
|---|---|
| `dewee reflex status` | See the key, scope, per-seam mode and sampling, intent settings, breaker, budget and counters. Add `--json` for scripts. |
| `dewee reflex config set` | Change modes, sampling, thresholds and timeouts, or `set-key` to store the key |
| `dewee reflex test --set <seam> --state-file <file>` | Ask one seam's questions about a sample and see the answer |
| `dewee reflex eval --labels <file.jsonl> [--sweep]` | Score thresholds against a human-labelled sample |

Thresholds ship as conservative starting values, not calibrated ones. Use `dewee reflex eval` with labels written by a person, not by the model, before you move a seam from `shadow` to `gate`.

## Related

- [Memory and knowledge vault](/docs/concepts/memory-and-knowledge): the memory jobs that the admission seams sit in front of.
- [Tracing and observability](/docs/concepts/tracing): the `reflex.decision` and `intent.decision` spans, and semantic evaluation filters.
- [CLI reference](/docs/runtime/cli): every `dewee reflex` command.
