/**
 * A minimal D1Database over node:sqlite for unit tests: prepare/bind/run/first/all and batch,
 * with the schema built from the real migration files, so record functions run against the
 * columns production has.
 */
import { readFileSync } from "node:fs";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";

const MIGRATIONS = ["0001_init.sql", "0011_chat_session_context.sql"];

class Statement {
  constructor(private db: DatabaseSync, private sql: string, private params: SQLInputValue[] = []) {}
  bind(...params: unknown[]) {
    return new Statement(this.db, this.sql, params as SQLInputValue[]);
  }
  async run() {
    const r = this.db.prepare(this.sql).run(...this.params);
    return { success: true, meta: { changes: Number(r.changes), last_row_id: Number(r.lastInsertRowid) }, results: [] };
  }
  async first<T>(): Promise<T | null> {
    const row = this.db.prepare(this.sql).get(...this.params);
    return row ? ({ ...row } as T) : null;
  }
  async all<T>(): Promise<{ results: T[]; success: true }> {
    return { results: this.db.prepare(this.sql).all(...this.params).map((r) => ({ ...r }) as T), success: true };
  }
}

export function sqliteD1() {
  const db = new DatabaseSync(":memory:");
  for (const file of MIGRATIONS) db.exec(readFileSync(new URL(`../../migrations/${file}`, import.meta.url), "utf8"));
  const d1 = {
    prepare: (sql: string) => new Statement(db, sql),
    batch: async (stmts: Statement[]) => { const out = []; for (const s of stmts) out.push(await s.run()); return out; },
  };
  return { d1: d1 as unknown as D1Database, raw: db };
}

/** A KVNamespace stand-in with get/put. */
export function memoryKv() {
  const map = new Map<string, string>();
  return { map, kv: { get: async (k: string) => map.get(k) ?? null, put: async (k: string, v: string) => { map.set(k, v); } } as unknown as KVNamespace };
}
