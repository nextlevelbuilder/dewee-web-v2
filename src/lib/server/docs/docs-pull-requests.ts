/**
 * Turns a docs proposal into a branch + pull request into the base branch. It only ever creates a
 * new tree, a new commit and a new branch; it never updates an existing branch, force-pushes,
 * approves or merges. The branch name is a hash of the request, so a retry finds the same branch
 * and pull request and replays it instead of opening a duplicate.
 */
import { sha256Hex } from "../auth/crypto-helpers";
import { audit } from "../auth/audit-log";
import type { Principal } from "../auth/request-auth";
import { ApiError } from "../api/api-errors";
import { docId, docPath, DOC_LOCALES } from "./doc-paths";
import { planProposal, planReport, type ProposalInput, type ProposalMode, type ProposalPlan } from "./docs-proposals";
import { readDocsSnapshot } from "./docs-repo";
import { GitHubHttpError, type GitHub } from "./github-client";

type Pull = { number: number; html_url: string; state: "open" | "closed"; merged_at?: string | null; head: { ref: string; sha: string }; base: { ref: string; sha: string } };

const NOT_PUBLISHED = "Published docs have not changed. They update only after a reviewer merges this pull request and the base branch is deployed.";

/** `abcd1234` for an API key, otherwise "admin session"; emails stay out of the public repository. */
function proposer(principal: Principal): string {
  const prefix = /\(key ([a-z0-9]{8})\)/.exec(principal.actor)?.[1];
  return prefix ? `API key \`${prefix}\`` : "an admin session";
}

export async function proposalBranch(mode: ProposalMode, input: ProposalInput): Promise<string> {
  const fingerprint = JSON.stringify([mode, input.section, input.slug, ...DOC_LOCALES.map((l) => [input[l]?.content ?? null, input[l]?.expected_sha ?? null])]);
  return `docs/${mode}-${input.section}-${input.slug}-${(await sha256Hex(fingerprint)).slice(0, 12)}`;
}

async function findPull(gh: GitHub, branch: string): Promise<Pull | null> {
  const pulls = await gh.rest<Pull[]>("GET", `/pulls?state=all&per_page=1&head=${encodeURIComponent(`${gh.cfg.owner}:${branch}`)}`);
  return pulls[0] ?? null;
}

function pullBody(plan: ProposalPlan, principal: Principal, note: string | undefined): string {
  const safe = (s: string) => s.replace(/@/g, "@​");
  const rows = plan.changes.map((c) => `| \`${c.path}\` | ${c.baseSha ? `\`${c.baseSha.slice(0, 12)}\`` : "new"} | +${c.added} −${c.removed} |`);
  const warnings = plan.warnings.length ? plan.warnings.map((w) => `- \`${w.path}\`: ${safe(w.message)}`).join("\n") : "- none";
  return [
    `Docs change proposed through the dewee.sh content API by ${proposer(principal)}.`,
    "",
    `> ${NOT_PUBLISHED}`,
    ...(note ? ["", "**Note from the proposer**", "", safe(note)] : []),
    "",
    "| File | Base blob | Lines |",
    "|---|---|---|",
    ...rows,
    "",
    "**Validation**: passed (front matter, section, screenshot markers, callouts, code fences).",
    "",
    "**Warnings**",
    warnings,
  ].join("\n");
}

function opened(pull: Pull, plan: { mode: ProposalMode; id: string; paths: string[] }, extra: { replayed: boolean; validation: unknown }) {
  const status = pull.state === "open" ? "pr_opened" : pull.merged_at ? "pr_merged" : "pr_closed";
  return {
    status,
    id: plan.id,
    mode: plan.mode,
    pull_request: { number: pull.number, url: pull.html_url },
    branch: pull.head.ref,
    base: { ref: pull.base.ref, sha: pull.base.sha },
    head_sha: pull.head.sha,
    changed_paths: plan.paths,
    note: NOT_PUBLISHED,
    ...extra,
  };
}

export async function proposeDocChange(gh: GitHub, db: D1Database, principal: Principal, mode: ProposalMode, input: ProposalInput) {
  const id = docId(input);
  const paths = DOC_LOCALES.filter((l) => input[l]).map((l) => docPath(l, input));
  const branch = await proposalBranch(mode, input);
  const auditDetail = { key_id: principal.keyId ?? null, mode, paths, branch };

  const earlier = await findPull(gh, branch);
  if (earlier) {
    await audit(db, principal.actor, "docs.propose", `docs/${id}`, { ...auditDetail, pr_number: earlier.number, pr_url: earlier.html_url, replayed: true });
    return opened(earlier, { mode, id, paths }, { replayed: true, validation: null });
  }

  const snap = await readDocsSnapshot(gh);
  let plan: ProposalPlan;
  try {
    plan = planProposal(snap, mode, input);
  } catch (err) {
    if (err instanceof ApiError) await audit(db, principal.actor, "docs.propose_rejected", `docs/${id}`, { ...auditDetail, code: err.code, base_sha: snap.commitSha });
    throw err;
  }
  const report = planReport(plan, { ref: gh.cfg.base, sha: snap.commitSha });
  if (!report.valid) {
    await audit(db, principal.actor, "docs.propose_rejected", `docs/${id}`, { ...auditDetail, code: "validation_failed", errors: plan.errors.length, base_sha: snap.commitSha });
    throw new ApiError(422, "validation_failed", `The proposal has ${plan.errors.length} validation error(s); nothing was written.`, report);
  }

  const subject = `docs(${input.section}): ${mode === "create" ? "add" : "update"} ${input.slug}`;
  const tree = await gh.rest<{ sha: string }>("POST", "/git/trees", {
    base_tree: snap.treeSha,
    tree: plan.changes.map((c) => ({ path: c.path, mode: "100644", type: "blob", content: c.content })),
  });
  const commit = await gh.rest<{ sha: string }>("POST", "/git/commits", {
    message: `${subject}\n\nProposed through the dewee.sh content API by ${proposer(principal).replace(/`/g, "")}.`,
    tree: tree.sha,
    parents: [snap.commitSha],
  });
  try {
    await gh.rest("POST", "/git/refs", { ref: `refs/heads/${branch}`, sha: commit.sha });
  } catch (err) {
    // 422 "Reference already exists": the same request is running (or ran) elsewhere; reuse its branch.
    if (!(err instanceof GitHubHttpError && err.status === 422)) throw err;
  }

  let pull: Pull;
  try {
    pull = await gh.rest<Pull>("POST", "/pulls", { title: subject, head: branch, base: gh.cfg.base, body: pullBody(plan, principal, input.note), maintainer_can_modify: true });
  } catch (err) {
    const existing = err instanceof GitHubHttpError && err.status === 422 ? await findPull(gh, branch) : null;
    if (!existing) throw err instanceof GitHubHttpError ? new ApiError(502, "upstream_error", `GitHub refused to open the pull request: ${err.message}`) : err;
    pull = existing;
  }

  await audit(db, principal.actor, "docs.propose", `docs/${id}`, {
    ...auditDetail,
    pr_number: pull.number,
    pr_url: pull.html_url,
    base_sha: snap.commitSha,
    head_sha: pull.head.sha,
    warnings: plan.warnings.length,
    replayed: false,
  });
  return opened(pull, { mode, id, paths }, { replayed: false, validation: { valid: true, errors: [], warnings: plan.warnings } });
}
