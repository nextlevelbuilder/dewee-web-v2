/**
 * Release notes come from a private repository but are published on a public site (and committed
 * to a public repo as a seed). This removes what only makes sense, or is only safe, inside that
 * repository and keeps every other word as written:
 *  - links, PR/issue refs, merge lines, compare links and commit SHAs of the private repo
 *  - "New Contributors" sections and "by @user in <pr>" attributions
 *  - email addresses other than the public contact, token-like strings, private keys
 *  - URLs and hostnames that only resolve on internal networks
 * Pure and dependency-free: the worker sync and the Node seed script share it.
 */

export const PUBLIC_EMAIL = "hi@nextlevelbuilder.io";
const REDACTED = "[redacted]";

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Hosts that only resolve inside a private network or a developer machine. */
const INTERNAL_HOST_RE =
  /^(?:localhost|0\.0\.0\.0|127(?:\.\d{1,3}){3}|10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2}|\[?::1\]?|[\w.-]+\.(?:internal|local|localhost|lan|corp|home\.arpa|svc|cluster\.local|ts\.net|workers\.dev|pages\.dev))$/i;

/** Bare internal hostnames written in prose (not a URL): suffixes that are never public. */
const INTERNAL_BARE_HOST_RE = /\b[\w-]+(?:\.[\w-]+)*\.(?:internal|svc\.cluster\.local|cluster\.local|ts\.net)\b/gi;

const PRIVATE_IP_RE = /\b(?:10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})(?::\d+)?\b/g;

const PRIVATE_KEY_RE = /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?(?:-----END [A-Z ]*PRIVATE KEY-----|$)/g;

const TOKEN_PATTERNS: RegExp[] = [
  /\bgithub_pat_[A-Za-z0-9_]{20,}/g,
  /\bgh[pousr]_[A-Za-z0-9]{20,}/g,
  /\bsk-(?:proj-|ant-|live-|test-)?[A-Za-z0-9_-]{16,}/g,
  /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/g,
  /\bAIza[0-9A-Za-z_-]{35}\b/g,
  /\bxox[abprs]-[A-Za-z0-9-]{10,}/g,
  /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g,
  /\b(?:re|rk|pk|whsec)_[A-Za-z0-9]{24,}\b/g,
];

/** `API_KEY=...`, `password: ...` and similar assignments keep the name and lose the value. */
const SECRET_ASSIGNMENT_RE = /\b([\w-]*(?:api[_-]?key|secret|token|password|passwd)[\w-]*)(\s*[:=]\s*)(["'`]?)([^\s"'`]{8,})\3/gi;

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g;

/** Commit SHAs: full 40-hex, or 7 to 39 hex chars with both a digit and a letter (never a plain word or number). */
const SHA_RE = /\b(?=[0-9a-f]*\d)(?=[0-9a-f]*[a-f])[0-9a-f]{7,40}\b/g;

const DROP_LINE_RE = [
  /^\s*(?:[-*+]\s+)?Merge (?:pull request|branch|remote-tracking branch)\b/i,
  /^\s*\*\*Full Changelog\*\*/i,
  /^\s*Automated (?:beta |stable )?release from\b/i,
];

type Options = { repo: string; tag?: string };

function isInternalUrl(raw: string): boolean {
  try {
    return INTERNAL_HOST_RE.test(new URL(raw).hostname);
  } catch {
    return false;
  }
}

/** Drops a section (heading + body) whose heading text matches, up to the next heading of the same or higher level. */
function dropSection(lines: string[], heading: RegExp): string[] {
  const out: string[] = [];
  let skipDepth = 0;
  for (const line of lines) {
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (skipDepth && h && h[1].length <= skipDepth) skipDepth = 0;
    if (!skipDepth && h && heading.test(h[2].trim())) {
      skipDepth = h[1].length;
      continue;
    }
    if (!skipDepth) out.push(line);
  }
  return out;
}

/** Marks lines inside fenced code (fence lines included): a `# comment` there is not a heading. */
function fencedLines(lines: string[]): boolean[] {
  let open = false;
  return lines.map((line) => {
    const fence = /^\s*(```|~~~)/.test(line);
    if (fence) open = !open;
    return open || fence;
  });
}

/** Removes headings with nothing but blank lines (or deeper empty headings) under them. */
function dropEmptyHeadings(lines: string[]): string[] {
  const keep = lines.map(() => true);
  const fenced = fencedLines(lines);
  const heading = (i: number) => (fenced[i] ? null : /^(#{1,6})\s/.exec(lines[i]));
  for (let i = lines.length - 1; i >= 0; i--) {
    const h = heading(i);
    if (!h) continue;
    let j = i + 1;
    while (j < lines.length && (!keep[j] || lines[j].trim() === "")) j++;
    const next = j < lines.length ? heading(j) : null;
    if (j >= lines.length || (next && next[1].length <= h[1].length)) keep[i] = false;
  }
  return lines.filter((_, i) => keep[i]);
}

function scrubLine(line: string, repoRe: string, inFence: boolean): string {
  const repoUrl = new RegExp(`(?:https?://)?(?:www\\.)?(?:api\\.)?github\\.com/(?:repos/)?${repoRe}(?:[/?#][^\\s)\\]>]*)?`, "gi");
  let s = line
    // " by @user in <private PR url>" and " in <private PR url>" attributions
    .replace(new RegExp(`\\s+by\\s+@[\\w-]+(?:\\[bot\\])?\\s+in\\s+(?:https?://)?(?:www\\.)?github\\.com/${repoRe}\\S*`, "gi"), "")
    .replace(new RegExp(`\\s+in\\s+(?:https?://)?(?:www\\.)?github\\.com/${repoRe}\\S*`, "gi"), "")
    .replace(/\s+by\s+@[\w-]+(?:\[bot\])?\s*$/i, "")
    // Markdown links and autolinks into the private repo keep only their text
    .replace(new RegExp(`\\[([^\\]]*)\\]\\(\\s*(?:https?://)?(?:www\\.)?github\\.com/${repoRe}[^)]*\\)`, "gi"), "$1")
    .replace(new RegExp(`<\\s*(?:https?://)?(?:www\\.)?github\\.com/${repoRe}[^>]*>`, "gi"), "")
    .replace(repoUrl, "")
    // owner/repo#12, owner/repo@sha
    .replace(new RegExp(`\\b${repoRe}(?:#\\d+|@[0-9a-f]{7,40})`, "gi"), "")
    // (#12), (#12, #13), and bare #12 or #12-#14 refs
    .replace(/\s*\(\s*#\d+(?:\s*,\s*#\d+)*\s*\)/g, "")
    .replace(/(^|[\s(,])#\d+(?:\s*[-–,]\s*#\d+)*\b/g, "$1")
    // internal URLs: links keep their text, bare URLs go
    .replace(/\[([^\]]*)\]\(\s*(https?:\/\/[^)\s]+)[^)]*\)/g, (m, text: string, url: string) => (isInternalUrl(url) ? text : m))
    .replace(/<(https?:\/\/[^>\s]+)>/g, (m, url: string) => (isInternalUrl(url) ? "" : m))
    .replace(/https?:\/\/[^\s)\]>"'`]+/g, (url) => (isInternalUrl(url) ? "" : url))
    .replace(INTERNAL_BARE_HOST_RE, "")
    .replace(PRIVATE_IP_RE, "");

  for (const re of TOKEN_PATTERNS) s = s.replace(re, REDACTED);
  s = s
    .replace(SECRET_ASSIGNMENT_RE, (_m, name: string, sep: string, quote: string) => `${name}${sep}${quote}${REDACTED}${quote}`)
    .replace(EMAIL_RE, (email) => (email.toLowerCase() === PUBLIC_EMAIL ? email : REDACTED))
    .replace(SHA_RE, "");

  if (inFence || s === line) return s;
  // Tidy what the removals left behind (indentation kept): empty parens, doubled spaces, dangling separators.
  const indent = /^[ \t]*/.exec(s)?.[0] ?? "";
  const rest = s
    .slice(indent.length)
    .replace(/\(\s*\)|\[\s*\]\(\s*\)/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/[ \t]+([,.;:])(?=\s|$)/g, "$1")
    .replace(/[ \t]+$/g, "");
  return indent + rest;
}

/** Removes a leading heading that only repeats the tag (`## v3.34.0-beta.2`). */
function dropTagHeading(lines: string[], tag: string | undefined): string[] {
  if (!tag) return lines;
  const first = lines.findIndex((l) => l.trim() !== "");
  if (first >= 0 && new RegExp(`^#{1,6}\\s+${escapeRe(tag)}\\s*$`, "i").test(lines[first].trim())) {
    return lines.slice(first + 1);
  }
  return lines;
}

export function sanitiseReleaseNotes(body: string | null | undefined, opts: Options): string {
  if (!body) return "";
  const repoRe = escapeRe(opts.repo.trim().replace(/^\/+|\/+$/g, ""));
  let lines = body.replace(/\r\n?/g, "\n").replace(PRIVATE_KEY_RE, REDACTED).split("\n");
  lines = dropTagHeading(lines, opts.tag);
  lines = dropSection(lines, /^new contributors$/i);
  lines = lines.filter((l) => !DROP_LINE_RE.some((re) => re.test(l)));

  let inFence = false;
  lines = lines.map((line) => {
    const fenceLine = /^\s*(```|~~~)/.test(line);
    if (fenceLine) inFence = !inFence;
    const scrubbed = scrubLine(line, repoRe, inFence && !fenceLine);
    // A list item or blockquote emptied by the scrub goes entirely.
    if (!inFence && /^\s*(?:[-*+]|\d+[.)]|>)\s*$/.test(scrubbed) && scrubbed.trim() !== line.trim()) return "\u0000";
    return scrubbed;
  });
  lines = lines.filter((l) => l !== "\u0000");
  lines = dropEmptyHeadings(lines);
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

/** Release names are one line of plain text; the same rules apply. */
export function sanitiseReleaseName(name: string | null | undefined, tag: string, repo: string): string {
  const clean = sanitiseReleaseNotes(name ?? "", { repo }).replace(/\s+/g, " ").trim();
  return clean || tag;
}
