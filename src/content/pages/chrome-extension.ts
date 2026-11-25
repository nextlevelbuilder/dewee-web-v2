/**
 * /chrome-extension copy, EN + VI. Every behaviour is verified against
 * nextlevelbuilder/dewee-chrome-ext (AGENTS.md security rules, docs/architecture.md,
 * docs/browser-control-threat-model.md, docs/privacy-policy.md, release 0.2.1). The Store link
 * lives in CHROME_EXTENSION (src/content/site.ts).
 */
import type { Bi } from "~/i18n/config";

type Item = { icon: string; title: string; body: string };

export type ChromeExtensionPage = {
  meta: { title: string; description: string; crumb: string };
  hero: { eyebrow: string; title: string; lede: string; note: string; primary: string; secondary: string };
  features: { eyebrow: string; title: string; lede: string; items: Item[] };
  browser: { eyebrow: string; title: string; lede: string; items: Item[] };
  steps: { eyebrow: string; title: string; lede: string; label: string; items: { title: string; body: string }[] };
  faq: { eyebrow: string; title: string; items: { q: string; a: string }[] };
  cta: { title: string; body: string; primary: string; secondary: string; note: string };
};

export const CHROME_EXTENSION_PAGE: Bi<ChromeExtensionPage> = {
  en: {
    meta: {
      title: "dewee for Chrome: your agents in a side panel",
      description:
        "Chat with your dewee agents in a Chrome side panel, answer their requests safely and let an agent work in tabs you allow. For dewee Cloud or your own server.",
      crumb: "Chrome extension",
    },
    hero: {
      eyebrow: "Chrome extension",
      title: "Your agents, *right next to* your work.",
      lede: "The dewee extension opens a side panel in Chrome where you chat with your agents, Super Agent first. When you allow it, an agent can also work in your own browser tabs while you watch.",
      note: "free, no trackers",
      primary: "Add to Chrome",
      secondary: "How it works",
    },
    features: {
      eyebrow: "In the panel",
      title: "Everything you need, without switching tabs",
      lede: "The panel talks only to the dewee server you connect it to: dewee Cloud or your own Gateway.",
      items: [
        { icon: "messages-square", title: "Chat with every agent", body: "Super Agent is pinned first. Switch agents, pick up past conversations and keep working while a reply streams in." },
        { icon: "key-round", title: "Safe credential requests", body: "When an agent needs a key or password, it sends a form card. What you type goes only to your dewee server, never into the chat." },
        { icon: "sparkles", title: "Ask about a selection", body: "Select text on a page and click Ask dewee. The text arrives as a draft you can edit before sending. Off by default." },
        { icon: "server", title: "Cloud or self-hosted", body: "Sign in to dewee Cloud, or connect your own Gateway with a personal API key. Keep several profiles and switch between them." },
        { icon: "languages", title: "English and Vietnamese", body: "The panel follows your language and light or dark theme." },
        { icon: "eye-off", title: "No trackers", body: "No analytics, telemetry or ads. The panel never reads the page you are on or your other tabs unless you turn on a feature that needs it." },
      ],
    },
    browser: {
      eyebrow: "Connected browser",
      title: "Let an agent use your browser, *on your terms*",
      lede: "Turn on Connected browser and an agent can open and work in tabs of your own Chrome, signed in as you. It is off by default, and you stay in control the whole time.",
      items: [
        { icon: "shield-check", title: "Only the sites you allow", body: "You grant each agent exact sites. Chrome asks for access one site at a time, never all sites." },
        { icon: "app-window", title: "Or share one tab", body: "Click Let the agent use this tab to share just that tab. The share ends when you stop, close the tab, leave the site or after an hour." },
        { icon: "eye", title: "Always visible", body: "Tabs the agent opens sit in a Dewee AI tab group, and every controlled tab shows a glowing frame with a Stop button." },
        { icon: "circle-x", title: "Pause or stop anytime", body: "Pause, Stop and Revoke work instantly, from the panel or right on the page." },
        { icon: "lock", title: "Secrets stay yours", body: "Password, payment and one-time-code fields are never read or typed, and page content is never stored." },
      ],
    },
    steps: {
      eyebrow: "Get started",
      title: "Up and running in a minute",
      lede: "You need a dewee Cloud account or your own dewee server.",
      label: "Step",
      items: [
        { title: "Add the extension", body: "Install dewee from the Chrome Web Store and pin it to the toolbar." },
        { title: "Connect", body: "Open the side panel and sign in to dewee Cloud, or enter your Gateway address and a personal API key." },
        { title: "Chat", body: "Pick an agent and start talking. Super Agent is ready first." },
        { title: "Optional: Connected browser", body: "Turn it on in the panel and allow the sites an agent may work on." },
      ],
    },
    faq: {
      eyebrow: "FAQ",
      title: "Questions",
      items: [
        { q: "Is the extension free?", a: "Yes. It is a client for your dewee account or server; your dewee plan stays the same." },
        { q: "Can the agent see my other tabs?", a: "No. An agent can act only in tabs it opened on sites you allowed, or the one tab you shared, and only until you stop or the grant ends." },
        { q: "Which browsers are supported?", a: "Google Chrome and other Chromium browsers that support side panels." },
        { q: "What if I use dewee on several computers?", a: "Each Chrome install is its own device. You see and revoke them in dewee, and an agent works only in a browser you connected." },
      ],
    },
    cta: {
      title: "Bring dewee into Chrome",
      body: "Install the extension, connect your account and chat with your agents next to your work.",
      primary: "Add to Chrome",
      secondary: "Ask a question",
      note: "Read how the extension handles data in our privacy policy.",
    },
  },
  vi: {
    meta: {
      title: "dewee cho Chrome: agent của bạn trong khung bên",
      description:
        "Trò chuyện với agent dewee trong khung bên Chrome, trả lời yêu cầu an toàn và cho agent làm việc trên tab bạn cho phép. Dùng với dewee Cloud hoặc máy chủ riêng.",
      crumb: "Tiện ích Chrome",
    },
    hero: {
      eyebrow: "Tiện ích Chrome",
      title: "Agent của bạn, *ngay cạnh* công việc.",
      lede: "Tiện ích dewee mở một khung bên trong Chrome để bạn trò chuyện với các agent, Super Agent đứng đầu. Khi bạn cho phép, agent còn làm việc được trên chính các tab của bạn trong lúc bạn theo dõi.",
      note: "miễn phí, không theo dõi",
      primary: "Thêm vào Chrome",
      secondary: "Cách hoạt động",
    },
    features: {
      eyebrow: "Trong khung bên",
      title: "Đủ mọi thứ, không cần chuyển tab",
      lede: "Khung bên chỉ nói chuyện với máy chủ dewee bạn kết nối: dewee Cloud hoặc Gateway của riêng bạn.",
      items: [
        { icon: "messages-square", title: "Trò chuyện với mọi agent", body: "Super Agent được ghim đầu tiên. Đổi agent, mở lại cuộc trò chuyện cũ và làm việc tiếp trong lúc câu trả lời đang tới." },
        { icon: "key-round", title: "Yêu cầu thông tin đăng nhập an toàn", body: "Khi agent cần khoá hay mật khẩu, nó gửi một thẻ biểu mẫu. Những gì bạn nhập chỉ đi tới máy chủ dewee của bạn, không bao giờ vào khung chat." },
        { icon: "sparkles", title: "Hỏi về đoạn đã chọn", body: "Chọn đoạn văn trên trang rồi bấm Hỏi dewee. Đoạn văn hiện thành bản nháp để bạn sửa trước khi gửi. Mặc định tắt." },
        { icon: "server", title: "Cloud hoặc tự cài", body: "Đăng nhập dewee Cloud, hoặc kết nối Gateway của bạn bằng API key cá nhân. Lưu nhiều hồ sơ và chuyển qua lại." },
        { icon: "languages", title: "Tiếng Việt và tiếng Anh", body: "Khung bên theo ngôn ngữ và giao diện sáng hoặc tối bạn chọn." },
        { icon: "eye-off", title: "Không theo dõi", body: "Không có phân tích, đo lường hay quảng cáo. Khung bên không đọc trang bạn đang xem hay các tab khác, trừ khi bạn bật tính năng cần đến." },
      ],
    },
    browser: {
      eyebrow: "Trình duyệt kết nối",
      title: "Cho agent dùng trình duyệt của bạn, *theo cách của bạn*",
      lede: "Bật Trình duyệt kết nối, agent có thể mở và làm việc trên các tab Chrome của chính bạn, với tài khoản bạn đã đăng nhập. Mặc định tắt, và bạn luôn nắm quyền.",
      items: [
        { icon: "shield-check", title: "Chỉ những trang bạn cho phép", body: "Bạn cấp cho từng agent đúng những trang cụ thể. Chrome hỏi quyền từng trang một, không bao giờ xin mọi trang." },
        { icon: "app-window", title: "Hoặc chia sẻ một tab", body: "Bấm Cho agent dùng tab này để chia sẻ đúng tab đó. Việc chia sẻ kết thúc khi bạn dừng, đóng tab, rời trang hoặc sau một giờ." },
        { icon: "eye", title: "Luôn nhìn thấy", body: "Tab do agent mở nằm trong nhóm tab Dewee AI, và tab nào đang bị điều khiển cũng có viền phát sáng kèm nút Dừng." },
        { icon: "circle-x", title: "Tạm dừng hoặc dừng bất cứ lúc nào", body: "Tạm dừng, Dừng và Thu hồi có tác dụng ngay, từ khung bên hoặc ngay trên trang." },
        { icon: "lock", title: "Bí mật vẫn là của bạn", body: "Ô mật khẩu, thanh toán và mã dùng một lần không bao giờ bị đọc hay gõ, và nội dung trang không bao giờ được lưu lại." },
      ],
    },
    steps: {
      eyebrow: "Bắt đầu",
      title: "Chạy được trong một phút",
      lede: "Bạn cần một tài khoản dewee Cloud hoặc máy chủ dewee của riêng bạn.",
      label: "Bước",
      items: [
        { title: "Thêm tiện ích", body: "Cài dewee từ Chrome Web Store và ghim lên thanh công cụ." },
        { title: "Kết nối", body: "Mở khung bên và đăng nhập dewee Cloud, hoặc nhập địa chỉ Gateway và API key cá nhân." },
        { title: "Trò chuyện", body: "Chọn một agent và bắt đầu. Super Agent sẵn sàng đầu tiên." },
        { title: "Tuỳ chọn: Trình duyệt kết nối", body: "Bật trong khung bên và cho phép những trang agent được làm việc." },
      ],
    },
    faq: {
      eyebrow: "Hỏi đáp",
      title: "Câu hỏi thường gặp",
      items: [
        { q: "Tiện ích có miễn phí không?", a: "Có. Đây là ứng dụng kết nối tới tài khoản hoặc máy chủ dewee của bạn; gói dewee của bạn giữ nguyên." },
        { q: "Agent có thấy các tab khác của tôi không?", a: "Không. Agent chỉ thao tác được trên tab nó tự mở ở trang bạn cho phép, hoặc đúng tab bạn chia sẻ, và chỉ tới khi bạn dừng hoặc quyền hết hạn." },
        { q: "Hỗ trợ trình duyệt nào?", a: "Google Chrome và các trình duyệt Chromium khác có hỗ trợ khung bên." },
        { q: "Nếu tôi dùng dewee trên nhiều máy thì sao?", a: "Mỗi bản Chrome là một thiết bị riêng. Bạn xem và thu hồi chúng trong dewee, và agent chỉ làm việc trên trình duyệt bạn đã kết nối." },
      ],
    },
    cta: {
      title: "Đưa dewee vào Chrome",
      body: "Cài tiện ích, kết nối tài khoản và trò chuyện với agent ngay cạnh công việc của bạn.",
      primary: "Thêm vào Chrome",
      secondary: "Đặt câu hỏi",
      note: "Xem cách tiện ích xử lý dữ liệu trong chính sách quyền riêng tư.",
    },
  },
};
