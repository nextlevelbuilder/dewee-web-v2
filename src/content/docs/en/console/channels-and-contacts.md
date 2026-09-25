---
title: Channels, pairing and contacts
description: Connect messaging platforms to your agents, decide who may talk to them, approve new senders in the pairing inbox, and manage contacts and queued messages.
section: console
order: 9
screens: [channels, connectivity, contacts, pending-messages]
updated: 2026-09-25
---

Channels put your agents where your customers and colleagues already talk: Telegram, Zalo, Slack and other messaging apps. This page covers the four areas in the **Connect** group of the menu: **Channels**, where you connect platforms, **Pairing inbox**, where you approve new senders, **Contacts**, where you see who has written in, and **Pending messages**, where queued group messages wait.

## Who can use it

| Area | Permission key |
|---|---|
| Channels, Pairing inbox, Pending messages | `integrations.manage` |
| Contacts | `contacts.manage` |

Changing the pairing expiry policy also needs the workspace owner or an admin. See [Members, roles and API keys](/docs/console/members-roles-and-api-keys).

> [!NOTE]
> On AaaS, channels need the Annual plan. Without it the page shows a locked banner; ask the workspace owner to subscribe in [Support and billing](/docs/console/support-and-billing).

## Channels

The list shows each channel with its platform, whether it is enabled, its access state and its owner agent. Access is **connected**, **awaiting consent**, **credentials stored** or **no credentials**. Search by name, platform or agent, filter by platform or status, and use **Connect** or **Reconnect** on a row that needs attention.

::shot{id="channels"}

Supported platforms are Telegram, Discord, Slack, WhatsApp, Zalo OA, Zalo Bot, Zalo Personal, Feishu/Lark and Bitrix24.

To connect one:

1. Select **New channel**.
2. On **General**, enter a name (a lowercase slug), a display name, the platform and the **Owner agent** that answers messages.
3. On **Credentials**, paste the platform's tokens, for example the bot token from BotFather for Telegram. Stored secrets are masked; leave a field blank to keep its current value.
4. On **Identity & Policies**, set the **DM policy** and **Group policy**, and whether the agent must be mentioned in groups.
5. Select **Create & continue setup**, then finish any platform sign-in. For Zalo OA, register the generated Callback and Webhook URLs in Zalo, paste the webhook secret, then authorize the Official Account.

The DM and group policies each offer **Pairing required**, **Open**, **Allowed list only** and **Disabled**. Both default to pairing, and **Require mention in groups** is on by default. You can also choose how task status updates reach the channel: inherited, off, progress, completion or both.

After the channel exists, three more tabs open. **Managers** assigns a workspace member to a group or topic the channel has seen, **Contexts** lists those groups and topics, and **Passive Memory** lets the agent learn from channel conversations. Passive memory is off by default; keep **Require review before saving** on so you approve each extracted item. See [Memory, knowledge base and storage](/docs/console/memory-and-knowledge).

Turning a channel off keeps its setup but stops it processing messages. Deleting a channel cannot be undone.

> [!WARNING]
> Zalo Personal uses an unofficial protocol, and the Zalo account it signs in with may be locked or banned. Prefer Zalo OA or Zalo Bot where you can.

## Pairing inbox

With pairing on, an unknown sender who messages the agent directly gets a short code instead of an answer. The request appears here until you decide. A code is valid for 60 minutes.

::shot{id="connectivity"}

1. Under **Pending approvals**, check the code, channel, sender and agent.
2. Select **Approve** to let the sender talk to the agent, or **Deny** to refuse.
3. To cut off someone later, find them under **Connected senders** and select **Revoke**.

The pairing policy sets how long a new approval lasts. Set it for the whole workspace, or pick **Channel override** for one channel. Choose a number of days (30 by default) or **No expire**, then **Save policy**. **Use inherited policy** removes a channel override. A new policy applies only to future approvals; existing paired senders keep their expiry.

## Contacts

**Contacts** lists everyone your channels have heard from: users, groups and topics, with their platform, sender ID, channel, state and when they were last seen. Search by username, display name or sender ID, and filter by platform or contact type.

::shot{id="contacts"}

The same person often writes from several apps. To combine their identities:

1. Tick the contacts that belong to one person.
2. Enter the user ID of an existing person, or leave it empty and type a display name to create a new person.
3. Select **Merge selected**.

To split them again, tick the contacts and select **Unmerge selected**.

## Pending messages

In a group, the agent usually waits for a mention. Messages sent in the meantime are queued here, grouped by conversation, and the agent reads them as context when it is next mentioned. The runtime summarizes long queues on its own.

::shot{id="pending-messages"}

Select a queue on the left to read its messages. Select **Compact** to summarize the queue now, or **Delete** to drop it after a confirmation. This page needs a connected runtime.

## Related

- [Chat channels](/docs/integrations/channels)
- [Agents](/docs/console/agents)
- [Memory, knowledge base and storage](/docs/console/memory-and-knowledge)
- [Chat and sessions](/docs/console/chat-and-sessions)
- [CLI reference](/docs/runtime/cli)
