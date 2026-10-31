---
title: Channels, pairing and contacts
description: Connect messaging platforms to your agents, decide who may talk to them, approve new senders in the pairing inbox, and manage contacts and queued messages.
section: console
order: 9
screens: [channels, connectivity, contacts, pending-messages]
updated: 2026-10-14
---

Channels put your agents where your customers and colleagues already talk: Telegram, Zalo, Slack and other messaging apps. This page covers four areas in the **Connect** group of the menu: **Channels**, where you connect platforms, **Pairing inbox**, where you approve new senders, **Contacts**, where you see who has written in, and **Pending messages**, where queued messages wait.

## Who can use it

| Area | Permission key |
|---|---|
| Channels, Pairing inbox, Pending messages | `integrations.manage` |
| Contacts | `contacts.manage` |

Changing the pairing policy also needs the workspace owner or an admin. See [Members, roles and API keys](/docs/console/members-roles-and-api-keys).

> [!NOTE]
> On AaaS, channels need the Annual plan. Without it the page shows **Messaging Channels are locked**; ask the workspace owner to subscribe in [Support and billing](/docs/console/support-and-billing). On Self-install, connecting channels needs a licence key that the owner activates in the console; see [Install dewee yourself](/docs/get-started/self-install).

## Channels

The list shows each channel with its platform, status, access state and **Owner agent**. Access is **Connected**, **Awaiting consent**, **Credentials stored** or **No credentials**. Search with **Search channels**, filter by **Platform** or **Status**, and select **Configure** on a row to open it. A Zalo OA row has **Connect** or **Reconnect** instead.

::shot{id="channels"}

Supported platforms are Telegram, Discord, Slack, WhatsApp, Zalo OA, Zalo Bot, Zalo Personal, Feishu/Lark and Bitrix24.

To connect one:

1. Select **New channel**.
2. On **General**, enter the **Internal name** (a lowercase slug), the **Display name**, the **Platform** and the **Owner agent** that answers messages. The **Enabled** switch decides whether the channel processes messages.
3. On **Credentials**, paste the platform's tokens, for example the bot token from BotFather for Telegram. Values are stored encrypted and never shown again; leave a stored field blank to keep it.
4. On **Identity & Policies**, set the **DM policy**, the **Group policy** and **Require mention in groups**. More options sit under **Advanced platform settings**.
5. Select **Connect channel**. For Zalo OA the button is **Create & continue setup**: register the generated Callback and Webhook URLs in Zalo, paste the webhook secret, then authorize the Official Account.

The **DM policy** offers **Pairing required**, **Open**, **Allowed list only** and **Disabled**. The **Group policy** offers **Pairing approval**, **Open**, **Allowed list only** and **Disabled**. On most platforms both default to pairing; Zalo Personal defaults to **Allowed list only**. **Require mention in groups** is on by default. **Task status updates** sets how task progress reaches the channel: **Inherit agent or workspace**, **Off**, **Progress**, **Completion** or **Both**.

### Channel tabs

Open a channel to see all its tabs. **Managers**, **Contexts** and **Passive Memory** ask you to save the channel first, and **Activity** appears only for a saved channel.

- **General**, **Credentials**, **Identity & Policies**: the setup fields above. **Identity & Policies** also links to the **Pairing Inbox**, where pairing requests are reviewed, and to **Contacts**.
- **Managers**: pick a group or topic and a workspace member, then select **Grant manager**. Managers can edit this channel's settings and see its pairing inbox for the group they manage.
- **Contexts**: the groups and topics the channel has seen. A group shows up once the agent is added to it.
- **Passive Memory**: lets the agent learn from channel conversations. Turn on **Enable passive memory**, which is off by default. Keep **Review mode** on **Manual review** so you approve each extracted item, or pick **Auto-save**. You can also set the scan interval, limits, **Types to capture** and **Exclusions**, then **Save memory settings**. **Run extraction** starts a scan now. See [Memory, knowledge base and storage](/docs/console/memory-and-knowledge).
- **Delivery**: **Reply delivery** overrides how this channel sends replies. Set **Quick acknowledgement** (**Model-generated**, **Sidecar-generated**, **Fixed template** or **Off**), **Intermediate replies** while the agent uses tools, and **Final reply split** for long answers. Anything left on **Workspace default** follows the agent's and workspace's settings.
- **Activity**: the runtime does not report per-channel activity yet. Use [Traces](/docs/console/monitoring) to follow conversations.

Select **Save changes** to save a channel. Turning **Enabled** off keeps its setup but stops it processing messages. **Delete channel** cannot be undone.

> [!WARNING]
> Zalo Personal uses an unofficial protocol, and the Zalo account it signs in with may be locked or banned. Prefer Zalo OA or Zalo Bot where you can.

## Pairing inbox

With pairing on, an unknown sender who messages the agent directly gets a short code instead of an answer. The request waits in the inbox until you decide or it expires.

::shot{id="connectivity"}

1. Under **Pending requests**, check the **Code**, **Channel**, **Sender**, **Agent** and **Expires** columns.
2. Select **Approve** to let the sender talk to the agent, or **Deny** to refuse.
3. To cut off someone later, find them under **Connected senders** and select **Revoke**, then **Revoke access**. They must request pairing again before the agent replies to them directly.

**Approve** stays turned off when the request cannot be approved here, and hovering it tells you why:

- The request's channel no longer exists in this workspace, was renamed, or is turned off. Fix the channel, then ask the sender to message again for a new code.
- The channel's agent was removed, so approved messages would have nowhere to go. Assign an agent to the channel first.
- The code has expired. The sender needs a new one.
- The request comes from a browser session. Only the gateway operator can approve those.

Approval checks the channel again at the moment you select **Approve**, so a request that changed in the meantime is refused and stays in the list. You can still **Deny** any request.

The **Pairing policy** sets how long a new approval lasts. Under **Scope**, choose **Workspace** for the whole workspace or **Per channel** for one channel. The card shows the policy in effect and where it comes from.

- Set **Expiry** in days, or turn on **Never expire**, then select **Save policy**.
- For a channel, choose **Use workspace policy** or **Override for this channel**.
- At workspace scope, **Reset to platform default** removes the workspace policy.

A new policy applies only to future approvals; existing paired senders keep their expiry.

## Contacts

**Contacts** lists everyone your channels have heard from, with **Name**, **Platform**, **Sender ID**, **Channel**, **State** (**Linked** or **Unverified**), **Last seen** and **Type**. Search with **Search name or sender ID…**, filter by **Platform** or **Contact type**, and use **Refresh** to reload.

::shot{id="contacts"}

The same person often writes from several apps. To combine their identities:

1. Tick the contacts that belong to one person, then select **Merge selected**.
2. In **Merge identities**, under **Merge into**, choose **An existing person** and pick them, or enter their **Person ID**. Or choose **A new name** and type a **New name**.
3. Select **Merge**. Message history stays intact.

To split them again, tick the contacts and select **Unmerge selected**, or select **Unmerge** on one linked row.

## Pending messages

**Pending messages** shows messages waiting for an agent to pick up, grouped by conversation. In a group, these are usually messages sent while the agent waits to be mentioned.

::shot{id="pending-messages"}

Select a queue on the left, or search with **Search queues…**, to read its messages. Select **Compact** to condense the queue now, or **Delete**, then **Delete messages**, to remove them. Deleted messages never reach the agent. This page needs a connected runtime.

## Related

- [Chat channels](/docs/integrations/channels)
- [Agents](/docs/console/agents)
- [Memory, knowledge base and storage](/docs/console/memory-and-knowledge)
- [Chat and sessions](/docs/console/chat-and-sessions)
- [CLI reference](/docs/runtime/cli)
