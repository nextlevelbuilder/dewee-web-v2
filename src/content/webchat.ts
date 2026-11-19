/** Copy for the website chat widget (src/components/webchat). */
import { pick, type Bi, type Locale } from "~/i18n/config";

const TITLE: Bi = { en: "dewee advisor", vi: "Tư vấn dewee" };
const SUBTITLE: Bi = { en: "Answers from our docs · a human reads every chat", vi: "Trả lời từ tài liệu · đội ngũ đọc mọi cuộc trò chuyện" };
const GREETING: Bi = {
  en: "Hi! I'm dewee's advisor. Tell me what you want your agents to do and I'll point you to the right docs and plan.",
  vi: "Chào bạn! Mình là trợ lý tư vấn của dewee. Bạn muốn agent làm gì? Mình sẽ chỉ đúng tài liệu và gói phù hợp.",
};
const INTRO: Bi = {
  en: "Answers come from the dewee docs. Please don't share passwords or API keys here.",
  vi: "Câu trả lời dựa trên tài liệu dewee. Vui lòng không gửi mật khẩu hay API key ở đây.",
};
const PLACEHOLDER: Bi = { en: "Ask anything about dewee…", vi: "Hỏi bất cứ điều gì về dewee…" };
const SUGGESTIONS: Bi<string[]> = {
  en: ["How much does dewee cost?", "Can we run it on-premises?", "How is our data kept safe?", "I'd like to talk to sales"],
  vi: ["dewee giá bao nhiêu?", "Có cài on-premises được không?", "Dữ liệu được bảo vệ thế nào?", "Mình muốn nói chuyện với sales"],
};
const LEAD_ACTION: Bi = {
  en: "Send your contact details to the dewee sales team so they can follow up. Only call after the visitor gave an email and agreed to be contacted.",
  vi: "Gửi thông tin liên hệ của khách cho đội sales dewee để liên hệ lại. Chỉ gọi khi khách đã cho email và đồng ý được liên hệ.",
};

export type WebchatStrings = { title: string; subtitle: string; greeting: string; intro: string; placeholder: string; suggestions: string[]; leadAction: string };

export function webchatStrings(locale: Locale): WebchatStrings {
  return {
    title: pick(TITLE, locale), subtitle: pick(SUBTITLE, locale), greeting: pick(GREETING, locale), intro: pick(INTRO, locale),
    placeholder: pick(PLACEHOLDER, locale), suggestions: pick(SUGGESTIONS, locale), leadAction: pick(LEAD_ACTION, locale),
  };
}
