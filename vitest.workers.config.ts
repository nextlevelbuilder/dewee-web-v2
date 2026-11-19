import { cloudflareTest } from "@cloudflare/vitest-plugin";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [cloudflareTest({ wrangler: { configPath: "./tests/workers/wrangler.jsonc" } })],
  test: { include: ["tests/workers/**/*.workers-spec.ts"] },
});
