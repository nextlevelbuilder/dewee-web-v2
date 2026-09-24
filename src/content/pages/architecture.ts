/**
 * /architecture copy, EN + VI. Verified against the dewee repo (2026-09-25):
 * internal/pipeline/pipeline.go (NewDefaultPipeline: ContextStage; Prune/Think/Tool/Observe/Checkpoint
 * per round, max 20 rounds; FinalizeStage), docs/01-agent-loop, 07-bootstrap-skills-memory,
 * 08-scheduling-cron, 11-agent-teams, 23-multi-tenant-architecture, 24-knowledge-vault,
 * cmd/root.go (persistent flags --server, --token) and cmd/agent.go (`agent list`).
 * Stage names match the homepage sketch; `source` is the component that does the work.
 */
import type { Bi } from "~/i18n/config";

type Stage = { name: string; source: string; body: string };
type Fact = { icon: string; title: string; body: string };
type Line = { kind: "comment" | "command"; text: string };

export const ARCHITECTURE_PAGE: Bi<{
  meta: { title: string; description: string; crumb: string };
  hero: { eyebrow: string; title: string; lede: string; note: string; primary: string; secondary: string };
  overview: {
    eyebrow: string;
    title: string;
    lede: string;
    sketchLabel: string;
    more: (n: number) => string;
    labels: { channels: string; gateway: string; pipeline: string; memory: string; tools: string; teams: string; providers: string; traces: string };
    proofLabel: string;
    proof: { value: string; label: string }[];
  };
  loop: {
    eyebrow: string;
    title: string;
    lede: string;
    label: string;
    phases: { setup: string; loop: string; wrap: string };
    again: string;
    stages: Stage[];
  };
  memory: {
    eyebrow: string;
    title: string;
    lede: string;
    label: string;
    tiers: { level: string; name: string; body: string; meta: string }[];
    recall: string;
    flow: { label: string; steps: string[] };
    vault: { title: string; body: string; scopes: string; weightsLabel: string; weights: { label: string; value: number }[] };
  };
  teams: {
    eyebrow: string;
    title: string;
    lede: string;
    points: string[];
    board: {
      label: string;
      caption: string;
      lead: string;
      columns: { title: string; cards: { text: string; who: string; note?: string }[] }[];
      handoff: string;
    };
  };
  platform: { eyebrow: string; title: string; lede: string; items: Fact[] };
  deploy: {
    eyebrow: string;
    title: string;
    lede: string;
    label: string;
    runtime: { title: string; where: string; body: string };
    link: { title: string; body: string };
    ccp: { title: string; where: string; body: string };
    guard: { title: string; points: string[]; note: string };
    terminalLabel: string;
    terminal: Line[];
  };
  cta: { title: string; body: string; primary: string; secondary: string; note: string };
}> = {
  en: {
    meta: {
      title: "Architecture: one Go binary, an 8-stage agent loop",
      description:
        "How dewee works inside: one Go gateway, an 8-stage agent loop, three-tier memory, agent teams, tenant isolation, traces, provider fallback and deployment.",
      crumb: "Architecture",
    },
    hero: {
      eyebrow: "Architecture",
      title: "A small binary with a *very* careful pipeline.",
      lede: "The tour we give CTOs: where a message goes, what the agent remembers, who checks its work, and how the whole thing is deployed and kept closed.",
      note: "yes, we drew it by hand",
      primary: "Follow a message",
      secondary: "Talk to us",
    },
    overview: {
      eyebrow: "The big picture",
      title: "Messages in, answers out, *receipts* everywhere.",
      lede: "Chat channels connect to one gateway. The gateway runs every message through the agent loop, calls the models you chose, and writes a trace of each step. Memory, tools and teammates sit beside the loop, not inside the model.",
      sketchLabel: "How a message flows through dewee: channels, gateway, the 8-stage agent loop, model providers and traces",
      more: (n) => `+${n} more`,
      labels: {
        channels: "Channels",
        gateway: "dewee gateway",
        pipeline: "8-stage agent loop",
        memory: "Memory & vault",
        tools: "Tools & MCP",
        teams: "Agent teams",
        providers: "Model providers",
        traces: "Traces & usage",
      },
      proofLabel: "The gateway in numbers",
      proof: [
        { value: "~25\u00a0MB", label: "One static Go binary" },
        { value: "<\u00a01\u00a0s", label: "To start" },
        { value: "8", label: "Stages per message" },
        { value: "20", label: "Rounds per run by default" },
        { value: "30+", label: "Built-in tools" },
      ],
    },
    loop: {
      eyebrow: "The agent loop",
      title: "Eight stages, for *every* message.",
      lede: "Set up once, think and act in rounds, wrap up once. The small mono label under each stage names the component that does the work, in case your engineers ask.",
      label: "The dewee agent loop: context once, then history, prompt, think, act, observe and memory in rounds, then summarize",
      phases: { setup: "Setup · once", loop: "Loop · up to 20 rounds", wrap: "Wrap-up · once" },
      again: "again, until the job is done",
      stages: [
        { name: "Context", source: "ContextStage", body: "Loads the agent's persona, the user and the tenant, and adds relevant memories before anything else." },
        { name: "History", source: "history pipeline · PruneStage", body: "Trims old turns and cleans up the transcript, so the model sees what matters rather than everything." },
        { name: "Prompt", source: "ThinkStage · PolicyEngine", body: "Builds a system prompt of 15+ sections and filters the tool list through the policy engine." },
        { name: "Think", source: "ThinkStage", body: "Calls the model. If the provider fails, the next model on the agent's fallback list takes over." },
        { name: "Act", source: "ToolStage", body: "Runs the tools the model asked for: read-only ones in parallel, anything that changes state one at a time." },
        { name: "Observe", source: "ObserveStage · CheckpointStage", body: "Reads the results, decides whether another round is needed, and saves a checkpoint." },
        { name: "Memory", source: "MemoryFlushStage", body: "Before the context fills up, writes what is worth keeping to memory: 5 rounds and 90 seconds at most." },
        { name: "Summarize", source: "compaction · FinalizeStage", body: "Compacts long chats into a summary plus recent messages, then cleans the reply in 7 steps before it goes out." },
      ],
    },
    memory: {
      eyebrow: "Memory",
      title: "Three tiers of memory, plus a *vault*.",
      lede: "Short-term, episodic and semantic memory, and a knowledge vault of linked notes. Background workers keep it tidy, so recall stays fast and relevant.",
      label: "Memory tiers L0 to L2 and the knowledge vault",
      tiers: [
        { level: "L0", name: "Working", body: "The live conversation, compacted automatically when it grows long.", meta: "per session" },
        { level: "L1", name: "Episodic", body: "A summary of each past session, with a short abstract and an embedding for search.", meta: "90 days by default" },
        { level: "L2", name: "Semantic", body: "A knowledge graph of entities and relations, each with the dates it was true.", meta: "knowledge graph" },
      ],
      recall: "Before each run, relevant memories are added to the context, up to 200 tokens.",
      flow: { label: "Consolidation, in the background", steps: ["Episodic", "Semantic", "Dedup", "Dreaming"] },
      vault: {
        title: "Knowledge vault",
        body: "Notes linked with wikilinks, searched by full text and vectors together, and synced with a folder on disk.",
        scopes: "Scopes: personal, team, shared, custom",
        weightsLabel: "One search, three sources",
        weights: [
          { label: "Vault", value: 0.4 },
          { label: "Episodic", value: 0.3 },
          { label: "Graph", value: 0.3 },
        ],
      },
    },
    teams: {
      eyebrow: "Agent teams",
      title: "A lead, a board, and *no* freelancing.",
      lede: "Teams work like a good project room: one lead, a shared task board, a mailbox, and a clear way to call a human.",
      points: [
        "Every delegation links to a task on the board, or it is refused.",
        "Tasks can wait on each other, and close themselves when the work is done.",
        "Parallel results come back as one announcement, not a flood of messages.",
        "Hand-offs run sync or async, behind permission links and concurrency limits.",
        "When a case needs a person, the agent sends a summary to the right DM, group or topic.",
      ],
      board: {
        label: "Example team board",
        caption: "Example: a quote request, split across a team",
        lead: "Lead: sales agent",
        columns: [
          { title: "To do", cards: [{ text: "Send the quote to the customer", who: "Sales agent", note: "blocked by: draft the quote" }] },
          { title: "Doing", cards: [{ text: "Draft the quote", who: "Pricing agent" }] },
          { title: "Done", cards: [{ text: "Check stock for 40 units", who: "Warehouse agent" }] },
        ],
        handoff: "Discount above policy → handed to the sales manager",
      },
    },
    platform: {
      eyebrow: "Built for many tenants",
      title: "The parts you only notice when they are *missing*.",
      lede: "Isolation, receipts, a plan B for every model call, and limits that hold.",
      items: [
        { icon: "building-2", title: "Tenant isolation", body: "Every query is filtered by tenant. A missing tenant is an error, never a default, and each channel is bound to its tenant." },
        { icon: "scan-eye", title: "Traces", body: "Each run is a trace; each model call, tool call and delegation is a span with tokens and cost. Export it with OpenTelemetry." },
        { icon: "route", title: "Provider fallback", body: "An ordered fallback list per agent. Rate limits, timeouts and outages move to the next model; streams switch only before the first chunk." },
        { icon: "gauge", title: "Scheduler lanes", body: "Chats, sub-agents, team work and cron run in separate lanes, and one group chat allows up to 3 runs at once." },
        { icon: "zap", title: "Prompt caching", body: "Explicit caching on Anthropic, and caching on OpenAI, MiniMax and OpenRouter, so repeated system prompts cost less." },
        { icon: "wallet", title: "Budget caps", body: "Usage caps are checked before a billable call goes out, so a runaway agent stops at the limit." },
      ],
    },
    deploy: {
      eyebrow: "Deployment",
      title: "The gateway does the work. The control plane *steers*.",
      lede: "The runtime gateway runs your agents, channels and memory. The Customer Control Plane manages it over the API and WebSocket. A licence guard keeps every door shut until activation.",
      label: "Deployment topology: runtime gateway, API and WebSocket, Customer Control Plane",
      runtime: { title: "Runtime gateway", where: "where you deploy it", body: "Agents, channels, memory and tools, with PostgreSQL and pgvector next to it." },
      link: { title: "API · WebSocket", body: "Signed provisioning and runtime tokens" },
      ccp: { title: "Customer Control Plane", where: "app.dewee.sh", body: "Tenants, agents, channels, workflows, usage and approvals, in English or Vietnamese." },
      guard: {
        title: "Licence guard",
        points: [
          "DEWEE_LICENSE_REQUIRED=1 keeps every public listener closed until the licence activates.",
          "A heartbeat every 5 minutes sends the activation id and a runtime token, never the raw key.",
          "A revoked licence stays revoked.",
        ],
        note: "The licence decides what you are entitled to. Runtime calls are secured by signed provisioning and runtime tokens.",
      },
      terminalLabel: "Terminal",
      terminal: [
        { kind: "comment", text: "# on the server: nothing listens publicly until the licence activates" },
        { kind: "command", text: "dewee" },
        { kind: "comment", text: "# from any laptop, with an operator token" },
        { kind: "command", text: "dewee --server=https://congtya.tose.sh --token=XXX agent list" },
      ],
    },
    cta: {
      title: "Want the *long* version?",
      body: "Bring your architect to a technical walkthrough. We will bring the traces.",
      primary: "Talk to us",
      secondary: "Ask dewee",
      note: "diagrams drawn live, on request",
    },
  },
  vi: {
    meta: {
      title: "Kiến trúc: một file Go, vòng lặp agent 8 bước",
      description:
        "Bên trong dewee: một gateway Go, vòng lặp agent 8 bước, bộ nhớ ba tầng, đội agent, cô lập tenant, trace, dự phòng nhà cung cấp và cách triển khai on-premises.",
      crumb: "Kiến trúc",
    },
    hero: {
      eyebrow: "Kiến trúc",
      title: "Một file chạy nhỏ, một pipeline *rất* cẩn thận.",
      lede: "Chuyến tham quan chúng tôi vẫn dẫn các CTO: tin nhắn đi đâu, agent nhớ gì, ai kiểm tra công việc của nó, và cả hệ thống được triển khai, khoá chặt ra sao.",
      note: "đúng, chúng tôi vẽ tay đấy",
      primary: "Theo chân một tin nhắn",
      secondary: "Trò chuyện với chúng tôi",
    },
    overview: {
      eyebrow: "Toàn cảnh",
      title: "Tin nhắn vào, câu trả lời ra, *biên lai* ở mọi bước.",
      lede: "Các kênh chat nối vào một gateway duy nhất. Gateway đưa từng tin nhắn qua vòng lặp agent, gọi model bạn đã chọn, và ghi trace cho từng bước. Bộ nhớ, tool và đồng đội nằm cạnh vòng lặp, không nằm trong model.",
      sketchLabel: "Đường đi của một tin nhắn trong dewee: kênh chat, gateway, vòng lặp agent 8 bước, nhà cung cấp model và trace",
      more: (n) => `+${n} nữa`,
      labels: {
        channels: "Kênh chat",
        gateway: "dewee gateway",
        pipeline: "Vòng lặp agent 8 bước",
        memory: "Bộ nhớ & vault",
        tools: "Tool & MCP",
        teams: "Đội agent",
        providers: "Nhà cung cấp model",
        traces: "Trace & usage",
      },
      proofLabel: "Gateway qua những con số",
      proof: [
        { value: "~25\u00a0MB", label: "Một file Go tĩnh" },
        { value: "<\u00a01\u00a0giây", label: "Để khởi động" },
        { value: "8", label: "Bước cho mỗi tin nhắn" },
        { value: "20", label: "Vòng mỗi lần chạy, mặc định" },
        { value: "30+", label: "Tool có sẵn" },
      ],
    },
    loop: {
      eyebrow: "Vòng lặp agent",
      title: "Tám bước, cho *mọi* tin nhắn.",
      lede: "Chuẩn bị một lần, suy nghĩ và hành động theo từng vòng, rồi khép lại một lần. Dòng chữ mono nhỏ dưới mỗi bước là tên thành phần làm việc đó, phòng khi kỹ sư của bạn hỏi.",
      label: "Vòng lặp agent của dewee: ngữ cảnh một lần, rồi lịch sử, prompt, suy nghĩ, hành động, quan sát và ghi nhớ theo vòng, cuối cùng là tóm tắt",
      phases: { setup: "Chuẩn bị · một lần", loop: "Vòng lặp · tối đa 20 vòng", wrap: "Khép lại · một lần" },
      again: "lặp lại tới khi xong việc",
      stages: [
        { name: "Ngữ cảnh", source: "ContextStage", body: "Nạp persona của agent, người dùng và tenant, rồi thêm các ký ức liên quan trước mọi thứ khác." },
        { name: "Lịch sử", source: "history pipeline · PruneStage", body: "Cắt bớt lượt cũ và làm sạch lịch sử chat, để model thấy điều cần thấy thay vì mọi thứ." },
        { name: "Prompt", source: "ThinkStage · PolicyEngine", body: "Dựng system prompt hơn 15 phần và lọc danh sách tool qua policy engine." },
        { name: "Suy nghĩ", source: "ThinkStage", body: "Gọi model. Nếu nhà cung cấp lỗi, model kế tiếp trong danh sách dự phòng của agent sẽ thay thế." },
        { name: "Hành động", source: "ToolStage", body: "Chạy các tool model yêu cầu: tool chỉ đọc chạy song song, tool làm thay đổi dữ liệu chạy lần lượt." },
        { name: "Quan sát", source: "ObserveStage · CheckpointStage", body: "Đọc kết quả, quyết định có cần thêm vòng nữa không, rồi lưu checkpoint." },
        { name: "Ghi nhớ", source: "MemoryFlushStage", body: "Trước khi ngữ cảnh đầy, ghi lại điều đáng nhớ vào bộ nhớ: tối đa 5 vòng và 90 giây." },
        { name: "Tóm tắt", source: "compaction · FinalizeStage", body: "Nén cuộc chat dài thành bản tóm tắt kèm các tin nhắn gần nhất, rồi làm sạch câu trả lời qua 7 bước trước khi gửi." },
      ],
    },
    memory: {
      eyebrow: "Bộ nhớ",
      title: "Ba tầng bộ nhớ, thêm một *kho* tri thức.",
      lede: "Bộ nhớ ngắn hạn, theo phiên và ngữ nghĩa, cùng một kho ghi chú liên kết. Worker chạy nền giữ mọi thứ gọn gàng, để agent nhớ lại nhanh và đúng.",
      label: "Các tầng bộ nhớ L0 tới L2 và kho tri thức",
      tiers: [
        { level: "L0", name: "Làm việc", body: "Cuộc trò chuyện đang diễn ra, tự nén lại khi quá dài.", meta: "theo phiên" },
        { level: "L1", name: "Theo phiên", body: "Bản tóm tắt từng phiên đã qua, kèm đoạn tóm lược ngắn và embedding để tìm kiếm.", meta: "mặc định 90 ngày" },
        { level: "L2", name: "Ngữ nghĩa", body: "Knowledge graph gồm thực thể và quan hệ, mỗi mục kèm khoảng thời gian còn đúng.", meta: "knowledge graph" },
      ],
      recall: "Trước mỗi lần chạy, ký ức liên quan được đưa vào ngữ cảnh, tối đa 200 token.",
      flow: { label: "Hợp nhất, chạy nền", steps: ["Theo phiên", "Ngữ nghĩa", "Khử trùng lặp", "Dreaming"] },
      vault: {
        title: "Kho tri thức",
        body: "Ghi chú liên kết bằng wikilink, tìm bằng full-text và vector cùng lúc, đồng bộ với một thư mục trên ổ đĩa.",
        scopes: "Phạm vi: cá nhân, đội, chia sẻ, tuỳ chỉnh",
        weightsLabel: "Một lần tìm, ba nguồn",
        weights: [
          { label: "Vault", value: 0.4 },
          { label: "Theo phiên", value: 0.3 },
          { label: "Graph", value: 0.3 },
        ],
      },
    },
    teams: {
      eyebrow: "Đội agent",
      title: "Có trưởng nhóm, có bảng việc, *không* làm tự phát.",
      lede: "Đội agent làm việc như một phòng dự án tử tế: một trưởng nhóm, một bảng task chung, một hộp thư, và cách rõ ràng để gọi người thật.",
      points: [
        "Mỗi lần giao việc phải gắn với một task trên bảng, nếu không sẽ bị từ chối.",
        "Task có thể chờ nhau, và tự đóng khi việc đã xong.",
        "Kết quả chạy song song được gom thành một thông báo, không thành một tràng tin nhắn.",
        "Giao việc chạy đồng bộ hoặc bất đồng bộ, sau liên kết quyền và giới hạn song song.",
        "Khi vụ việc cần người thật, agent gửi bản tóm tắt tới đúng tin nhắn riêng, nhóm hoặc topic.",
      ],
      board: {
        label: "Ví dụ bảng việc của đội",
        caption: "Ví dụ: một yêu cầu báo giá, chia cho cả đội",
        lead: "Trưởng nhóm: agent sales",
        columns: [
          { title: "Cần làm", cards: [{ text: "Gửi báo giá cho khách", who: "Agent sales", note: "chờ: soạn báo giá" }] },
          { title: "Đang làm", cards: [{ text: "Soạn báo giá", who: "Agent định giá" }] },
          { title: "Xong", cards: [{ text: "Kiểm tra tồn kho 40 sản phẩm", who: "Agent kho" }] },
        ],
        handoff: "Chiết khấu vượt chính sách → chuyển cho trưởng phòng sales",
      },
    },
    platform: {
      eyebrow: "Nền tảng cho nhiều tenant",
      title: "Những phần bạn chỉ để ý khi chúng *vắng mặt*.",
      lede: "Cô lập dữ liệu, biên lai cho mọi bước, phương án B cho mỗi lời gọi model, và những giới hạn giữ được lời.",
      items: [
        { icon: "building-2", title: "Cô lập tenant", body: "Mọi truy vấn đều lọc theo tenant. Thiếu tenant là lỗi, không bao giờ tự chọn mặc định, và mỗi kênh gắn chặt với tenant của nó." },
        { icon: "scan-eye", title: "Trace", body: "Mỗi lần chạy là một trace; mỗi lời gọi model, tool và giao việc là một span kèm token và chi phí. Xuất được qua OpenTelemetry." },
        { icon: "route", title: "Dự phòng nhà cung cấp", body: "Mỗi agent có danh sách dự phòng theo thứ tự. Bị giới hạn, quá thời gian hay sự cố thì chuyển model kế; khi stream, chỉ chuyển trước phần dữ liệu đầu tiên." },
        { icon: "gauge", title: "Làn điều phối", body: "Chat, sub-agent, việc của đội và cron chạy ở các làn riêng, và mỗi nhóm chat cho tối đa 3 lượt chạy cùng lúc." },
        { icon: "zap", title: "Cache prompt", body: "Cache chủ động trên Anthropic, và cache trên OpenAI, MiniMax, OpenRouter, để system prompt lặp lại tốn ít tiền hơn." },
        { icon: "wallet", title: "Trần ngân sách", body: "Trần sử dụng được kiểm tra trước khi gửi lời gọi tính phí, nên agent chạy quá đà sẽ dừng đúng ngưỡng." },
      ],
    },
    deploy: {
      eyebrow: "Triển khai",
      title: "Gateway làm việc. Control plane *cầm lái*.",
      lede: "Gateway runtime chạy agent, kênh chat và bộ nhớ ngay trên máy chủ của bạn. Customer Control Plane quản lý nó qua API và WebSocket. Licence guard giữ mọi cổng đóng cho tới khi kích hoạt.",
      label: "Mô hình triển khai: gateway runtime, API và WebSocket, Customer Control Plane",
      runtime: { title: "Gateway runtime", where: "trên máy chủ của bạn", body: "Agent, kênh chat, bộ nhớ và tool, với PostgreSQL và pgvector đặt ngay cạnh." },
      link: { title: "API · WebSocket", body: "Provisioning có chữ ký và runtime token" },
      ccp: { title: "Customer Control Plane", where: "app.dewee.sh", body: "Tenant, agent, kênh chat, workflow, usage và phê duyệt, bằng tiếng Việt hoặc tiếng Anh." },
      guard: {
        title: "Licence guard",
        points: [
          "DEWEE_LICENSE_REQUIRED=1 giữ mọi cổng công khai đóng cho tới khi licence được kích hoạt.",
          "Heartbeat mỗi 5 phút gửi activation id và runtime token, không bao giờ gửi key gốc.",
          "Licence đã thu hồi thì không mở lại được.",
        ],
        note: "Licence quyết định bạn được dùng những gì. Lời gọi runtime được bảo vệ bằng provisioning có chữ ký và runtime token.",
      },
      terminalLabel: "Terminal",
      terminal: [
        { kind: "comment", text: "# trên máy chủ: chưa kích hoạt licence thì chưa mở cổng công khai nào" },
        { kind: "command", text: "dewee" },
        { kind: "comment", text: "# từ bất kỳ máy nào, với token operator" },
        { kind: "command", text: "dewee --server=https://congtya.tose.sh --token=XXX agent list" },
      ],
    },
    cta: {
      title: "Muốn nghe bản *đầy đủ*?",
      body: "Mời kiến trúc sư của bạn tới một buổi đi sâu kỹ thuật. Chúng tôi sẽ mang trace tới.",
      primary: "Trò chuyện với chúng tôi",
      secondary: "Hỏi dewee",
      note: "vẽ sơ đồ tại chỗ, nếu bạn muốn",
    },
  },
};
