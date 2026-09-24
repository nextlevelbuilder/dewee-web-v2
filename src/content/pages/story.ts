/**
 * /story: "From GoClaw to dewee: why we closed the source".
 * Sources: plans/reports/scout-260924-2346-ecosystem-story.md (§A slides 3–15, §A.4 GoClaw
 * milestones from git tags and `gh api` on 2026-09-24), the dewee repo (created 2026-06-14) and its
 * GitHub releases (six stable releases v3.28–v3.33 in September 2026), src/content/plans.ts.
 */
import type { Bi } from "~/i18n/config";

type Chapter = { id: string; title: string; body: string[]; date?: string; note?: string };

type StoryPage = {
  meta: { title: string; description: string; crumb: string };
  hero: { eyebrow: string; title: string; lede: string; note: string; contents: string };
  chapterLabel: string;
  origin: Chapter & { timelineLabel: string; timeline: { date: string; text: string }[] };
  name: Chapter & { head: string[]; rows: string[][]; caption: string };
  math: Chapter & { label: string; lines: { lhs: string; rhs: string; note?: string }[]; result: string };
  paths: Chapter & {
    spread: {
      label: string;
      arrow: string;
      draft: { tag: string; name: string; note: string };
      fair: { tag: string; name: string; grade: string; gradeLabel: string; sign: string };
      rows: { label: string; draft: string; strike?: string; fair: string }[];
    };
  };
  kept: Chapter & { items: { icon: string; title: string; body: string }[] };
  next: Chapter & { links: { label: string; href: string }[] };
  cta: { title: string; body: string; primary: string; secondary: string; note: string };
};

export const STORY: Bi<StoryPage> = {
  en: {
    meta: {
      crumb: "Our story",
      title: "From GoClaw to dewee: why we closed the source",
      description:
        "How GoClaw, an open-source AI agent gateway in Go, became dewee: the name problem, the security math, and why GoClaw stays open while dewee serves business.",
    },
    hero: {
      eyebrow: "Our story · a builder's notebook",
      title: "From GoClaw to dewee: *why we closed the source*.",
      lede: "In February 2026 we started an open-source AI agent gateway. Four months later we split it in two. This is the notebook behind that decision, crossed-out drafts included.",
      note: "six short chapters, one coffee",
      contents: "Contents",
    },
    chapterLabel: "Chapter",
    origin: {
      id: "where-it-began",
      date: "Dec 2025 – Apr 2026",
      note: "where it all began",
      title: "It started with *a risk we couldn't ignore*.",
      body: [
        "We first came across Clawdbot, the assistant that later became OpenClaw, around December 2025. We loved the idea of an AI that does real work. But we did not dare bring it into a company: there were too many risks in security, control and operations.",
        "In February 2026 the risk got a paper of its own. In *Agents of Chaos* (arXiv 2602.20021), 38 researchers from Harvard, MIT and CMU let five agents run for two weeks. One destroyed a mail server. One leaked a social security number. Two kept talking to each other in a loop for nine days.",
        "Their diagnosis matched ours: the failures came from the system around the model, not the model itself. No permissions, no isolation, no audit trail, credentials in plain text.",
        "So on 22 February 2026 we made the first commit of GoClaw: inspired by OpenClaw, designed from scratch in Go, and closed by default from day one. We built it in public, and v3 shipped less than seven weeks later.",
      ],
      timelineLabel: "GoClaw, in dates",
      timeline: [
        { date: "Dec 2025", text: "Clawdbot catches our eye, and worries us" },
        { date: "22 Feb 2026", text: "GoClaw's first commit" },
        { date: "8 Mar 2026", text: "GoClaw v1.0" },
        { date: "23 Mar 2026", text: "GoClaw v2.0" },
        { date: "9 Apr 2026", text: "v3.0: multi-tenant, agent teams, five-layer security" },
        { date: "Sep 2026", text: "3,616 stars, 1,056 forks, 115 contributors" },
      ],
    },
    name: {
      id: "the-name",
      note: "people kept asking…",
      title: "A name that *told the wrong story*.",
      body: [
        "GoClaw was a sensible name for a project written in Go. But “Claw” made many people assume it was OpenClaw, ported to Go. It was not.",
        "OpenClaw is a good personal assistant, and if it works for you, you don't need to switch. GoClaw was built for a different job: organisations, with many users, many agents and someone accountable for what they do.",
        "When every conversation starts with the same correction, the name is telling the wrong story. The enterprise product needed a name of its own.",
      ],
      head: ["", "What people heard", "What we had built"],
      rows: [
        ["Origin", "OpenClaw, ported to Go", "Inspired by OpenClaw, designed from scratch in Go"],
        ["Users", "One person, one assistant", "Many teams on one gateway, each isolated (multi-tenant)"],
        ["Security", "Open first, lock down later", "Closed by default, five layers of defence"],
        ["Records", "Whatever the chat log shows", "Every run traced, with OpenTelemetry export"],
      ],
      caption: "Same claws, different animal.",
    },
    math: {
      id: "security-math",
      note: "do the math",
      title: "The security math *of open source*.",
      body: [
        "Open source is generous, and it made GoClaw better. But for software that holds a company's credentials, customer conversations and permissions, openness has a cost, and that cost grows with success.",
        "Every line we publish can be read by people looking for a way in. When a hole is found, a small team cannot patch every self-hosted copy in time. The people who pay for that delay are the businesses that trusted us.",
      ],
      label: "The security math of open source, worked out on the blackboard",
      lines: [
        { lhs: "open code + a growing community", rhs: "more eyes on every line", note: "the good part" },
        { lhs: "more eyes", rhs: "more people hunting for holes", note: "also true" },
        { lhs: "a small team ÷ every self-hosted copy", rhs: "patches that arrive late" },
      ],
      result: "Agents for business need closed source, and every door closed by default.",
    },
    paths: {
      id: "two-paths",
      date: "Jun 2026",
      note: "the fork in the road",
      title: "Two paths, *one family*.",
      body: [
        "In June 2026 we split the work. GoClaw stays open and community-driven: free to self-host for non-commercial use under CC BY-NC 4.0, and still maintained for fixes and stability.",
        "dewee is the enterprise path: closed source, safer by design, and still creative. It adds what companies ask for: a customer control plane, licensing, stricter permissions and a team that supports you.",
        "It comes from founders who have shipped products people love: UI UX Pro Max with 130K+ GitHub stars, AgentKit, and EGANY's commerce software for more than 10,000 businesses.",
      ],
      spread: {
        label: "GoClaw as the draft and dewee as the fair copy, side by side: name, source, patches, audience, price and support",
        arrow: "copied out neatly",
        draft: { tag: "Draft", name: "GoClaw", note: "written fast, in public" },
        fair: { tag: "Fair copy", name: "dewee", grade: "10", gradeLabel: "Graded 10 out of 10", sign: "Everything here is for you." },
        rows: [
          { label: "Name", strike: "OpenClaw, ported to Go", draft: "inspired by it, built from scratch", fair: "dewee: a name of its own" },
          { label: "Source", draft: "Open to everyone, CC BY-NC 4.0", fair: "Closed source, under licence" },
          { label: "Patches", strike: "same day, every time", draft: "as fast as a small team can", fair: "Stable and beta channels: six stable releases in September 2026" },
          { label: "Built for", draft: "Builders and self-hosters", fair: "Companies: multi-tenant, roles, audit trails" },
          { label: "Price", draft: "Free, non-commercial", fair: "Licensed: SaaS, Dedicated or On-Premises" },
          { label: "Support", draft: "The community, when it can", fair: "A team that supports you, and custom workflows built with you" },
        ],
      },
    },
    kept: {
      id: "what-we-kept",
      note: "packed for the trip",
      title: "What we *kept*.",
      body: ["The philosophy came with us, unchanged. Six principles, straight from GoClaw's first talks."],
      items: [
        { icon: "lock", title: "Closed by default", body: "Every permission starts closed. Your business opens exactly what it needs, and nothing more." },
        { icon: "route", title: "Fix the architecture, not the blame", body: "When an agent goes wrong, we fix the system around the model instead of blaming the model." },
        { icon: "layers", title: "Defence in depth", body: "Five independent layers. Get past one, and four still stand." },
        { icon: "building-2", title: "Built for organisations", body: "Multi-tenant, per-user isolation, roles, audit trails and encrypted credentials." },
        { icon: "hand-heart", title: "Respect the open ecosystem", body: "OpenClaw serves individuals well, and GoClaw stays open for the community. We compete by building, not by knocking others." },
        { icon: "megaphone", title: "Build in public", body: "Releases on the changelog, plans on the roadmap, and honesty about what breaks." },
      ],
    },
    next: {
      id: "what-comes-next",
      date: "Sep 2026 →",
      note: "to be continued",
      title: "What *comes next*.",
      body: [
        "GoClaw keeps getting fixes and stays free for the community. dewee keeps shipping, stable and beta, straight from GitHub to our changelog.",
        "And we keep this notebook open. The roadmap shows what we are building now, next and later, without dates we can't promise.",
      ],
      links: [
        { label: "Read the roadmap", href: "/roadmap" },
        { label: "Browse the changelog", href: "/changelog" },
        { label: "GoClaw on GitHub", href: "https://github.com/nextlevelbuilder/goclaw" },
      ],
    },
    cta: {
      title: "Want the fair copy *for your company*?",
      body: "Tell us what your team needs, and we'll show you how dewee would do it.",
      primary: "Talk to us",
      secondary: "Chat with dewee",
      note: "GoClaw fans are welcome too",
    },
  },
  vi: {
    meta: {
      crumb: "Câu chuyện",
      title: "Từ GoClaw đến dewee: vì sao chúng tôi đóng mã nguồn",
      description:
        "Hành trình từ GoClaw, AI agent gateway mã nguồn mở viết bằng Go, đến dewee cho doanh nghiệp: chuyện cái tên, bài toán bảo mật và vì sao GoClaw vẫn tiếp tục mở.",
    },
    hero: {
      eyebrow: "Câu chuyện · sổ tay người làm sản phẩm",
      title: "Từ GoClaw đến dewee: *vì sao chúng tôi đóng mã nguồn*.",
      lede: "Tháng 2/2026, chúng tôi bắt đầu một AI agent gateway mã nguồn mở. Bốn tháng sau, chúng tôi tách nó làm hai. Đây là cuốn sổ ghi lại quyết định đó, kể cả những trang nháp gạch xoá.",
      note: "sáu chương ngắn, vừa một ly cà phê",
      contents: "Mục lục",
    },
    chapterLabel: "Chương",
    origin: {
      id: "where-it-began",
      date: "12/2025 – 4/2026",
      note: "mọi chuyện bắt đầu từ đây",
      title: "Bắt đầu từ *một rủi ro không thể làm ngơ*.",
      body: [
        "Chúng tôi biết đến Clawdbot, trợ lý sau này trở thành OpenClaw, từ khoảng tháng 12/2025. Ý tưởng một AI làm việc thật rất hấp dẫn. Nhưng chúng tôi không dám đưa nó vào doanh nghiệp: có quá nhiều rủi ro về bảo mật, kiểm soát và vận hành.",
        "Tháng 2/2026, rủi ro đó được viết thành hẳn một bài nghiên cứu. Trong *Agents of Chaos* (arXiv 2602.20021), 38 nhà nghiên cứu từ Harvard, MIT và CMU cho năm agent chạy suốt hai tuần. Một agent phá hỏng cả mail server. Một agent làm lộ số an sinh xã hội. Hai agent nói chuyện vòng vo với nhau suốt chín ngày.",
        "Kết luận của họ cũng là của chúng tôi: lỗi nằm ở hệ thống quanh mô hình, không phải ở bản thân AI. Không phân quyền, không cô lập, không nhật ký kiểm toán, thông tin đăng nhập để dạng văn bản thô.",
        "Thế là ngày 22/2/2026, GoClaw có commit đầu tiên: lấy cảm hứng từ OpenClaw, thiết kế lại từ đầu bằng Go, đóng mặc định ngay từ ngày đầu. Chúng tôi làm công khai, và chưa đầy bảy tuần sau đã có v3.",
      ],
      timelineLabel: "GoClaw qua các mốc",
      timeline: [
        { date: "12/2025", text: "Biết đến Clawdbot, thích nhưng lo" },
        { date: "22/2/2026", text: "Commit đầu tiên của GoClaw" },
        { date: "8/3/2026", text: "GoClaw v1.0" },
        { date: "23/3/2026", text: "GoClaw v2.0" },
        { date: "9/4/2026", text: "v3.0: multi-tenant, đội agent, bảo mật 5 lớp" },
        { date: "9/2026", text: "3.616 sao, 1.056 fork, 115 người đóng góp" },
      ],
    },
    name: {
      id: "the-name",
      note: "ai cũng hỏi câu đó…",
      title: "Một cái tên *kể sai câu chuyện*.",
      body: [
        "GoClaw là cái tên hợp lý cho một dự án viết bằng Go. Nhưng chữ “Claw” khiến nhiều người nghĩ đây là OpenClaw chuyển sang Go. Không phải vậy.",
        "OpenClaw là một trợ lý cá nhân tốt, nếu nó hợp với bạn thì không cần đổi. GoClaw được làm cho một việc khác: tổ chức, với nhiều người dùng, nhiều agent và luôn có người chịu trách nhiệm cho việc chúng làm.",
        "Khi cuộc trò chuyện nào cũng mở đầu bằng cùng một lời đính chính, nghĩa là cái tên đang kể sai câu chuyện. Bản dành cho doanh nghiệp cần một cái tên của riêng nó.",
      ],
      head: ["", "Mọi người tưởng", "Thực tế chúng tôi làm"],
      rows: [
        ["Nguồn gốc", "OpenClaw viết lại bằng Go", "Lấy cảm hứng từ OpenClaw, thiết kế từ đầu bằng Go"],
        ["Người dùng", "Một người, một trợ lý", "Nhiều đội dùng chung một gateway, mỗi đội tách biệt (multi-tenant)"],
        ["Bảo mật", "Mở trước, khoá sau", "Đóng mặc định, phòng thủ 5 lớp"],
        ["Lưu vết", "Lịch sử chat có gì thì biết nấy", "Mọi lượt chạy đều có trace, xuất được qua OpenTelemetry"],
      ],
      caption: "Tên na ná, ruột khác hẳn.",
    },
    math: {
      id: "security-math",
      note: "làm phép tính",
      title: "Bài toán bảo mật *của mã nguồn mở*.",
      body: [
        "Mã nguồn mở rất hào phóng, và nó giúp GoClaw tốt lên nhiều. Nhưng với phần mềm nắm giữ thông tin đăng nhập, hội thoại khách hàng và quyền hạn của cả một công ty, sự cởi mở có cái giá của nó, và cái giá ấy lớn dần theo thành công.",
        "Mỗi dòng code công khai đều có thể bị đọc bởi người đang tìm cách xâm nhập. Khi lộ ra lỗ hổng, một đội nhỏ không thể vá kịp từng bản tự cài đặt. Người trả giá cho sự chậm trễ đó là những doanh nghiệp đã tin chúng tôi.",
      ],
      label: "Bài toán bảo mật của mã nguồn mở, giải trên bảng đen",
      lines: [
        { lhs: "mã nguồn mở + cộng đồng lớn dần", rhs: "nhiều người đọc từng dòng code", note: "điều tốt" },
        { lhs: "nhiều người đọc", rhs: "nhiều người đi tìm lỗ hổng", note: "cũng là sự thật" },
        { lhs: "một đội nhỏ ÷ từng bản tự cài đặt", rhs: "bản vá luôn đến muộn" },
      ],
      result: "Agent cho doanh nghiệp cần mã nguồn đóng, và mọi cánh cửa đóng sẵn.",
    },
    paths: {
      id: "two-paths",
      date: "6/2026",
      note: "ngã rẽ",
      title: "Hai con đường, *một gia đình*.",
      body: [
        "Tháng 6/2026, chúng tôi tách đôi công việc. GoClaw tiếp tục mở và do cộng đồng dẫn dắt: miễn phí tự cài đặt cho mục đích phi thương mại theo giấy phép CC BY-NC 4.0, và vẫn được bảo trì để sửa lỗi, giữ ổn định.",
        "dewee là con đường cho doanh nghiệp: mã nguồn đóng, an toàn hơn ngay từ thiết kế, mà vẫn đầy sáng tạo. dewee thêm những thứ doanh nghiệp cần: trang quản trị cho khách hàng, license, phân quyền chặt hơn và một đội ngũ đồng hành cùng bạn.",
        "Đứng sau dewee là những người đã làm ra các sản phẩm được yêu thích: UI UX Pro Max với hơn 130K sao GitHub, AgentKit, và phần mềm thương mại của EGANY phục vụ hơn 10.000 doanh nghiệp.",
      ],
      spread: {
        label: "GoClaw là bản nháp, dewee là bản chép sạch, đặt cạnh nhau: tên gọi, mã nguồn, bản vá, đối tượng, chi phí và hỗ trợ",
        arrow: "chép sạch lại",
        draft: { tag: "Giấy nháp", name: "GoClaw", note: "viết nhanh, viết công khai" },
        fair: { tag: "Chép sạch", name: "dewee", grade: "10", gradeLabel: "Điểm 10", sign: "Tất cả những điều này là dành cho bạn." },
        rows: [
          { label: "Tên gọi", strike: "OpenClaw bản Go", draft: "lấy cảm hứng, viết lại từ đầu", fair: "dewee: một cái tên của riêng mình" },
          { label: "Mã nguồn", draft: "Mở cho tất cả, CC BY-NC 4.0", fair: "Mã nguồn đóng, dùng theo license" },
          { label: "Bản vá", strike: "trong ngày, lần nào cũng vậy", draft: "nhanh nhất một đội nhỏ có thể", fair: "Kênh stable và beta: riêng tháng 9/2026 có sáu bản stable" },
          { label: "Dành cho", draft: "Builder và người tự host", fair: "Doanh nghiệp: multi-tenant, phân vai trò, nhật ký kiểm toán" },
          { label: "Chi phí", draft: "Miễn phí, phi thương mại", fair: "License On-Premises, cài trên máy chủ của bạn" },
          { label: "Hỗ trợ", draft: "Cộng đồng giúp khi có thể", fair: "Đội ngũ đồng hành, cùng bạn xây workflow riêng" },
        ],
      },
    },
    kept: {
      id: "what-we-kept",
      note: "hành trang mang theo",
      title: "Những gì *chúng tôi giữ lại*.",
      body: ["Triết lý thì mang theo nguyên vẹn. Sáu nguyên tắc, từ những buổi chia sẻ đầu tiên về GoClaw."],
      items: [
        { icon: "lock", title: "Đóng mặc định", body: "Mọi quyền đều bắt đầu ở trạng thái đóng. Doanh nghiệp mở đúng những gì cần, không hơn." },
        { icon: "route", title: "Sửa kiến trúc, không đổ lỗi", body: "Khi agent làm sai, chúng tôi sửa hệ thống quanh mô hình thay vì đổ lỗi cho AI." },
        { icon: "layers", title: "Phòng thủ nhiều lớp", body: "Năm lớp độc lập. Vượt qua một lớp, vẫn còn bốn lớp chặn lại." },
        { icon: "building-2", title: "Làm cho tổ chức", body: "Multi-tenant, cô lập từng người dùng, phân vai trò, nhật ký kiểm toán và mã hoá thông tin đăng nhập." },
        { icon: "hand-heart", title: "Tôn trọng hệ sinh thái mở", body: "OpenClaw phục vụ cá nhân rất tốt, GoClaw vẫn mở cho cộng đồng. Chúng tôi cạnh tranh bằng sản phẩm, không bằng cách chê người khác." },
        { icon: "megaphone", title: "Build in public", body: "Bản phát hành lên changelog, kế hoạch lên lộ trình, và nói thật cả khi có thay đổi gây vỡ." },
      ],
    },
    next: {
      id: "what-comes-next",
      date: "9/2026 →",
      note: "còn tiếp",
      title: "Chuyện *tiếp theo*.",
      body: [
        "GoClaw vẫn được sửa lỗi và miễn phí cho cộng đồng. dewee vẫn đều đặn ra bản mới, cả stable lẫn beta, đi thẳng từ GitHub lên changelog của chúng tôi.",
        "Và cuốn sổ này vẫn để mở. Lộ trình cho bạn thấy chúng tôi đang làm gì, sắp làm gì và để sau, mà không hứa những mốc ngày không chắc giữ được.",
      ],
      links: [
        { label: "Xem lộ trình", href: "/roadmap" },
        { label: "Xem nhật ký thay đổi", href: "/changelog" },
        { label: "GoClaw trên GitHub", href: "https://github.com/nextlevelbuilder/goclaw" },
      ],
    },
    cta: {
      title: "Muốn bản chép sạch *cho công ty bạn*?",
      body: "Kể chúng tôi nghe đội bạn cần gì, chúng tôi sẽ cho bạn thấy dewee làm việc đó ra sao.",
      primary: "Nói chuyện với chúng tôi",
      secondary: "Chat với dewee",
      note: "fan GoClaw cũng rất được chào đón",
    },
  },
};
