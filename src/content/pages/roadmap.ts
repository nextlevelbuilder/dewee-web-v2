/**
 * /roadmap: Now / Next / Later, checked against the dewee repository on 25 Sep 2026.
 * Sources (read-only, /Volumes/GOON/www/nlb/dewee):
 * - Now: v3.34.0-beta.2 (control plane redesign, beta); plans/260826 docs + API reference epic (in progress).
 * - Next: plans/260819 owner-level control plane (waves shipped in v3.22 and v3.31);
 *   plans/260805 hosted fleet hardening (runtime PostgreSQL on Kubernetes, canary rollout).
 * - Later: plans/260917-1815-jev-reflex-memory-gate/stage-2-plus-roadmap.md (deferred register,
 *   explicitly "authorizes nothing").
 * - Shipped: GitHub releases v3.28 to v3.33 (September 2026).
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
      note: "checked 25 Sep 2026",
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
              title: "A calmer control plane",
              body: "A redesign of the control plane from the ground up: new visual tokens, a new shell and components, and every page rebuilt on them.",
              meta: "Beta since v3.34.0-beta.2",
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
      title: "Six stable releases *in September*.",
      lede: "The roadmap is a promise about direction. The changelog is the record of what actually shipped.",
      label: "dewee stable releases in September 2026",
      items: [
        { date: "3 Sep · v3.28", text: "Speech settings from the CLI, and per-agent reasoning controls" },
        { date: "4 Sep · v3.29", text: "Reasoning delivery visible in traces" },
        { date: "19 Sep · v3.30", text: "Visual workflows, cron triggers and Reflex memory admission" },
        { date: "21 Sep · v3.31", text: "GPT-6 Astra, ClinePass, OpenCode Go and Vercel AI Gateway" },
        { date: "22 Sep · v3.32", text: "A public, tenant-aware MCP HTTP server" },
        { date: "24 Sep · v3.33", text: "English and Vietnamese control plane, time zones, Gemini TTS" },
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
      note: "cập nhật 25/9/2026",
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
              title: "Control plane gọn gàng hơn",
              body: "Thiết kế lại control plane từ gốc: bộ token giao diện mới, khung và component mới, và mọi trang được dựng lại trên nền đó.",
              meta: "Beta từ v3.34.0-beta.2",
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
      title: "Sáu bản stable *trong tháng 9*.",
      lede: "Lộ trình là lời hứa về hướng đi. Changelog mới là ghi chép về những gì đã thật sự phát hành.",
      label: "Các bản stable của dewee trong tháng 9/2026",
      items: [
        { date: "3/9 · v3.28", text: "Cấu hình giọng nói từ CLI, và tuỳ chỉnh reasoning cho từng agent" },
        { date: "4/9 · v3.29", text: "Theo dõi quá trình reasoning trong trace" },
        { date: "19/9 · v3.30", text: "Workflow trực quan, trigger theo lịch cron và Reflex memory admission" },
        { date: "21/9 · v3.31", text: "GPT-6 Astra, ClinePass, OpenCode Go và Vercel AI Gateway" },
        { date: "22/9 · v3.32", text: "MCP HTTP server công khai, phân tách theo tenant" },
        { date: "24/9 · v3.33", text: "Control plane tiếng Anh và tiếng Việt, múi giờ, Gemini TTS" },
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
