/**
 * Shapes for the use-case catalogue. The index fields feed the homepage table of contents and
 * /use-cases; `detail` powers each /use-cases/<slug> story. Every capability and guardrail named
 * in a detail must exist in the dewee product (see the fact sources listed in AGENTS.md).
 */
import type { Bi } from "~/i18n/config";
import type { IconName } from "~/components/ui/icon-paths";
import type { CcpScreenId } from "~/content/ccp-screens";

/** Chat channels a use case can run on. Display names and marks live in CHANNEL_MARKS (index.ts). */
export type ChannelId = "telegram" | "zalo" | "slack" | "lark" | "discord" | "whatsapp" | "facebook" | "pancake" | "bitrix24";

/**
 * Broad work areas used by the /use-cases filter. Each use case has its own team label, which is
 * too fine-grained to filter by (fourteen teams, one card each), so cards group into five areas.
 */
export type UseCaseArea = "operations" | "customers" | "marketing" | "research" | "make";

/** One line of a sample chat. `me` marks dewee's own messages. */
export type TranscriptLine = { who: string; role?: string; text: string; me?: boolean };

export type UseCaseDetail = {
  /** The pain, in the customer's words */
  problem: Bi;
  /** What the agents actually do, step by step (4–6 steps) */
  flow: Bi<string[]>;
  /** Agents involved (role names) */
  agents: Bi<string[]>;
  /** dewee capabilities used (real, shipped features only) */
  capabilities: Bi<string[]>;
  /** Guardrails and the human in the loop */
  guardrails: Bi<string[]>;
  /** Where the sample exchange happens: the channel and the chat or room name */
  chat: { channel: ChannelId; room: Bi };
  /** A short sample exchange shown as a chat transcript (4–6 lines) */
  transcript: Bi<TranscriptLine[]>;
  /** Qualitative outcome (no invented metrics) */
  outcome: Bi;
  /** Meta description for the detail page, 140–160 characters */
  description: Bi;
  /** Slugs of three sibling use cases shown under "related" */
  related: [string, string, string];
  /**
   * Optional console screen that shows where this job is set up. Only for cases
   * where one real screen carries the story (see src/content/ccp-screens.ts).
   */
  console?: CcpScreenId;
};

export type UseCase = {
  slug: string;
  icon: IconName;
  area: UseCaseArea;
  team: Bi;
  title: Bi;
  summary: Bi;
  channels: ChannelId[];
  detail: UseCaseDetail;
};
