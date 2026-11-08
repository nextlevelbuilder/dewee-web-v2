import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, expect, it, vi } from "vitest";

const source = readFileSync("src/components/layout/PosthogAnalytics.astro", "utf8");
const script = source.match(/<script is:inline define:vars=\{\{ config \}\}>([\s\S]*?)<\/script>/)?.[1];
if (!script) throw new Error("PostHog script not found");

function setup(choice: string | null, storageBlocked = false) {
  const windowListeners = new Map<string, (event: any) => void>();
  const documentListeners = new Map<string, (event: any) => void>();
  const posthog = { __loaded: true, init: vi.fn(), register: vi.fn(), capture: vi.fn(), opt_in_capturing: vi.fn(), opt_out_capturing: vi.fn() };
  const context: any = {
    posthog,
    config: { key: "test", props: {}, appHost: "app.example.test", variantKey: "h1Variant" },
    location: { origin: "https://example.test", href: "https://example.test/" },
    localStorage: { getItem: () => { if (storageBlocked) throw new Error("storage blocked"); return choice; } },
    document: { addEventListener: (name: string, fn: (event: any) => void) => documentListeners.set(name, fn), documentElement: { dataset: {} } },
    addEventListener: (name: string, fn: (event: any) => void) => windowListeners.set(name, fn),
    setTimeout: (fn: () => void) => fn(), URL, Element: class {},
  };
  context.window = context;
  runInNewContext(script!, context);
  return { posthog, windowListeners, documentListeners };
}

describe("PostHog consent", () => {
  it.each([null, "essential"])("does not initialize or register click tracking without consent (%s)", (choice) => {
    const { posthog, documentListeners } = setup(choice);
    expect(posthog.init).not.toHaveBeenCalled();
    expect(posthog.capture).not.toHaveBeenCalled();
    expect(documentListeners.has("click")).toBe(false);
  });

  it("starts after acceptance and stops on consent removal in another tab", () => {
    const { posthog, windowListeners, documentListeners } = setup(null);
    windowListeners.get("dewee:analytics-consent")!({});
    expect(posthog.init).toHaveBeenCalledOnce();
    expect(posthog.opt_in_capturing).toHaveBeenCalledOnce();
    expect(documentListeners.has("click")).toBe(true);
    windowListeners.get("storage")!({ key: "dewee.cookies", newValue: null });
    expect(posthog.opt_out_capturing).toHaveBeenCalledOnce();
    windowListeners.get("storage")!({ key: "dewee.cookies", newValue: "all" });
    expect(posthog.init).toHaveBeenCalledOnce();
    expect(posthog.opt_in_capturing).toHaveBeenCalledTimes(2);
  });

  it("starts immediately when consent was already saved", () => {
    const { posthog } = setup("all");
    expect(posthog.init).toHaveBeenCalledOnce();
    expect(posthog.opt_in_capturing).toHaveBeenCalledOnce();
  });

  it("fails closed when browser storage is blocked until explicit acceptance", () => {
    const { posthog, windowListeners } = setup(null, true);
    expect(posthog.init).not.toHaveBeenCalled();
    windowListeners.get("dewee:analytics-consent")!({});
    expect(posthog.init).toHaveBeenCalledOnce();
  });

  it("does not load the real SDK stub until acceptance on a fresh page", () => {
    const listeners = new Map<string, (event: unknown) => void>();
    const insert = vi.fn();
    const context: any = {
      config: { key: "test", props: {}, appHost: "app.example.test", variantKey: "h1Variant" },
      location: { origin: "https://example.test", href: "https://example.test/" },
      localStorage: { getItem: () => null },
      addEventListener: (name: string, fn: (event: unknown) => void) => listeners.set(name, fn),
      document: {
        createElement: () => ({}), getElementsByTagName: () => [{ parentNode: { insertBefore: insert } }],
        addEventListener: vi.fn(), documentElement: { dataset: {} },
      },
      setTimeout, URL, Element: class {},
    };
    context.window = context;
    runInNewContext(script!, context);
    expect(context.posthog).toBeUndefined();
    expect(insert).not.toHaveBeenCalled();
    listeners.get("dewee:analytics-consent")!({});
    expect(insert).toHaveBeenCalledOnce();
    expect(context.posthog._i).toHaveLength(1);
  });
});
