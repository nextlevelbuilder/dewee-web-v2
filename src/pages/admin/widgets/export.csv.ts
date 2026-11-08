/**
 * GET /admin/widgets/export.csv?post=<id>&widget=<id>: one survey's answers as CSV, for super
 * admins only (session cookie). Each export is written to the audit log.
 */
import type { APIRoute } from "astro";
import { WIDGET_ID_RE } from "~/lib/blocks/registry";
import { platformEnv } from "~/lib/server/api/platform-env";
import { audit } from "~/lib/server/auth/audit-log";
import { adminSession } from "~/lib/server/auth/request-auth";
import { surveyCsv, widgetReport } from "~/lib/server/post-widget-votes/admin-report";

export const prerender = false;

const PRIVATE = { "cache-control": "no-store", "x-robots-tag": "noindex, nofollow" };

export const GET: APIRoute = async ({ request, cookies, locals, url }) => {
  const session = await adminSession({ request, cookies, locals, clientAddress: request.headers.get("cf-connecting-ip") ?? undefined });
  if (!session) return new Response("Sign in at /admin first.", { status: 401, headers: PRIVATE });
  const postId = url.searchParams.get("post") ?? "";
  const widgetId = url.searchParams.get("widget") ?? "";
  if (!WIDGET_ID_RE.test(widgetId)) return new Response("Unknown widget.", { status: 404, headers: PRIVATE });
  const db = platformEnv().DB;
  const report = await widgetReport(db, postId, widgetId);
  if (!report || report.type !== "Survey") return new Response("Only surveys export as CSV.", { status: 404, headers: PRIVATE });
  await audit(db, session.email, "post_widget.export", `${report.post.id}#${widgetId}`, { rows: report.rows?.length ?? 0 });
  return new Response(surveyCsv(report), {
    headers: { ...PRIVATE, "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="survey-${report.post.slug}-${widgetId}.csv"` },
  });
};
