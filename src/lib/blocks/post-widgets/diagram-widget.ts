/**
 * The Diagram widget (Mermaid). Workers have no DOM, so Mermaid cannot draw on the server; the
 * page ships the source in a <pre> and post-diagrams-client.ts draws it in the browser, loading
 * the pinned mermaid package only on posts that contain a diagram. The required alt text names
 * the figure for assistive technology in both states, and the source stays the no-JS fallback.
 */
import { fencedCode } from "./text-widgets";
import type { PostWidget } from "./post-widget-types";
import { attrs, esc } from "./widget-html";

type Diagram = { source: string; alt: string; caption?: string };

export const diagramSource = (source: string) => source.replace(/\r\n?/g, "\n").replace(/^\n+|\s+$/g, "");

export const diagramWidget: PostWidget = {
  html: (props, { labels }) => {
    const d = props as Diagram;
    return (
      `<figure class="pw-diagram"${attrs({ "data-pw-diagram": "", "data-failed": labels.diagramFailed })}>` +
      `<div class="pw-diagram__view" role="img"${attrs({ "aria-label": d.alt })} data-pw-diagram-view>` +
      `<p class="pw-diagram__note" data-pw-diagram-note data-md-skip>${esc(labels.diagramSource)}</p>` +
      `<pre class="pw-diagram__source"><code class="language-mermaid">${esc(diagramSource(d.source))}</code></pre>` +
      // Inside role="img" this is hidden from assistive technology (the aria-label speaks); it
      // gives the text exports the alt text after the source.
      `<p class="visually-hidden" data-pw-diagram-alt>${esc(d.alt)}</p></div>` +
      `${d.caption ? `<figcaption>${esc(d.caption)}</figcaption>` : ""}</figure>`
    );
  },
  markdown: (props) => {
    const d = props as Diagram;
    return `${fencedCode(diagramSource(d.source), "mermaid")}\n\n${d.alt}${d.caption ? `\n\n_${d.caption}_` : ""}`;
  },
};
