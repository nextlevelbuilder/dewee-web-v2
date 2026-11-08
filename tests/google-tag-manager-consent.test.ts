import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, expect, it, vi } from "vitest";

const source = readFileSync("src/components/layout/GoogleTagManager.astro", "utf8");
const script = source.match(/<script is:inline define:vars=\{\{ id, appHost, variantKey \}\}>([\s\S]*?)<\/script>/)?.[1];
if (!script) throw new Error("Google Tag Manager script not found");

function setup(choice: string | null) {
  const listeners = new Map<string, (event: any) => void>();
  const insert = vi.fn();
  const reload = vi.fn();
  const context: any = {
    id: "GTM-TEST", appHost: "app.example.test", variantKey: "h1Variant",
    localStorage: { getItem: () => choice }, location: { href: "https://example.test/", reload },
    addEventListener: (name: string, fn: (event: any) => void) => listeners.set(name, fn),
    document: {
      createElement: () => ({}), getElementsByTagName: () => [{ parentNode: { insertBefore: insert } }],
      addEventListener: vi.fn(), documentElement: { dataset: {}, lang: "en" },
    },
    URL, Element: class {},
  };
  context.window = context;
  runInNewContext(script!, context);
  return { listeners, insert, reload };
}

describe("Google Tag Manager consent", () => {
  it.each([null, "essential"])("does not load tags before consent (%s)", (choice) => {
    expect(setup(choice).insert).not.toHaveBeenCalled();
  });

  it("loads once after acceptance and reloads if consent is removed elsewhere", () => {
    const { listeners, insert, reload } = setup(null);
    listeners.get("dewee:analytics-consent")!({});
    listeners.get("storage")!({ key: "dewee.cookies", newValue: "all" });
    expect(insert).toHaveBeenCalledOnce();
    listeners.get("storage")!({ key: "dewee.cookies", newValue: null });
    expect(reload).toHaveBeenCalledOnce();
  });

  it("loads immediately for a saved acceptance and has no consent-bypassing noscript iframe", () => {
    expect(setup("all").insert).toHaveBeenCalledOnce();
    expect(source).not.toContain("<noscript>");
  });
});
