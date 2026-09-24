# dewee.sh

The website of **dewee**, the enterprise AI-agent platform from
[NextLevelBuilder](https://nextlevelbuilder.io) and the team behind GoClaw.

> The hard part is ours. The future is yours.

- **Production:** https://dewee.sh (branch `main`)
- **Staging:** https://staging.dewee.sh (branch `dev`)

## What is in here

- Marketing pages in English and Vietnamese, with light and dark themes
- Official docs, changelog (synced from GitHub releases), blog and partner programme
- A page builder with predefined blocks, editable through a REST API, a CLI, MCP and WebMCP
- Agent-friendly output: a `.md` twin for every URL, `llms.txt`, `llms-full.txt`, sitemap and structured data
- A live chat widget backed by a Durable Object over WebSocket

## Develop

```bash
pnpm install
pnpm build && pnpm preview   # http://127.0.0.1:4389
```

Read [`AGENTS.md`](AGENTS.md) for the repository map and conventions,
[`DESIGN.md`](DESIGN.md) for the design system, and [`REVIEW.md`](REVIEW.md) for the review checklist.

## Contact

hi@nextlevelbuilder.io · [Discord](https://dewee.sh/discord) · [X](https://x.com/nlb_io) · [GitHub](https://github.com/nextlevelbuilder)

© NextLevelBuilder.io. All rights reserved.
