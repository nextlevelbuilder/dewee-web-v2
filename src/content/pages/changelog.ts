/**
 * /changelog copy. Release data comes from D1 `releases` (seeded from the dewee GitHub releases,
 * refreshed hourly); counts in the margin note are computed from that data, never hard-coded.
 * `{placeholders}` are filled by the page.
 */
import type { Bi } from "~/i18n/config";

type ChannelCopy = { label: string; hint: string };
type Plural = { one: string; other: string };

type ChangelogPage = {
  meta: { title: string; description: string; crumb: string };
  hero: { eyebrow: string; title: string; lede: string; note: string; feed: string };
  channels: { label: string; stable: ChannelCopy; beta: ChannelCopy; all: ChannelCopy };
  release: {
    group: string;
    count: Plural;
    stable: string;
    beta: string;
    latest: string;
    permalink: string;
    betas: Plural;
    inBeta: string;
    noNotes: string;
    published: string;
    timeZone: string;
    notesLanguage?: string;
  };
  pager: { label: string; newer: string; older: string };
  empty: { title: string; body: string; action: string };
  cta: { title: string; body: string; primary: string; secondary: string; note: string };
  feed: { title: string; subtitle: string };
};

export const CHANGELOG: Bi<ChangelogPage> = {
  en: {
    meta: {
      crumb: "Changelog",
      title: "Changelog: every dewee release",
      description:
        "Every dewee release, newest first: stable versions and betas, with the notes published alongside each one. Filter by channel or follow the Atom feed.",
    },
    hero: {
      eyebrow: "Changelog",
      title: "Every release, *written down*.",
      lede: "Stable releases are the ones we recommend running. Betas are what we are testing right now. Pick a channel, or follow along with the feed.",
      note: "{stable} stable releases and {beta} betas so far",
      feed: "Atom feed",
    },
    channels: {
      label: "Release channel",
      stable: { label: "Stable", hint: "Recommended for production." },
      beta: { label: "Beta", hint: "Early builds for testing. They may change." },
      all: { label: "All", hint: "Stable releases, with their betas folded underneath." },
    },
    release: {
      group: "Version {minor}",
      count: { one: "1 release", other: "{n} releases" },
      stable: "Stable",
      beta: "Beta",
      latest: "Latest",
      permalink: "Link to {tag}",
      betas: { one: "1 beta release of v{minor}", other: "{n} beta releases of v{minor}" },
      inBeta: "In beta. No stable release of {minor} yet.",
      noNotes: "No notes were published with this release.",
      published: "Published",
      timeZone: "Times are Vietnam time (GMT+7).",
    },
    pager: { label: "Changelog pages", newer: "Newer releases", older: "Older releases" },
    empty: {
      title: "The notebook is *still blank*.",
      body: "There are no releases on this channel yet. Check back soon, or look at every channel.",
      action: "Show all releases",
    },
    cta: {
      title: "Questions about *a release*?",
      body: "Ask about an upgrade, a fix you are waiting for, or what a change means for your team.",
      primary: "Contact us",
      secondary: "Chat with dewee",
      note: "or write to hi@nextlevelbuilder.io",
    },
    feed: { title: "dewee stable releases", subtitle: "Stable releases of dewee, the enterprise AI agent platform, newest first." },
  },
  vi: {
    meta: {
      crumb: "Nhật ký thay đổi",
      title: "Nhật ký thay đổi: mọi bản phát hành của dewee",
      description:
        "Mọi bản phát hành của dewee, mới nhất trước: bản stable và bản beta, kèm ghi chú được công bố cùng từng bản. Lọc theo kênh hoặc theo dõi qua nguồn cấp Atom.",
    },
    hero: {
      eyebrow: "Nhật ký thay đổi",
      title: "Mỗi bản phát hành, *đều được ghi lại*.",
      lede: "Bản stable là bản chúng tôi khuyên dùng. Bản beta là những gì đang được thử nghiệm. Chọn một kênh, hoặc theo dõi qua nguồn cấp Atom.",
      note: "đến nay: {stable} bản stable, {beta} bản beta",
      feed: "Nguồn cấp Atom",
    },
    channels: {
      label: "Kênh phát hành",
      stable: { label: "Stable", hint: "Khuyên dùng cho môi trường production." },
      beta: { label: "Beta", hint: "Bản dựng sớm để thử nghiệm, có thể còn thay đổi." },
      all: { label: "Tất cả", hint: "Các bản stable, kèm những bản beta đi trước được gộp bên dưới." },
    },
    release: {
      group: "Phiên bản {minor}",
      count: { one: "1 bản phát hành", other: "{n} bản phát hành" },
      stable: "Stable",
      beta: "Beta",
      latest: "Mới nhất",
      permalink: "Liên kết tới {tag}",
      betas: { one: "1 bản beta của v{minor}", other: "{n} bản beta của v{minor}" },
      inBeta: "Đang beta. Phiên bản {minor} chưa có bản stable.",
      noNotes: "Bản phát hành này không kèm ghi chú.",
      published: "Phát hành",
      timeZone: "Thời gian theo giờ Việt Nam (GMT+7).",
      notesLanguage: "Ghi chú phát hành được giữ nguyên bằng tiếng Anh, đúng như khi công bố.",
    },
    pager: { label: "Phân trang nhật ký", newer: "Các bản mới hơn", older: "Các bản cũ hơn" },
    empty: {
      title: "Cuốn vở *vẫn còn trắng*.",
      body: "Kênh này chưa có bản phát hành nào. Hãy quay lại sau, hoặc xem tất cả các kênh.",
      action: "Xem tất cả bản phát hành",
    },
    cta: {
      title: "Thắc mắc về *một bản phát hành*?",
      body: "Hỏi về việc nâng cấp, một bản sửa lỗi bạn đang chờ, hay một thay đổi ảnh hưởng thế nào đến đội của bạn.",
      primary: "Liên hệ",
      secondary: "Trò chuyện với dewee",
      note: "hoặc viết thư tới hi@nextlevelbuilder.io",
    },
    feed: { title: "Các bản stable của dewee", subtitle: "Các bản stable của dewee, nền tảng AI agent cho doanh nghiệp, mới nhất trước." },
  },
};

/** Pick the singular or plural form, then fill it. */
export function plural(forms: Plural, n: number, values: Record<string, string | number> = {}): string {
  return fill(n === 1 ? forms.one : forms.other, { n, ...values });
}

/** Fill `{name}` placeholders. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, key: string) => (key in values ? String(values[key]) : m));
}
