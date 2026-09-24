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
| `migrations/` | D1 SQL migrations, applied in order |
| `public/` | static files served as-is |
| `plans/` | plans and reports (not shipped) |

## Commands

```bash
pnpm install
pnpm dev            # astro dev on :4388 (no worker bindings)
pnpm build          # production build into dist/
pnpm preview        # wrangler dev on :4389 with local D1/KV/R2/DO
pnpm check          # astro check (types)
pnpm test           # vitest
```

Use `pnpm preview` for anything that touches the worker (chat, API, MCP, redirects, `.md` twins).

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

## Definition of done

A change is done when it is deployed, checked in a real browser at 375, 768 and 1440 px in
both themes and both languages, and `REVIEW.md` passes.
