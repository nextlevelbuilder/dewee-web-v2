/**
 * llms.txt (llmstxt.org): an H1, a blockquote summary, a short note on how to read the site,
 * then H2 sections of `[title](url): description` links, mostly to Markdown twins.
 */
import { pick, type Bi, type Locale } from "../../../i18n/config.ts";
import { LLMS_GROUPS, type SectionId } from "./page-sections.ts";

/** `href` is site-relative: a Markdown twin, or another agent-readable resource (the OpenAPI spec). */
export type LlmsLink = { title: string; href: string; description: string; section: SectionId };

type Intro = { summary: Bi; note: Bi };

const oneLine = (s: string, max = 220) => {
  const clean = s.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1).replace(/\s+\S*$/, "")}…` : clean;
};

/** Titles and descriptions come from page metadata; square brackets would break the link syntax. */
const linkText = (s: string) => oneLine(s, 120).replace(/[[\]]/g, "");

export function llmsTxt(opts: { locale: Locale; siteUrl: string; name: string; intro: Intro; email: string; links: LlmsLink[] }): string {
  const site = opts.siteUrl.replace(/\/$/, "");
  const { locale } = opts;
  const lines = [`# ${opts.name}`, "", `> ${oneLine(pick(opts.intro.summary, locale), 400)}`, "", pick(opts.intro.note, locale)
    .replace("{site}", site)
    .replace("{email}", opts.email), ""];

  const seen = new Set<string>();
  for (const group of LLMS_GROUPS) {
    const links = opts.links.filter((l) => group.members.includes(l.section) && !seen.has(l.href));
    if (!links.length) continue;
    lines.push(`## ${pick(group.title, locale)}`, "");
    for (const l of links) {
      seen.add(l.href);
      const description = l.description ? `: ${oneLine(l.description)}` : "";
      lines.push(`- [${linkText(l.title) || l.href}](${site}${l.href})${description}`);
    }
    lines.push("");
  }
  return `${lines.join("\n").trimEnd()}\n`;
}
