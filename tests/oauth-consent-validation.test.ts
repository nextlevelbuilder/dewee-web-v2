import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { transpile } from "typescript";
import { expect, it, vi } from "vitest";

it("clears the no-scope error when a different scope is selected", () => {
  const source = readFileSync("src/pages/oauth/authorize.astro", "utf8");
  const script = source.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  if (!script) throw new Error("OAuth consent validation script not found");

  const handlers = new Map<string, (event: any) => void>();
  const first = { setCustomValidity: vi.fn(), reportValidity: vi.fn() };
  let selected = false;
  const form = {
    dataset: { noScope: "Choose a scope" },
    querySelector: (selector: string) => selector.endsWith(":checked") ? (selected ? {} : null) : first,
    addEventListener: (type: string, handler: (event: any) => void) => handlers.set(type, handler),
  };
  runInNewContext(transpile(script), { document: { querySelectorAll: () => [form] } });
  const preventDefault = vi.fn();
  handlers.get("submit")!({ submitter: { value: "approve" }, preventDefault });
  expect(preventDefault).toHaveBeenCalledOnce();
  expect(first.setCustomValidity).toHaveBeenLastCalledWith("Choose a scope");

  selected = true; // A checkbox other than the first was selected.
  handlers.get("change")!({});
  expect(first.setCustomValidity).toHaveBeenLastCalledWith("");
});
