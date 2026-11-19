import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { docPath, parseDocPath, type DocRef } from "../../src/lib/server/docs/doc-paths";
import { validateDocFile } from "../../src/lib/server/docs/doc-validate";

const root = new URL("../../src/content/docs/", import.meta.url);
const files = (["en", "vi"] as const).flatMap((locale) =>
  readdirSync(new URL(`${locale}/`, root)).flatMap((section) =>
    readdirSync(new URL(`${locale}/${section}/`, root)).map((name) => `src/content/docs/${locale}/${section}/${name}`),
  ),
);
const ids = new Set(files.map((f) => parseDocPath(f)).filter((p) => p !== null).map((p) => `${p.section}/${p.slug}`));

const ref: DocRef = { section: "console", slug: "new-page" };
const description = "A description that is long enough for the docs schema, which asks for between one hundred forty and one hundred sixty characters in total, ok.";
const doc = (fm: string, body = "Body text.\n") => `---\n${fm}\n---\n\n${body}`;
const good = (extra = "") => doc(`title: New page\ndescription: "${description}"\nsection: console\norder: 9\nupdated: 2026-11-01${extra}`);

describe("docs file validation", () => {
  it("accepts every docs file in the repository", () => {
    expect(files.length).toBeGreaterThan(80);
    for (const file of files) {
      const parsed = parseDocPath(file);
      expect(parsed, file).not.toBeNull();
      const check = validateDocFile(readFileSync(new URL(`../../${file}`, import.meta.url), "utf8"), { locale: parsed!.locale, ref: parsed!, knownDocIds: ids });
      expect(check.errors, file).toEqual([]);
    }
  });

  it("maps refs to paths and refuses anything else", () => {
    expect(docPath("vi", ref)).toBe("src/content/docs/vi/console/new-page.md");
    expect(parseDocPath("src/content/docs/en/console/../x.md")).toBeNull();
    expect(parseDocPath("src/content/docs/en/unknown/x.md")).toBeNull();
    expect(parseDocPath("src/content/docs/fr/console/x.md")).toBeNull();
    expect(parseDocPath("src/content/docs/en/console/x.mdx")).toBeNull();
  });

  it("passes a minimal valid file", () => {
    expect(validateDocFile(good(), { locale: "en", ref }).errors).toEqual([]);
  });

  it("reports front matter problems with paths", () => {
    const bad = doc(`title: No\ndescription: short\nsection: runtime\norder: -1\nupdated: not-a-date\nauthor: me`);
    const paths = validateDocFile(bad, { locale: "en", ref }).errors.map((e) => e.path);
    expect(paths).toEqual(expect.arrayContaining(["en.front_matter.title", "en.front_matter.description", "en.front_matter.order", "en.front_matter.updated", "en.front_matter.author"]));
    const wrongSection = good().replace("section: console", "section: runtime");
    expect(validateDocFile(wrongSection, { locale: "en", ref }).errors.map((e) => e.message).join()).toContain('Must be "console"');
    expect(validateDocFile("no front matter", { locale: "en", ref }).errors[0].path).toBe("en.front_matter");
    const colon = good().replace("title: New page", "title: New: page");
    expect(validateDocFile(colon, { locale: "en", ref }).errors.map((e) => e.path)).toContain("en.front_matter.title");
  });

  it("checks screenshot markers like the renderer", () => {
    const unknown = doc(good().split("\n---\n")[0].slice(4) + "\nscreens: [agents]", '::shot{id="agents"}\n\n::shot{id="nope"}\n');
    const messages = validateDocFile(unknown, { locale: "en", ref }).errors.map((e) => e.message);
    expect(messages).toContain('Unknown screenshot id "nope".');
    const undeclared = validateDocFile(good().replace("Body text.", '::shot{id="chat"}'), { locale: "en", ref }).errors;
    expect(undeclared[0].message).toContain("not listed in front matter");
    const inline = validateDocFile(good().replace("Body text.", 'See ::shot{id="chat"} here'), { locale: "en", ref }).errors;
    expect(inline[0].message).toContain("line of its own");
    const unplaced = validateDocFile(good("\nscreens: [chat]"), { locale: "en", ref });
    expect(unplaced.errors).toEqual([]);
    expect(unplaced.warnings[0].message).toContain("never placed");
  });

  it("checks callouts, fences, headings and links", () => {
    const body = "> [!INFO]\n> x\n\n# Title\n\nSee [a](/docs/console/missing).\n\n```ts\nconst x = 1;\n";
    const check = validateDocFile(good().replace("Body text.\n", body), { locale: "en", ref, knownDocIds: ids });
    expect(check.errors.map((e) => e.message).join("|")).toMatch(/Unknown callout.*\|.*never closed|never closed.*Unknown callout/);
    expect(check.warnings.map((w) => w.message).join("|")).toContain("start body headings at ##");
    expect(check.warnings.map((w) => w.message).join("|")).toContain("/docs/console/missing");
    const fenced = validateDocFile(good().replace("Body text.", 'Text\n\n```\n::shot{id="x"} inside code\n```'), { locale: "en", ref });
    expect(fenced.errors).toEqual([]);
  });
});
