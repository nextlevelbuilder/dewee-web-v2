/** `blocks list|schema` and `media upload`. */
import { readFile, stat } from "node:fs/promises";
import { basename, extname } from "node:path";
import { stringFlag } from "../args.js";
import { apiRequest } from "../http.js";
import { info, printJson, printTable } from "../output.js";

const IMAGE_TYPES = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif", ".avif": "image/avif" };
const MAX_BYTES = 10 * 1024 * 1024;

/**
 * @param {{ url: string, apiKey: string | null }} config
 * @param {string[]} args
 * @param {Record<string, string | true>} flags
 */
export async function blocksCommand(config, [action, type], flags) {
  // Block metadata is public, so these work before `auth login` and send no credentials.
  const get = async (/** @type {string} */ path) => {
    let res;
    try {
      res = await fetch(`${config.url}/api/v1${path}`, { headers: { accept: "application/json" } });
    } catch (err) {
      throw new Error(`Could not reach ${config.url}: ${err instanceof Error ? err.message : err}`);
    }
    const body = await res.json().catch(() => null);
    if (!res.ok) throw new Error(body?.error?.message ?? `HTTP ${res.status}`);
    return body;
  };
  if (action === "list") {
    const body = await get("/blocks");
    if (flags.json) return printJson(body);
    printTable(["type", "category", "description"], body.data.map((/** @type {any} */ b) => [b.type, b.category, b.description]), 90);
    return;
  }
  if (action === "schema") {
    if (!type) throw new Error("Usage: dewee-web blocks schema <Type>");
    return printJson((await get(`/blocks/${encodeURIComponent(type)}`)).data);
  }
  throw new Error(`Unknown command "blocks ${action ?? ""}". Use \`blocks list\` or \`blocks schema <Type>\`.`);
}

/**
 * @param {{ url: string, apiKey: string | null }} config
 * @param {string[]} args
 * @param {Record<string, string | true>} flags
 */
export async function mediaCommand(config, [action, file], flags) {
  if (action !== "upload" || !file) throw new Error("Usage: dewee-web media upload <image-file>");
  const type = IMAGE_TYPES[/** @type {keyof typeof IMAGE_TYPES} */ (extname(file).toLowerCase())];
  if (!type) throw new Error(`Only images can be uploaded: ${Object.keys(IMAGE_TYPES).join(", ")}.`);
  const size = (await stat(file)).size;
  if (size > MAX_BYTES) throw new Error(`${file} is ${(size / 1048576).toFixed(1)} MB; the limit is 10 MB.`);
  const bytes = new Uint8Array(await readFile(file));
  const name = stringFlag(flags, "filename") ?? basename(file);
  const res = await apiRequest(config, "POST", `/media?filename=${encodeURIComponent(name)}`, { bytes, contentType: type });
  if (flags.json) return printJson(res.data);
  info(`Uploaded ${res.data.data.size} bytes.`);
  process.stdout.write(`${res.data.data.url}\n`);
  info(`Fallback: ${config.url}${res.data.data.fallback_url}`);
}
