---
title: Providers and models
description: Connect the LLM providers your agents run on, verify credentials before saving, choose default models and rotate or remove keys without ever exposing them.
section: console
order: 5
screens: [providers]
updated: 2026-09-25
---

A provider is the LLM service your agents call, such as Anthropic, OpenAI, Google Vertex AI or an OpenAI-compatible gateway. The **Providers & models** page is where you connect providers to the workspace, check their credentials and choose which model each one uses by default. You need at least one connected provider before you can create agents or start a chat.

## Who can use it

Managing providers requires `provider.manage`. The workspace owner and the built-in Admin role hold it; for a Member, grant it through a custom role. See [Members, roles and API keys](/docs/console/members-roles-and-api-keys).

## What you see

The page lists every connected provider with its default model, whether it is enabled, whether a credential is stored, and how many agents use it. Search by provider, model or type. Below the list, the runtime-supported catalog shows every provider you can add and how it is set up.

::shot{id="providers"}

Credentials are sent once to the runtime and stored there, encrypted. The console never shows a stored key again: it only reports **Stored securely** or **Missing**.

## Connect a provider

1. Select **Connect provider**.
2. **Provider**: pick one from the catalog.
3. **Credentials**: enter a display name (2 to 80 characters) and paste the credential. Most providers take an API key. Some need more, for example Vertex AI needs a service-account JSON, a GCP project ID and a region. You can also set a custom API base, or leave it to the runtime default.
4. **Models**: choose the provider's default model, or keep the runtime default. Where the runtime returns a catalog, you see each model's context window and pricing.
5. **Verify**: review the summary and select **Verify and save**. The runtime tests the credential before saving it, and the secret field is cleared from your browser.

If verification fails, nothing is saved and any provider you already had keeps working.

### Providers that use OAuth

Some providers, such as ChatGPT, connect with OAuth instead of a key:

1. In the **Credentials** step, select **Start OAuth**, then **Open provider authorization**.
2. Sign in with the provider in the new tab and approve access.
3. Copy the callback URL the provider returns, paste it into **Callback URL** and select **Complete OAuth**.

The callback value is never shown in the timeline, the table or audit metadata. An agent can route across several ChatGPT OAuth accounts; its **Routing** tab on the Agents page shows that pool.

### Providers that need host setup

Claude CLI, Ollama and ACP cannot be connected by pasting a key, because something must already exist on the runtime host: the Claude CLI, a running Ollama instance or an ACP proxy endpoint. On Dedicated and On-Premises, the catalog lists the host steps an operator performs first. On SaaS these providers are not available, because workspaces share a runtime host.

## Change a provider

Select **Open** on a row to edit it:

- **Profile**: change the display name or turn the provider off.
- **Credential**: paste a new key to rotate it (8 to 4,096 characters). Leave the field empty to keep the stored secret.
- **Models**: change the default model.

Each agent picks its own provider and model when you create or edit it in [Agents](/docs/console/agents). Use **Error traces** on a row to open **Traces** filtered to failed calls for that provider.

## Remove a provider

Select **Delete** in the provider's detail. The confirmation tells you how many agents still reference it.

> [!WARNING]
> Before you delete a provider, move the agents that use it to another provider. Otherwise they are left without the model they were set up with.

On SaaS, a refunded subscription also turns off provider setup for the workspace; see [Support and billing](/docs/console/support-and-billing).

## Related

- [Providers, fallback and reasoning](/docs/concepts/providers-and-routing)
- [LLM and voice providers](/docs/integrations/llm-providers)
- [Agents](/docs/console/agents)
- [Usage, activity, traces and health](/docs/console/monitoring)
- [Secrets, roles and audit](/docs/security/secrets-roles-and-audit)
