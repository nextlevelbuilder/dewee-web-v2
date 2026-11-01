/**
 * MCP tools for the bilingual docs (src/content/docs). Reads come from Git; writes are proposals:
 * a branch and a pull request into the docs base branch, never a direct change to the site.
 * `docs:read` lists, reads and validates; `docs:write` also proposes. `pages:*` grants nothing here.
 */
import { z } from "zod";
import { ApiError } from "../api/api-errors";
import type { PlatformEnv } from "../api/platform-env";
import type { ApiScope } from "../auth/api-key-format";
import type { ToolDef } from "../mcp/json-rpc";
import type { McpCtx } from "../mcp/mcp-tool-kit";
import { docLocaleSchema, docSectionSchema, docSlugSchema } from "./doc-paths";
import { planProposal, planReport, proposalInput, proposalShape } from "./docs-proposals";
import { proposeDocChange } from "./docs-pull-requests";
import { getDocFromSnapshot, listDocsFromSnapshot, readDocsSnapshot } from "./docs-repo";
import { docsRepoConfig } from "./github-auth";
import { gitHub, type GitHub } from "./github-client";

export function docsGitHub(env: PlatformEnv): GitHub {
  const cfg = docsRepoConfig(env);
  if (!cfg) throw new ApiError(503, "upstream_error", "Docs editing is not configured on this deployment (no GitHub App or token for the docs repository).");
  return gitHub(cfg);
}

const has = (...scopes: ApiScope[]) => (ctx: McpCtx) => scopes.some((s) => ctx.principal.scopes.includes(s));

export const listDocsInput = z
  .object({
    locale: docLocaleSchema.optional().describe("Only en or only vi (default both)."),
    section: docSectionSchema.optional().describe("Only one section."),
    q: z.string().max(100).optional().describe("Case-insensitive text in the id, title or description."),
  })
  .strict();
export const getDocInput = z
  .object({ section: docSectionSchema, slug: docSlugSchema, locale: docLocaleSchema.optional().describe("Only one locale (default both).") })
  .strict();
export const validateDocInput = z.object({ mode: z.enum(["create", "update"]).describe("Check as a new page or as an update."), ...proposalShape }).strict();

const WRITE_RULES =
  "Send whole files (front matter + body) per locale as { content, expected_sha }. Front matter: title (3–60 chars), description (140–160), section (matches the path), order, optional screens, updated (YYYY-MM-DD). " +
  "The result has status pr_opened with the pull request URL; nothing is published until a reviewer merges it. Repeating the same request returns the same pull request (replayed: true).";

export const DOCS_MCP_TOOLS: readonly ToolDef<McpCtx>[] = [
  {
    name: "list_docs",
    title: "List docs pages",
    description: "List the bilingual docs pages from Git (the docs base branch, not necessarily what is deployed): id (section/slug), locale, title, description, order, path, blob sha and site URL.",
    input: listDocsInput,
    annotations: { readOnlyHint: true, openWorldHint: true },
    enabled: has("docs:read", "docs:write"),
    run: async (args, ctx) => {
      const gh = docsGitHub(ctx.env);
      return listDocsFromSnapshot(gh, await readDocsSnapshot(gh), listDocsInput.parse(args));
    },
  },
  {
    name: "get_doc",
    title: "Get a docs page",
    description: "Read one docs page in EN and VI from Git: the whole Markdown file (`content`), parsed front matter, body, blob `sha` (send it back as expected_sha to update) and URLs. Source content can differ from production until merged and deployed.",
    input: getDocInput,
    annotations: { readOnlyHint: true, openWorldHint: true },
    enabled: has("docs:read", "docs:write"),
    run: async (args, ctx) => {
      const a = getDocInput.parse(args);
      const gh = docsGitHub(ctx.env);
      return getDocFromSnapshot(gh, await readDocsSnapshot(gh), a, a.locale);
    },
  },
  {
    name: "validate_doc",
    title: "Validate a docs change",
    description: `Dry run of create_doc or update_doc: runs every check and returns errors, warnings and a unified diff per file, without writing anything. ${WRITE_RULES}`,
    input: validateDocInput,
    annotations: { readOnlyHint: true, openWorldHint: true },
    enabled: has("docs:read", "docs:write"),
    run: async (args, ctx) => {
      const { mode, ...input } = validateDocInput.parse(args);
      const gh = docsGitHub(ctx.env);
      const snap = await readDocsSnapshot(gh);
      return planReport(planProposal(snap, mode, input), { ref: gh.cfg.base, sha: snap.commitSha });
    },
  },
  {
    name: "create_doc",
    title: "Propose a new docs page",
    description: `Propose a new docs page as a pull request with both the en and vi files (same section and slug). Fails with 409 when the page exists. ${WRITE_RULES}`,
    input: proposalInput,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    enabled: has("docs:write"),
    run: async (args, ctx) => proposeDocChange(docsGitHub(ctx.env), ctx.env.DB, ctx.principal, "create", proposalInput.parse(args)),
  },
  {
    name: "update_doc",
    title: "Propose a docs update",
    description: `Propose an update to an existing docs page (en, vi or both) as a pull request. Each changed locale needs the expected_sha from get_doc; a newer file is a 409 version_conflict. ${WRITE_RULES}`,
    input: proposalInput,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    enabled: has("docs:write"),
    run: async (args, ctx) => proposeDocChange(docsGitHub(ctx.env), ctx.env.DB, ctx.principal, "update", proposalInput.parse(args)),
  },
];
