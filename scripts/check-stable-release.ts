/// <reference types="node" />
/**
 * Fails when GitHub has a newer stable dewee release than FACTS.stableRelease, so the site cannot
 * quietly keep advertising an old version.
 *
 *   pnpm releases:check
 *
 * Reads `repos/nextlevelbuilder/dewee/releases?per_page=30` (override the repo with CHANGELOG_REPO)
 * and uses `published_at`, not commit dates. A GITHUB_TOKEN (or GH_TOKEN) is sent when set, which
 * lifts the rate limit and is required if the repository is not publicly readable. Exit codes: 0 up to date, or the
 * comparison could not be made (network error, no access, bad response: a warning is printed and
 * deploys are never blocked by GitHub being unreachable); 1 only when a newer stable release exists.
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { judge, parseClaimed } from "./lib/stable-release.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const FACTS_FILE = resolve(ROOT, "src/content/facts.ts");
const REPO = process.env.CHANGELOG_REPO ?? "nextlevelbuilder/dewee";
const TIMEOUT_MS = 15_000;

/** Prints a GitHub Actions annotation when running there, plain text otherwise. */
function say(level: "warning" | "error" | "notice", message: string): void {
  console.log(process.env.GITHUB_ACTIONS ? `::${level}::${message}` : `${level}: ${message}`);
}

async function main(): Promise<number> {
  if (!/^[\w.-]+\/[\w.-]+$/.test(REPO)) throw new Error(`Invalid repo "${REPO}", expected owner/name`);
  const claimed = parseClaimed(readFileSync(FACTS_FILE, "utf8"));

  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  let body: unknown;
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/releases?per_page=30`, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "dewee-web-release-check",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      say("warning", `Stable release check skipped: GitHub answered ${res.status} for ${REPO}${token ? "" : " (no GITHUB_TOKEN set)"}.`);
      return 0;
    }
    body = await res.json();
  } catch (err) {
    say("warning", `Stable release check skipped: ${err instanceof Error ? err.message : String(err)}`);
    return 0;
  }

  const verdict = judge(body, claimed);
  switch (verdict.status) {
    case "no-stable-release":
      say("warning", "Stable release check skipped: the response had no stable release to compare with.");
      return 0;
    case "stale":
      say(
        "error",
        `FACTS.stableRelease is v${claimed.version} but v${verdict.latest.version} was published ${verdict.latest.publishedAt}. Follow "Release copy refresh" in docs/marketing-facts.md.`,
      );
      return 1;
    case "ok":
      if (!verdict.dateMatches) {
        say("warning", `FACTS.stableRelease date is ${claimed.date} but v${claimed.version} was published ${verdict.latest.publishedAt}.`);
      }
      console.log(`Stable release is current: v${claimed.version} (latest on ${REPO}: v${verdict.latest.version}).`);
      return 0;
  }
}

main().then(
  (code) => process.exit(code),
  (err) => {
    // A broken script or facts file is a real failure, unlike an unreachable GitHub.
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  },
);
