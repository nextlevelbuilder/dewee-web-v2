/**
 * Read-only access to the leads that the contact and partner forms write (the forms themselves
 * live elsewhere). Used by `GET /api/v1/leads`, the `list_leads` MCP tool and the admin leads list.
 */
import { z } from "zod";

export const leadsQuerySchema = z
  .object({
    kind: z.string().trim().regex(/^[a-z0-9_-]{1,32}$/, "Use a lead kind such as contact or partner.").optional(),
    q: z.string().trim().max(100).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().min(0).max(100_000).default(0),
  })
  .strict();
export type LeadsQuery = z.infer<typeof leadsQuerySchema>;

export type Lead = {
  id: number;
  kind: string;
  email: string | null;
  name: string | null;
  company: string | null;
  locale: string | null;
  source: string | null;
  payload: Record<string, unknown>;
  created_at: string;
};

type LeadRow = Omit<Lead, "payload"> & { payload: string };

function parsePayload(text: string): Record<string, unknown> {
  try {
    const value: unknown = JSON.parse(text);
    return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

const likeEscape = (s: string) => `%${s.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;

export async function listLeads(db: D1Database, query: LeadsQuery): Promise<{ data: Lead[]; pagination: { limit: number; offset: number; total: number } }> {
  const where: string[] = [];
  const args: unknown[] = [];
  if (query.kind) (where.push("kind = ?"), args.push(query.kind));
  if (query.q) {
    const p = likeEscape(query.q);
    where.push("(COALESCE(email, '') LIKE ? ESCAPE '\\' OR COALESCE(name, '') LIKE ? ESCAPE '\\' OR COALESCE(company, '') LIKE ? ESCAPE '\\')");
    args.push(p, p, p);
  }
  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const [rows, count] = await db.batch([
    db.prepare(`SELECT * FROM leads ${clause} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`).bind(...args, query.limit, query.offset),
    db.prepare(`SELECT COUNT(*) AS n FROM leads ${clause}`).bind(...args),
  ]);
  const total = Number((count.results[0] as { n?: number } | undefined)?.n ?? 0);
  const data = (rows.results as LeadRow[]).map((r) => ({ ...r, payload: parsePayload(r.payload) }));
  return { data, pagination: { limit: query.limit, offset: query.offset, total } };
}
