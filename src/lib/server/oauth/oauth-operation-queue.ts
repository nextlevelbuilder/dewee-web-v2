/**
 * Serializes operations on one authority key while allowing unrelated grants to
 * proceed independently. Durable storage remains the source of truth; this
 * queue is only for the lifetime of a single Durable Object instance.
 */
export class OAuthOperationQueue {
  private readonly pending = new Map<string, Promise<void>>();

  async run<T>(key: string, operation: () => Promise<T>): Promise<T> {
    const previous = this.pending.get(key) ?? Promise.resolve();
    const current = previous.then(operation);
    const settled = current.then(() => undefined, () => undefined);
    this.pending.set(key, settled);
    try {
      return await current;
    } finally {
      if (this.pending.get(key) === settled) this.pending.delete(key);
    }
  }
}
