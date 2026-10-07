/**
 * A ChatRoom's own SQLite storage: the transcript (`messages`) and per-conversation facts (`meta`:
 * session id, locale, hashed IP, visit context, email, lead id and fields, handoff/announce flags).
 * Kept apart from the room so the room reads as message flow, not SQL.
 */
import type { ChatContext } from "../chat-session-context";

export type Role = "user" | "agent" | "system";
export type ChatMessage = { role: Role; text: string; at: number };

export class ChatRoomStore {
  constructor(private readonly sql: SqlStorage) {}

  init() {
    this.sql.exec("CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, role TEXT NOT NULL, text TEXT NOT NULL, at INTEGER NOT NULL)");
    this.sql.exec("CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT NOT NULL)");
  }

  insert(role: Role, text: string): ChatMessage {
    const at = Date.now();
    this.sql.exec("INSERT INTO messages (role, text, at) VALUES (?, ?, ?)", role, text, at);
    return { role, text, at };
  }

  history(limit: number): ChatMessage[] {
    const rows = this.sql.exec<ChatMessage>("SELECT role, text, at FROM messages ORDER BY id DESC LIMIT ?", limit).toArray();
    return rows.reverse();
  }

  /** Everything the visitor has written in this conversation (at most 40 messages). */
  visitorTexts(): string[] {
    return this.sql.exec<{ text: string }>("SELECT text FROM messages WHERE role = 'user' ORDER BY id").toArray().map((r) => r.text);
  }

  count(role: Role): number {
    return this.sql.exec<{ n: number }>("SELECT COUNT(*) AS n FROM messages WHERE role = ?", role).one().n;
  }

  userMessagesSince(at: number): number {
    return this.sql.exec<{ n: number }>("SELECT COUNT(*) AS n FROM messages WHERE role = 'user' AND at > ?", at).one().n;
  }

  get(k: string): string | null {
    return this.sql.exec<{ v: string }>("SELECT v FROM meta WHERE k = ?", k).toArray()[0]?.v ?? null;
  }

  set(k: string, v: string) {
    this.sql.exec("INSERT INTO meta (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v", k, v);
  }

  json<T>(k: string): T | null {
    try { return JSON.parse(this.get(k) ?? "null") as T | null; } catch { return null; }
  }

  context(): ChatContext {
    return this.json<ChatContext>("ctx") ?? {};
  }

  locale(): "en" | "vi" {
    return this.get("locale") === "vi" ? "vi" : "en";
  }
}
