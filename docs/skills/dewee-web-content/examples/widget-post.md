---
title: How a widget post reads
slug: how-a-widget-post-reads
locale: en
description: A sample post that places every kind of widget inline, in reading order, between paragraphs of Markdown.
tags: [product, widgets]
blocks: ./widget-post.blocks.json
---
Posts are **Markdown first**. Widgets sit between paragraphs: each one is a block in `blocks`
with an `id`, and a line `::widget{id="…"}` places it in the body.

## A chart

The chart is drawn on the server. Under it, "View data" opens the same numbers as a table, and
feeds get that table in Markdown.

::widget{id="rollout-chart"}

The rollout itself took three steps:

::widget{id="rollout-steps"}

## A diagram

Diagrams are written in Mermaid. Readers without JavaScript see the source; screen readers get
the alt text.

::widget{id="request-flow"}

## Choosing a widget

::widget{id="widget-choice"}

## Screens

::widget{id="screens"}

Two versions of one image compare best with a slider:

::widget{id="og-cards"}

## Watch it run

::widget{id="walkthrough"}

A native video plays inline with captions:

::widget{id="clip"}

## What people said

::widget{id="reaction"}

## Your turn

Polls, quizzes and surveys are forms: they work without JavaScript, and answers are stored
anonymously. A poll shows the split after you vote, and you can change your vote.

::widget{id="first-agent-poll"}

A quiz keeps its answer to itself until you answer.

::widget{id="approval-quiz"}

Survey answers go to the team only; nobody else sees them.

::widget{id="next-post-survey"}

A demo from an allowed host runs in a sandbox, and only after you ask for it.

::widget{id="pen-demo"}

## Wrapping up

Directives inside code stay code:

```md
::widget{id="screens"}
```

::widget{id="install"}

That is the whole format. Blocks that the body never places follow the conclusion.
