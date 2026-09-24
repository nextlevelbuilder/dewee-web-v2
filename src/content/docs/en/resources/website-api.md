---
title: The dewee.sh website for tools and AI
description: "How software and AI assistants can read dewee.sh itself: Markdown versions of pages, llms.txt, and the site's own API, CLI and MCP, apart from the runtime API."
section: resources
order: 2
updated: 2026-09-25
---

There are two different APIs around dewee, and it helps to keep them apart:

| API | Serves | Where it is documented |
|---|---|---|
| The **runtime API** | Your agents, sessions, providers, channels and everything else in your workspace | [API overview](/docs/api/overview) |
| The **website's interfaces** | The public content of dewee.sh: product pages, docs, the changelog and the blog | This page and [Developers](/developers) |

Nothing on this page touches your workspace or your data. It is for tools that want to read dewee.sh the way a person would.

## Pages as Markdown

Every page on dewee.sh points to a Markdown version of itself in its `<head>`, with a link such as:

```html
<link rel="alternate" type="text/markdown" href="/docs/get-started/quickstart.md" title="Markdown" />
```

The Markdown version sits at the page's path with `.md` added, and the home page's is `/index.md`. Vietnamese pages live under `/vi`, so their Markdown versions do too. Use it when you want the text of a page without the navigation, styles and scripts.

## llms.txt

`/llms.txt` gives language models a short guide to the site: what dewee is and where the important pages are. It is linked from the footer and from every page's `<head>`.

## API, CLI and MCP for the website

The website also has its own programmatic interfaces, for reading and managing dewee.sh content. The [Developers](/developers) page is the reference for them: how to authenticate, which operations exist and how to connect an MCP client.

> [!NOTE]
> Credentials for the website's interfaces are separate from runtime API keys. A key created in the console for your workspace does not work on dewee.sh, and the reverse is also true.
