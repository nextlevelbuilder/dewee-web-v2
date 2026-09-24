/**
 * WebMCP registration (https://github.com/webmachinelearning/webmcp). When the browser exposes a
 * model context (`document.modelContext`, or `navigator.modelContext` in earlier drafts), the page
 * registers tools an in-browser agent can call. Without it, nothing happens.
 */

export type ToolResult = { content: { type: "text"; text: string }[]; isError?: boolean };

export type WebMcpTool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: { readOnlyHint?: boolean };
  execute: (args: Record<string, unknown>) => Promise<ToolResult>;
};

type ModelContext = {
  registerTool?: (tool: WebMcpTool, options?: { signal?: AbortSignal }) => unknown;
  provideContext?: (context: { tools: WebMcpTool[] }) => unknown;
};

export function modelContext(): ModelContext | null {
  const fromDocument = (document as Document & { modelContext?: ModelContext }).modelContext;
  const fromNavigator = (navigator as Navigator & { modelContext?: ModelContext }).modelContext;
  return fromDocument ?? fromNavigator ?? null;
}

export const text = (value: unknown): ToolResult => ({
  content: [{ type: "text", text: typeof value === "string" ? value : JSON.stringify(value, null, 2) }],
});
export const failure = (message: string): ToolResult => ({ content: [{ type: "text", text: message }], isError: true });

/** Wraps execute so a thrown error becomes an isError result instead of a rejected promise. */
function guarded(tool: WebMcpTool): WebMcpTool {
  return {
    ...tool,
    execute: async (args) => {
      try {
        return await tool.execute(args ?? {});
      } catch (err) {
        return failure(err instanceof Error ? err.message : String(err));
      }
    },
  };
}

/** Registers tools with whichever API the browser implements. Returns false when unsupported. */
export function registerTools(tools: WebMcpTool[]): boolean {
  const ctx = modelContext();
  if (!ctx) return false;
  const safe = tools.map(guarded);
  try {
    if (typeof ctx.registerTool === "function") {
      for (const tool of safe) ctx.registerTool(tool);
      return true;
    }
    if (typeof ctx.provideContext === "function") {
      ctx.provideContext({ tools: safe });
      return true;
    }
  } catch (err) {
    console.warn("WebMCP registration failed", err);
  }
  return false;
}

/** Narrowing helpers for tool arguments (the browser does not validate them for us). */
export function str(args: Record<string, unknown>, key: string, max = 2000): string | undefined {
  const v = args[key];
  return typeof v === "string" && v.length <= max ? v : undefined;
}
