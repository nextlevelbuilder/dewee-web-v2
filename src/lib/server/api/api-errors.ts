/**
 * One error shape for the REST API, the MCP server and the admin islands:
 * `{ error: { code, message, details? } }`. Services throw ApiError; routes turn it into JSON.
 */
import type { ZodError } from "zod";

export type ApiErrorCode =
  | "bad_request"
  | "validation_failed"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "method_not_allowed"
  | "version_conflict"
  | "conflict"
  | "payload_too_large"
  | "unsupported_media_type"
  | "rate_limited"
  | "internal";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: ApiErrorCode,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const badRequest = (message: string, details?: unknown) => new ApiError(400, "bad_request", message, details);
export const unauthorized = (message = "A valid API key or admin session is required.") => new ApiError(401, "unauthorized", message);
export const forbidden = (message = "This credential is not allowed to do that.") => new ApiError(403, "forbidden", message);
export const notFound = (message = "Not found.") => new ApiError(404, "not_found", message);
export const conflict = (message: string, details?: unknown) => new ApiError(409, "conflict", message, details);

/** Flattens zod issues into `[{ path: "blocks.2.props.title", message }]` for humans and agents. */
export function zodIssues(error: ZodError): { path: string; message: string }[] {
  return error.issues.map((i) => ({ path: i.path.map(String).join("."), message: i.message }));
}

export function validationFailed(error: ZodError, message = "The request did not pass validation."): ApiError {
  return new ApiError(422, "validation_failed", message, zodIssues(error));
}

export function json(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  if (!headers.has("cache-control")) headers.set("cache-control", "no-store");
  return new Response(JSON.stringify(data), { ...init, headers });
}

export function errorBody(err: ApiError): { error: { code: ApiErrorCode; message: string; details?: unknown } } {
  return { error: { code: err.code, message: err.message, ...(err.details === undefined ? {} : { details: err.details }) } };
}

/** Converts anything thrown into a JSON error response; unknown errors are logged, never leaked. */
export function errorResponse(err: unknown): Response {
  if (err instanceof ApiError) {
    const headers: Record<string, string> = {};
    if (err.status === 401) headers["www-authenticate"] = 'Bearer realm="dewee.sh"';
    return json(errorBody(err), { status: err.status, headers });
  }
  console.error("api: unhandled error", err instanceof Error ? err.stack || err.message : err);
  return json(errorBody(new ApiError(500, "internal", "Something went wrong on our side.")), { status: 500 });
}
