/**
 * Props schemas for the media widgets that blog posts place inline (`::widget{id="…"}`):
 * Gallery, Video, VideoEmbed, SocialCard and CodeBlock. They render in the reading column
 * (src/lib/blocks/post-widgets) and never take markup: every URL is checked here and again
 * when the post renders, and embeds keep only a parsed id (media-urls.ts).
 */
import { z } from "zod";
import { imageSrc, optText, text } from "./block-fields";
import type { BlockDef } from "./block-types";
import { CAPTION_EXTS, isSafeMediaFile, parseVideoEmbed, socialPlatform, VIDEO_EXTS } from "./media-urls";

const POST_ONLY = ["post"] as const;

const alt = z.string().trim().min(1, "Describe the image for people who cannot see it.").max(300);
const pixels = z.number().int().min(1).max(8000);

const galleryImage = z
  .object({ src: imageSrc, alt, caption: optText(300), pixelWidth: pixels.optional(), pixelHeight: pixels.optional() })
  .strict();

const gallery = z
  .object({
    images: z.array(galleryImage).min(2).max(20),
    layout: z.enum(["carousel", "grid"]).optional(),
    label: optText(80),
    caption: optText(300),
  })
  .strict();

const videoFile = z
  .string()
  .trim()
  .min(1)
  .max(500)
  .refine((s) => isSafeMediaFile(s, VIDEO_EXTS), "Video files must be https:// or /media/ URLs ending in .mp4 or .webm.");
const captionFile = z
  .string()
  .trim()
  .min(1)
  .max(500)
  .refine((s) => isSafeMediaFile(s, CAPTION_EXTS), "Caption tracks must be https:// or /media/ URLs ending in .vtt.");

const video = z
  .object({
    sources: z.array(z.object({ src: videoFile, type: z.enum(["video/mp4", "video/webm"]) }).strict()).min(1).max(3),
    title: text(160),
    poster: imageSrc.optional(),
    caption: optText(300),
    tracks: z
      .array(
        z
          .object({
            src: captionFile,
            srclang: z.string().regex(/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})?$/, "Use a language tag such as en or vi."),
            label: text(40),
            kind: z.enum(["captions", "subtitles"]).optional(),
            default: z.boolean().optional(),
          })
          .strict(),
      )
      .max(6)
      .optional(),
    autoplay: z.boolean().optional(),
    muted: z.boolean().optional(),
    loop: z.boolean().optional(),
    pixelWidth: pixels.optional(),
    pixelHeight: pixels.optional(),
  })
  .strict()
  .refine((v) => !v.autoplay || (v.muted === true && v.loop === true), { message: "autoplay needs muted: true and loop: true (no sound starts on its own).", path: ["autoplay"] })
  .refine((v) => (v.tracks ?? []).filter((t) => t.default).length <= 1, { message: "Mark at most one track as default.", path: ["tracks"] });

const videoEmbed = z
  .object({
    url: z.string().trim().min(1).max(500).refine((s) => parseVideoEmbed(s) !== null, "Use a YouTube (youtube.com/watch?v=…, youtu.be/…) or Vimeo (vimeo.com/…) video URL."),
    title: text(160),
    caption: optText(300),
    start: z.number().int().min(0).max(86_400).optional(),
    poster: imageSrc.optional(),
  })
  .strict();

const socialCard = z
  .object({
    url: z.string().trim().min(1).max(500).refine((s) => socialPlatform(s) !== null, "Use the https:// link of the public post."),
    author: optText(80),
    handle: optText(80),
    title: optText(200),
    text: optText(1200),
    date: optText(40),
    image: z.object({ src: imageSrc, alt }).strict().optional(),
  })
  .strict()
  .refine((s) => Boolean(s.text || s.title), { message: "Give the card a `text` (the quoted post) or a `title`.", path: ["text"] });

const codeBlock = z
  .object({
    // Not trimmed: leading indentation is part of the code.
    code: z.string().min(1).max(20_000).refine((s) => s.trim().length > 0, "Code cannot be empty."),
    language: z.string().regex(/^[a-z0-9+#.-]{1,24}$/, "Use a short language name such as ts, bash or json.").optional(),
    filename: optText(120),
    caption: optText(300),
  })
  .strict();

export const POST_BLOCKS: BlockDef[] = [
  {
    type: "Gallery",
    category: "media",
    contexts: POST_ONLY,
    render: "section",
    description: "Two to twenty images as a swipeable carousel (keyboard, buttons, scroll-snap; a plain scrolling list without JavaScript) or a grid. Every image needs alt text; `src` is https:// or /media/.",
    schema: gallery,
    example: {
      label: "The control plane",
      images: [
        { src: "https://cdn.dewee.sh/media/2026/09/agents.webp", alt: "The agents list with two agents online", caption: "Agents" },
        { src: "https://cdn.dewee.sh/media/2026/09/traces.webp", alt: "A run trace showing each tool call", caption: "Traces" },
      ],
    },
  },
  {
    type: "Video",
    category: "media",
    contexts: POST_ONLY,
    render: "section",
    description: "A native MP4/WebM player with controls, an optional poster and VTT caption tracks. Never autoplays with sound: `autoplay` needs `muted` and `loop`, and is skipped for readers who prefer reduced motion.",
    schema: video,
    example: {
      title: "Approving a quote from Telegram",
      sources: [{ src: "https://cdn.dewee.sh/media/2026/09/approve.mp4", type: "video/mp4" }],
      poster: "https://cdn.dewee.sh/media/2026/09/approve-poster.webp",
      tracks: [{ src: "/media/2026/09/approve.en.vtt", srclang: "en", label: "English", default: true }],
      caption: "The agent drafts the quote; a person approves it.",
    },
  },
  {
    type: "VideoEmbed",
    category: "media",
    contexts: POST_ONLY,
    render: "section",
    description: "A YouTube or Vimeo video behind a click-to-load poster (youtube-nocookie.com, Vimeo with dnt=1). Pass the video page `url`; only the parsed id reaches the player. Without JavaScript it is a link to the video.",
    schema: videoEmbed,
    // The YouTube IFrame API sample video from Google's own docs: a stable public id for the example.
    example: { url: "https://www.youtube.com/watch?v=M7lc1UVf-VE", title: "YouTube IFrame API sample", caption: "Plays from youtube-nocookie.com after a click." },
  },
  {
    type: "SocialCard",
    category: "media",
    contexts: POST_ONLY,
    render: "section",
    description: "A static card for a public post on X, Reddit, LinkedIn, Facebook, Threads, Bluesky, Mastodon, Hacker News and similar: the platform, author, quoted text and an optional image you supply, linking out with rel=\"noopener nofollow ugc\". No third-party script or iframe is loaded.",
    schema: socialCard,
    example: { url: "https://bsky.app/profile/example.com/post/3kabc", author: "Example author", handle: "@example.com", text: "Paste the words of the post you quote, exactly as published.", date: "Oct 2026" },
  },
  {
    type: "CodeBlock",
    category: "media",
    contexts: POST_ONLY,
    render: "section",
    description: "Code with server-side syntax highlighting (light and dark), an optional filename and a copy button. Fenced code in the Markdown body gets the same treatment.",
    schema: codeBlock,
    example: { language: "bash", filename: "install.sh", code: "curl -fsSL https://dewee.sh/install.sh | sh" },
  },
];
