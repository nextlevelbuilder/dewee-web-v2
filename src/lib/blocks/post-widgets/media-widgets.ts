/**
 * Media widgets for posts: Gallery (carousel or grid), Video (native player) and VideoEmbed
 * (YouTube/Vimeo behind a click-to-load poster). Everything works without JavaScript: the
 * carousel is a scroll-snapping list, the video plays with native controls, and an embed is a
 * link to the video page. post-widgets-client.ts adds the buttons, keys and the player iframe.
 */
import { embedPlayerUrl, parseVideoEmbed, SOCIAL_PLATFORM_NAMES } from "../media-urls";
import type { PostWidget } from "./post-widget-types";
import { attrs, esc, fill, icon } from "./widget-html";

type Img = { src: string; alt: string; caption?: string; pixelWidth?: number; pixelHeight?: number };
type Source = { src: string; type: string };
type Track = { src: string; srclang: string; label: string; kind?: string; default?: boolean };

const str = (v: unknown) => (typeof v === "string" ? v : "");
const list = <T>(v: unknown) => (Array.isArray(v) ? (v as T[]) : []);
const fileType = (s: Source) => (s.type === "video/webm" ? "WebM" : "MP4");

function slideFigure(img: Img): string {
  return (
    `<figure><img${attrs({ src: img.src, alt: img.alt, width: img.pixelWidth, height: img.pixelHeight, loading: "lazy", decoding: "async" })} />` +
    `${img.caption ? `<figcaption>${esc(img.caption)}</figcaption>` : ""}</figure>`
  );
}

const gallery: PostWidget = {
  html: (p, { labels }) => {
    const images = list<Img>(p.images);
    const label = str(p.label) || labels.gallery;
    const caption = str(p.caption);
    const foot = caption ? `<figcaption class="pw-gallery__caption">${esc(caption)}</figcaption>` : "";
    if (p.layout === "grid") {
      return `<figure class="pw-gallery pw-gallery--grid"><ul class="pw-gallery__grid" role="list" aria-label="${esc(label)}">${images.map((img) => `<li>${slideFigure(img)}</li>`).join("")}</ul>${foot}</figure>`;
    }
    const slides = images
      .map((img, i) => `<li class="pw-gallery__slide" role="group" aria-roledescription="slide" aria-label="${esc(fill(labels.slideOf, { n: i + 1, total: images.length }))}">${slideFigure(img)}</li>`)
      .join("");
    return (
      `<figure class="pw-gallery pw-gallery--carousel"><div class="pw-gallery__viewport" role="group" aria-roledescription="carousel" aria-label="${esc(label)}" data-pw-gallery>` +
      `<div class="pw-gallery__controls" data-pw-controls hidden>` +
      `<button type="button" class="pw-gallery__btn" data-pw-prev aria-label="${esc(labels.previous)}">${icon("chevron-left", 20)}</button>` +
      `<p class="pw-gallery__count" aria-live="polite" data-pw-count>${esc(fill(labels.slideOf, { n: 1, total: images.length }))}</p>` +
      `<button type="button" class="pw-gallery__btn" data-pw-next aria-label="${esc(labels.next)}">${icon("chevron-right", 20)}</button></div>` +
      `<ul class="pw-gallery__track" role="list" tabindex="0" aria-label="${esc(label)}" data-pw-track>${slides}</ul></div>${foot}</figure>`
    );
  },
  markdown: (p) =>
    [
      ...(p.caption ? [`_${str(p.caption)}_`, ""] : []),
      ...list<Img>(p.images).map((img) => `- ![${img.alt}](${img.src})${img.caption ? ` ${img.caption}` : ""}`),
    ].join("\n"),
};

const video: PostWidget = {
  html: (p, { labels }) => {
    const sources = list<Source>(p.sources);
    const tracks = list<Track>(p.tracks);
    const first = sources[0];
    const title = str(p.title);
    const caption = str(p.caption);
    // Never the `autoplay` attribute: the client starts muted loops only for readers who allow motion.
    const media =
      `<video${attrs({ class: "pw-video__media", controls: true, preload: "metadata", playsinline: true, poster: str(p.poster) || undefined, "aria-label": title, width: p.pixelWidth as number | undefined, height: p.pixelHeight as number | undefined, muted: p.muted === true, loop: p.loop === true, "data-pw-autoplay": p.autoplay === true ? "" : undefined })}>` +
      sources.map((s) => `<source${attrs({ src: s.src, type: s.type })} />`).join("") +
      tracks.map((t) => `<track${attrs({ kind: t.kind ?? "captions", src: t.src, srclang: t.srclang, label: t.label, default: t.default === true })} />`).join("") +
      `<a href="${esc(first?.src ?? "")}">${esc(labels.videoFile)}</a></video>`;
    const fileLink = first ? `<a class="pw-video__file" href="${esc(first.src)}" rel="noopener">${esc(labels.videoFile)} (${fileType(first)})</a>` : "";
    return `<figure class="pw-video">${media}<figcaption><span>${esc(caption || title)}</span>${fileLink}</figcaption></figure>`;
  },
  markdown: (p, { labels }) => {
    const first = list<Source>(p.sources)[0];
    const text = str(p.caption) || str(p.title);
    return `${str(p.poster) ? `![${str(p.title)}](${str(p.poster)})\n\n` : ""}**${str(p.title)}**${text !== str(p.title) ? `: ${text}` : ""}${first ? ` ([${labels.videoFile}](${first.src}))` : ""}`;
  },
};

const videoEmbed: PostWidget = {
  html: (p, { labels }) => {
    const embed = parseVideoEmbed(str(p.url));
    if (!embed) return "";
    const title = str(p.title);
    const caption = str(p.caption);
    const platform = embed.provider === "youtube" ? SOCIAL_PLATFORM_NAMES.youtube : "Vimeo";
    const poster = str(p.poster) || embed.thumbnail;
    const start = typeof p.start === "number" ? p.start : undefined;
    const watch = `<a href="${esc(embed.watchUrl)}" rel="noopener">${esc(fill(labels.watchOn, { platform }))}</a>`;
    return (
      `<figure class="pw-embed pw-embed--${embed.provider}"${attrs({ "data-pw-embed": embed.provider, "data-src": embedPlayerUrl(embed, start), "data-title": title, "data-play": `${labels.play}: ${title}` })}>` +
      `<div class="pw-embed__frame"><a class="pw-embed__poster" href="${esc(embed.watchUrl)}" rel="noopener" data-pw-embed-trigger>` +
      (poster ? `<img${attrs({ src: poster, alt: "", loading: "lazy", decoding: "async", width: 480, height: 360, referrerpolicy: "no-referrer" })} />` : "") +
      `<span class="pw-embed__play">${icon("play", 28)}</span><span class="pw-embed__title">${esc(title)}</span></a></div>` +
      `<figcaption>${caption ? `<span>${esc(caption)}</span>` : ""}${watch}</figcaption></figure>`
    );
  },
  markdown: (p, { labels }) => {
    const embed = parseVideoEmbed(str(p.url));
    if (!embed) return "";
    const platform = embed.provider === "youtube" ? SOCIAL_PLATFORM_NAMES.youtube : "Vimeo";
    return `**${str(p.title)}**${p.caption ? `: ${str(p.caption)}` : ""} ([${fill(labels.watchOn, { platform })}](${embed.watchUrl}))`;
  },
};

export const MEDIA_WIDGETS: Record<string, PostWidget> = { Gallery: gallery, Video: video, VideoEmbed: videoEmbed };
