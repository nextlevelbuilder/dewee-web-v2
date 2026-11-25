/**
 * Progressive enhancement for Poll, Quiz, Survey and Demo widgets. Without JavaScript the forms
 * post to /api/post-widgets/vote and get a results page back, and a demo is a link. With it:
 *  - one GET /api/post-widgets/results per post shows what this reader already answered;
 *  - forms submit through fetch and the results replace the form inline (built with DOM APIs,
 *    never innerHTML);
 *  - a demo loads into `<iframe sandbox="allow-scripts">` only after a click, and only from an
 *    allowlisted host.
 */
import { DEMO_HOSTS, DEMO_SANDBOX } from "../../lib/blocks/demo-urls";

type Labels = Record<string, string>;
type Tally = { id: string; label: string; count: number; percent: number };
type Result =
  | { type: "Poll"; closed: boolean; voted: boolean; choice: string | null; total: number; options: Tally[] }
  | { type: "Quiz"; closed: boolean; answered: false }
  | { type: "Quiz"; closed: boolean; answered: true; choice: string | null; answer: string; correct: boolean; explanation: string; total: number; options: Tally[] }
  | { type: "Survey"; closed: boolean; answered: boolean };

const fill = (t: string, vars: Record<string, string | number>) => t.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

type Widget = { form: HTMLFormElement; set: HTMLFieldSetElement; results: HTMLElement; status: HTMLElement; labels: Labels; question: string };

function tallyList(w: Widget, options: Tally[], total: number, choice: string | null, answer?: string): HTMLElement {
  const box = el("div", "pw-tally");
  box.appendChild(el("p", "pw-tally__head", w.labels.formResults));
  const list = el("ul", "pw-tally__list");
  list.setAttribute("role", "list");
  for (const o of options) {
    const li = el("li", `pw-tally__row${o.id === choice ? " pw-tally__row--mine" : ""}${o.id === answer ? " pw-tally__row--answer" : ""}`);
    const label = el("span", "pw-tally__label", o.label);
    if (o.id === choice) label.appendChild(el("span", "pw-tally__mine", ` (${w.labels.formYours})`));
    li.appendChild(label);
    li.appendChild(el("span", "pw-tally__pct", `${o.percent}%`));
    const bar = el("span", "pw-tally__bar");
    bar.setAttribute("aria-hidden", "true");
    bar.style.setProperty("--pw-pct", `${o.percent}%`);
    li.appendChild(bar);
    list.appendChild(li);
  }
  box.appendChild(list);
  box.appendChild(el("p", "pw-tally__total", total === 1 ? w.labels.formVoteOne : fill(w.labels.formVotes, { n: total })));
  return box;
}

/** Shows the result in place of the form; returns false when the form should stay. */
function showResult(w: Widget, r: Result, afterSubmit: boolean): boolean {
  w.results.replaceChildren();
  const closedNote = () => w.results.appendChild(el("p", "pw-form__closed", w.labels.formClosed));
  if (r.type === "Survey") {
    if (!r.answered && !r.closed) return false;
    w.results.appendChild(el("p", "pw-form__thanks", r.answered ? w.labels.formThanks : w.labels.formClosed));
  } else if (r.type === "Poll") {
    if (!r.voted && !r.closed) return false;
    w.results.appendChild(el("p", "pw-form__question", w.question));
    w.results.appendChild(tallyList(w, r.options, r.total, r.choice));
    if (r.closed) closedNote();
    else {
      const change = el("button", "btn btn--sm pw-form__change", w.labels.formChange);
      change.type = "button";
      change.addEventListener("click", () => {
        w.results.hidden = true;
        w.set.hidden = false;
        w.set.querySelector<HTMLInputElement>("input:checked, input")?.focus();
      });
      w.results.appendChild(change);
    }
  } else {
    if (!r.answered) {
      if (!r.closed) return false;
      w.results.appendChild(el("p", "pw-form__question", w.question));
      closedNote();
    } else {
      const answer = r.options.find((o) => o.id === r.answer)?.label ?? "";
      w.results.appendChild(el("p", "pw-form__question", w.question));
      const verdict = el("p", `pw-quiz__verdict pw-quiz__verdict--${r.correct ? "right" : "wrong"}`);
      verdict.appendChild(el("strong", "", r.correct ? w.labels.formCorrect : w.labels.formIncorrect));
      verdict.appendChild(document.createTextNode(` ${fill(w.labels.formAnswerIs, { answer })}`));
      w.results.appendChild(verdict);
      w.results.appendChild(el("p", "pw-quiz__explanation", r.explanation));
      w.results.appendChild(tallyList(w, r.options, r.total, r.choice, r.answer));
    }
  }
  w.set.hidden = true;
  w.results.hidden = false;
  if (afterSubmit) {
    w.results.tabIndex = -1;
    w.results.focus();
  }
  return true;
}

const ERRORS: Record<string, string> = { invalid: "formErrorPick", rate_limited: "formErrorRate", already_answered: "formErrorAlready", closed: "formClosed" };

function initForm(form: HTMLFormElement): Widget | null {
  const set = form.querySelector<HTMLFieldSetElement>("[data-pw-set]");
  const results = form.querySelector<HTMLElement>("[data-pw-results]");
  const status = form.querySelector<HTMLElement>("[data-pw-status]");
  let labels: Labels;
  try {
    labels = JSON.parse(form.dataset.pwLabels ?? "") as Labels;
  } catch {
    return null;
  }
  if (!set || !results || !status) return null;
  const question = set.querySelector("legend")?.textContent ?? "";
  const w: Widget = { form, set, results, status, labels, question };
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = form.querySelector<HTMLButtonElement>("button[type=submit]");
    if (button) button.disabled = true;
    status.textContent = "";
    try {
      const res = await fetch(form.action, {
        method: "POST",
        headers: { accept: "application/json", "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(new FormData(form) as unknown as Record<string, string>).toString(),
        credentials: "same-origin",
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string; result?: Result } | null;
      if (data?.result) showResult(w, data.result, true);
      if (!data?.ok) status.textContent = labels[ERRORS[data?.error ?? ""] ?? "formError"] ?? labels.formError;
    } catch {
      status.textContent = labels.formError;
    } finally {
      if (button) button.disabled = false;
    }
  });
  return w;
}

async function loadResults(postId: string, widgets: Map<string, Widget>) {
  try {
    const res = await fetch(`/api/post-widgets/results?post=${encodeURIComponent(postId)}`, { credentials: "same-origin", headers: { accept: "application/json" } });
    if (!res.ok) return;
    const data = (await res.json()) as { widgets?: Record<string, Result> };
    for (const [id, result] of Object.entries(data.widgets ?? {})) {
      const w = widgets.get(id);
      if (w) showResult(w, result, false);
    }
  } catch {
    /* the forms still work; results appear after the reader answers */
  }
}

function initDemo(figure: HTMLElement) {
  const trigger = figure.querySelector<HTMLAnchorElement>("[data-pw-demo-trigger]");
  const frameBox = figure.querySelector<HTMLElement>(".pw-demo__frame");
  let url: URL;
  try {
    url = new URL(figure.dataset.src ?? "");
  } catch {
    return;
  }
  // The server validated the host; checking again keeps a tampered page from framing anything else.
  if (!trigger || !frameBox || url.protocol !== "https:" || !(DEMO_HOSTS as readonly string[]).includes(url.hostname) || url.origin === location.origin) return;
  const button = document.createElement("button");
  button.type = "button";
  button.className = trigger.className;
  while (trigger.firstChild) button.appendChild(trigger.firstChild);
  trigger.parentNode?.replaceChild(button, trigger);
  button.addEventListener("click", () => {
    const frame = document.createElement("iframe");
    frame.setAttribute("sandbox", DEMO_SANDBOX);
    frame.src = url.href;
    frame.title = figure.dataset.title ?? "";
    frame.referrerPolicy = "no-referrer";
    frame.setAttribute("loading", "eager");
    frameBox.replaceChildren(frame);
    frame.focus();
  });
}

export function initInteractiveWidgets(root: HTMLElement) {
  const byPost = new Map<string, Map<string, Widget>>();
  root.querySelectorAll<HTMLFormElement>("form[data-pw-form]").forEach((form) => {
    const w = initForm(form);
    const post = form.dataset.pwPost;
    const id = form.dataset.pwWidget;
    if (!w || !post || !id) return;
    if (!byPost.has(post)) byPost.set(post, new Map());
    byPost.get(post)!.set(id, w);
  });
  for (const [post, widgets] of byPost) void loadResults(post, widgets);
  root.querySelectorAll<HTMLElement>("[data-pw-demo]").forEach(initDemo);
}
