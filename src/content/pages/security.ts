/**
 * /security copy, EN + VI. Every mechanism is verified against the dewee repo (2026-09-25):
 * docs/09-security.md, docs/03-tools-system.md (policy engine, shell deny groups, credentialed CLI),
 * internal/crypto/aes.go (AES-256-GCM, "aes-gcm:" + base64(nonce + ciphertext + tag)),
 * docs/23-multi-tenant-architecture.md, docs/05-channels-messaging.md (pairing), the licence
 * runbook (DEWEE_LICENSE_REQUIRED, 5-minute heartbeat) and release notes v3.29 / v3.30 / v3.33.
 * Honest caveats (CORS and injection defaults) are stated on the page, not hidden.
 */
import type { Bi } from "~/i18n/config";

type Mechanism = { title: string; body: string; since?: string };
type Layer = { id: string; icon: string; title: string; lede: string; items: Mechanism[] };
type Row = { topic: string; open: string; closed: string };

export const SECURITY_PAGE: Bi<{
  meta: { title: string; description: string; crumb: string };
  hero: { eyebrow: string; title: string; lede: string; note: string; primary: string; secondary: string };
  layers: {
    eyebrow: string;
    title: string;
    lede: string;
    core: string;
    stamp: string;
    stampNote: string;
    items: { name: string; body: string }[];
  };
  detail: { eyebrow: string; title: string; lede: string; indexLabel: string; since: string; count: (n: number) => string; groups: Layer[] };
  console: { eyebrow: string; title: string; lede: string };
  defaults: {
    eyebrow: string;
    title: string;
    lede: string;
    label: string;
    open: { title: string; motto: string; note: string };
    closed: { title: string; motto: string; tag: string };
    topicLabel: string;
    rows: Row[];
    footnoteTitle: string;
    footnote: string;
  };
  closedSource: { eyebrow: string; title: string; body: string[]; cta: string };
  disclosure: { eyebrow: string; title: string; body: string; includeLabel: string; include: string[]; cta: string; note: string };
  faq: { eyebrow: string; title: string; items: { q: string; a: string }[] };
  cta: { title: string; body: string; primary: string; secondary: string; note: string };
}> = {
  en: {
    meta: {
      title: "Security: closed by default, opened on purpose",
      description:
        "Five layers of defence in dewee: rate limits, prompt-injection checks, a tool policy engine, secret scrubbing, sandboxing, and AES-256-GCM for stored secrets.",
      crumb: "Security",
    },
    hero: {
      eyebrow: "Security",
      title: "Closed by default. Opened *on purpose*.",
      lede: "Most agent stacks start wide open and lock down later. dewee starts shut: every channel, tool and network path an agent gets is one somebody granted.",
      note: "locks first, features second",
      primary: "See the five layers",
      secondary: "Report a vulnerability",
    },
    layers: {
      eyebrow: "Five layers",
      title: "Five checks between a message and *your* data.",
      lede: "Each layer assumes the one before it has already failed.",
      core: "Your data",
      stamp: "10",
      stampNote: "AES-256-GCM on every stored secret",
      items: [
        { name: "Transport", body: "Origin checks, size limits, constant-time auth and rate limits at the door." },
        { name: "Input", body: "Prompt-injection detection before anything reaches a model." },
        { name: "Tools", body: "A policy engine decides which agent may run what, and where." },
        { name: "Output", body: "Keys, tokens and secrets are scrubbed before a reply goes out." },
        { name: "Isolation", body: "Per-tenant data, per-user workspaces, sandboxed execution." },
      ],
    },
    detail: {
      eyebrow: "Layer by layer",
      title: "What each layer *actually* does.",
      lede: "Mechanisms, not adjectives. Plus how secrets are kept, and how every action leaves a trail.",
      indexLabel: "Jump to a layer",
      since: "since",
      count: (n) => `${n} mechanisms`,
      groups: [
        {
          id: "transport",
          icon: "network",
          title: "Transport",
          lede: "Who may knock, how loudly, and how often.",
          items: [
            { title: "Origin allow-list", body: "Browser requests are checked against the CORS origins you allow." },
            { title: "Size limits", body: "WebSocket messages are capped at 512 KB and HTTP bodies at 1 MB." },
            { title: "Constant-time token checks", body: "Tokens are compared in constant time, so response timing reveals nothing." },
            { title: "Rate limits", body: "A token bucket per user or IP, set in requests per minute." },
          ],
        },
        {
          id: "input",
          icon: "shield-alert",
          title: "Input",
          lede: "Suspicious instructions are caught on the way in.",
          items: [
            { title: "Six injection patterns", body: "Ignore-instructions, role override, fake system tags, injected instructions, null bytes and delimiter escapes." },
            { title: "You decide the response", body: "Log, warn (the default), block, or switch detection off." },
            { title: "Length limit", body: "Messages are cut at 32,000 characters by default." },
            { title: "Pairing for strangers", body: "Unknown senders need an admin-approved pairing code before the agent answers." },
          ],
        },
        {
          id: "tools",
          icon: "wrench",
          title: "Tools",
          lede: "An agent can only use what it was given.",
          items: [
            { title: "Seven-step policy engine", body: "Global, provider, agent and group rules apply in order, then deny lists, then explicit extra grants." },
            { title: "Shell deny list", body: "Seven categories of dangerous commands are blocked unless you open them." },
            { title: "SSRF guard", body: "Blocks localhost, internal hostnames, private IP ranges and cloud metadata, with DNS pinning across redirects." },
            { title: "Path guards", body: "No path traversal, and the runtime's own folders are hidden from agents." },
            { title: "CLIs without a shell", body: "Credentialed binaries are verified, arguments are checked per binary, the environment is scrubbed and shell chains are refused." },
            { title: "Human approvals", body: "Command execution and file writes can wait for a person to say yes." },
            { title: "Frozen workflow permissions", body: "A published workflow runs under the tool policy it was approved with.", since: "3.30" },
          ],
        },
        {
          id: "output",
          icon: "eye-off",
          title: "Output",
          lede: "What leaves is checked as carefully as what arrives.",
          items: [
            { title: "Known secret patterns", body: "Nine or more classes of keys and tokens, such as sk-, sk-ant-, ghp_, AKIA and connection strings, are redacted." },
            { title: "Exact-value scrubbing", body: "Secret values the process knows are replaced with [REDACTED], and server IPs with [SERVER_IP]." },
            { title: "Untrusted content is labelled", body: "Fetched web pages are wrapped as external, untrusted content before a model reads them." },
            { title: "Overheard chat is redacted", body: "Group messages the agent only listens to are redacted before they reach a model." },
            { title: "Seven-step reply clean-up", body: "Every reply passes a 7-step sanitiser before it is sent." },
          ],
        },
        {
          id: "isolation",
          icon: "boxes",
          title: "Isolation",
          lede: "When something goes wrong, it stays small.",
          items: [
            { title: "Tenant-scoped queries", body: "Every query filters by tenant, and a missing tenant fails closed." },
            { title: "Per-user workspaces", body: "Each user's files live in their own workspace." },
            { title: "Docker sandbox", body: "Read-only root, dropped capabilities, no network, 512 MB, 1 CPU, 300 seconds and 1 MB of output." },
            { title: "Unprivileged runtime", body: "The Docker image runs the gateway as an unprivileged user, not as root." },
            { title: "Operator hardening", body: "Gateway secrets are stripped from host exec, and credentials cannot be retargeted through the operator CLI.", since: "3.33" },
          ],
        },
        {
          id: "secrets",
          icon: "key-round",
          title: "Secrets at rest",
          lede: "Stored encrypted, shown once, never sent in the clear.",
          items: [
            { title: "AES-256-GCM", body: "Provider keys, MCP keys and OAuth credentials, custom tool env vars and CLI credentials are encrypted at rest." },
            { title: "Your key, your environment", body: "The encryption key is generated when you set dewee up and lives in your environment." },
            { title: "Hashed API keys", body: "SHA-256 hashed, shown once, scoped, expiring and revocable." },
            { title: "Licence guard", body: "With DEWEE_LICENSE_REQUIRED=1 no public listener opens until activation, and the heartbeat never sends the raw key." },
          ],
        },
        {
          id: "audit",
          icon: "scroll-text",
          title: "Audit & traces",
          lede: "Every action leaves a receipt.",
          items: [
            { title: "A trace for every run", body: "Model calls, tool calls and delegations are spans you can open and inspect." },
            { title: "Admin audit events", body: "Administrative actions are recorded as audit events." },
            { title: "Pairing approvals", body: "Every approved pairing records who approved it." },
            { title: "No silent tenant fallback", body: "An unknown tenant is rejected instead of quietly landing on the master tenant.", since: "3.29" },
            { title: "Fleet actions traced", body: "Fleet admin operations write trace spans too.", since: "3.29" },
          ],
        },
      ],
    },
    console: {
      eyebrow: "In the console",
      title: "Receipts you can *open*.",
      lede: "The activity log reads as plain sentences, each linked to its trace. API keys are scoped, shown once and revocable. Real screens, demo workspace.",
    },
    defaults: {
      eyebrow: "Two philosophies",
      title: "Open by default vs *closed* by default.",
      lede: "Both are honest choices. One suits a person experimenting on their own machine. The other suits a company with customers' data.",
      label: "Comparison of open-by-default and closed-by-default behaviour, with dewee's defaults",
      open: {
        title: "Open by default",
        motto: "Open everything, then lock gradually. You can't lock what you don't yet know needs locking.",
        note: "fine for a weekend project",
      },
      closed: {
        title: "Closed by default",
        motto: "Lock everything, then open gradually. An unknown risk is blocked until someone decides otherwise.",
        tag: "dewee's defaults",
      },
      topicLabel: "Situation",
      rows: [
        { topic: "A stranger messages the bot", open: "Anyone who finds it can chat.", closed: "They get a pairing code; an admin approves first." },
        { topic: "A fresh server boots", open: "Ports listen from the first second.", closed: "With the licence guard on, nothing listens publicly until activation." },
        { topic: "The model writes a shell command", open: "Whatever it types, runs.", closed: "Seven risky categories are denied; exec can wait for approval." },
        { topic: "A tool fetches a URL", open: "Your internal network is one link away.", closed: "Private ranges, localhost and cloud metadata are blocked." },
        { topic: "A key ends up in a reply", open: "It goes straight to the chat.", closed: "It is redacted before the reply is sent." },
        { topic: "A WhatsApp voice note arrives", open: "It is transcribed automatically.", closed: "Transcription stays off until you opt in." },
        { topic: "An agent gains new permissions", open: "Old automations quietly inherit them.", closed: "Published workflows keep the policy they were approved with." },
      ],
      footnoteTitle: "Honest footnote",
      footnote:
        "Two switches start permissive for backward compatibility: an empty CORS list allows every origin, and injection detection warns instead of blocking. Set both before you go live.",
    },
    closedSource: {
      eyebrow: "Why closed source",
      title: "An open codebase is a *bigger* target.",
      body: [
        "GoClaw is open source, and it stays open and free for the community. But an open codebase meant a bigger attack surface than a small team could guard for enterprises.",
        "So dewee is closed source, and it carries the enterprise weight. Closed source is not a security control on its own; the five layers above are. What it changes is who can study the code for weak spots while we keep hardening it.",
      ],
      cta: "Read the whole story",
    },
    disclosure: {
      eyebrow: "Responsible disclosure",
      title: "Found a hole? Tell us *first*.",
      body: "Email us what you found and how to reproduce it. Please give us a fair chance to fix it before you share it publicly, and never test against data that isn't yours.",
      includeLabel: "Helpful to include",
      include: ["The dewee version or release tag", "Steps to reproduce", "What you could see or change"],
      cta: "Email hi@nextlevelbuilder.io",
      note: "we'd rather hear it from you",
    },
    faq: {
      eyebrow: "Questions",
      title: "Security questions, *straight* answers.",
      items: [
        {
          q: "Where are secrets stored, and how?",
          a: "Provider keys, MCP keys and OAuth credentials, custom tool env vars and CLI credentials are encrypted at rest with AES-256-GCM. The key is generated when you set dewee up and lives in your environment.",
        },
        {
          q: "Can one tenant see another tenant's data?",
          a: "Every query is scoped by tenant, and a missing tenant is treated as an error rather than a default. Channels are bound to their tenant, and API keys carry scopes.",
        },
        {
          q: "What stops an agent from running a dangerous command?",
          a: "The tool policy engine decides which tools each agent may call. Seven categories of shell commands are denied by default, command execution and file writes can require approval, and code can run in a Docker sandbox with no network.",
        },
        {
          q: "How does dewee handle prompt injection?",
          a: "Six known patterns are detected on input. By default dewee logs and warns, and you can switch to blocking. Web content is marked as untrusted before a model reads it. Detection lowers the risk but cannot remove it, which is why the tool and output layers exist.",
        },
        {
          q: "Does the licence key protect my runtime?",
          a: "No, and it is not meant to. The licence key records what you are entitled to. Runtime calls use signed provisioning and runtime tokens, and the heartbeat never sends the raw key.",
        },
        {
          q: "Where do my prompts go?",
          a: "To the model providers you configure. If prompts must stay on your hardware, run local models through Ollama. The licence heartbeat sends only an activation id and a runtime token.",
        },
        {
          q: "How do I report a vulnerability?",
          a: "Email hi@nextlevelbuilder.io with what you found and how to reproduce it. Please give us a fair chance to fix it before you share it publicly.",
        },
      ],
    },
    cta: {
      title: "Security review on your *list*?",
      body: "We will walk your security team through every layer, with the traces open.",
      primary: "Talk to us",
      secondary: "Ask dewee",
      note: "bring the hard questions",
    },
  },
  vi: {
    meta: {
      title: "Bảo mật: đóng mặc định, mở có chủ đích",
      description:
        "Năm lớp phòng thủ của dewee: giới hạn tốc độ, phát hiện prompt injection, policy engine cho tool, che secret, sandbox, và mã hoá AES-256-GCM cho secret lưu trữ.",
      crumb: "Bảo mật",
    },
    hero: {
      eyebrow: "Bảo mật",
      title: "Đóng mặc định. Mở *có chủ đích*.",
      lede: "Nhiều nền tảng agent mở toang mọi thứ rồi mới khoá dần. dewee bắt đầu từ trạng thái đóng: mọi kênh, mọi tool, mọi đường mạng mà agent có đều do một người cấp.",
      note: "khoá trước, tính năng sau",
      primary: "Xem năm lớp phòng thủ",
      secondary: "Báo lỗ hổng",
    },
    layers: {
      eyebrow: "Năm lớp",
      title: "Năm lớp kiểm tra giữa tin nhắn và dữ liệu *của bạn*.",
      lede: "Mỗi lớp đều giả định lớp trước nó đã thất thủ.",
      core: "Dữ liệu của bạn",
      stamp: "10",
      stampNote: "AES-256-GCM cho mọi secret được lưu",
      items: [
        { name: "Transport", body: "Kiểm tra nguồn, giới hạn kích thước, xác thực thời gian hằng và giới hạn tốc độ ngay từ cửa." },
        { name: "Input", body: "Phát hiện prompt injection trước khi bất cứ thứ gì tới model." },
        { name: "Tool", body: "Policy engine quyết định agent nào được chạy gì, ở đâu." },
        { name: "Output", body: "Key, token và secret bị che trước khi câu trả lời được gửi đi." },
        { name: "Cô lập", body: "Dữ liệu tách theo tenant, workspace riêng từng người, chạy code trong sandbox." },
      ],
    },
    detail: {
      eyebrow: "Từng lớp một",
      title: "Mỗi lớp *thật sự* làm gì.",
      lede: "Cơ chế cụ thể, không phải tính từ. Kèm cách secret được cất giữ, và cách mọi thao tác đều để lại dấu vết.",
      indexLabel: "Đi tới lớp",
      since: "từ",
      count: (n) => `${n} cơ chế`,
      groups: [
        {
          id: "transport",
          icon: "network",
          title: "Transport",
          lede: "Ai được gõ cửa, gõ mạnh cỡ nào, và bao lâu một lần.",
          items: [
            { title: "Danh sách nguồn được phép", body: "Request từ trình duyệt được đối chiếu với các origin CORS bạn cho phép." },
            { title: "Giới hạn kích thước", body: "Tin nhắn WebSocket tối đa 512 KB, body HTTP tối đa 1 MB." },
            { title: "So khớp token thời gian hằng", body: "Token được so sánh trong thời gian không đổi, nên thời gian phản hồi không để lộ gì." },
            { title: "Giới hạn tốc độ", body: "Token bucket theo từng người dùng hoặc IP, tính bằng số request mỗi phút." },
          ],
        },
        {
          id: "input",
          icon: "shield-alert",
          title: "Input",
          lede: "Chỉ dẫn đáng ngờ bị bắt ngay ở đầu vào.",
          items: [
            { title: "Sáu mẫu injection", body: "Bảo bỏ qua chỉ dẫn, giả vai trò, thẻ system giả, chèn chỉ dẫn, null byte và thoát dấu phân cách." },
            { title: "Bạn chọn cách xử lý", body: "Ghi log, cảnh báo (mặc định), chặn, hoặc tắt hẳn." },
            { title: "Giới hạn độ dài", body: "Tin nhắn mặc định bị cắt ở 32.000 ký tự." },
            { title: "Ghép cặp với người lạ", body: "Người gửi lạ cần mã ghép cặp được admin duyệt thì agent mới trả lời." },
          ],
        },
        {
          id: "tools",
          icon: "wrench",
          title: "Tool",
          lede: "Agent chỉ dùng được những gì đã được giao.",
          items: [
            { title: "Policy engine bảy bước", body: "Luật toàn cục, theo nhà cung cấp, theo agent và theo nhóm áp dụng lần lượt, rồi tới danh sách cấm, rồi tới quyền cấp thêm rõ ràng." },
            { title: "Danh sách lệnh shell bị cấm", body: "Bảy nhóm lệnh nguy hiểm bị chặn, trừ khi bạn mở." },
            { title: "Chặn SSRF", body: "Chặn localhost, hostname nội bộ, dải IP riêng và metadata của cloud, có DNS pinning qua cả redirect." },
            { title: "Chặn đường dẫn", body: "Không cho path traversal, và giấu thư mục của chính runtime khỏi agent." },
            { title: "CLI không qua shell", body: "File chạy có credential được xác minh, tham số kiểm tra theo từng file, môi trường được làm sạch, chuỗi lệnh shell bị từ chối." },
            { title: "Người duyệt", body: "Lệnh thực thi và thao tác ghi file có thể chờ một người đồng ý." },
            { title: "Quyền workflow đóng băng", body: "Workflow đã publish chạy theo đúng chính sách tool lúc được duyệt.", since: "3.30" },
          ],
        },
        {
          id: "output",
          icon: "eye-off",
          title: "Output",
          lede: "Thứ đi ra được kiểm kỹ không kém thứ đi vào.",
          items: [
            { title: "Mẫu secret quen thuộc", body: "Từ chín nhóm key và token trở lên, như sk-, sk-ant-, ghp_, AKIA và chuỗi kết nối, đều bị che." },
            { title: "Che đúng giá trị", body: "Giá trị secret mà tiến trình biết được thay bằng [REDACTED], IP máy chủ thay bằng [SERVER_IP]." },
            { title: "Nội dung ngoài được dán nhãn", body: "Trang web tải về được bọc lại là nội dung bên ngoài, không đáng tin, trước khi model đọc." },
            { title: "Chat nghe lỏm được che", body: "Tin nhắn nhóm mà agent chỉ nghe được che bớt trước khi tới model." },
            { title: "Làm sạch câu trả lời bảy bước", body: "Mọi câu trả lời đi qua bộ làm sạch 7 bước trước khi gửi." },
          ],
        },
        {
          id: "isolation",
          icon: "boxes",
          title: "Cô lập",
          lede: "Khi có sự cố, nó chỉ nằm trong một góc nhỏ.",
          items: [
            { title: "Truy vấn theo tenant", body: "Mọi truy vấn đều lọc theo tenant, thiếu tenant là dừng lại." },
            { title: "Workspace riêng từng người", body: "File của mỗi người nằm trong workspace của riêng họ." },
            { title: "Docker sandbox", body: "Root chỉ đọc, bỏ bớt capability, không mạng, 512 MB, 1 CPU, 300 giây và 1 MB output." },
            { title: "Runtime không đặc quyền", body: "Image Docker chạy gateway bằng người dùng không đặc quyền, không phải root." },
            { title: "Siết quyền vận hành", body: "Secret của gateway bị loại khỏi lệnh exec trên host, và không thể đổi đích credential qua CLI vận hành.", since: "3.33" },
          ],
        },
        {
          id: "secrets",
          icon: "key-round",
          title: "Secret khi lưu trữ",
          lede: "Lưu dạng mã hoá, chỉ hiện một lần, không bao giờ gửi dạng rõ.",
          items: [
            { title: "AES-256-GCM", body: "Key nhà cung cấp, key MCP và credential OAuth, biến môi trường của tool tuỳ chỉnh và credential CLI đều được mã hoá khi lưu." },
            { title: "Key của bạn, môi trường của bạn", body: "Khoá mã hoá được tạo khi bạn cài đặt dewee và nằm trong môi trường của bạn." },
            { title: "API key được hash", body: "Hash SHA-256, chỉ hiện một lần, có scope, có hạn dùng và thu hồi được." },
            { title: "Licence guard", body: "Với DEWEE_LICENSE_REQUIRED=1, không cổng công khai nào mở trước khi kích hoạt, và heartbeat không bao giờ gửi key gốc." },
          ],
        },
        {
          id: "audit",
          icon: "scroll-text",
          title: "Kiểm toán & trace",
          lede: "Thao tác nào cũng để lại biên lai.",
          items: [
            { title: "Trace cho mọi lần chạy", body: "Lời gọi model, tool và giao việc đều là span để bạn mở ra xem." },
            { title: "Sự kiện kiểm toán quản trị", body: "Các thao tác quản trị được ghi lại thành sự kiện kiểm toán." },
            { title: "Duyệt ghép cặp", body: "Mỗi lần duyệt ghép cặp đều ghi lại ai là người duyệt." },
            { title: "Không âm thầm đổi tenant", body: "Tenant không xác định bị từ chối, thay vì rơi về tenant master.", since: "3.29" },
            { title: "Thao tác fleet có trace", body: "Thao tác quản trị fleet cũng ghi span vào trace.", since: "3.29" },
          ],
        },
      ],
    },
    console: {
      eyebrow: "Trong console",
      title: "Biên lai bạn *mở ra* được.",
      lede: "Nhật ký hoạt động viết thành câu dễ đọc, câu nào cũng dẫn tới trace của nó. API key có phạm vi, chỉ hiện một lần và thu hồi được. Màn hình thật, workspace demo.",
    },
    defaults: {
      eyebrow: "Hai triết lý",
      title: "Mở mặc định hay *đóng* mặc định.",
      lede: "Cả hai đều là lựa chọn thành thật. Một cách hợp với người tự vọc trên máy mình. Cách còn lại hợp với doanh nghiệp đang giữ dữ liệu của khách hàng.",
      label: "So sánh cách hành xử mở mặc định và đóng mặc định, kèm mặc định của dewee",
      open: {
        title: "Mở mặc định",
        motto: "Mở hết, rồi khoá dần. Bạn không thể khoá thứ mình chưa biết là cần khoá.",
        note: "ổn cho dự án cuối tuần",
      },
      closed: {
        title: "Đóng mặc định",
        motto: "Khoá hết, rồi mở dần. Rủi ro chưa biết thì bị chặn cho tới khi có người quyết khác.",
        tag: "mặc định của dewee",
      },
      topicLabel: "Tình huống",
      rows: [
        { topic: "Người lạ nhắn cho bot", open: "Ai tìm thấy cũng chat được.", closed: "Họ nhận mã ghép cặp; admin duyệt trước đã." },
        { topic: "Máy chủ mới khởi động", open: "Cổng mở ngay từ giây đầu tiên.", closed: "Khi bật licence guard, chưa kích hoạt thì chưa mở cổng công khai nào." },
        { topic: "Model viết một lệnh shell", open: "Gõ gì chạy nấy.", closed: "Bảy nhóm lệnh rủi ro bị cấm; lệnh thực thi có thể chờ duyệt." },
        { topic: "Tool tải một URL", open: "Mạng nội bộ chỉ cách một đường link.", closed: "Dải IP riêng, localhost và metadata của cloud bị chặn." },
        { topic: "Một key lọt vào câu trả lời", open: "Nó đi thẳng vào khung chat.", closed: "Nó bị che trước khi câu trả lời được gửi." },
        { topic: "Tin nhắn thoại WhatsApp tới", open: "Tự động chuyển thành chữ.", closed: "Chưa chuyển thành chữ cho tới khi bạn bật." },
        { topic: "Agent được cấp thêm quyền", open: "Tự động hoá cũ âm thầm hưởng theo.", closed: "Workflow đã publish giữ nguyên chính sách lúc được duyệt." },
      ],
      footnoteTitle: "Chú thích thật lòng",
      footnote:
        "Có hai công tắc mặc định còn dễ dãi để tương thích ngược: danh sách CORS trống sẽ cho mọi origin, và phát hiện injection chỉ cảnh báo chứ chưa chặn. Hãy đặt cả hai trước khi chạy thật.",
    },
    closedSource: {
      eyebrow: "Vì sao mã nguồn đóng",
      title: "Mã nguồn mở là một mục tiêu *lớn* hơn.",
      body: [
        "GoClaw là mã nguồn mở, và sẽ luôn mở, miễn phí cho cộng đồng. Nhưng một codebase mở cũng là bề mặt tấn công lớn hơn mức một đội nhỏ có thể canh giữ cho doanh nghiệp.",
        "Vì vậy dewee là mã nguồn đóng, và gánh phần việc của doanh nghiệp. Mã nguồn đóng tự nó không phải là một lớp bảo mật; năm lớp ở trên mới là. Điều nó thay đổi là ai có thể soi code để tìm điểm yếu, trong lúc chúng tôi tiếp tục gia cố.",
      ],
      cta: "Đọc cả câu chuyện",
    },
    disclosure: {
      eyebrow: "Công bố có trách nhiệm",
      title: "Tìm thấy lỗ hổng? Báo chúng tôi *trước*.",
      body: "Gửi email cho chúng tôi điều bạn tìm thấy và cách tái hiện. Mong bạn cho chúng tôi thời gian sửa trước khi công bố, và đừng bao giờ thử trên dữ liệu không phải của bạn.",
      includeLabel: "Nên gửi kèm",
      include: ["Phiên bản hoặc tag phát hành của dewee", "Các bước tái hiện", "Những gì bạn xem được hoặc sửa được"],
      cta: "Email hi@nextlevelbuilder.io",
      note: "chúng tôi muốn nghe từ bạn trước",
    },
    faq: {
      eyebrow: "Hỏi đáp",
      title: "Câu hỏi bảo mật, trả lời *thẳng*.",
      items: [
        {
          q: "Secret được lưu ở đâu, và lưu thế nào?",
          a: "Key nhà cung cấp, key MCP và credential OAuth, biến môi trường của tool tuỳ chỉnh và credential CLI đều được mã hoá khi lưu bằng AES-256-GCM. Khoá mã hoá được tạo khi bạn cài đặt dewee và nằm trong môi trường của bạn.",
        },
        {
          q: "Tenant này có xem được dữ liệu của tenant khác không?",
          a: "Mọi truy vấn đều gắn tenant, và thiếu tenant bị coi là lỗi chứ không tự chọn mặc định. Mỗi kênh gắn chặt với tenant của nó, và API key đều có scope.",
        },
        {
          q: "Điều gì ngăn agent chạy một lệnh nguy hiểm?",
          a: "Policy engine quyết định mỗi agent được gọi tool nào. Bảy nhóm lệnh shell bị cấm mặc định, lệnh thực thi và thao tác ghi file có thể cần duyệt, và code có thể chạy trong Docker sandbox không có mạng.",
        },
        {
          q: "dewee xử lý prompt injection thế nào?",
          a: "Sáu mẫu quen thuộc được phát hiện ngay đầu vào. Mặc định dewee ghi log và cảnh báo, bạn có thể chuyển sang chặn. Nội dung web được đánh dấu là không đáng tin trước khi model đọc. Phát hiện chỉ giảm rủi ro chứ không xoá được nó, nên mới cần thêm lớp tool và lớp output.",
        },
        {
          q: "Licence key có bảo vệ runtime của tôi không?",
          a: "Không, và nó không được thiết kế để làm vậy. Licence key ghi nhận quyền sử dụng của bạn. Lời gọi runtime dùng provisioning có chữ ký và runtime token, và heartbeat không bao giờ gửi key gốc.",
        },
        {
          q: "Prompt của tôi được gửi đi đâu?",
          a: "Tới các nhà cung cấp model mà bạn cấu hình. Nếu prompt phải nằm yên trên phần cứng của bạn, hãy chạy model local qua Ollama. Heartbeat của licence chỉ gửi activation id và runtime token.",
        },
        {
          q: "Tôi báo lỗ hổng bằng cách nào?",
          a: "Gửi email tới hi@nextlevelbuilder.io, kèm điều bạn tìm thấy và cách tái hiện. Mong bạn cho chúng tôi thời gian sửa trước khi công bố.",
        },
      ],
    },
    cta: {
      title: "Đang cần đánh giá *bảo mật*?",
      body: "Chúng tôi sẽ cùng đội bảo mật của bạn đi qua từng lớp, với trace mở sẵn trên màn hình.",
      primary: "Trò chuyện với chúng tôi",
      secondary: "Hỏi dewee",
      note: "cứ mang câu hỏi khó tới",
    },
  },
};
