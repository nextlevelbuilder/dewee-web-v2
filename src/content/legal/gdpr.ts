/**
 * /gdpr: rights under the GDPR and how to use them. `#rights`, `#dpa` and `#sub-processors` are
 * linked from the Privacy Policy and the Terms. The sub-processor list reflects what this codebase
 * and the plans actually use; the AaaS runtime host and TOSE.sh's processor role are open
 * questions (see report). The VI version is On-Premises only and also points to Vietnamese
 * personal-data law, without citing article numbers.
 */
import type { Bi } from "~/i18n/config";
import type { LegalDoc } from "./types";
import { LEGAL_EMAIL } from "./legal-ui";

const mail = `[${LEGAL_EMAIL}](mailto:${LEGAL_EMAIL})`;

export const GDPR: Bi<LegalDoc> = {
  en: {
    meta: {
      title: "GDPR: your rights and how to use them",
      description: "Your rights under the GDPR at dewee: who is controller and processor, how to access or delete your data, our sub-processors and how to request a DPA from us.",
      crumb: "GDPR",
    },
    hero: {
      eyebrow: "Legal · GDPR",
      title: "Your rights, *in practice*.",
      lede: "What the GDPR gives you, who is responsible for what, and exactly how to ask us for your data, a correction or a deletion. One email is enough to start.",
    },
    sections: [
      {
        id: "scope",
        title: "Who this page is for",
        short: "Anyone in the EU, EEA or UK whose personal data we handle. If you live somewhere else, write to us anyway.",
        body: [
          "The General Data Protection Regulation (GDPR), and the UK’s version of it, protect people in the European Union, the wider European Economic Area and the United Kingdom. This page explains how those rules apply to the personal data we handle through dewee.sh, our website chat and the dewee product.",
          "If you live elsewhere, your local law may give you similar rights. Write to us and we will tell you what we can do. How we collect and use data in general is described in our [Privacy Policy](/privacy).",
        ],
      },
      {
        id: "roles",
        title: "Who is responsible for what",
        short: "We are responsible for data on our website and about our customers. Your organisation is responsible for what it puts into dewee.",
        body: [
          {
            defs: [
              ["We are the controller", "for enquiries, website chat, customer and billing records, and licence check-ins. NextLevelBuilder decides why and how this data is processed."],
              ["We are a processor", "for the workspace content of customers on our shared AaaS cloud. We process it only on the customer’s instructions, to run dewee for them."],
              ["Your organisation is the controller", "of its workspace content on every plan. In a Dedicated runtime that content lives in the customer’s own runtime on TOSE.sh. With On-Premises it stays on the customer’s machines and we only see it if they give us access for setup or maintenance."],
            ],
          },
          "If your data is in a dewee workspace that belongs to someone else, such as your employer, ask that organisation first. If you contact us, we will pass your request on and help them answer it.",
        ],
      },
      {
        id: "rights",
        title: "Your rights",
        short: "See it, fix it, delete it, pause it, take it with you, or say no. And you can always complain to a regulator.",
        body: [
          {
            defs: [
              ["Access", "Get a copy of the personal data we hold about you and information about how we use it."],
              ["Rectification", "Have inaccurate data corrected and incomplete data completed."],
              ["Erasure", "Have your data deleted when we no longer need it, when you withdraw consent, or when it was processed unlawfully."],
              ["Restriction", "Ask us to pause using your data while a question about it is being resolved."],
              ["Portability", "Receive the data you gave us in a structured, machine-readable format, or have it sent to someone else."],
              ["Objection", "Object to processing based on our legitimate interests. For direct marketing, your objection is always final."],
              ["Withdraw consent", "Where we rely on your consent, withdraw it at any time, without affecting what was done before."],
              ["Automated decisions", "Not be subject to decisions based solely on automated processing that have legal or similarly significant effects. We do not make such decisions about you."],
              ["Complain", "Lodge a complaint with the data protection authority where you live or work. We would appreciate the chance to put things right first."],
            ],
          },
        ],
      },
      {
        id: "exercise",
        title: "How to use your rights",
        short: "Send one email. We reply within a month, and it costs nothing.",
        body: [
          {
            steps: [
              "Email " + mail + " with “GDPR request” in the subject.",
              "Tell us which right you want to use, and give us enough detail to find your data, such as the email you used in a form or the chat.",
              "We may ask you to confirm your identity, usually by replying from the same email address, so that we never hand your data to someone else.",
              "We answer within one month. If a request is complex, we may extend this by up to two further months, and we will tell you why within the first month.",
            ],
          },
          "Using your rights is free. We may only charge a reasonable fee, or decline, if a request is clearly unfounded or excessive, and we will explain why.",
        ],
      },
      {
        id: "dpa",
        title: "Data processing agreement",
        short: "If your organisation puts personal data into dewee, ask us for a DPA and we will send one.",
        body: [
          "Customers who process personal data in dewee can ask us for a data processing agreement (DPA) under Article 28 of the GDPR. Email " + mail + " with your organisation’s name and plan, and we will send you our DPA to review and sign.",
        ],
      },
      {
        id: "sub-processors",
        title: "Sub-processors",
        short: "The companies that help us run the website and dewee, what they do and what they see.",
        body: [
          {
            table: {
              head: ["Company", "What they do for us", "Data involved", "Where"],
              rows: [
                ["Cloudflare, Inc.", "Hosts this website, its database, the website chat and security protections", "Enquiries, chat messages, admin sessions, technical logs", "Global network"],
                ["Google LLC", "Website analytics through Google Tag Manager, only after you accept analytics cookies", "Anonymous page views and basic device data", "United States"],
                ["Discord Inc.", "Notifies our team about new chats and enquiries", "Your first chat message; your email and recent chat lines if you leave an email", "United States"],
                ["TOSE.sh", "Hosts Dedicated runtimes (Dedicated customers only)", "Workspace content in the customer’s runtime", "Where the customer’s TOSE.sh runtime runs"],
              ],
            },
          },
          "The AI model providers used by your agents are chosen by you and called with your own API keys, so they work for you directly rather than for us. We will update this list before adding a new sub-processor that handles customer personal data.",
        ],
      },
      {
        id: "transfers",
        title: "Transfers outside Europe",
        short: "Some providers process data outside the EEA and UK. We rely on the safeguards the GDPR provides.",
        body: [
          "When personal data leaves the EEA or the UK, for example to Discord in the United States or to Cloudflare’s global network, we rely on a transfer mechanism recognised by the GDPR, such as the European Commission’s Standard Contractual Clauses offered by our providers. Ask us and we will tell you which safeguard applies to a given provider.",
        ],
      },
      {
        id: "security",
        title: "Security and breaches",
        short: "Secrets encrypted, API keys hashed, customers isolated, access by role. If a breach happens, we report it on time.",
        body: [
          {
            list: [
              "AI provider keys, MCP keys, tool environment variables, CLI credentials and OAuth tokens are encrypted at rest with AES-256-GCM.",
              "API keys are stored only as SHA-256 hashes.",
              "Workspaces are isolated from each other, with role-based access control, traces of agent actions and human approval for sensitive steps.",
              "This website stores only essential data in your browser by default and loads no third-party fonts. Google Analytics cookies are set only with your consent (Article 6(1)(a)).",
            ],
          },
          "If a personal data breach occurs, we will notify the competent supervisory authority within 72 hours of becoming aware of it where the GDPR requires, and tell affected people without undue delay when the breach is likely to put their rights at high risk.",
        ],
      },
      {
        id: "contact",
        title: "Contact",
        short: "One address for every privacy question.",
        body: [
          "For any question about your data or this page, write to NextLevelBuilder at " + mail + ". A person on our team reads every message.",
        ],
      },
    ],
  },
  vi: {
    meta: {
      title: "GDPR và quyền dữ liệu cá nhân của bạn",
      description: "Quyền của bạn theo GDPR và pháp luật Việt Nam về dữ liệu cá nhân: ai chịu trách nhiệm, cách xem, sửa hoặc xoá dữ liệu, các đơn vị xử lý và cách yêu cầu DPA.",
      crumb: "GDPR",
    },
    hero: {
      eyebrow: "Pháp lý · GDPR",
      title: "Quyền của bạn, *làm được ngay*.",
      lede: "GDPR và pháp luật Việt Nam trao cho bạn những quyền gì, ai chịu trách nhiệm phần nào, và cách yêu cầu chúng tôi cung cấp, sửa hoặc xoá dữ liệu. Chỉ cần một email là đủ.",
    },
    sections: [
      {
        id: "scope",
        title: "Trang này dành cho ai",
        short: "Cho người ở Liên minh châu Âu, Khu vực kinh tế châu Âu hoặc Vương quốc Anh, và cho cả bạn ở Việt Nam: quyền của bạn theo pháp luật Việt Nam rất gần với GDPR.",
        body: [
          "Quy định chung về bảo vệ dữ liệu (GDPR) của Liên minh châu Âu, cùng phiên bản tương ứng của Vương quốc Anh, bảo vệ người sống tại Liên minh châu Âu, Khu vực kinh tế châu Âu và Vương quốc Anh. Trang này giải thích các quy định đó áp dụng thế nào với dữ liệu cá nhân mà chúng tôi xử lý qua website dewee.sh, khung chat và phần mềm dewee.",
          "Nếu bạn ở Việt Nam, pháp luật Việt Nam về bảo vệ dữ liệu cá nhân cũng trao cho bạn các quyền tương tự, và chúng tôi tiếp nhận yêu cầu theo cùng một cách. Cách chúng tôi thu thập và sử dụng dữ liệu nói chung có trong [Chính sách quyền riêng tư](/vi/privacy).",
        ],
      },
      {
        id: "roles",
        title: "Ai chịu trách nhiệm phần nào",
        short: "Chúng tôi chịu trách nhiệm về dữ liệu trên website và dữ liệu khách hàng. Dữ liệu trong hệ thống On-Premises thuộc quyền quản lý của công ty bạn.",
        body: [
          {
            defs: [
              ["Chúng tôi là bên kiểm soát dữ liệu", "đối với yêu cầu tư vấn, nội dung chat trên website, hồ sơ khách hàng, chứng từ thanh toán và dữ liệu kiểm tra license. NextLevelBuilder quyết định mục đích và cách thức xử lý các dữ liệu này."],
              ["Công ty bạn là bên kiểm soát dữ liệu", "đối với mọi nội dung đưa vào hệ thống dewee On-Premises. Dữ liệu nằm trên máy của bạn; chúng tôi chỉ tiếp cận khi bạn cấp quyền để cài đặt hoặc bảo trì, và chỉ làm đúng việc được giao."],
            ],
          },
          "Nếu dữ liệu của bạn nằm trong hệ thống dewee của một tổ chức khác, chẳng hạn công ty nơi bạn làm việc, hãy liên hệ tổ chức đó trước. Nếu bạn gửi yêu cầu cho chúng tôi, chúng tôi sẽ chuyển tiếp và hỗ trợ họ trả lời bạn.",
        ],
      },
      {
        id: "rights",
        title: "Quyền của bạn",
        short: "Xem, sửa, xoá, tạm dừng, mang dữ liệu đi, hoặc nói không. Và bạn luôn có thể khiếu nại tới cơ quan có thẩm quyền.",
        body: [
          {
            defs: [
              ["Quyền được biết và truy cập", "Nhận bản sao dữ liệu cá nhân chúng tôi đang giữ về bạn, cùng thông tin về cách chúng tôi sử dụng."],
              ["Quyền chỉnh sửa", "Yêu cầu sửa dữ liệu sai và bổ sung dữ liệu còn thiếu."],
              ["Quyền xoá dữ liệu", "Yêu cầu xoá khi dữ liệu không còn cần cho mục đích đã thu thập, khi bạn rút lại sự đồng ý, hoặc khi dữ liệu bị xử lý trái pháp luật."],
              ["Quyền hạn chế xử lý", "Yêu cầu tạm dừng sử dụng dữ liệu trong lúc một thắc mắc về dữ liệu đó đang được giải quyết."],
              ["Quyền nhận dữ liệu", "Nhận dữ liệu bạn đã cung cấp ở định dạng có cấu trúc, máy đọc được, hoặc yêu cầu chuyển cho bên khác."],
              ["Quyền phản đối", "Phản đối việc xử lý dữ liệu, kể cả việc dùng dữ liệu cho mục đích tiếp thị."],
              ["Quyền rút lại sự đồng ý", "Khi việc xử lý dựa trên sự đồng ý của bạn, bạn có thể rút lại bất cứ lúc nào; việc này không ảnh hưởng tới những gì đã làm trước đó."],
              ["Quyền không bị quyết định tự động", "Không phải chịu quyết định chỉ dựa trên xử lý tự động có tác động pháp lý hoặc ảnh hưởng đáng kể tới bạn. Chúng tôi không đưa ra quyết định nào như vậy về bạn."],
              ["Quyền khiếu nại", "Khiếu nại tới cơ quan bảo vệ dữ liệu cá nhân có thẩm quyền nơi bạn sinh sống hoặc làm việc. Chúng tôi mong có cơ hội khắc phục trước."],
            ],
          },
        ],
      },
      {
        id: "exercise",
        title: "Cách thực hiện quyền của bạn",
        short: "Gửi một email. Chúng tôi phản hồi trong vòng một tháng và không thu phí.",
        body: [
          {
            steps: [
              "Gửi email tới " + mail + " với tiêu đề “Yêu cầu về dữ liệu cá nhân”.",
              "Cho chúng tôi biết bạn muốn thực hiện quyền nào, kèm đủ thông tin để tìm dữ liệu, chẳng hạn email bạn đã dùng trong biểu mẫu hoặc khung chat.",
              "Chúng tôi có thể đề nghị bạn xác minh danh tính, thường chỉ cần trả lời từ chính địa chỉ email đó, để dữ liệu của bạn không bao giờ bị giao nhầm người.",
              "Chúng tôi phản hồi trong vòng một tháng. Với yêu cầu phức tạp, thời hạn có thể kéo dài thêm tối đa hai tháng và chúng tôi sẽ nêu rõ lý do ngay trong tháng đầu tiên. Nếu pháp luật Việt Nam quy định thời hạn ngắn hơn, chúng tôi áp dụng thời hạn đó.",
            ],
          },
          "Việc thực hiện quyền là miễn phí. Chúng tôi chỉ thu một khoản phí hợp lý, hoặc từ chối, khi yêu cầu rõ ràng không có căn cứ hoặc quá mức, và sẽ giải thích lý do.",
        ],
      },
      {
        id: "dpa",
        title: "Thoả thuận xử lý dữ liệu (DPA)",
        short: "Nếu công ty bạn cần một thoả thuận xử lý dữ liệu, hãy yêu cầu và chúng tôi sẽ gửi.",
        body: [
          "Khi triển khai hoặc bảo trì On-Premises, chúng tôi có thể cần tiếp cận hệ thống chứa dữ liệu cá nhân của công ty bạn. Nếu bạn cần một thoả thuận xử lý dữ liệu (DPA), hãy gửi email tới " + mail + " kèm tên công ty, chúng tôi sẽ gửi bản DPA để bạn xem xét và ký.",
        ],
      },
      {
        id: "sub-processors",
        title: "Các đơn vị xử lý dữ liệu",
        short: "Những công ty giúp chúng tôi vận hành website, họ làm gì và thấy được dữ liệu gì.",
        body: [
          {
            table: {
              head: ["Đơn vị", "Công việc", "Dữ liệu liên quan", "Nơi xử lý"],
              rows: [
                ["Cloudflare, Inc.", "Vận hành website, cơ sở dữ liệu, khung chat và các lớp bảo vệ", "Yêu cầu tư vấn, tin nhắn chat, phiên quản trị, nhật ký kỹ thuật", "Mạng lưới toàn cầu"],
                ["Google LLC", "Phân tích website qua Google Tag Manager, chỉ sau khi bạn đồng ý cookie phân tích", "Lượt xem trang ẩn danh và thông tin thiết bị cơ bản", "Hoa Kỳ"],
                ["Discord Inc.", "Báo cho đội ngũ khi có cuộc chat hoặc yêu cầu mới", "Tin nhắn chat đầu tiên; email và các dòng chat gần nhất nếu bạn để lại email", "Hoa Kỳ"],
              ],
            },
          },
          "Các nhà cung cấp mô hình AI mà agent của bạn sử dụng do bạn tự chọn và được gọi bằng API key của chính bạn, nên họ làm việc trực tiếp với bạn chứ không phải với chúng tôi. Chúng tôi sẽ cập nhật danh sách này trước khi thêm đơn vị mới xử lý dữ liệu cá nhân của khách hàng.",
        ],
      },
      {
        id: "transfers",
        title: "Chuyển dữ liệu ra nước ngoài",
        short: "Một số đơn vị xử lý dữ liệu ở nước ngoài. Chúng tôi áp dụng các biện pháp bảo vệ mà pháp luật yêu cầu.",
        body: [
          "Khi dữ liệu cá nhân được chuyển ra nước ngoài, chẳng hạn tới Discord tại Hoa Kỳ hoặc mạng lưới toàn cầu của Cloudflare, chúng tôi thực hiện các thủ tục và biện pháp bảo vệ mà GDPR và pháp luật Việt Nam về bảo vệ dữ liệu cá nhân yêu cầu. Dữ liệu trong hệ thống On-Premises vẫn nằm trên máy của bạn.",
        ],
      },
      {
        id: "security",
        title: "Bảo mật và xử lý sự cố",
        short: "Mã hoá thông tin bí mật, băm API key, tách biệt khách hàng, phân quyền theo vai trò. Nếu có sự cố, chúng tôi báo cáo đúng hạn.",
        body: [
          {
            list: [
              "API key của nhà cung cấp AI, key MCP, biến môi trường của công cụ, thông tin đăng nhập CLI và OAuth token được mã hoá khi lưu trữ bằng AES-256-GCM.",
              "API key chỉ được lưu dưới dạng mã băm SHA-256.",
              "Các workspace được tách biệt, có phân quyền theo vai trò, truy vết hành động của agent và yêu cầu người phê duyệt với các bước nhạy cảm.",
              "Mặc định, website này chỉ lưu dữ liệu thiết yếu trên trình duyệt và không tải phông chữ của bên thứ ba. Cookie Google Analytics chỉ được đặt khi bạn đồng ý (Điều 6(1)(a)).",
            ],
          },
          "Nếu xảy ra vi phạm dữ liệu cá nhân, chúng tôi sẽ thông báo cho cơ quan có thẩm quyền trong vòng 72 giờ kể từ khi phát hiện, theo yêu cầu của GDPR và pháp luật Việt Nam, và báo cho người bị ảnh hưởng không chậm trễ khi sự cố có nguy cơ cao tới quyền lợi của họ.",
        ],
      },
      {
        id: "contact",
        title: "Liên hệ",
        short: "Một địa chỉ cho mọi câu hỏi về quyền riêng tư.",
        body: [
          "Mọi câu hỏi về dữ liệu của bạn hoặc về trang này, xin gửi cho NextLevelBuilder qua " + mail + ". Mỗi tin nhắn đều có người thật đọc.",
        ],
      },
    ],
  },
};
