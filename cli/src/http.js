/**
 * REST client for /api/v1. Writes always send `content-type: application/json` (the server's
 * origin check rejects body-less or form-typed writes from non-browser clients).
 */

export class ApiError extends Error {
  /**
   * @param {number} status
   * @param {string} code
   * @param {string} message
   * @param {unknown} [details]
   */
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * @param {{ url: string, apiKey: string | null }} config
 * @param {string} method
 * @param {string} path  Path under /api/v1, e.g. "/pages?limit=5"
 * @param {{ json?: unknown, bytes?: Uint8Array, contentType?: string, headers?: Record<string, string> }} [opts]
 */
export async function apiRequest(config, method, path, opts = {}) {
  if (!config.apiKey) throw new Error("No API key. Run `dewee-web auth login --key dwk_…` or set DEWEE_WEB_API_KEY.");
  /** @type {Record<string, string>} */
  const headers = { accept: "application/json", authorization: `Bearer ${config.apiKey}`, "user-agent": "dewee-web-cli/0.1", ...opts.headers };
  /** @type {BodyInit | undefined} */
  let body;
  if (opts.bytes) {
    body = opts.bytes;
    headers["content-type"] = opts.contentType ?? "application/octet-stream";
  } else if (method !== "GET" && method !== "HEAD") {
    body = JSON.stringify(opts.json ?? {});
    headers["content-type"] = "application/json";
  }
  let res;
  try {
    res = await fetch(`${config.url}/api/v1${path}`, { method, headers, body });
  } catch (err) {
    throw new Error(`Could not reach ${config.url}: ${err instanceof Error ? err.message : err}`);
  }
  const text = await res.text();
  /** @type {any} */
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }
  if (!res.ok) {
    const e = payload?.error;
    throw new ApiError(res.status, e?.code ?? "http_error", e?.message ?? `HTTP ${res.status} ${res.statusText}`, e?.details);
  }
  return { status: res.status, data: payload, etag: res.headers.get("etag") };
}

/**
 * `{id}` path segment plus the `?locale=` needed when addressing by slug.
 * @param {string} ref
 * @param {string | undefined} locale
 */
export function itemPath(ref, locale) {
  return `${encodeURIComponent(ref)}${locale ? `?locale=${encodeURIComponent(locale)}` : ""}`;
}

/** @param {ApiError} err */
export function formatApiError(err) {
  const lines = [`${err.code} (${err.status}): ${err.message}`];
  if (Array.isArray(err.details)) {
    for (const d of err.details) lines.push(`  - ${d?.path ?? ""}: ${d?.message ?? JSON.stringify(d)}`);
  } else if (err.details !== undefined) {
    lines.push(`  ${JSON.stringify(err.details)}`);
  }
  return lines.join("\n");
}
