import { describe, expect, it } from "vitest";
import { OAuthOperationQueue } from "../../src/lib/server/oauth/oauth-operation-queue";

describe("OAuth operation queue", () => {
  it("serializes the same key without blocking another key", async () => {
    const queue = new OAuthOperationQueue();
    const calls: string[] = [];
    let release!: () => void;
    const hold = new Promise<void>((resolve) => { release = resolve; });
    const first = queue.run("grant-a", async () => { calls.push("a1-start"); await hold; calls.push("a1-end"); });
    const second = queue.run("grant-a", async () => { calls.push("a2"); });
    const other = queue.run("grant-b", async () => { calls.push("b"); });
    await other;
    expect(calls).toEqual(["a1-start", "b"]);
    release();
    await Promise.all([first, second]);
    expect(calls).toEqual(["a1-start", "b", "a1-end", "a2"]);
  });

  it("does not leave a key locked when an operation fails", async () => {
    const queue = new OAuthOperationQueue();
    const failure = queue.run("grant-a", async () => { throw new Error("failed"); });
    const next = queue.run("grant-a", async () => "recovered");
    await expect(failure).rejects.toThrow("failed");
    await expect(next).resolves.toBe("recovered");
  });
});
