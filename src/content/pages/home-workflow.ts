/**
 * The homepage work story, EN + VI: one request travelling from a person to a lead agent, two
 * member agents, the shared task board, a manager's approval and a scheduled follow-up.
 * It is an illustration and says so. Every step maps to a documented runtime behaviour
 * (dewee docs/11-agent-teams.md, docs/08-scheduling-cron.md): the lead creates tasks and
 * delegates them, members report back, a task created with require_approval waits "In review"
 * until a person approves it on the board (approval completes it), and an agent's cron tool books the follow-up.
 */
import type { Bi } from "~/i18n/config";
import type { HomeWorkflow } from "./home-types";

export const HOME_WORKFLOW: Bi<HomeWorkflow> = {
  en: {
    eyebrow: "How it works",
    title: "One request. A whole team on it. *Nothing ships unapproved.*",
    lede: "Follow one piece of work from a sales chat to a sent proposal: who asks, which agent picks it up, who does the legwork, who signs off, and what happens next.",
    label: "Illustrative workflow · names and data are simulated",
    steps: [
      { kind: "human", actor: "Lan", role: "Sales", text: "Asks in #sales-team: the Da Nang client needs an on-prem quote with three custom workflows.", status: { label: "Request posted", tone: "neutral" } },
      { kind: "agent", actor: "Lead agent", role: "Team lead", text: "Splits the request into two tasks on the team board and delegates each one to a specialist agent.", status: { label: "2 tasks delegated", tone: "progress" } },
      { kind: "agent", actor: "Research + Sales agents", role: "Team members", text: "Research checks the client's current tools and security questions. Sales drafts the quote from the 2026 price sheet. Both report back to the lead." },
      {
        kind: "board",
        actor: "Team task board",
        role: "Shared by the lead and its members",
        text: "The lead combines both results into one proposal: the quote plus a security one-pager. The quote goes to a client, so its task waits in review for a person.",
        tasks: [
          { title: "Research the client's stack", owner: "Research agent", status: { label: "Completed", tone: "done" } },
          { title: "Draft the on-prem quote", owner: "Sales agent", status: { label: "In review", tone: "review" } },
        ],
      },
      { kind: "human", actor: "Minh", role: "Head of Sales", text: "Reads the proposal on the board and approves it. Until then, nothing reaches the client.", status: { label: "Approved", tone: "done" } },
      { kind: "agent", actor: "Lead agent", role: "Team lead", text: "Sends the proposal and books a follow-up for Thursday morning in case the client goes quiet.", status: { label: "Scheduled · Thu 09:00", tone: "progress" } },
    ],
    outcome: {
      title: "Outcome",
      body: "A proposal sent with the manager's approval, every step traced, and the follow-up already on the calendar. Lan asked once.",
    },
  },
  vi: {
    eyebrow: "Cách hoạt động",
    title: "Một yêu cầu. Cả đội cùng làm. *Chưa duyệt thì chưa gửi.*",
    lede: "Theo chân một đầu việc từ nhóm chat sales đến khi báo giá được gửi đi: ai giao việc, agent nào nhận, ai làm phần nặng, ai phê duyệt và điều gì diễn ra tiếp theo.",
    label: "Quy trình minh hoạ · tên và dữ liệu là giả lập",
    steps: [
      { kind: "human", actor: "Chị Lan", role: "Sales", text: "Nhắn trong #nhom-sales: khách Đà Nẵng cần báo giá on-prem kèm ba quy trình tuỳ chỉnh.", status: { label: "Đã gửi yêu cầu", tone: "neutral" } },
      { kind: "agent", actor: "Agent trưởng nhóm", role: "Điều phối", text: "Tách yêu cầu thành hai việc trên bảng công việc của đội và giao mỗi việc cho một agent chuyên trách.", status: { label: "Đã giao 2 việc", tone: "progress" } },
      { kind: "agent", actor: "Agent Research + Agent Sales", role: "Thành viên", text: "Agent Research tìm hiểu hệ thống khách đang dùng và các câu hỏi về bảo mật. Agent Sales soạn báo giá theo bảng giá 2026. Cả hai báo kết quả về cho trưởng nhóm." },
      {
        kind: "board",
        actor: "Bảng công việc của đội",
        role: "Trưởng nhóm và các thành viên dùng chung",
        text: "Trưởng nhóm gộp hai kết quả thành một bộ đề xuất: báo giá kèm một trang tóm tắt bảo mật. Báo giá sẽ đến tay khách, nên việc này phải chờ người duyệt.",
        tasks: [
          { title: "Tìm hiểu hệ thống của khách", owner: "Agent Research", status: { label: "Hoàn thành", tone: "done" } },
          { title: "Soạn báo giá on-prem", owner: "Agent Sales", status: { label: "Chờ duyệt", tone: "review" } },
        ],
      },
      { kind: "human", actor: "Anh Minh", role: "Trưởng phòng Sales", text: "Xem bộ đề xuất trên bảng công việc và phê duyệt. Chưa có cái gật đầu này thì chưa có gì đến tay khách.", status: { label: "Đã duyệt", tone: "done" } },
      { kind: "agent", actor: "Agent trưởng nhóm", role: "Điều phối", text: "Gửi đề xuất cho khách và đặt lịch nhắc lại vào sáng thứ Năm, phòng khi khách chưa phản hồi.", status: { label: "Đã đặt lịch · 9:00 thứ Năm", tone: "progress" } },
    ],
    outcome: {
      title: "Kết quả",
      body: "Đề xuất được gửi đi sau khi trưởng phòng duyệt, từng bước đều có trace, lịch nhắc đã nằm sẵn trên lịch. Chị Lan chỉ cần nhắn một lần.",
    },
  },
};
