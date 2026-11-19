---
title: Built-in tools, MCP servers and hooks
description: Turn built-in tools on or off for the workspace, connect MCP servers and grant their tools, run hooks on agent events, and set up packages and voice.
section: console
order: 7
screens: [tools, mcp-servers, hooks]
updated: 2026-10-14
---

Tools are how agents act: search the web, read files, call an API. dewee starts from default-deny, so an agent can only use a tool once you allow it. This page covers the three areas that decide what agents can call and what runs around those calls, plus the **Runtime packages** and **Voice** areas.

## Who can use it

| Area | Permission key |
|---|---|
| Built-in tools | `settings.manage` |
| Voice (TTS & STT) | `tts.manage` |
| MCP servers, Hooks | `integrations.manage` |
| Runtime packages | `packages.install` |

The workspace owner and the built-in Admin role hold all of them. Speech-to-text settings are limited to workspace admins. See [Members, roles and API keys](/docs/console/members-roles-and-api-keys).

## Built-in tools

**Built-in Tools** lists the tools that ship with the runtime, grouped in collapsible categories. Search by name or category. Each row shows the tool's risk (**High risk**, **Medium risk** or **Low risk**), whether its setting is the **Default** or an **Override** for this workspace, and a switch to enable it. Agents can only call tools that are enabled here.

::shot{id="tools"}

Turning on a tool that can modify files, execute commands or use stored secrets asks you to confirm in an **Enable {name}?** dialog; select **Enable tool**.

Select a tool to open its panel:

- **Access**: the **Enabled** switch, and **Reset to default**, which returns the tool to the runtime default and removes its workspace settings after you confirm **Revert override**.
- **Details**: category, risk level, what the tool requires and its required secrets.
- **Secrets**: which secrets are stored. Secret values are never shown.
- **Configuration**: the tool's settings, when it has any. Some tools have a form, such as the provider chain for web search or media tools; others offer **Advanced: edit as JSON** with a **Settings JSON** field. Select **Save settings** to save them for this workspace, or **Clear workspace settings** to go back to the runtime default settings without changing whether the tool is enabled.
- **Technical details**: the tool ID and config status.

## MCP servers

An MCP server adds tools from outside dewee, such as GitHub or a ticketing system. The **MCP Servers** page has two tabs: **Installed**, the servers in your workspace, and **Marketplace**, which has no catalog connected yet and offers to add a custom server instead. A connected server stays unavailable to agents until you grant it.

::shot{id="mcp-servers"}

Servers marked **Built-in** or **Instance-wide** are managed outside the workspace: you can open and test them, but only the operator can change them.

### Add a server

1. Select **Add custom server**.
2. Enter a **Name** (lowercase letters, numbers and hyphens) and, optionally, a **Display name**.
3. Pick the **Transport**. **stdio** runs a **Command** with **Arguments**, **Environment variables** and **Secret environment variables**. **Streamable HTTP** and **SSE** take a **URL** and **Headers**.
4. Optionally set a **Tool prefix** and the **Timeout (seconds)**, from 1 to 600, and leave **Enabled** on.
5. For Streamable HTTP and SSE, choose the **Authentication**: **API key and headers** sends a static key and headers with every request; **OAuth** signs in with the server's authorization provider. For OAuth, keep the **Registration mode** on **Auto (Recommended)** unless the server needs otherwise, and add a **Client ID**, **Client secret** or **Requested scopes** if it asks for them.
6. Where the dialog offers it, select **Test connection** to check the server before saving, then select **Add server**.

The server's page opens. If it uses OAuth, it opens on the **Credentials** tab: select **Authorize** and finish signing in with the provider. Saved values for headers and secret variables are masked.

### Server tabs

- **Overview**: status, connection details and authentication. Select **Test connection** to check the saved configuration and discover the server's tools. A banner tells you when the server is disabled, the last test failed or OAuth authorization expired, with **Reauthorize** for the last case.
- **Tools**: every discovered tool and who may call it. Without a grant, a tool is **Denied**. For each tool, **Allow** or **Deny** it per grantee, or **Allow agent** to grant one agent just that tool. **Safe context** approves a read-only tool that agents may run before they plan their work, for example to load rules or playbooks; changing the server's endpoint, command, environment or headers clears these approvals. Run a connection test first if no tools are listed.
- **Access**: grant agents **Use**, and people **Use**, **Edit** or **Manage**. A person's **Edit** (display name and timeout) and **Manage** (also on/off and delete) apply when they change the server through the runtime with their own API key, for example `dewee mcp update`. Each grant shows which tools it allows. **Grant to a team** grants every agent currently in the team; agents added later need their own grant. Grants made per channel or group elsewhere are listed under **Channel and group grants** so you can revoke them. See [Access grants](/docs/security/access-grants).
- **Credentials**: the workspace API key, headers and environment variables, or for OAuth servers the authorization state with **Authorize**, **Reauthorize** and **Disconnect**. Every agent uses these workspace credentials; per-agent credentials are not available. stdio servers use environment credentials, not OAuth.
- **Configuration**: edit the **Profile** and **Connection**, turn the server off, or **Delete server** under **Danger zone**. Deleting removes the server and every grant.
- **Activities**: changes to the server's configuration, access and credentials.

Revoke a grant from the **Access** tab. Turning a server off keeps it configured but unavailable to agents.

## Hooks

A hook runs your own handler when an agent event happens, to allow, block or add context to what comes next.

With `integrations.manage` you can see every hook, its executions and dry-run it; its **Activities** tab also needs permission to read workspace events. Creating, editing, switching on or off and deleting a hook also needs the workspace owner or the Admin role. [Access grants](/docs/security/access-grants) on a hook decide which agents it runs for and who may change it or hand it on with their own API key; they never let anyone change it from the console.

::shot{id="hooks"}

| Event | Blocks the operation? |
|---|---|
| `user_prompt_submit`, `pre_tool_use`, `subagent_start` | Yes: an error or block decision stops it |
| `session_start`, `post_tool_use`, `stop`, `subagent_stop` | No: the hook runs asynchronously |

The list shows each hook's handler, scope, whether it blocks, when it was updated and whether it is on. Filter by **Event**, **Scope** and **Status**.

To add one:

1. Select **New hook**, name it and pick the **Event**.
2. Choose a **Handler**: **Prompt** (a prompt template run on a model; needs a **Tool matcher** or a **Condition**), **HTTP** (an http or https endpoint URL with headers) or **Script** (sandboxed JavaScript, up to 32 KiB).
3. Set the **Scope** to the whole workspace or to selected agents, and set the **Priority**; lower numbers run first.
4. Set the **Timeout**, from 0 to 10,000 ms, and **On timeout**: **Block** or **Allow**.
5. Select **Create hook**.

Select a hook to open its panel, with these tabs:

- **Configuration**: the event, handler, scope, matcher, condition, timeout, last run and last error. Secret values are redacted.
- **Access**: on a hook that runs for selected agents, the agents it runs for (**Runs for**) and the people holding **Edit** or **Manage** on it. Workspace-wide hooks show a notice instead, because only workspace admins can change them.
- **Executions**: past runs with their decision and latency.
- **Dry run**: paste a sample event and select **Run dry test** to see the result without affecting any agent.
- **Activities**: configuration changes to the hook.

Built-in, instance-wide and command hooks set up by the runtime operator are read-only and have no **Dry run** tab. Deleting a hook stops it from running immediately.

> [!WARNING]
> A blocking hook that fails or times out with **On timeout** set to **Block** stops the agent's operation. Test with a dry run before you enable it.

## Runtime packages

**Runtime Packages** has four tabs:

- **Installed**: the packages in the workspace's runtime profile, with **Request a package**. A notice appears when the runtime is out of sync with its profile.
- **Marketplace**: no package catalog is published for workspaces yet, so this tab points you to requesting a package by name.
- **Policy**: the package policy for your deployment mode. On Shared SaaS, packages are curated by the operator for all workspaces. On Dedicated and On-Premises, the runtime is isolated, so the operator can install packages into it directly while the licence is active. In every mode you ask for a new package with **Request a package**: give its type, name, an optional version and why you need it, then select **Request install**. An operator reviews it, and your requests and their progress are listed on the page.
- **CLI**: **CLI credentials** pairs a developer terminal with the workspace runtime. Run the pairing command it shows, then approve the request through **Open pairing inbox**.

Select an installed package to open its page, with the tabs **Overview**, **Access**, **Allowed commands**, **Credentials & env**, **Versions** and **Activities**. On **Access**, a workspace admin uses the **Restricted access** switch to move the package between **Open**, where every agent can use it, and **Restricted**, where only agents granted **Use** can run its commands; code that imports the package as a library is not blocked. GitHub release packages show a notice instead, because their access is set in the runtime. **Allowed commands** and **Credentials & env** show that the runtime does not report this information to the app yet.

## Voice (TTS & STT)

**Voice (TTS & STT)** sets how agents speak and listen on voice channels, in two tabs. On **Text-to-speech**, choose the active provider (OpenAI, ElevenLabs, Edge, MiniMax or Gemini), **Auto-speak** (**Off**, **When the user sent voice** or **Always**), **Max characters** and **Timeout**, and set each provider's key, voice and model. **Test voice** checks the connection and generates a preview with the saved settings. On **Speech-to-text**, which only workspace admins can see, choose the primary and fallback provider (Soniox or ElevenLabs) and set each provider's key, model and language hints. One **Save** bar saves both tabs. API keys are stored encrypted and can only be replaced, not viewed again.

## Related

- [Tools and permissions](/docs/concepts/tools-and-permissions)
- [Hooks](/docs/concepts/hooks)
- [Webhooks and MCP](/docs/api/webhooks-and-mcp)
- [Agents](/docs/console/agents)
- [Support and billing](/docs/console/support-and-billing)
