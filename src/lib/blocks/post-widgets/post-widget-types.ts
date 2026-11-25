/**
 * The contract every post widget renderer implements. A widget is a registry block type
 * (src/lib/blocks/registry.ts) with `contexts` including "post", plus one entry of this shape in
 * POST_WIDGETS (post-widget-registry.ts). Props arrive already validated by the block schema.
 */
import type { WidgetContext } from "./widget-html";

export type PostWidget = {
  /** Safe HTML for the post page and the admin preview (identical in both). */
  html: (props: Record<string, unknown>, ctx: WidgetContext) => string;
  /** A meaningful Markdown stand-in for RSS, llms-full.txt and other text exports. */
  markdown: (props: Record<string, unknown>, ctx: WidgetContext) => string;
  /** The page's `.md` twin cannot read this widget's HTML (a form), so it carries `markdown` instead. */
  twinFromMarkdown?: boolean;
};
