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
