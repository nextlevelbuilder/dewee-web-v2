/**
 * Homepage copy, EN + VI. Numbers are measured from the dewee repo (2026-09-24):
 * 637,225 lines of Go in internal/, ~8,900 Go test functions, 10 channel adapters,
 * 6 stable releases in September 2026 (v3.28 → v3.33).
 * Inline markup: *em*, ==mark==, ~~scribble~~ (see src/lib/inline-markup.ts).
 */
import type { Bi } from "~/i18n/config";

type ArchitectureLabels = { channels: string; gateway: string; pipeline: string; memory: string; tools: string; teams: string; providers: string; traces: string; stages: string };

export const HOME: Bi<{
  meta: { title: string; description: string };
  hero: {
    eyebrow: string;
    title: string;
    lede: string;
    primary: string;
    secondary: string;
    note: string;
    chat: { channel: string; lines: { who: string; role?: string; text: string; me?: boolean }[] };
  };
  proof: { value: string; label: string }[];
  homework: { eyebrow: string; title: string; lede: string; items: { text: string; detail: string }[]; grade: string; signature: string };
  pillars: { eyebrow: string; title: string; lede: string; cta: string; items: { icon: string; title: string; body: string }[] };
  useCases: { eyebrow: string; title: string; lede: string; cta: string; note: string };
  steps: { eyebrow: string; title: string; items: { title: string; body: string }[] };
  architecture: { eyebrow: string; title: string; lede: string; cta: string; labels: ArchitectureLabels };
  security: { eyebrow: string; title: string; lede: string; layers: { name: string; body: string }[]; stamp: string; stampNote: string; cta: string };
  integrations: { eyebrow: string; title: string; lede: string; channels: string; providers: string; cta: string };
  deploy: { eyebrow: string; title: string; lede: string; cta: string };
  story: { eyebrow: string; title: string; body: string[]; quote: string; cta: string; timeline: { date: string; text: string }[] };
  founders: { eyebrow: string; title: string; lede: string; cta: string };
  ecosystem: { eyebrow: string; title: string; lede: string };
  faq: { eyebrow: string; title: string; items: { q: string; a: string }[] };
  cta: { title: string; body: string; primary: string; secondary: string; note: string };
}> = {
  en: {
    meta: {
      title: "dewee: AI agents for business. The hard part is ours.",
      description:
        "dewee puts AI agents to work inside your company: in the chats your team already uses, on the models you trust, behind security that is closed by default. From the team behind GoClaw.",
    },
    hero: {
      eyebrow: "Enterprise AI agents · from the makers of GoClaw",
      title: "The hard part is *ours*. The future is ~~yours~~.",
      lede:
        "dewee puts AI agents to work inside your company: in the chats your team already lives in, on the models you trust, behind security that starts closed. We did the homework, so your business can simply move forward.",
      primary: "Talk to us",
      secondary: "See what it can do",
      note: "it even follows up on Thursdays",
      chat: {
        channel: "#sales-team",
        lines: [
          { who: "Lan", role: "Sales", text: "@dewee the Da Nang client wants an on-prem quote with 3 custom workflows. Can you draft it?" },
          { who: "dewee", text: "Drafted from the 2026 price sheet ✓ I attached the security one-pager they asked about last week. Minh, can you approve before 5pm?", me: true },
          { who: "Minh", role: "Head of Sales", text: "Approved." },
          { who: "dewee", text: "Sent. If they go quiet, I'll nudge them on Thursday.", me: true },
        ],
      },
    },
    proof: [
      { value: "637,225", label: "lines of Go" },
      { value: "8,900+", label: "automated tests" },
      { value: "5", label: "defence layers" },
      { value: "20+", label: "model providers" },
      { value: "10", label: "chat channels" },
    ],
    homework: {
      eyebrow: "Homework, checked",
      title: "We did the homework. *All of it.*",
      lede:
        "Agents that touch real customers and real money cannot be a weekend demo. Every line below is something we built, tested and broke on purpose, so you never have to.",
      items: [
        { text: "637,225 lines of Go, written and re-read", detail: "One ~25 MB binary. Starts in under a second." },
        { text: "8,900+ automated tests on every change", detail: "Tenant isolation, chaos start-ups, prompt injection, the lot." },
        { text: "5 defence layers between your data and the internet", detail: "Closed by default. You open only what you need." },
        { text: "20+ model providers, each with a fallback", detail: "When one provider has a bad day, your agents don't." },
        { text: "10 chat channels, Zalo and Pancake included", detail: "Built for how Southeast Asian teams actually talk." },
        { text: "6 stable releases in September alone", detail: "We ship, we patch, we write it all down in the changelog." },
      ],
      grade: "10",
      signature: "Checked by the team, re-checked by the tests",
    },
    pillars: {
      eyebrow: "Everything is for you",
      title: "Agents that *clock in*, not chatbots that wait.",
      cta: "See every feature",
      lede: "dewee is the whole back office for AI co-workers: where they talk, what they know, how they think, who they answer to, and a record of everything they did.",
      items: [
        { icon: "messages-square", title: "Where your team already talks", body: "Telegram, Zalo, Slack, Lark, Discord, WhatsApp, Facebook and more. No new app to roll out." },
        { icon: "brain", title: "Remembers what matters", body: "Three-tier memory and a knowledge vault, so an agent learns your business instead of asking twice." },
        { icon: "users", title: "Works as a team", body: "Agents share task boards, delegate to each other and escalate to a human when it counts." },
        { icon: "route", title: "Thinks on the models you trust", body: "Anthropic, OpenAI, Gemini, DeepSeek, Qwen, local Ollama… with automatic fallback per agent." },
        { icon: "workflow", title: "Runs on schedule, not on vibes", body: "Cron jobs, visual workflows and heartbeats turn one-off prompts into dependable routines." },
        { icon: "scan-eye", title: "Shows its work", body: "Every run is traced: which model, which tool, how long, how much. Nothing happens off the record." },
      ],
    },
    useCases: {
      eyebrow: "Table of contents",
      title: "Fourteen jobs dewee already does *today*.",
      lede: "Not a wishlist. Each one is a pattern we have deployed, with the channels, tools and guardrails it needs.",
      cta: "Browse every use case",
      note: "and counting",
    },
    steps: {
      eyebrow: "How we work together",
      title: "Three exercises. We do the *hard* one.",
      items: [
        { title: "Tell us where it hurts", body: "One call to map the work that eats your team's week: the follow-ups, the reports, the questions asked a hundred times." },
        { title: "We build the agents with you", body: "We wire up your channels, models and knowledge, set the guardrails, and test against your real conversations." },
        { title: "They clock in", body: "Agents join your chats and start working. We watch the traces with you and keep tuning until the numbers move." },
      ],
    },
    architecture: {
      eyebrow: "Under the hood",
      title: "One small binary. A *very* careful pipeline.",
      lede: "Every message passes through an eight-stage loop, with memory, tools and teammates on hand, and a trace written at every step.",
      cta: "Explore the architecture",
      labels: {
        channels: "Channels",
        gateway: "dewee gateway",
        pipeline: "8-stage agent loop",
        memory: "Memory & vault",
        tools: "Tools & MCP",
        teams: "Agent teams",
        providers: "Model providers",
        traces: "Traces & usage",
        stages: "context · history · prompt · think · act · observe · memory · summarize",
      },
    },
    security: {
      eyebrow: "Security",
      title: "Closed by default. Opened *on purpose*.",
      lede: "Most agent stacks start wide open and hope for the best. dewee starts shut, and every capability an agent gets is one you granted.",
      layers: [
        { name: "Transport", body: "CORS, timing-safe auth, rate limits at the door." },
        { name: "Input", body: "Prompt-injection detection before anything reaches a model." },
        { name: "Tools", body: "A policy engine decides which agent may run what, where." },
        { name: "Output", body: "Keys, tokens and secrets are scrubbed from every reply." },
        { name: "Isolation", body: "Per-tenant data, per-agent workspaces, sandboxed execution." },
      ],
      stamp: "10",
      stampNote: "AES-256-GCM on every stored secret",
      cta: "Read the security model",
    },
    integrations: {
      eyebrow: "Integrations",
      title: "Plugs into the tools you *already* pay for.",
      lede: "Bring your chat apps, your model keys and your MCP servers. dewee connects them without asking you to move house.",
      channels: "Chat channels",
      providers: "Model providers",
      cta: "See all integrations",
    },
    deploy: {
      eyebrow: "Deployment",
      title: "Your cloud, ours, or *somewhere in between*.",
      lede: "Start on our shared cloud, move to a dedicated runtime, or keep everything on your own hardware. Same product, same care.",
      cta: "Compare deployment options",
    },
    story: {
      eyebrow: "Our story",
      title: "From GoClaw to dewee: *why we closed the source*.",
      body: [
        "GoClaw started in February 2026 as an open-source agent gateway: inspired by OpenClaw, rebuilt from scratch in Go, and adopted by thousands of builders.",
        "Then businesses came asking for more: stricter security, faster patches, someone to call. An open codebase meant a bigger attack surface than a small team could guard. So GoClaw stays open and free for the community, and dewee carries the enterprise weight.",
      ],
      quote: "Inspired by OpenClaw. Rebuilt from scratch. Grown up for business.",
      cta: "Read the whole story",
      timeline: [
        { date: "Feb 2026", text: "GoClaw's first commit" },
        { date: "Mar 2026", text: "GoClaw v1 & v2 ship in public" },
        { date: "Apr 2026", text: "v3: multi-tenant, teams, 5-layer security" },
        { date: "Jun 2026", text: "dewee forks off for enterprise" },
        { date: "Sep 2026", text: "dewee v3.33, six releases this month" },
      ],
    },
    founders: {
      eyebrow: "The people behind it",
      title: "Three builders who have *done this before*.",
      lede: "Between us: an open-source hit with 130K+ stars, commerce software for 10,000+ businesses, and systems serving hundreds of thousands of concurrent users.",
      cta: "Meet the team",
    },
    ecosystem: {
      eyebrow: "The NextLevelBuilder family",
      title: "dewee has *siblings*.",
      lede: "Each product solves one hard part well. Together they cover knowledge, tooling, design and hosting for AI-first teams.",
    },
    faq: {
      eyebrow: "Questions, answered",
      title: "Things people ask us *first*.",
      items: [
        { q: "Is dewee just GoClaw with a new name?", a: "No. dewee grew out of GoClaw, but it is a separate, closed-source product with enterprise hardening, a customer control plane, licensing and a team that supports you. GoClaw remains open and free for non-commercial use." },
        { q: "Can we keep our data on our own servers?", a: "Yes. The On-Premises option runs the dewee runtime on your VPS or Mac mini, activated by a licence key. In Vietnam, On-Premises is the only option we offer." },
        { q: "Which AI models can we use?", a: "Anthropic, OpenAI, Gemini, DeepSeek, Qwen, Mistral, xAI, OpenRouter, Groq, Ollama and more: 20+ providers. You bring your own keys, and each agent can fall back to another provider automatically." },
        { q: "Do our people need to learn a new tool?", a: "Not really. Agents join the chat apps your team already uses, such as Telegram, Zalo, Slack, Lark or Discord. Admins get a control panel; everyone else just @mentions the agent." },
        { q: "How long does it take to go live?", a: "A shared SaaS workspace is ready the same day. Dedicated and on-premises setups usually take one to three weeks, including the custom workflows we build with you." },
        { q: "What happens if an agent gets something wrong?", a: "Every run is traced, sensitive actions can require approval, and agents hand off to a human when they are unsure. You can see exactly what happened and why." },
      ],
    },
    cta: {
      title: "Let us do the *hard part*.",
      body: "Tell us about the work your team would rather not do. We will show you what an agent can take off their plate, usually within one call.",
      primary: "Talk to us",
      secondary: "Chat with dewee now",
      note: "we reply to every message, promise",
    },
  },

  vi: {
    meta: {
      title: "dewee: AI agent cho doanh nghiệp. Phần khó để chúng tôi lo.",
      description:
        "dewee đưa AI agent vào làm việc ngay trong doanh nghiệp bạn: trong những nhóm chat đội ngũ đang dùng, trên các mô hình bạn tin tưởng, với bảo mật đóng mặc định. Từ đội ngũ làm ra GoClaw.",
    },
    hero: {
      eyebrow: "AI agent cho doanh nghiệp · từ đội ngũ làm ra GoClaw",
      title: "Phần khó để *chúng tôi* lo. Tương lai là của ~~bạn~~.",
      lede:
        "dewee đưa AI agent vào làm việc ngay trong công ty bạn: trong những nhóm chat đội ngũ vẫn dùng mỗi ngày, trên các mô hình bạn tin tưởng, sau lớp bảo mật đóng từ đầu. Bài tập khó, chúng tôi làm rồi. Doanh nghiệp bạn chỉ việc tiến lên.",
      primary: "Trò chuyện với chúng tôi",
      secondary: "Xem dewee làm được gì",
      note: "nó còn biết tự nhắc việc nữa",
      chat: {
        channel: "#nhom-sales",
        lines: [
          { who: "Chị Lan", role: "Sales", text: "@dewee khách Đà Nẵng cần báo giá on-prem kèm 3 quy trình tuỳ chỉnh, em soạn giúp chị nhé?" },
          { who: "dewee", text: "Em soạn xong theo bảng giá 2026 rồi ạ ✓ Em đính kèm luôn tài liệu bảo mật khách hỏi tuần trước. Anh Minh duyệt giúp em trước 5 giờ nhé?", me: true },
          { who: "Anh Minh", role: "Trưởng phòng Sales", text: "Duyệt." },
          { who: "dewee", text: "Đã gửi khách. Thứ Năm khách chưa phản hồi thì em nhắc lại ạ.", me: true },
        ],
      },
    },
    proof: [
      { value: "637.225", label: "dòng code Go" },
      { value: "8.900+", label: "bài test tự động" },
      { value: "5", label: "lớp phòng thủ" },
      { value: "20+", label: "nhà cung cấp mô hình" },
      { value: "10", label: "kênh chat" },
    ],
    homework: {
      eyebrow: "Bài tập đã chấm",
      title: "Bài tập về nhà, chúng tôi *làm hết rồi*.",
      lede:
        "Agent chạm vào khách hàng thật và tiền thật thì không thể là bản demo làm vội cuối tuần. Từng dòng dưới đây là thứ chúng tôi đã xây, đã kiểm thử, và cố tình phá thử, để bạn không bao giờ phải làm điều đó.",
      items: [
        { text: "637.225 dòng Go, viết rồi đọc lại", detail: "Một file chạy ~25 MB. Khởi động dưới một giây." },
        { text: "8.900+ bài test tự động cho mỗi thay đổi", detail: "Cô lập tenant, khởi động trong hỗn loạn, prompt injection… đủ cả." },
        { text: "5 lớp phòng thủ giữa dữ liệu của bạn và internet", detail: "Đóng mặc định. Bạn chỉ mở đúng thứ cần mở." },
        { text: "20+ nhà cung cấp mô hình, cái nào cũng có dự phòng", detail: "Nhà cung cấp gặp sự cố, agent của bạn vẫn làm việc." },
        { text: "10 kênh chat, có cả Zalo và Pancake", detail: "Làm cho đúng cách người Việt và Đông Nam Á trò chuyện." },
        { text: "6 bản phát hành ổn định chỉ riêng tháng 9", detail: "Ra bản đều, vá lỗi nhanh, ghi chép đầy đủ trong changelog." },
      ],
      grade: "10",
      signature: "Đội ngũ đã chấm, bài test chấm lại lần nữa",
    },
    pillars: {
      eyebrow: "Tất cả là dành cho bạn",
      title: "Agent *đi làm* thật, không phải chatbot ngồi chờ.",
      cta: "Xem mọi tính năng",
      lede: "dewee là cả một văn phòng hậu cần cho đồng nghiệp AI: trò chuyện ở đâu, biết những gì, suy nghĩ bằng mô hình nào, báo cáo cho ai, và ghi lại mọi việc đã làm.",
      items: [
        { icon: "messages-square", title: "Ngay nơi đội ngũ đang trò chuyện", body: "Telegram, Zalo, Slack, Lark, Discord, WhatsApp, Facebook và hơn thế. Không cần triển khai thêm app mới." },
        { icon: "brain", title: "Nhớ những gì quan trọng", body: "Bộ nhớ 3 tầng và kho tri thức, để agent hiểu doanh nghiệp bạn thay vì hỏi đi hỏi lại." },
        { icon: "users", title: "Làm việc theo đội", body: "Agent dùng chung bảng việc, giao việc cho nhau và chuyển cho người thật khi cần." },
        { icon: "route", title: "Suy nghĩ bằng mô hình bạn tin", body: "Anthropic, OpenAI, Gemini, DeepSeek, Qwen, Ollama chạy nội bộ… tự động chuyển dự phòng cho từng agent." },
        { icon: "workflow", title: "Chạy theo lịch, không theo hứng", body: "Cron, quy trình trực quan và heartbeat biến câu lệnh một lần thành thói quen đáng tin cậy." },
        { icon: "scan-eye", title: "Minh bạch từng bước", body: "Mỗi lần chạy đều có trace: mô hình nào, công cụ nào, mất bao lâu, tốn bao nhiêu. Không gì nằm ngoài sổ sách." },
      ],
    },
    useCases: {
      eyebrow: "Mục lục",
      title: "Mười bốn việc dewee *đang làm* mỗi ngày.",
      lede: "Không phải danh sách ước mơ. Mỗi mục là một mô hình chúng tôi đã triển khai, kèm kênh, công cụ và hàng rào an toàn tương ứng.",
      cta: "Xem mọi ứng dụng",
      note: "và còn nữa",
    },
    steps: {
      eyebrow: "Chúng ta làm việc cùng nhau thế nào",
      title: "Ba bài tập. Chúng tôi làm *bài khó*.",
      items: [
        { title: "Kể chúng tôi nghe chỗ đau", body: "Một cuộc gọi để vẽ ra những việc đang ngốn tuần làm việc của đội bạn: nhắc việc, báo cáo, những câu hỏi lặp lại cả trăm lần." },
        { title: "Cùng bạn dựng agent", body: "Chúng tôi kết nối kênh chat, mô hình và tri thức, dựng hàng rào an toàn, rồi thử trên chính những cuộc trò chuyện thật của bạn." },
        { title: "Agent bắt đầu đi làm", body: "Agent vào nhóm chat và bắt tay vào việc. Chúng tôi cùng bạn theo dõi trace và tinh chỉnh tới khi con số thay đổi." },
      ],
    },
    architecture: {
      eyebrow: "Bên trong",
      title: "Một file chạy nhỏ gọn. Một pipeline *rất* cẩn thận.",
      lede: "Mỗi tin nhắn đi qua vòng lặp 8 bước, có bộ nhớ, công cụ và đồng đội hỗ trợ, và ghi trace ở từng bước.",
      cta: "Khám phá kiến trúc",
      labels: {
        channels: "Kênh chat",
        gateway: "dewee gateway",
        pipeline: "Vòng lặp agent 8 bước",
        memory: "Bộ nhớ & kho tri thức",
        tools: "Công cụ & MCP",
        teams: "Đội agent",
        providers: "Nhà cung cấp mô hình",
        traces: "Trace & chi phí",
        stages: "ngữ cảnh · lịch sử · prompt · suy nghĩ · hành động · quan sát · ghi nhớ · tóm tắt",
      },
    },
    security: {
      eyebrow: "Bảo mật",
      title: "Đóng mặc định. Mở *có chủ đích*.",
      lede: "Nhiều nền tảng agent mở toang mọi thứ rồi cầu may. dewee bắt đầu từ trạng thái đóng, và mọi quyền agent có đều do chính bạn cấp.",
      layers: [
        { name: "Transport", body: "CORS, xác thực chống timing attack, giới hạn tần suất ngay từ cửa." },
        { name: "Input", body: "Phát hiện prompt injection trước khi tới mô hình." },
        { name: "Tools", body: "Chính sách quyết định agent nào được chạy gì, ở đâu." },
        { name: "Output", body: "Khoá, token và bí mật bị lọc khỏi mọi câu trả lời." },
        { name: "Isolation", body: "Dữ liệu tách theo tenant, workspace riêng cho agent, thực thi trong sandbox." },
      ],
      stamp: "10",
      stampNote: "Mã hoá AES-256-GCM cho mọi bí mật",
      cta: "Đọc về mô hình bảo mật",
    },
    integrations: {
      eyebrow: "Tích hợp",
      title: "Kết nối với những công cụ bạn *đã* trả tiền.",
      lede: "Mang theo ứng dụng chat, khoá API mô hình và MCP server của bạn. dewee kết nối tất cả mà không bắt bạn phải chuyển nhà.",
      channels: "Kênh chat",
      providers: "Nhà cung cấp mô hình",
      cta: "Xem mọi tích hợp",
    },
    deploy: {
      eyebrow: "Triển khai",
      title: "Chạy ngay trên *hạ tầng của bạn*.",
      lede: "Tại Việt Nam, dewee được triển khai On-Premises: cài trên máy chủ hoặc Mac mini của bạn, dữ liệu không rời khỏi công ty. Chúng tôi cài đặt, dựng quy trình và chăm sóc bạn suốt năm đầu.",
      cta: "Xem chi tiết gói On-Premises",
    },
    story: {
      eyebrow: "Câu chuyện",
      title: "Từ GoClaw đến dewee: *vì sao chúng tôi đóng mã nguồn*.",
      body: [
        "GoClaw ra đời tháng 2/2026 như một agent gateway mã nguồn mở: lấy cảm hứng từ OpenClaw, viết lại từ đầu bằng Go, và được hàng nghìn nhà phát triển đón nhận.",
        "Rồi doanh nghiệp tìm đến và cần nhiều hơn: bảo mật chặt hơn, vá lỗi nhanh hơn, có người để gọi khi cần. Mã nguồn mở đồng nghĩa bề mặt tấn công lớn hơn sức một đội nhỏ canh giữ. Vậy nên GoClaw vẫn mở và miễn phí cho cộng đồng, còn dewee gánh phần doanh nghiệp.",
      ],
      quote: "Lấy cảm hứng từ OpenClaw. Viết lại từ đầu. Trưởng thành cho doanh nghiệp.",
      cta: "Đọc toàn bộ câu chuyện",
      timeline: [
        { date: "02/2026", text: "Commit đầu tiên của GoClaw" },
        { date: "03/2026", text: "GoClaw v1 & v2 ra mắt công khai" },
        { date: "04/2026", text: "v3: đa tenant, đội agent, bảo mật 5 lớp" },
        { date: "06/2026", text: "dewee tách ra cho doanh nghiệp" },
        { date: "09/2026", text: "dewee v3.33, sáu bản phát hành trong tháng" },
      ],
    },
    founders: {
      eyebrow: "Những người đứng sau",
      title: "Ba người xây sản phẩm đã *từng làm được*.",
      lede: "Cộng lại: một dự án mã nguồn mở 130K+ sao, phần mềm thương mại cho hơn 10.000 doanh nghiệp, và những hệ thống phục vụ hàng trăm nghìn người dùng cùng lúc.",
      cta: "Gặp gỡ đội ngũ",
    },
    ecosystem: {
      eyebrow: "Gia đình NextLevelBuilder",
      title: "dewee có *anh chị em*.",
      lede: "Mỗi sản phẩm giải quyết thật tốt một phần khó. Cùng nhau, chúng lo trọn tri thức, công cụ, thiết kế và hạ tầng cho những đội ngũ làm việc cùng AI.",
    },
    faq: {
      eyebrow: "Hỏi nhanh, đáp gọn",
      title: "Những điều mọi người hỏi *đầu tiên*.",
      items: [
        { q: "dewee có phải là GoClaw đổi tên không?", a: "Không. dewee lớn lên từ GoClaw nhưng là sản phẩm riêng, mã nguồn đóng, được gia cố cho doanh nghiệp, có bảng điều khiển khách hàng, license và đội ngũ hỗ trợ. GoClaw vẫn mở và miễn phí cho mục đích phi thương mại." },
        { q: "Dữ liệu có nằm trên máy chủ của chúng tôi không?", a: "Có. Gói On-Premises chạy runtime dewee trên VPS hoặc Mac mini của bạn, kích hoạt bằng license key. Tại Việt Nam, On-Premises là phương thức triển khai duy nhất." },
        { q: "Dùng được những mô hình AI nào?", a: "Anthropic, OpenAI, Gemini, DeepSeek, Qwen, Mistral, xAI, OpenRouter, Groq, Ollama và hơn thế: hơn 20 nhà cung cấp. Bạn dùng khoá API của mình, và mỗi agent có thể tự chuyển sang nhà cung cấp dự phòng." },
        { q: "Nhân viên có phải học công cụ mới không?", a: "Gần như không. Agent vào ngay các ứng dụng chat đội ngũ đang dùng như Telegram, Zalo, Slack, Lark hay Discord. Quản trị viên có bảng điều khiển; mọi người khác chỉ cần @nhắc tên agent." },
        { q: "Mất bao lâu để đi vào hoạt động?", a: "Bản On-Premises thường mất một đến ba tuần, gồm cả cài đặt và các quy trình tuỳ chỉnh chúng tôi dựng cùng bạn." },
        { q: "Nếu agent làm sai thì sao?", a: "Mọi lần chạy đều có trace, thao tác nhạy cảm có thể yêu cầu phê duyệt, và agent chuyển cho người thật khi không chắc chắn. Bạn thấy rõ chuyện gì đã xảy ra và vì sao." },
      ],
    },
    cta: {
      title: "Để chúng tôi lo *phần khó*.",
      body: "Kể cho chúng tôi nghe những việc đội ngũ bạn không muốn làm. Chúng tôi sẽ cho bạn thấy agent có thể gánh bớt những gì, thường chỉ sau một cuộc gọi.",
      primary: "Trò chuyện với chúng tôi",
      secondary: "Chat với dewee ngay",
      note: "tin nhắn nào cũng được trả lời, hứa đó",
    },
  },
};

/** Small interface labels used only by homepage blocks. */
export const HOME_UI: Bi<{
  chatLabel: string;
  proofLabel: string;
  gradeLabel: string;
  exercise: string;
  stepNote: string;
  archLabel: string;
  more: (n: number) => string;
  core: string;
  includes: string;
  tradeoffs: string;
  badge: string;
  timelineLabel: string;
}> = {
  en: {
    chatLabel: "Example: dewee drafting a quote inside a sales team's group chat",
    proofLabel: "dewee by the numbers",
    gradeLabel: "Grade: 10 out of 10",
    exercise: "Exercise",
    stepNote: "the hard one is on us",
    archLabel: "How a message flows through dewee: channels, gateway, the 8-stage agent loop, model providers and traces",
    more: (n) => `+${n} more`,
    core: "Your data",
    includes: "What you get",
    tradeoffs: "Keep in mind",
    badge: "Our pick",
    timelineLabel: "From GoClaw to dewee",
  },
  vi: {
    chatLabel: "Ví dụ: dewee soạn báo giá ngay trong nhóm chat của đội sales",
    proofLabel: "dewee qua những con số",
    gradeLabel: "Điểm: 10 trên 10",
    exercise: "Bài",
    stepNote: "bài khó để tụi mình lo",
    archLabel: "Hành trình một tin nhắn qua dewee: kênh chat, gateway, vòng lặp agent 8 bước, nhà cung cấp mô hình và trace",
    more: (n) => `+${n} nữa`,
    core: "Dữ liệu của bạn",
    includes: "Bạn nhận được",
    tradeoffs: "Cần lưu ý",
    badge: "Gợi ý của chúng tôi",
    timelineLabel: "Từ GoClaw đến dewee",
  },
};
