/**
 * Operations: daily check-ins, polite nudges, blocker escalation and a status board.
 * Verified against dewee: team task board, ask_user reminders with followup_interval_minutes /
 * followup_max_reminders, blocker comments auto-fail and escalate to the lead, heartbeat active
 * hours, cron, team allow_user_ids / allow_channels, Lark / Zalo / Telegram / Bitrix24 channels.
 */
import type { UseCase } from "./types";

export const taskChasing: UseCase = {
  slug: "task-chasing",
  icon: "list-checks",
  area: "operations",
  team: { en: "Operations", vi: "Vận hành" },
  title: { en: "The polite colleague who chases every task", vi: "Quản lý & nhắc việc nội bộ mỗi ngày" },
  summary: {
    en: "Collect daily updates, nudge owners before deadlines, spot blockers early and give managers a clean status board.",
    vi: "Thu thập cập nhật mỗi ngày, nhắc người phụ trách trước hạn, phát hiện điểm nghẽn sớm và gửi quản lý bảng tiến độ gọn gàng.",
  },
  channels: ["lark", "zalo", "telegram", "bitrix24"],
  detail: {
    problem: {
      en: "Half of my week goes to asking “is it done yet?” in five different group chats. By the time I hear about a blocker, the deadline has already slipped.",
      vi: "Nửa tuần làm việc của tôi dành cho câu hỏi “xong chưa em?” trong năm nhóm chat khác nhau. Tới lúc nghe về điểm nghẽn thì deadline đã trễ mất rồi.",
    },
    flow: {
      en: [
        "Tasks live on a shared board, each with an owner and a date.",
        "Every morning the coordinator agent asks each owner for a one-line update in the chat they already use.",
        "Two days before a deadline it nudges the owner. If a decision is waiting on someone, it reminds that person.",
        "When an owner reports a blocker, the task is flagged and the manager is told at once, with the reason.",
        "At the end of the day, managers get one status board: done, on track, at risk and blocked.",
      ],
      vi: [
        "Đầu việc nằm trên một bảng chung, mỗi việc có người phụ trách và thời hạn.",
        "Mỗi sáng, agent điều phối hỏi từng người một dòng cập nhật, ngay trong nhóm chat họ vẫn dùng.",
        "Trước hạn hai ngày, agent nhắc người phụ trách. Nếu việc đang chờ ai đó quyết, agent nhắc đúng người đó.",
        "Khi có người báo vướng, đầu việc được đánh dấu và quản lý được báo ngay, kèm lý do.",
        "Cuối ngày, quản lý nhận một bảng tiến độ: xong, đúng tiến độ, có rủi ro và đang bị chặn.",
      ],
    },
    agents: {
      en: ["Coordinator agent"],
      vi: ["Agent điều phối"],
    },
    capabilities: {
      en: ["Team task board", "Reminders with follow-up limits", "Blocker escalation", "Heartbeat with active hours", "Cron schedules", "Lark, Zalo, Telegram & Bitrix24"],
      vi: ["Bảng việc của đội", "Nhắc việc có giới hạn số lần", "Báo lên khi bị chặn", "Heartbeat theo khung giờ", "Lịch cron", "Lark, Zalo, Telegram & Bitrix24"],
    },
    guardrails: {
      en: [
        "Reminders run only in working hours, so nobody gets a nudge at midnight.",
        "Each reminder has a limit. After that, the manager is told instead of the owner being pinged again.",
        "Deadlines and assignments change only when a manager says so.",
        "Only the people and channels you allow can give it instructions.",
        "Every nudge and update is on the record, so status is never a matter of memory.",
      ],
      vi: [
        "Chỉ nhắc trong giờ làm việc, không ai nhận tin nhắc lúc nửa đêm.",
        "Mỗi lời nhắc có giới hạn số lần. Quá giới hạn, agent báo quản lý thay vì tiếp tục nhắc người phụ trách.",
        "Thời hạn và người phụ trách chỉ thay đổi khi quản lý đồng ý.",
        "Chỉ những người và kênh bạn cho phép mới giao việc được cho agent.",
        "Mọi lời nhắc, mọi cập nhật đều được ghi lại, tiến độ không còn phụ thuộc vào trí nhớ.",
      ],
    },
    chat: { channel: "lark", room: { en: "Ops · Week 39", vi: "Vận hành · Tuần 39" } },
    transcript: {
      en: [
        { who: "dewee", me: true, text: "Morning check-in ✓ @Hoang, the supplier contract is due Thursday. How is it going? @Nga, the payroll file is due today." },
        { who: "Nga", role: "Accounting", text: "Payroll is ready, uploading now." },
        { who: "Hoang", role: "Purchasing", text: "Stuck. Legal hasn't replied since Tuesday." },
        { who: "dewee", me: true, text: "Marked blocked and told Mr Tien. I've also pinged @Vu in Legal, since the review is due Friday." },
        { who: "Tien", role: "Operations manager", text: "Thanks. Vu, can you call Hoang before lunch?" },
      ],
      vi: [
        { who: "dewee", me: true, text: "Cập nhật đầu ngày ✓ @Hoàng ơi, hợp đồng nhà cung cấp hạn thứ Năm, tới đâu rồi anh? @Nga, file lương hạn hôm nay chị nhé." },
        { who: "Chị Nga", role: "Kế toán", text: "File lương xong rồi, chị đang tải lên." },
        { who: "Anh Hoàng", role: "Mua hàng", text: "Đang kẹt em. Pháp chế chưa phản hồi từ thứ Ba." },
        { who: "dewee", me: true, text: "Em đánh dấu việc này đang bị chặn và đã báo anh Tiến. Em cũng nhắc @Vũ bên Pháp chế vì hạn review là thứ Sáu ạ." },
        { who: "Anh Tiến", role: "Trưởng phòng Vận hành", text: "Cảm ơn em. Vũ gọi Hoàng trước giờ trưa nhé?" },
      ],
    },
    outcome: {
      en: "Managers hear about blockers the day they appear instead of the day the deadline passes. The chasing happens politely and on schedule, and people spend their check-ins solving problems rather than reporting status.",
      vi: "Quản lý biết về điểm nghẽn ngay ngày nó xuất hiện, thay vì ngày deadline đã qua. Việc nhắc nhở diễn ra lịch sự và đúng giờ, còn mọi người dành thời gian để gỡ vướng thay vì báo cáo tiến độ.",
    },
    description: {
      en: "A dewee agent collects daily updates in your team chat, nudges owners before deadlines, escalates blockers at once and sends managers a clean status board.",
      vi: "Agent dewee thu thập cập nhật hằng ngày trong nhóm chat, nhắc người phụ trách trước hạn, báo ngay khi có điểm nghẽn và gửi quản lý bảng tiến độ gọn gàng.",
    },
    related: ["meeting-notes-and-decisions", "ai-coworker-in-group-chats", "hr-recruiting"],
  },
};
