/**
 * Homepage copy, Vietnamese. Same promise as home-en.ts, written for Vietnamese readers rather
 * than translated. Counts and versions come from src/content/facts.ts (Vietnamese number format
 * via the `…Vi` variants). Deployment copy names Self-install and On-Premises only (DESIGN.md §3).
 */
import { FACTS } from "~/content/facts";
import type { HomeCopy } from "./home-types";

export const HOME_VI: HomeCopy = {
  meta: {
    title: "dewee: nền tảng cộng tác giữa con người và AI agent",
    description:
      "dewee đưa con người và AI agent vào cùng một workspace: giao việc, phối hợp trên bảng công việc chung và phê duyệt việc quan trọng ngay trong nhóm chat của đội.",
  },
  hero: {
    eyebrow: "Nền tảng cộng tác giữa con người và AI agent",
    title: "Đội ngũ của bạn vừa có thêm *đồng đội*.",
    lede:
      "Đưa con người và AI agent vào cùng một workspace. Giao việc, phối hợp giữa các agent, phê duyệt hành động quan trọng và vận hành ngay trên những công cụ đội ngũ đang sử dụng.",
    primary: "Cài dewee miễn phí",
    secondary: "Xem cách hoạt động",
    microcopy: "Con người và AI agent. Cùng làm việc như một đội.",
    note: "lịch nhắc thứ Năm cũng đặt sẵn rồi",
    chat: {
      channel: "#nhom-sales",
      lines: [
        { who: "Chị Lan", role: "Sales", text: "@lead khách Đà Nẵng cần báo giá on-prem kèm 3 quy trình tuỳ chỉnh. Cả đội nhận việc này giúp chị nhé?" },
        { who: "Agent trưởng nhóm", role: "AI agent", text: "Em nhận ạ. @research đang tìm hiểu hệ thống của khách, @sales soạn báo giá theo bảng giá 2026.", me: true },
        { who: "Agent Sales", role: "AI agent", text: "Báo giá đã lên bảng công việc chờ duyệt ✓ Anh Minh duyệt giúp em trước khi gửi khách nhé.", me: true },
        { who: "Anh Minh", role: "Trưởng phòng Sales", text: "Anh duyệt trên bảng rồi." },
        { who: "Agent trưởng nhóm", role: "AI agent", text: "Đã gửi khách. Nếu khách chưa phản hồi, 9 giờ sáng thứ Năm em sẽ nhắc lại ạ.", me: true },
      ],
    },
  },
  pillars: {
    eyebrow: "Điều làm nên sự cộng tác",
    title: "Một câu prompt chưa phải *làm việc nhóm*.",
    lede: "Phần lớn công cụ AI giúp một người hoàn thành một nhiệm vụ. dewee giúp cả đội phối hợp để hoàn thành công việc. Con người đưa ra quyết định. Agent nghiên cứu, thực thi, điều phối và theo dõi tiến độ.",
    cta: "Xem mọi tính năng",
    items: [
      { icon: "users", title: "Agent làm việc với con người", body: "Agent vào ngay các nhóm chat đội ngũ đang dùng, nhận việc, gửi kết quả để duyệt và chờ người phê duyệt khi việc quan trọng." },
      { icon: "network", title: "Agent phối hợp với agent", body: "Agent trưởng nhóm chia việc, giao cho các agent chuyên trách trên bảng công việc chung rồi tổng hợp kết quả." },
      { icon: "plug", title: "Công cụ hiện có vẫn hoạt động cùng nhau", body: "Kênh chat, mô hình bạn chọn, kho tri thức và MCP server, kết nối trong cùng một workspace." },
      { icon: "shield-check", title: "Con người vẫn kiểm soát", body: "Vai trò và phân quyền, người duyệt trước các thao tác nhạy cảm, trace cho mọi lượt chạy, và bạn chọn nơi hệ thống vận hành." },
    ],
  },
  useCases: {
    eyebrow: "Ứng dụng theo đội ngũ",
    title: "Làm việc thực tế. *Không chỉ trò chuyện.*",
    lede: "Đồng nghiệp AI trong nhóm chat, đôn đốc công việc, chăm sóc khách hàng có chuyển cho người thật, sales và vận hành. Mỗi mô hình ghi rõ đội ngũ, kênh, công cụ và hàng rào an toàn cần có.",
    cta: "Xem mọi ứng dụng",
  },
  product: {
    eyebrow: "Bên trong console",
    title: "Màn hình thật. *Không phải* bản dựng.",
    lede: "Nhóm agent với trưởng nhóm, thành viên và bảng công việc chung; từng lượt chạy kèm công cụ, token và chi phí; và khung chat nơi agent xin phép trước khi hành động.",
    note: "Chụp từ workspace demo của console, không phải dữ liệu khách hàng.",
    cta: "Khám phá kiến trúc",
  },
  integrations: {
    eyebrow: "Tích hợp & triển khai",
    title: "Kết nối với công cụ bạn *đang* dùng.",
    lede: `${FACTS.channels} kênh chat, ${FACTS.providers} nhà cung cấp mô hình và MCP server của riêng bạn. Mang theo API key, dewee kết nối tất cả mà không bắt bạn phải chuyển nhà.`,
    channels: "Kênh chat",
    providers: "Nhà cung cấp mô hình",
    cta: "Xem mọi tích hợp",
    deployTitle: "Chạy ở *nơi bạn chọn*.",
    deployLede: "Tự cài miễn phí trên máy của bạn, hoặc chọn On-Premises để chúng tôi cài đặt, dựng quy trình và chăm sóc bạn suốt năm đầu.",
  },
  security: {
    eyebrow: "Bảo mật",
    title: "Đóng từ cửa. Mở *có chủ đích*.",
    lede: "Nhiều nền tảng agent mở toang mọi thứ rồi cầu may. dewee bắt đầu với cửa đóng: không token thì không kết nối, chưa phê duyệt thì không chat. Sau đó bạn quyết định mỗi agent được làm gì.",
    layers: [
      { name: "Transport", body: "CORS, xác thực chống timing attack, giới hạn tần suất ngay từ cửa." },
      { name: "Input", body: "Kiểm tra prompt injection trước khi tới mô hình: mặc định cảnh báo, chặn khi bạn chọn." },
      { name: "Tools", body: "Chính sách quyết định agent nào được chạy gì, ở đâu." },
      { name: "Output", body: "Khoá, token và bí mật bị lọc khỏi mọi câu trả lời." },
      { name: "Isolation", body: "Dữ liệu tách theo tenant, workspace riêng cho agent, thực thi trong sandbox." },
    ],
    stamp: "10",
    stampNote: "Mã hoá AES-256-GCM cho credential lưu trữ",
    cta: "Đọc về mô hình bảo mật",
  },
  engineering: {
    eyebrow: "Kỹ thuật đã kiểm chứng",
    title: "Bài tập về nhà, chúng tôi *làm hết rồi*.",
    lede: "Agent chạm vào khách hàng thật và tiền thật thì không thể là bản demo làm vội cuối tuần. Từng dòng dưới đây là thứ chúng tôi đã xây, đã kiểm thử, và cố tình phá thử, để bạn không bao giờ phải làm điều đó.",
    items: [
      { text: `${FACTS.goTests.roundedVi} bài test tự động chạy trước mỗi bản phát hành`, detail: "Cô lập tenant, khởi động trong hỗn loạn, prompt injection… đủ cả." },
      { text: `${FACTS.goLines.roundedVi} dòng Go, tính cả mã kiểm thử`, detail: "Một runtime trọn gói, viết rồi đọc lại." },
      { text: "5 lớp phòng thủ giữa dữ liệu của bạn và internet", detail: "Đóng từ cửa: có token mới kết nối, người lạ phải được phê duyệt mới chat được." },
      { text: `${FACTS.providers} nhà cung cấp mô hình, agent nào cũng có dự phòng`, detail: "Nhà cung cấp gặp sự cố, agent của bạn vẫn làm việc." },
      { text: `${FACTS.channels} kênh chat, có cả Zalo và Pancake`, detail: "Làm cho đúng cách người Việt và Đông Nam Á trò chuyện." },
      { text: `Bản ổn định v${FACTS.stableRelease.version}, có changelog công khai`, detail: "Ra bản đều, vá lỗi nhanh, changelog ghi rõ từng thay đổi." },
    ],
    grade: "10",
    signature: "Đội ngũ đã chấm, bài test chấm lại lần nữa",
  },
  pricing: {
    eyebrow: "Bảng giá",
    title: "Chạy ngay trên *hạ tầng của bạn*.",
    lede: "Tại Việt Nam, runtime dewee chạy ngay trên máy chủ hoặc Mac mini của công ty bạn. Bạn tự cài miễn phí, hoặc chọn On-Premises để chúng tôi lo phần cài đặt.",
    cta: "So sánh hai cách triển khai",
  },
  company: {
    eyebrow: "Đội ngũ đứng sau",
    title: "Từ đội ngũ làm ra *GoClaw*.",
    lede: "GoClaw ra đời tháng 2/2026 như một agent gateway mã nguồn mở và vẫn miễn phí cho cộng đồng. dewee là người em mã nguồn đóng, được ba nhà sáng lập trong gia đình NextLevelBuilder gia cố cho doanh nghiệp.",
    storyCta: "Đọc toàn bộ câu chuyện",
    aboutCta: "Gặp gỡ nhà sáng lập",
  },
  faq: {
    eyebrow: "Hỏi nhanh, đáp gọn",
    title: "Những điều mọi người hỏi *đầu tiên*.",
    items: [
      { q: "\"Cộng tác giữa con người và AI agent\" trong dewee nghĩa là gì?", a: "Con người và AI agent làm việc trong cùng một workspace. Agent trưởng nhóm tách yêu cầu thành các việc trên bảng công việc chung, giao cho agent thành viên rồi tổng hợp kết quả; con người giao việc, xem lại và phê duyệt những gì quan trọng. Đây là phối hợp qua công việc, tin nhắn và phê duyệt, không phải cùng sửa một tài liệu theo thời gian thực." },
      { q: "Bắt đầu như thế nào?", a: "Cài dewee lên máy chủ hoặc Mac mini của bạn bằng script cài đặt hoặc Docker, hoàn toàn miễn phí. Tạo tài khoản chủ sở hữu trên bảng điều khiển, thêm nhà cung cấp LLM bằng API key của bạn rồi tạo agent đầu tiên. Muốn kết nối kênh chat như Zalo, Telegram hay Slack, bạn cần license $500/năm cho workspace đó. Nếu muốn chúng tôi cài đặt và dựng quy trình cùng bạn, hãy chọn gói On-Premises." },
      { q: "Điều gì ngăn agent làm việc không được phép?", a: "Mỗi agent chỉ dùng được công cụ và kênh bạn cấp. Công việc có thể yêu cầu người duyệt trước khi hoàn tất, lệnh nhạy cảm phải chờ thành viên duyệt hoặc từ chối, và mọi lượt chạy đều có trace để bạn thấy rõ chuyện gì đã xảy ra và vì sao." },
      { q: "Dữ liệu có nằm trên máy chủ của chúng tôi không?", a: "Có. Gói On-Premises chạy runtime dewee trên VPS hoặc Mac mini của bạn, kích hoạt bằng license key. Hoặc bạn tự cài dewee lên máy của mình: cài đặt miễn phí, license dùng để kết nối kênh chat." },
      { q: "Dùng được những mô hình AI nào?", a: `Anthropic, OpenAI, Gemini, DeepSeek, Qwen, Mistral, xAI, OpenRouter, Groq, Ollama và hơn thế: ${FACTS.providers} nhà cung cấp. Bạn dùng API key của mình, và mỗi agent có thể tự chuyển sang nhà cung cấp dự phòng.` },
      { q: "Nhân viên có phải học công cụ mới không?", a: "Gần như không. Agent vào ngay các ứng dụng chat đội ngũ đang dùng như Telegram, Zalo, Slack, Lark hay Discord. Quản trị viên có console; mọi người khác chỉ cần @nhắc tên agent." },
      { q: "dewee có phải là GoClaw đổi tên không?", a: "Không. dewee lớn lên từ GoClaw nhưng là sản phẩm riêng, mã nguồn đóng, được gia cố cho doanh nghiệp, có bảng điều khiển khách hàng, license và đội ngũ hỗ trợ. GoClaw vẫn mở và miễn phí cho mục đích phi thương mại." },
    ],
  },
  cta: {
    title: "Đưa agent *vào làm việc*.",
    body: "Tự cài dewee và giao cho agent đầu tiên một việc thật, hoặc kể chúng tôi nghe những việc đội ngũ bạn muốn bớt đi. Tin nhắn nào cũng được trả lời.",
    primary: "Cài dewee miễn phí",
    secondary: "Trò chuyện với chúng tôi",
    note: "Đội ngũ của bạn. Agent của bạn. Quy tắc của bạn.",
  },
};
