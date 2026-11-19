import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { describe, expect, it, vi } from "vitest";

const source = readFileSync("src/components/layout/GoogleTagManager.astro", "utf8");
const script = source.match(/<script is:inline define:vars=\{\{ id, appHost, variantKey \}\}>([\s\S]*?)<\/script>/)?.[1];
if (!script) throw new Error("Google Tag Manager script not found");

function setup(choice: string | null, storageBlocked = false) {
  const listeners = new Map<string, (event: any) => void>();
  const insert = vi.fn();
  const reload = vi.fn();
  const context: any = {
    id: "GTM-TEST", appHost: "app.example.test", variantKey: "h1Variant",
    localStorage: { getItem: () => { if (storageBlocked) throw new Error("storage blocked"); return choice; } }, location: { href: "https://example.test/", reload },
    addEventListener: (name: string, fn: (event: any) => void) => listeners.set(name, fn),
    document: {
      createElement: () => ({}), getElementsByTagName: () => [{ parentNode: { insertBefore: insert } }],
      addEventListener: vi.fn(), documentElement: { dataset: {}, lang: "en" },
    },
    URL, Element: class {},
  };
  context.window = context;
  runInNewContext(script!, context);
  return { listeners, insert, reload, context };
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

  it("grants analytics but keeps advertising consent denied on initialization", () => {
    const { context } = setup("all");
    const consent = Array.from(context.dataLayer[0]) as [string, string, Record<string, string>];
    expect(consent[2]).toMatchObject({ analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
  });

  it("keeps advertising consent denied when the notice updates an existing tag", () => {
    const cookieSource = readFileSync("src/components/layout/CookieBadge.astro", "utf8");
    const cookieScript = cookieSource.match(/<script>([\s\S]*?)<\/script>/)?.[1];
    if (!cookieScript) throw new Error("Cookie notice script not found");
    // Astro compiles the TypeScript cookie script before the browser runs it.
    const compiled = ts.transpileModule(cookieScript, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
    let click: (() => void) | undefined;
    const gtag = vi.fn();
    const button = { dataset: { cookieChoice: "all" }, addEventListener: (_name: string, fn: () => void) => { click = fn; } };
    const context: any = {
      localStorage: { getItem: () => null, setItem: vi.fn() },
      document: { querySelector: () => ({ hidden: true, querySelectorAll: () => [button] }), documentElement: { scrollHeight: 1000 } },
      innerHeight: 500, scrollY: 0, addEventListener: vi.fn(), removeEventListener: vi.fn(),
      setTimeout: vi.fn(), Event: class {}, gtag, dispatchEvent: vi.fn(),
    };
    context.window = context;
    runInNewContext(compiled, context);
    click!();
    expect(gtag).toHaveBeenCalledWith("consent", "update", expect.objectContaining({ analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" }));
  });

  it("fails closed when browser storage is blocked until explicit acceptance", () => {
    const { listeners, insert } = setup(null, true);
    expect(insert).not.toHaveBeenCalled();
    listeners.get("dewee:analytics-consent")!({});
    expect(insert).toHaveBeenCalledOnce();
  });
});
