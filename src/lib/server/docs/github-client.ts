/**
 * The few GitHub calls the docs proposals need (REST + one GraphQL query), with GitHub failures
 * turned into the API's error shape: rate limits are 429 `rate_limited` with a retry hint, auth
 * and server failures are 502 `upstream_error`. Messages never carry the token or response headers.
 */
import { ApiError } from "../api/api-errors";
import { GITHUB_API, GITHUB_HEADERS, type DocsRepoConfig } from "./github-auth";

export class GitHubHttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "GitHubHttpError";
  }
}

function rateLimited(res: Response): ApiError | null {
  const remaining = res.headers.get("x-ratelimit-remaining");
  if (res.status !== 429 && !(res.status === 403 && (remaining === "0" || res.headers.has("retry-after")))) return null;
  const reset = Number(res.headers.get("x-ratelimit-reset"));
  const retryAfter = Number(res.headers.get("retry-after")) || (reset ? Math.max(1, reset - Math.floor(Date.now() / 1000)) : 60);
  return new ApiError(429, "rate_limited", `GitHub rate limit reached. Retry in about ${retryAfter} seconds.`, { retry_after: retryAfter });
}

async function token(cfg: DocsRepoConfig): Promise<string> {
  try {
    return await cfg.token();
  } catch (err) {
    console.error("docs: GitHub credentials failed", err instanceof Error ? err.message : "unknown");
    throw new ApiError(502, "upstream_error", "The docs repository credentials were rejected by GitHub. An admin must check the GitHub App installation.");
  }
}

export type GitHub = {
  cfg: DocsRepoConfig;
  /** REST call relative to /repos/{owner}/{repo}. Throws GitHubHttpError for 404/409/422 so callers can branch on them. */
  rest: <T>(method: "GET" | "POST" | "PATCH", path: string, body?: unknown) => Promise<T>;
  graphql: <T>(query: string, variables: Record<string, unknown>) => Promise<T>;
};

export function gitHub(cfg: DocsRepoConfig): GitHub {
  const send = async (url: string, method: string, body?: unknown): Promise<Response> => {
    const auth = await token(cfg);
    let res: Response;
    try {
      res = await fetch(url, {
        method,
        headers: { ...GITHUB_HEADERS, authorization: `Bearer ${auth}`, ...(body === undefined ? {} : { "content-type": "application/json" }) },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch {
      throw new ApiError(502, "upstream_error", "GitHub could not be reached. Try again shortly.");
    }
    const limited = rateLimited(res);
    if (limited) throw limited;
    return res;
  };

  const fail = async (res: Response): Promise<never> => {
    const message = ((await res.json().catch(() => ({}))) as { message?: string }).message ?? `HTTP ${res.status}`;
    if ([404, 409, 422].includes(res.status)) throw new GitHubHttpError(res.status, message.slice(0, 300));
    console.error("docs: GitHub request failed", res.status, message.slice(0, 300));
    if (res.status === 401 || res.status === 403) throw new ApiError(502, "upstream_error", "GitHub refused the docs repository credentials. An admin must check the GitHub App permissions.");
    throw new ApiError(502, "upstream_error", `GitHub answered HTTP ${res.status}. Try again shortly.`);
  };

  return {
    cfg,
    async rest<T>(method: "GET" | "POST" | "PATCH", path: string, body?: unknown): Promise<T> {
      const res = await send(`${GITHUB_API}/repos/${cfg.owner}/${cfg.repo}${path}`, method, body);
      if (!res.ok) return fail(res);
      return (await res.json()) as T;
    },
    async graphql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
      const res = await send(`${GITHUB_API}/graphql`, "POST", { query, variables });
      if (!res.ok) return fail(res);
      const out = (await res.json()) as { data?: T; errors?: { type?: string; message?: string }[] };
      if (out.errors?.length) {
        if (out.errors.some((e) => e.type === "RATE_LIMITED")) throw new ApiError(429, "rate_limited", "GitHub rate limit reached. Retry in about 60 seconds.", { retry_after: 60 });
        console.error("docs: GitHub GraphQL errors", out.errors.map((e) => e.message).join("; ").slice(0, 300));
        throw new ApiError(502, "upstream_error", "GitHub could not read the docs repository. Try again shortly.");
      }
      if (!out.data) throw new ApiError(502, "upstream_error", "GitHub returned an empty answer.");
      return out.data;
    },
  };
}
