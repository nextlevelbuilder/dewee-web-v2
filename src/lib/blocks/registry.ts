/**
 * The page-builder block registry (isomorphic). A block `type` maps to a zod props schema, a
 * description and a valid example. The REST API, MCP tools, admin editor and BlockRenderer all
 * read this one catalogue, so a block is either supported everywhere or nowhere.
 */
import { z } from "zod";
import { sectionOptions } from "./block-fields";
import type { BlockContext, BlockDef, BlockIssue, StoredBlock } from "./block-types";
import { INTERACTIVE_BLOCKS } from "./interactive-block-schemas";
import { MARKETING_BLOCKS } from "./marketing-block-schemas";
import { POST_BLOCKS } from "./post-block-schemas";
import { PRIMITIVE_BLOCKS } from "./primitive-block-schemas";
import { VISUAL_BLOCKS } from "./visual-block-schemas";

export type { BlockContext, BlockDef, BlockIssue, StoredBlock } from "./block-types";

export const BLOCKS: readonly BlockDef[] = [...MARKETING_BLOCKS, ...PRIMITIVE_BLOCKS, ...POST_BLOCKS, ...VISUAL_BLOCKS, ...INTERACTIVE_BLOCKS];
export const BLOCK_TYPES: readonly string[] = BLOCKS.map((b) => b.type);
export const MAX_BLOCKS = 60;
export const MAX_BLOCKS_BYTES = 200_000;
/** A post block's `id`, referenced from the body as `::widget{id="…"}`. */
export const WIDGET_ID_RE = /^[a-z0-9][a-z0-9-]{0,47}$/;

const BY_TYPE = new Map(BLOCKS.map((b) => [b.type, b]));

export function getBlock(type: string): BlockDef | undefined {
  return BY_TYPE.get(type);
}

/** Where a block may be used; blocks without `contexts` are page-only. */
export function blockContexts(def: BlockDef): readonly BlockContext[] {
  return def.contexts ?? ["page"];
}

const typesFor = (context: BlockContext) => BLOCKS.filter((b) => blockContexts(b).includes(context)).map((b) => b.type);

export function listBlocks(context?: BlockContext): { type: string; category: string; contexts: readonly BlockContext[]; description: string; example: Record<string, unknown> }[] {
  return BLOCKS.filter((b) => !context || blockContexts(b).includes(context)).map((b) => ({
    type: b.type,
    category: b.category,
    contexts: blockContexts(b),
    description: b.description,
    example: b.example,
  }));
}

const PAGE_ENVELOPE = (type: string) =>
  '{ "type": "' + type + '", "props": { … }, "section"?: { "background"?: "plain" | "band" | "board", "spacing"?: "normal" | "tight" | "flush", "id"?: string } }';
const POST_ENVELOPE = (type: string) =>
  '{ "id"?: "lowercase-id", "type": "' + type + '", "props": { … } } in a post\'s `blocks`; place it in `body_md` with a line ::widget{id="lowercase-id"} (unplaced blocks render after the body)';

/** JSON Schema (draft 2020-12) for one block's props, its envelope per context, and an example. */
export function blockJsonSchema(type: string): Record<string, unknown> | null {
  const def = BY_TYPE.get(type);
  if (!def) return null;
  const contexts = blockContexts(def);
  return {
    type: def.type,
    category: def.category,
    contexts,
    description: def.description,
    envelope: contexts.includes("page") ? PAGE_ENVELOPE(def.type) : POST_ENVELOPE(def.type),
    ...(contexts.includes("page") && contexts.includes("post") ? { postEnvelope: POST_ENVELOPE(def.type) } : {}),
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
 * Validates a whole blocks array: known types for the context, props per schema, and the
 * envelope. Pages take `section` options and page rules (PageHero only once and first, at most
 * one blackboard section); posts take an optional unique `id` instead. Size limits apply to both.
 */
export function validateBlocks(input: unknown, opts: { context?: BlockContext } = {}): { ok: true; blocks: StoredBlock[] } | { ok: false; issues: BlockIssue[] } {
  const context = opts.context ?? "page";
  const noun = context === "post" ? "post" : "page";
  if (!Array.isArray(input)) return { ok: false, issues: [{ path: "blocks", message: "Expected an array of blocks." }] };
  if (input.length > MAX_BLOCKS) return { ok: false, issues: [{ path: "blocks", message: `At most ${MAX_BLOCKS} blocks per ${noun}.` }] };
  if (JSON.stringify(input).length > MAX_BLOCKS_BYTES) return { ok: false, issues: [{ path: "blocks", message: "Blocks are larger than 200 KB." }] };

  const envelopeKeys = context === "post" ? ["id", "type", "props"] : ["type", "props", "section"];
  const issues: BlockIssue[] = [];
  const blocks: StoredBlock[] = [];
  const seenIds = new Map<string, number>();
  input.forEach((raw, i) => {
    const at = `blocks.${i}`;
    if (!isRecord(raw)) return void issues.push({ path: at, message: context === "post" ? "Expected { id?, type, props }." : "Expected { type, props, section? }." });
    const extra = Object.keys(raw).filter((k) => !envelopeKeys.includes(k));
    if (extra.length) issues.push({ path: at, message: `Unknown key(s): ${extra.join(", ")}.${context === "post" && extra.includes("section") ? " Post blocks sit in the reading column and take no section options." : ""}` });
    let id: string | undefined;
    if (context === "post" && raw.id !== undefined) {
      if (typeof raw.id !== "string" || !WIDGET_ID_RE.test(raw.id)) {
        issues.push({ path: `${at}.id`, message: "Use 1–48 lowercase letters, digits and dashes, starting with a letter or digit." });
      } else if (seenIds.has(raw.id)) {
        issues.push({ path: `${at}.id`, message: `Duplicate id "${raw.id}" (also blocks.${seenIds.get(raw.id)}).` });
      } else {
        seenIds.set(raw.id, i);
        id = raw.id;
      }
    }
    const def = typeof raw.type === "string" ? BY_TYPE.get(raw.type) : undefined;
    if (!def || !blockContexts(def).includes(context)) {
      const known = typesFor(context).join(", ");
      const where = def ? `"${def.type}" cannot be used in a ${noun}.` : `Unknown block type "${String(raw.type)}".`;
      return void issues.push({ path: `${at}.type`, message: `${where} Known ${noun} blocks: ${known}.` });
    }
    if (context === "post" && def.requiresId && raw.id === undefined) {
      issues.push({ path: `${at}.id`, message: `${def.type} needs an id: reader answers are stored per widget id, and ::widget{id="…"} places it.` });
    }
    const props = def.schema.safeParse(raw.props ?? {});
    if (!props.success) issues.push(...issuesFrom(props.error, `${at}.props`));
    const section = context === "page" ? sectionOptions.optional().safeParse(raw.section) : ({ success: true, data: undefined } as const);
    if (!section.success) issues.push(...issuesFrom(section.error, `${at}.section`));
    if (props.success && section.success) {
      blocks.push({ ...(id ? { id } : {}), type: def.type, props: props.data as Record<string, unknown>, ...(section.data ? { section: section.data } : {}) });
    }
  });

  if (context === "page") pageRules(input, issues);
  return issues.length ? { ok: false, issues } : { ok: true, blocks };
}

function pageRules(input: unknown[], issues: BlockIssue[]): void {
  input.forEach((raw, i) => {
    if (isRecord(raw) && raw.type === "PageHero" && i !== 0) issues.push({ path: `blocks.${i}.type`, message: "PageHero holds the page's h1: use it once, as the first block." });
  });
  const boards = input.filter((raw) => isRecord(raw) && isRecord(raw.section) && raw.section.background === "board").length;
  if (boards > 1) issues.push({ path: "blocks", message: "Use at most one blackboard (board) section per page." });
}
