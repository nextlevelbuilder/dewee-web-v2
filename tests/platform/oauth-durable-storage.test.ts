import { afterEach, describe, expect, it, vi } from "vitest";
import { OAuthDurableStorage } from "../../src/lib/server/oauth/oauth-durable-storage";

type FakeStorage = {
  get(key: string): Promise<unknown>;
  put(key: string, value: unknown): Promise<void>;
  delete(key: string): Promise<boolean>;
  list(options?: { prefix?: string; startAfter?: string; limit?: number }): Promise<Map<string, unknown>>;
  transaction<T>(fn: (txn: FakeStorage) => Promise<T>): Promise<T>;
};

function createStorage() {
  const rows = new Map<string, unknown>();
  const storage: FakeStorage = {
    get: async (key: string) => rows.get(key),
    put: async (key: string, value: unknown) => { rows.set(key, value); },
    delete: async (key: string) => rows.delete(key),
    list: async ({ prefix = "", startAfter, limit = 1000 }: { prefix?: string; startAfter?: string; limit?: number } = {}) =>
      new Map([...rows].filter(([key]) => key.startsWith(prefix) && (!startAfter || key > startAfter)).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).slice(0, limit)),
    transaction: async <T>(fn: (txn: FakeStorage) => Promise<T>) => fn(storage),
  };
  return storage as unknown as DurableObjectStorage;
}

afterEach(() => vi.useRealTimers());

describe("OAuth durable storage", () => {
  it("stores text and JSON, enforces expiry, and purges expired entries", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    const raw = createStorage();
    const store = new OAuthDurableStorage(raw);
    await store.put("grant:a", '{"scope":["read"]}', { expirationTtl: 60 });
    await store.put("client:b", "kept");
    expect(await store.get("grant:a", { type: "json" })).toEqual({ scope: ["read"] });
    vi.advanceTimersByTime(60_000);
    expect(await store.get("grant:a")).toBeNull();
    expect((await store.list()).keys.map((item) => item.name)).toEqual(["client:b"]);
    await store.purgeExpired();
    expect(await raw.get("grant:a")).toBeUndefined();
    expect(await store.get("client:b")).toBe("kept");
  });

  it("paginates by last key even if the previous page is deleted", async () => {
    const store = new OAuthDurableStorage(createStorage());
    for (const key of ["grant:a", "grant:b", "grant:c", "other"]) await store.put(key, key);
    const first = await store.list({ prefix: "grant:", limit: 2 });
    expect(first.keys.map((item) => item.name)).toEqual(["grant:a", "grant:b"]);
    expect(first.list_complete).toBe(false);
    await store.delete("grant:a");
    await store.delete("grant:b");
    const next = await store.list({ prefix: "grant:", limit: 2, cursor: first.cursor });
    expect(next.keys.map((item) => item.name)).toEqual(["grant:c"]);
    expect(next.list_complete).toBe(true);
  });

  it("does not purge a grant renewed after the expiration scan", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    const raw = createStorage();
    const store = new OAuthDurableStorage(raw);
    await store.put("grant:a", "old", { expirationTtl: 60 });
    vi.advanceTimersByTime(60_000);
    const list = raw.list.bind(raw);
    raw.list = (async (options?: Parameters<DurableObjectStorage["list"]>[0]) => {
      const snapshot = await list(options);
      await store.put("grant:a", "renewed", { expirationTtl: 300 });
      return snapshot;
    }) as typeof raw.list;
    await store.purgeExpired();
    expect(await store.get("grant:a")).toBe("renewed");
  });
});
