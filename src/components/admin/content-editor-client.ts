/**
 * Editor island for /admin/pages/<id> and /admin/posts/<id>. Everything goes through the public
 * REST API (the same code path as the CLI and MCP), authenticated by the session cookie and the
 * CSRF header. Keyboard: Ctrl/⌘+S saves; every control is a native button, input or link.
 */
import { api } from "./admin-ui-client";

type Messages = Record<"saving" | "saved" | "conflict" | "validJson" | "badJson" | "confirmDelete" | "confirmRestore" | "generic", string>;
type Record_ = { id: string; version: number; status: string; title: string };
type Issue = { path: string; message: string };

/** Builds the create/update body from the form. Empty optional fields become null or are omitted. */
export function payloadFromForm(form: HTMLFormElement, kind: "page" | "post", isNew: boolean): { body: Record<string, unknown>; jsonError: string | null } {
  const data = new FormData(form);
  const text = (name: string) => {
    const v = data.get(name);
    return typeof v === "string" ? v.trim() : "";
  };
  const body: Record<string, unknown> = {
    title: text("title"),
    locale: text("locale") || "en",
    description: text("description"),
    translation_key: text("translation_key") || null,
    tags: text("tags")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
  };
  // An empty slug is derived from the title on create and left unchanged on update.
  const slug = text("slug");
  if (slug) body.slug = slug;
  const seo: Record<string, unknown> = {};
  if (text("seo.title")) seo.title = text("seo.title");
  if (text("seo.description")) seo.description = text("seo.description");
  if (text("seo.ogImage")) seo.ogImage = text("seo.ogImage");
  if (data.get("seo.noindex") === "on") seo.noindex = true;
  body.seo = seo;
  const note = text("note");
  if (note && !isNew) body.note = note;

  let jsonError: string | null = null;
  if (kind === "page") {
    body.layout = text("layout") || "default";
    const raw = String(data.get("blocks") ?? "").trim() || "[]";
    try {
      body.blocks = JSON.parse(raw);
    } catch (err) {
      jsonError = err instanceof Error ? err.message : String(err);
    }
  } else {
    body.body_md = String(data.get("body_md") ?? "");
    body.author = text("author") || null;
    body.cover = text("cover") || null;
  }
  return { body, jsonError };
}

export function initContentEditor(): void {
  const root = document.getElementById("editor");
  const form = document.getElementById("ed-form") as HTMLFormElement | null;
  if (!root || !form) return;
  const kind = root.dataset.kind === "post" ? "post" : "page";
  const plural = root.dataset.plural ?? "pages";
  let id = root.dataset.id ?? "";
  let version = Number(root.dataset.version) || 0;
  const msg = JSON.parse(root.dataset.msg ?? "{}") as Messages;
  const status = root.querySelector<HTMLElement>("[data-ed-msg]");
  const issuesBox = root.querySelector<HTMLElement>("[data-ed-issues]");
  const previewForm = document.getElementById("ed-preview-form") as HTMLFormElement | null;
  const blocksInput = form.querySelector<HTMLTextAreaElement>("textarea[name=blocks]");
  let busy = false;

  const say = (text: string, tone: "error" | "success" | "" = "") => {
    if (!status) return;
    status.textContent = text;
    if (tone) status.dataset.kind = tone;
    else delete status.dataset.kind;
  };
  const failure = (res: { status: number; code: string; message: string; details?: unknown }) => {
    if (res.status === 409) return say(msg.conflict, "error");
    const details = Array.isArray(res.details) ? (res.details as Issue[]).map((d) => `${d.path}: ${d.message}`).join("; ") : "";
    say(`${res.message}${details ? ` (${details})` : ""}`, "error");
  };
  const applyRecord = (rec: Record_) => {
    version = rec.version;
    root.dataset.version = String(rec.version);
    root.querySelector("[data-ed-version]")?.replaceChildren(String(rec.version));
    const chip = root.querySelector<HTMLElement>("[data-ed-status]");
    if (chip) {
      chip.textContent = rec.status;
      chip.className = rec.status === "published" ? "chip chip--success" : rec.status === "draft" ? "chip chip--warning" : "chip";
    }
    root.querySelectorAll<HTMLButtonElement>("[data-ed-action]").forEach((btn) => {
      const action = btn.dataset.edAction;
      btn.hidden = (action === "publish" && rec.status === "published") || (action === "unpublish" && rec.status !== "published") || (action === "archive" && rec.status === "archived");
    });
    root.querySelector("[data-ed-heading]")?.replaceChildren(rec.title);
  };

  const refreshPreview = () => {
    if (!previewForm) return;
    const { body, jsonError } = payloadFromForm(form, kind, !id);
    if (jsonError) return;
    (previewForm.elements.namedItem("doc") as HTMLInputElement).value = JSON.stringify(body);
    previewForm.submit();
  };

  const showIssues = (issues: Issue[] | null, jsonError: string | null) => {
    if (!issuesBox) return;
    issuesBox.replaceChildren();
    if (jsonError) {
      issuesBox.dataset.kind = "error";
      issuesBox.textContent = `${msg.badJson}: ${jsonError}`;
      blocksInput?.setAttribute("aria-invalid", "true");
      return;
    }
    if (!issues) return;
    if (issues.length === 0) {
      delete issuesBox.dataset.kind;
      issuesBox.textContent = msg.validJson;
      blocksInput?.removeAttribute("aria-invalid");
      return;
    }
    issuesBox.dataset.kind = "error";
    blocksInput?.setAttribute("aria-invalid", "true");
    const list = document.createElement("ul");
    for (const issue of issues.slice(0, 20)) {
      const li = document.createElement("li");
      const code = document.createElement("code");
      code.textContent = issue.path;
      // appendChild, not append: the Workers types overload Element.append for HTMLRewriter.
      li.appendChild(code);
      li.appendChild(document.createTextNode(` ${issue.message}`));
      list.appendChild(li);
    }
    issuesBox.appendChild(list);
  };

  let validateTimer = 0;
  let validateSeq = 0;
  const validateBlocks = async () => {
    if (!blocksInput) return;
    const raw = blocksInput.value.trim() || "[]";
    let blocks: unknown;
    try {
      blocks = JSON.parse(raw);
    } catch (err) {
      return showIssues(null, err instanceof Error ? err.message : String(err));
    }
    const seq = ++validateSeq;
    const res = await api<{ data: { valid: boolean; issues: Issue[] } }>("POST", "/blocks/validate", { blocks });
    if (seq !== validateSeq) return;
    if (res.ok) showIssues(res.data.data.issues, null);
    else failure(res);
  };
  blocksInput?.addEventListener("input", () => {
    window.clearTimeout(validateTimer);
    validateTimer = window.setTimeout(validateBlocks, 500);
  });

  const save = async () => {
    if (busy) return;
    if (!form.reportValidity()) return;
    const { body, jsonError } = payloadFromForm(form, kind, !id);
    if (jsonError) {
      showIssues(null, jsonError);
      blocksInput?.focus();
      return;
    }
    busy = true;
    say(msg.saving);
    const res = id
      ? await api<{ data: Record_ }>("PATCH", `/${plural}/${id}`, body, { "if-match": `"${version}"` })
      : await api<{ data: Record_ }>("POST", `/${plural}`, body);
    busy = false;
    if (!res.ok) return failure(res);
    if (!id) {
      window.location.assign(`/admin/${plural}/${res.data.data.id}`);
      return;
    }
    applyRecord(res.data.data);
    const note = form.elements.namedItem("note") as HTMLInputElement | null;
    if (note) note.value = "";
    say(`${msg.saved} ${res.data.data.version}.`, "success");
    refreshPreview();
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    void save();
  });
  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      void save();
    }
  });

  root.querySelectorAll<HTMLButtonElement>("[data-ed-action]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!id || busy) return;
      busy = true;
      const res = await api<{ data: Record_ }>("POST", `/${plural}/${id}/${btn.dataset.edAction}`, { version });
      busy = false;
      if (!res.ok) return failure(res);
      applyRecord(res.data.data);
      say(`${res.data.data.status} · v${res.data.data.version}`, "success");
      // A status change adds a revision; reload so the history panel and links are current.
      window.setTimeout(() => window.location.reload(), 600);
    });
  });

  root.querySelector<HTMLButtonElement>("[data-ed-delete]")?.addEventListener("click", async () => {
    if (!id || busy || !window.confirm(msg.confirmDelete)) return;
    busy = true;
    const res = await api("DELETE", `/${plural}/${id}`, { version });
    busy = false;
    if (!res.ok) return failure(res);
    window.location.assign(`/admin/${plural}`);
  });

  root.querySelectorAll<HTMLButtonElement>("[data-ed-restore]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!id || busy || !window.confirm(msg.confirmRestore)) return;
      busy = true;
      const res = await api<{ data: Record_ }>("POST", `/${plural}/${id}/revisions/${btn.dataset.edRestore}/restore`, { version });
      busy = false;
      if (!res.ok) return failure(res);
      window.location.reload();
    });
  });

  root.querySelectorAll<HTMLButtonElement>("[data-ed-insert]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!blocksInput) return;
      let blocks: unknown[];
      try {
        const parsed: unknown = JSON.parse(blocksInput.value.trim() || "[]");
        blocks = Array.isArray(parsed) ? parsed : [];
      } catch (err) {
        return showIssues(null, err instanceof Error ? err.message : String(err));
      }
      blocks.push(JSON.parse(btn.dataset.edInsert ?? "{}"));
      blocksInput.value = JSON.stringify(blocks, null, 2);
      blocksInput.focus();
      blocksInput.setSelectionRange(blocksInput.value.length, blocksInput.value.length);
      void validateBlocks();
    });
  });

  root.querySelectorAll<HTMLDetailsElement>("details[data-ed-schema]").forEach((details) => {
    details.addEventListener("toggle", async () => {
      const pre = details.querySelector<HTMLElement>("[data-ed-schema-body]");
      if (!details.open || !pre || pre.textContent) return;
      const res = await api<{ data: { props: unknown; section: unknown } }>("GET", `/blocks/${encodeURIComponent(details.dataset.edSchema ?? "")}`);
      pre.textContent = res.ok ? JSON.stringify(res.data.data.props, null, 2) : res.message;
    });
  });

  root.querySelector<HTMLButtonElement>("[data-ed-preview]")?.addEventListener("click", refreshPreview);
  if (blocksInput) void validateBlocks();
  refreshPreview();
}
