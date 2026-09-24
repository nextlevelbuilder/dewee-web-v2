/**
 * Image uploads to the R2 bucket MEDIA (served at cdn.dewee.sh, and at /media/<key> by the worker).
 * Only raster images up to 10 MB; the declared type must match the file's magic bytes, and SVG is
 * refused because it can carry script. Keys are `media/<yyyy>/<mm>/<uuid>.<ext>`.
 */
import { z } from "zod";
import { ApiError, badRequest } from "../api/api-errors";
import { auditStatement } from "../auth/audit-log";

export const MEDIA_TYPES: Readonly<Record<string, string>> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};
export const MAX_MEDIA_BYTES = 10 * 1024 * 1024;

/** JSON form of an upload (MCP and API clients that cannot send raw bytes). */
export const mediaJsonBody = z
  .object({
    data_base64: z.string().min(1).describe("The image bytes, base64 (a data: URL prefix is accepted)."),
    content_type: z.string().max(40).optional().describe("image/png, image/jpeg, image/webp, image/gif or image/avif."),
    filename: z.string().max(120).optional(),
  })
  .strict();

export type MediaResult = { key: string; url: string; fallback_url: string; content_type: string; size: number };

const ascii = (bytes: Uint8Array, start: number, end: number) => String.fromCharCode(...bytes.subarray(start, end));

/** Detects the image type from magic bytes; null for anything else (including SVG and HTML). */
export function sniffImageType(bytes: Uint8Array): string | null {
  if (bytes.length >= 8 && bytes[0] === 0x89 && ascii(bytes, 1, 4) === "PNG" && bytes[4] === 0x0d && bytes[5] === 0x0a) return "image/png";
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 6 && /^GIF8[79]a$/.test(ascii(bytes, 0, 6))) return "image/gif";
  if (bytes.length >= 12 && ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 12) === "WEBP") return "image/webp";
  if (bytes.length >= 12 && ascii(bytes, 4, 8) === "ftyp" && /^avi[fs]$/.test(ascii(bytes, 8, 12))) return "image/avif";
  return null;
}

export function mediaKey(ext: string, at: Date, id: string = crypto.randomUUID()): string {
  const yyyy = at.getUTCFullYear();
  const mm = String(at.getUTCMonth() + 1).padStart(2, "0");
  return `media/${yyyy}/${mm}/${id}.${ext}`;
}

/** Validates type and size; returns the canonical content type. */
export function checkUpload(bytes: Uint8Array, declared: string | null): string {
  if (bytes.length === 0) throw badRequest("The upload is empty.");
  if (bytes.length > MAX_MEDIA_BYTES) throw new ApiError(413, "payload_too_large", "Images are limited to 10 MB.");
  const sniffed = sniffImageType(bytes);
  if (!sniffed) throw new ApiError(415, "unsupported_media_type", `Only ${Object.keys(MEDIA_TYPES).join(", ")} images are accepted.`);
  const type = (declared ?? "").split(";")[0].trim().toLowerCase();
  if (type && type !== "application/octet-stream" && type !== sniffed && !(type === "image/jpg" && sniffed === "image/jpeg")) {
    throw new ApiError(415, "unsupported_media_type", `The file is ${sniffed} but was declared as ${type}.`);
  }
  return sniffed;
}

/** Decodes base64 (optionally a data: URL) with a size check before allocating. */
export function decodeBase64Image(input: string): Uint8Array<ArrayBuffer> {
  const b64 = input.replace(/^data:[^;,]+;base64,/, "").replace(/\s+/g, "");
  if (b64.length > Math.ceil((MAX_MEDIA_BYTES * 4) / 3) + 4) throw new ApiError(413, "payload_too_large", "Images are limited to 10 MB.");
  let bin: string;
  try {
    bin = atob(b64);
  } catch {
    throw badRequest("`data_base64` is not valid base64.");
  }
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function uploadMedia(
  env: Pick<Env, "MEDIA" | "DB" | "CDN_URL">,
  input: { bytes: Uint8Array; contentType: string | null; filename?: string | null },
  actor: string,
): Promise<MediaResult> {
  const type = checkUpload(input.bytes, input.contentType);
  const key = mediaKey(MEDIA_TYPES[type], new Date());
  const name = (input.filename ?? "").replace(/[^\w.\- ]+/g, "").slice(0, 120);
  await env.MEDIA.put(key, input.bytes, {
    httpMetadata: { contentType: type, cacheControl: "public, max-age=31536000, immutable" },
    customMetadata: { uploadedBy: actor, ...(name ? { originalName: name } : {}) },
  });
  await auditStatement(env.DB, actor, "media.upload", key, { type, size: input.bytes.length, name: name || undefined }).run();
  const cdn = (env.CDN_URL || "https://cdn.dewee.sh").replace(/\/+$/, "");
  return { key, url: `${cdn}/${key}`, fallback_url: `/media/${key}`, content_type: type, size: input.bytes.length };
}
