/**
 * Credentials: DEWEE_WEB_API_KEY / DEWEE_WEB_URL win; otherwise ~/.config/dewee-web/config.json
 * (or $XDG_CONFIG_HOME/dewee-web/config.json), written with mode 600 inside a 700 directory.
 */
import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

export const DEFAULT_URL = "https://dewee.sh";
const KEY_RE = /^dwk_[A-Za-z0-9]{8}_[A-Za-z0-9]{32,}$/;

export function configPath() {
  const base = process.env.XDG_CONFIG_HOME || join(homedir(), ".config");
  return join(base, "dewee-web", "config.json");
}

/** @param {string} key */
export function isApiKey(key) {
  return KEY_RE.test(key);
}

/**
 * Normalises a site URL: https (http only for localhost), no trailing slash, no path.
 * @param {string} raw
 */
export function normalizeUrl(raw) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`"${raw}" is not a URL.`);
  }
  const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  if (url.protocol !== "https:" && !(local && url.protocol === "http:")) throw new Error("Use an https:// URL (http is allowed for localhost only).");
  return url.origin;
}

/** @returns {Promise<{ url?: string, apiKey?: string }>} */
async function readFileConfig() {
  try {
    const parsed = JSON.parse(await readFile(configPath(), "utf8"));
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (err) {
    if (/** @type {NodeJS.ErrnoException} */ (err).code === "ENOENT") return {};
    throw new Error(`Could not read ${configPath()}: ${err instanceof Error ? err.message : err}`);
  }
}

/**
 * @returns {Promise<{ url: string, apiKey: string | null, source: "env" | "file" | "none" }>}
 */
export async function loadConfig() {
  const file = await readFileConfig();
  const envKey = process.env.DEWEE_WEB_API_KEY?.trim();
  const url = normalizeUrl(process.env.DEWEE_WEB_URL?.trim() || file.url || DEFAULT_URL);
  if (envKey) return { url, apiKey: envKey, source: "env" };
  if (typeof file.apiKey === "string" && file.apiKey) return { url, apiKey: file.apiKey, source: "file" };
  return { url, apiKey: null, source: "none" };
}

/** @param {{ url: string, apiKey: string }} config */
export async function saveConfig(config) {
  const path = configPath();
  const dir = join(path, "..");
  await mkdir(dir, { recursive: true, mode: 0o700 });
  await writeFile(path, `${JSON.stringify({ url: config.url, apiKey: config.apiKey }, null, 2)}\n`, { mode: 0o600 });
  await chmod(path, 0o600);
  return path;
}
