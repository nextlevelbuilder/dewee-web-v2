/**
 * Demo: someone else's interactive page behind a click-to-load facade. Nothing loads from the
 * demo host until the reader presses the button; then interactive-widgets-client.ts swaps in an
 * iframe with `sandbox="allow-scripts"` (DEMO_SANDBOX). Without JavaScript it is a link that
 * opens the demo in a new tab. Text exports get the link and the description.
 */
import { DEMO_SANDBOX, parseDemoUrl } from "../demo-urls";
import type { PostWidget } from "./post-widget-types";
import { attrs, esc, fill, icon } from "./widget-html";

const str = (v: unknown) => (typeof v === "string" ? v : "");
const ASPECT_CLASS: Record<string, string> = { "16:9": "16x9", "4:3": "4x3", "1:1": "1x1", "3:4": "3x4" };

export const DEMO_WIDGETS: Record<string, PostWidget> = {
  Demo: {
    html: (p, { labels }) => {
      const url = parseDemoUrl(str(p.url));
      if (!url) return "";
      const title = str(p.title);
      const description = str(p.description);
      const caption = str(p.caption);
      const host = url.hostname;
      const aspect = ASPECT_CLASS[str(p.aspectRatio)] ?? "16x9";
      const open = `<a href="${esc(url.href)}" target="_blank" rel="noopener noreferrer">${esc(fill(labels.demoOpen, { host }))}</a>`;
      return (
        `<figure class="pw-demo"${attrs({ "data-pw-demo": "", "data-src": url.href, "data-title": title, "data-sandbox": DEMO_SANDBOX })}>` +
        `<div class="pw-demo__frame pw-demo__frame--${aspect}"><div class="pw-demo__facade">` +
        `<p class="pw-demo__title">${esc(title)}</p>` +
        (description ? `<p class="pw-demo__desc">${esc(description)}</p>` : "") +
        `<a class="btn btn--primary pw-demo__load" href="${esc(url.href)}" target="_blank" rel="noopener noreferrer" data-pw-demo-trigger>${icon("play", 18)}<span>${esc(labels.demoLoad)}</span></a>` +
        `<p class="pw-demo__note">${esc(fill(labels.demoNote, { host }))}</p></div></div>` +
        `<figcaption>${caption ? `<span>${esc(caption)}</span>` : ""}${open}</figcaption></figure>`
      );
    },
    markdown: (p) => {
      const url = parseDemoUrl(str(p.url));
      if (!url) return "";
      return `**[${str(p.title)}](${url.href})**${p.description ? `: ${str(p.description)}` : ""}`;
    },
  },
};
