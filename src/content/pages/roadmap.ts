/**
 * /roadmap: Now / Next / Later, checked against the dewee repository on 19 Oct 2026.
 * Sources (read-only, the dewee repo and its GitHub releases):
 * - Now: decision policies (managed from RGD, the control plane and the CLI since v3.41.0; the
 *   shadow-only evaluator shipped in v3.39.0); self-improvement engine (plans/261007-1206, status in-progress, first parts in
 *   v3.39.0); plans/260826 docs + API reference epic (in progress). The control plane redesign left
 *   this column when v3.34.0 shipped it as stable.
 * - Next: plans/260819 owner-level control plane (waves shipped in v3.22 and v3.31);
 *   plans/260805 hosted fleet hardening (runtime PostgreSQL on Kubernetes, canary rollout);
 *   plans/261013-2200-773-public-mcp-oauth (pending).
 * - Later: plans/260917-1815-jev-reflex-memory-gate/stage-2-plus-roadmap.md (deferred register,
 *   explicitly "authorizes nothing").
 * - Shipped: GitHub releases v3.34 to v3.43 (25 Sep to 29 Oct 2026, stable only), eleven in all with the
 *   v3.38.1 patch, whose notes are only a compare link, so its line says no more than "patch".
 *   The v3.41, v3.42 and v3.43 lines were added 29 Oct 2026; the Now, Next and Later plans were last
 *   checked on 19 Oct 2026.
 * No dates are promised for anything that has not shipped.
 */
import type { Bi } from "~/i18n/config";

type Item = { title: string; body: string; meta?: string };
type Column = { id: "now" | "next" | "later"; title: string; caption: string; items: Item[] };

type RoadmapPage = {
  meta: { title: string; description: string; crumb: string };
  hero: { eyebrow: string; title: string; lede: string; note: string; primary: string; secondary: string };
  board: { eyebrow: string; title: string; lede: string; label: string; columns: Column[]; note: string };
  shipped: { eyebrow: string; title: string; lede: string; label: string; items: { date: string; text: string }[]; cta: string };
  cta: { title: string; body: string; primary: string; secondary: string; note: string };
};

export const ROADMAP: Bi<RoadmapPage> = {
  en: {
    meta: {
      crumb: "Roadmap",
      title: "dewee roadmap: now, next and later",
      description:
        "What the dewee team is building now, what comes next and which ideas are parked for later. Checked against our own repository, with no dates promised ahead.",
    },
    hero: {
      eyebrow: "Roadmap",
      title: "What we're *building next*.",
      lede: "Straight from our own notes: what is in progress, what is planned, and the ideas we have written down but parked. Anything that ships lands on the changelog first.",
      note: "checked 19 Oct 2026",
      primary: "See the changelog",
      secondary: "Suggest something",
    },
    board: {
      eyebrow: "Now · Next · Later",
      title: "The plan, *in pencil*.",
      lede: "Pencil, because plans change when customers teach us something. The columns say how sure we are, not when things will land.",
      label: "dewee roadmap in three columns: now, next and later",
      columns: [
        {
          id: "now",
          title: "Now",
          caption: "In progress or in beta",
          items: [
            {
              title: "Decision policies you can test first",
              body: "Write down when an agent should carry on, ask for clarification or stay quiet in a group chat. The policy is measured on labelled messages first and switched on only after it passes.",
              meta: "First parts shipped in v3.41",
            },
            {
              title: "Agents that improve from evidence",
              body: "Changes proposed for an agent or a skill are replayed on saved examples, approved before they go live, tried on live traffic and rolled back if they regress.",
              meta: "First parts shipped in v3.39",
            },
            {
              title: "Official docs and API reference",
              body: "Documentation for people who run dewee, plus an interactive API reference generated from the gateway's own OpenAPI spec, so it stays in sync.",
              meta: "In progress",
            },
          ],
        },
        {
          id: "next",
          title: "Next",
          caption: "Planned, partly started",
          items: [
            {
              title: "Owner controls in the control plane",
              body: "Backup and restore, import and export, owner settings, TTS providers, a pending-messages inbox and channel diagnostics, for Dedicated and On-Premises owners.",
              meta: "Parts shipped in v3.22 and v3.31",
            },
            {
              title: "Hosted fleet hardening",
              body: "Moving the runtime database of hosted instances onto Kubernetes, and rolling out each update to a canary first, then to the whole fleet.",
              meta: "In progress",
            },
            {
              title: "OAuth sign-in for the public MCP server",
              body: "Let MCP clients sign in through the control plane instead of sharing one static key. The static key keeps working.",
              meta: "Planned",
            },
          ],
        },
        {
          id: "later",
          title: "Later",
          caption: "Written down, not scheduled",
          items: [
            {
              title: "Proactive model routing",
              body: "Today dewee fails over to another model when one breaks. Later, it could pick the right model for each task up front.",
              meta: "Waits on reliable task-difficulty labels",
            },
            {
              title: "Duplicate and contradiction checks in memory",
              body: "Flag memories that repeat or contradict each other, as advice for an operator. Nothing gets rewritten silently.",
              meta: "Advisory only",
            },
            {
              title: "Smart delegation",
              body: "Help an agent decide whether to hand work to a teammate agent, choosing only among agents it is already allowed to reach.",
              meta: "Permissions stay in charge",
            },
            {
              title: "Reflex decision dashboard",
              body: "One view of the quick decisions dewee's reflex layer makes: how many, how fast, and how often they were escalated.",
              meta: "Parked",
            },
          ],
        },
      ],
      note: "No dates promised. We'd rather ship than guess.",
    },
    shipped: {
      eyebrow: "Recently shipped",
      title: "Eleven stable releases *in about a month*.",
      lede: "The roadmap is a promise about direction. The changelog is the record of what actually shipped.",
      label: "dewee stable releases from 25 September to 29 October 2026",
      items: [
        { date: "29 Oct · v3.43", text: "Run limits that hold on resume, a stricter public webchat, and a smoother self-hosted setup" },
        { date: "27 Oct · v3.42", text: "Private credential links, dial-time checks on outbound connections, and webchat managed from the control plane" },
        { date: "21 Oct · v3.41", text: "Sign-in for your own product with Dewee Connect, and decision policies you can manage" },
        { date: "15 Oct · v3.40", text: "A connected browser for agents, and a rebuilt admin console" },
        { date: "14 Oct · v3.39", text: "Access grants for agents and tools, and the first self-improvement loop" },
        { date: "9 Oct · v3.38.1", text: "A patch release on top of v3.38" },
        { date: "7 Oct · v3.38", text: "An agent-first CLI, and workspace setup by conversation" },
        { date: "5 Oct · v3.37", text: "Trusted channel identity and a Discord support inbox" },
        { date: "1 Oct · v3.36", text: "Scoped model catalogs and GPT-6.1 Sol" },
        { date: "29 Sep · v3.35", text: "Team tasks, workflow editor and MCP OAuth in the control plane" },
        { date: "25 Sep · v3.34", text: "A redesigned control plane, and first-run setup for self-install" },
      ],
      cta: "Read the full changelog",
    },
    cta: {
      title: "Missing something *you need*?",
      body: "Tell us what your team is trying to do. Real use cases move things from Later to Now.",
      primary: "Suggest a use case",
      secondary: "Chat with dewee",
      note: "we read every suggestion",
    },
  },
  vi: {
    meta: {
      crumb: "Lộ trình",
      title: "Lộ trình dewee: đang làm, sắp làm và để sau",
      description:
        "Những gì đội dewee đang làm, sẽ làm tiếp và các ý tưởng tạm để sau. Đối chiếu với chính repository của chúng tôi, và không hứa trước bất kỳ mốc thời gian nào.",
    },
    hero: {
      eyebrow: "Lộ trình",
      title: "Chúng tôi *đang làm gì tiếp*.",
      lede: "Lấy thẳng từ sổ tay của đội: việc đang làm, việc đã lên kế hoạch, và những ý tưởng đã ghi lại nhưng tạm gác. Thứ gì phát hành sẽ lên changelog trước tiên.",
      note: "cập nhật 19/10/2026",
      primary: "Xem changelog",
      secondary: "Góp ý cho chúng tôi",
    },
    board: {
      eyebrow: "Đang làm · Sắp làm · Để sau",
      title: "Kế hoạch, *viết bằng bút chì*.",
      lede: "Bút chì, vì kế hoạch sẽ thay đổi khi khách hàng dạy chúng tôi điều mới. Các cột cho biết chúng tôi chắc chắn đến đâu, không phải khi nào sẽ xong.",
      label: "Lộ trình dewee gồm ba cột: đang làm, sắp làm và để sau",
      columns: [
        {
          id: "now",
          title: "Đang làm",
          caption: "Đang phát triển hoặc đang beta",
          items: [
            {
              title: "Chính sách quyết định, đo trước khi bật",
              body: "Ghi rõ khi nào agent nên làm tiếp, hỏi lại cho rõ hay im lặng trong nhóm chat. Chính sách được đo trên các tin nhắn đã gắn nhãn trước, và chỉ bật sau khi đạt.",
              meta: "Phần đầu đã có trong v3.41",
            },
            {
              title: "Agent cải thiện dựa trên bằng chứng",
              body: "Thay đổi đề xuất cho agent hay skill được chạy lại trên ví dụ đã lưu, được duyệt trước khi áp dụng, thử trên lưu lượng thật và quay lui nếu kết quả tệ đi.",
              meta: "Phần đầu đã có trong v3.39",
            },
            {
              title: "Tài liệu chính thức và API reference",
              body: "Tài liệu cho người vận hành dewee, kèm API reference tương tác sinh ra từ chính OpenAPI spec của gateway, nên luôn khớp với hệ thống.",
              meta: "Đang làm",
            },
          ],
        },
        {
          id: "next",
          title: "Sắp làm",
          caption: "Đã lên kế hoạch, một phần đã bắt đầu",
          items: [
            {
              title: "Quyền chủ sở hữu trong control plane",
              body: "Sao lưu và khôi phục, nhập và xuất dữ liệu, cấu hình chủ sở hữu, nhà cung cấp TTS, hộp tin nhắn chờ và chẩn đoán kênh, dành cho khách hàng On-Premises.",
              meta: "Một phần đã có trong v3.22 và v3.31",
            },
            {
              title: "Gia cố hạ tầng vận hành",
              body: "Chuyển cơ sở dữ liệu runtime của các instance do đội dewee vận hành sang Kubernetes, và phát hành bản cập nhật cho nhóm canary trước rồi mới đến toàn bộ.",
              meta: "Đang làm",
            },
            {
              title: "Đăng nhập OAuth cho MCP server công khai",
              body: "Để các MCP client đăng nhập qua control plane thay vì dùng chung một key tĩnh. Key tĩnh vẫn dùng được.",
              meta: "Đã lên kế hoạch",
            },
          ],
        },
        {
          id: "later",
          title: "Để sau",
          caption: "Đã ghi lại, chưa lên lịch",
          items: [
            {
              title: "Chọn model chủ động",
              body: "Hiện dewee chuyển sang model khác khi một model gặp lỗi. Sau này, dewee có thể chọn đúng model cho từng việc ngay từ đầu.",
              meta: "Chờ nhãn độ khó đáng tin cậy",
            },
            {
              title: "Phát hiện trùng lặp và mâu thuẫn trong bộ nhớ",
              body: "Đánh dấu những ký ức lặp lại hoặc mâu thuẫn nhau để người vận hành xem xét. Không có gì bị sửa ngầm.",
              meta: "Chỉ để tham khảo",
            },
            {
              title: "Giao việc thông minh",
              body: "Giúp agent quyết định có nên giao việc cho agent đồng đội hay không, và chỉ chọn trong những agent nó đã được phép liên hệ.",
              meta: "Phân quyền vẫn là trên hết",
            },
            {
              title: "Bảng theo dõi quyết định Reflex",
              body: "Một màn hình cho các quyết định nhanh của lớp reflex trong dewee: bao nhiêu, nhanh đến đâu, và bao lâu thì phải chuyển lên cấp cao hơn.",
              meta: "Tạm gác",
            },
          ],
        },
      ],
      note: "Không hứa ngày. Làm xong rồi nói.",
    },
    shipped: {
      eyebrow: "Vừa phát hành",
      title: "Mười một bản stable *trong khoảng một tháng*.",
      lede: "Lộ trình là lời hứa về hướng đi. Changelog mới là ghi chép về những gì đã thật sự phát hành.",
      label: "Các bản stable của dewee từ 25/9 đến 29/10/2026",
      items: [
        { date: "29/10 · v3.43", text: "Giới hạn lượt chạy được giữ khi tiếp tục, webchat công khai chặt chẽ hơn, và thiết lập bản tự cài suôn sẻ hơn" },
        { date: "27/10 · v3.42", text: "Link credential riêng tư, kiểm tra lúc dial với kết nối ra ngoài, và webchat quản lý từ control plane" },
        { date: "21/10 · v3.41", text: "Đăng nhập cho sản phẩm của bạn với Dewee Connect, và decision policy có thể quản lý" },
        { date: "15/10 · v3.40", text: "Trình duyệt kết nối cho agent, và admin console được dựng lại" },
        { date: "14/10 · v3.39", text: "Cấp quyền truy cập cho agent và công cụ, cùng vòng tự cải thiện đầu tiên" },
        { date: "9/10 · v3.38.1", text: "Bản vá bổ sung cho v3.38" },
        { date: "7/10 · v3.38", text: "CLI ưu tiên agent, và thiết lập workspace bằng hội thoại" },
        { date: "5/10 · v3.37", text: "Danh tính kênh đáng tin cậy và hộp thư hỗ trợ trên Discord" },
        { date: "1/10 · v3.36", text: "Danh mục model theo phạm vi và GPT-6.1 Sol" },
        { date: "29/9 · v3.35", text: "Task của đội, trình soạn workflow và MCP OAuth trong control plane" },
        { date: "25/9 · v3.34", text: "Control plane thiết kế lại, và thiết lập lần đầu cho self-install" },
      ],
      cta: "Đọc toàn bộ changelog",
    },
    cta: {
      title: "Thiếu thứ *bạn đang cần*?",
      body: "Kể chúng tôi nghe đội bạn đang muốn làm gì. Bài toán thật là thứ đưa một việc từ Để sau lên Đang làm.",
      primary: "Góp ý một bài toán",
      secondary: "Chat với dewee",
      note: "góp ý nào chúng tôi cũng đọc",
    },
  },
};
