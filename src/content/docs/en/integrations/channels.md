---
title: Chat channels
description: "The chat apps dewee agents work in, from Telegram and Slack to Zalo, Pancake and Bitrix24: what each supports, who can talk to an agent, and how mature each is."
section: integrations
order: 1
updated: 2026-09-25
---

A channel connects an agent to a chat app, so people talk to it where they already work. Each connection belongs to one tenant and points at one agent, and a workspace can connect several accounts of the same app. This page is the catalogue; connecting a channel step by step is in [Channels, pairing and contacts](/docs/console/channels-and-contacts).

## Supported channels

| Channel | How it connects | Notes |
|---|---|---|
| Telegram | Bot token, long polling | Status reactions, forum topics with their own settings and tool lists, voice notes, up to 3 concurrent runs per group |
| Slack | Socket Mode, no public URL needed | Bot and app tokens; the answer is edited in place, status reactions, follows up in a thread it has joined without a new mention |
| Discord | Bot gateway connection | A placeholder is edited into the answer; when mentioned in a thread it reads earlier thread messages for context |
| WhatsApp | Direct connection, paired by QR code | Voice-note transcription is off by default because it breaks end-to-end encryption |
| Feishu / Lark | WebSocket or webhook | Replies stream as message cards; optional separate session per thread |
| Zalo OA | Official Account API, webhook | Zalo's upload caps apply: images 1 MB, files 5 MB; larger images are compressed |
| Zalo Bot | Zalo Bot API, polling or webhook | Direct messages only, 2,000 characters per message, images up to 5 MB |
| Zalo Personal | A personal Zalo account | Direct messages and groups default to an allowlist |
| Facebook | Page webhook | Auto-replies to comments and Messenger, and a first private message to a commenter |
| Pancake (pages.fm) | Webhook | Pages on Facebook, Zalo, Instagram and other platforms; inbox and comment replies |
| Bitrix24 | Bot registered on your portal | Several bots can share one portal |

The console's channel form offers Telegram, Discord, Slack, WhatsApp, the three Zalo types, Feishu/Lark and Bitrix24. Facebook and Pancake are connected through the gateway's built-in dashboard or the API; [contact us](/contact) if you need them on a workspace we host.

> [!WARNING]
> Zalo Personal uses an unofficial protocol, not a Zalo API. Zalo may lock or ban the account. Use a dedicated account, never a person's main one.

> [!NOTE]
> Maturity differs by channel. Telegram has been validated in production with real users. Slack, Discord, WhatsApp, Feishu/Lark, Zalo OA and Zalo Personal are implemented but have not yet been tested end to end in production. Try a channel with a small group before you roll it out widely.

## Who can talk to an agent

Each channel has a policy for direct messages and one for groups:

| Policy | Direct messages | Groups |
|---|---|---|
| `pairing` | New senders get a code and wait for approval | Groups wait for approval the same way |
| `allowlist` | Only listed senders | Only listed groups |
| `open` | Anyone | Any group the bot is in |
| `disabled` | No direct messages | No group messages |

The console's channel form starts every channel on `pairing`, except Zalo Personal, which starts on `allowlist`.

A pairing code has 8 characters and is valid for 60 minutes, and an account can have at most three waiting. An admin approves it in the **Pairing inbox** or with `dewee pairing approve`. An approved pairing lasts 30 days by default; the workspace can choose a different period or no expiry, and a single channel can override it.

In groups, the agent answers only when it is mentioned, unless you turn mention gating off. Messages it was not mentioned in are kept as context for when it is. On Telegram, Feishu and Discord, only designated writers can make the agent change files, and on Telegram only they can reset the conversation.

## Messages, media and voice

- **Long answers** are split to fit each app: 4,096 characters on Telegram, 4,000 on Slack and Feishu, 2,000 on Discord and Zalo.
- **Media**: images and files go both ways within each app's limits. Telegram groups several images or files into albums of up to 10.
- **Voice notes** on Telegram, Discord and Feishu are transcribed before the agent reads them, using the speech-to-text providers you configure. WhatsApp transcription stays off until an admin turns it on. Telegram can route voice messages to a separate agent.
- **Replies out loud**: agents can answer with synthesised speech when a voice provider is set up. See [LLM and voice providers](/docs/integrations/llm-providers).

## Commands in chat

On Telegram, people can control the conversation with commands such as `/help`, `/status`, `/stop`, `/stopall`, `/reset` and `/tasks`. Writers are managed with `/addwriter`, `/removewriter` and `/writers` in Telegram, Feishu and Discord groups.

## Sending messages from other systems

To post a message to a channel from your own software, use a `message` webhook: it takes the channel name, the chat ID and the content, with optional media. See [Webhooks and MCP](/docs/api/webhooks-and-mcp). Channel messages that are buffered and waiting for an agent show up in **Pending messages**.
