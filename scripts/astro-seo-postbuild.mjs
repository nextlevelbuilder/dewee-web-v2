// @ts-check
/// <reference types="node" />
/**
 * Astro integration: after every `astro build` (production and staging), run the SEO/GEO pass
 * (Markdown twins, social cards, page manifest, llms-full) over the prerendered pages.
 * The pass runs in a child Node process so the TypeScript script is executed with Node's own
 * type stripping, and a failure fails the build.
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const SCRIPT = fileURLToPath(new URL("./postbuild-markdown-and-og.ts", import.meta.url));

/** @returns {import("astro").AstroIntegration} */
export default function seoPostbuild() {
  /** @type {string} */
  let site = "https://dewee.sh";
  return {
    name: "dewee-seo-postbuild",
    hooks: {
      "astro:config:done": ({ config }) => {
        if (config.site) site = config.site;
      },
      "astro:build:done": async ({ dir, logger }) => {
        await new Promise((done, fail) => {
          const child = spawn(process.execPath, [SCRIPT, "--dir", fileURLToPath(dir), "--site", site], { stdio: ["ignore", "pipe", "pipe"] });
          child.stdout.on("data", (chunk) => String(chunk).trim().split("\n").forEach((line) => logger.info(line.replace(/^\[seo\] /, ""))));
          child.stderr.on("data", (chunk) => String(chunk).trim().split("\n").forEach((line) => logger.warn(line.replace(/^\[seo\] /, ""))));
          child.on("error", fail);
          child.on("close", (code) => (code === 0 ? done(undefined) : fail(new Error(`SEO postbuild exited with code ${code}`))));
        });
      },
    },
  };
}
