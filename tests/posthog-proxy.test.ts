import { describe, expect, it } from "vitest";
import { posthogUpstreamUrl } from "../src/lib/server/posthog-proxy";

describe("posthogUpstreamUrl", () => {
  it("routes static assets to the PostHog asset host", () => {
    expect(posthogUpstreamUrl("https://dewee.sh/ingest/static/array.js").href).toBe("https://us-assets.i.posthog.com/static/array.js");
  });

  it("routes API calls to the ingestion host and keeps the query", () => {
    expect(posthogUpstreamUrl("https://dewee.sh/ingest/i/v0/e/?ip=0&ver=1").href).toBe("https://us.i.posthog.com/i/v0/e/?ip=0&ver=1");
  });
});
