/**
 * Engineering: agents triage, fix, test and open pull requests overnight.
 * Verified against dewee docs: webhooks (POST /v1/webhooks/llm), team task board, Secure CLI
 * presets for git and gh, Docker sandbox limits, durable exec approvals, blocker escalation.
 */
import type { UseCase } from "./types";

export const softwareDelivery: UseCase = {
  slug: "software-delivery",
  icon: "code",
  area: "make",
  team: { en: "Engineering", vi: "Kỹ thuật" },
  title: { en: "Ship software while the team sleeps", vi: "Tự động hoá quy trình phát triển phần mềm" },
  summary: {
    en: "Agents triage issues, write and review code, run tests and open pull requests, then report in the team chat.",
    vi: "Agent phân loại issue, viết và review code, chạy test, mở pull request rồi báo cáo ngay trong nhóm chat.",
  },
  channels: ["slack", "discord", "telegram"],
  detail: {
    problem: {
      en: "Our backlog grows faster than we can triage it. Small bugs wait for weeks, reviews pile up on two seniors, and every morning starts with “what broke last night?”",
      vi: "Backlog phình ra nhanh hơn tốc độ chúng tôi kịp phân loại. Bug nhỏ nằm chờ cả tuần, review dồn hết lên hai bạn senior, và sáng nào cũng mở đầu bằng câu “đêm qua cái gì hỏng?”",
    },
    flow: {
      en: [
        "A new issue arrives through a webhook. The triage agent labels it, checks for duplicates and asks the reporter for any missing steps.",
        "Small, well-scoped issues go on the team task board. The developer agent claims one and works on a branch in its own workspace.",
        "It writes the fix and the tests, then runs the suite in a Docker sandbox with the network switched off.",
        "The reviewer agent reads the diff against your conventions and sends it back if anything is off.",
        "The developer agent opens a pull request with the GitHub CLI and links it to the issue.",
        "At 8:00 the team gets one summary in Slack: what is ready for review, what is blocked and why.",
      ],
      vi: [
        "Issue mới đến qua webhook. Agent phân loại gắn nhãn, kiểm tra trùng lặp và hỏi lại người báo lỗi những bước còn thiếu.",
        "Issue nhỏ, rõ phạm vi được đưa lên bảng việc của đội. Agent lập trình nhận việc và làm trên một branch trong workspace riêng.",
        "Agent viết bản sửa kèm test, rồi chạy bộ test trong Docker sandbox đã tắt mạng.",
        "Agent review đọc diff theo quy ước code của bạn và trả lại nếu có gì chưa ổn.",
        "Agent lập trình mở pull request bằng GitHub CLI và liên kết với issue.",
        "8 giờ sáng, cả đội nhận một bản tóm tắt trong Slack: việc nào đã sẵn sàng để review, việc nào bị chặn và vì sao.",
      ],
    },
    agents: {
      en: ["Triage agent", "Developer agent", "Reviewer agent"],
      vi: ["Agent phân loại", "Agent lập trình", "Agent review"],
    },
    capabilities: {
      en: ["Webhooks", "Agent teams & task board", "Secure CLI for git and GitHub", "Docker sandbox", "Cron schedules", "Traces"],
      vi: ["Webhook", "Đội agent & bảng việc", "Secure CLI cho git và GitHub", "Docker sandbox", "Lịch cron", "Trace"],
    },
    guardrails: {
      en: [
        "Agents open pull requests. Merging stays with your engineers, backed by a scoped token and your branch protection.",
        "Code runs in a sandbox with a read-only root, no network and hard limits on memory, CPU and time.",
        "Shell commands that match an approval rule wait for a person in Tasks & approvals.",
        "A stuck agent posts a blocker: the task fails loudly and the lead is told straight away.",
        "Tokens are injected only at run time and scrubbed from every reply and log.",
      ],
      vi: [
        "Agent chỉ mở pull request. Quyền merge vẫn thuộc về kỹ sư của bạn, nhờ token giới hạn quyền và branch protection phía bạn.",
        "Code chạy trong sandbox: root chỉ đọc, không có mạng, giới hạn cứng về bộ nhớ, CPU và thời gian.",
        "Lệnh shell khớp quy tắc phê duyệt phải chờ người duyệt trong mục Tasks & approvals.",
        "Agent bị kẹt sẽ báo blocker: task được đánh dấu thất bại rõ ràng và trưởng nhóm được báo ngay.",
        "Token chỉ được cấp lúc chạy và bị lọc khỏi mọi câu trả lời, mọi dòng log.",
      ],
    },
    chat: { channel: "slack", room: { en: "#eng-nightly", vi: "#eng-nightly" } },
    transcript: {
      en: [
        { who: "dewee", me: true, text: "Morning. Three PRs are ready for review: #412 date parsing, #415 Zalo retry, #418 invoice email typo. #409 is blocked: the staging database has no seed data." },
        { who: "Tuan", role: "Tech lead", text: "@dewee why did #415 need a retry change?" },
        { who: "dewee", me: true, text: "The logs on the issue show Zalo returning 429 twice. I added backoff and two tests. The trace is linked on the PR." },
        { who: "Tuan", role: "Tech lead", text: "Nice. I'll review #415 first. Vy, can you look at the seed for #409?" },
        { who: "Vy", role: "Backend", text: "On it." },
      ],
      vi: [
        { who: "dewee", me: true, text: "Chào cả nhà. Có 3 PR chờ review: #412 xử lý ngày tháng, #415 retry Zalo, #418 lỗi chính tả email hoá đơn. #409 đang bị chặn: DB staging chưa có dữ liệu seed." },
        { who: "Anh Tuấn", role: "Tech lead", text: "@dewee sao #415 phải sửa phần retry vậy em?" },
        { who: "dewee", me: true, text: "Log đính kèm trong issue cho thấy Zalo trả về 429 hai lần anh ạ. Em thêm backoff và hai bài test. Trace có link trong PR." },
        { who: "Anh Tuấn", role: "Tech lead", text: "Ổn. Anh review #415 trước. Vy xem giúp phần seed cho #409 nhé?" },
        { who: "Vy", role: "Backend", text: "Để em." },
      ],
    },
    outcome: {
      en: "Mornings start with a short list of tested, pre-reviewed pull requests instead of a pile of tickets. Seniors spend their review time on the changes that need judgement, and small fixes stop waiting for weeks.",
      vi: "Buổi sáng bắt đầu bằng một danh sách ngắn các pull request đã có test, đã được review sơ bộ, thay vì một đống ticket. Các bạn senior dành thời gian review cho những thay đổi cần óc phán đoán, còn bản sửa nhỏ không phải chờ hàng tuần nữa.",
    },
    description: {
      en: "dewee agents triage issues, write fixes with tests, run them in a sandbox and open pull requests overnight, so engineers start the day reviewing, not sorting.",
      vi: "Agent dewee phân loại issue, viết bản sửa kèm test, chạy trong sandbox và mở pull request qua đêm, để kỹ sư bắt đầu ngày mới bằng việc review thay vì phân loại.",
    },
    related: ["seo-around-the-clock", "task-chasing", "ai-coworker-in-group-chats"],
    console: "teams",
  },
};
