import { describe, expect, it, vi } from "vitest";
import { ackMail, sendLeadMail, TEAM_INBOX, teamMail } from "../src/lib/server/lead-mail";
import { resendFrom } from "../src/lib/server/resend-mailer";
import type { Lead } from "../src/lib/server/leads";

const contact: Lead = { kind: "contact", email: "a@b.co", name: "An <x>", locale: "vi", topic: "sales", message: "Xin chào\n<b>hi</b>" };

describe("lead mail", () => {
  it("team copy goes to the team inbox, replies to the visitor and escapes HTML", () => {
    const m = teamMail(contact, { Email: contact.email, Message: "<b>hi</b>", Empty: undefined }, "staging");
    expect(m.to).toEqual([TEAM_INBOX]);
    expect(m.replyTo).toBe("a@b.co");
    expect(m.subject).toMatch(/^\[staging\] Contact request: An/);
    expect(m.html).toContain("&lt;b&gt;hi&lt;/b&gt;");
    expect(m.text).not.toContain("Empty");
  });

  it("acknowledgement uses the visitor's language", () => {
    const m = ackMail(contact);
    expect(m.to).toEqual(["a@b.co"]);
    expect(m.subject).toContain("Dewee đã nhận");
    expect(m.html).toContain("An &lt;x&gt;");
  });

  it("sends two emails from RESEND_FROM_EMAIL, skips newsletter and missing key", async () => {
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 200 }));
    const env = { RESEND_API_KEY: "k", RESEND_FROM_EMAIL: "dewee <hi@dewee.sh>" };
    await sendLeadMail(env, contact, {}, fetchImpl as unknown as typeof fetch);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(JSON.parse((fetchImpl.mock.calls[0] as unknown as [string, RequestInit])[1].body as string).from).toBe("dewee <hi@dewee.sh>");
    await sendLeadMail(env, { kind: "newsletter", email: "a@b.co", locale: "en" }, {}, fetchImpl as unknown as typeof fetch);
    await sendLeadMail({}, contact, {}, fetchImpl as unknown as typeof fetch);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(resendFrom({})).toBe("dewee <noreply@dewee.sh>");
  });

  it("one failed email does not throw", async () => {
    const fetchImpl = vi.fn(async () => new Response("bad", { status: 422 }));
    await expect(sendLeadMail({ RESEND_API_KEY: "k" }, contact, {}, fetchImpl as unknown as typeof fetch)).resolves.toBeUndefined();
  });
});
