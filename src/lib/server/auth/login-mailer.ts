/**
 * Delivers sign-in codes. Uses the Resend HTTP API when RESEND_API_KEY is set; outside production
 * it falls back to printing the code in the worker console for local development. In production
 * without Resend, email sign-in is reported as unavailable and nothing is sent or logged.
 */
import type { PlatformEnv } from "../api/platform-env";
import { sendResendEmail } from "../resend-mailer";

export function emailLoginAvailable(env: PlatformEnv): boolean {
  return Boolean(env.RESEND_API_KEY) || env.ENVIRONMENT !== "production";
}

export async function sendLoginCode(env: PlatformEnv, email: string, code: string): Promise<void> {
  if (!env.RESEND_API_KEY) {
    if (env.ENVIRONMENT === "production") throw new Error("email sign-in is not configured");
    console.log(`[dev] dewee admin sign-in code for ${email}: ${code} (valid 10 minutes)`);
    return;
  }
  const text = [
    `Your dewee admin sign-in code is ${code}.`,
    "",
    "It is valid for 10 minutes. If you did not ask for it, you can ignore this email.",
    "",
    "dewee.sh",
  ].join("\n");
  const html = `<p>Your dewee admin sign-in code is</p><p style="font:600 28px/1.2 ui-monospace,monospace;letter-spacing:6px">${code}</p><p>It is valid for 10 minutes. If you did not ask for it, you can ignore this email.</p><p>dewee.sh</p>`;
  await sendResendEmail(env, { to: [email], subject: `dewee sign-in code: ${code}`, text, html });
}
