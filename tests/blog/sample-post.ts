/** The sample widget post that ships with the content skill, as test input. */
import { readFileSync } from "node:fs";

const dir = new URL("../../docs/skills/dewee-web-content/examples/", import.meta.url);

export function samplePost(): { body_md: string; blocks: unknown[] } {
  const md = readFileSync(new URL("widget-post.md", dir), "utf8");
  const body_md = md.replace(/^---\n[\s\S]*?\n---\n/, "");
  const blocks = JSON.parse(readFileSync(new URL("widget-post.blocks.json", dir), "utf8")) as unknown[];
  return { body_md, blocks };
}
