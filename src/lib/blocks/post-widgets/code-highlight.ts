/**
 * A small server-side syntax highlighter for blog code (isomorphic, no dependency). Shiki is
 * what the docs use at build time, but its grammars are too heavy to ship in the Worker, and a
 * blog only needs the broad strokes: comments, strings, numbers, keywords, function names, tags
 * and diff lines. Tokens become `<span class="hl-*">`; colours come from the site tokens in both
 * themes (src/styles/post-widgets.css). Unknown languages are escaped and left plain.
 */
import { escapeHtml } from "../../inline-markup";

type Rule = readonly [cls: string, re: RegExp];

const kw = (words: string) => new RegExp(`(?:${words.trim().split(/\s+/).join("|")})(?![\\w$])`, "y");

const C_COMMENT: Rule = ["c", /\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$)/y];
const HASH_COMMENT: Rule = ["c", /#[^\n]*/y];
const DQ: Rule = ["s", /"(?:\\.|[^"\\\n])*"?/y];
const SQ: Rule = ["s", /'(?:\\.|[^'\\\n])*'?/y];
const NUMBER: Rule = ["n", /(?:0[xX][\da-fA-F_]+|0[bB][01_]+|\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?n?)(?![\w$])/y];
const FUNC: Rule = ["f", /[A-Za-z_$][\w$]*(?=\s*\()/y];

const JS_KEYWORDS = kw(`async await break case catch class const continue debugger default delete do else enum export extends
  finally for from function if implements import in instanceof interface let new of private protected public readonly return
  satisfies static super switch this throw try type typeof var void while with yield as`);
const LITERALS = kw("true false null undefined NaN Infinity nil None True False");

const LANGS: Record<string, readonly Rule[]> = {
  js: [C_COMMENT, DQ, SQ, ["s", /`(?:\\[\s\S]|[^`\\])*`?/y], NUMBER, ["n", LITERALS], ["k", JS_KEYWORDS], FUNC],
  json: [C_COMMENT, ["a", /"(?:\\.|[^"\\\n])*"(?=\s*:)/y], DQ, NUMBER, ["n", kw("true false null")]],
  bash: [
    HASH_COMMENT,
    DQ,
    SQ,
    ["v", /\$(?:\{[^}\n]*\}|[A-Za-z_][\w]*|[0-9@#?*$!-])/y],
    ["k", kw("if then else elif fi for while until do done case esac in function return export local set unset source alias sudo")],
    ["f", /(?<=^|[\n;|&]\s*)[A-Za-z_][\w.-]*/y],
    ["a", /--?[A-Za-z][\w-]*/y],
  ],
  py: [
    HASH_COMMENT,
    ["s", /(?:[rbfu]{0,2})(?:"""[\s\S]*?(?:"""|$)|'''[\s\S]*?(?:'''|$))/y],
    DQ,
    SQ,
    NUMBER,
    ["n", LITERALS],
    ["k", kw("and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield match case")],
    ["t", /@[A-Za-z_][\w.]*/y],
    FUNC,
  ],
  go: [
    C_COMMENT,
    DQ,
    ["s", /`[^`]*`?/y],
    ["s", /'(?:\\.|[^'\\\n])*'/y],
    NUMBER,
    ["n", kw("true false nil iota")],
    ["k", kw("break case chan const continue default defer else fallthrough for func go goto if import interface map package range return select struct switch type var")],
    ["t", kw("string int int8 int16 int32 int64 uint uint8 uint16 uint32 uint64 byte rune bool error float32 float64 any")],
    FUNC,
  ],
  yaml: [HASH_COMMENT, ["a", /[A-Za-z0-9_.\/-]+(?=\s*:(?:\s|$))/y], DQ, SQ, NUMBER, ["n", kw("true false null yes no on off")]],
  html: [
    ["c", /<!--[\s\S]*?(?:-->|$)/y],
    ["t", /<\/?[A-Za-z][\w:-]*|\/?>/y],
    ["a", /[A-Za-z_:][\w:.-]*(?==)/y],
    DQ,
    SQ,
  ],
  css: [["c", /\/\*[\s\S]*?(?:\*\/|$)/y], DQ, SQ, ["a", /--?[A-Za-z][\w-]*(?=\s*:)/y], ["n", /#[\da-fA-F]{3,8}(?![\w-])|-?\d*\.?\d+(?:px|rem|em|%|vh|vw|s|ms|deg|fr)?(?![\w-])/y], ["k", /@[A-Za-z-]+/y], FUNC],
  sql: [
    ["c", /--[^\n]*|\/\*[\s\S]*?(?:\*\/|$)/y],
    SQ,
    DQ,
    NUMBER,
    ["k", new RegExp(`(?:${"select from where and or not insert into values update set delete create table index view drop alter add column primary key foreign references join left right inner outer on group by order asc desc limit offset having as distinct union all exists in is null case when then else end returning with begin commit rollback if".split(" ").join("|")})(?![\\w$])`, "iy")],
    FUNC,
  ],
  diff: [["ins", /\+[^\n]*/y], ["del", /-[^\n]*/y], ["c", /@@[^\n]*/y]],
};
LANGS.clike = [C_COMMENT, DQ, ["s", /'(?:\\.|[^'\\\n]){1,2}'/y], NUMBER, ["n", LITERALS], ["k", kw(`auto break case catch char class const continue default do double else enum extern final float fn for
  if impl import int let long match mod mut namespace new package private protected pub public return self short signed sizeof static
  struct super switch this throw throws trait try typedef union unsigned use using var virtual void volatile where while`)], FUNC];

const ALIASES: Record<string, string> = {
  js: "js", javascript: "js", mjs: "js", cjs: "js", jsx: "js", ts: "js", typescript: "js", tsx: "js", mts: "js",
  json: "json", jsonc: "json", json5: "json",
  bash: "bash", sh: "bash", shell: "bash", zsh: "bash", console: "bash", shellsession: "bash",
  py: "py", python: "py",
  go: "go", golang: "go",
  yaml: "yaml", yml: "yaml", toml: "yaml",
  html: "html", xml: "html", svg: "html", astro: "html", vue: "html",
  css: "css", scss: "css",
  sql: "sql", sqlite: "sql",
  diff: "diff", patch: "diff",
  c: "clike", h: "clike", cpp: "clike", "c++": "clike", cs: "clike", "c#": "clike", java: "clike", kotlin: "clike", kt: "clike",
  rust: "clike", rs: "clike", swift: "clike", php: "clike", dart: "clike", scala: "clike",
};

/** The canonical grammar for a fence language, or null when we only escape it. */
export function grammarFor(language: string | undefined): string | null {
  return language ? (ALIASES[language.toLowerCase()] ?? null) : null;
}

/** HTML for `code` (escaped, with `hl-*` spans when the language is known). Diff rules apply per line. */
export function highlight(code: string, language: string | undefined): string {
  const grammar = grammarFor(language);
  const rules = grammar ? LANGS[grammar] : undefined;
  if (!rules) return escapeHtml(code);
  if (grammar === "diff") {
    return code
      .split("\n")
      .map((line) => {
        const rule = rules.find(([, re]) => ((re.lastIndex = 0), re.test(line)));
        return rule ? `<span class="hl-${rule[0]}">${escapeHtml(line)}</span>` : escapeHtml(line);
      })
      .join("\n");
  }
  let out = "";
  let plain = "";
  let i = 0;
  const word = /[A-Za-z_$][\w$-]*|\s+|[\s\S]/y;
  scan: while (i < code.length) {
    for (const [cls, re] of rules) {
      re.lastIndex = i;
      const m = re.exec(code);
      if (m && m[0].length > 0) {
        if (plain) out += escapeHtml(plain);
        plain = "";
        out += `<span class="hl-${cls}">${escapeHtml(m[0])}</span>`;
        i += m[0].length;
        continue scan;
      }
    }
    // No rule here: consume a whole word so a keyword never matches inside an identifier.
    word.lastIndex = i;
    const w = word.exec(code);
    const chunk = w ? w[0] : code[i];
    plain += chunk;
    i += chunk.length;
  }
  return out + (plain ? escapeHtml(plain) : "");
}
