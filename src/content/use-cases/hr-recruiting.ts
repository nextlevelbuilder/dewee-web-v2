/**
 * People & HR: CV screening with reasons, interview slots and candidate updates.
 * Verified against dewee: read_document (PDF, DOCX), knowledge vault, Google Workspace CLI via
 * Secure CLI (read-oriented preset; writes need a separate reviewed credential), team task board,
 * AES-256-GCM secrets at rest.
 */
import type { UseCase } from "./types";

export const hrRecruiting: UseCase = {
  slug: "hr-recruiting",
  icon: "briefcase",
  area: "operations",
  team: { en: "People & HR", vi: "Nhân sự" },
  title: { en: "Screen candidates without the backlog", vi: "Hỗ trợ tuyển dụng & review hồ sơ" },
  summary: {
    en: "Read CVs against the job brief, shortlist with reasons, schedule interviews and keep candidates in the loop.",
    vi: "Đọc CV theo mô tả công việc, lọc danh sách kèm lý do, xếp lịch phỏng vấn và cập nhật cho ứng viên.",
  },
  channels: ["lark", "slack", "zalo"],
  detail: {
    problem: {
      en: "One job post brings in hundreds of CVs. We skim them late at night, good candidates wait a week to hear back, and by then they have taken another offer.",
      vi: "Một tin tuyển dụng kéo về cả trăm CV. Chúng tôi đọc lướt lúc khuya, ứng viên tốt chờ cả tuần mới được hồi âm, và tới lúc đó họ đã nhận lời nơi khác.",
    },
    flow: {
      en: [
        "The recruiter shares the job brief and the must-haves once. The screening agent keeps them in its knowledge vault.",
        "CVs arrive as PDF or Word files, and the agent reads each one against the brief.",
        "It proposes a shortlist with a short reason for every yes, every maybe and every no.",
        "For the candidates you approve, it checks the interviewers' calendars and suggests slots.",
        "It drafts candidate updates in your tone, and the recruiter sends them.",
      ],
      vi: [
        "Người tuyển dụng gửi mô tả công việc và các tiêu chí bắt buộc một lần. Agent sàng lọc lưu chúng vào kho tri thức.",
        "CV gửi tới dưới dạng PDF hoặc Word, agent đọc từng hồ sơ và đối chiếu với mô tả công việc.",
        "Agent đề xuất danh sách rút gọn; mỗi đánh giá “phù hợp”, “cân nhắc” hay “chưa phù hợp” đều kèm lý do ngắn.",
        "Với ứng viên bạn duyệt, agent xem lịch của người phỏng vấn và gợi ý khung giờ.",
        "Agent soạn sẵn thư cập nhật cho ứng viên theo giọng của công ty, người tuyển dụng tự gửi đi.",
      ],
    },
    agents: {
      en: ["Screening agent", "Scheduling agent"],
      vi: ["Agent sàng lọc hồ sơ", "Agent xếp lịch"],
    },
    capabilities: {
      en: ["Document reading (PDF, DOCX)", "Knowledge vault", "Google Workspace CLI (Calendar)", "Team task board", "Per-user isolation"],
      vi: ["Đọc tài liệu (PDF, DOCX)", "Kho tri thức", "Google Workspace CLI (Calendar)", "Bảng việc của đội", "Cô lập dữ liệu theo người dùng"],
    },
    guardrails: {
      en: [
        "Every shortlist is a suggestion. A recruiter makes every yes and every no.",
        "Reasons are written down, so you can spot a bad pattern early and correct it.",
        "Calendar access is read-only by default. Writing to calendars or email needs a separate credential you approve.",
        "Candidate files stay inside your tenant, and stored credentials are encrypted at rest.",
        "Nothing reaches a candidate until a person presses send.",
      ],
      vi: [
        "Danh sách rút gọn chỉ là gợi ý. Người tuyển dụng quyết định từng lựa chọn nhận hay loại.",
        "Lý do được ghi lại rõ ràng, nên bạn phát hiện và sửa sớm một cách đánh giá chưa đúng.",
        "Mặc định chỉ được đọc lịch. Muốn ghi vào lịch hay gửi email cần một credential riêng do bạn duyệt.",
        "Hồ sơ ứng viên nằm trong tenant của bạn, thông tin xác thực được mã hoá khi lưu trữ.",
        "Không có gì tới tay ứng viên cho tới khi một người bấm gửi.",
      ],
    },
    chat: { channel: "lark", room: { en: "Hiring · Senior accountant", vi: "Tuyển dụng · Kế toán tổng hợp" } },
    transcript: {
      en: [
        { who: "dewee", me: true, text: "Screened 64 CVs for Senior Accountant ✓ 9 strong, 14 maybe, 41 not a fit. Most common reasons for “not a fit”: no VAT filing experience, or under three years." },
        { who: "Mai", role: "HR", text: "@dewee why is Tran Quoc Bao only a maybe?" },
        { who: "dewee", me: true, text: "Five years in audit, which fits, but no hands-on month-end close. Worth a phone screen if the team can teach that part." },
        { who: "Mai", role: "HR", text: "Move him to strong. Suggest interview slots for the top ten." },
        { who: "dewee", me: true, text: "Mr Duc and Ms Ha are both free Tuesday 14:00–17:00 and Thursday 9:00–11:00. Draft invitations are ready for you to send." },
      ],
      vi: [
        { who: "dewee", me: true, text: "Em đã sàng lọc 64 CV cho vị trí Kế toán tổng hợp ✓ 9 rất phù hợp, 14 cân nhắc, 41 chưa phù hợp. Lý do phổ biến nhất: chưa từng kê khai thuế GTGT, hoặc dưới 3 năm kinh nghiệm." },
        { who: "Chị Mai", role: "Nhân sự", text: "@dewee sao bạn Trần Quốc Bảo chỉ ở mức cân nhắc em?" },
        { who: "dewee", me: true, text: "Bạn ấy có 5 năm kiểm toán, khá hợp, nhưng chưa trực tiếp làm khoá sổ cuối tháng ạ. Nếu phòng kế toán kèm được phần này thì nên gọi sơ vấn." },
        { who: "Chị Mai", role: "Nhân sự", text: "Chuyển bạn ấy lên nhóm phù hợp. Gợi ý lịch phỏng vấn cho 10 bạn đầu nhé." },
        { who: "dewee", me: true, text: "Anh Đức và chị Hà cùng trống chiều thứ Ba 14:00–17:00 và sáng thứ Năm 9:00–11:00 ạ. Thư mời em soạn sẵn rồi, chị gửi giúp em." },
      ],
    },
    outcome: {
      en: "Candidates hear back in days, not weeks, and every decision comes with a reason you can read. Recruiters spend their time talking to people instead of sorting files.",
      vi: "Ứng viên nhận phản hồi sau vài ngày thay vì vài tuần, và quyết định nào cũng có lý do để đọc lại. Người tuyển dụng dành thời gian trò chuyện với con người thay vì ngồi phân loại hồ sơ.",
    },
    description: {
      en: "dewee agents read CVs against your job brief, shortlist with a reason for each, suggest interview slots and draft updates. Recruiters make every call.",
      vi: "Agent dewee đọc CV theo mô tả công việc, lọc ứng viên kèm lý do từng người, gợi ý lịch phỏng vấn và soạn thư cập nhật. Người tuyển dụng quyết định cuối cùng.",
    },
    related: ["meeting-notes-and-decisions", "task-chasing", "ai-coworker-in-group-chats"],
  },
};
