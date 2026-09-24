/** Entry point: parse argv, load config, dispatch, and turn API errors into readable output. */
import { parseArgs } from "./args.js";
import { authCommand } from "./commands/auth.js";
import { blocksCommand, mediaCommand } from "./commands/blocks-media.js";
import { contentCommand } from "./commands/content.js";
import { mcpProxy } from "./commands/mcp-proxy.js";
import { loadConfig } from "./config.js";
import { ApiError, formatApiError } from "./http.js";

const HELP = `dewee-web: manage dewee.sh pages, blog posts and media from the terminal.

Usage: dewee-web <command> [options]

  auth login --key <dwk_…> [--url https://dewee.sh]   verify and store a key (--key - reads stdin)
  auth status                                         show the site, key prefix, owner and scopes

  pages list [--q text] [--status draft|published|archived] [--locale en|vi] [--limit n] [--offset n]
  pages get <id|slug> [--locale vi]
  pages create --file page.json | --title … [--slug …] [--locale …] [--layout …] [--blocks blocks.json] [--publish]
  pages update <id|slug> [--locale vi] --file patch.json | --title … [--blocks blocks.json] [--version n] [--note …]
  pages publish|unpublish <id|slug> [--locale vi] [--version n]

  posts list|get|publish|unpublish …                  same options as pages
  posts create <post.md> [--locale vi] [--publish]    Markdown with front matter (title, slug, tags, …)
  posts update <id|slug> <post.md> [--locale vi] [--version n] [--note …]

  blocks list                                         block types (public, no key needed)
  blocks schema <Type>                                JSON Schema of one block's props
  media upload <image> [--filename name]              PNG, JPEG, WebP, GIF or AVIF up to 10 MB
  mcp                                                 stdio MCP server bridged to <site>/mcp

Options: --json prints raw API responses. -h, --help shows this help.
Config: DEWEE_WEB_API_KEY and DEWEE_WEB_URL, or ~/.config/dewee-web/config.json (written by auth login).
Docs: https://dewee.sh/developers`;

/**
 * @param {string[]} argv
 * @returns {Promise<number>}
 */
export async function main(argv) {
  const { positionals, flags } = parseArgs(argv);
  const [command, ...rest] = positionals;
  if (!command || command === "help" || (flags.help && !rest.length)) {
    process.stdout.write(`${HELP}\n`);
    return command || flags.help ? 0 : 1;
  }
  if (flags.help) {
    process.stdout.write(`${HELP}\n`);
    return 0;
  }
  try {
    if (command === "auth") return (await authCommand(rest, flags)) ?? 0;
    const config = await loadConfig();
    switch (command) {
      case "pages":
        await contentCommand("page", config, rest, flags);
        return 0;
      case "posts":
        await contentCommand("post", config, rest, flags);
        return 0;
      case "blocks":
        await blocksCommand(config, rest, flags);
        return 0;
      case "media":
        await mediaCommand(config, rest, flags);
        return 0;
      case "mcp":
        return await mcpProxy(config);
      default:
        process.stderr.write(`Unknown command "${command}".\n\n${HELP}\n`);
        return 1;
    }
  } catch (err) {
    if (err instanceof ApiError) {
      process.stderr.write(`${formatApiError(err)}\n`);
      return err.status === 401 || err.status === 403 ? 3 : 2;
    }
    process.stderr.write(`dewee-web: ${err instanceof Error ? err.message : String(err)}\n`);
    return 1;
  }
}
