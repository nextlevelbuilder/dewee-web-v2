import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import { postFieldsFromMarkdown } from "../../cli/src/commands/content.js";
import { samplePost } from "./sample-post";

const sample = fileURLToPath(new URL("../../docs/skills/dewee-web-content/examples/widget-post.md", import.meta.url));
const dir = mkdtempSync(join(tmpdir(), "dewee-cli-blocks-"));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

describe("CLI post files with widgets", () => {
  it("reads blocks from the JSON file named in the front matter, relative to the post", async () => {
    const fields = await postFieldsFromMarkdown(sample);
    expect(fields.title).toBe("How a widget post reads");
    expect(fields.blocks).toEqual(samplePost().blocks);
    expect(fields.body_md).toBe(samplePost().body_md);
  });

  it("explains a blocks file that is not an array", async () => {
    writeFileSync(join(dir, "bad.blocks.json"), '{ "id": "x" }');
    writeFileSync(join(dir, "post.md"), "---\ntitle: T\nblocks: ./bad.blocks.json\n---\nBody\n");
    await expect(postFieldsFromMarkdown(join(dir, "post.md"))).rejects.toThrow(/must contain a JSON array/);
    writeFileSync(join(dir, "inline.md"), "---\ntitle: T\nblocks: [a, b]\n---\nBody\n");
    await expect(postFieldsFromMarkdown(join(dir, "inline.md"))).rejects.toThrow(/path of a JSON file/);
  });
});
