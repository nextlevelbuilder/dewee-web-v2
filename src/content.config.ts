/**
 * Content collections. Only the Markdown docs live here: `src/content/` also holds the site's
 * TypeScript copy files, so the glob is anchored to `src/content/docs` and to `.md` files.
 * Entry ids look like `en/get-started/quickstart`; the first segment is the locale and EN/VI
 * files mirror each other by path.
 */
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { CCP_SCREENS, type CcpScreenId } from "./content/ccp-screens";
import { DOC_SECTION_IDS } from "./content/pages/docs";

const screenIds = CCP_SCREENS.map((s) => s.id) as [CcpScreenId, ...CcpScreenId[]];

const docs = defineCollection({
  loader: glob({ pattern: "{en,vi}/**/*.md", base: "./src/content/docs" }),
  schema: z.object({
    /** Page title without the brand suffix (SeoHead adds " · dewee"). */
    title: z.string().min(3).max(60),
    /** Meta description; DESIGN.md asks for 140–160 characters. */
    description: z.string().min(140).max(160),
    section: z.enum(DOC_SECTION_IDS),
    /** Position inside the section (ascending). */
    order: z.number().int().min(0),
    /** Console screenshots shown on the page, placed with `::shot{id="…"}` lines. */
    screens: z.array(z.enum(screenIds)).optional(),
    updated: z.coerce.date(),
  }),
});

export const collections = { docs };
