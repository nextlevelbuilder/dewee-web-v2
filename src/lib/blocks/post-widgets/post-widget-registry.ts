/**
 * Renderers for every block type a post may use. Adding a post widget takes three steps:
 *   1. a BlockDef with `contexts` including "post" (post-block-schemas.ts, or a new *-block-schemas.ts
 *      listed in registry.ts), so REST, MCP, the CLI and the admin validate it;
 *   2. a PostWidget entry here (html + markdown), so the page, the preview and RSS render it;
 *   3. styles in src/styles/post-widgets.css and, only if it needs behaviour, post-widgets-client.ts.
 * tests/blog/post-widgets.test.ts fails when a post block type has no renderer.
 */
import { chartWidget } from "./chart-widget";
import { COMPARISON_WIDGETS } from "./comparison-widgets";
import { CONTENT_WIDGETS } from "./content-widgets";
import { diagramWidget } from "./diagram-widget";
import { DEMO_WIDGETS } from "./demo-widget";
import { INTERACTIVE_WIDGETS } from "./interactive-widgets";
import { MEDIA_WIDGETS } from "./media-widgets";
import type { PostWidget } from "./post-widget-types";
import { TEXT_WIDGETS } from "./text-widgets";

export const POST_WIDGETS: Readonly<Record<string, PostWidget>> = {
  ...CONTENT_WIDGETS,
  ...MEDIA_WIDGETS,
  ...TEXT_WIDGETS,
  Chart: chartWidget,
  Diagram: diagramWidget,
  ...COMPARISON_WIDGETS,
  ...INTERACTIVE_WIDGETS,
  ...DEMO_WIDGETS,
};

export function postWidget(type: string): PostWidget | undefined {
  return Object.hasOwn(POST_WIDGETS, type) ? POST_WIDGETS[type] : undefined;
}
