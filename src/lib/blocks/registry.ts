/**
 * The page-builder block registry (isomorphic). A block `type` maps to a zod props schema, a
 * description and a valid example. The REST API, MCP tools, admin editor and BlockRenderer all
 * read this one catalogue, so a block is either supported everywhere or nowhere.
 */
import { z } from "zod";
import { sectionOptions } from "./block-fields";
import type { BlockDef, BlockIssue, StoredBlock } from "./block-types";
import { MARKETING_BLOCKS } from "./marketing-block-schemas";
import { PRIMITIVE_BLOCKS } from "./primitive-block-schemas";

export type { BlockDef, BlockIssue, StoredBlock } from "./block-types";

export const BLOCKS: readonly BlockDef[] = [...MARKETING_BLOCKS, ...PRIMITIVE_BLOCKS];
export const BLOCK_TYPES: readonly string[] = BLOCKS.map((b) => b.type);
export const MAX_BLOCKS = 60;
export const MAX_BLOCKS_BYTES = 200_000;

const BY_TYPE = new Map(BLOCKS.map((b) => [b.type, b]));

export function getBlock(type: string): BlockDef | undefined {
  return BY_TYPE.get(type);
}

export function listBlocks(): { type: string; category: string; description: string; example: Record<string, unknown> }[] {
  return BLOCKS.map(({ type, category, description, example }) => ({ type, category, description, example }));
}

/** JSON Schema (draft 2020-12) for one block's props and the shared section options. */
export function blockJsonSchema(type: string): Record<string, unknown> | null {
  const def = BY_TYPE.get(type);
  if (!def) return null;
  return {
    type: def.type,
    category: def.category,
    description: def.description,
    envelope: '{ "type": "' + def.type + '", "props": { … }, "section"?: { "background"?: "plain" | "band" | "board", "spacing"?: "normal" | "tight" | "flush", "id"?: string } }',
    props: z.toJSONSchema(def.schema, { unrepresentable: "any" }),
    section: z.toJSONSchema(sectionOptions, { unrepresentable: "any" }),
    example: { type: def.type, props: def.example },
  };
}

function issuesFrom(error: z.ZodError, prefix: string): BlockIssue[] {
  return error.issues.map((i) => ({ path: [prefix, ...i.path.map(String)].filter(Boolean).join("."), message: i.message }));
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * Validates a whole blocks array: known types, props per schema, section options, and page rules
 * (PageHero only once and first, at most one blackboard section, size limits).
 */
export function validateBlocks(input: unknown): { ok: true; blocks: StoredBlock[] } | { ok: false; issues: BlockIssue[] } {
  if (!Array.isArray(input)) return { ok: false, issues: [{ path: "blocks", message: "Expected an array of blocks." }] };
  if (input.length > MAX_BLOCKS) return { ok: false, issues: [{ path: "blocks", message: `At most ${MAX_BLOCKS} blocks per page.` }] };
  if (JSON.stringify(input).length > MAX_BLOCKS_BYTES) return { ok: false, issues: [{ path: "blocks", message: "Blocks are larger than 200 KB." }] };

  const issues: BlockIssue[] = [];
  const blocks: StoredBlock[] = [];
  input.forEach((raw, i) => {
    const at = `blocks.${i}`;
    if (!isRecord(raw)) return void issues.push({ path: at, message: "Expected { type, props, section? }." });
    const extra = Object.keys(raw).filter((k) => !["type", "props", "section"].includes(k));
    if (extra.length) issues.push({ path: at, message: `Unknown key(s): ${extra.join(", ")}.` });
    const def = typeof raw.type === "string" ? BY_TYPE.get(raw.type) : undefined;
    if (!def) return void issues.push({ path: `${at}.type`, message: `Unknown block type "${String(raw.type)}". Known: ${BLOCK_TYPES.join(", ")}.` });
    const props = def.schema.safeParse(raw.props ?? {});
    if (!props.success) issues.push(...issuesFrom(props.error, `${at}.props`));
    const section = sectionOptions.optional().safeParse(raw.section);
    if (!section.success) issues.push(...issuesFrom(section.error, `${at}.section`));
    if (props.success && section.success) {
      blocks.push({ type: def.type, props: props.data as Record<string, unknown>, ...(section.data ? { section: section.data } : {}) });
    }
  });

  input.forEach((raw, i) => {
    if (isRecord(raw) && raw.type === "PageHero" && i !== 0) issues.push({ path: `blocks.${i}.type`, message: "PageHero holds the page's h1: use it once, as the first block." });
  });
  const boards = input.filter((raw) => isRecord(raw) && isRecord(raw.section) && raw.section.background === "board").length;
  if (boards > 1) issues.push({ path: "blocks", message: "Use at most one blackboard (board) section per page." });

  return issues.length ? { ok: false, issues } : { ok: true, blocks };
}
