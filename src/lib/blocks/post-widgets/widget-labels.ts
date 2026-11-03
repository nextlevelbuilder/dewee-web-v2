/** Widget labels for one locale, from the blog copy (src/content/pages/blog.ts). */
import { BLOG } from "../../../content/pages/blog";
import { pick, type Locale } from "../../../i18n/config";
import type { WidgetLabels } from "./widget-html";

export function widgetLabels(locale: Locale): WidgetLabels {
  return Object.fromEntries(Object.entries(BLOG.widgets).map(([k, v]) => [k, pick(v, locale)])) as WidgetLabels;
}
