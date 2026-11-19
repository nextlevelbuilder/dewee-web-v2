/**
 * Shape of the homepage copy. Each locale lives in its own file (home-en.ts, home-vi.ts) and the
 * work story in home-workflow.ts, so no file grows past a readable length; home.ts joins them.
 */

/** Task and step states shown in the work story. They mirror the runtime's team task board. */
export type WorkflowTone = "neutral" | "progress" | "review" | "done";
export type WorkflowStatus = { label: string; tone: WorkflowTone };

export type WorkflowStep = {
  /** Who acts: a person, an agent, or the shared task board itself. */
  kind: "human" | "agent" | "board";
  actor: string;
  role: string;
  text: string;
  status?: WorkflowStatus;
  tasks?: { title: string; owner: string; status: WorkflowStatus }[];
};

export type HomeWorkflow = {
  eyebrow: string;
  title: string;
  lede: string;
  /** States plainly that the story is an illustration, not a customer record. */
  label: string;
  steps: WorkflowStep[];
  outcome: { title: string; body: string };
};

type Head = { eyebrow: string; title: string; lede: string };

export type HomeCopy = {
  meta: { title: string; description: string };
  hero: {
    eyebrow: string;
    title: string;
    lede: string;
    primary: string;
    secondary: string;
    microcopy: string;
    note: string;
    chat: { channel: string; lines: { who: string; role?: string; text: string; me?: boolean }[] };
  };
  pillars: Head & { cta: string; items: { icon: string; title: string; body: string }[] };
  useCases: Head & { cta: string };
  product: Head & { note: string; cta: string };
  integrations: Head & { channels: string; providers: string; cta: string; deployTitle: string; deployLede: string };
  security: Head & { layers: { name: string; body: string }[]; stamp: string; stampNote: string; cta: string };
  engineering: Head & { items: { text: string; detail: string }[]; grade: string; signature: string };
  pricing: Head & { cta: string };
  company: Head & { storyCta: string; aboutCta: string };
  faq: { eyebrow: string; title: string; items: { q: string; a: string }[] };
  cta: { title: string; body: string; primary: string; secondary: string; note: string };
};
