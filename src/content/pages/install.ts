/**
 * /install copy: installing dewee yourself (Self-install). Commands, the port and the dashboard
 * URL live in SELF_INSTALL (src/content/site.ts); licence and Early Access numbers come from
 * src/content/early-access.ts through the `{url}`, `{price}`, `{discounted}`, `{total}` and
 * `{date}` placeholders, filled by the page. Only the standalone binary (macOS and Linux) and
 * Docker are offered; never a build from source.
 */
import type { Bi } from "~/i18n/config";

export type InstallRouteId = "script" | "docker" | "windows";

type Faq = { q: string; a: string };

export type InstallPage = {
  meta: { title: string; description: string; crumb: string };
  hero: { eyebrow: string; title: string; lede: string; note: string; primary: string; secondary: string };
  choose: {
    eyebrow: string;
    title: string;
    lede: string;
    tabsLabel: string;
    copy: { copy: string; copied: string; failed: string };
    routes: Record<InstallRouteId, { tab: string; title: string; body: string; label: string }>;
  };
  requirements: { title: string; items: { label: string; value: string }[] };
  steps: { eyebrow: string; title: string; lede: string; label: string; items: { title: string; body: string }[] };
  faq: { eyebrow: string; title: string; items: Faq[] };
  cta: { title: string; body: string; primary: string; secondary: string; note: string };
};

export const INSTALL: Bi<InstallPage> = {
  en: {
    meta: {
      title: "Install dewee: standalone binary or Docker",
      description: "Install dewee yourself on macOS, Linux or Windows with one command or Docker, then set it up in the dashboard. Free to install; a licence connects channels.",
      crumb: "Install",
    },
    hero: {
      eyebrow: "Self-install",
      title: "Install dewee on *your own machine*.",
      lede: "One command on macOS or Linux, or Docker anywhere. Then the dashboard walks you through the rest. Installing is free; a licence connects your chat channels.",
      note: "your machine, your data",
      primary: "Choose your platform",
      secondary: "Compare deployment options",
    },
    choose: {
      eyebrow: "Step one",
      title: "Pick how dewee *runs*.",
      lede: "The standalone binary is the shortest path on a Mac or a Linux machine. Docker works everywhere, and it is the only way on Windows.",
      tabsLabel: "Install method",
      copy: { copy: "Copy", copied: "Copied", failed: "Copy failed" },
      routes: {
        script: {
          tab: "macOS / Linux",
          title: "Standalone binary",
          body: "One command installs the dewee binary on macOS or Linux, on Intel, AMD or ARM processors (amd64 and arm64).",
          label: "Terminal",
        },
        docker: {
          tab: "Docker",
          title: "Docker on macOS or Linux",
          body: "Download the compose file, then start dewee in the background.",
          label: "Terminal",
        },
        windows: {
          tab: "Windows",
          title: "Docker Desktop on Windows",
          body: "On Windows, dewee runs in Docker Desktop. Open PowerShell in the folder you want to keep it in, then run:",
          label: "PowerShell",
        },
      },
    },
    requirements: {
      title: "Minimum requirements",
      items: [
        { label: "System", value: "64-bit macOS 13 or later, or Linux with glibc" },
        { label: "Memory", value: "2 GB of RAM" },
        { label: "Docker route", value: "Docker 24 or later (Docker Desktop on Windows)" },
      ],
    },
    steps: {
      eyebrow: "From install to first agent",
      title: "Five steps, *all in your hands*.",
      lede: "Everything after the install happens in your own dashboard. Nothing needs a call with us.",
      label: "Step",
      items: [
        { title: "Install", body: "Run the command for your platform above." },
        { title: "Open the dashboard", body: "Go to {url} in your browser. This is your dewee dashboard, running on your machine." },
        { title: "Onboard", body: "Create the owner account, set up your workspace, add an LLM provider with your own API key and create your first agent. The dashboard guides you through each step." },
        { title: "Get a licence key", body: "Agents, providers and skills work without one. To connect Zalo, Telegram, Discord, Slack and other channels, buy a licence for {price} a year. With Early Access, the first year is {discounted} for the first {total} licences, until {date}." },
        { title: "Paste the key", body: "Paste the licence key into the dashboard to activate it, then connect your first channel." },
      ],
    },
    faq: {
      eyebrow: "Before you install",
      title: "Asked *before the first command*.",
      items: [
        { q: "Is it free?", a: "Installing dewee and using it with agents, LLM providers and skills is free. You pay only for a licence, and only when you want to connect chat channels such as Zalo, Telegram, Discord or Slack. You also pay your AI provider directly for the tokens you use." },
        { q: "What needs a licence?", a: "Connecting chat channels. The owner account, workspace settings, providers, agents and skills all work without one. When you are ready for channels, buy a licence and paste the key into the dashboard." },
        { q: "Can I install dewee in Vietnam?", a: "Yes. Self-install is available in Vietnam, alongside On-Premises." },
        { q: "Can I get help installing?", a: "Self-install does not include setup help. If you would rather we did it, On-Premises is the done-for-you option: we install dewee on your VPS or Mac mini, build workflows with your team and look after it for a year. Ask for a quote on the contact page." },
        { q: "Does it run on Windows?", a: "Yes, through Docker Desktop. The standalone binary is for macOS and Linux only, so on Windows use the PowerShell commands in the Windows tab." },
      ],
    },
    cta: {
      title: "Rather have us *install it*?",
      body: "On-Premises is the done-for-you option: we set dewee up on your VPS or Mac mini, build five workflows with your team and look after it for the first year.",
      primary: "Get an On-Premises quote",
      secondary: "Ask dewee in the chat",
      note: "a real person reads every message",
    },
  },
  vi: {
    meta: {
      title: "Cài đặt dewee: binary độc lập hoặc Docker",
      description: "Tự cài dewee trên macOS, Linux hoặc Windows bằng một lệnh hoặc Docker, rồi thiết lập trong bảng điều khiển. Cài đặt miễn phí; license để kết nối kênh chat.",
      crumb: "Cài đặt",
    },
    hero: {
      eyebrow: "Tự cài đặt",
      title: "Cài dewee lên *máy của bạn*.",
      lede: "Một lệnh trên macOS hoặc Linux, hoặc Docker trên mọi hệ điều hành. Sau đó bảng điều khiển hướng dẫn bạn từng bước. Cài đặt miễn phí; license dùng để kết nối kênh chat.",
      note: "máy của bạn, dữ liệu của bạn",
      primary: "Chọn nền tảng",
      secondary: "So sánh cách triển khai",
    },
    choose: {
      eyebrow: "Bước một",
      title: "Chọn cách dewee *chạy*.",
      lede: "Binary độc lập là đường ngắn nhất trên máy Mac hoặc Linux. Docker chạy được ở mọi nơi, và là cách duy nhất trên Windows.",
      tabsLabel: "Cách cài đặt",
      copy: { copy: "Sao chép", copied: "Đã chép", failed: "Không chép được" },
      routes: {
        script: {
          tab: "macOS / Linux",
          title: "Binary độc lập",
          body: "Một lệnh cài binary dewee trên macOS hoặc Linux, cho cả chip Intel, AMD và ARM (amd64 và arm64).",
          label: "Terminal",
        },
        docker: {
          tab: "Docker",
          title: "Docker trên macOS hoặc Linux",
          body: "Tải file compose về, rồi khởi động dewee chạy nền.",
          label: "Terminal",
        },
        windows: {
          tab: "Windows",
          title: "Docker Desktop trên Windows",
          body: "Trên Windows, dewee chạy trong Docker Desktop. Mở PowerShell tại thư mục bạn muốn đặt dewee, rồi chạy:",
          label: "PowerShell",
        },
      },
    },
    requirements: {
      title: "Cấu hình tối thiểu",
      items: [
        { label: "Hệ điều hành", value: "macOS 13 trở lên hoặc Linux (glibc), bản 64-bit" },
        { label: "Bộ nhớ", value: "2 GB RAM" },
        { label: "Cài bằng Docker", value: "Docker 24 trở lên (Docker Desktop trên Windows)" },
      ],
    },
    steps: {
      eyebrow: "Từ lúc cài đến agent đầu tiên",
      title: "Năm bước, *bạn tự làm được*.",
      lede: "Mọi việc sau khi cài đều diễn ra trong bảng điều khiển của chính bạn, không cần gọi cho chúng tôi.",
      label: "Bước",
      items: [
        { title: "Cài đặt", body: "Chạy lệnh dành cho nền tảng của bạn ở phía trên." },
        { title: "Mở bảng điều khiển", body: "Truy cập {url} trên trình duyệt. Đây là bảng điều khiển dewee, chạy ngay trên máy của bạn." },
        { title: "Thiết lập ban đầu", body: "Tạo tài khoản chủ sở hữu, thiết lập workspace, thêm nhà cung cấp LLM bằng API key của bạn và tạo agent đầu tiên. Bảng điều khiển hướng dẫn bạn từng bước." },
        { title: "Mua license key", body: "Agent, nhà cung cấp và skill đều dùng được khi chưa có license. Để kết nối Zalo, Telegram, Discord, Slack và các kênh khác, bạn cần license {price} mỗi năm. Với Early Access, năm đầu chỉ {discounted} cho {total} license đầu tiên, đến hết ngày {date}." },
        { title: "Dán key", body: "Dán license key vào bảng điều khiển để kích hoạt, rồi kết nối kênh chat đầu tiên." },
      ],
    },
    faq: {
      eyebrow: "Trước khi cài",
      title: "Hỏi trước *lệnh đầu tiên*.",
      items: [
        { q: "Có miễn phí không?", a: "Cài đặt dewee và dùng agent, nhà cung cấp LLM, skill đều miễn phí. Bạn chỉ trả tiền license, và chỉ khi muốn kết nối kênh chat như Zalo, Telegram, Discord hay Slack. Chi phí token thì bạn trả trực tiếp cho nhà cung cấp AI." },
        { q: "Việc gì cần license?", a: "Kết nối kênh chat. Tài khoản chủ sở hữu, cài đặt workspace, nhà cung cấp, agent và skill đều dùng được khi chưa có license. Khi cần kết nối kênh, bạn mua license rồi dán key vào bảng điều khiển." },
        { q: "Tôi có thể tự cài dewee tại Việt Nam không?", a: "Được. Tự cài đặt có tại Việt Nam, song song với On-Premises." },
        { q: "Tôi có được hỗ trợ cài đặt không?", a: "Tự cài đặt không kèm hỗ trợ cài đặt. Nếu bạn muốn chúng tôi làm giúp, hãy chọn On-Premises: chúng tôi cài dewee trên VPS hoặc Mac mini của bạn, dựng quy trình cùng đội ngũ bạn và chăm sóc trong một năm. Bạn có thể nhận báo giá ở trang liên hệ." },
        { q: "dewee có chạy trên Windows không?", a: "Có, qua Docker Desktop. Binary độc lập chỉ dành cho macOS và Linux, nên trên Windows bạn dùng các lệnh PowerShell ở thẻ Windows." },
      ],
    },
    cta: {
      title: "Muốn chúng tôi *cài giúp*?",
      body: "On-Premises là lựa chọn trọn gói: chúng tôi cài dewee trên VPS hoặc Mac mini của bạn, dựng năm quy trình cùng đội ngũ bạn và chăm sóc suốt năm đầu.",
      primary: "Nhận báo giá On-Premises",
      secondary: "Hỏi dewee qua chat",
      note: "chúng tôi đọc từng tin nhắn",
    },
  },
};
