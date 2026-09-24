---
title: Support and billing
description: Open support tickets, request runtime packages and reach your operator, then manage the Annual plan, invoices and refunds on a dewee SaaS workspace.
section: console
order: 14
screens: [support, billing]
updated: 2026-09-25
---

**Support** is where you ask for help with your workspace: open a ticket, request a runtime package, or find out how to reach your operator. **Billing** is where a SaaS workspace manages its subscription, invoices and refunds. On Dedicated and On-Premises, access comes from your annual licence instead, so there is no plan to buy here.

## Who can use it

| Area | Who |
|---|---|
| Support, tickets and package requests | `packages.request` |
| Billing: subscribe, invoices, billing portal | `billing.manage`, on SaaS only |
| Refund | Workspace owner only, even if a custom role grants `billing.manage` |

See [Members, roles and API keys](/docs/console/members-roles-and-api-keys).

## Support

Support requests are scoped to your workspace. The page has five panels: **How support works**, **Support tickets**, **New package request**, **Contact your operator** and **When to open a request**.

::shot{id="support"}

### Open a ticket

Use a ticket for account, runtime, privacy, billing or provisioning issues.

1. On **Support**, select **New ticket**.
2. Enter a **Subject** (2 to 160 characters) and a **Description** (10 to 4,000 characters).
3. Select **Create ticket**. The ticket opens on its own page with its number.

**Open ticket center** lists every ticket in the workspace, 20 per page. You can search, filter by status (**Opened**, **Pending** or **Closed**) and sort by newest or oldest. Open a ticket to read the **Conversation** and send a **Reply**. Only replies meant for customers appear here; the operator's internal notes do not.

If the ticket center is not set up for your deployment, the panel says so. Use a package request or contact your operator instead.

**When to open a request** lists the usual reasons: a missing package, a member who cannot reach a feature, onboarding that has shown "Pending" for more than 10 minutes, a charge that does not match your plan, or a data or privacy question.

### Request a runtime package

1. Select **Open package request**.
2. Choose the **Ecosystem**: Python, npm, GitHub binary or System package.
3. Enter the **Package name** and, if needed, a **Version constraint** such as `1.x` or `latest`.
4. Explain the **Reason** in at least 10 characters, and add **Security notes** if the reviewer should know something.
5. Select **Submit request**. The operator reviews it.

The page also says whether runtime package installs are enabled for your workspace, and lists the **Current curated profile**. On SaaS, packages come from a profile the operator curates, so a request is how you get a new one. See [Built-in tools, MCP servers and hooks](/docs/console/tools-mcp-and-hooks).

### Contact your operator

For urgent issues, billing questions or anything outside self-service, contact your operator through the channel they gave you during onboarding. The panel shows your **Runtime tenant** reference; include it in your message. If the runtime is not connected yet, include the workspace ID the panel shows instead. Never paste API keys, licence keys or runtime tokens into a ticket or message.

## Billing

Billing appears on dewee SaaS, where a workspace is either on the free plan or the single **Annual** plan, billed at $500 a year. There is no free trial, and a 14-day refund window applies.

::shot{id="billing"}

> [!NOTE]
> The plan names, prices, usage bars and payment card in this screenshot are sample data. dewee SaaS has one Annual plan; see [Pricing](/pricing) for current prices.

The current plan panel shows **Plan**, **Status**, **Renewal** and **Billing owner**.

### Subscribe

1. Select **Subscribe** on the **Annual plan** card.
2. Complete checkout on the payment page.
3. Back in the console, the page shows **Confirming your subscription**. Access activates once payment is confirmed.

If you leave checkout unfinished, **Resume checkout** takes you back until it expires. Channels need the Annual plan: opening **Channels** on the free plan sends you here, and once the plan is active a link takes you back.

### Manage the subscription

- **Open billing portal** manages an active subscription.
- **Payment failed** means you should select **Update billing details** before the subscription is suspended.
- **Cancelling** means access continues until the current billing period ends. Select **Resubscribe** to keep it.
- **Invoices & receipts**: select **Open invoices & receipts** to download invoices and payment receipts.

When a subscription is **Suspended** or **Refunded**, workspace access is disabled. The page shows the date until which your data is kept before a scheduled purge; select **Re-subscribe** before then to keep it.

### Request a refund

Only the workspace owner sees the **Refund** panel. Within 14 days of subscribing, the owner can ask for a full refund:

1. Check the days remaining in the **Refund** panel.
2. Select **Request refund** and confirm.

Each person can get one self-service refund in total. After the window closes, the panel says so.

> [!WARNING]
> A refund takes effect immediately. Chat, API keys and provider setup are disabled for the workspace as soon as you confirm.

### Dedicated and On-Premises

A workspace that runs on infrastructure you manage shows the plan as **Self-hosted**: billing is handled through your licence, not this page. The **Dedicated runtime** panel's **Open activation** button leads to **License binding**, where the owner binds the annual licence key. See [Settings and backup](/docs/console/settings-and-backup).

## Related

- [Settings and backup](/docs/console/settings-and-backup)
- [Built-in tools, MCP servers and hooks](/docs/console/tools-mcp-and-hooks)
- [Channels, pairing and contacts](/docs/console/channels-and-contacts)
- [Licence activation](/docs/runtime/licence)
- [Choose a deployment](/docs/get-started/deployment-options)
