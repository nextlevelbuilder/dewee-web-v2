/**
 * Homepage copy, English. Every count and version comes from src/content/facts.ts (provenance in
 * docs/marketing-facts.md); never type a number here that FACTS already holds.
 * Inline markup: *em*, ==mark==, ~~scribble~~ (see src/lib/inline-markup.ts).
 */
import { FACTS } from "~/content/facts";
import type { HomeCopy } from "./home-types";

export const HOME_EN: HomeCopy = {
  meta: {
    title: "dewee: the multiplayer agent platform for teams",
    description:
      "dewee is the multiplayer agent platform: people and AI agents in one workspace, delegating tasks, sharing a task board and approving work in your team chats.",
  },
  hero: {
    eyebrow: "The multiplayer agent platform",
    title: "Your team just got new *teammates*.",
    lede:
      "Bring humans and AI agents into one workspace. Delegate tasks, collaborate across agents, approve important actions, and keep work moving in the tools your team already uses.",
    primary: "Start your workspace",
    secondary: "See how it works",
    microcopy: "Humans + AI agents. Working together.",
    note: "and Thursday's follow-up is booked",
    chat: {
      channel: "#sales-team",
      lines: [
        { who: "Lan", role: "Sales", text: "@lead the Da Nang client wants an on-prem quote with 3 custom workflows. Can the team pick it up?" },
        { who: "Lead agent", role: "AI agent", text: "On it. @research is checking their stack, @sales is drafting the quote from the 2026 price sheet.", me: true },
        { who: "Sales agent", role: "AI agent", text: "Quote is on the board for review ✓ Minh, it needs your approval before it goes out.", me: true },
        { who: "Minh", role: "Head of Sales", text: "Approved on the board." },
        { who: "Lead agent", role: "AI agent", text: "Sent. I'll follow up on Thursday at 9:00 if they go quiet.", me: true },
      ],
    },
  },
  pillars: {
    eyebrow: "What makes it multiplayer",
    title: "One prompt isn't *teamwork*.",
    lede: "Most AI tools help one person finish one task. dewee helps your entire team get work done together. Your people make decisions. Agents research, execute, coordinate, and follow up.",
    cta: "See every feature",
    items: [
      { icon: "users", title: "Agents work with people", body: "Agents join the chats your team already uses, pick up tasks, send work back for review and wait for a person's approval when it matters." },
      { icon: "network", title: "Agents work with agents", body: "A lead agent splits the work, delegates it to specialist agents on a shared task board and combines what they bring back." },
      { icon: "plug", title: "Your tools stay connected", body: "Chat channels, the models you choose, your knowledge base and your MCP servers, wired into one workspace." },
      { icon: "shield-check", title: "You stay in control", body: "Roles and permissions, human approval for sensitive actions, a trace of every run, and your choice of where it all runs." },
    ],
  },
  useCases: {
    eyebrow: "Use cases by team",
    title: "Built for real work. *Not just conversations.*",
    lede: "AI coworkers in group chats, task chasing, customer care with a human handoff, sales and operations. Each pattern lists the team, the channels, tools and guardrails it needs.",
    cta: "Browse every use case",
  },
  product: {
    eyebrow: "Inside the console",
    title: "Real screens. *Not* a mock-up.",
    lede: "The agent team with its lead, members and shared task board; every run with its tools, tokens and cost; and the chat where an agent asks before it acts.",
    note: "Captured from the console's demo workspace, not a customer's.",
    cta: "Explore the architecture",
  },
  integrations: {
    eyebrow: "Integrations & deployment",
    title: "Plugs into the tools you *already* use.",
    lede: `${FACTS.channels} chat channels, ${FACTS.providers} model providers and your own MCP servers. Bring your keys; dewee connects them without asking you to move house.`,
    channels: "Chat channels",
    providers: "Model providers",
    cta: "See all integrations",
    deployTitle: "Run it *where you choose*.",
    deployLede: "Install it yourself for free, start on our shared cloud, move to a dedicated runtime, or have us set it up on your own hardware. Same product, same care.",
  },
  security: {
    eyebrow: "Security",
    title: "Shut at the door. Opened *on purpose*.",
    lede: "Most agent stacks start wide open and hope for the best. dewee starts with the door shut: no token, no connection; no approval, no chat. Then you decide what each agent may do.",
    layers: [
      { name: "Transport", body: "CORS, timing-safe auth, rate limits at the door." },
      { name: "Input", body: "Prompt-injection checks before anything reaches a model: warn by default, block when you choose." },
      { name: "Tools", body: "A policy engine decides which agent may run what, where." },
      { name: "Output", body: "Keys, tokens and secrets are scrubbed from every reply." },
      { name: "Isolation", body: "Per-tenant data, per-agent workspaces, sandboxed execution." },
    ],
    stamp: "10",
    stampNote: "AES-256-GCM on stored credentials",
    cta: "Read the security model",
  },
  engineering: {
    eyebrow: "Engineering, checked",
    title: "We did the homework. *All of it.*",
    lede: "Agents that touch real customers and real money cannot be a weekend demo. Every line below is something we built, tested and broke on purpose, so you never have to.",
    items: [
      { text: `${FACTS.goTests.rounded} automated tests run before every release`, detail: "Tenant isolation, chaos start-ups, prompt injection, the lot." },
      { text: `${FACTS.goLines.rounded} lines of Go, tests included`, detail: "One self-contained runtime, written and re-read." },
      { text: "5 defence layers between your data and the internet", detail: "Shut at the door: a token to connect, an approval before a stranger can chat." },
      { text: `${FACTS.providers} model providers, with a fallback per agent`, detail: "When one provider has a bad day, your agents don't." },
      { text: `${FACTS.channels} chat channels, Zalo and Pancake included`, detail: "Built for how Southeast Asian teams actually talk." },
      { text: `Stable v${FACTS.stableRelease.version}, with a public changelog`, detail: "We ship, we patch, and the changelog says what changed." },
    ],
    grade: "10",
    signature: "Checked by the team, re-checked by the tests",
  },
  pricing: {
    eyebrow: "Pricing",
    title: "Your cloud, ours, or *somewhere in between*.",
    lede: "Four ways to run the same product, from a free self-install to a setup on your own hardware. Pick one now and move later.",
    cta: "Compare deployment options",
  },
  company: {
    eyebrow: "The team behind it",
    title: "Built by the team behind *GoClaw*.",
    lede: "GoClaw began in February 2026 as an open-source agent gateway and stays free for the community. dewee is its closed-source sibling, hardened for business by three builders from the NextLevelBuilder family.",
    storyCta: "Read the whole story",
    aboutCta: "Meet the founders",
  },
  faq: {
    eyebrow: "Questions, answered",
    title: "Things people ask us *first*.",
    items: [
      { q: "What does \"multiplayer\" mean in dewee?", a: "People and AI agents working in the same workspace. A lead agent splits a request into tasks on a shared board, delegates them to member agents and combines the results, while people assign work, review it and approve what matters. It is coordinated work through tasks, messages and approvals, not live co-editing." },
      { q: "How do we get started?", a: "Sign in at app.dewee.sh with GitHub, Google or a sign-in link sent to your email, name your workspace on the setup step, and dewee creates it. A free workspace runs in the web console; connecting chat channels such as Slack, Telegram or Zalo needs the Annual plan ($500 a year). You can also install dewee on your own machine for free, where a $500/year licence connects chat channels, or talk to us about a dedicated or on-premises setup." },
      { q: "What stops an agent from doing something it shouldn't?", a: "Each agent only gets the tools and channels you grant it. Tasks can require a person's approval before they complete, sensitive commands wait for a member to approve or deny them, and every run is traced, so you can see what happened and why." },
      { q: "Can we keep our data on our own servers?", a: "Yes. The On-Premises option runs the dewee runtime on your VPS or Mac mini, activated by a licence key. Or install dewee on your own machine yourself: installing is free, and a licence connects your chat channels." },
      { q: "Which AI models can we use?", a: `Anthropic, OpenAI, Gemini, DeepSeek, Qwen, Mistral, xAI, OpenRouter, Groq, Ollama and more: ${FACTS.providers} providers. You bring your own keys, and each agent can fall back to another provider automatically.` },
      { q: "Do our people need to learn a new tool?", a: "Not really. Agents join the chat apps your team already uses, such as Telegram, Zalo, Slack, Lark or Discord. Admins get a console; everyone else just @mentions the agent." },
      { q: "Is dewee just GoClaw with a new name?", a: "No. dewee grew out of GoClaw, but it is a separate, closed-source product with enterprise hardening, a customer control plane, licensing and a team that supports you. GoClaw remains open and free for non-commercial use." },
    ],
  },
  cta: {
    title: "Put your agents *to work*.",
    body: "Start a workspace and give your first agent a real task, or tell us about the work your team would rather hand off. We reply to every message.",
    primary: "Start your workspace",
    secondary: "Talk to us",
    note: "Your team. Your agents. Your rules.",
  },
};
