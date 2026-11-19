/** Shared shapes for the block registry (isomorphic, type-only plus tiny constants). */
import type { z } from "zod";
import type { SectionOptions } from "./block-fields";

/**
 * How BlockRenderer places a block:
 *  - hero: renders its own intro section (PageHero)
 *  - self: renders its own section (CtaBand)
 *  - section: wrapped in `.section` (+ band/board) with a container and optional heading
 *  - inline: a container without section padding (Divider, Spacer)
 */
export type BlockRenderMode = "hero" | "self" | "section" | "inline";

/**
 * Where a block may be used. Pages render blocks as full-width sections (BlockRenderer); posts
 * place them in the reading column (src/lib/blocks/post-widgets). Omitted means pages only.
 */
export type BlockContext = "page" | "post";

/** Blocks that also sit inline in blog posts, at reading width. */
export const PAGE_AND_POST: readonly BlockContext[] = ["page", "post"];

export type BlockDef = {
  type: string;
  category: "section" | "primitive" | "media";
  contexts?: readonly BlockContext[];
  render: BlockRenderMode;
  description: string;
  schema: z.ZodType;
  example: Record<string, unknown>;
  /** Post widgets that store reader responses by widget id (Poll, Quiz, Survey) must carry an `id`. */
  requiresId?: boolean;
};

/**
 * A validated block as stored in `pages.blocks`. Post blocks may carry an `id` so the Markdown
 * body can place them with `::widget{id="…"}`; pages use `section` instead.
 */
export type StoredBlock = { type: string; props: Record<string, unknown>; section?: SectionOptions; id?: string };

export type BlockIssue = { path: string; message: string };
