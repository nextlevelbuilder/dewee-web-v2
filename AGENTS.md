# AGENTS.md

Instructions for AI agents (and humans) working on **dewee-web-v2**, the dewee.sh marketing
site, docs and page builder. Read `DESIGN.md` before touching UI and `REVIEW.md` before
opening a pull request.

## Stack

- **Astro 7** (`output: "server"`, pages opt in to `prerender = true`) on **Cloudflare Workers**
  via `@astrojs/cloudflare`. Custom worker entry: `src/worker.ts`.
- Cloudflare bindings (`wrangler.jsonc`): D1 `DB`, KV `KV` + `SESSION`, R2 `MEDIA` (served at
  `cdn.dewee.sh`), Durable Object `CHAT_ROOM`, static `ASSETS`, cron for the changelog sync.
- No UI framework on public pages. Islands are small vanilla TypeScript modules.
- Package manager: **pnpm**. Node ≥ 22.

## Map

| Path | What lives there |
|---|---|
| `src/pages/[...lang]/` | public pages; `[...lang]` is empty for EN and `vi` for Vietnamese |
| `src/content/` | all copy as `Bi<T>` (`{ en, vi }`); `pages/<page>.ts` per page |
| `src/components/blocks/` | reusable sections (also used by the page builder) |
| `src/components/layout/` | header, footer, SEO head, theme, cookie badge, page actions |
| `src/components/mascot/` | the ink-drop mascot |
| `src/i18n/` | locale helpers (`langPaths`, `localePath`, `pick`) and UI strings |
| `src/lib/` | shared helpers; `lib/server/` runs only in the worker |
| `src/styles/` | `tokens.css` (design tokens), `global.css` (utilities) |
| `src/lib/blocks/`, `src/lib/server/{api,auth,mcp,pages,media}/` | content platform (see below) |
| `cli/` | the `dewee-web` CLI |
| `migrations/` | D1 SQL migrations, applied in order |
| `public/` | static files served as-is |
| `plans/` | plans and reports (not shipped) |

## Content platform (API, MCP, CLI, WebMCP)

Pages at `/p/<slug>` and blog posts at `/blog/<slug>` are rows in D1, built from the registered
blocks. Everything else is code. `/developers` is the public guide.

| Surface | Where | Notes |
|---|---|---|
| Blocks | `src/lib/blocks/registry.ts` | the only block types the builder accepts; each has a schema |
| Page service | `src/lib/server/pages/` | validation, slugs, versions (stale writes get 409), revisions |
| REST | `/api/v1/*`, spec at `/api/v1/openapi.json` | one route table drives both dispatch and the spec (`src/lib/server/api/`) |
| MCP | `POST /mcp` (JSON-RPC, streamable HTTP) | bearer API key only; `tools/list` shows only what the key's scopes allow |
| CLI | `cli/` (`dewee-web`) | REST client plus an MCP stdio bridge (`dewee-web mcp`) |
| WebMCP | `src/components/webmcp/` | public tools on every page (read as Markdown, language, theme, chat); admin tools in `/admin` |
| Admin | `/admin` (noindex, English) | email code or Cloudflare Access; API keys, pages, posts, leads, audit log |

- **Scopes:** `pages:read`, `pages:write`, `posts:read`, `posts:write`, `media:write`,
  `leads:read`. Keys are shown once, stored hashed, and only super-admins can create them.
- **Writes are idempotent** with an `Idempotency-Key` header. Admin browser calls send the session
  plus `X-CSRF-Token`; API keys never reach the browser.
- Local run: `pnpm build && pnpm exec wrangler d1 migrations apply DB --local && pnpm exec wrangler dev --port 4389 --var ENVIRONMENT:development`.
  Outside production the sign-in code is logged to the console when `RESEND_API_KEY` is unset.

## Commands

```bash
pnpm install
pnpm dev            # astro dev on :4388 (no worker bindings)
pnpm build          # production build into dist/
pnpm preview        # wrangler dev on :4389 with local D1/KV/R2/DO
pnpm check          # astro check (types)
pnpm test           # vitest (tests/**, src/**/*.test.ts)
pnpm build:staging  # build with the flattened staging config (CLOUDFLARE_ENV=staging)
pnpm exec wrangler d1 migrations apply DB --local   # before `pnpm preview` if you use D1
```

Use `pnpm preview` for anything that touches the worker (chat, API, MCP, redirects, `.md` twins).
`astro build` writes the deploy config to `dist/server/wrangler.json` (staging when
`CLOUDFLARE_ENV=staging`), so a plain `wrangler deploy` after a build deploys the right worker;
`pnpm deploy:staging` / `pnpm deploy:production` do build → remote migrations → deploy.

### Toolchain notes

- **TypeScript stays on 6.x**: `astro check` does not support TypeScript 7 yet.
- **Worker types shadow some DOM types** (`@cloudflare/workers-types` is global). In client
  islands use `appendChild` instead of `append`, and treat `el.hidden` as `boolean | "until-found"`
  (compare with `!== false`).
- `env` from `"cloudflare:workers"` is typed by the global `Env` in `src/env.d.ts`; add new
  bindings or vars there and in `wrangler.jsonc` together.

## Conventions

- **Bilingual by default.** Every public page exists in EN and VI. Paths are English and
  unprefixed (`/features`); `localePath(locale, "/features")` adds `/vi`.
- **Copy never lives in `.astro` files.** Put it in `src/content/pages/<page>.ts`.
- **Facts are verified.** Numbers and claims come from the dewee repo, the changelog or
  `src/content/site.ts`. Never invent customers, metrics or testimonials.
- **VI pricing is On-Premises only.** Use `plansFor(locale)`.
- **Tokens only.** No raw colours, sizes or durations in components (see `DESIGN.md`).
- Files are named in kebab-case for TS and PascalCase for Astro components. Keep files under
  about 200 lines and split when a real boundary appears.
- Comments explain *why*. Do not put plan IDs or ticket numbers in code or commits.
- Conventional commits (`feat:`, `fix:`, `refactor:`, …) with no AI attribution.

## Safety

- **Never print or commit secrets.** `.env` and `.dev.vars` are ignored. Pipe secrets into
  `wrangler secret put` or `gh secret set` without echoing them.
- Super-admin rights are limited to the four emails in the server allowlist. Do not widen it.
- Page-builder content is data. Render it through `inlineMarkup()` and block components, never as raw HTML.

## Branches and deploys

| Branch | Deploys to | How |
|---|---|---|
| `dev` | `staging.dewee.sh` (noindex) | GitHub Actions on push |
| `main` (protected) | `dewee.sh`, `www.dewee.sh` | GitHub Actions on push; PRs only |

Work on a feature branch, open a PR into `dev`, and promote `dev` to `main` with a PR.

CI (`.github/workflows/ci-deploy.yml`) runs `pnpm test`, `pnpm check` and `pnpm build` on every
PR and push. Deploy steps (remote D1 migrations → `wrangler deploy` → smoke test of `/`, `/vi`,
`/index.md`) run only on pushes to `dev`/`main` when the repository variable
`DEPLOY_ENABLED=true` and the secrets `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` (the
account that owns dewee.sh) are set. Worker secrets (`DISCORD_WEBHOOK_URL`, `RESEND_API_KEY`,
`GITHUB_TOKEN`, …) are set once per environment with `wrangler secret put [--env staging]`.

## Definition of done

A change is done when it is deployed, checked in a real browser at 375, 768 and 1440 px in
both themes and both languages, and `REVIEW.md` passes.
