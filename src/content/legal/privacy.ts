/**
 * /privacy: Privacy Policy. Data facts are taken from this codebase: leads and chat summaries in
 * Cloudflare D1 (migrations/0001_init.sql), chat transcripts in a Durable Object per
 * conversation (src/lib/server/chat-room.ts), optional Discord team notifications
 * (src/lib/server/notify.ts), self-hosted fonts (astro.config.mjs). Security facts come from the
 * dewee product (AES-256-GCM secrets at rest, SHA-256 hashed API keys). Retention periods are not
 * decided yet, so only the criteria are stated. The VI version is On-Premises only.
 */
import type { Bi } from "~/i18n/config";
import type { LegalDoc } from "./types";
import { LEGAL_EMAIL } from "./legal-ui";

const mail = `[${LEGAL_EMAIL}](mailto:${LEGAL_EMAIL})`;

export const PRIVACY: Bi<LegalDoc> = {
  en: {
    meta: {
      title: "Privacy Policy",
      description: "What personal data dewee collects on its website, chat and product, why, where it is stored, who helps us process it, how long we keep it and your rights.",
      crumb: "Privacy",
    },
    hero: {
      eyebrow: "Legal · Privacy",
      title: "Your data, *explained*.",
      lede: "What we collect, why we need it, where it lives and how you stay in control. No ads, no trackers, and we would rather collect too little than too much.",
    },
    sections: [
      {
        id: "who-we-are",
        title: "Who is responsible",
        short: "NextLevelBuilder, the team behind dewee, is responsible for the data on this website. Inside your own workspace, your organisation is in charge of its data.",
        body: [
          "NextLevelBuilder (“we”, “us”) is the controller of the personal data we collect through dewee.sh, the website chat, our sales conversations and our customer relationship with you. You can reach us about privacy at " + mail + ".",
          "When your organisation uses dewee, it decides what data goes into its workspace. For that content your organisation is the controller, and, on our shared SaaS cloud, we process it on its behalf. In a Dedicated runtime the data lives in your own runtime on TOSE.sh. With On-Premises it stays on your own machines and we do not receive it.",
        ],
      },
      {
        id: "what-we-collect",
        title: "What we collect",
        short: "What you type into our forms and chat, basic account and licence details if you are a customer, and the technical data every website needs to work safely.",
        body: [
          {
            table: {
              head: ["What", "Examples", "Where it comes from"],
              rows: [
                ["Enquiries", "Name, email, company, your message, your language and the page you came from", "Contact and quote forms you fill in"],
                ["Website chat", "The messages you type, a random chat ID, your language, and your email if you choose to leave it", "The chat on this website"],
                ["Customer details", "Account email, workspace members and roles, order and billing records", "You, when you buy and use dewee"],
                ["Workspace content", "Prompts, files, agent settings and conversations, plus AI provider keys (stored encrypted)", "You and your team, inside dewee"],
                ["Licence check-ins", "An activation ID, a runtime token and the time of each check-in; never the raw key and never your content", "Dedicated and On-Premises runtimes"],
                ["Technical data", "IP address, browser type and request logs", "Your browser, via our hosting provider Cloudflare"],
              ],
            },
          },
          "We do not use advertising or analytics trackers, we do not sell personal data, and we do not use it for advertising. The fonts on this site are served from our own domain, so loading a page does not send your IP address to a font service.",
        ],
      },
      {
        id: "how-we-use",
        title: "How we use it, and on what legal basis",
        short: "To answer you, to run dewee for customers, to keep things secure and to meet our legal duties. Nothing else.",
        body: [
          {
            table: {
              head: ["Purpose", "Data used", "Legal basis (GDPR)"],
              rows: [
                ["Reply to your enquiry and prepare a quote", "Enquiries, website chat", "Steps you asked for before a contract; our legitimate interest in answering you"],
                ["Provide, support and bill dewee", "Customer details, workspace content", "Performance of our contract with you"],
                ["Check that licences are valid", "Licence check-ins", "Performance of our contract"],
                ["Alert our team to new messages", "Your first chat message; your email and the latest chat lines when you leave an email", "Legitimate interest in replying quickly"],
                ["Keep the site and product secure and prevent abuse", "Technical data, chat ID, rate-limit counters", "Legitimate interest in security"],
                ["Keep accounting and legal records", "Order and billing records", "Legal obligation"],
              ],
            },
          },
          "Where we rely on legitimate interests, you can object at any time; see [your rights](/gdpr#rights).",
        ],
      },
      {
        id: "where-stored",
        title: "Where it is stored, and who helps us",
        short: "The website, forms and chat run on Cloudflare. Our team gets chat alerts in Discord. Customer runtimes live where your plan puts them.",
        body: [
          {
            defs: [
              ["Cloudflare", "Hosts this website. Enquiries, chat summaries and admin sign-in sessions are stored in Cloudflare’s databases (D1 and KV), and each chat transcript in its own Cloudflare Durable Object."],
              ["Discord", "When you start a chat, our team receives your first message in a private Discord channel. If you leave your email, we also receive it with the latest lines of the conversation."],
              ["dewee support agent", "Your chat messages, with the recent conversation, may be passed to dewee’s own support agent or to a person on our team so they can reply."],
              ["Your AI providers", "When your agents call a model, your content goes to the provider you configured, with your own API key."],
              ["Your runtime", "SaaS runtimes run on shared servers we operate. Dedicated runtimes run on TOSE.sh. On-Premises runtimes run on your own machines."],
            ],
          },
          "The full list of the companies that process personal data for us is on our [GDPR page](/gdpr#sub-processors).",
        ],
      },
      {
        id: "transfers",
        title: "International transfers",
        short: "Some of our providers work outside your country. Where the law requires it, we rely on approved safeguards.",
        body: [
          "Cloudflare runs a global network, and Discord is based in the United States, so your data may be processed outside the country where you live. Where personal data leaves the European Economic Area or the UK, we rely on the safeguards the law provides, such as the European Commission’s Standard Contractual Clauses offered by our providers.",
        ],
      },
      {
        id: "retention",
        title: "How long we keep it",
        short: "Only as long as we need it for the reason we collected it, or as long as the law requires. Ask us and we will delete it sooner where we can.",
        body: [
          {
            list: [
              "Enquiries and chat conversations: while we are talking with you, and for a reasonable time afterwards in case you come back to us.",
              "Customer details: for as long as you are a customer, and afterwards for as long as accounting and tax law requires.",
              "Workspace content: for as long as your workspace exists, unless you delete it sooner.",
              "Technical logs: for a short period, for security and troubleshooting.",
            ],
          },
          "You can ask us to delete your enquiry or chat at any time by writing to " + mail + ".",
        ],
      },
      {
        id: "your-rights",
        title: "Your rights",
        short: "You can see, correct, delete, restrict, move or object to the use of your data, and complain to a regulator. Email us to start.",
        body: [
          "Depending on where you live, you have the right to access your personal data, correct it, have it deleted, restrict or object to how we use it, receive it in a portable format, and withdraw consent you have given. You can also complain to your data protection authority.",
          "Email " + mail + " to use any of these rights. Our [GDPR page](/gdpr) explains each right and how we handle requests.",
        ],
      },
      {
        id: "security",
        title: "How we protect it",
        short: "Encryption for secrets, hashed API keys, strict separation between customers and access by role. No system is perfect, so we also plan for the worst.",
        body: [
          {
            list: [
              "AI provider keys, MCP keys, tool environment variables, CLI credentials and OAuth tokens are encrypted at rest with AES-256-GCM.",
              "API keys are stored only as SHA-256 hashes.",
              "Workspaces are isolated from each other, and role-based access control limits who can see and change what.",
              "Agent actions are traced, and sensitive actions can require human approval.",
              "Traffic to this website is encrypted in transit.",
            ],
          },
          "No online service is perfectly secure. If a breach affects your personal data, we will tell you and the authorities as the law requires.",
        ],
      },
      {
        id: "children",
        title: "Children",
        short: "dewee is a tool for businesses, not for children.",
        body: [
          "dewee and this website are not directed at children under 16, and we do not knowingly collect their personal data. If you believe a child has sent us personal data, write to " + mail + " and we will delete it.",
        ],
      },
      {
        id: "changes",
        title: "Changes to this policy",
        short: "When this policy changes, the date at the top changes too.",
        body: [
          "We will update this policy when the way we handle data changes. The date at the top of this page shows the current version. If a change is significant, we will also tell customers directly. Questions: " + mail + ".",
        ],
      },
    ],
  },
  vi: {
    meta: {
      title: "Chính sách quyền riêng tư",
      description: "dewee thu thập dữ liệu cá nhân nào trên website, khung chat và khi triển khai On-Premises, vì sao, lưu ở đâu, ai cùng xử lý, giữ bao lâu và quyền của bạn.",
      crumb: "Quyền riêng tư",
    },
    hero: {
      eyebrow: "Pháp lý · Quyền riêng tư",
      title: "Dữ liệu của bạn, *nói rõ*.",
      lede: "Chúng tôi thu thập gì, vì sao cần, lưu ở đâu và bạn kiểm soát nó như thế nào. Không quảng cáo, không theo dõi, và thà thu thập ít còn hơn thu thập thừa.",
    },
    sections: [
      {
        id: "who-we-are",
        title: "Ai chịu trách nhiệm",
        short: "NextLevelBuilder, đội ngũ làm ra dewee, chịu trách nhiệm về dữ liệu trên website này. Dữ liệu trong hệ thống On-Premises nằm trên máy và thuộc quyền quản lý của công ty bạn.",
        body: [
          "NextLevelBuilder (“chúng tôi”) là bên kiểm soát dữ liệu cá nhân thu thập qua website dewee.sh, khung chat trên website, quá trình tư vấn và quan hệ khách hàng với bạn. Mọi câu hỏi về quyền riêng tư, xin gửi về " + mail + ".",
          "Với dewee On-Premises, công ty bạn quyết định dữ liệu nào được đưa vào hệ thống và là bên kiểm soát dữ liệu đó. Dữ liệu nằm trên máy của bạn và chúng tôi không nhận được. Chúng tôi chỉ tiếp cận khi bạn cấp quyền để cài đặt hoặc bảo trì, và chỉ cho đúng mục đích đó.",
        ],
      },
      {
        id: "what-we-collect",
        title: "Chúng tôi thu thập gì",
        short: "Những gì bạn nhập vào biểu mẫu và khung chat, thông tin khách hàng và license khi bạn dùng dewee, cùng dữ liệu kỹ thuật mà website nào cũng cần để chạy an toàn.",
        body: [
          {
            table: {
              head: ["Loại dữ liệu", "Ví dụ", "Nguồn"],
              rows: [
                ["Yêu cầu tư vấn", "Họ tên, email, công ty, nội dung tin nhắn, ngôn ngữ và trang bạn truy cập trước đó", "Biểu mẫu liên hệ và báo giá bạn điền"],
                ["Chat trên website", "Tin nhắn bạn gõ, một mã chat ngẫu nhiên, ngôn ngữ, và email nếu bạn chọn để lại", "Khung chat trên website"],
                ["Thông tin khách hàng", "Email liên hệ, thành viên và vai trò, đơn hàng và chứng từ thanh toán", "Bạn cung cấp khi mua và sử dụng dewee"],
                ["Kiểm tra license", "Mã kích hoạt, runtime token và thời điểm mỗi lần kiểm tra; không bao giờ có license key gốc hay nội dung của bạn", "Runtime On-Premises"],
                ["Dữ liệu kỹ thuật", "Địa chỉ IP, loại trình duyệt và nhật ký truy cập", "Trình duyệt của bạn, qua nhà cung cấp hạ tầng Cloudflare"],
              ],
            },
          },
          "Chúng tôi không dùng công cụ quảng cáo hay theo dõi, không bán dữ liệu cá nhân và không dùng dữ liệu đó để quảng cáo. Phông chữ trên website được tải từ chính tên miền của chúng tôi, nên việc mở trang không gửi địa chỉ IP của bạn tới dịch vụ phông chữ nào.",
        ],
      },
      {
        id: "how-we-use",
        title: "Chúng tôi dùng dữ liệu vào việc gì",
        short: "Để trả lời bạn, triển khai và hỗ trợ dewee, giữ an toàn hệ thống và thực hiện nghĩa vụ pháp lý. Ngoài ra không dùng vào việc gì khác.",
        body: [
          {
            table: {
              head: ["Mục đích", "Dữ liệu sử dụng", "Vì sao cần"],
              rows: [
                ["Trả lời yêu cầu và chuẩn bị báo giá", "Yêu cầu tư vấn, chat trên website", "Bạn yêu cầu chúng tôi liên hệ"],
                ["Triển khai, hỗ trợ và thu phí dewee", "Thông tin khách hàng", "Để thực hiện hợp đồng với bạn"],
                ["Kiểm tra license còn hiệu lực", "Dữ liệu kiểm tra license", "Để thực hiện hợp đồng"],
                ["Báo cho đội ngũ khi có tin nhắn mới", "Tin nhắn chat đầu tiên; email và các dòng chat gần nhất khi bạn để lại email", "Để trả lời kịp thời khi bạn chủ động nhắn tin"],
                ["Bảo vệ website và ngăn lạm dụng", "Dữ liệu kỹ thuật, mã chat, bộ đếm giới hạn tin nhắn", "Để bảo vệ hệ thống và người dùng"],
                ["Lưu chứng từ kế toán và pháp lý", "Đơn hàng và chứng từ thanh toán", "Pháp luật yêu cầu"],
              ],
            },
          },
          "Khi pháp luật yêu cầu sự đồng ý của bạn, chúng tôi sẽ xin trước, và bạn có thể rút lại sự đồng ý bất cứ lúc nào. Xem thêm mục [quyền của bạn](/vi/gdpr#rights).",
        ],
      },
      {
        id: "where-stored",
        title: "Dữ liệu được lưu ở đâu, ai hỗ trợ chúng tôi",
        short: "Website, biểu mẫu và khung chat chạy trên Cloudflare. Đội ngũ nhận thông báo chat qua Discord. Hệ thống On-Premises nằm trên máy của bạn.",
        body: [
          {
            defs: [
              ["Cloudflare", "Vận hành website này. Yêu cầu tư vấn, tóm tắt các cuộc chat và phiên đăng nhập quản trị được lưu trong cơ sở dữ liệu của Cloudflare (D1 và KV); nội dung từng cuộc chat lưu trong một Cloudflare Durable Object riêng."],
              ["Discord", "Khi bạn bắt đầu chat, đội ngũ nhận tin nhắn đầu tiên trong một kênh Discord nội bộ. Nếu bạn để lại email, chúng tôi nhận email đó kèm các dòng chat gần nhất."],
              ["Trợ lý hỗ trợ dewee", "Tin nhắn của bạn, kèm phần hội thoại gần đây, có thể được chuyển tới trợ lý hỗ trợ của chính dewee hoặc một thành viên trong đội để trả lời."],
              ["Nhà cung cấp AI của bạn", "Khi agent gọi mô hình, nội dung được gửi tới nhà cung cấp bạn đã cấu hình, bằng API key của chính bạn."],
              ["Máy của bạn", "Runtime và control plane On-Premises chạy trên VPS hoặc Mac mini của bạn. Dữ liệu vận hành nằm ở đó."],
            ],
          },
          "Danh sách đầy đủ các đơn vị xử lý dữ liệu cá nhân cho chúng tôi có trên [trang GDPR](/vi/gdpr#sub-processors).",
        ],
      },
      {
        id: "transfers",
        title: "Chuyển dữ liệu ra nước ngoài",
        short: "Một số nhà cung cấp của chúng tôi hoạt động ở nước ngoài. Khi pháp luật yêu cầu, chúng tôi áp dụng các biện pháp bảo vệ phù hợp.",
        body: [
          "Cloudflare vận hành mạng lưới toàn cầu và Discord có trụ sở tại Hoa Kỳ, nên dữ liệu từ website và khung chat có thể được xử lý ngoài Việt Nam. Chúng tôi thực hiện các thủ tục và biện pháp bảo vệ mà pháp luật về bảo vệ dữ liệu cá nhân yêu cầu đối với việc chuyển dữ liệu ra nước ngoài. Dữ liệu trong hệ thống On-Premises vẫn nằm trên máy của bạn.",
        ],
      },
      {
        id: "retention",
        title: "Chúng tôi lưu giữ trong bao lâu",
        short: "Chỉ trong thời gian cần cho mục đích đã thu thập, hoặc theo thời hạn pháp luật yêu cầu. Bạn có thể yêu cầu xoá sớm hơn.",
        body: [
          {
            list: [
              "Yêu cầu tư vấn và nội dung chat: trong thời gian chúng tôi trao đổi với bạn, và thêm một khoảng thời gian hợp lý phòng khi bạn quay lại.",
              "Thông tin khách hàng: trong suốt thời gian bạn là khách hàng, và sau đó theo thời hạn mà pháp luật kế toán, thuế yêu cầu.",
              "Nhật ký kỹ thuật: trong thời gian ngắn, phục vụ bảo mật và xử lý sự cố.",
            ],
          },
          "Bạn có thể yêu cầu xoá yêu cầu tư vấn hoặc nội dung chat bất cứ lúc nào qua " + mail + ".",
        ],
      },
      {
        id: "your-rights",
        title: "Quyền của bạn",
        short: "Bạn có quyền được biết, xem, sửa, xoá, hạn chế xử lý hoặc phản đối việc dùng dữ liệu của mình, và khiếu nại tới cơ quan có thẩm quyền.",
        body: [
          "Theo pháp luật Việt Nam về bảo vệ dữ liệu cá nhân, bạn có quyền được biết về việc xử lý dữ liệu, đồng ý hoặc rút lại sự đồng ý, truy cập, chỉnh sửa, yêu cầu xoá, hạn chế xử lý, nhận dữ liệu của mình, phản đối việc xử lý, và khiếu nại, tố cáo hoặc khởi kiện theo quy định. Nếu bạn ở Liên minh châu Âu, bạn còn có các quyền theo GDPR.",
          "Hãy gửi email tới " + mail + " để thực hiện bất kỳ quyền nào ở trên. [Trang GDPR](/vi/gdpr) giải thích từng quyền và cách chúng tôi xử lý yêu cầu.",
        ],
      },
      {
        id: "security",
        title: "Chúng tôi bảo vệ dữ liệu thế nào",
        short: "Mã hoá thông tin bí mật, băm API key, phân quyền theo vai trò. Không hệ thống nào hoàn hảo, nên chúng tôi luôn chuẩn bị cho tình huống xấu nhất.",
        body: [
          {
            list: [
              "API key của nhà cung cấp AI, key MCP, biến môi trường của công cụ, thông tin đăng nhập CLI và OAuth token được mã hoá khi lưu trữ bằng AES-256-GCM.",
              "API key chỉ được lưu dưới dạng mã băm SHA-256.",
              "Các workspace được tách biệt với nhau, và phân quyền theo vai trò giới hạn ai được xem, được sửa những gì.",
              "Hành động của agent được truy vết, và các thao tác nhạy cảm có thể yêu cầu người phê duyệt.",
              "Kết nối tới website này được mã hoá khi truyền.",
            ],
          },
          "Không dịch vụ trực tuyến nào an toàn tuyệt đối. Nếu xảy ra sự cố ảnh hưởng tới dữ liệu cá nhân của bạn, chúng tôi sẽ thông báo cho bạn và cơ quan có thẩm quyền theo quy định của pháp luật.",
        ],
      },
      {
        id: "children",
        title: "Trẻ em",
        short: "dewee là công cụ cho doanh nghiệp, không dành cho trẻ em.",
        body: [
          "dewee và website này không hướng tới trẻ em dưới 16 tuổi, và chúng tôi không chủ ý thu thập dữ liệu của trẻ em. Nếu bạn cho rằng một em nhỏ đã gửi dữ liệu cá nhân cho chúng tôi, hãy báo qua " + mail + " để chúng tôi xoá.",
        ],
      },
      {
        id: "changes",
        title: "Thay đổi chính sách",
        short: "Khi chính sách thay đổi, ngày cập nhật ở đầu trang cũng đổi theo.",
        body: [
          "Chúng tôi sẽ cập nhật chính sách này khi cách xử lý dữ liệu thay đổi. Ngày ở đầu trang cho biết phiên bản hiện hành. Nếu thay đổi quan trọng, chúng tôi sẽ báo trực tiếp cho khách hàng. Mọi câu hỏi, xin gửi về " + mail + ".",
        ],
      },
    ],
  },
};
