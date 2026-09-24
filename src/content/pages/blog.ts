/**
 * Copy for the blog index, post pages and RSS feeds. Posts themselves are rows in D1
 * (kind = 'post'), written through the admin, the REST API, the CLI or MCP.
 */
import type { Bi } from "~/i18n/config";

export const BLOG = {
  meta: {
    title: { en: "Blog", vi: "Blog" },
    description: {
      en: "Release notes, engineering write-ups and the story behind dewee, the enterprise AI-agent platform from NextLevelBuilder.",
      vi: "Ghi chú phát hành, bài viết kỹ thuật và câu chuyện phía sau dewee, nền tảng AI agent cho doanh nghiệp của NextLevelBuilder.",
    },
  },
  hero: {
    eyebrow: { en: "Blog", vi: "Blog" },
    title: { en: "Notes from the *dewee* notebook", vi: "Ghi chép từ cuốn sổ *dewee*" },
    lede: {
      en: "What we shipped, how we build it and why. Written by the people who run dewee in production.",
      vi: "Chúng tôi đã phát hành gì, xây nó ra sao và vì sao. Viết bởi chính những người vận hành dewee hằng ngày.",
    },
    note: { en: "new pages get added, never torn out", vi: "chỉ thêm trang mới, không xé trang cũ" },
  },
  labels: {
    by: { en: "By", vi: "Tác giả" },
    team: { en: "the dewee team", vi: "đội ngũ dewee" },
    tags: { en: "Tags", vi: "Thẻ" },
    rss: { en: "RSS feed", vi: "RSS" },
    empty: { en: "No posts here yet. Check back soon.", vi: "Chưa có bài viết nào. Bạn quay lại sau nhé." },
    tagged: { en: "Posts tagged", vi: "Bài viết gắn thẻ" },
    clearTag: { en: "Show all posts", vi: "Xem tất cả bài viết" },
    allPosts: { en: "All posts", vi: "Tất cả bài viết" },
    newer: { en: "Newer post", vi: "Bài mới hơn" },
    older: { en: "Older post", vi: "Bài cũ hơn" },
    newerPage: { en: "Newer posts", vi: "Bài mới hơn" },
    olderPage: { en: "Older posts", vi: "Bài cũ hơn" },
    postNav: { en: "More posts", vi: "Bài viết khác" },
    pagination: { en: "Blog pages", vi: "Trang blog" },
    readPost: { en: "Read the post", vi: "Đọc bài" },
    published: { en: "Published", vi: "Đăng ngày" },
  },
  rss: {
    title: { en: "dewee blog", vi: "Blog dewee" },
  },
  cta: {
    title: { en: "Put an agent on the work your team *would rather not do*.", vi: "Giao cho agent phần việc đội ngũ bạn *không muốn làm*." },
    body: {
      en: "Tell us about the workflow. We will show you how dewee runs it, in your chat apps and on your terms.",
      vi: "Kể chúng tôi nghe về quy trình đó. Chúng tôi sẽ cho bạn thấy dewee vận hành nó ra sao, ngay trong ứng dụng chat và theo cách của bạn.",
    },
    primary: { label: { en: "Talk to us", vi: "Trò chuyện với chúng tôi" }, href: "/contact" },
    secondary: { label: { en: "Ask in the chat", vi: "Hỏi qua chat" } },
  },
} satisfies Record<string, Record<string, Bi | Record<string, Bi | string> | string>>;
