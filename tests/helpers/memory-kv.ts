/**
 * An in-memory KVNamespace for tests: get (text/json), getWithMetadata, put with expirationTtl /
 * expiration / metadata, delete and prefix list with cursors. Expiry follows Date.now(), so
 * vi.setSystemTime() ages records the way KV would.
 */
type Entry = { value: string; metadata: unknown; expiresAt: number | null };

export function memoryKV(): KVNamespace & { size(): number } {
  const store = new Map<string, Entry>();
  const live = (key: string): Entry | null => {
    const e = store.get(key);
    if (!e) return null;
    if (e.expiresAt !== null && e.expiresAt <= Date.now()) {
      store.delete(key);
      return null;
    }
    return e;
  };
  const decode = (value: string, type: unknown) => {
    const t = typeof type === "string" ? type : (type as { type?: string } | undefined)?.type;
    if (t === "json") return JSON.parse(value);
    if (t === "arrayBuffer") return new TextEncoder().encode(value).buffer;
    return value;
  };
  const kv = {
    async get(key: string, type?: unknown) {
      const e = live(key);
      return e ? decode(e.value, type) : null;
    },
    async getWithMetadata(key: string, type?: unknown) {
      const e = live(key);
      return { value: e ? decode(e.value, type) : null, metadata: e?.metadata ?? null, cacheStatus: null };
    },
    async put(key: string, value: string | ArrayBuffer, opts: { expirationTtl?: number; expiration?: number; metadata?: unknown } = {}) {
      const text = typeof value === "string" ? value : new TextDecoder().decode(value);
      const expiresAt = opts.expirationTtl ? Date.now() + opts.expirationTtl * 1000 : opts.expiration ? opts.expiration * 1000 : null;
      store.set(key, { value: text, metadata: opts.metadata ?? null, expiresAt });
    },
    async delete(key: string) {
      store.delete(key);
    },
    async list(opts: { prefix?: string; limit?: number; cursor?: string } = {}) {
      const names = [...store.keys()].filter((k) => live(k) && k.startsWith(opts.prefix ?? "")).sort();
      const start = opts.cursor ? Number(opts.cursor) : 0;
      const limit = opts.limit ?? 1000;
      const page = names.slice(start, start + limit);
      const done = start + limit >= names.length;
      return {
        keys: page.map((name) => {
          const e = store.get(name)!;
          return { name, metadata: e.metadata ?? undefined, expiration: e.expiresAt ? Math.floor(e.expiresAt / 1000) : undefined };
        }),
        list_complete: done,
        cursor: done ? undefined : String(start + limit),
        cacheStatus: null,
      };
    },
    size: () => store.size,
  };
  return kv as unknown as KVNamespace & { size(): number };
}
