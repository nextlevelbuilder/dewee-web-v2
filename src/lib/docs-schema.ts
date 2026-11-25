/**
 * Front matter of a docs page. The content collection (src/content.config.ts) and the docs change
 * proposals (src/lib/server/docs/) share this one schema, so an MCP proposal is checked against
 * exactly what the build will accept.
 */
import { z } from "zod";
import { CCP_SCREENS, type CcpScreenId } from "../content/ccp-screens";
import { DOC_SECTION_IDS } from "../content/pages/docs";

const screenIds = CCP_SCREENS.map((s) => s.id) as [CcpScreenId, ...CcpScreenId[]];

export const docFrontMatterSchema = z.object({
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
});

export type DocFrontMatter = z.infer<typeof docFrontMatterSchema>;
