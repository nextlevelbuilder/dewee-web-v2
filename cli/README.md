# dewee-web

Command line for the dewee.sh content platform. It manages custom pages (`/p/<slug>`), blog posts (`/blog/<slug>`), page-builder blocks and media, and it bridges the remote MCP server to stdio for MCP clients that cannot send headers.

It is plain Node.js with no dependencies. It needs Node 22 or newer.

## Install

```sh
npx dewee-web --help            # run without installing
npm install -g dewee-web        # or install the `dewee-web` binary
```

## Authenticate

Create an API key in the admin at `https://dewee.sh/admin/keys`. The key is shown once. Choose only the scopes you need:

| Scope | Allows |
|---|---|
| `pages:read` / `pages:write` | Read / create, edit and publish custom pages |
| `posts:read` / `posts:write` | Read / create, edit and publish blog posts |
| `media:write` | Upload images |
| `leads:read` | Read contact and partner form submissions |

```sh
dewee-web auth login --key dwk_xxxxxxxx_…          # verifies the key, then saves it
pbpaste | dewee-web auth login --key -             # read the key from stdin (keeps it out of shell history)
dewee-web auth status
```

`auth login` writes `~/.config/dewee-web/config.json` (or `$XDG_CONFIG_HOME/dewee-web/config.json`) with mode 600. The environment variables `DEWEE_WEB_API_KEY` and `DEWEE_WEB_URL` override the file, which suits CI. `DEWEE_WEB_URL` defaults to `https://dewee.sh`.

## Pages

A page is JSON: `title`, `slug`, `locale` (`en` or `vi`), `description`, `layout` (`default`, `landing` or `article`), `blocks`, `seo`, `translation_key`. Use `dewee-web blocks list` and `dewee-web blocks schema <Type>` to see which blocks exist and what props they take.

```sh
dewee-web pages list --status draft
dewee-web pages create --title "Partner programme" --slug partners-2027 --blocks blocks.json
dewee-web pages create --file page.json --publish
dewee-web pages get partners-2027                    # by slug (add --locale vi for Vietnamese)
dewee-web pages update partners-2027 --blocks blocks.json --version 3 --note "New FAQ"
dewee-web pages publish partners-2027
dewee-web pages unpublish partners-2027
```

`--version` enables optimistic concurrency: if someone saved a newer version, the update fails with `conflict (409)` and nothing is overwritten.

## Posts

Posts are Markdown files with front matter:

```markdown
---
title: How we test dewee
slug: how-we-test-dewee
locale: en
description: What runs before a release ships.
tags: [engineering, testing]
author: duy               # a founder id (duy, cuong, viet), or omit for "the dewee team"
cover: https://cdn.dewee.sh/media/2026/09/cover.webp
translation_key: how-we-test-dewee
seo:
  title: How we test dewee
---

## The short version

…
```

```sh
dewee-web posts create how-we-test.md             # saved as a draft
dewee-web posts create how-we-test.vi.md --locale vi --publish
dewee-web posts update how-we-test-dewee how-we-test.md --note "Fix a typo"
dewee-web posts publish how-we-test-dewee
```

Front matter supports plain and quoted strings, numbers, booleans, `[inline, lists]`, `- block` lists and one nested map (`seo:`). Unknown keys are rejected so a typo never disappears silently.

## Media

```sh
dewee-web media upload diagram.png
```

Prints the CDN URL (`https://cdn.dewee.sh/media/yyyy/mm/<uuid>.png`). PNG, JPEG, WebP, GIF and AVIF up to 10 MB are accepted.

## MCP

The site runs a remote MCP server at `https://dewee.sh/mcp` (Streamable HTTP, Bearer key). Clients that support remote servers with headers can connect directly. For stdio-only clients, `dewee-web mcp` bridges stdin/stdout to it:

```json
{
  "mcpServers": {
    "dewee-web": {
      "command": "npx",
      "args": ["-y", "dewee-web", "mcp"],
      "env": { "DEWEE_WEB_API_KEY": "dwk_xxxxxxxx_…" }
    }
  }
}
```

The tools available depend on the key's scopes (for example `create_page` needs `pages:write`).

## Output and exit codes

Add `--json` to any data command to print the raw API response. Messages go to stderr and data to stdout, so output pipes cleanly into `jq`.

| Exit code | Meaning |
|---|---|
| 0 | Success |
| 1 | Usage or local error (bad flag, missing file) |
| 2 | The API rejected the request (validation, not found, conflict) |
| 3 | Authentication or permission error (401/403) |

Full API reference: `https://dewee.sh/api/v1/openapi.json`. Guide: `https://dewee.sh/developers`.
