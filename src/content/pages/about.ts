/**
 * /about: NextLevelBuilder.io, the founders, how we work, the ecosystem.
 * Sources: plans/reports/scout-260924-2346-ecosystem-story.md §B (mission and values from
 * nlb-web, founder facts), §A.4 and §C (GitHub counts read 2026-09-24), src/content/pages/home.ts
 * proof (8,900+ automated tests), src/content/plans.ts (On-Premises includes one year of
 * maintenance), dewee GitHub releases (six stable releases in September 2026).
 */
import type { Bi } from "~/i18n/config";

type ReportRow = { subject: string; evidence: string; grade: string; remark: string };

type AboutPage = {
  meta: { title: string; description: string; crumb: string };
  hero: { eyebrow: string; title: string; lede: string };
  proofLabel: string;
  proof: { value: string; label: string }[];
  mission: { eyebrow: string; title: string; lede: string; quote: string; cite: string };
  founders: { eyebrow: string; title: string; lede: string };
  work: {
    eyebrow: string;
    title: string;
    lede: string;
    card: {
      label: string;
      title: string;
      meta: { label: string; value: string }[];
      columns: ReportRow;
      rows: ReportRow[];
      conduct: { label: string; value: string };
      sign: string;
    };
  };
  ecosystem: { eyebrow: string; title: string; lede: string };
  cta: { title: string; body: string; primary: string; secondary: string; note: string };
};

export const ABOUT: Bi<AboutPage> = {
  en: {
    meta: {
      crumb: "About us",
      title: "About NextLevelBuilder, the team behind dewee",
      description:
        "Meet NextLevelBuilder.io, the Vietnamese team behind dewee and GoClaw: three founders, the habits we hold ourselves to, and the family of AI products we build.",
    },
    hero: {
      eyebrow: "About us",
      title: "Builders who *do the homework*.",
      lede: "dewee is made by NextLevelBuilder.io, a team of builders from Vietnam. We make AI products for companies that want the results without the risk, and we stay with you after the sale.",
    },
    proofLabel: "NextLevelBuilder in numbers",
    proof: [
      { value: "130K+", label: "GitHub stars on UI UX Pro Max" },
      { value: "115", label: "contributors to GoClaw" },
      { value: "10,000+", label: "businesses on EGANY's software" },
      { value: "65K+", label: "members of Build in Public Vietnam" },
    ],
    mission: {
      eyebrow: "Why we exist",
      title: "From zero to one is *the hardest part*.",
      lede: "NextLevelBuilder began as a community of builders, with one mission: give builders the education and opportunities they need to build and grow, starting with community. dewee brings the same idea to companies. We take the hard part, so your team can move forward.",
      quote: "Making friends, not contacts. Giving first, not taking. Helping others before helping ourselves.",
      cite: "NextLevelBuilder values",
    },
    founders: {
      eyebrow: "The founders",
      title: "Three founders, *one notebook*.",
      lede: "Between us: an open-source hit with 130K+ stars, commerce software for 10,000+ businesses, and systems built for hundreds of thousands of concurrent users.",
    },
    work: {
      eyebrow: "How we work",
      title: "Our report card, *self-assessed*.",
      lede: "Four habits we hold ourselves to, each with its evidence. Once we've worked together, grade us yourself.",
      card: {
        label: "Report card: four working habits, each with evidence, a self-assigned grade and a teacher's remark",
        title: "Report card",
        meta: [
          { label: "Student", value: "dewee" },
          { label: "School", value: "NextLevelBuilder.io" },
          { label: "Year", value: "2026" },
        ],
        columns: { subject: "Subject", evidence: "Evidence", grade: "Grade", remark: "Teacher's remark" },
        rows: [
          { subject: "Homework ethic", evidence: "We test before we ship: 8,900+ automated tests guard the dewee codebase.", grade: "10", remark: "Always hands in complete homework." },
          { subject: "Closed by default", evidence: "Every permission starts closed, behind five independent layers of defence.", grade: "10", remark: "Careful and thorough." },
          { subject: "Standing by your success", evidence: "Custom workflows built with you, and a year of maintenance with every On-Premises licence.", grade: "10", remark: "Always helps classmates." },
          { subject: "Building in public", evidence: "Six stable dewee releases in September 2026, each one on the public changelog.", grade: "10", remark: "Speaks up in class." },
        ],
        conduct: { label: "Conduct", value: "Good" },
        sign: "Self-assessed. You be the judge.",
      },
    },
    ecosystem: {
      eyebrow: "The family",
      title: "One family, *each solving one hard part*.",
      lede: "Knowledge, tooling, design and hosting: the NextLevelBuilder products that work alongside dewee.",
    },
    cta: {
      title: "Let's build *something together*.",
      body: "Tell us what your team is trying to do. We'll tell you honestly whether dewee is the right tool.",
      primary: "Contact us",
      secondary: "Chat with dewee",
      note: "we reply like humans, because we are",
    },
  },
  vi: {
    meta: {
      crumb: "Về chúng tôi",
      title: "Về NextLevelBuilder, đội ngũ đứng sau dewee",
      description:
        "Gặp NextLevelBuilder.io, đội ngũ Việt Nam đứng sau dewee và GoClaw: ba nhà sáng lập, những thói quen làm việc chúng tôi giữ, và gia đình sản phẩm AI của mình.",
    },
    hero: {
      eyebrow: "Về chúng tôi",
      title: "Những người *làm bài tập đầy đủ*.",
      lede: "dewee do NextLevelBuilder.io làm ra, một đội ngũ builder đến từ Việt Nam. Chúng tôi làm sản phẩm AI cho doanh nghiệp muốn có kết quả mà không phải gánh rủi ro, và vẫn ở bên bạn sau khi bán.",
    },
    proofLabel: "NextLevelBuilder qua những con số",
    proof: [
      { value: "130K+", label: "sao GitHub cho UI UX Pro Max" },
      { value: "115", label: "người đóng góp cho GoClaw" },
      { value: "10.000+", label: "doanh nghiệp dùng phần mềm EGANY" },
      { value: "65K+", label: "thành viên Build in Public Việt Nam" },
    ],
    mission: {
      eyebrow: "Vì sao có chúng tôi",
      title: "Từ 0 lên 1 luôn là *chặng khó nhất*.",
      lede: "NextLevelBuilder khởi đầu là một cộng đồng builder, với một sứ mệnh: trao cho người làm sản phẩm kiến thức và cơ hội để xây dựng và phát triển, bắt đầu từ cộng đồng. dewee mang cùng ý tưởng đó đến doanh nghiệp. Phần khó để chúng tôi lo, đội của bạn cứ thế tiến lên.",
      quote: "Kết bạn, không chỉ kết nối. Cho đi trước, không chờ nhận về. Giúp người khác trước khi giúp chính mình.",
      cite: "Giá trị của NextLevelBuilder",
    },
    founders: {
      eyebrow: "Nhà sáng lập",
      title: "Ba nhà sáng lập, *chung một cuốn sổ*.",
      lede: "Cộng lại, chúng tôi có: một dự án mã nguồn mở hơn 130K sao, phần mềm thương mại cho hơn 10.000 doanh nghiệp, và những hệ thống chịu tải hàng trăm nghìn người dùng đồng thời.",
    },
    work: {
      eyebrow: "Cách chúng tôi làm việc",
      title: "Học bạ của chúng tôi, *tự chấm*.",
      lede: "Bốn thói quen chúng tôi tự đặt ra, môn nào cũng có minh chứng. Làm việc cùng nhau rồi, bạn hãy tự chấm lại nhé.",
      card: {
        label: "Học bạ: bốn thói quen làm việc, mỗi môn có minh chứng, điểm tự chấm và lời phê",
        title: "Học bạ",
        meta: [
          { label: "Học sinh", value: "dewee" },
          { label: "Trường", value: "NextLevelBuilder.io" },
          { label: "Năm học", value: "2026" },
        ],
        columns: { subject: "Môn", evidence: "Minh chứng", grade: "Điểm", remark: "Lời phê" },
        rows: [
          { subject: "Làm bài tập về nhà", evidence: "Kiểm thử trước khi phát hành: hơn 8.900 bài test tự động canh giữ mã nguồn dewee.", grade: "10", remark: "Làm bài đầy đủ." },
          { subject: "Đóng mặc định", evidence: "Mọi quyền bắt đầu ở trạng thái đóng, sau năm lớp phòng thủ độc lập.", grade: "10", remark: "Cẩn thận, chu đáo." },
          { subject: "Đồng hành đến khi bạn thành công", evidence: "Cùng bạn xây workflow riêng, kèm một năm bảo trì cho mỗi license On-Premises.", grade: "10", remark: "Hay giúp đỡ bạn bè." },
          { subject: "Làm việc công khai", evidence: "Sáu bản stable của dewee trong tháng 9/2026, bản nào cũng lên changelog công khai.", grade: "10", remark: "Hăng hái phát biểu xây dựng bài." },
        ],
        conduct: { label: "Hạnh kiểm", value: "Tốt" },
        sign: "Tự chấm thôi, bạn chấm lại giúp nhé.",
      },
    },
    ecosystem: {
      eyebrow: "Hệ sinh thái",
      title: "Một gia đình, *mỗi sản phẩm giải một bài khó*.",
      lede: "Tri thức, công cụ, thiết kế và hạ tầng: các sản phẩm của NextLevelBuilder chạy cùng dewee.",
    },
    cta: {
      title: "Cùng làm *điều gì đó* nhé.",
      body: "Kể chúng tôi nghe đội bạn đang muốn làm gì. Chúng tôi sẽ nói thật dewee có phải công cụ phù hợp hay không.",
      primary: "Liên hệ",
      secondary: "Chat với dewee",
      note: "chúng tôi trả lời như người thật, vì đúng là người thật",
    },
  },
};
