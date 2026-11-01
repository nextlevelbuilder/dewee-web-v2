/**
 * An in-memory GitHub for the docs proposal tests: the GraphQL docs snapshot query plus the REST
 * Git Data and Pulls calls the server makes. Install it with `vi.stubGlobal("fetch", gh.fetch)`.
 * `failNext` injects a rate limit or an outage; `calls` records every request for assertions.
 */
import { createHash } from "node:crypto";

type Pull = { number: number; html_url: string; state: "open"; merged_at: null; head: { ref: string; sha: string }; base: { ref: string; sha: string }; title: string; body: string };

export const gitBlobSha = (text: string) => createHash("sha1").update(`blob ${Buffer.byteLength(text)}\0${text}`).digest("hex");

export function fakeGitHub(opts: { owner: string; repo: string; base: string; files: Record<string, string> }) {
  const branches = new Map<string, { sha: string; files: Record<string, string> }>();
  const commits = new Map<string, Record<string, string>>();
  const trees = new Map<string, Record<string, string>>();
  const pulls: Pull[] = [];
  const calls: { method: string; url: string; auth: string | null; body: unknown }[] = [];
  let failures: Response[] = [];
  let n = 0;
  const id = (p: string) => createHash("sha1").update(`${p}${++n}`).digest("hex");

  const baseSha = id("commit");
  commits.set(baseSha, { ...opts.files });
  trees.set(`${baseSha}-tree`, { ...opts.files });
  branches.set(opts.base, { sha: baseSha, files: { ...opts.files } });

  const json = (status: number, body: unknown, headers: Record<string, string> = {}) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", ...headers } });

  function snapshot(ref: string) {
    const branch = branches.get(ref.replace("refs/heads/", ""));
    if (!branch) return { repository: { ref: null } };
    const locales = new Map<string, Map<string, { name: string; text: string; mode?: number }[]>>();
    for (const [path, text] of Object.entries(branch.files)) {
      const m = /^src\/content\/docs\/([^/]+)\/([^/]+)\/([^/]+)$/.exec(path);
      if (!m) continue;
      const sections = locales.get(m[1]) ?? new Map();
      locales.set(m[1], sections);
      sections.set(m[2], [...(sections.get(m[2]) ?? []), { name: m[3], text, mode: path.endsWith("link.md") ? 0o120000 : 0o100644 }]);
    }
    const entries = [...locales].map(([name, sections]) => ({
      name,
      type: "tree",
      mode: 0o40000,
      object: {
        entries: [...sections].map(([sname, files]) => ({
          name: sname,
          type: "tree",
          mode: 0o40000,
          object: { entries: files.map((f) => ({ name: f.name, type: "blob", mode: f.mode, oid: gitBlobSha(f.text), object: { text: f.text, isBinary: false, isTruncated: false } })) },
        })),
      },
    }));
    return { repository: { ref: { target: { oid: branch.sha, tree: { oid: `${branch.sha}-tree` }, file: { object: { entries } } } } } };
  }

  async function handle(method: string, url: URL, body: any): Promise<Response> {
    if (url.pathname === "/graphql") return json(200, { data: snapshot(body.variables.ref) });
    const prefix = `/repos/${opts.owner}/${opts.repo}`;
    if (!url.pathname.startsWith(prefix)) return json(404, { message: "Not Found" });
    const path = url.pathname.slice(prefix.length);
    if (method === "GET" && path === "/pulls") {
      const head = url.searchParams.get("head")?.split(":")[1];
      return json(200, pulls.filter((p) => p.head.ref === head).slice(0, 1));
    }
    if (method === "POST" && path === "/git/trees") {
      const files = { ...(trees.get(body.base_tree) ?? {}) };
      for (const e of body.tree) files[e.path] = e.content;
      const sha = id("tree");
      trees.set(sha, files);
      return json(201, { sha });
    }
    if (method === "POST" && path === "/git/commits") {
      const sha = id("commit");
      commits.set(sha, trees.get(body.tree)!);
      return json(201, { sha });
    }
    if (method === "POST" && path === "/git/refs") {
      const name = body.ref.replace("refs/heads/", "");
      if (branches.has(name)) return json(422, { message: "Reference already exists" });
      branches.set(name, { sha: body.sha, files: commits.get(body.sha)! });
      return json(201, { ref: body.ref });
    }
    if (method === "POST" && path === "/pulls") {
      if (pulls.some((p) => p.head.ref === body.head)) return json(422, { message: "A pull request already exists" });
      const number = 100 + pulls.length;
      const pull: Pull = {
        number,
        html_url: `https://github.com/${opts.owner}/${opts.repo}/pull/${number}`,
        state: "open",
        merged_at: null,
        head: { ref: body.head, sha: branches.get(body.head)!.sha },
        base: { ref: body.base, sha: branches.get(body.base)!.sha },
        title: body.title,
        body: body.body,
      };
      pulls.push(pull);
      return json(201, pull);
    }
    return json(404, { message: "Not Found" });
  }

  return {
    calls,
    pulls,
    branches,
    baseSha,
    /** Make the next request fail with this response (once). */
    failNext(res: Response) {
      failures.push(res);
    },
    /** Move the base branch to new content (someone merged another change). */
    pushToBase(files: Record<string, string>) {
      const base = branches.get(opts.base)!;
      const sha = id("commit");
      const next = { ...base.files, ...files };
      commits.set(sha, next);
      trees.set(`${sha}-tree`, next);
      branches.set(opts.base, { sha, files: next });
    },
    fetch: async (input: string | URL | Request, init: RequestInit = {}): Promise<Response> => {
      const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url);
      const method = init.method ?? "GET";
      const body = typeof init.body === "string" ? JSON.parse(init.body) : undefined;
      const auth = new Headers(init.headers).get("authorization");
      calls.push({ method, url: url.href, auth, body });
      const failure = failures.shift();
      if (failure) return failure;
      return handle(method, url, body);
    },
  };
}
