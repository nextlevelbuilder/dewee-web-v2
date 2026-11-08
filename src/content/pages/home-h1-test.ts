/**
 * Category-led headline for the homepage H1 experiment (see docs/experiments/homepage-h1.md).
 * The control headline is `hero.title` in home-en.ts / home-vi.ts and stays the only one in the
 * server-rendered text, the Markdown twin and the social cards. This one is swapped in on the
 * client for enrolled visitors only. Same inline markup as the hero title (`*em*`).
 */
import type { Bi } from "~/i18n/config";

export const HOME_H1_CATEGORY: Bi<string> = {
  en: "Where humans and AI agents work as *one team*.",
  vi: "Nơi con người và AI agent làm việc như *một đội*.",
};
