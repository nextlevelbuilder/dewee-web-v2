/**
 * robots.txt (pure). Production welcomes every crawler, AI crawlers included, and keeps them out
 * of the admin, the API (except its public OpenAPI description) and the MCP endpoint.
 * Any other environment (staging) is closed.
 */
import { OPENAPI_PATH } from "./seo-paths.ts";

/** AI crawlers named explicitly so their operators see they are welcome, with the same rules as everyone. */
export const AI_CRAWLERS = [
  "GPTBot", "OAI-SearchBot", "ChatGPT-User",
  "ClaudeBot", "Claude-SearchBot", "Claude-User",
  "PerplexityBot", "Perplexity-User",
  "Google-Extended", "Applebot-Extended",
  "Meta-ExternalAgent", "CCBot", "DuckAssistBot", "MistralAI-User",
];

export const DISALLOWED_PREFIXES = ["/admin", "/api/", "/mcp"];
/** Public documents under a closed prefix; the longer Allow rule wins for Google and RFC 9309 crawlers. */
export const ALLOWED_EXCEPTIONS = [OPENAPI_PATH];

export function robotsTxt(opts: { siteUrl: string; production: boolean }): string {
  const site = opts.siteUrl.replace(/\/$/, "");
  if (!opts.production) {
    return ["# Staging: not for crawlers. The public site is https://dewee.sh", "User-agent: *", "Disallow: /", ""].join("\n");
  }
  const rules = ["Allow: /", ...ALLOWED_EXCEPTIONS.map((p) => `Allow: ${p}`), ...DISALLOWED_PREFIXES.map((p) => `Disallow: ${p}`)];
  return [
    "# dewee.sh: people, search engines and AI agents are welcome.",
    `# Every page has a Markdown twin (append .md), and ${site}/llms.txt lists them.`,
    "",
    "User-agent: *",
    ...rules,
    "",
    ...AI_CRAWLERS.map((bot) => `User-agent: ${bot}`),
    ...rules,
    "",
    `Sitemap: ${site}/sitemap.xml`,
    "",
  ].join("\n");
}
