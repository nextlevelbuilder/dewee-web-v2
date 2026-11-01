/**
 * REST routes for the bilingual docs, mirroring the MCP docs tools: reads come from Git and writes
 * open a pull request into the docs base branch. Reads accept `docs:read` or `docs:write` (a
 * proposer must read the SHA it edits), so they check the scope themselves.
 */
import { z } from "zod";
import type { Principal } from "../auth/request-auth";
import { docsGitHub, getDocInput, listDocsInput, validateDocInput } from "../docs/docs-mcp-tools";
import { planProposal, planReport, proposalInput, proposalShape } from "../docs/docs-proposals";
import { proposeDocChange } from "../docs/docs-pull-requests";
import { getDocFromSnapshot, listDocsFromSnapshot, readDocsSnapshot } from "../docs/docs-repo";
import { forbidden, json, validationFailed } from "./api-errors";
import { route, type RouteDef } from "./v1-route-types";

const READ_SCOPES = 'Needs the "docs:read" or "docs:write" scope.';
const SOURCE = "Content comes from the docs base branch in Git and can differ from what is deployed.";

function canRead(principal: Principal | null): Principal {
  if (!principal || !principal.scopes.some((s) => s === "docs:read" || s === "docs:write")) throw forbidden('This API key lacks the "docs:read" scope.');
  return principal;
}

function parse<T>(schema: z.ZodType<T>, value: unknown): T {
  const parsed = schema.safeParse(value ?? {});
  if (!parsed.success) throw validationFailed(parsed.error);
  return parsed.data;
}

const updateBody = z.object({ en: proposalShape.en, vi: proposalShape.vi, note: proposalShape.note }).strict();
const localeQuery = z.object({ locale: getDocInput.shape.locale }).strict();
const PROPOSAL_NOTE = "Opens a branch and a pull request into the docs base branch; nothing is published until it is reviewed, merged and deployed. Repeating the same body returns the same pull request (`replayed: true`).";

export const DOCS_ROUTES: readonly RouteDef[] = [
  route({
    method: "GET",
    path: "/docs",
    operationId: "listDocs",
    tag: "Docs",
    summary: "List docs pages from Git with their blob SHAs",
    description: `${SOURCE} ${READ_SCOPES}`,
    auth: "any",
    query: listDocsInput,
    success: 200,
    response: "DocList",
    handle: async ({ env, principal, query }) => {
      canRead(principal);
      const gh = docsGitHub(env);
      return json({ data: listDocsFromSnapshot(gh, await readDocsSnapshot(gh), query) });
    },
  }),
  route({
    method: "GET",
    path: "/docs/{section}/{slug}",
    operationId: "getDoc",
    tag: "Docs",
    summary: "Read one docs page (EN and VI) from Git",
    description: `Returns each locale's whole file, front matter, body and blob \`sha\` (send it back as \`expected_sha\`). ${SOURCE} ${READ_SCOPES}`,
    auth: "any",
    query: localeQuery,
    success: 200,
    response: "Doc",
    handle: async ({ env, principal, params, query }) => {
      canRead(principal);
      const ref = parse(getDocInput, { section: params.section, slug: params.slug, locale: query.locale });
      const gh = docsGitHub(env);
      return json({ data: getDocFromSnapshot(gh, await readDocsSnapshot(gh), ref, ref.locale) });
    },
  }),
  route({
    method: "POST",
    path: "/docs/validate",
    operationId: "validateDoc",
    tag: "Docs",
    summary: "Check a docs change and preview its diff without writing anything",
    description: READ_SCOPES,
    auth: "any",
    body: validateDocInput,
    bodyRequired: true,
    success: 200,
    response: "DocValidation",
    handle: async ({ env, principal, body }) => {
      canRead(principal);
      const { mode, ...input } = parse(validateDocInput, body);
      const gh = docsGitHub(env);
      const snap = await readDocsSnapshot(gh);
      return json({ data: planReport(planProposal(snap, mode, input), { ref: gh.cfg.base, sha: snap.commitSha }) });
    },
  }),
  route({
    method: "POST",
    path: "/docs",
    operationId: "createDoc",
    tag: "Docs",
    summary: "Propose a new docs page (EN and VI) as a pull request",
    description: PROPOSAL_NOTE,
    auth: "docs:write",
    body: proposalInput,
    bodyRequired: true,
    idempotent: true,
    success: 201,
    response: "DocProposal",
    handle: async ({ env, principal, body }) => {
      const result = await proposeDocChange(docsGitHub(env), env.DB, principal!, "create", parse(proposalInput, body));
      return json({ data: result }, { status: result.replayed ? 200 : 201 });
    },
  }),
  route({
    method: "PATCH",
    path: "/docs/{section}/{slug}",
    operationId: "updateDoc",
    tag: "Docs",
    summary: "Propose an update to a docs page as a pull request",
    description: `Send \`en\`, \`vi\` or both as \`{ content, expected_sha }\`; a newer file is a 409 version_conflict. ${PROPOSAL_NOTE}`,
    auth: "docs:write",
    body: updateBody,
    bodyRequired: true,
    idempotent: true,
    success: 201,
    response: "DocProposal",
    handle: async ({ env, principal, params, body }) => {
      const input = parse(proposalInput, { ...parse(updateBody, body), section: params.section, slug: params.slug });
      const result = await proposeDocChange(docsGitHub(env), env.DB, principal!, "update", input);
      return json({ data: result }, { status: result.replayed ? 200 : 201 });
    },
  }),
];
