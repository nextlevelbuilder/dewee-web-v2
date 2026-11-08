/**
 * /cookies: Cookie Policy. The storage list mirrors the code: `dewee.theme` (ThemeToggle and the
 * no-flash script in BaseLayout), `dewee.cookies` (CookieBadge), `dewee.chat.sid` (chat widget,
 * set only when the chat opens), `__Host-dewee_voter` (blog polls, quizzes and surveys; set only when
 * a reader answers, stored server-side only as a per-post HMAC) and the admin sign-in session cookie. The admin cookie's name and
 * lifetime, and whether Cloudflare's bot cookies are switched on, are open questions (see report).
 * Google Tag Manager and PostHog load only after the visitor presses "Accept".
 * The "app" section covers the dewee app's own consent cookie `dewee_analytics` (set by
 * app.dewee.sh, not by this site), which can reuse the PostHog id from this site.
 */
import type { Bi } from "~/i18n/config";
import type { LegalDoc } from "./types";
import { LEGAL_EMAIL } from "./legal-ui";

const mail = `[${LEGAL_EMAIL}](mailto:${LEGAL_EMAIL})`;

export const COOKIES: Bi<LegalDoc> = {
  en: {
    meta: {
      title: "Cookie Policy",
      description: "dewee.sh keeps essential browser storage for your theme, chat and sign-in, and sets Google analytics cookies only after you press Accept on our notice.",
      crumb: "Cookies",
    },
    hero: {
      eyebrow: "Legal · Cookies",
      title: "Only the *crumbs* we need.",
      lede: "This site remembers a handful of small things so it works the way you left it. Analytics cookies are set only if you say yes, and nothing follows you around the web.",
    },
    sections: [
      {
        id: "summary",
        title: "What we use",
        short: "Essential storage always; Google analytics cookies only after you press “Accept”.",
        body: [
          "This website stores a few small items in your browser that are strictly necessary for something you asked for, such as keeping your theme or reconnecting you to a chat. We also use Google Tag Manager and PostHog to understand which pages help people. Neither loads or measures your visit until you press “Accept”. The fonts are served from our own domain.",
          "Most items live in your browser’s local storage rather than in cookies. Local storage stays on your device and is not sent with every request; the chat ID is sent only when the chat connects.",
        ],
      },
      {
        id: "list",
        title: "The full list",
        short: "A handful of items, and most appear only after you use the feature they belong to.",
        body: [
          {
            table: {
              head: ["Name", "Type", "What it does", "How long"],
              rows: [
                ["`dewee.theme`", "Local storage", "Remembers the theme you picked (light, dark or system). Set only when you change it", "Until you clear it"],
                ["`dewee.cookies`", "Local storage", "Remembers your answer on the cookie notice (“Accept” or “Essential only”)", "Until you clear it"],
                ["`dewee.chat.sid`", "Local storage", "A random ID that reconnects you to your chat conversation. Set only when you open the chat", "Until you clear it"],
                ["`__Host-dewee_voter`", "Cookie", "A random ID that stops the same browser answering a blog poll, quiz or survey twice. Set only when you answer; we store only a one-way hash of it, never your IP address", "1 year"],
                ["Admin session", "Cookie", "Keeps a signed-in administrator signed in. Set only for our own team, never for visitors", "Until sign-out or the session expires"],
                ["Cloudflare security cookies, such as `__cf_bm`", "Cookie", "May be set by Cloudflare, which serves this site, to tell people from bots and protect the site from attacks", "Short-lived, set by Cloudflare"],
                ["Google Analytics, such as `_ga` and `_ga_*`", "Cookie", "Counts visits and pages anonymously so we know what to improve. Set only after you press “Accept”", "Up to 2 years"],
                ["PostHog, `ph_<project key>_posthog`", "Cookie", "A random anonymous ID that PostHog uses to count visits and clicks. Set only after you press “Accept”. The dewee app may read it to reuse the same ID (see below)", "1 year"],
              ],
            },
          },
        ],
      },
      {
        id: "app",
        title: "In the dewee app",
        short: "The app remembers your analytics choice and sends no analytics events to PostHog until you allow them.",
        body: [
          "The dewee app at app.dewee.sh asks you once whether it may measure how new accounts get from signup to their first team action, with “Essential only” or “Allow analytics”. It sends no analytics events to PostHog until you allow them. Before you answer, it may hold a pending signup in a short-lived cookie and record setup milestones on its server; some can be sent later if you opt in. Our [Privacy Policy](/privacy#app-analytics) explains what is sent. Self-hosted installs of dewee never send these events.",
          {
            table: {
              head: ["Name", "Type", "What it does", "How long"],
              rows: [
                ["`dewee_analytics`", "Cookie, set by app.dewee.sh", "Remembers your answer: `granted.` followed by a random anonymous ID, or `denied`. Clear it and the app asks again", "About 6 months (182 days)"],
                ["`dewee_pending_signup`", "Cookie, set by app.dewee.sh", "Before you answer, temporarily holds the sign-in method and account creation time so a signup can be sent if you later allow analytics. Cleared when you answer", "Up to 1 day"],
                ["PostHog, `ph_<project key>_posthog`", "Cookie, set by this website", "If you accepted cookies here, the app may reuse a valid anonymous ID from this cookie when you choose “Allow analytics”; otherwise it creates a new one", "1 year"],
              ],
            },
          },
        ],
      },
      {
        id: "not-used",
        title: "What we don’t use",
        short: "No ads, no analytics without your yes, no social pixels, no fingerprinting.",
        body: [
          {
            list: [
              "No advertising or retargeting cookies.",
              "No analytics cookies unless you accept them, and no heatmaps or session recording.",
              "No social media pixels or tracking embeds.",
              "No fingerprinting or cross-site tracking of any kind.",
              "No font services: our fonts are self-hosted, so your IP address is not sent to a font provider.",
            ],
          },
        ],
      },
      {
        id: "control",
        title: "Your choices",
        short: "Choose “Essential only” on the notice, or clear storage in your browser. The site still works.",
        body: [
          "Essential items do not need your consent. Analytics cookies do, so they wait for your “Accept”. To change your answer, clear this site’s storage in your browser and the notice will ask again. In the dewee app, open “Account → Product analytics” and turn off “Share setup analytics”, or clear the `dewee_analytics` cookie for app.dewee.sh to make the notice appear again. You can also block cookies in your browser settings at any time.",
          "If you do, the site keeps working, but it will forget your theme, show the cookie notice again and start a new chat conversation. Administrators need the session cookie to sign in.",
        ],
      },
      {
        id: "changes",
        title: "Changes to this policy",
        short: "Anything that is not essential waits for your consent first.",
        body: [
          "If we change what we store, we will update this page and the date at the top. If we ever want to add something that is not strictly necessary, we will ask for your consent before setting it. Questions: " + mail + ".",
        ],
      },
    ],
  },
  vi: {
    meta: {
      title: "Chính sách cookie",
      description: "dewee.sh chỉ lưu dữ liệu thiết yếu cho giao diện, chat và đăng nhập; cookie phân tích của Google chỉ được đặt khi bạn bấm Đồng ý trên thông báo cookie.",
      crumb: "Cookie",
    },
    hero: {
      eyebrow: "Pháp lý · Cookie",
      title: "Chỉ giữ *những gì cần*.",
      lede: "Website này ghi nhớ vài điều nhỏ để hoạt động đúng như lúc bạn rời đi. Cookie phân tích chỉ được đặt khi bạn đồng ý, và không có gì bám theo bạn khắp nơi trên mạng.",
    },
    sections: [
      {
        id: "summary",
        title: "Chúng tôi dùng những gì",
        short: "Lưu trữ thiết yếu luôn bật; cookie phân tích của Google chỉ bật khi bạn bấm “Đồng ý”.",
        body: [
          "Website này lưu vài mục nhỏ trên trình duyệt của bạn, đều thật sự cần thiết cho một việc bạn yêu cầu, như ghi nhớ giao diện sáng tối hay nối lại cuộc chat. Chúng tôi cũng dùng Google Tag Manager và PostHog để biết trang nào hữu ích. Cả hai chỉ được tải và đo lường lượt truy cập sau khi bạn bấm “Đồng ý”. Phông chữ được tải từ chính tên miền của chúng tôi.",
          "Phần lớn các mục nằm trong local storage của trình duyệt, không phải cookie. Local storage nằm trên thiết bị của bạn và không bị gửi kèm mỗi lần tải trang; riêng mã chat chỉ được gửi khi khung chat kết nối.",
        ],
      },
      {
        id: "list",
        title: "Danh sách đầy đủ",
        short: "Chỉ vài mục, và hầu hết chỉ xuất hiện khi bạn dùng tới tính năng tương ứng.",
        body: [
          {
            table: {
              head: ["Tên", "Loại", "Công dụng", "Thời hạn"],
              rows: [
                ["`dewee.theme`", "Local storage", "Ghi nhớ giao diện bạn chọn (sáng, tối hay theo máy). Chỉ lưu khi bạn đổi giao diện", "Đến khi bạn xoá"],
                ["`dewee.cookies`", "Local storage", "Ghi nhớ lựa chọn của bạn trên thông báo cookie (“Đồng ý” hoặc “Chỉ thiết yếu”)", "Đến khi bạn xoá"],
                ["`dewee.chat.sid`", "Local storage", "Một mã ngẫu nhiên để nối lại cuộc chat của bạn. Chỉ tạo khi bạn mở khung chat", "Đến khi bạn xoá"],
                ["`__Host-dewee_voter`", "Cookie", "Một mã ngẫu nhiên để cùng một trình duyệt không trả lời một bình chọn, câu đố hay khảo sát trên blog hai lần. Chỉ đặt khi bạn trả lời; chúng tôi chỉ lưu bản băm một chiều của mã này, không bao giờ lưu địa chỉ IP của bạn", "1 năm"],
                ["Phiên quản trị", "Cookie", "Giữ trạng thái đăng nhập cho quản trị viên. Chỉ dành cho đội ngũ của chúng tôi, không bao giờ đặt cho khách truy cập", "Đến khi đăng xuất hoặc phiên hết hạn"],
                ["Cookie bảo mật của Cloudflare, ví dụ `__cf_bm`", "Cookie", "Có thể do Cloudflare, đơn vị vận hành website, đặt ra để phân biệt người thật với bot và chống tấn công", "Ngắn hạn, do Cloudflare quy định"],
                ["Google Analytics, ví dụ `_ga` và `_ga_*`", "Cookie", "Đếm lượt truy cập và trang xem ẩn danh để chúng tôi biết cần cải thiện gì. Chỉ đặt sau khi bạn bấm “Đồng ý”", "Tối đa 2 năm"],
                ["PostHog, `ph_<project key>_posthog`", "Cookie", "Một mã ẩn danh ngẫu nhiên PostHog dùng để đếm lượt truy cập và lượt bấm. Chỉ đặt sau khi bạn bấm “Đồng ý”. Ứng dụng dewee có thể đọc mã này để dùng lại cùng một mã (xem bên dưới)", "1 năm"],
              ],
            },
          },
        ],
      },
      {
        id: "app",
        title: "Trong ứng dụng dewee",
        short: "Ứng dụng ghi nhớ lựa chọn phân tích và không gửi sự kiện phân tích tới PostHog cho tới khi bạn cho phép.",
        body: [
          "Ứng dụng dewee tại app.dewee.sh hỏi bạn một lần xem có được đo lường cách tài khoản mới đi từ lúc đăng ký tới thao tác nhóm đầu tiên hay không, với hai lựa chọn “Chỉ thiết yếu” hoặc “Cho phép phân tích”. Ứng dụng không gửi sự kiện phân tích tới PostHog cho tới khi bạn cho phép. Trước khi bạn trả lời, ứng dụng có thể giữ thông tin đăng ký đang chờ trong cookie ngắn hạn và ghi nhận các mốc thiết lập trên máy chủ; một số mốc có thể được gửi nếu sau đó bạn đồng ý. [Chính sách quyền riêng tư](/vi/privacy#app-analytics) giải thích dữ liệu được gửi. Bản dewee tự cài đặt không bao giờ gửi các sự kiện này.",
          {
            table: {
              head: ["Tên", "Loại", "Công dụng", "Thời hạn"],
              rows: [
                ["`dewee_analytics`", "Cookie, do app.dewee.sh đặt", "Ghi nhớ lựa chọn của bạn: `granted.` kèm một mã ẩn danh ngẫu nhiên, hoặc `denied`. Xoá cookie này thì ứng dụng sẽ hỏi lại", "Khoảng 6 tháng (182 ngày)"],
                ["`dewee_pending_signup`", "Cookie, do app.dewee.sh đặt", "Trước khi bạn trả lời, tạm giữ cách đăng nhập và thời điểm tạo tài khoản để gửi lượt đăng ký nếu sau đó bạn cho phép phân tích. Cookie được xóa khi bạn trả lời", "Tối đa 1 ngày"],
                ["PostHog, `ph_<project key>_posthog`", "Cookie, do website này đặt", "Nếu bạn đã đồng ý cookie ở đây, ứng dụng có thể dùng lại mã ẩn danh hợp lệ trong cookie khi bạn chọn “Cho phép phân tích”; nếu không, ứng dụng tạo mã mới", "1 năm"],
              ],
            },
          },
        ],
      },
      {
        id: "not-used",
        title: "Những gì chúng tôi không dùng",
        short: "Không quảng cáo, không phân tích khi chưa được đồng ý, không pixel mạng xã hội, không định danh thiết bị.",
        body: [
          {
            list: [
              "Không cookie quảng cáo hay tiếp thị lại.",
              "Không cookie phân tích khi bạn chưa đồng ý, không bản đồ nhiệt hay ghi lại phiên truy cập.",
              "Không pixel mạng xã hội hay nội dung nhúng có theo dõi.",
              "Không định danh thiết bị (fingerprinting) hay theo dõi xuyên trang dưới bất kỳ hình thức nào.",
              "Không dùng dịch vụ phông chữ bên ngoài: phông chữ được lưu trên máy chủ của chúng tôi, nên địa chỉ IP của bạn không bị gửi đi đâu.",
            ],
          },
        ],
      },
      {
        id: "control",
        title: "Lựa chọn của bạn",
        short: "Chọn “Chỉ thiết yếu” trên thông báo, hoặc xoá dữ liệu trong trình duyệt. Website vẫn chạy bình thường.",
        body: [
          "Các mục thiết yếu không cần bạn đồng ý. Cookie phân tích thì cần, nên chúng chờ bạn bấm “Đồng ý”. Muốn đổi lựa chọn, bạn xoá dữ liệu của website này trong trình duyệt, thông báo sẽ hỏi lại. Trong ứng dụng dewee, mở “Tài khoản → Phân tích sản phẩm” và tắt “Chia sẻ phân tích thiết lập”, hoặc xoá cookie `dewee_analytics` của app.dewee.sh để ứng dụng hỏi lại. Bạn cũng có thể chặn cookie trong phần cài đặt trình duyệt bất cứ lúc nào.",
          "Khi đó website vẫn hoạt động, nhưng sẽ quên giao diện bạn chọn, hiện lại thông báo cookie và bắt đầu một cuộc chat mới. Quản trị viên cần cookie phiên để đăng nhập.",
        ],
      },
      {
        id: "changes",
        title: "Thay đổi chính sách",
        short: "Mọi thứ không thiết yếu đều chờ bạn đồng ý trước.",
        body: [
          "Khi thay đổi những gì được lưu, chúng tôi sẽ cập nhật trang này và ngày ở đầu trang. Nếu muốn thêm bất cứ thứ gì không thật sự cần thiết, chúng tôi sẽ xin sự đồng ý của bạn trước khi lưu. Mọi câu hỏi, xin gửi về " + mail + ".",
        ],
      },
    ],
  },
};
