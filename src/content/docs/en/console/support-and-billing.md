---
title: Support and billing
description: Find guidance, open and follow support tickets, request runtime packages, then manage the Annual plan, payment method, invoices and refunds for your workspace.
section: console
order: 14
screens: [support, billing]
updated: 2026-10-14
---

**Support** is where you ask for help with your workspace: find guidance, open a ticket, or request a runtime package. **Billing** is where a dewee AaaS workspace manages its subscription, payment method, invoices and refunds. On Dedicated and On-Premises, access comes from your annual licence instead, so there is no plan to buy here.

## Who can use it

| Area | Who |
|---|---|
| Support, tickets and package requests | `packages.request` |
| Billing: subscribe, payment method, invoices, billing portal | `billing.manage` |
| Refund | Workspace owner only, even if a custom role grants `billing.manage` |

Without `billing.manage`, **Billing** shows **You can’t manage billing**. See [Members, roles and API keys](/docs/console/members-roles-and-api-keys).

## Support

Support requests are scoped to your workspace. The **Support** page has these cards:

- **Guidance topics**: short answers for **Access issue**, **Data or privacy concern**, **Package request**, **Provisioning stuck** and **Unexpected billing charge**. Use **Search guidance…** to filter them.
- **Contact**: how to reach your operator, with a **New ticket** button.
- **Tenant reference**: the reference to quote when you contact support. If the runtime is not connected yet, share your workspace ID instead.
- **Recent tickets**: your latest tickets, with **View all tickets**.
- **Runtime packages**: a link to **Open package request**.

If tickets are not set up for your deployment, the page shows **Tickets are not available**. Use a package request or contact your operator instead.

::shot{id="support"}

Never paste API keys, licence keys or runtime tokens into a ticket or message.

### Open a ticket

1. On **Support**, select **New ticket**.
2. Enter a **Subject** (2 to 160 characters) and a **Description** (10 to 4,000 characters).
3. Select **Submit ticket**. The ticket opens on its own page with its number.

**Tickets** lists every ticket in the workspace, 20 per page. Use **Search tickets…**, filter by **Status** (**Opened**, **Pending** or **Closed**) and sort by **Newest** or **Oldest**.

Open a ticket to read the **Conversation**. Only replies meant for you appear there; the operator's internal notes do not. To answer, type in **Message** under **Reply** (up to 4,000 characters) and select **Send reply**. A closed ticket can't take replies, so open a new ticket if you need more help.

### Request a runtime package

1. Select **Open package request**.
2. Choose the **Ecosystem**: Python, npm, GitHub binary or System package.
3. Enter the **Package name** and, if needed, a **Version constraint**. Leave the constraint empty for the latest stable release.
4. Explain the **Reason** in at least 10 characters, and add **Security notes** if the reviewer should know something.
5. Select **Submit request**. The operator reviews it.

The page also says whether runtime package installs are enabled for your workspace, and lists the **Current curated profile**. On Shared AaaS, packages come from a profile the operator curates, so a request is how you get a new one. See [Built-in tools, MCP servers and hooks](/docs/console/tools-mcp-and-hooks).

## Billing

On dewee AaaS, a workspace is either on the free plan or the single **Annual plan**, billed at $500 a year. There is no free trial, and a 14-day refund window applies.

::shot{id="billing"}

> [!NOTE]
> The plan names, prices, usage bars and payment card in this screenshot are sample data. dewee AaaS has one Annual plan; see [Pricing](/pricing) for current prices.

The page has these cards:

- **Current plan**: the plan and its status, the billing owner, the price, the **Renewal** date, your limits and the features included.
- **Payment method**: select **Update in secure portal** to change it. Before you subscribe, it shows **No payment method yet**.
- **Plans**: compares the free plan and the **Annual plan**. Your plan is marked **Current**, and the Annual plan is marked **Unlocks channels**.
- **Invoices & receipts**: select **Open invoices & receipts** to download invoices and payment receipts.

### Subscribe

1. Select **Subscribe** on the **Annual plan**.
2. Complete checkout on the payment page.
3. Back in the console, the page shows **Confirming your subscription**. Access activates once payment is confirmed.

If you leave checkout unfinished, **Resume checkout** takes you back until it expires. The page shows when your checkout expires. Channels need the Annual plan: opening **Channels** on the free plan sends you here, and once the plan is active a link takes you back.

### Manage the subscription

- **Open billing portal** manages an active subscription.
- **Payment failed** means you should select **Update billing details** before the subscription is suspended.
- **Cancelling** means access continues until the current billing period ends. Select **Resubscribe** to keep it.

When a subscription is **Suspended** or **Refunded**, workspace access is disabled. The page shows the date until which your data is kept before a scheduled purge; select **Re-subscribe** before then to keep it.

### Request a refund

Only the workspace owner sees the **Refund** card. Within the refund window, the owner can ask for a full refund:

1. Check the days remaining in the **Refund** card.
2. Select **Request refund** and confirm.

After the window closes, the card says so.

> [!WARNING]
> A refund takes effect immediately. Chat, API keys and provider setup are disabled for the workspace as soon as you confirm.

### Dedicated and On-Premises

A workspace that runs on infrastructure you manage shows the plan as **Self-hosted**: billing is handled through your licence, not this page. The **Dedicated runtime** card's **Open activation** button leads to **License binding**, where the owner binds the annual licence key. See [Settings and backup](/docs/console/settings-and-backup).

## Related

- [Settings and backup](/docs/console/settings-and-backup)
- [Built-in tools, MCP servers and hooks](/docs/console/tools-mcp-and-hooks)
- [Channels, pairing and contacts](/docs/console/channels-and-contacts)
- [Licence activation](/docs/runtime/licence)
- [Choose a deployment](/docs/get-started/deployment-options)
