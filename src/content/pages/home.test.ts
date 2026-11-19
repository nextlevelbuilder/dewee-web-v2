/**
 * Homepage copy guards: the positioning the hero must carry, SEO limits (REVIEW.md §3), the same
 * promise in both languages, numbers that come from FACTS rather than stale literals, an honestly
 * labelled work story, and the Vietnamese deployment rule.
 */
import { describe, expect, it } from "vitest";
import { LOCALES } from "~/i18n/config";
import { FACTS } from "~/content/facts";
import { ICONS } from "~/components/ui/icon-paths";
import { useCaseBySlug } from "~/content/use-cases";
import { HOME, HOME_UI, HOME_USE_CASE_SLUGS, HOME_WORKFLOW, HOME_WORKFLOW_ANCHOR } from "./home";

const plain = (s: string) => s.replace(/[*~=]/g, "");
const text = (locale: "en" | "vi") => JSON.stringify([HOME[locale], HOME_WORKFLOW[locale], HOME_UI[locale]]);

describe("homepage hero", () => {
  it("carries the English positioning", () => {
    const h = HOME.en.hero;
    expect(h.eyebrow).toBe("The multiplayer agent platform");
    expect(plain(h.title)).toBe("Your team just got new teammates.");
    expect(h.lede).toBe("Bring humans and AI agents into one workspace. Delegate tasks, collaborate across agents, approve important actions, and keep work moving in the tools your team already uses.");
    expect(h.primary).toBe("Start your workspace");
    expect(h.secondary).toBe("See how it works");
    expect(h.microcopy).toBe("Humans + AI agents. Working together.");
  });

  it("carries the Vietnamese positioning", () => {
    const h = HOME.vi.hero;
    expect(h.eyebrow).toBe("Nền tảng cộng tác giữa con người và AI agent");
    expect(plain(h.title)).toBe("Đội ngũ của bạn vừa có thêm đồng đội.");
    expect(h.lede).toBe("Đưa con người và AI agent vào cùng một workspace. Giao việc, phối hợp giữa các agent, phê duyệt hành động quan trọng và vận hành ngay trên những công cụ đội ngũ đang sử dụng.");
    expect(h.primary).toBe("Cài dewee miễn phí");
    expect(h.secondary).toBe("Xem cách hoạt động");
    expect(h.microcopy).toBe("Con người và AI agent. Cùng làm việc như một đội.");
  });

  it("points the secondary call to action at a valid in-page anchor", () => {
    expect(HOME_WORKFLOW_ANCHOR).toMatch(/^[a-z][a-z0-9-]*$/);
  });

  it("labels the simulated chat visibly, not only for screen readers", () => {
    expect(HOME_UI.en.chatCaption.toLowerCase()).toMatch(/illustrative/);
    expect(HOME_UI.vi.chatCaption.toLowerCase()).toMatch(/minh hoạ/);
  });
});

describe("homepage use cases", () => {
  it("shows the four coordination patterns its lede names, in that order, and each one exists", () => {
    expect(HOME_USE_CASE_SLUGS).toEqual(["ai-coworker-in-group-chats", "task-chasing", "customer-care-with-handoff", "sales-knowledge-assistant"]);
    for (const slug of HOME_USE_CASE_SLUGS) expect(useCaseBySlug(slug), slug).toBeDefined();
  });
});

describe("homepage getting-started answer", () => {
  const answer = (locale: "en" | "vi") => HOME[locale].faq.items.find((i) => /get started|Bắt đầu/.test(i.q))?.a ?? "";

  it("describes the real sign-up flow: email, GitHub or Google, then naming the workspace", () => {
    expect(answer("en")).toMatch(/GitHub, Google or a sign-in link sent to your email/);
    expect(answer("en")).toMatch(/name your workspace/);
  });

  it("starts Vietnamese visitors on the free self-install, never the hosted app", () => {
    expect(answer("vi")).toMatch(/script cài đặt hoặc Docker, hoàn toàn miễn phí/);
    expect(answer("vi")).not.toMatch(/app\.dewee\.sh|Annual/);
  });

  it("says plainly that chat channels need a paid plan or licence", () => {
    expect(answer("en")).toContain("connecting chat channels such as Slack, Telegram or Zalo needs the Annual plan ($500 a year)");
    expect(answer("en")).toContain("a $500/year licence connects chat channels");
    expect(answer("vi")).toContain("bạn cần license $500/năm cho workspace đó");
  });
});

describe("homepage closing", () => {
  it("ends on the final call to action and the closing line", () => {
    expect(plain(HOME.en.cta.title)).toBe("Put your agents to work.");
    expect(plain(HOME.vi.cta.title)).toBe("Đưa agent vào làm việc.");
    expect(HOME.en.cta.note).toBe("Your team. Your agents. Your rules.");
    expect(HOME.vi.cta.note).toBe("Đội ngũ của bạn. Agent của bạn. Quy tắc của bạn.");
    expect(plain(HOME.en.useCases.title)).toBe("Built for real work. Not just conversations.");
    expect(plain(HOME.vi.useCases.title)).toBe("Làm việc thực tế. Không chỉ trò chuyện.");
  });
});

describe("homepage meta", () => {
  for (const locale of LOCALES) {
    it(`(${locale}) has a title ≤ 60 and a description of 140–160 characters`, () => {
      const { title, description } = HOME[locale].meta;
      expect(title.length).toBeLessThanOrEqual(60);
      expect(description.length).toBeGreaterThanOrEqual(140);
      expect(description.length).toBeLessThanOrEqual(160);
    });
  }
});

describe("homepage EN and VI parity", () => {
  it("has the same number of items in every list", () => {
    const shape = (locale: "en" | "vi") => {
      const h = HOME[locale];
      const w = HOME_WORKFLOW[locale];
      return {
        chat: h.hero.chat.lines.map((l) => Boolean(l.me)),
        pillars: h.pillars.items.map((i) => i.icon),
        engineering: h.engineering.items.length,
        layers: h.security.layers.length,
        faq: h.faq.items.length,
        steps: w.steps.map((s) => [s.kind, s.status?.tone ?? null, (s.tasks ?? []).map((t) => t.status.tone)]),
      };
    };
    expect(shape("vi")).toEqual(shape("en"));
  });

  it("uses only icons that exist", () => {
    for (const locale of LOCALES) for (const item of HOME[locale].pillars.items) expect(ICONS).toHaveProperty(item.icon);
  });
});

describe("homepage facts", () => {
  it("states test, code, channel and release figures from FACTS", () => {
    expect(text("en")).toContain(`${FACTS.goTests.rounded} automated tests run before every release`);
    expect(text("vi")).toContain(`${FACTS.goTests.roundedVi} bài test tự động chạy trước mỗi bản phát hành`);
    expect(text("en")).toContain(FACTS.goLines.rounded);
    expect(text("vi")).toContain(FACTS.goLines.roundedVi);
    for (const locale of LOCALES) {
      expect(text(locale)).toContain(`${FACTS.channels} `);
      expect(text(locale)).toContain(`v${FACTS.stableRelease.version}`);
    }
  });

  it("keeps no stale numbers or cadence claims", () => {
    for (const locale of LOCALES) {
      const all = text(locale);
      for (const stale of ["8,900", "8.900", "637,225", "637.225", "v3.33", "10 chat channels", "10 kênh", "on every change", "cho mỗi thay đổi"]) {
        expect(all).not.toContain(stale);
      }
    }
  });

  it("makes no unsupported claims", () => {
    for (const locale of LOCALES) {
      const all = text(locale).toLowerCase();
      for (const banned of ["world's first", "the first multiplayer", "đầu tiên trên thế giới", "seamless", "revolutionary", "unlock", "co-editing in real time", "100% safe", "an toàn tuyệt đối", "never leaves", "không rời khỏi"]) {
        expect(all).not.toContain(banned);
      }
    }
  });
});

describe("homepage work story", () => {
  for (const locale of LOCALES) {
    const w = HOME_WORKFLOW[locale];
    it(`(${locale}) is labelled as an illustration`, () => {
      expect(w.label.length).toBeGreaterThan(0);
      expect(w.label.toLowerCase()).toMatch(locale === "en" ? /illustrative/ : /minh hoạ/);
    });

    it(`(${locale}) runs from a person, through agents and the board, to a person's approval and a follow-up`, () => {
      const kinds = w.steps.map((s) => s.kind);
      expect(kinds[0]).toBe("human");
      expect(kinds).toContain("agent");
      expect(kinds).toContain("board");
      const board = w.steps.find((s) => s.kind === "board");
      expect(board?.tasks?.some((t) => t.status.tone === "review")).toBe(true);
      const approval = w.steps.findIndex((s, i) => s.kind === "human" && i > kinds.indexOf("board"));
      expect(approval).toBeGreaterThan(0);
      expect(w.steps[approval].status?.tone).toBe("done");
      expect(w.steps.at(-1)?.kind).toBe("agent");
    });
  }
});

describe("homepage Vietnamese deployment copy", () => {
  it("never names the plans that are not offered in Vietnam", () => {
    const vi = text("vi");
    for (const name of ["AaaS", "TOSE", "Dedicated", "cloud dùng chung"]) expect(vi).not.toContain(name);
  });
});
