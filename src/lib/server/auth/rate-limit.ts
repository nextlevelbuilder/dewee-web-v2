/**
 * Fixed-window rate limiter on the KV binding. KV is eventually consistent, so this is a brake
 * for sign-in abuse (per email, per IP), not an exact quota. Keys expire on their own.
 */
export type RateLimitResult = { ok: boolean; remaining: number };

export async function rateLimit(kv: KVNamespace, bucket: string, limit: number, windowSeconds: number, now = Date.now()): Promise<RateLimitResult> {
  const window = Math.floor(now / 1000 / windowSeconds);
  const key = `rl:${bucket}:${window}`;
  let count = 0;
  try {
    count = Number.parseInt((await kv.get(key)) ?? "0", 10) || 0;
    if (count >= limit) return { ok: false, remaining: 0 };
    // KV requires expirationTtl >= 60 seconds.
    await kv.put(key, String(count + 1), { expirationTtl: Math.max(60, windowSeconds * 2) });
  } catch (err) {
    // Fail closed: if the limiter store is down we would rather refuse a code than allow brute force.
    console.error("rate-limit: KV unavailable", err instanceof Error ? err.message : err);
    return { ok: false, remaining: 0 };
  }
  return { ok: true, remaining: Math.max(0, limit - count - 1) };
}
