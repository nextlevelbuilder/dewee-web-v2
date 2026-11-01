import type { APIContext } from "astro";
import { describe, expect, it, vi } from "vitest";

// Route matching runs before any binding is read, so an empty env is enough here.
vi.mock("cloudflare:workers", () => ({ env: {} }));

const { handleV1 } = await import("../../src/lib/server/api/v1-router");

async function call(method: string, path: string) {
  const request = new Request(`https://dewee.sh${path}`, {
    method,
    headers: { "content-type": "application/json" },
    body: method === "GET" ? undefined : "{}",
  });
  const ctx = { request, url: new URL(request.url), cookies: { get: () => undefined }, locals: {}, clientAddress: "203.0.113.1" };
  const res = await handleV1(ctx as unknown as APIContext);
  return { status: res.status, allow: res.headers.get("allow"), body: (await res.json()) as { error: { code: string } } };
}

describe("REST API answers malformed paths with a client error", () => {
  it("rejects an action placed after the query string as 405, not 500", async () => {
    const res = await call("POST", "/api/v1/posts/post-slug?locale=en/publish");
    expect(res.status).toBe(405);
    expect(res.allow).toBe("GET, PATCH, DELETE");
    expect(res.body.error.code).toBe("method_not_allowed");
  });

  it("answers an unknown endpoint with 404", async () => {
    const res = await call("POST", "/api/v1/posts/post-slug/publish/extra");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("not_found");
  });

  it("answers broken percent-encoding with 400", async () => {
    const res = await call("POST", "/api/v1/posts/bad%2/publish");
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("bad_request");
  });
});
