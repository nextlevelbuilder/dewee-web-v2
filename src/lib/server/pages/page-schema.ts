/**
 * Input and output shapes for pages and posts (pure zod). Blocks are validated separately by the
 * block registry so their error paths read `blocks.2.props.title`.
 */
import { z } from "zod";
import { imageSrc } from "../../blocks/block-fields";
import type { StoredBlock } from "../../blocks/block-types";
import { publicPath, type SlugKind } from "./slug-rules";

export const localeSchema = z.enum(["en", "vi"]);
export const layoutSchema = z.enum(["default", "landing", "article"]);
export const statusSchema = z.enum(["draft", "published", "archived"]);
export const kindSchema = z.enum(["page", "post"]);

export const seoSchema = z
  .object({
    title: z.string().trim().max(70).optional(),
    description: z.string().trim().max(200).optional(),
    ogImage: imageSrc.optional(),
    noindex: z.boolean().optional(),
  })
  .strict();

const tag = z.string().trim().min(1).max(32).regex(/^[\p{L}\p{N} .+#-]+$/u, "Tags use letters, digits, spaces and . + # -");
const translationKey = z.string().regex(/^[a-z0-9][a-z0-9-]{0,79}$/, "Use lowercase letters, digits and dashes.");

const editable = {
  slug: z.string().trim().max(120),
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(300),
  layout: layoutSchema,
  blocks: z.array(z.unknown()).max(60),
  body_md: z.string().max(100_000).nullable(),
  seo: seoSchema,
  cover: imageSrc.nullable(),
  tags: z.array(tag).max(10),
  author: z.string().trim().max(80).nullable(),
  translation_key: translationKey.nullable(),
};

export const createPageInput = z
  .object({
    locale: localeSchema.default("en"),
    ...editable,
    slug: editable.slug.optional(),
    description: editable.description.default(""),
    layout: editable.layout.optional(),
    blocks: editable.blocks.optional(),
    body_md: editable.body_md.optional(),
    seo: editable.seo.optional(),
    cover: editable.cover.optional(),
    tags: editable.tags.optional(),
    author: editable.author.optional(),
    translation_key: editable.translation_key.optional(),
    status: z.enum(["draft", "published"]).optional(),
  })
  .strict();

export const updatePageInput = z
  .object({
    locale: localeSchema.optional(),
    slug: editable.slug.optional(),
    title: editable.title.optional(),
    description: editable.description.optional(),
    layout: editable.layout.optional(),
    blocks: editable.blocks.optional(),
    body_md: editable.body_md.optional(),
    seo: editable.seo.optional(),
    cover: editable.cover.optional(),
    tags: editable.tags.optional(),
    author: editable.author.optional(),
    translation_key: editable.translation_key.optional(),
    /** Optimistic concurrency: the version you edited. Also accepted as the If-Match header. */
    version: z.number().int().positive().optional(),
    /** Optional note stored with the revision. */
    note: z.string().trim().max(200).optional(),
  })
  .strict();

export type CreatePageInput = z.infer<typeof createPageInput>;
export type UpdatePageInput = z.infer<typeof updatePageInput>;

export type PageKind = SlugKind;
export type PageStatus = z.infer<typeof statusSchema>;

export type PageRow = {
  id: string;
  kind: PageKind;
  locale: "en" | "vi";
  slug: string;
  title: string;
  description: string;
  layout: string;
  blocks: string;
  body_md: string | null;
  seo: string;
  cover: string | null;
  tags: string;
  author: string | null;
  status: PageStatus;
  translation_key: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  version: number;
};

export type PageRecord = Omit<PageRow, "blocks" | "seo" | "tags" | "layout"> & {
  layout: "default" | "landing" | "article";
  blocks: StoredBlock[];
  seo: z.infer<typeof seoSchema>;
  tags: string[];
  /** Public path once published (drafts are only visible in the admin preview). */
  url: string;
};

function parseJson<T>(text: string | null, fallback: T): T {
  if (!text) return fallback;
  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

export function toRecord(row: PageRow): PageRecord {
  const layout = layoutSchema.safeParse(row.layout);
  return {
    ...row,
    layout: layout.success ? layout.data : "default",
    blocks: parseJson<StoredBlock[]>(row.blocks, []),
    seo: parseJson(row.seo, {}),
    tags: parseJson<string[]>(row.tags, []),
    url: publicPath(row.kind, row.locale, row.slug),
  };
}

/** The fields a revision snapshot restores (status and identity stay as they are). */
export const SNAPSHOT_FIELDS = ["slug", "title", "description", "layout", "blocks", "body_md", "seo", "cover", "tags", "author", "translation_key", "locale"] as const;
