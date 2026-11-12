/**
 * The OAuth provider's KV-shaped storage, backed by one Durable Object's strongly
 * consistent storage. Callers must serialize whole provider operations: individual
 * get/put calls alone cannot make the provider's read-modify-write flows atomic.
 */
type StoredEntry = { value: string; expiration?: number; metadata?: unknown };
type ReadOptions = "text" | "json" | { type?: "text" | "json" };
type PutOptions = { expiration?: number; expirationTtl?: number; metadata?: unknown };
type ListOptions = { prefix?: string; limit?: number; cursor?: string };

export class OAuthDurableStorage {
  constructor(private readonly storage: DurableObjectStorage) {}

  async get(key: string, options?: ReadOptions): Promise<unknown> {
    const entry = await this.storage.get<StoredEntry>(key);
    if (!entry || (entry.expiration !== undefined && entry.expiration <= Date.now() / 1000)) return null;
    const type = typeof options === "string" ? options : options?.type;
    return type === "json" ? JSON.parse(entry.value) : entry.value;
  }

  async put(key: string, value: string, options: PutOptions = {}): Promise<void> {
    const expiration = options.expirationTtl !== undefined
      ? Math.floor(Date.now() / 1000) + options.expirationTtl
      : options.expiration;
    await this.storage.put(key, { value, expiration, metadata: options.metadata } satisfies StoredEntry);
  }

  async delete(key: string): Promise<void> {
    await this.storage.delete(key);
  }

  async list(options: ListOptions = {}) {
    const limit = options.limit ?? 1000;
    const keys: { name: string; expiration?: number; metadata?: unknown }[] = [];
    let after = options.cursor;
    let complete = false;
    while (keys.length <= limit && !complete) {
      const rows = await this.storage.list<StoredEntry>({
        prefix: options.prefix,
        startAfter: after,
        limit: Math.min(1000, limit + 1),
      });
      if (rows.size === 0) break;
      for (const [name, entry] of rows) {
        after = name;
        if (entry.expiration !== undefined && entry.expiration <= Date.now() / 1000) continue;
        keys.push({ name, expiration: entry.expiration, metadata: entry.metadata });
        if (keys.length > limit) break;
      }
      complete = rows.size < Math.min(1000, limit + 1);
    }
    const hasMore = keys.length > limit;
    const page = keys.slice(0, limit);
    return {
      keys: page,
      list_complete: !hasMore,
      cursor: hasMore ? page[page.length - 1].name : undefined,
      cacheStatus: null,
    };
  }

  /** Remove expired records, including abandoned consent transactions. */
  async purgeExpired(): Promise<void> {
    let after: string | undefined;
    for (;;) {
      const rows = await this.storage.list<StoredEntry>({ startAfter: after, limit: 1000 });
      if (!rows.size) return;
      for (const [key, entry] of rows) {
        if (entry.expiration !== undefined && entry.expiration <= Date.now() / 1000) {
          // A grant may have been refreshed since list(); re-check inside a
          // transaction so the sweep cannot delete the renewed record.
          await this.storage.transaction(async (txn) => {
            const current = await txn.get<StoredEntry>(key);
            if (current?.expiration !== undefined && current.expiration <= Date.now() / 1000) await txn.delete(key);
          });
        }
        after = key;
      }
      if (rows.size < 1000) return;
    }
  }
}
