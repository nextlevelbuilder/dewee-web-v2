/**
 * /cookies: Cookie Policy. The storage list mirrors the code: `dewee.theme` (ThemeToggle and the
 * no-flash script in BaseLayout), `dewee.cookies` (CookieBadge), `dewee.chat.sid` (chat widget,
 * set only when the chat opens) and the admin sign-in session cookie. The admin cookie's name and
 * lifetime, and whether Cloudflare's bot cookies are switched on, are open questions (see report).
 */
import type { Bi } from "~/i18n/config";
import type { LegalDoc } from "./types";
import { LEGAL_EMAIL } from "./legal-ui";

const mail = `[${LEGAL_EMAIL}](mailto:${LEGAL_EMAIL})`;

export const COOKIES: Bi<LegalDoc> = {
  en: {
    meta: {
      title: "Cookie Policy",
      description: "dewee.sh uses only essential browser storage: your theme, the cookie notice, your chat ID and an admin sign-in cookie. No ads, no analytics and no trackers.",
      crumb: "Cookies",
    },
    hero: {
      eyebrow: "Legal · Cookies",
      title: "Only the *crumbs* we need.",
      lede: "This site remembers a handful of small things so it works the way you left it. There is no advertising, no analytics and nothing that follows you around the web.",
    },
    sections: [
      {
        id: "summary",
        title: "What we use",
        short: "Only essential storage. That is why our cookie notice has a single “Got it” button and no settings.",
        body: [
          "This website stores a few small items in your browser. All of them are strictly necessary for something you asked for, such as keeping your theme or reconnecting you to a chat. We do not use advertising or analytics cookies, and the fonts are served from our own domain.",
          "Most items live in your browser’s local storage rather than in cookies. Local storage stays on your device and is not sent with every request; the chat ID is sent only when the chat connects.",
        ],
      },
      {
        id: "list",
        title: "The full list",
        short: "Five items at most, and most appear only after you use the feature they belong to.",
        body: [
          {
            table: {
              head: ["Name", "Type", "What it does", "How long"],
              rows: [
                ["`dewee.theme`", "Local storage", "Remembers the theme you picked (light, dark or system). Set only when you change it", "Until you clear it"],
                ["`dewee.cookies`", "Local storage", "Remembers that you pressed “Got it” on the cookie notice", "Until you clear it"],
                ["`dewee.chat.sid`", "Local storage", "A random ID that reconnects you to your chat conversation. Set only when you open the chat", "Until you clear it"],
                ["Admin session", "Cookie", "Keeps a signed-in administrator signed in. Set only for our own team, never for visitors", "Until sign-out or the session expires"],
                ["Cloudflare security cookies, such as `__cf_bm`", "Cookie", "May be set by Cloudflare, which serves this site, to tell people from bots and protect the site from attacks", "Short-lived, set by Cloudflare"],
              ],
            },
          },
        ],
      },
      {
        id: "not-used",
        title: "What we don’t use",
        short: "No advertising, no analytics, no social pixels, no fingerprinting.",
        body: [
          {
            list: [
              "No advertising or retargeting cookies.",
              "No third-party analytics, heatmaps or session recording.",
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
        short: "You can clear or block all of it in your browser. The site still works; it just forgets your preferences.",
        body: [
          "Because everything listed is strictly necessary for a feature you use, we do not need to ask for consent first. You can still clear or block browser storage in your browser settings at any time.",
          "If you do, the site keeps working, but it will forget your theme, show the cookie notice again and start a new chat conversation. Administrators need the session cookie to sign in.",
        ],
      },
      {
        id: "changes",
        title: "Changes to this policy",
        short: "If we ever want to add anything that is not essential, we will ask you first.",
        body: [
          "If we change what we store, we will update this page and the date at the top. If we ever want to add something that is not strictly necessary, we will ask for your consent before setting it. Questions: " + mail + ".",
        ],
      },
    ],
  },
  vi: {
    meta: {
      title: "Chính sách cookie",
      description: "dewee.sh chỉ lưu những gì thiết yếu trên trình duyệt: giao diện, thông báo cookie, mã chat và phiên quản trị. Không quảng cáo, không phân tích, không theo dõi.",
      crumb: "Cookie",
    },
    hero: {
      eyebrow: "Pháp lý · Cookie",
      title: "Chỉ giữ *những gì cần*.",
      lede: "Website này ghi nhớ vài điều nhỏ để hoạt động đúng như lúc bạn rời đi. Không quảng cáo, không phân tích, không có gì bám theo bạn khắp nơi trên mạng.",
    },
    sections: [
      {
        id: "summary",
        title: "Chúng tôi dùng những gì",
        short: "Chỉ lưu trữ thiết yếu. Vì vậy thông báo cookie của chúng tôi chỉ có một nút “Đã hiểu”, không có phần cài đặt.",
        body: [
          "Website này lưu vài mục nhỏ trên trình duyệt của bạn. Tất cả đều thật sự cần thiết cho một việc bạn yêu cầu, như ghi nhớ giao diện sáng tối hay nối lại cuộc chat. Chúng tôi không dùng cookie quảng cáo hay phân tích, và phông chữ được tải từ chính tên miền của chúng tôi.",
          "Phần lớn các mục nằm trong local storage của trình duyệt, không phải cookie. Local storage nằm trên thiết bị của bạn và không bị gửi kèm mỗi lần tải trang; riêng mã chat chỉ được gửi khi khung chat kết nối.",
        ],
      },
      {
        id: "list",
        title: "Danh sách đầy đủ",
        short: "Tối đa năm mục, và hầu hết chỉ xuất hiện khi bạn dùng tới tính năng tương ứng.",
        body: [
          {
            table: {
              head: ["Tên", "Loại", "Công dụng", "Thời hạn"],
              rows: [
                ["`dewee.theme`", "Local storage", "Ghi nhớ giao diện bạn chọn (sáng, tối hay theo máy). Chỉ lưu khi bạn đổi giao diện", "Đến khi bạn xoá"],
                ["`dewee.cookies`", "Local storage", "Ghi nhớ bạn đã bấm “Đã hiểu” trên thông báo cookie", "Đến khi bạn xoá"],
                ["`dewee.chat.sid`", "Local storage", "Một mã ngẫu nhiên để nối lại cuộc chat của bạn. Chỉ tạo khi bạn mở khung chat", "Đến khi bạn xoá"],
                ["Phiên quản trị", "Cookie", "Giữ trạng thái đăng nhập cho quản trị viên. Chỉ dành cho đội ngũ của chúng tôi, không bao giờ đặt cho khách truy cập", "Đến khi đăng xuất hoặc phiên hết hạn"],
                ["Cookie bảo mật của Cloudflare, ví dụ `__cf_bm`", "Cookie", "Có thể do Cloudflare, đơn vị vận hành website, đặt ra để phân biệt người thật với bot và chống tấn công", "Ngắn hạn, do Cloudflare quy định"],
              ],
            },
          },
        ],
      },
      {
        id: "not-used",
        title: "Những gì chúng tôi không dùng",
        short: "Không quảng cáo, không phân tích, không pixel mạng xã hội, không định danh thiết bị.",
        body: [
          {
            list: [
              "Không cookie quảng cáo hay tiếp thị lại.",
              "Không công cụ phân tích của bên thứ ba, bản đồ nhiệt hay ghi lại phiên truy cập.",
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
        short: "Bạn có thể xoá hoặc chặn tất cả trong trình duyệt. Website vẫn chạy, chỉ là quên mất lựa chọn của bạn.",
        body: [
          "Vì mọi mục trong danh sách đều thật sự cần thiết cho tính năng bạn dùng, chúng tôi không cần xin đồng ý trước. Dù vậy, bạn vẫn có thể xoá hoặc chặn dữ liệu lưu trên trình duyệt trong phần cài đặt bất cứ lúc nào.",
          "Khi đó website vẫn hoạt động, nhưng sẽ quên giao diện bạn chọn, hiện lại thông báo cookie và bắt đầu một cuộc chat mới. Quản trị viên cần cookie phiên để đăng nhập.",
        ],
      },
      {
        id: "changes",
        title: "Thay đổi chính sách",
        short: "Nếu có ngày chúng tôi muốn thêm thứ gì không thiết yếu, chúng tôi sẽ hỏi bạn trước.",
        body: [
          "Khi thay đổi những gì được lưu, chúng tôi sẽ cập nhật trang này và ngày ở đầu trang. Nếu muốn thêm bất cứ thứ gì không thật sự cần thiết, chúng tôi sẽ xin sự đồng ý của bạn trước khi lưu. Mọi câu hỏi, xin gửi về " + mail + ".",
        ],
      },
    ],
  },
};
