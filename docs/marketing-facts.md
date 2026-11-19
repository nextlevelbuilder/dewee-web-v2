# Marketing facts and the release copy refresh

Every number the site quotes about dewee has one owner and one way to re-check it. This file
records both, so a stale figure is a mistake someone can find in minutes rather than a belief
nobody remembers verifying. The shared values live in `src/content/facts.ts`; pages import
`FACTS` instead of typing the number.

"dewee repo" below means `nextlevelbuilder/dewee`, checked out next to this repository. `<tag>` is
the latest stable tag (`gh release list --repo nextlevelbuilder/dewee --exclude-pre-releases`).

## Figures

| Figure | Value | Shown on | Source and command | Last verified |
|---|---|---|---|---|
| Latest stable release | v3.43.0 (2026-10-29) | Homepage proof, About report card, llms.txt, JSON-LD `softwareVersion` | `FACTS.stableRelease`; `gh release list --repo nextlevelbuilder/dewee --exclude-pre-releases --limit 3`. Date is `published_at` in UTC, not a commit date. `pnpm releases:check` (also the daily `release-metadata.yml` workflow) fails when GitHub has a newer stable release; `-beta.N` tags are prereleases and are ignored | 2026-10-29 |
| Chat channels | 11 | Homepage, Integrations, Features catalogue, llms.txt | `FACTS.channels` = `CHANNELS.length` in `src/content/integrations.ts`; compare with the adapters in dewee `internal/channels/` (Zalo has three variants) | 2026-10-19 |
| Featured model providers | 22 | Homepage, Integrations, Features catalogue, llms.txt, docs (LLM and voice providers) | `FACTS.providers` = `PROVIDERS.length` in `src/content/integrations.ts`; each entry carries the runtime `providerType` and an `auth` mechanism. Always write "featured" next to the number. Compare with dewee `docs/02-providers.md` (Atlas Cloud added in v3.39.0) | 2026-10-29 (v3.42.0) |
| Provider types the runtime accepts | 32 | Homepage FAQ, Integrations, Features catalogue, llms.txt, docs (What is dewee, Providers, fallback and reasoning, LLM and voice providers) | `FACTS.providerTypes`; the ids are in `src/content/provider-types.ts`. In the dewee repo: `git show v<tag>:internal/store/provider_store.go \| awk '/^var ValidProviderTypes/,/^}/' \| grep -c true`. Same 32 at v3.40.0, v3.41.0, v3.42.0 and v3.43.0 (ids checked against `PROVIDER_TYPES` at v3.43.0). The console's type picker (`ui/web/src/constants/providers.ts`) shows 31 because it omits `alibaba_token_plan`; docs and copy follow the runtime. The runtime has no per-edition provider list | 2026-10-29 (v3.43.0) |
| Go test functions | 13,351, shown as "13,000+" | Homepage proof, About report card | `FACTS.goTests`; in the dewee repo: `git grep -h -E '^func Test[A-Z_]' v<tag> -- '*_test.go' \| wc -l` | 2026-10-19 (v3.40.0); v3.42.0 has 15,358, so the rounded figure still holds |
| Go lines under `internal/` | 921,264, shown as "900,000+" | Homepage proof | `FACTS.goLines`; in the dewee repo: `git grep -c '' v<tag> -- 'internal/*.go' \| awk -F: '{s+=$NF} END{print s}'` (tests included) | 2026-10-19 (v3.40.0); v3.42.0 has 1,081,907, so the rounded figure still holds |
| Test cadence | Full suite runs on one preflighted commit before every release | Homepage proof, About report card | dewee commit `e511ada` (#1351, 2026-10-14): pull requests and `dev` pushes no longer run tests. Never write "on every change" or "on every pull request" | 2026-10-19 |
| Stable release history | v3.28 to v3.43, v3.38.1 has no notes | Features releases, Roadmap "Recently shipped" | `RELEASES` in `src/content/releases.ts`; v3.42.0's notes are only a promotion PR, so its entry comes from `git log --no-merges v3.41.0..v3.42.0`; `gh release view v<x> --repo nextlevelbuilder/dewee` for each stable tag | 2026-10-29 |
| Roadmap columns | Now, Next, Later | Roadmap | `src/content/pages/roadmap.ts` header lists the dewee plan or beta release behind every item; no dates are promised | 2026-10-19 |
| Public MCP path | `/mcp/server` (legacy `/mcp` deprecated) | Integrations, Features | dewee `docs/18-http-api.md` at `v<tag>` | 2026-10-19 |
| Five layers of defence, AES-256-GCM, seven denied shell categories | as written | Security | dewee `docs/09-security.md`, `internal/crypto/aes.go` | 2026-09-25 |
| 8-stage agent loop, three memory tiers | as written | Architecture | dewee `docs/01-agent-loop.md`, `docs/07-bootstrap-skills-memory.md` | 2026-09-25 |
| Prices ($500 a year licence, On-Premises from $5K) | as written | Pricing, Install | `src/content/plans.ts`, `src/content/early-access.ts` (the owners' decision, not derived) | 2026-09-25 |
| NextLevelBuilder proof (130K+ stars, 115 contributors, 10,000+ businesses, 65K+ members) | as written | About | `plans/reports/scout-260924-2346-ecosystem-story.md`, GitHub counts read 2026-09-24 | 2026-09-24, not re-read in the last refresh |

Rows dated before 2026-10-19 were not re-checked in the last refresh. The Roadmap Now, Next and Later columns were last checked on 2026-10-19; only their release references were updated on 2026-10-29. Treat them as due.

## Wording rules the figures depend on

- Say "before every release", not "on every change", for tests.
- Round tests and lines down ("13,000+", "900,000+"). Vietnamese uses a dot: "13.000+".
- Say "stable" for releases. Betas (`v3.41.0-beta.x`) never appear in feature lists; the Roadmap may
  name a beta as "in beta" with its tag.
- Multiplayer means coordinated work by humans and agents: delegation, a shared task board,
  approvals, traces. Do not write "first" or "only", live co-editing, shared cursors, real-time
  sync, absolute safety, or invented customers and results.

## Release copy refresh

Run this when a new stable release ships, and again before any campaign that quotes the numbers.

1. Read the notes: `gh release view v<tag> --repo nextlevelbuilder/dewee`. Skip betas.
2. Update `src/content/facts.ts`: `stableRelease`, then re-count with the commands in the table
   (tests and lines at the new tag) and update `goTests` and `goLines`. If the channel or provider
   lists changed, update `CHANNELS` or `PROVIDERS` in `src/content/integrations.ts` so the counts follow, and re-count
   the provider types (`FACTS.providerTypes`, `PROVIDER_TYPES`, and the "32" in the English and Vietnamese docs; a test
   fails until they agree).
3. Add a `RELEASES` entry at the top of `src/content/releases.ts`: benefits first, only what the notes
   support, EN and VI. Set `since` on a catalogue item only for a release listed in `RELEASES`, and
   update the header comment with the verified date.
4. Update the Roadmap: move shipped items out of Now, add a "Recently shipped" line, and refresh the
   "checked" note. Check the in-progress items against the dewee plans and the latest betas.
5. Nothing to do for the Features calendar: its month caption and accessible label are formatted
   from `RELEASES[0].date` in `src/pages/[...lang]/features.astro`.
6. Search for stale figures. This should print nothing outside tests and code comments about history:

   ```bash
   grep -rnE "8,900|8\.900|on every change|cho mỗi thay đổi|\b10 (chat )?channels|10 kênh" src
   grep -rnE "v3\.[0-9]+(\.[0-9]+)?" src/content --include=*.ts | grep -v "features.ts\|releases.ts\|roadmap.ts\|facts.ts"
   ```

7. Update the "Last verified" column above for every figure you re-checked, then run
   `pnpm check && pnpm test && pnpm build`.
