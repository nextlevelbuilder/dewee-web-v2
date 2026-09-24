// @ts-check
/**
 * Minimal argv parser: positionals, `--flag value`, `--flag=value` and boolean `--flag`.
 * Repeated flags keep the last value. `--` ends flag parsing.
 */

/** Flags that never take a value. */
const BOOLEAN_FLAGS = new Set(["json", "publish", "help", "draft"]);

/**
 * @param {string[]} argv
 * @returns {{ positionals: string[], flags: Record<string, string | true> }}
 */
export function parseArgs(argv) {
  /** @type {string[]} */
  const positionals = [];
  /** @type {Record<string, string | true>} */
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--") {
      positionals.push(...argv.slice(i + 1));
      break;
    }
    if (arg === "-h") {
      flags.help = true;
      continue;
    }
    if (!arg.startsWith("--")) {
      positionals.push(arg);
      continue;
    }
    const eq = arg.indexOf("=");
    const name = arg.slice(2, eq === -1 ? undefined : eq);
    if (eq !== -1) flags[name] = arg.slice(eq + 1);
    else if (BOOLEAN_FLAGS.has(name) || i + 1 >= argv.length || argv[i + 1].startsWith("--")) flags[name] = true;
    else flags[name] = argv[++i];
  }
  return { positionals, flags };
}

/**
 * A string flag, or undefined. A bare boolean flag where a value was expected is an error.
 * @param {Record<string, string | true>} flags
 * @param {string} name
 */
export function stringFlag(flags, name) {
  const v = flags[name];
  if (v === undefined) return undefined;
  if (v === true) throw new Error(`--${name} needs a value.`);
  return v;
}

/**
 * A positive integer flag, or undefined.
 * @param {Record<string, string | true>} flags
 * @param {string} name
 */
export function intFlag(flags, name) {
  const v = stringFlag(flags, name);
  if (v === undefined) return undefined;
  const n = Number(v);
  if (!Number.isSafeInteger(n) || n < 0) throw new Error(`--${name} must be a whole number.`);
  return n;
}
