/**
 * Browser island for DocsSearch: lazy-loads the JSON index on first focus, renders results as
 * an ARIA combobox listbox, and handles "/" to focus, arrows to move, Enter to open, Escape to
 * close. Results are built with DOM APIs (textContent), never innerHTML.
 */
import { markTerms, prepare, searchDocs, type PreparedDoc, type SearchDoc, type SearchHit } from "./docs-search-core";

type Labels = { label: string; placeholder: string; hint: string; loading: string; error: string; empty: string; emptyHint: string; results: string };

const indexes = new Map<string, Promise<PreparedDoc[]>>();

function loadIndex(url: string): Promise<PreparedDoc[]> {
  let pending = indexes.get(url);
  if (!pending) {
    pending = fetch(url, { headers: { accept: "application/json" } })
      .then((res) => {
        if (!res.ok) throw new Error(`search index ${res.status}`);
        return res.json() as Promise<SearchDoc[]>;
      })
      .then((docs) => {
        if (!Array.isArray(docs)) throw new Error("search index is not a list");
        return docs.map(prepare);
      });
    // A failed load must not stick: the next focus retries.
    pending.catch(() => indexes.delete(url));
    indexes.set(url, pending);
  }
  return pending;
}

function highlighted(text: string, query: string): DocumentFragment {
  const frag = document.createDocumentFragment();
  for (const [part, isHit] of markTerms(text, query)) {
    if (isHit) {
      const mark = document.createElement("mark");
      mark.textContent = part;
      frag.append(mark);
    } else frag.append(part);
  }
  return frag;
}

function wire(root: HTMLElement) {
  const input = root.querySelector<HTMLInputElement>("[data-search-input]");
  const panel = root.querySelector<HTMLElement>("[data-search-panel]");
  const status = root.querySelector<HTMLElement>("[data-search-status]");
  const list = root.querySelector<HTMLUListElement>("[data-search-list]");
  const indexUrl = root.dataset.index;
  if (!input || !panel || !status || !list || !indexUrl) return;
  let labels: Labels;
  try {
    labels = JSON.parse(root.dataset.labels ?? "{}") as Labels;
  } catch {
    return;
  }

  let hits: SearchHit[] = [];
  let active = -1;
  let ticket = 0;

  const open = (show: boolean) => {
    panel.hidden = !show;
    input.setAttribute("aria-expanded", String(show && hits.length > 0));
  };

  const setActive = (i: number) => {
    active = hits.length ? (i + hits.length) % hits.length : -1;
    list.querySelectorAll<HTMLElement>("[role=option]").forEach((li, n) => {
      li.setAttribute("aria-selected", String(n === active));
      if (n === active) li.scrollIntoView({ block: "nearest" });
    });
    if (active >= 0) input.setAttribute("aria-activedescendant", `${list.id}-${active}`);
    else input.removeAttribute("aria-activedescendant");
  };

  const renderHits = (query: string) => {
    list.replaceChildren();
    status.replaceChildren();
    if (hits.length === 0) {
      const box = document.createElement("div");
      box.className = "dsearch__empty";
      const b = document.createElement("b");
      b.textContent = labels.empty.replace("{q}", query.trim());
      const small = document.createElement("small");
      small.textContent = labels.emptyHint;
      box.appendChild(b);
      box.appendChild(small);
      status.appendChild(box);
      setActive(-1);
      open(true);
      return;
    }
    status.textContent = labels.results.replace("{n}", String(hits.length));
    hits.forEach((hit, i) => {
      const li = document.createElement("li");
      li.id = `${list.id}-${i}`;
      li.setAttribute("role", "option");
      const a = document.createElement("a");
      a.href = hit.url;
      a.tabIndex = -1;
      const title = document.createElement("span");
      title.className = "dsearch__title";
      title.appendChild(highlighted(hit.doc.t, query));
      const meta = document.createElement("span");
      meta.className = "dsearch__meta";
      const section = document.createElement("span");
      section.className = "dsearch__section";
      section.textContent = hit.doc.s;
      meta.appendChild(section);
      meta.appendChild(document.createTextNode(" · "));
      meta.appendChild(highlighted(hit.heading ? hit.heading[0] : hit.doc.d, query));
      a.appendChild(title);
      a.appendChild(meta);
      li.appendChild(a);
      list.appendChild(li);
    });
    setActive(0);
    open(true);
  };

  const run = async () => {
    const query = input.value;
    const mine = ++ticket;
    if (!query.trim()) {
      hits = [];
      list.replaceChildren();
      status.replaceChildren();
      open(false);
      return;
    }
    status.textContent = labels.loading;
    list.replaceChildren();
    open(true);
    try {
      const docs = await loadIndex(indexUrl);
      if (mine !== ticket) return;
      hits = searchDocs(docs, query, 8);
      renderHits(query);
    } catch {
      if (mine !== ticket) return;
      hits = [];
      status.textContent = labels.error;
    }
  };

  input.addEventListener("focus", () => {
    loadIndex(indexUrl).catch(() => undefined);
    if (input.value.trim()) void run();
  });
  input.addEventListener("input", () => void run());
  input.addEventListener("blur", () => window.setTimeout(() => open(false), 120));
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!hits.length) return;
      e.preventDefault();
      if (panel.hidden) open(true);
      setActive(active + (e.key === "ArrowDown" ? 1 : -1));
    } else if (e.key === "Enter") {
      const target = hits[active] ?? hits[0];
      if (target) {
        e.preventDefault();
        window.location.assign(target.url);
      }
    } else if (e.key === "Escape") {
      if (!panel.hidden) open(false);
      else input.value = "";
    }
  });
  // Keep focus in the input while clicking a result; the link itself navigates.
  panel.addEventListener("mousedown", (e) => e.preventDefault());

  // A search submitted from elsewhere (e.g. the 404 page) lands here as ?q=…: fill it in and show results.
  if (root.dataset.fromUrl !== undefined) {
    const q = new URLSearchParams(window.location.search).get("q")?.trim().slice(0, 200);
    if (q) {
      input.value = q;
      input.focus();
    }
  }
}

const editable = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));

export function initDocsSearch() {
  document.querySelectorAll<HTMLElement>("[data-docs-search]:not([data-ready])").forEach((root) => {
    root.dataset.ready = "";
    wire(root);
  });
  if (document.documentElement.dataset.docsSearchKey) return;
  document.documentElement.dataset.docsSearchKey = "on";
  document.addEventListener("keydown", (e) => {
    if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey || editable(e.target)) return;
    const input = [...document.querySelectorAll<HTMLInputElement>("[data-search-input]")].find((el) => el.offsetParent !== null);
    if (!input) return;
    e.preventDefault();
    input.focus();
  });
}
