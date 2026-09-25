/** `auth login` (verify a key against /api/v1/me, then store it) and `auth status`. */
import { stringFlag } from "../args.js";
import { configPath, isApiKey, loadConfig, normalizeUrl, saveConfig } from "../config.js";
import { apiRequest } from "../http.js";
import { info, printJson } from "../output.js";

/** Reads a key piped on stdin (`--key -`), so it never lands in shell history. */
async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8").trim();
}

/**
 * @param {string[]} args
 * @param {Record<string, string | true>} flags
 */
export async function authCommand([action], flags) {
  if (action === "login") {
    let key = stringFlag(flags, "key") ?? process.env.DEWEE_WEB_API_KEY ?? "";
    if (key === "-") key = await readStdin();
    key = key.trim();
    if (!isApiKey(key)) throw new Error("Pass a key like dwk_xxxxxxxx_… with --key (or --key - to read it from stdin). Create one in /admin/keys.");
    const current = await loadConfig();
    const url = normalizeUrl(stringFlag(flags, "url") ?? current.url);
    const me = await apiRequest({ url, apiKey: key }, "GET", "/me");
    const path = await saveConfig({ url, apiKey: key });
    info(`Signed in to ${url} as ${me.data.data.email} with scopes: ${me.data.data.scopes.join(", ")}.`);
    info(`Saved to ${path} (mode 600).`);
    return;
  }
  if (action === "status") {
    const config = await loadConfig();
    if (!config.apiKey) {
      info(`Not signed in. Site: ${config.url}. Config file: ${configPath()}.`);
      return 1;
    }
    const me = await apiRequest(config, "GET", "/me");
    if (flags.json) return printJson({ url: config.url, source: config.source, ...me.data.data });
    info(`Site:   ${config.url}`);
    info(`Key:    ${config.apiKey.slice(0, 12)}… (from ${config.source === "env" ? "DEWEE_WEB_API_KEY" : configPath()})`);
    info(`Owner:  ${me.data.data.email}`);
    info(`Scopes: ${me.data.data.scopes.join(", ")}`);
    return;
  }
  throw new Error(`Unknown command "auth ${action ?? ""}". Use \`auth login --key …\` or \`auth status\`.`);
}
