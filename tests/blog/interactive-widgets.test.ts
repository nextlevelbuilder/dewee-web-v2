import { describe, expect, it } from "vitest";
import { validateBlocks } from "../../src/lib/blocks/registry";
import { htmlToMarkdown } from "../../src/lib/html-to-markdown";
import { DEMO_HOSTS, parseDemoUrl } from "../../src/lib/blocks/demo-urls";
import { POST_PAGE_CSP } from "../../src/lib/blocks/media-urls";
import { answerFromForm, parseWidgetAnswer } from "../../src/lib/blocks/interactive-answers";
import { POST_WIDGETS } from "../../src/lib/blocks/post-widgets/post-widget-registry";
import { postBodyMarkdown, renderPostBody } from "../../src/lib/blocks/post-widgets/post-body";
import { widgetLabels } from "../../src/lib/blocks/post-widgets/widget-labels";
import { options, poll, quiz, survey } from "./interactive-fixtures";

const labels = widgetLabels("en");
const demo = { id: "demo-1", type: "Demo", props: { url: "https://codepen.io/codepen/embed/PNaGbb?default-tab=result", title: "A pen", description: "Plays in a sandbox." } };

function issues(blocks: unknown[]) {
  const res = validateBlocks(blocks, { context: "post" });
  return res.ok ? [] : res.issues;
}

describe("interactive widget schemas", () => {
  it("accepts valid poll, quiz, survey and demo blocks", () => {
    expect(issues([poll, quiz, survey, demo])).toEqual([]);
  });

  it("requires an id on widgets that store answers", () => {
    expect(issues([{ type: "Poll", props: poll.props }])).toEqual([{ path: "blocks.0.id", message: expect.stringContaining("Poll needs an id") }]);
    expect(issues([{ type: "Demo", props: demo.props }])).toEqual([]);
  });

  it("points at the exact field when a definition is wrong", () => {
    const dupes = issues([{ ...poll, props: { question: "Q", options: [{ id: "a", label: "A" }, { id: "a", label: "B" }] } }]);
    expect(dupes).toEqual([{ path: "blocks.0.props.options.1.id", message: 'Duplicate option id "a".' }]);
    expect(issues([{ ...quiz, props: { ...quiz.props, answer: "maybe" } }])).toEqual([{ path: "blocks.0.props.answer", message: expect.stringContaining("one of the options") }]);
    const badSurvey = issues([{ ...survey, props: { questions: [{ id: "q", prompt: "Say", kind: "text", options }, { id: "r", prompt: "Pick", kind: "single" }] } }]);
    expect(badSurvey.map((i) => i.path)).toEqual(["blocks.0.props.questions.0.options", "blocks.0.props.questions.1.options"]);
    expect(issues([{ ...poll, props: { ...poll.props, closesAt: "next friday" } }])[0].path).toBe("blocks.0.props.closesAt");
    expect(issues([{ ...poll, props: { ...poll.props, options: [{ id: "Bad Id", label: "x" }, options[1]] } }])[0].path).toBe("blocks.0.props.options.0.id");
  });

  it("rejects demo URLs outside the host allowlist", () => {
    for (const url of ["https://evil.example/demo", "http://codepen.io/x", "https://codepen.io.evil.example/x", "https://user:pw@codepen.io/x", "https://codepen.io:8443/x", "javascript:alert(1)", "https://dewee.sh/demo"]) {
      expect(parseDemoUrl(url), url).toBeNull();
      expect(issues([{ ...demo, props: { ...demo.props, url } }])[0]?.path, url).toBe("blocks.0.props.url");
    }
    expect(parseDemoUrl("https://CodePen.io/a/embed/b")?.hostname).toBe("codepen.io");
  });

  it("allows the demo hosts in the post page CSP", () => {
    for (const host of DEMO_HOSTS) expect(POST_PAGE_CSP).toContain(`https://${host}`);
    expect(POST_PAGE_CSP).toMatch(/^frame-src 'self' /);
  });
});

describe("interactive widget rendering", () => {
  const publicHtml = (blocks: unknown[]) => renderPostBody({ id: "11111111-2222-4333-8444-555555555555", body_md: "", blocks }, { mode: "public", labels });

  it("renders a real form that posts without JavaScript", () => {
    const html = publicHtml([poll]);
    expect(html).toContain('<form class="pw-form pw-form--poll" id="pw-poll-1" method="post" action="/api/post-widgets/vote"');
    expect(html).toContain('name="post" value="11111111-2222-4333-8444-555555555555"');
    expect(html).toContain('name="widget" value="poll-1"');
    expect(html).toContain('type="radio" id="pw-poll-1-o-yes" name="choice" value="yes" required');
    expect(html).toContain(labels.formNotice);
  });

  it("never puts the quiz answer or explanation in the page or the text exports", () => {
    const html = publicHtml([quiz]);
    expect(html).not.toContain(quiz.props.explanation);
    expect(html).not.toMatch(/data-[a-z-]*answer/);
    const md = postBodyMarkdown({ body_md: "", blocks: [quiz] }, labels);
    expect(md).toContain("Who approves?");
    expect(md).not.toContain(quiz.props.explanation);
  });

  it("disables the form in the preview, where there is no post to vote on", () => {
    const html = renderPostBody({ id: "11111111-2222-4333-8444-555555555555", body_md: "", blocks: [poll] }, { mode: "preview", labels });
    expect(html).toContain('<fieldset class="pw-form__set" disabled');
    expect(html).not.toContain('name="post"');
    expect(html).toContain(labels.formPreview);
  });

  it("renders survey questions with the right controls and limits", () => {
    const html = publicHtml([survey]);
    expect(html).toContain('type="radio" id="pw-survey-1-role-eng" name="q.role" value="eng" required');
    expect(html).toContain('type="checkbox" id="pw-survey-1-topics-a" name="q.topics" value="a"');
    expect(html).toContain('name="q.wish" rows="3" maxlength="280"');
    expect(html).toContain(labels.formSurveyNotice);
  });

  it("renders a demo as a click-to-load facade with a fallback link, and Markdown as link + description", () => {
    const html = publicHtml([demo]);
    expect(html).not.toContain("<iframe");
    expect(html).toContain('data-sandbox="allow-scripts"');
    expect(html).toContain('href="https://codepen.io/codepen/embed/PNaGbb?default-tab=result" target="_blank" rel="noopener noreferrer"');
    expect(POST_WIDGETS.Demo.markdown(demo.props, { labels })).toBe("**[A pen](https://codepen.io/codepen/embed/PNaGbb?default-tab=result)**: Plays in a sandbox.");
  });
});

describe("answers against the definition", () => {
  it("accepts a known option and rejects unknown ones", () => {
    expect(parseWidgetAnswer("Poll", poll.props, { choice: "yes" })).toEqual({ ok: true, value: { choice: "yes", answers: null } });
    expect(parseWidgetAnswer("Poll", poll.props, { choice: "maybe" }).ok).toBe(false);
    expect(parseWidgetAnswer("Quiz", quiz.props, {}).ok).toBe(false);
  });

  it("checks survey answers: required, unknown questions, options and text length", () => {
    const form = new URLSearchParams([["q.role", "eng"], ["q.topics", "a"], ["q.topics", "b"], ["q.wish", "  more please  "]]);
    expect(parseWidgetAnswer("Survey", survey.props, answerFromForm(form))).toEqual({ ok: true, value: { choice: null, answers: { role: "eng", topics: ["a", "b"], wish: "more please" } } });
    expect(parseWidgetAnswer("Survey", survey.props, { answers: { topics: ["a"] } })).toEqual({ ok: false, message: '"role" is required.' });
    expect(parseWidgetAnswer("Survey", survey.props, { answers: { role: "eng", extra: "x" } }).ok).toBe(false);
    expect(parseWidgetAnswer("Survey", survey.props, { answers: { role: "ceo" } }).ok).toBe(false);
    expect(parseWidgetAnswer("Survey", survey.props, { answers: { role: "eng", wish: "x".repeat(281) } }).ok).toBe(false);
    expect(parseWidgetAnswer("Survey", survey.props, { answers: { role: "eng", topics: ["a", "zzz"] } }).ok).toBe(false);
  });
});

describe("interactive widgets in the page's .md twin", () => {
  const twin = (blocks: unknown[]) => {
    const body = renderPostBody({ id: "11111111-2222-4333-8444-555555555555", body_md: "Intro.", blocks }, { mode: "public", labels });
    return htmlToMarkdown(`<!doctype html><html lang="en"><head><title>T</title></head><body><main>${body}</main></body></html>`, "https://dewee.sh").markdown;
  };

  it("keeps the question and options a form would otherwise drop", () => {
    const md = twin([poll, quiz, survey]);
    for (const block of [poll, quiz]) {
      const expected = POST_WIDGETS[block.type]!.markdown(block.props, { labels });
      expect(md).toContain(expected);
    }
    expect(md).toContain(POST_WIDGETS.Survey!.markdown(survey.props, { labels }).split("\n").at(-1)!);
  });

  it("never carries the quiz answer or explanation", () => {
    const md = twin([quiz]);
    const props = quiz.props as { explanation?: string };
    if (props.explanation) expect(md).not.toContain(props.explanation);
  });
});
