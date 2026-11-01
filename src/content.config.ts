/**
 * Content collections. Only the Markdown docs live here: `src/content/` also holds the site's
 * TypeScript copy files, so the glob is anchored to `src/content/docs` and to `.md` files.
 * Entry ids look like `en/get-started/quickstart`; the first segment is the locale and EN/VI
 * files mirror each other by path.
 */
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { docFrontMatterSchema } from "./lib/docs-schema";

const docs = defineCollection({
  loader: glob({ pattern: "{en,vi}/**/*.md", base: "./src/content/docs" }),
  // Shared with the docs change proposals of the content MCP (src/lib/server/docs/).
  schema: docFrontMatterSchema,
});

export const collections = { docs };
