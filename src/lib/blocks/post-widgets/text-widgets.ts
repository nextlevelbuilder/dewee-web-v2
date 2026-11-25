/**
 * Text-first widgets for posts: SocialCard (a static quote of a public post, no third-party
 * script) and CodeBlock (server-highlighted code with a copy button). `codeBlockHtml` also
 * renders the fenced code of the Markdown body, so both look and behave the same.
 */
import { hostLabel, SOCIAL_PLATFORM_NAMES, socialPlatform } from "../media-urls";
import { highlight } from "./code-highlight";
import type { PostWidget } from "./post-widget-types";
import { quoteLines } from "./content-widgets";
import { attrs, esc, fill, icon, type WidgetLabels } from "./widget-html";

const str = (v: unknown) => (typeof v === "string" ? v : "");

/** Fence language → a safe token (`ts title="x"` → `ts`). */
export function codeLanguage(info: string | undefined): string {
  const lang = (info ?? "").trim().split(/\s+/)[0]?.toLowerCase() ?? "";
  return /^[a-z0-9+#.-]{1,24}$/.test(lang) ? lang : "";
}

export function codeBlockHtml(code: string, info: string | undefined, labels: WidgetLabels, extra: { filename?: string; caption?: string } = {}): string {
  const lang = codeLanguage(info);
  const label = extra.filename || (!lang || ["text", "txt", "plain", "plaintext"].includes(lang) ? labels.plainCode : lang);
  const body = code.replace(/\n$/, "");
  return (
    `<figure class="pw-code code-block"><div class="pw-code__bar" data-md-skip><span class="pw-code__lang">${esc(label)}</span>` +
    `<button type="button" class="pw-code__copy" data-copy-code hidden>${icon("copy", 16)}<span>${esc(labels.copy)}</span></button></div>` +
    `<pre class="pw-code__pre" tabindex="0"${attrs({ "data-language": lang || undefined })}><code${attrs({ class: lang ? `language-${lang}` : undefined })}>${highlight(body, lang)}</code></pre>` +
    `${extra.caption ? `<figcaption>${esc(extra.caption)}</figcaption>` : ""}</figure>`
  );
}

/** A Markdown fence that cannot be closed early by backticks inside the code. */
export function fencedCode(code: string, lang: string): string {
  const longest = Math.max(0, ...(code.match(/`+/g) ?? []).map((r) => r.length));
  const fence = "`".repeat(Math.max(3, longest + 1));
  return `${fence}${lang}\n${code.replace(/\n$/, "")}\n${fence}`;
}

const paragraphs = (text: string) =>
  text
    .split(/\n{2,}/)
    .map((para) => para.trim())
    .filter(Boolean)
    .map((para) => `<p>${esc(para).replace(/\n/g, "<br />")}</p>`)
    .join("");

function platformName(url: string): string {
  const platform = socialPlatform(url);
  return platform && platform !== "web" ? SOCIAL_PLATFORM_NAMES[platform] : hostLabel(url);
}

const socialCard: PostWidget = {
  html: (p, { labels }) => {
    const url = str(p.url);
    const platform = socialPlatform(url) ?? "web";
    const name = platformName(url);
    const author = str(p.author);
    const handle = str(p.handle);
    const image = p.image as { src: string; alt: string } | undefined;
    const who = author || handle ? `<span class="pw-social__author">${author ? `<b>${esc(author)}</b>` : ""}${handle ? ` <span>${esc(handle)}</span>` : ""}</span>` : "";
    return (
      `<figure class="pw-social" data-platform="${esc(platform)}">` +
      `<p class="pw-social__platform">${icon(platform === "web" ? "link" : "message-square", 16)}<span>${esc(name)}</span></p>` +
      `<blockquote class="pw-social__quote" cite="${esc(url)}">${p.title ? `<p class="pw-social__title">${esc(str(p.title))}</p>` : ""}${paragraphs(str(p.text))}</blockquote>` +
      (image ? `<img class="pw-social__image"${attrs({ src: image.src, alt: image.alt, loading: "lazy", decoding: "async" })} />` : "") +
      `<figcaption class="pw-social__meta">${who}${p.date ? `<span>${esc(str(p.date))}</span>` : ""}` +
      `<a href="${esc(url)}" rel="noopener nofollow ugc">${esc(fill(labels.viewOn, { platform: name }))}${icon("external-link", 14)}</a></figcaption></figure>`
    );
  },
  markdown: (p, { labels }) => {
    const url = str(p.url);
    const name = platformName(url);
    const who = [str(p.author), str(p.handle) && `(${str(p.handle)})`].filter(Boolean).join(" ");
    const body = [str(p.title) && `**${str(p.title)}**`, str(p.text)].filter(Boolean).join("\n\n");
    const credit = `— ${who ? `${fill(labels.postBy, { author: who, platform: name })}` : name}${p.date ? `, ${str(p.date)}` : ""}: [${fill(labels.viewOn, { platform: name })}](${url})`;
    return quoteLines(`${body}\n\n${credit}`);
  },
};

const codeBlock: PostWidget = {
  html: (p, { labels }) => codeBlockHtml(str(p.code), str(p.language), labels, { filename: str(p.filename) || undefined, caption: str(p.caption) || undefined }),
  markdown: (p) => `${p.filename ? `**${str(p.filename)}**\n\n` : ""}${fencedCode(str(p.code), codeLanguage(str(p.language)))}${p.caption ? `\n\n_${str(p.caption)}_` : ""}`,
};

export const TEXT_WIDGETS: Record<string, PostWidget> = { SocialCard: socialCard, CodeBlock: codeBlock };
