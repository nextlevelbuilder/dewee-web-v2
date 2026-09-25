/**
 * /contact copy, plus the form copy every lead form on the site shares (LEAD_FORM_UI).
 * Channels come from src/content/site.ts; plan options come from src/content/plans.ts, so the
 * Vietnamese form only offers On-Premises.
 */
import type { Bi } from "~/i18n/config";
import { plansFor } from "~/content/plans";
import type { LeadFormCopy, LeadFormUi, LeadOption } from "~/components/blocks/company/lead-form-types";

export const LEAD_FORM_UI: Bi<LeadFormUi> = {
  en: {
    busy: "Sending…",
    optional: "optional",
    honeypot: "Leave this field empty",
    privacy: { text: "We only use your details to reply to you.", link: "Privacy policy" },
    failure: { title: "That didn't go through.", body: "Please check the fields and try again, or email us at hi@nextlevelbuilder.io." },
    errors: {
      invalid: "Some fields need another look. Please check your email address and message.",
      rate_limited: "That's a lot of messages in a short time. Please wait a few minutes and try again.",
      payload_too_large: "That message is too long. Please shorten it and send it again.",
      server_error: "Something broke on our side. Please try again, or email hi@nextlevelbuilder.io.",
      network: "We couldn't reach the server. Check your connection and try again.",
    },
  },
  vi: {
    busy: "Đang gửi…",
    optional: "không bắt buộc",
    honeypot: "Để trống ô này",
    privacy: { text: "Chúng tôi chỉ dùng thông tin này để trả lời bạn.", link: "Chính sách quyền riêng tư" },
    failure: { title: "Chưa gửi được.", body: "Bạn kiểm tra lại các ô rồi thử lần nữa, hoặc email cho chúng tôi tại hi@nextlevelbuilder.io." },
    errors: {
      invalid: "Vài ô cần xem lại. Bạn kiểm tra giúp địa chỉ email và nội dung tin nhắn nhé.",
      rate_limited: "Bạn vừa gửi khá nhiều tin trong thời gian ngắn. Đợi vài phút rồi thử lại nhé.",
      payload_too_large: "Tin nhắn hơi dài. Bạn rút gọn rồi gửi lại nhé.",
      server_error: "Hệ thống bên mình đang trục trặc. Bạn thử lại, hoặc email hi@nextlevelbuilder.io nhé.",
      network: "Không kết nối được máy chủ. Bạn kiểm tra mạng rồi thử lại nhé.",
    },
  },
};

type ContactPage = {
  meta: { title: string; description: string; crumb: string };
  hero: { eyebrow: string; title: string; lede: string; note: string };
  form: { eyebrow: string; title: string; lede: string } & LeadFormCopy;
  channels: {
    title: string;
    email: { label: string; desc: string };
    discord: { label: string; desc: string };
    facebook: { label: string; desc: string };
    chat: { label: string; desc: string };
  };
  next: { eyebrow: string; title: string; label: string; highlightNote: string; items: { title: string; body: string }[] };
  more: { title: string; links: { label: string; href: string }[] };
};

const planOptions = (locale: "en" | "vi", notSure: string): LeadOption[] => [
  { value: "", label: notSure },
  ...plansFor(locale).map((p) => ({ value: p.id, label: p.name[locale] })),
];

export const CONTACT: Bi<ContactPage> = {
  en: {
    meta: {
      crumb: "Contact",
      title: "Contact dewee: talk to a human",
      description:
        "Talk to the dewee team about AI agents for your business: pricing, integrations, use cases, partnerships or press. Write to us, or chat with dewee right away.",
    },
    hero: {
      eyebrow: "Contact",
      title: "Talk to *a human*.",
      lede: "Tell us what you'd like your agents to do. A real person on our team reads every message and writes back.",
      note: "dewee is on the headset today",
    },
    form: {
      eyebrow: "Write to us",
      title: "Tell us *what you need*.",
      lede: "A few lines are enough. The more we know about your team and your chat apps, the more useful our first reply will be.",
      fields: [
        { name: "name", label: "Your name", type: "text", required: true, autocomplete: "name" },
        { name: "email", label: "Work email", type: "email", required: true, autocomplete: "email", placeholder: "you@company.com" },
        { name: "company", label: "Company", type: "text", autocomplete: "organization", maxlength: 160 },
        {
          name: "teamSize",
          label: "Team size",
          type: "select",
          options: [
            { value: "", label: "Choose one" },
            { value: "1-10", label: "1–10 people" },
            { value: "11-50", label: "11–50 people" },
            { value: "51-200", label: "51–200 people" },
            { value: "201-1000", label: "201–1,000 people" },
            { value: "1000+", label: "More than 1,000" },
          ],
        },
        {
          name: "topic",
          label: "What is it about?",
          type: "select",
          required: true,
          query: "topic",
          value: "sales",
          options: [
            { value: "sales", label: "Buying dewee" },
            { value: "integration", label: "An integration" },
            { value: "use-case", label: "A use case" },
            { value: "partner", label: "Partnership" },
            { value: "press", label: "Press" },
            { value: "other", label: "Something else" },
          ],
        },
        { name: "plan", label: "Deployment you're considering", type: "select", query: "plan", options: planOptions("en", "Not sure yet") },
        {
          name: "message",
          label: "Message",
          type: "textarea",
          required: true,
          rows: 6,
          placeholder: "What should your agents do? Which chat apps does your team use? Anything else we should know?",
        },
      ],
      submit: "Send message",
      success: {
        title: "Message received.",
        body: "Thank you. A person on our team will read it and reply to your email.",
        again: "Send another message",
      },
    },
    channels: {
      title: "Or reach us directly",
      email: { label: "Email", desc: "For anything, big or small" },
      discord: { label: "Discord", desc: "The NextLevelBuilder community" },
      facebook: { label: "Facebook", desc: "News and community posts, in Vietnamese" },
      chat: { label: "Chat with dewee now", desc: "Right here on this page, no sign-up." },
    },
    next: {
      eyebrow: "What happens next",
      title: "No sales maze. *Just three steps*.",
      label: "Step",
      highlightNote: "this part is on us",
      items: [
        { title: "We read it", body: "Your message goes straight to our team, and a person reads it." },
        { title: "We reply", body: "You get an answer by email: a question or two, a quote, or a time to talk." },
        { title: "We build it with you", body: "If dewee is the right fit, we scope your workflows together and get you running." },
      ],
    },
    more: {
      title: "Prefer to read first?",
      links: [
        { label: "Pricing", href: "/pricing" },
        { label: "Use cases", href: "/use-cases" },
        { label: "Security", href: "/security" },
      ],
    },
  },
  vi: {
    meta: {
      crumb: "Liên hệ",
      title: "Liên hệ dewee: nói chuyện với người thật",
      description:
        "Trao đổi với đội ngũ dewee về AI agent cho doanh nghiệp: báo giá, tích hợp, bài toán cụ thể, hợp tác hay báo chí. Gửi lời nhắn, hoặc chat ngay với dewee.",
    },
    hero: {
      eyebrow: "Liên hệ",
      title: "Nói chuyện với *người thật*.",
      lede: "Kể chúng tôi nghe bạn muốn agent làm gì. Tin nhắn nào cũng có người trong đội đọc và trả lời.",
      note: "hôm nay dewee trực tổng đài",
    },
    form: {
      eyebrow: "Gửi lời nhắn",
      title: "Kể chúng tôi nghe *bạn cần gì*.",
      lede: "Vài dòng là đủ. Bạn kể càng rõ về đội ngũ và các ứng dụng chat đang dùng, câu trả lời đầu tiên của chúng tôi càng sát.",
      fields: [
        { name: "name", label: "Họ và tên", type: "text", required: true, autocomplete: "name" },
        { name: "email", label: "Email công việc", type: "email", required: true, autocomplete: "email", placeholder: "ban@congty.vn" },
        { name: "company", label: "Công ty", type: "text", autocomplete: "organization", maxlength: 160 },
        {
          name: "teamSize",
          label: "Quy mô đội ngũ",
          type: "select",
          options: [
            { value: "", label: "Chọn quy mô" },
            { value: "1-10", label: "1–10 người" },
            { value: "11-50", label: "11–50 người" },
            { value: "51-200", label: "51–200 người" },
            { value: "201-1000", label: "201–1.000 người" },
            { value: "1000+", label: "Hơn 1.000 người" },
          ],
        },
        {
          name: "topic",
          label: "Bạn cần trao đổi về",
          type: "select",
          required: true,
          query: "topic",
          value: "sales",
          options: [
            { value: "sales", label: "Mua dewee" },
            { value: "integration", label: "Tích hợp" },
            { value: "use-case", label: "Một bài toán cụ thể" },
            { value: "partner", label: "Hợp tác đối tác" },
            { value: "press", label: "Báo chí" },
            { value: "other", label: "Việc khác" },
          ],
        },
        { name: "plan", label: "Hình thức triển khai", type: "select", query: "plan", options: planOptions("vi", "Chưa chắc") },
        {
          name: "message",
          label: "Tin nhắn",
          type: "textarea",
          required: true,
          rows: 6,
          placeholder: "Bạn muốn agent làm gì? Đội bạn đang dùng ứng dụng chat nào? Còn điều gì chúng tôi nên biết?",
        },
      ],
      submit: "Gửi tin nhắn",
      success: {
        title: "Đã nhận tin nhắn.",
        body: "Cảm ơn bạn. Một người trong đội sẽ đọc và trả lời qua email của bạn.",
        again: "Gửi tin nhắn khác",
      },
    },
    channels: {
      title: "Hoặc liên hệ trực tiếp",
      email: { label: "Email", desc: "Việc lớn việc nhỏ đều được" },
      discord: { label: "Discord", desc: "Cộng đồng NextLevelBuilder" },
      facebook: { label: "Facebook", desc: "Tin tức và cộng đồng" },
      chat: { label: "Chat với dewee ngay", desc: "Ngay trên trang này, không cần đăng ký." },
    },
    next: {
      eyebrow: "Sau khi bạn gửi",
      title: "Không vòng vo. *Chỉ ba bước*.",
      label: "Bước",
      highlightNote: "phần này để chúng tôi lo",
      items: [
        { title: "Chúng tôi đọc", body: "Tin nhắn đến thẳng đội ngũ, và có người thật đọc nó." },
        { title: "Chúng tôi trả lời", body: "Bạn nhận phản hồi qua email: vài câu hỏi thêm, một báo giá, hoặc hẹn giờ trao đổi." },
        { title: "Cùng bạn triển khai", body: "Nếu dewee phù hợp, chúng tôi cùng bạn xác định workflow và đưa hệ thống vào chạy." },
      ],
    },
    more: {
      title: "Muốn tìm hiểu trước?",
      links: [
        { label: "Bảng giá", href: "/pricing" },
        { label: "Ứng dụng", href: "/use-cases" },
        { label: "Bảo mật", href: "/security" },
      ],
    },
  },
};
