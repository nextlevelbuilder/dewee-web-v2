/**
 * Draws the Mermaid diagrams of a post in the browser. Loaded with a dynamic import from
 * post-widgets-client.ts only when the post has a Diagram, so other pages never download
 * mermaid. The package is pinned in package.json and bundled with the site (no CDN, nothing
 * cross-origin). Mermaid runs with securityLevel "strict" and without HTML labels, and the
 * schema already rejects init directives, click handlers and tags in the source.
 *
 * Colours come from the design tokens of the current theme and the diagrams redraw when the
 * reader switches theme. If a diagram fails to draw, its source stays visible with a note.
 */
import type { MermaidConfig } from "mermaid";

type Diagram = { figure: HTMLElement; view: HTMLElement; source: string };

/** Token → `rgb(…)`: mermaid's colour maths does not read oklch(), so let the browser convert. */
function tokenColours(names: string[]): Record<string, string> {
  const probe = document.createElement("span");
  probe.style.display = "none";
  document.body.appendChild(probe);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const out: Record<string, string> = {};
  for (const name of names) {
    probe.style.color = `var(${name})`;
    const value = getComputedStyle(probe).color;
    if (!ctx) {
      out[name] = value;
      continue;
    }
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = value;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    out[name] = `rgb(${r}, ${g}, ${b})`;
  }
  probe.remove();
  return out;
}

function themeConfig(): MermaidConfig {
  const c = tokenColours(["--surface", "--paper-2", "--ink", "--ink-2", "--ink-3", "--rule-strong", "--accent", "--accent-soft", "--seal", "--success-soft", "--warning-soft"]);
  const font = getComputedStyle(document.body).fontFamily;
  return {
    startOnLoad: false,
    securityLevel: "strict",
    htmlLabels: false,
    flowchart: { htmlLabels: false },
    theme: "base",
    fontFamily: font,
    themeVariables: {
      darkMode: document.documentElement.dataset.theme === "dark",
      fontFamily: font,
      fontSize: "15px",
      background: c["--surface"],
      mainBkg: c["--accent-soft"],
      primaryColor: c["--accent-soft"],
      primaryTextColor: c["--ink"],
      primaryBorderColor: c["--accent"],
      secondaryColor: c["--warning-soft"],
      secondaryTextColor: c["--ink"],
      secondaryBorderColor: c["--rule-strong"],
      tertiaryColor: c["--success-soft"],
      tertiaryTextColor: c["--ink"],
      tertiaryBorderColor: c["--rule-strong"],
      lineColor: c["--ink-2"],
      textColor: c["--ink"],
      noteBkgColor: c["--paper-2"],
      noteTextColor: c["--ink"],
      noteBorderColor: c["--rule-strong"],
      edgeLabelBackground: c["--surface"],
      clusterBkg: c["--paper-2"],
      clusterBorder: c["--rule-strong"],
      titleColor: c["--ink"],
      actorBkg: c["--accent-soft"],
      actorBorder: c["--accent"],
      actorTextColor: c["--ink"],
      signalColor: c["--ink-2"],
      signalTextColor: c["--ink"],
      labelTextColor: c["--ink"],
      errorBkgColor: c["--seal"],
      errorTextColor: c["--ink"],
    },
  };
}

let renderCount = 0;

async function drawAll(diagrams: Diagram[]): Promise<void> {
  const { default: mermaid } = await import("mermaid");
  mermaid.initialize(themeConfig());
  for (const d of diagrams) {
    try {
      const { svg } = await mermaid.render(`pw-mermaid-${++renderCount}`, d.source);
      const holder = document.createElement("div");
      holder.className = "pw-diagram__svg";
      // The view carries role="img" and the alt text; the drawing itself is decoration for AT.
      holder.setAttribute("aria-hidden", "true");
      holder.innerHTML = svg;
      d.view.replaceChildren(holder);
      d.figure.dataset.state = "drawn";
    } catch (err) {
      console.warn("Diagram could not be drawn", err);
      fallBack(d);
    }
  }
}

function fallBack(d: Diagram): void {
  if (d.figure.dataset.state === "drawn") return;
  d.figure.dataset.state = "failed";
  const note = d.view.querySelector<HTMLElement>("[data-pw-diagram-note]");
  if (note) note.textContent = d.figure.dataset.failed ?? note.textContent;
}

export function initDiagrams(root: HTMLElement): void {
  const diagrams: Diagram[] = [];
  root.querySelectorAll<HTMLElement>("[data-pw-diagram]").forEach((figure) => {
    const view = figure.querySelector<HTMLElement>("[data-pw-diagram-view]");
    const source = view?.querySelector("pre code")?.textContent ?? "";
    if (view && source.trim()) diagrams.push({ figure, view, source });
  });
  if (!diagrams.length) return;
  for (const d of diagrams) d.figure.dataset.state = "drawing";
  // One pass at a time: mermaid.initialize is global, so a redraw must not overlap a draw.
  let queue = Promise.resolve();
  const run = () => {
    queue = queue.then(() =>
      drawAll(diagrams).catch((err: unknown) => {
        console.warn("Diagrams could not be drawn", err);
        diagrams.forEach(fallBack);
      }),
    );
  };
  run();
  // The theme toggle flips data-theme on <html>; redraw so the diagrams follow it.
  new MutationObserver(run).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
}
