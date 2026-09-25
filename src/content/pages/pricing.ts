/**
 * /pricing copy. Prices and per-plan facts live in src/content/plans.ts; this file holds the
 * page's words around them. The VI locale offers Self-install and On-Premises and never names
 * AaaS or TOSE. Early Access numbers live in src/content/early-access.ts, not here.
 * Sources: the founders' deployment diagram, dewee docs/commercial-runtime-control-plane.md,
 * docs/runbooks/license-activation-and-revocation.md (heartbeat: activation id + runtime token,
 * every 5 minutes, never the raw key) and cmd/root.go (`--server`, `--token` flags).
 */
import type { Bi } from "~/i18n/config";

type Faq = { q: string; a: string };

export type PricingPage = {
  meta: { title: string; description: string; crumb: string };
  hero: { eyebrow: string; title: string; lede: string; note: string; primary: string; secondary: string };
  plans: { eyebrow: string; title: string; lede: string; includes: string; tradeoffs: string; badge: string };
  compare: { eyebrow: string; title: string; lede: string; note: string; caption: string; corner: string };
  topology: {
    eyebrow: string;
    title: string;
    lede: string;
    label: string;
    runtime: { title: string; where: string; chips: string[]; command: string; commandNote: string };
    wire: string;
    control: { title: string; where: string; billing: string; guard: string; off: string; on: string };
    licence: { title: string; body: string };
    cli: { label: string; command: string };
    note: string;
  };
  refunds: { eyebrow: string; title: string; lede: string; items: { label: string; text: string }[]; link: string };
  faq: { eyebrow: string; title: string; items: Faq[] };
  cta: { title: string; body: string; primary: string; secondary: string; note: string };
};

export const PRICING: Bi<PricingPage> = {
  en: {
    meta: {
      title: "Pricing: Self-install, AaaS, TOSE and On-Premises",
      description: "dewee pricing, plainly: install it yourself for free, AaaS at $500 a year, a dedicated runtime on TOSE.sh, or On-Premises from $5K. Compare isolation and data.",
      crumb: "Pricing",
    },
    hero: {
      eyebrow: "Pricing & deployment",
      title: "Pick where dewee *lives*.",
      lede: "Your own machine, our shared cloud, your own runtime on TOSE.sh, or your hardware set up by us. Same product, same care. Every price is on this page, in US dollars.",
      note: "prices in ink, not pencil",
      primary: "Compare side by side",
      secondary: "Talk to us",
    },
    plans: {
      eyebrow: "The plans",
      title: "Start in the cloud, or *on your own hardware*.",
      lede: "All four run the same dewee runtime and control plane. What changes is where it runs, who looks after it and how isolated it is.",
      includes: "What you get",
      tradeoffs: "Keep in mind",
      badge: "Our pick",
    },
    compare: {
      eyebrow: "Side by side",
      title: "The honest *comparison*.",
      lede: "What each option is good at, and what it asks of you beyond the price tag.",
      note: "we'd rather you pick right than pick big",
      caption: "dewee deployment options compared",
      corner: "Compare",
    },
    topology: {
      eyebrow: "Under the hood",
      title: "How a dedicated deployment *connects*.",
      lede: "On TOSE.sh or on your own machine, the shape is the same: your runtime gateway talks to your own control plane over an API and a WebSocket. Billing is switched off, and a licence key guards the door.",
      label: "Diagram: the dewee runtime gateway connects to your Customer Control Plane over an API and a WebSocket. Billing is off, a licence-key guard is on, and the runtime checks in with the dewee licence server.",
      runtime: {
        title: "Runtime gateway",
        where: "On TOSE.sh, your VPS or a Mac mini",
        chips: ["Agents", "Channels", "Your packages"],
        command: "dewee",
        commandNote: "one binary, started with a gateway token",
      },
      wire: "API · WebSocket",
      control: {
        title: "Customer Control Plane",
        where: "Your own control panel",
        billing: "Billing",
        guard: "Licence-key guard",
        off: "off",
        on: "on",
      },
      licence: {
        title: "Licence check-in",
        body: "Every 5 minutes the runtime sends our licence server an activation ID and a runtime token. Never the raw key, and never your chats or files.",
      },
      cli: {
        label: "Run it from your laptop",
        command: "dewee agent list --server=https://congtya.tose.sh --token=XXX",
      },
      note: "“congtya” is Vietnamese for “company A”",
    },
    refunds: {
      eyebrow: "Refunds",
      title: "If it is not right, *say so*.",
      lede: "The short version of our refund policy. The full text has the details.",
      items: [
        { label: "Self-install", text: "Installing is free, so you can try dewee on your own machine before you buy a licence." },
        { label: "AaaS", text: "Full refund within 14 days of purchase. No questions asked." },
        { label: "Dedicated on TOSE", text: "The $99 deposit becomes TOSE credit for your runtime. What can be refunded depends on what has been provisioned and used; see your order form." },
        { label: "On-Premises", text: "Set out in your quote and contract before any work starts." },
      ],
      link: "Read the full refund policy",
    },
    faq: {
      eyebrow: "Money questions",
      title: "Asked before *every* purchase.",
      items: [
        { q: "Is there a free trial?", a: "There is no trial, but Self-install is free: install dewee on your own machine and build agents without a licence. You need the $500-a-year licence only to connect chat channels. AaaS comes with a 14-day refund instead: email us within 14 days of purchase and we refund you in full." },
        { q: "Do the prices include AI model costs?", a: "No. You bring your own keys for Anthropic, OpenAI, Gemini or any of the 20+ supported providers and pay them directly, so there is no markup on your tokens." },
        { q: "What is the $99 TOSE deposit for?", a: "It is your first TOSE.sh credit. We collect it with your licence and pass it on to TOSE, where it pays for the servers your dedicated runtime runs on. When it runs low, TOSE emails you and you top up directly with them." },
        { q: "What does the On-Premises price include?", a: "Installing dewee on your VPS or Mac mini, 5 custom workflows built with your team, the $500 licence for the first year, and a year of maintenance and updates. Prices start at $5K; your quote depends on the work involved." },
        { q: "Do we need a licence key?", a: "Dedicated and On-Premises need one: the key activates your runtime, which then checks in with our licence server every 5 minutes using an activation ID and a runtime token, never the raw key. Self-install needs one only to connect chat channels; you paste it into the dashboard. AaaS needs no key." },
        { q: "What happens after the first year?", a: "Licences are annual, at $500 a year. For On-Premises, maintenance after the first year is agreed in your contract." },
        { q: "What is offered in Vietnam?", a: "Self-install and On-Premises, because we want company data in Vietnam to stay inside the company. Install dewee on your own machine yourself, or let us set it up on your VPS or Mac mini. AaaS and Dedicated on TOSE are not offered there." },
      ],
    },
    cta: {
      title: "Not sure which one *fits*?",
      body: "Tell us about your team, your data rules and your budget. We will recommend the option that fits, even when it is the cheaper one.",
      primary: "Talk to us",
      secondary: "Ask dewee in the chat",
      note: "a real person reads every message",
    },
  },
  vi: {
    meta: {
      title: "Bảng giá dewee: tự cài đặt hoặc On-Premises",
      description: "Tại Việt Nam, bạn tự cài dewee miễn phí (license $500/năm để kết nối kênh chat) hoặc chọn On-Premises từ $5K: chúng tôi cài đặt và bảo trì năm đầu.",
      crumb: "Bảng giá",
    },
    hero: {
      eyebrow: "Bảng giá & triển khai",
      title: "Dữ liệu ở lại *công ty bạn*.",
      lede: "Tại Việt Nam, dewee luôn chạy trên máy của chính bạn: tự cài đặt miễn phí, hoặc để chúng tôi triển khai On-Premises trên VPS hay Mac mini của công ty. Dữ liệu không rời khỏi công ty.",
      note: "giá viết bằng mực, không phải bút chì",
      primary: "So sánh hai cách",
      secondary: "Nhận báo giá On-Premises",
    },
    plans: {
      eyebrow: "Hai cách triển khai",
      title: "Việc của công ty, *nằm trong công ty*.",
      lede: "Hợp đồng, bảng lương, tin nhắn khách hàng: những thứ đó nên ở yên trên máy của chính bạn. Vì vậy tại Việt Nam, dewee luôn chạy trên hạ tầng của bạn: bạn tự cài, hoặc chúng tôi lo trọn phần cài đặt, quy trình, bảo trì.",
      includes: "Bạn nhận được",
      tradeoffs: "Cần lưu ý",
      badge: "Gợi ý của chúng tôi",
    },
    compare: {
      eyebrow: "So sánh",
      title: "Hai cách, *nói thẳng*.",
      lede: "Không có chữ nhỏ: mỗi cách cho bạn những gì và cần bạn chuẩn bị những gì.",
      note: "đọc kỹ rồi hẵng chọn nha",
      caption: "So sánh hai cách triển khai dewee",
      corner: "Hạng mục",
    },
    topology: {
      eyebrow: "Bên trong",
      title: "Bên trong, dewee *kết nối* ra sao?",
      lede: "Runtime gateway chạy trên máy của bạn và trao đổi với bảng điều khiển (Customer Control Plane) của chính bạn qua API và WebSocket. Không tính phí theo lượt, chỉ có license key đứng canh cửa.",
      label: "Sơ đồ: runtime gateway của dewee kết nối với Customer Control Plane của bạn qua API và WebSocket. Tính phí tắt, khoá license bật, và runtime định kỳ báo về máy chủ license của dewee.",
      runtime: {
        title: "Runtime gateway",
        where: "Trên VPS hoặc Mac mini của bạn",
        chips: ["Agent", "Kênh chat", "Package của bạn"],
        command: "dewee",
        commandNote: "một file chạy duy nhất, khởi động kèm gateway token",
      },
      wire: "API · WebSocket",
      control: {
        title: "Customer Control Plane",
        where: "Bảng điều khiển của riêng bạn",
        billing: "Tính phí",
        guard: "Khoá license",
        off: "tắt",
        on: "bật",
      },
      licence: {
        title: "Kiểm tra license",
        body: "Cứ 5 phút, runtime gửi về máy chủ license của chúng tôi một mã kích hoạt và một runtime token. Không bao giờ gửi license key gốc, càng không gửi tin nhắn hay tài liệu của bạn.",
      },
      cli: {
        label: "Điều khiển ngay từ laptop",
        command: "dewee agent list --server=https://dewee.congtya.vn --token=XXX",
      },
      note: "thay congtya bằng tên miền của bạn",
    },
    refunds: {
      eyebrow: "Thanh toán & hoàn tiền",
      title: "Rõ ràng *từ trước khi bắt đầu*.",
      lede: "Tóm tắt chính sách hoàn tiền. Bản đầy đủ có mọi chi tiết.",
      items: [
        { label: "Tự cài đặt", text: "Cài đặt miễn phí, nên bạn có thể dùng thử dewee trên máy của mình trước khi mua license." },
        { label: "On-Premises", text: "Lịch thanh toán và điều kiện hoàn tiền được ghi rõ trong báo giá và hợp đồng, trước khi chúng tôi bắt tay vào việc." },
      ],
      link: "Đọc chính sách hoàn tiền",
    },
    faq: {
      eyebrow: "Hỏi về giá",
      title: "Hỏi thẳng, *đáp thật*.",
      items: [
        { q: "Tại Việt Nam có những cách triển khai nào?", a: "Hai cách: Tự cài đặt và On-Premises. Cả hai đều giữ dữ liệu của doanh nghiệp trên máy của bạn, nên hợp đồng, tin nhắn khách hàng hay tài liệu nội bộ không phải đi đâu cả. Bạn tự cài dewee miễn phí, hoặc để chúng tôi triển khai trên VPS hay Mac mini của công ty." },
        { q: "Giá On-Premises gồm những gì?", a: "Cài đặt dewee trên VPS hoặc Mac mini của bạn, 5 quy trình tuỳ chỉnh dựng cùng đội ngũ bạn, license $500 cho năm đầu và một năm bảo trì, cập nhật. Giá từ $5K; báo giá cụ thể tuỳ khối lượng công việc." },
        { q: "Cần chuẩn bị máy móc gì?", a: "Với Tự cài đặt: một máy 64-bit chạy macOS 13 trở lên hoặc Linux (glibc), tối thiểu 2 GB RAM. Với On-Premises: một VPS hoặc một Mac mini do công ty bạn quản lý, cấu hình cụ thể được thống nhất cùng bạn khi báo giá." },
        { q: "Giá đã gồm chi phí mô hình AI chưa?", a: "Chưa. Bạn dùng khoá API của chính mình với Anthropic, OpenAI, Gemini hay bất kỳ nhà cung cấp nào trong hơn 20 nhà cung cấp được hỗ trợ, và thanh toán trực tiếp cho họ, không qua trung gian." },
        { q: "Có cần license key không?", a: "Với On-Premises thì có: license key kích hoạt runtime trên máy của bạn, sau đó cứ 5 phút runtime báo về máy chủ license của chúng tôi bằng mã kích hoạt và runtime token, không gửi license key gốc và không gửi dữ liệu của bạn. Với Tự cài đặt, bạn chỉ cần license khi muốn kết nối kênh chat, và dán key vào bảng điều khiển." },
        { q: "Sau năm đầu thì sao?", a: "License được gia hạn hằng năm với giá $500 mỗi năm. Với On-Premises, việc bảo trì từ năm thứ hai được thoả thuận trong hợp đồng." },
        { q: "Thanh toán và hoàn tiền thế nào?", a: "Với On-Premises, lịch thanh toán và điều kiện hoàn tiền được ghi rõ trong báo giá và hợp đồng, trước khi bắt đầu triển khai." },
      ],
    },
    cta: {
      title: "Sẵn sàng đưa dewee *về công ty*?",
      body: "Tự cài dewee ngay hôm nay, hoặc kể cho chúng tôi nghe về đội ngũ, quy trình và hạ tầng hiện có để nhận báo giá On-Premises rõ ràng, từng hạng mục.",
      primary: "Nhận báo giá On-Premises",
      secondary: "Hỏi dewee qua chat",
      note: "chúng tôi đọc từng tin nhắn",
    },
  },
};
