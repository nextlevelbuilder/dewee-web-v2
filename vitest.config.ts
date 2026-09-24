import { defineConfig } from "vitest/config";

// Unit tests only: pure modules under src/ and tests/. Agent worktrees under .claude/ are excluded.
export default defineConfig({
  resolve: { alias: { "~": decodeURIComponent(new URL("./src", import.meta.url).pathname) } },
  test: {
    include: ["tests/**/*.test.ts", "src/**/*.test.ts"],
    exclude: ["**/node_modules/**", ".claude/**", "dist/**"],
  },
});
