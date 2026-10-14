---
title: Providers and models
description: Connect the LLM providers your agents run on, verify credentials before saving, choose default models and decide which agents may use each provider.
section: console
order: 5
screens: [providers]
updated: 2026-10-14
---

A provider is the LLM service your agents call, such as Anthropic, OpenAI, Google Vertex AI or an OpenAI-compatible gateway. The **Providers & models** page is where you connect providers to the workspace, check their credentials and choose which model each one uses by default. You need at least one connected provider before you can create agents or start a chat.

## Who can use it

Managing providers requires `provider.manage`. The workspace owner and the built-in Admin role hold it; for a Member, grant it through a custom role. See [Members, roles and API keys](/docs/console/members-roles-and-api-keys).

## What you see

A strip at the top counts **Providers**, **Connected** and **Needs attention** (providers missing a credential). The table lists each connected provider with its **Status**, **Default model**, **Base URL**, **Used by** (the number of agents on it) and **Last updated**. Search by name, type or model, and filter by status: **Connected**, **Missing credential** or **Disabled**.

::shot{id="providers"}

Credentials are sent once to the runtime and stored there, encrypted. The console never shows a stored key again: it only reports **Stored securely** or **Missing**.

## Connect a provider

1. Select **Connect provider**.
2. In **Connect a provider**, search the catalog and pick a provider. Each card shows how the provider connects, such as **API key**, **OAuth** or **Service-account JSON**, and a few of its models.
3. The form **Connect {name}** opens. Enter a **Display name** (2 to 80 characters) and paste the credential: an **API key**, or for Vertex AI a **Service-account JSON** plus a **GCP project ID** and **Region**. A pasted credential must be 8 to 4,096 characters.
4. Optionally pick a **Default model**, which agents use when they don't choose their own, and change the **Base URL** if you use a proxy or a self-hosted endpoint.
5. Select **Connect provider**. The credential is verified before it is saved.

If verification fails, the form shows **Couldn't connect the provider** with the reason, and nothing is saved. **Back** returns to the catalog.

### Providers that use OAuth

Some providers, such as ChatGPT, connect with OAuth instead of a key:

1. In the form, select **Continue with {name}**, then **Open provider authorization**.
2. Sign in with the provider in the new tab and approve access.
3. Copy the callback URL the provider returns, paste it into **Callback URL** and select **Connect provider**.

The callback value is cleared once it is used, and it is never shown in the timeline, the table or audit metadata. If you need to start over, select **Restart {name} authorization**. A ChatGPT OAuth provider can route across several accounts: its **Connection** tab shows the **Account pool**, and an agent on it gets a **Routing** tab on the Agents page.

### Providers that need host setup

Claude CLI, Ollama and ACP cannot be connected by pasting a key, because something must already exist on the runtime host: the Claude CLI, a reachable Ollama instance or an ACP proxy endpoint. On Dedicated and On-Premises, their catalog card is marked **Host setup**, and the form lists the **Prerequisites** and the steps **Performed on the runtime host** by an operator. On Shared AaaS they are marked **Unavailable**, because workspaces share a runtime host.

## Manage a provider

Select a row to open the provider's detail. The header has **Edit provider** and **Delete provider**. The detail has five tabs:

- **Overview**: status, default model, base URL, credential state, the agents that use it, and when it was created and updated. **Edit provider** opens a form here to change the **Display name**, paste a **New API key** (leave it empty to keep the stored secret), pick the **Default model**, and switch **Enabled** off. A disabled provider stays configured, but agents can't use it. Select **Save changes** to apply.
- **Models**: the models the provider offers. **Verify** runs a real request with a model, and **Set default** makes it the default. **Use another model** verifies a model ID that is not listed, then makes it the default. This tab also holds **Pricing** overrides, **Reasoning defaults** that agents on this provider inherit, and **Memory embedding**, where you can **Use for memory embedding** with this provider's credential.
- **Connection**: the base URL and credential the runtime uses. **Replace credential** opens the edit form on **Overview**. Change the base URL and select **Save base URL**; the runtime checks the URL before saving it. Under **Connection test**, **Verify connection** reports **Connected** with the response time, or **Failed** with the reason.
- **Access**: which agents may run on the provider. See [Decide which agents can use a provider](#decide-which-agents-can-use-a-provider).
- **Activity**: model calls in the last 30 days, the number of agents using it and the default model, then a feed of **Model calls**, **Failed calls** and **Configuration** changes. **Error traces** opens **Traces** filtered to failed calls for this provider. Below it, **Access activity** shows grant changes, denials and uses.

Each agent picks its own provider and model on its **Profile** tab; see [Agents](/docs/console/agents). The row menu also has **Error traces**.

## Decide which agents can use a provider

A provider is open to every agent in the workspace by default. Only a workspace admin can change that:

1. On the **Access** tab, turn on **Restricted access**.
2. The confirmation **Restrict {name}?** lists the agents that would lose access because they have no **Use** grant. Select **Restrict**.
3. If agents lost access, a dialog lists them. Select **Grant them use** to keep them running, or **Leave restricted**.

Grant **Use** to individual agents on the same tab. Grants made while access is open only take effect once you restrict it. Below the grants, **Used by** lists the agents on this provider, each with **Open agent**. See [Access grants](/docs/security/access-grants).

## Remove a provider

Select **Delete** in the row menu, or **Delete provider** in the detail. The confirmation **Delete {name}?** lists the agents that still use the provider, and you must type its display name before you select **Delete provider**.

> [!WARNING]
> Agents using a deleted provider fail until you assign them another one. Move them to another provider first.

On AaaS, a refunded subscription also turns off provider setup for the workspace; see [Support and billing](/docs/console/support-and-billing).

## Related

- [Providers, fallback and reasoning](/docs/concepts/providers-and-routing)
- [LLM and voice providers](/docs/integrations/llm-providers)
- [Agents](/docs/console/agents)
- [Usage, activity, traces and health](/docs/console/monitoring)
- [Secrets, roles and audit](/docs/security/secrets-roles-and-audit)
