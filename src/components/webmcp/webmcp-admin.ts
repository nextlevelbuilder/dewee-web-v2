/**
 * Admin WebMCP tools, registered only inside /admin for a signed-in super admin. They call the
 * REST API with the session cookie and CSRF header, so an in-browser agent works with exactly the
 * permissions (and audit trail) of the person at the keyboard. On an editor page, two more tools
 * read and fill the unsaved form so the human reviews before saving.
 */
import { api } from "../admin/admin-ui-client";
import { failure, modelContext, registerTools, str, text, type ToolResult, type WebMcpTool } from "./webmcp-core";

type Kind = "page" | "post";
const plural = (kind: Kind) => (kind === "page" ? "pages" : "posts");
const obj = (properties: Record<string, unknown>, required: string[] = []) => ({ type: "object", properties, required, additionalProperties: false });
const idProp = { id: { type: "string", description: "UUID, or the slug together with lookup_locale." }, lookup_locale: { type: "string", enum: ["en", "vi"] } };
const fieldsProp = {
  fields: {
    type: "object",
    description: "Page fields as in the REST API: title, slug, locale, description, layout, blocks, body_md, seo, cover, tags, author, translation_key, note. GET /api/v1/openapi.json has the full schema.",
  },
};

async function call(method: string, path: string, body?: unknown, headers?: Record<string, string>): Promise<ToolResult> {
  const res = await api<unknown>(method, path, body, headers);
  if (!res.ok) return failure(`${res.code}: ${res.message}${res.details ? `\n${JSON.stringify(res.details)}` : ""}`);
  return text(res.data);
}

function ref(args: Record<string, unknown>): string | null {
  const id = str(args, "id", 200);
  if (!id) return null;
  const locale = str(args, "lookup_locale");
  return `${encodeURIComponent(id)}${locale === "en" || locale === "vi" ? `?locale=${locale}` : ""}`;
}

function contentTools(kind: Kind): WebMcpTool[] {
  const p = plural(kind);
  return [
    {
      name: `list_${p}`,
      description: `Lists ${p} (drafts included) with optional search and filters.`,
      inputSchema: obj({ q: { type: "string" }, status: { type: "string", enum: ["draft", "published", "archived"] }, locale: { type: "string", enum: ["en", "vi"] }, limit: { type: "integer", minimum: 1, maximum: 100 } }),
      annotations: { readOnlyHint: true },
      execute: async (args) => {
        const q = new URLSearchParams();
        for (const k of ["q", "status", "locale"]) {
          const v = str(args, k, 100);
          if (v) q.set(k, v);
        }
        if (typeof args.limit === "number") q.set("limit", String(args.limit));
        return call("GET", `/${p}${q.size ? `?${q}` : ""}`);
      },
    },
    {
      name: `get_${kind}`,
      description: `Gets one ${kind} with its blocks, body and version.`,
      inputSchema: obj(idProp, ["id"]),
      annotations: { readOnlyHint: true },
      execute: async (args) => {
        const r = ref(args);
        return r ? call("GET", `/${p}/${r}`) : failure("id is required.");
      },
    },
    {
      name: `create_${kind}`,
      description: `Creates a ${kind} as a draft (or published when fields.status is "published").`,
      inputSchema: obj(fieldsProp, ["fields"]),
      execute: async (args) => (typeof args.fields === "object" && args.fields ? call("POST", `/${p}`, args.fields) : failure("fields is required.")),
    },
    {
      name: `update_${kind}`,
      description: `Updates a ${kind}. Pass the version you read in fields.version to avoid overwriting someone else's change.`,
      inputSchema: obj({ ...idProp, ...fieldsProp }, ["id", "fields"]),
      execute: async (args) => {
        const r = ref(args);
        if (!r || typeof args.fields !== "object" || !args.fields) return failure("id and fields are required.");
        return call("PATCH", `/${p}/${r}`, args.fields);
      },
    },
    {
      name: `set_${kind}_status`,
      description: `Publishes, unpublishes or archives a ${kind}.`,
      inputSchema: obj({ ...idProp, action: { type: "string", enum: ["publish", "unpublish", "archive"] }, version: { type: "integer" } }, ["id", "action"]),
      execute: async (args) => {
        const r = ref(args);
        const action = str(args, "action");
        if (!r || !action || !["publish", "unpublish", "archive"].includes(action)) return failure("id and a valid action are required.");
        const [path, query] = r.split("?");
        return call("POST", `/${p}/${path}/${action}${query ? `?${query}` : ""}`, typeof args.version === "number" ? { version: args.version } : {});
      },
    },
  ];
}

const common: WebMcpTool[] = [
  {
    name: "list_blocks",
    description: "Lists the page-builder block types with a description and a valid example each.",
    inputSchema: obj({}),
    annotations: { readOnlyHint: true },
    execute: async () => call("GET", "/blocks"),
  },
  {
    name: "get_block_schema",
    description: "Returns the JSON Schema of one block type's props.",
    inputSchema: obj({ type: { type: "string" } }, ["type"]),
    annotations: { readOnlyHint: true },
    execute: async (args) => {
      const type = str(args, "type", 60);
      return type ? call("GET", `/blocks/${encodeURIComponent(type)}`) : failure("type is required.");
    },
  },
  {
    name: "validate_blocks",
    description: "Validates a blocks array without saving it.",
    inputSchema: obj({ blocks: { type: "array" } }, ["blocks"]),
    annotations: { readOnlyHint: true },
    execute: async (args) => (Array.isArray(args.blocks) ? call("POST", "/blocks/validate", { blocks: args.blocks }) : failure("blocks must be an array.")),
  },
];

/** Tools for the open editor form: read the unsaved state, or fill fields for the human to review. */
function editorTools(form: HTMLFormElement): WebMcpTool[] {
  const setField = (name: string, value: string) => {
    const el = form.elements.namedItem(name);
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
      el.value = value;
      el.dispatchEvent(new Event("input", { bubbles: true }));
      return true;
    }
    return false;
  };
  return [
    {
      name: "get_editor_draft",
      description: "Reads the unsaved values in the open page/post editor.",
      inputSchema: obj({}),
      annotations: { readOnlyHint: true },
      execute: async () => {
        const out: Record<string, string> = {};
        new FormData(form).forEach((v, k) => {
          if (typeof v === "string") out[k] = v;
        });
        return text(out);
      },
    },
    {
      name: "fill_editor_draft",
      description: "Fills fields of the open editor without saving (title, slug, description, tags, body_md, or blocks as an array). The human reviews and presses Save.",
      inputSchema: obj({ title: { type: "string" }, slug: { type: "string" }, description: { type: "string" }, tags: { type: "array", items: { type: "string" } }, body_md: { type: "string" }, blocks: { type: "array" } }),
      execute: async (args) => {
        const changed: string[] = [];
        for (const key of ["title", "slug", "description", "body_md"]) {
          const v = str(args, key, 100_000);
          if (v !== undefined && setField(key, v)) changed.push(key);
        }
        if (Array.isArray(args.tags) && setField("tags", args.tags.filter((t) => typeof t === "string").join(", "))) changed.push("tags");
        if (Array.isArray(args.blocks) && setField("blocks", JSON.stringify(args.blocks, null, 2))) changed.push("blocks");
        return changed.length ? text(`Filled ${changed.join(", ")}. Review the preview, then save.`) : failure("No matching fields on this editor.");
      },
    },
  ];
}

if (modelContext()) {
  const form = document.getElementById("ed-form");
  registerTools([...common, ...contentTools("page"), ...contentTools("post"), ...(form instanceof HTMLFormElement ? editorTools(form) : [])]);
}
