/**
 * /partners: the partner programme, modelled on agentbrain.sh/partners.
 * Tiers, deposits, margins, perks, the BD ladder, revenue splits and 90-day deal registration are
 * NextLevelBuilder's programme as published for AgentBrain (plans/reports/
 * scout-260924-2346-ecosystem-story.md §D.2–D.5, D.8). Whether dewee keeps exactly these terms is an
 * open question for the owner; the page says the tiers follow that programme.
 */
import type { Bi } from "~/i18n/config";
import type { LeadFormCopy } from "~/components/blocks/company/lead-form-types";

type Role = { id: "solution" | "bd"; fig: string; tag: string; name: string; summary: string; points: string[]; exemplar: string; cta: string };

type PartnersPage = {
  meta: { title: string; description: string; crumb: string };
  hero: { eyebrow: string; title: string; lede: string; primary: string; secondary: string; note: string };
  roles: { eyebrow: string; title: string; lede: string; items: Role[] };
  tiers: {
    eyebrow: string;
    title: string;
    lede: string;
    label: string;
    depositLabel: string;
    marginLabel: string;
    items: { name: string; deposit: string; margin: string; perks: string[] }[];
    bd: { caption: string; head: string[]; rows: string[][]; note: string };
    source: string;
  };
  benefits: { eyebrow: string; title: string; items: { icon: string; title: string; body: string }[] };
  steps: { eyebrow: string; title: string; label: string; items: { title: string; body: string }[] };
  faq: { eyebrow: string; title: string; items: { q: string; a: string }[] };
  apply: { eyebrow: string; title: string; lede: string; checklist: { title: string; items: string[] }; email: string } & LeadFormCopy;
};

export const PARTNERS: Bi<PartnersPage> = {
  en: {
    meta: {
      crumb: "Partners",
      title: "dewee partner programme: build, sell, earn",
      description:
        "Join the dewee partner programme as a Solution Partner or BD Partner. Deploy AI agents for your clients, earn licence margin and grow with NextLevelBuilder.",
    },
    hero: {
      eyebrow: "Partner programme",
      title: "Build, sell and *earn* with dewee.",
      lede: "Two tracks. Solution Partners deploy and support dewee for their clients, starting from a $5,000 deposit. BD Partners bring in the deals, starting from $2,000 under a qualified Solution Partner.",
      primary: "Apply now",
      secondary: "Talk to partnerships",
      note: "same ladder as our AgentBrain programme",
    },
    roles: {
      eyebrow: "Two ways to partner",
      title: "Pick the role that *matches how you ship*.",
      lede: "Deliver projects yourself, or open the doors and let a Solution Partner deliver. Both tracks earn.",
      items: [
        {
          id: "solution",
          fig: "fig. 01",
          tag: "Implementation partner",
          name: "Solution Partner",
          summary: "For teams that already deploy AI agents for clients, on GoClaw, dewee or AgentBrain.",
          points: [
            "Minimum deposit: $5,000",
            "Deploy, train, hand over and support client projects",
            "Keep 100% of implementation revenue when you deliver on your own",
            "Keep 75% when you use NLB's support and knowledge-sharing channel",
            "Earn a 25% referral when NLB delivers the whole project",
          ],
          exemplar: "Reference partners: EGANY, DIGITOP",
          cta: "Apply as Solution Partner",
        },
        {
          id: "bd",
          fig: "fig. 02",
          tag: "Business development",
          name: "BD Partner",
          summary: "For people with the relationships. You open doors and nurture B2B deals, under a Grandmaster or Legendary Solution Partner.",
          points: [
            "Minimum deposit: $2,000",
            "Approval from a qualified Solution Partner",
            "Register and nurture B2B opportunities",
            "Earn referral revenue when projects close",
            "Grow into a Solution Partner over time",
          ],
          exemplar: "Starts at the Hunter tier",
          cta: "Apply as BD Partner",
        },
      ],
    },
    tiers: {
      eyebrow: "Deposit wallet",
      title: "Solution Partner tiers *start at $5,000*.",
      lede: "Climb from Elite to Legendary as your capability and deposit grow. Every step up raises your licence margin.",
      label: "Solution Partner tiers, from Elite to Legendary",
      depositLabel: "Min. deposit",
      marginLabel: "licence margin",
      items: [
        { name: "Elite", deposit: "$5,000", margin: "30%", perks: ["Access to implementation specialists", "Exclusive sales kit"] },
        { name: "Master", deposit: "$15,000", margin: "40%", perks: ["Inbound leads assigned by region", "Co-branded webinar support"] },
        { name: "Grandmaster", deposit: "$40,000", margin: "50%", perks: ["Dedicated account manager", "Sub-agent rights for your BD network"] },
        { name: "Legendary", deposit: "$80,000", margin: "60%", perks: ["Private automation API", "Custom on-premises distribution", "A seat on the NLB steering committee"] },
      ],
      bd: {
        caption: "BD commission ladder",
        head: ["Tier", "Deposit", "Commission", "Quota", "Licence discount"],
        rows: [
          ["Hunter", "$2,000", "18%", "$4,000 / 6 months", "15%"],
          ["Closer", "$5,000", "20%", "$12,000 / 6 months", "20%"],
          ["Commander", "$15,000", "22%", "$20,000 / 6 months", "25%"],
          ["Warlord", "$30,000", "25%", "$40,000 / 12 months", "30%"],
        ],
        note: "BD Partners start at Hunter, after the $2,000 deposit and approval from a Solution Partner. BD revenue is referral-based unless you later qualify as a Solution Partner.",
      },
      source: "Tiers and rates follow the NextLevelBuilder partner programme, shared with AgentBrain.",
    },
    benefits: {
      eyebrow: "What you get",
      title: "Everything you need to *ship and scale*.",
      items: [
        { icon: "wallet", title: "Revenue ownership", body: "Keep 100% of implementation revenue on projects you deliver without NLB's weekly support." },
        { icon: "handshake", title: "Supported delivery", body: "Keep 75% when you lean on NLB's support and private knowledge-sharing channel." },
        { icon: "users", title: "NLB-led delivery", body: "Earn a 25% referral when the NLB team delivers the whole project." },
        { icon: "shield-check", title: "Deal registration", body: "Registered deals are protected for 90 days. No internal cannibalisation." },
        { icon: "graduation-cap", title: "Partner training", body: "Onboarding when you join, then enablement with every release." },
        { icon: "git-branch", title: "Product branches", body: "Supported Solution Partners can propose product branches built on their market strengths." },
      ],
    },
    steps: {
      eyebrow: "How it works",
      title: "Three steps *to your first project*.",
      label: "Step",
      items: [
        { title: "Apply", body: "Tell us about your business, your clients and the track you have in mind. The form is at the bottom of this page." },
        { title: "Agree on a track", body: "We reply with a suggested track, tier and onboarding plan, and answer your questions." },
        { title: "Onboard and ship", body: "Training, the sales kit and deal registration. Then your first client project." },
      ],
    },
    faq: {
      eyebrow: "Questions",
      title: "Partner *FAQ*.",
      items: [
        {
          q: "What's the difference between a Solution Partner and a BD Partner?",
          a: "Solution Partners deliver: they deploy dewee, train the client, hand over and support the project. BD Partners open doors and nurture deals under a Grandmaster or Legendary Solution Partner, and earn referral revenue when projects close.",
        },
        {
          q: "What is the deposit for?",
          a: "Each tier starts with a minimum deposit into your partner wallet. Higher tiers come with a larger licence margin and more privileges, from a sales kit at Elite to a steering committee seat at Legendary.",
        },
        {
          q: "How much of the implementation revenue do I keep?",
          a: "100% when you deliver without NLB's weekly support channel, 75% when you use NLB's support and knowledge sharing, and a 25% referral when NLB delivers the whole project.",
        },
        {
          q: "What if another partner is talking to the same client?",
          a: "Register the deal. Registered deals are protected for 90 days, so partners don't compete with each other for the same client.",
        },
        {
          q: "Can a BD Partner become a Solution Partner?",
          a: "Yes. The BD track is designed to graduate toward Solution Partner once you can deliver projects yourself.",
        },
        {
          q: "Who are your current partners?",
          a: "EGANY is a Solution Partner for full implementation, training and support. DIGITOP is our Engineering Partner for custom modules and on-call support.",
        },
      ],
    },
    apply: {
      eyebrow: "Apply",
      title: "Ready to ship *enterprise AI* with us?",
      lede: "Tell us about your business. We'll reply with a suggested track and an onboarding plan.",
      checklist: {
        title: "Good to include",
        items: ["The clients or industries you serve", "Projects you've already delivered with AI agents", "The track and tier you have in mind", "Where you operate"],
      },
      email: "Prefer email? Write to [hi@nextlevelbuilder.io](mailto:hi@nextlevelbuilder.io).",
      fields: [
        { name: "name", label: "Your name", type: "text", required: true, autocomplete: "name" },
        { name: "email", label: "Work email", type: "email", required: true, autocomplete: "email", placeholder: "you@company.com" },
        { name: "company", label: "Company", type: "text", required: true, autocomplete: "organization", maxlength: 160 },
        { name: "country", label: "Country", type: "text", required: true, autocomplete: "country-name", maxlength: 80 },
        {
          name: "role",
          label: "Track",
          type: "select",
          required: true,
          query: "role",
          options: [
            { value: "", label: "Choose a track" },
            { value: "solution", label: "Solution Partner" },
            { value: "bd", label: "BD Partner" },
            { value: "not-sure", label: "Not sure yet" },
          ],
        },
        {
          name: "tier",
          label: "Tier you're considering",
          type: "select",
          query: "tier",
          value: "not-sure",
          options: [
            { value: "not-sure", label: "Not sure yet" },
            { value: "elite", label: "Elite · $5,000" },
            { value: "master", label: "Master · $15,000" },
            { value: "grandmaster", label: "Grandmaster · $40,000" },
            { value: "legendary", label: "Legendary · $80,000" },
            { value: "hunter", label: "Hunter (BD) · $2,000" },
            { value: "closer", label: "Closer (BD) · $5,000" },
            { value: "commander", label: "Commander (BD) · $15,000" },
            { value: "warlord", label: "Warlord (BD) · $30,000" },
          ],
        },
        {
          name: "message",
          label: "Tell us about your business",
          type: "textarea",
          required: true,
          rows: 6,
          placeholder: "Team size, industries you serve, projects you've delivered, and why dewee fits your portfolio.",
        },
      ],
      submit: "Send application",
      success: {
        title: "Application received.",
        body: "Thank you. Our partnerships team will read it and reply by email with a suggested track and next steps.",
        again: "Send another application",
      },
    },
  },
  vi: {
    meta: {
      crumb: "Đối tác",
      title: "Chương trình đối tác dewee: triển khai, bán, cùng hưởng",
      description:
        "Trở thành Solution Partner hoặc BD Partner của dewee: triển khai AI agent cho khách hàng, hưởng biên lợi nhuận license và cùng phát triển với NextLevelBuilder.",
    },
    hero: {
      eyebrow: "Chương trình đối tác",
      title: "Triển khai, bán và *cùng hưởng* với dewee.",
      lede: "Hai hướng hợp tác. Solution Partner triển khai và hỗ trợ dewee cho khách hàng, ký quỹ từ $5.000. BD Partner mang về cơ hội kinh doanh, ký quỹ từ $2.000 dưới một Solution Partner đủ điều kiện.",
      primary: "Đăng ký ngay",
      secondary: "Trao đổi với đội đối tác",
      note: "cùng bậc thang với chương trình AgentBrain",
    },
    roles: {
      eyebrow: "Hai cách hợp tác",
      title: "Chọn vai trò *hợp với cách bạn làm*.",
      lede: "Tự triển khai dự án, hoặc mở cửa để một Solution Partner triển khai. Hướng nào cũng có thu nhập.",
      items: [
        {
          id: "solution",
          fig: "hình 01",
          tag: "Đối tác triển khai",
          name: "Solution Partner",
          summary: "Dành cho đội ngũ đã triển khai AI agent cho khách hàng, trên GoClaw, dewee hoặc AgentBrain.",
          points: [
            "Ký quỹ tối thiểu: $5.000",
            "Triển khai, đào tạo, bàn giao và hỗ trợ dự án khách hàng",
            "Giữ 100% doanh thu triển khai khi tự làm trọn",
            "Giữ 75% khi dùng kênh hỗ trợ và chia sẻ kiến thức của NLB",
            "Nhận 25% hoa hồng giới thiệu khi NLB làm trọn dự án",
          ],
          exemplar: "Đối tác tiêu biểu: EGANY, DIGITOP",
          cta: "Đăng ký Solution Partner",
        },
        {
          id: "bd",
          fig: "hình 02",
          tag: "Phát triển kinh doanh",
          name: "BD Partner",
          summary: "Dành cho người có quan hệ. Bạn mở cửa và chăm sóc cơ hội B2B, dưới một Solution Partner hạng Grandmaster hoặc Legendary.",
          points: [
            "Ký quỹ tối thiểu: $2.000",
            "Được một Solution Partner đủ điều kiện duyệt",
            "Đăng ký và chăm sóc cơ hội B2B",
            "Nhận doanh thu giới thiệu khi dự án chốt",
            "Dần tiến lên Solution Partner",
          ],
          exemplar: "Bắt đầu từ hạng Hunter",
          cta: "Đăng ký BD Partner",
        },
      ],
    },
    tiers: {
      eyebrow: "Ví ký quỹ",
      title: "Hạng Solution Partner *bắt đầu từ $5.000*.",
      lede: "Lên hạng từ Elite đến Legendary khi năng lực và ký quỹ tăng. Mỗi bậc lên, biên lợi nhuận license cũng tăng theo.",
      label: "Các hạng Solution Partner, từ Elite đến Legendary",
      depositLabel: "Ký quỹ tối thiểu",
      marginLabel: "biên lợi nhuận license",
      items: [
        { name: "Elite", deposit: "$5.000", margin: "30%", perks: ["Có chuyên gia triển khai hỗ trợ", "Bộ tài liệu bán hàng độc quyền"] },
        { name: "Master", deposit: "$15.000", margin: "40%", perks: ["Nhận lead trực tiếp theo khu vực", "Hỗ trợ webinar đồng thương hiệu"] },
        { name: "Grandmaster", deposit: "$40.000", margin: "50%", perks: ["Quản lý tài khoản riêng", "Quyền phát triển mạng lưới BD cấp dưới"] },
        { name: "Legendary", deposit: "$80.000", margin: "60%", perks: ["Automation API riêng", "Phân phối bản on-premises tuỳ chỉnh", "Một ghế trong ban điều hành NLB"] },
      ],
      bd: {
        caption: "Bậc hoa hồng BD",
        head: ["Hạng", "Ký quỹ", "Hoa hồng", "Chỉ tiêu", "Chiết khấu license"],
        rows: [
          ["Hunter", "$2.000", "18%", "$4.000 / 6 tháng", "15%"],
          ["Closer", "$5.000", "20%", "$12.000 / 6 tháng", "20%"],
          ["Commander", "$15.000", "22%", "$20.000 / 6 tháng", "25%"],
          ["Warlord", "$30.000", "25%", "$40.000 / 12 tháng", "30%"],
        ],
        note: "BD Partner bắt đầu từ hạng Hunter, sau khi ký quỹ $2.000 và được một Solution Partner duyệt. Doanh thu BD tính theo giới thiệu, trừ khi sau này bạn đủ điều kiện lên Solution Partner.",
      },
      source: "Các hạng và mức chia sẻ theo chương trình đối tác chung của NextLevelBuilder, giống AgentBrain.",
    },
    benefits: {
      eyebrow: "Quyền lợi",
      title: "Đủ mọi thứ để *triển khai và mở rộng*.",
      items: [
        { icon: "wallet", title: "Giữ trọn doanh thu", body: "Giữ 100% doanh thu triển khai với dự án bạn tự làm, không cần kênh hỗ trợ hằng tuần của NLB." },
        { icon: "handshake", title: "Triển khai có hỗ trợ", body: "Giữ 75% khi dùng kênh hỗ trợ và chia sẻ kiến thức riêng của NLB." },
        { icon: "users", title: "NLB triển khai", body: "Nhận 25% hoa hồng giới thiệu khi đội NLB làm trọn dự án." },
        { icon: "shield-check", title: "Đăng ký deal", body: "Deal đã đăng ký được bảo vệ 90 ngày. Không có chuyện giành khách trong nội bộ." },
        { icon: "graduation-cap", title: "Đào tạo đối tác", body: "Onboarding khi gia nhập, rồi cập nhật kiến thức theo từng bản phát hành." },
        { icon: "git-branch", title: "Nhánh sản phẩm riêng", body: "Solution Partner có hỗ trợ có thể đề xuất nhánh sản phẩm theo thế mạnh thị trường của mình." },
      ],
    },
    steps: {
      eyebrow: "Quy trình",
      title: "Ba bước *đến dự án đầu tiên*.",
      label: "Bước",
      items: [
        { title: "Đăng ký", body: "Kể chúng tôi nghe về doanh nghiệp, khách hàng và hướng hợp tác bạn muốn. Form ở cuối trang này." },
        { title: "Chốt hướng đi", body: "Chúng tôi phản hồi với gợi ý về vai trò, hạng và kế hoạch onboarding, kèm giải đáp thắc mắc." },
        { title: "Onboard và triển khai", body: "Đào tạo, bộ tài liệu bán hàng và đăng ký deal. Rồi đến dự án khách hàng đầu tiên." },
      ],
    },
    faq: {
      eyebrow: "Hỏi đáp",
      title: "Câu hỏi *thường gặp*.",
      items: [
        {
          q: "Solution Partner và BD Partner khác nhau thế nào?",
          a: "Solution Partner là người triển khai: cài đặt dewee, đào tạo khách hàng, bàn giao và hỗ trợ dự án. BD Partner mở cửa và chăm sóc cơ hội dưới một Solution Partner hạng Grandmaster hoặc Legendary, và nhận doanh thu giới thiệu khi dự án chốt.",
        },
        {
          q: "Khoản ký quỹ dùng để làm gì?",
          a: "Mỗi hạng bắt đầu bằng một khoản ký quỹ tối thiểu vào ví đối tác. Hạng càng cao, biên lợi nhuận license càng lớn và quyền lợi càng nhiều, từ bộ tài liệu bán hàng ở hạng Elite đến một ghế trong ban điều hành ở hạng Legendary.",
        },
        {
          q: "Tôi giữ được bao nhiêu doanh thu triển khai?",
          a: "100% khi bạn tự triển khai mà không cần kênh hỗ trợ hằng tuần của NLB, 75% khi dùng hỗ trợ và chia sẻ kiến thức của NLB, và 25% hoa hồng giới thiệu khi NLB làm trọn dự án.",
        },
        {
          q: "Nếu một đối tác khác cũng đang làm việc với khách hàng đó thì sao?",
          a: "Hãy đăng ký deal. Deal đã đăng ký được bảo vệ 90 ngày, nên các đối tác không phải giành khách với nhau.",
        },
        {
          q: "BD Partner có thể lên Solution Partner không?",
          a: "Có. Hướng BD được thiết kế để tiến lên Solution Partner khi bạn đã tự triển khai được dự án.",
        },
        {
          q: "Hiện có những đối tác nào?",
          a: "EGANY là Solution Partner, triển khai trọn gói, đào tạo và hỗ trợ. DIGITOP là Engineering Partner, phát triển module tuỳ chỉnh và hỗ trợ trực.",
        },
      ],
    },
    apply: {
      eyebrow: "Đăng ký",
      title: "Sẵn sàng cùng chúng tôi *đưa AI vào doanh nghiệp*?",
      lede: "Kể chúng tôi nghe về doanh nghiệp của bạn. Chúng tôi sẽ phản hồi với hướng hợp tác phù hợp và kế hoạch onboarding.",
      checklist: {
        title: "Nên có trong đơn",
        items: ["Khách hàng hoặc ngành bạn đang phục vụ", "Những dự án AI agent bạn đã triển khai", "Vai trò và hạng bạn đang nhắm tới", "Thị trường bạn hoạt động"],
      },
      email: "Thích email hơn? Viết cho chúng tôi tại [hi@nextlevelbuilder.io](mailto:hi@nextlevelbuilder.io).",
      fields: [
        { name: "name", label: "Họ và tên", type: "text", required: true, autocomplete: "name" },
        { name: "email", label: "Email công việc", type: "email", required: true, autocomplete: "email", placeholder: "ban@congty.vn" },
        { name: "company", label: "Công ty", type: "text", required: true, autocomplete: "organization", maxlength: 160 },
        { name: "country", label: "Quốc gia", type: "text", required: true, autocomplete: "country-name", maxlength: 80 },
        {
          name: "role",
          label: "Vai trò mong muốn",
          type: "select",
          required: true,
          query: "role",
          options: [
            { value: "", label: "Chọn một hướng" },
            { value: "solution", label: "Solution Partner" },
            { value: "bd", label: "BD Partner" },
            { value: "not-sure", label: "Chưa chắc" },
          ],
        },
        {
          name: "tier",
          label: "Hạng bạn quan tâm",
          type: "select",
          query: "tier",
          value: "not-sure",
          options: [
            { value: "not-sure", label: "Chưa chắc" },
            { value: "elite", label: "Elite · $5.000" },
            { value: "master", label: "Master · $15.000" },
            { value: "grandmaster", label: "Grandmaster · $40.000" },
            { value: "legendary", label: "Legendary · $80.000" },
            { value: "hunter", label: "Hunter (BD) · $2.000" },
            { value: "closer", label: "Closer (BD) · $5.000" },
            { value: "commander", label: "Commander (BD) · $15.000" },
            { value: "warlord", label: "Warlord (BD) · $30.000" },
          ],
        },
        {
          name: "message",
          label: "Giới thiệu về doanh nghiệp của bạn",
          type: "textarea",
          required: true,
          rows: 6,
          placeholder: "Quy mô đội ngũ, ngành bạn phục vụ, các dự án đã làm, và vì sao dewee hợp với danh mục của bạn.",
        },
      ],
      submit: "Gửi đơn đăng ký",
      success: {
        title: "Đã nhận đơn của bạn.",
        body: "Cảm ơn bạn. Đội phụ trách đối tác sẽ đọc kỹ và phản hồi qua email với hướng hợp tác gợi ý và các bước tiếp theo.",
        again: "Gửi đơn khác",
      },
    },
  },
};
