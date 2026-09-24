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

export type BlockDef = {
  type: string;
  category: "section" | "primitive";
  render: BlockRenderMode;
  description: string;
  schema: z.ZodType;
  example: Record<string, unknown>;
};

/** A validated block as stored in `pages.blocks`. */
export type StoredBlock = { type: string; props: Record<string, unknown>; section?: SectionOptions };

export type BlockIssue = { path: string; message: string };
