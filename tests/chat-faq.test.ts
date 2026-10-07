import { describe, expect, it } from "vitest";
import { answerFromFaq } from "../src/lib/server/chat-faq";

describe("answerFromFaq", () => {
  it("answers known topics in the visitor's language without asking for an email", () => {
    expect(answerFromFaq("How much does dewee cost?", "en")).toMatchObject({ askEmail: false, text: expect.stringContaining("$500/year") });
    expect(answerFromFaq("Có cài on-premises được không?", "vi")).toMatchObject({ askEmail: false, text: expect.stringContaining("VPS hoặc Mac mini") });
    expect(answerFromFaq("Can I self-host dewee with Docker?", "en")).toMatchObject({ askEmail: false, text: expect.stringContaining("https://dewee.sh/install") });
    expect(answerFromFaq("Làm sao để tự cài dewee?", "vi")).toMatchObject({ askEmail: false, text: expect.stringContaining("https://dewee.sh/vi/install") });
  });

  it("hands a request for a person, or an unknown question, to the team and asks for an email", () => {
    expect(answerFromFaq("Can I talk to sales about pricing?", "en")).toMatchObject({ askEmail: true, text: expect.stringContaining("Leave your email") });
    expect(answerFromFaq("Is there a free trial?", "vi")).toMatchObject({ askEmail: true, text: expect.stringContaining("để lại email") });
  });

  it("stops asking once the visitor has left an email", () => {
    for (const [text, locale] of [["I'd like to talk to a human", "en"], ["Mình muốn nói chuyện với người thật", "vi"], ["Is there a free trial?", "en"]] as const) {
      const answer = answerFromFaq(text, locale, true);
      expect(answer.askEmail, text).toBe(false);
      expect(answer.text, text).toMatch(/We have your email|đã có email/);
    }
  });
});

describe("answerFromFaq small talk", () => {
  it("greets back instead of handing off", () => {
    for (const text of ["hi", "Hello!", "xin chào", "cảm ơn"]) {
      expect(answerFromFaq(text, "en").askEmail).toBe(false);
    }
    expect(answerFromFaq("hi, I need a human", "en").askEmail).toBe(true);
  });
});

describe("answerFromFaq handoff flag (offline mode)", () => {
  it("flags a request for a person so the room pings the team, and nothing else", () => {
    expect(answerFromFaq("Can I talk to someone from sales?", "en").handoff).toBe(true);
    expect(answerFromFaq("Mình muốn gặp nhân viên tư vấn", "vi").handoff).toBe(true);
    expect(answerFromFaq("How much does dewee cost?", "en").handoff).toBe(false);
    expect(answerFromFaq("hello", "en").handoff).toBe(false);
  });
});
