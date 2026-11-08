---
name: dewee-web-content
description: Create or update dewee.sh custom pages (/p/<slug>), blog posts and media, and propose changes to the bilingual docs (/docs) as GitHub pull requests, through the dewee-web CLI or the remote MCP server at https://dewee.sh/mcp. Use when asked to publish an announcement, write a blog post, build a landing page from blocks, upload an image to cdn.dewee.sh, or fix or add a docs page.
---

# dewee.sh content operator

The site's hand-built pages live in code (this repo). Custom pages (`/p/<slug>`) and blog posts
(`/blog/<slug>`) live in D1 and are edited through the API. The docs (`/docs`) are Markdown in
Git: the API reads them and proposes changes as pull requests (see **Docs** below). Other code
pages are out of scope.

## Before you start

1. You need an API key with the smallest scopes that fit: `pages:read|write`,
   `posts:read|write`, `media:write`, `leads:read`, `docs:read|write`. Only the four super-admins can create keys
   at `https://dewee.sh/admin/keys`. Never print the key or paste it into a file in a repo.
2. Pick one interface:
   - **CLI:** `npx -y dewee-web <command>` with `DEWEE_WEB_API_KEY` in the environment. Add
     `DEWEE_WEB_URL=https://staging.dewee.sh` to try on staging first.
   - **MCP:** remote `https://dewee.sh/mcp` with `Authorization: Bearer <key>`, or the stdio
     bridge `npx -y dewee-web mcp`. `tools/list` shows only what your scopes allow.
   - **MCP with OAuth (ChatGPT and other clients that cannot send a header):** add
     `https://dewee.sh/mcp` with OAuth. An admin signs in and ticks the scopes on the consent
     page (reads are pre-ticked; writes and `leads:read` are opt-in). Grants are listed and
     revoked at `/admin/connections`. A `401` with `error="invalid_token"` means sign in again.
     This is not the runtime MCP at `<gateway-origin>/mcp/workspace` or `/mcp/server`.
3. Read `https://dewee.sh/developers` once. The API reference is `/api/v1/openapi.json`.

## Workflow

1. **Look first.** `pages list` / `posts list` (MCP: `list_pages`, `list_posts`). Update an
   existing slug instead of creating a near-duplicate.
2. **Blocks, not HTML.** `blocks list`, then `blocks schema <Type>` (MCP: `list_blocks`,
   `get_block_schema`). Pages accept registered block types only; props are validated.
3. **Posts are Markdown, with widgets between paragraphs.** `blocks list --context post`
   (MCP: `list_blocks` with `context: "post"`) lists them: Gallery, Video, VideoEmbed
   (YouTube/Vimeo), SocialCard, CodeBlock, Chart, Diagram, ComparisonTable, BeforeAfter, plus
   Image, Callout, Quote, Steps, Timeline, Faq, Columns and Divider. Give each block an `id`,
   then put a line `::widget{id="…"}` on its own where it goes; blocks you do not place show
   after the body. The CLI reads them from the file named by `blocks:` in the front matter (or
   `--blocks`). Validate first, without saving: over MCP call `validate_post` (or
   `validate_page`) with `content` set to what you would send to `create_post`, or with `id` plus
   the `update_post` fields; it runs every write check (schema, blocks, widget lines, slug,
   translation, version) and returns `{ valid, issues: [{ path, message }] }`. Over REST use
   `POST /api/v1/blocks/validate` with `{ "context": "post", "blocks": [...], "body_md": "…" }`.
   Interactive widgets: Poll (readers may change their vote), Quiz (one answer; the `answer` and
   `explanation` are shown only after the reader answers, never in the page or the Markdown) and
   Survey (one submission; results and free text only at `/admin/widgets`, with CSV export).
   These three need an `id`, because answers are stored per post and widget id: keep the id and
   the option ids stable once a post is live, or earlier answers stop counting. Answers are
   anonymous and one-per-reader only as far as a cookie can tell: a reader who clears or blocks
   cookies can answer again. Writes are capped per 10 minutes at 10 per cookie and 40 per network;
   requests without the cookie (or with one the site did not sign) get a new voter each time, so
   they share a stricter 10 per network. On a busy shared network (mobile CGNAT, a large office)
   first-time voters can hit that limit and get "try again later".
   Treat poll and survey numbers as indicative, not as a ballot. Demo embeds a
   sandboxed page (`allow-scripts` only) from an allowlisted host (codepen.io, jsfiddle.net),
   loaded only when the reader clicks; any other host is rejected.
   A worked sample is in `examples/widget-post.md` and `examples/widget-post.blocks.json`.
   For numbers, diagrams and comparisons see **Data and comparison widgets** below.
4. **Write both languages.** Every page or post gets an EN and a VI version that share a
   `translation_key`. The Vietnamese is written for Vietnamese readers, not machine-translated.
   Pricing in VI is Self-install and On-Premises only.
5. **Save as a draft** (drafts are not public; a super-admin can open the live preview in
   `/admin`). Publish, then check the public URL at 375 px and 1440 px in light and dark. Pass
   `--version <n>` on updates; a `409 conflict` means someone saved first: re-read, merge, retry.
6. **Media:** `media upload <file>` (PNG, JPEG, WebP, GIF, AVIF, up to 10 MB) returns a
   `cdn.dewee.sh` URL. Every image needs real alt text, gallery images included. Videos are
   `.mp4`/`.webm` files on https or `/media/`, with `.vtt` captions when there is speech.
7. **Report** the published URLs (EN and VI) and anything you could not verify.

## Docs (pull requests, not publishing)

The docs are `src/content/docs/{en,vi}/<section>/<slug>.md` in the site repo. Reads come from
the docs base branch (`dev`), which can differ from what is deployed. A write opens a branch and
a pull request; nothing changes on the site until a reviewer merges it and it deploys. `pages:*`
grants nothing here: reading needs `docs:read`, proposing needs `docs:write`.

1. **Find the page.** `list_docs` (CLI `docs list`) shows each file's id `section/slug`,
   locale, title and blob `sha`.
2. **Read the whole file.** `get_doc` (CLI `docs get <section/slug> --locale en --out f.md`)
   returns `content` (front matter + body) and `sha` per locale. Edit that whole file.
3. **Check before proposing.** `validate_doc` with `mode: "update"` (or `"create"`) runs the
   build's checks and returns errors, warnings and a diff, without writing. Errors name the file
   line, e.g. `en.body.line.12`. Front matter: `title` 3–60 chars, `description` 140–160,
   `section` equal to the folder, `order`, optional `screens`, `updated: YYYY-MM-DD`. A
   screenshot is `::shot{id="…"}` on its own paragraph and listed in `screens`.
4. **Propose.** `update_doc` with `{ section, slug, en: { content, expected_sha }, note }`.
   Send `vi` too when the change affects both languages; a warning reminds you when the twin is
   untouched. A new page uses `create_doc` with both `en` and `vi`. A `409 version_conflict`
   means the file changed since you read it: read again, re-apply, retry.
5. **Hand over the link.** The result has `pull_request.url` and `status: "pr_opened"`. Say the
   change is proposed, not live. Repeating the same call returns the same pull request
   (`replayed: true`), so a retry after a timeout is safe.

## Data and comparison widgets

Pick the widget by what the reader must take away.

- **Chart** for a trend or a share: `kind` is `bar`, `line`, `pie` or `donut`; `labels` are
  the categories and every series has exactly one number per label (at most 50 labels and
  6 series; pie and donut take one series of 2–8 non-negative slices). Add `unit`,
  `caption` and a `source` (+ `sourceUrl`) for every real figure. The chart is drawn on
  the server; readers can open the exact numbers under "View data", and feeds get a table.
- **Diagram** for a flow or a structure, in Mermaid (`flowchart`, `sequenceDiagram`,
  `stateDiagram-v2`, `erDiagram`, `gantt`, `timeline`, …). `alt` is required: one or two
  sentences that say what the diagram shows, not "a diagram". Plain-text labels only: no
  `%%{init}%%`, front matter, `click` lines or HTML tags. It draws in the reader's browser;
  without JavaScript the source shows, so keep it readable.
- **ComparisonTable** for options side by side: `columns` are the options (2–5), each row
  has a `criterion` and one cell per column. A cell is text or
  `{ "mark": "yes" | "no" | "partial", "text"?: "…" }`; `highlight` is the 0-based column to
  tint, with an optional `highlightLabel`. Compare only what you can verify.
- **BeforeAfter** for two versions of one view: `before` and `after` each take `src`, `alt`
  and an optional `label`; use images of the same size and pass `pixelWidth`/`pixelHeight`.
  Readers drag a slider (or use the arrow keys); without JavaScript the images sit side by side.

## Content rules

- **Facts only.** Numbers, features and release items come from the dewee repo, the changelog or
  `/features`. No invented customers, quotes, metrics or logos. If a claim is unverified, leave
  it out or ask.
- **Say what is true by default.** The way in starts shut (a token to connect, approval before a
  stranger can chat, private networks blocked). Agent capabilities start open and are narrowed
  by the operator. Prompt-injection checks warn by default. Do not write "closed by default"
  about the whole product.
- **Voice:** warm, plain, a little wry; short sentences; "we" for NextLevelBuilder, "you" for
  the reader. EN is the default locale.
- Keep titles under 60 characters and descriptions under 160; the site builds OG cards,
  `.md` twins and `llms.txt` entries from them.
- Never unpublish, archive or delete someone else's page or post without being asked. Restoring
  a revision is the safe undo: `list_revisions`, read one with `get_revision`, then
  `restore_revision` with the current `version`, and check the result with `get_page`.
- Status changes (`publish_*`, `unpublish_*`, `archive_*`) are reversible and safe to repeat;
  pass `version` so a stale read cannot flip the status. `delete_*` is permanent, needs the
  current `version` and `confirm_slug`, and is never part of a routine update: prefer
  `archive_*`. Over MCP there is no `Idempotency-Key`; after a timeout on `create_*`,
  `update_*`, `restore_revision` or `delete_*`, re-read before you retry.
