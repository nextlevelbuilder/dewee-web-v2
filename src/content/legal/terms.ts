/**
 * /terms: Terms of Service. The VI version covers the Vietnamese offer (On-Premises only) and
 * never names the shared cloud or TOSE. Facts come from src/content/plans.ts and the dewee
 * licence runbook; the legal entity name, registered address and governing law are not known
 * yet, so the text stays neutral about them (see the pricing-legal report).
 */
import type { Bi } from "~/i18n/config";
import type { LegalDoc } from "./types";
import { LEGAL_EMAIL } from "./legal-ui";

const mail = `[${LEGAL_EMAIL}](mailto:${LEGAL_EMAIL})`;

export const TERMS: Bi<LegalDoc> = {
  en: {
    meta: {
      title: "Terms of Service",
      description: "The agreement for using dewee: plans, accounts, acceptable use, licence keys, your data, fees, support and liability, written in plain English first.",
      crumb: "Terms of Service",
    },
    hero: {
      eyebrow: "Legal · Terms",
      title: "Terms of *Service*.",
      lede: "The agreement between you and us for using dewee. Every section starts with the short version; the full text below it is what counts.",
    },
    sections: [
      {
        id: "about",
        title: "About these terms",
        short: "This is the agreement for using dewee. If you signed an order or contract with us, that document wins where the two differ.",
        body: [
          "These terms are an agreement between you and NextLevelBuilder (“we”, “us”), the team that makes dewee. They cover the dewee.sh website, the hosted control plane at app.dewee.sh, the dewee runtime and its licence keys, and any On-Premises setup work we do for you.",
          "If you sign an order form, quote or contract with us, it forms part of this agreement, and where it says something different from these terms, the signed document applies.",
          "If you accept these terms for a company or other organisation, you confirm that you are allowed to bind it, and “you” means that organisation. Our registered company details are available on request at " + mail + ".",
        ],
      },
      {
        id: "service",
        title: "What we provide",
        short: "dewee comes three ways: our shared cloud, your own runtime on TOSE.sh, or your own hardware. The pricing page lists what each includes.",
        body: [
          "dewee is an operating layer for AI agents: a runtime that runs your agents, channels and workflows, and a control plane where your team configures and watches them. You can use it in one of three ways:",
          {
            defs: [
              ["SaaS", "The runtime runs on shared servers that we operate, and your team uses the control plane at app.dewee.sh."],
              ["Dedicated on TOSE.sh", "Your own isolated runtime on TOSE.sh, activated with a licence key and connected to your own control plane."],
              ["On-Premises", "The runtime and control plane run on your own VPS or Mac mini. We do the setup and build the custom workflows agreed in your quote."],
            ],
          },
          "What each plan includes is described on the [pricing page](/pricing). We keep improving dewee, so features change over time.",
        ],
      },
      {
        id: "accounts",
        title: "Accounts and access",
        short: "Keep your sign-in safe. You are responsible for what happens in your workspace, and you should tell us straight away if something looks wrong.",
        body: [
          "You are responsible for the people you invite to your workspace, the roles you give them, and everything done with your accounts, API tokens and licence keys.",
          "Keep credentials secret and use the role-based access controls to give people only what they need. If you think someone has got into your account or a key has leaked, write to " + mail + " straight away so we can help you lock it down.",
          "dewee is built for businesses and teams. You must be old enough to enter into a binding contract where you live to create an account.",
        ],
      },
      {
        id: "acceptable-use",
        title: "Acceptable use",
        short: "Do not use dewee to break the law, hurt people or attack systems, including ours.",
        body: [
          "You agree not to use dewee, or let anyone else use it, to:",
          {
            list: [
              "break any law or regulation, or help someone else do so;",
              "send spam, run phishing, spread malware or abuse other people’s credentials;",
              "scrape, probe or attack websites and systems you are not allowed to access;",
              "try to get around security controls, rate limits, licence checks or tenant isolation, or reach another customer’s data;",
              "infringe other people’s intellectual property, privacy or other rights;",
              "resell or share access to dewee without a written agreement with us.",
            ],
          },
          "If an account puts other customers, our systems or the public at risk, we may suspend it to contain the problem. Where we can, we will tell you first and explain why.",
        ],
      },
      {
        id: "licence",
        title: "Your licence to dewee",
        short: "You may run dewee for your own business during your licence year. Dedicated and On-Premises runtimes check in with our licence server so the key stays valid.",
        body: [
          "While you have a paid plan, we give you a non-exclusive, non-transferable licence to use dewee for your organisation’s own business, for the term of your licence (normally one year at a time).",
          "Dedicated and On-Premises runtimes are activated with a licence key. The runtime checks in with our licence server every five minutes, sending an activation ID and a runtime token, never the raw key and never your conversations or files. If it cannot reach us, it keeps working for up to 24 hours after the last successful check-in, but never beyond the end of your licence year. When a licence expires or is revoked, the runtime stops accepting new work. The details are in our [licence policy](/policy#licences).",
          "Unless the law allows it, you may not copy, modify, reverse-engineer or redistribute dewee, share or sell licence keys, or remove our notices. Open-source components keep their own licences.",
        ],
      },
      {
        id: "your-data",
        title: "Your data and AI providers",
        short: "Your content stays yours. We use it only to run dewee for you. You bring your own AI provider keys, and prompts go to the providers you choose.",
        body: [
          "You own the content you put into dewee: prompts, files, agent settings, workflows and conversations. We use it only to provide and support the service for you, and as described in our [Privacy Policy](/privacy).",
          "You bring your own AI provider keys. When your agents call a model, your content is sent to the provider you configured, under your own agreement with that provider. Model usage is billed to you by the provider, not by us.",
          "You confirm that you have the right to process the data you send through dewee, including any personal data, and that doing so is lawful. If you need a data processing agreement, see our [GDPR page](/gdpr#dpa).",
          "With On-Premises, your data stays on your machines. We only access them when you give us access for setup or maintenance, and only for that purpose.",
        ],
      },
      {
        id: "fees",
        title: "Fees and renewals",
        short: "Prices are on the pricing page, in US dollars per year. AI model usage is paid to your providers, not to us. Refunds follow our refund policy.",
        body: [
          "Prices are listed on the [pricing page](/pricing) in US dollars, per year:",
          {
            list: [
              "SaaS: $500 per year.",
              "Dedicated on TOSE.sh: a $500 yearly licence plus a $99 TOSE credit deposit. We pass the deposit to TOSE.sh as credit for your runtime; after that you top up credit directly with TOSE.sh.",
              "On-Premises: a custom quote from $5,000, which includes the first year’s $500 licence, five custom workflows and one year of maintenance.",
            ],
          },
          "Licences run one year at a time. The renewal price and terms are those on the pricing page at renewal, unless your order says otherwise. Whether taxes are added depends on where you are, and is shown on your order or invoice.",
          "Refunds are covered by our [refund policy](/policy#refunds).",
        ],
      },
      {
        id: "third-parties",
        title: "Services run by others",
        short: "Some parts of your setup belong to other companies, such as TOSE.sh, your AI providers and your chat channels. Their terms apply to them.",
        body: [
          "dewee connects to services that other companies run: TOSE.sh for Dedicated runtimes, the AI model providers you choose, and the channels you connect, such as messaging apps. Your use of those services is governed by their own terms, and your TOSE credit balance is between you and TOSE.sh once the deposit has been passed on.",
          "We choose our own suppliers carefully, but we are not responsible for outages, price changes or decisions made by services we do not control.",
        ],
      },
      {
        id: "support",
        title: "Support and maintenance",
        short: "We look after dewee itself. Who looks after the rest depends on your plan.",
        body: [
          {
            defs: [
              ["SaaS", "We run and maintain the shared runtime. Custom runtime packages cannot be installed; ask support and we can add a curated package."],
              ["Dedicated on TOSE.sh", "We support dewee. You look after the packages you install and keep your TOSE credit topped up."],
              ["On-Premises", "The first year of maintenance and updates is included. After that, maintenance continues as agreed at renewal."],
            ],
          },
          "You can reach us by email at " + mail + " or through the chat on this website. We do not promise specific response times unless your order does.",
        ],
      },
      {
        id: "warranty",
        title: "What we promise, and what we don’t",
        short: "We provide dewee with care. AI can still be wrong, so check important output before you act on it.",
        body: [
          "We will provide dewee with reasonable skill and care. Apart from that, and to the extent the law allows, dewee is provided “as is”, without other promises about fitness for a particular purpose or uninterrupted operation.",
          "AI agents produce output that can be incomplete or wrong. You remain responsible for reviewing it before relying on it, especially for legal, financial, medical or safety decisions. Approvals and traces in dewee exist to help you do that.",
        ],
      },
      {
        id: "liability",
        title: "Limits of liability",
        short: "If something goes wrong, our liability is capped at what you paid us in the previous 12 months, except where the law does not allow a cap.",
        body: [
          "To the extent the law allows, neither of us is liable to the other for indirect or consequential loss, or for lost profits, revenue, goodwill or data that could reasonably have been backed up.",
          "Our total liability for all claims connected with dewee in any 12-month period is limited to the fees you paid us for dewee in that period.",
          "Nothing in these terms limits liability that cannot be limited by law, such as liability for fraud, or for death or personal injury caused by negligence, and nothing takes away rights you have as a consumer where consumer law applies.",
        ],
      },
      {
        id: "termination",
        title: "Ending the agreement",
        short: "You can stop at any time. We can suspend or end an account for serious breaches, and we will help you take your data with you.",
        body: [
          "You can stop using dewee at any time and choose not to renew. Ending early does not by itself entitle you to a refund; see the [refund policy](/policy#refunds).",
          "We may suspend or end your access if you seriously breach these terms, do not pay, or if the law requires it. Where we can, we will warn you first and give you time to fix the problem.",
          "Before an account closes, ask us for an export of your workspace data and we will help where we technically can. With On-Premises your data is already on your machines; when the licence ends, the runtime stops accepting new work.",
        ],
      },
      {
        id: "law",
        title: "Governing law and disputes",
        short: "The law named in your order applies. Either way, write to us first; most problems are solved by a conversation.",
        body: [
          "These terms are governed by the law named in your order form or contract. If none is named, the law of the country where NextLevelBuilder is registered applies, without taking away any mandatory protection you have under the law where you live.",
          "If something goes wrong, please write to " + mail + " first. We will try in good faith to settle it with you before either of us goes to court.",
        ],
      },
      {
        id: "changes",
        title: "Changes to these terms",
        short: "When the terms change, the date at the top changes too. If a change affects something you already pay for, we will tell you first.",
        body: [
          "We may update these terms as dewee and the law change. The date at the top of this page shows the current version.",
          "If a change materially affects a plan you already pay for, we will tell you before it applies to you. Questions about these terms: " + mail + ".",
        ],
      },
    ],
  },
  vi: {
    meta: {
      title: "Điều khoản dịch vụ",
      description: "Thoả thuận khi sử dụng dewee On-Premises: phạm vi dịch vụ, tài khoản, quy tắc sử dụng, license, dữ liệu, chi phí, hỗ trợ và giới hạn trách nhiệm, viết dễ hiểu.",
      crumb: "Điều khoản dịch vụ",
    },
    hero: {
      eyebrow: "Pháp lý · Điều khoản",
      title: "Điều khoản *dịch vụ*.",
      lede: "Thoả thuận giữa bạn và chúng tôi khi sử dụng dewee. Mỗi mục đều mở đầu bằng phần nói ngắn gọn; nội dung đầy đủ bên dưới mới là phần có giá trị áp dụng.",
    },
    sections: [
      {
        id: "about",
        title: "Về các điều khoản này",
        short: "Đây là thoả thuận khi dùng dewee. Nếu bạn đã ký đơn hàng hoặc hợp đồng với chúng tôi, văn bản đó được ưu tiên ở những điểm khác nhau.",
        body: [
          "Các điều khoản này là thoả thuận giữa bạn và NextLevelBuilder (“chúng tôi”), đội ngũ phát triển dewee. Điều khoản áp dụng cho website dewee.sh, phần mềm dewee (runtime và control plane), license key đi kèm và các công việc triển khai On-Premises mà chúng tôi thực hiện cho bạn.",
          "Báo giá, đơn hàng hoặc hợp đồng mà bạn ký với chúng tôi là một phần của thoả thuận này. Ở điểm nào văn bản đã ký quy định khác với điều khoản này, văn bản đã ký được áp dụng.",
          "Nếu bạn chấp nhận điều khoản thay mặt một công ty hay tổ chức, bạn xác nhận mình có thẩm quyền ràng buộc tổ chức đó, và “bạn” được hiểu là tổ chức đó. Thông tin đăng ký doanh nghiệp của chúng tôi được cung cấp khi bạn yêu cầu qua " + mail + ".",
        ],
      },
      {
        id: "service",
        title: "Dịch vụ chúng tôi cung cấp",
        short: "Tại Việt Nam, dewee được triển khai On-Premises: chạy trên VPS hoặc Mac mini của chính bạn, chúng tôi lo phần cài đặt.",
        body: [
          "dewee là lớp vận hành cho AI agent: một runtime chạy agent, kênh chat và quy trình của bạn, cùng một control plane để đội ngũ cấu hình và theo dõi chúng.",
          "Tại Việt Nam, dewee được cung cấp theo hình thức On-Premises: runtime và control plane chạy trên VPS hoặc Mac mini của bạn. Chúng tôi cài đặt, kích hoạt license và xây dựng các quy trình tuỳ chỉnh đã thống nhất trong báo giá. Phạm vi chi tiết có trên [trang bảng giá](/vi/pricing) và trong báo giá của bạn.",
          "dewee được cải tiến liên tục nên tính năng có thể thay đổi theo thời gian.",
        ],
      },
      {
        id: "accounts",
        title: "Tài khoản và quyền truy cập",
        short: "Hãy giữ an toàn thông tin đăng nhập. Bạn chịu trách nhiệm về những gì diễn ra trong workspace của mình, và nên báo ngay cho chúng tôi khi thấy điều bất thường.",
        body: [
          "Bạn chịu trách nhiệm về những người bạn mời vào workspace, vai trò bạn cấp cho họ, và mọi thao tác được thực hiện bằng tài khoản, API token và license key của bạn.",
          "Hãy giữ bí mật thông tin đăng nhập và dùng phân quyền theo vai trò để mỗi người chỉ có quyền vừa đủ. Nếu nghi ngờ tài khoản bị truy cập trái phép hoặc key bị lộ, hãy báo ngay qua " + mail + " để chúng tôi cùng bạn xử lý.",
          "dewee dành cho doanh nghiệp và đội nhóm. Người tạo tài khoản phải đủ năng lực để giao kết hợp đồng theo pháp luật nơi mình sinh sống.",
        ],
      },
      {
        id: "acceptable-use",
        title: "Quy tắc sử dụng",
        short: "Không dùng dewee để vi phạm pháp luật, gây hại cho người khác hay tấn công hệ thống, kể cả hệ thống của chúng tôi.",
        body: [
          "Bạn đồng ý không sử dụng, và không để người khác sử dụng dewee để:",
          {
            list: [
              "vi phạm pháp luật hoặc giúp người khác vi phạm;",
              "gửi thư rác, lừa đảo, phát tán mã độc hoặc lạm dụng thông tin đăng nhập của người khác;",
              "thu thập dữ liệu, dò quét hay tấn công website và hệ thống mà bạn không có quyền truy cập;",
              "tìm cách vượt qua cơ chế bảo mật, giới hạn truy cập hoặc bước kiểm tra license;",
              "xâm phạm quyền sở hữu trí tuệ, quyền riêng tư hay các quyền khác của người khác;",
              "bán lại hoặc chia sẻ quyền sử dụng dewee khi chưa có thoả thuận bằng văn bản với chúng tôi.",
            ],
          },
          "Nếu việc sử dụng gây rủi ro cho hệ thống của chúng tôi hoặc cho người khác, chúng tôi có thể tạm khoá license để ngăn chặn. Khi có thể, chúng tôi sẽ báo trước và giải thích lý do.",
        ],
      },
      {
        id: "licence",
        title: "Quyền sử dụng dewee",
        short: "Bạn được chạy dewee cho hoạt động của công ty mình trong năm license. Runtime định kỳ báo về máy chủ license để key luôn hợp lệ.",
        body: [
          "Khi gói của bạn còn hiệu lực, chúng tôi cấp cho bạn quyền sử dụng dewee không độc quyền, không chuyển nhượng, cho hoạt động kinh doanh của chính tổ chức bạn, trong thời hạn license (thông thường theo từng năm).",
          "Runtime On-Premises được kích hoạt bằng license key. Cứ 5 phút, runtime gửi về máy chủ license của chúng tôi một mã kích hoạt và một runtime token, không bao giờ gửi license key gốc, càng không gửi tin nhắn hay tài liệu của bạn. Nếu mất kết nối, runtime vẫn chạy thêm tối đa 24 giờ kể từ lần kiểm tra thành công gần nhất, nhưng không vượt quá ngày kết thúc năm license. Khi license hết hạn hoặc bị thu hồi, runtime ngừng nhận việc mới. Chi tiết có trong [chính sách license](/vi/policy#licences).",
          "Trừ khi pháp luật cho phép, bạn không được sao chép, sửa đổi, dịch ngược hay phân phối lại dewee, không chia sẻ hay bán license key, và không gỡ bỏ các thông báo bản quyền. Các thành phần mã nguồn mở vẫn tuân theo giấy phép riêng của chúng.",
        ],
      },
      {
        id: "your-data",
        title: "Dữ liệu của bạn và nhà cung cấp AI",
        short: "Dữ liệu nằm trên máy của bạn và vẫn là của bạn. Bạn dùng API key AI của riêng mình, nội dung chỉ được gửi tới nhà cung cấp bạn chọn.",
        body: [
          "Mọi nội dung bạn đưa vào dewee (prompt, tài liệu, cấu hình agent, quy trình, hội thoại) thuộc về bạn. Với On-Premises, dữ liệu này nằm trên máy của bạn. Chúng tôi chỉ truy cập khi bạn cấp quyền để cài đặt hoặc bảo trì, và chỉ cho đúng mục đích đó.",
          "Bạn dùng API key của các nhà cung cấp mô hình AI do bạn chọn. Khi agent gọi mô hình, nội dung được gửi tới nhà cung cấp đó theo thoả thuận riêng giữa bạn và họ. Chi phí sử dụng mô hình do nhà cung cấp tính trực tiếp cho bạn, không qua chúng tôi.",
          "Bạn cam kết có quyền hợp pháp đối với dữ liệu xử lý qua dewee, kể cả dữ liệu cá nhân. Cách chúng tôi xử lý thông tin của bạn được nêu trong [Chính sách quyền riêng tư](/vi/privacy).",
        ],
      },
      {
        id: "fees",
        title: "Chi phí và gia hạn",
        short: "Giá On-Premises từ $5K theo báo giá, đã gồm license năm đầu. Chi phí mô hình AI bạn trả trực tiếp cho nhà cung cấp. Hoàn tiền theo chính sách hoàn tiền.",
        body: [
          "dewee On-Premises được tính theo báo giá, từ $5.000 (đô la Mỹ), đã gồm license $500 cho năm đầu, 5 quy trình tuỳ chỉnh và một năm bảo trì. Giá tham khảo có trên [trang bảng giá](/vi/pricing).",
          "License được tính theo từng năm. Giá và điều kiện gia hạn theo bảng giá tại thời điểm gia hạn, trừ khi đơn hàng của bạn quy định khác. Thuế (nếu có) phụ thuộc nơi bạn ở và được thể hiện trên báo giá hoặc hoá đơn.",
          "Việc hoàn tiền tuân theo [chính sách hoàn tiền](/vi/policy#refunds).",
        ],
      },
      {
        id: "third-parties",
        title: "Dịch vụ của bên thứ ba",
        short: "Một số phần trong hệ thống của bạn thuộc về công ty khác, như nhà cung cấp AI hay các kênh chat. Điều khoản của họ áp dụng cho dịch vụ của họ.",
        body: [
          "dewee kết nối với các dịch vụ do công ty khác vận hành, như nhà cung cấp mô hình AI bạn chọn và các kênh bạn kết nối (ví dụ ứng dụng nhắn tin). Việc bạn dùng các dịch vụ đó tuân theo điều khoản riêng của họ.",
          "Chúng tôi lựa chọn nhà cung cấp của mình cẩn thận, nhưng không chịu trách nhiệm về sự cố, thay đổi giá hay quyết định của những dịch vụ nằm ngoài quyền kiểm soát của chúng tôi.",
        ],
      },
      {
        id: "support",
        title: "Hỗ trợ và bảo trì",
        short: "Năm đầu đã gồm bảo trì và cập nhật. Phần cứng do bạn sở hữu và quản lý.",
        body: [
          "Gói On-Premises đã gồm một năm bảo trì và cập nhật. Sau năm đầu, việc bảo trì tiếp tục theo thoả thuận khi gia hạn. Bạn sở hữu và chịu trách nhiệm về phần cứng, mạng và các package cài thêm trên máy của mình.",
          "Bạn có thể liên hệ qua " + mail + " hoặc khung chat trên website. Chúng tôi không cam kết thời gian phản hồi cụ thể, trừ khi đơn hàng của bạn có quy định.",
        ],
      },
      {
        id: "warranty",
        title: "Điều chúng tôi cam kết, và điều không",
        short: "Chúng tôi cung cấp dewee một cách tận tâm. Nhưng AI vẫn có thể sai, nên hãy kiểm tra kết quả quan trọng trước khi dùng.",
        body: [
          "Chúng tôi cung cấp dewee với sự cẩn trọng và chuyên môn hợp lý. Ngoài cam kết đó, trong phạm vi pháp luật cho phép, dewee được cung cấp “nguyên trạng”, không kèm cam kết nào khác về sự phù hợp cho một mục đích cụ thể hay việc vận hành không gián đoạn.",
          "AI agent có thể đưa ra kết quả thiếu hoặc sai. Bạn vẫn chịu trách nhiệm kiểm tra trước khi dựa vào kết quả đó, nhất là với các quyết định về pháp lý, tài chính, y tế hay an toàn. Tính năng phê duyệt và truy vết trong dewee được làm ra để giúp bạn làm việc này.",
        ],
      },
      {
        id: "liability",
        title: "Giới hạn trách nhiệm",
        short: "Nếu có sự cố, trách nhiệm của chúng tôi giới hạn ở số tiền bạn đã trả trong 12 tháng trước đó, trừ trường hợp pháp luật không cho phép giới hạn.",
        body: [
          "Trong phạm vi pháp luật cho phép, không bên nào chịu trách nhiệm với bên kia về thiệt hại gián tiếp hoặc phát sinh, hay về lợi nhuận, doanh thu, uy tín bị mất, hoặc dữ liệu lẽ ra có thể được sao lưu.",
          "Tổng trách nhiệm của chúng tôi cho mọi khiếu nại liên quan đến dewee trong bất kỳ giai đoạn 12 tháng nào không vượt quá số phí bạn đã trả cho dewee trong giai đoạn đó.",
          "Không điều khoản nào ở đây giới hạn trách nhiệm mà pháp luật không cho phép giới hạn, như trách nhiệm do gian lận hoặc do sơ suất gây thiệt hại về tính mạng, sức khoẻ, và không làm mất đi quyền của bạn với tư cách người tiêu dùng khi luật bảo vệ người tiêu dùng được áp dụng.",
        ],
      },
      {
        id: "termination",
        title: "Chấm dứt thoả thuận",
        short: "Bạn có thể ngừng bất cứ lúc nào. Chúng tôi có thể tạm khoá hoặc chấm dứt license khi có vi phạm nghiêm trọng. Dữ liệu vẫn nằm trên máy của bạn.",
        body: [
          "Bạn có thể ngừng sử dụng dewee bất cứ lúc nào và không gia hạn. Việc ngừng sớm không đương nhiên đi kèm hoàn tiền; xem [chính sách hoàn tiền](/vi/policy#refunds).",
          "Chúng tôi có thể tạm khoá hoặc chấm dứt license nếu bạn vi phạm nghiêm trọng các điều khoản này, không thanh toán, hoặc khi pháp luật yêu cầu. Khi có thể, chúng tôi sẽ cảnh báo trước và cho bạn thời gian khắc phục.",
          "Với On-Premises, dữ liệu của bạn vẫn nằm trên máy của bạn. Khi license kết thúc, runtime ngừng nhận việc mới.",
        ],
      },
      {
        id: "law",
        title: "Luật áp dụng và giải quyết tranh chấp",
        short: "Luật được ghi trong hợp đồng của bạn sẽ được áp dụng. Dù thế nào, hãy trao đổi với chúng tôi trước; hầu hết vấn đề đều giải quyết được bằng một cuộc nói chuyện.",
        body: [
          "Các điều khoản này được điều chỉnh bởi luật được ghi trong đơn hàng hoặc hợp đồng của bạn. Nếu không ghi, áp dụng pháp luật của quốc gia nơi NextLevelBuilder đăng ký hoạt động, nhưng không làm mất đi các quyền bắt buộc mà pháp luật nơi bạn sinh sống dành cho bạn.",
          "Khi có vướng mắc, hãy viết cho chúng tôi qua " + mail + " trước. Chúng tôi sẽ thiện chí thương lượng với bạn trước khi một trong hai bên đưa vụ việc ra toà án hoặc trọng tài.",
        ],
      },
      {
        id: "changes",
        title: "Thay đổi điều khoản",
        short: "Khi điều khoản thay đổi, ngày cập nhật ở đầu trang cũng đổi theo. Nếu thay đổi ảnh hưởng tới gói bạn đang dùng, chúng tôi sẽ báo trước.",
        body: [
          "Chúng tôi có thể cập nhật điều khoản khi dewee hoặc pháp luật thay đổi. Ngày ở đầu trang cho biết phiên bản hiện hành.",
          "Nếu thay đổi ảnh hưởng đáng kể tới gói bạn đang trả phí, chúng tôi sẽ báo cho bạn trước khi thay đổi áp dụng. Mọi câu hỏi về điều khoản, xin gửi về " + mail + ".",
        ],
      },
    ],
  },
};
