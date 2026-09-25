---
title: Built-in tools, MCP servers and hooks
description: Turn built-in tools on or off for the workspace, connect MCP servers and grant their tools, run hooks on agent events, and set up packages and voice.
section: console
order: 7
screens: [tools, mcp-servers, hooks]
updated: 2026-09-25
---

Tools are how agents act: search the web, read files, call an API. dewee starts from default-deny, so an agent can only use a tool once you allow it. This page covers the three areas that decide what agents can call and what runs around those calls, plus the **Runtime packages** and **Voice** areas.

## Who can use it

| Area | Permission key |
|---|---|
| Built-in tools, Voice (TTS & STT) | `settings.manage` |
| MCP servers, Hooks | `integrations.manage` |
| Runtime packages | `packages.install` |

The workspace owner and the built-in Admin role hold all of them. See [Members, roles and API keys](/docs/console/members-roles-and-api-keys).

## Built-in tools

**Built-in tools** lists the tools that ship with the runtime, grouped by category. Each tool shows what it requires, whether it is enabled, its risk and whether its setting is the **runtime default** or a **tenant override** for this workspace.

::shot{id="tools"}

To change a tool:

1. Open its category and select **Configure**, then **Load config**.
2. Turn **Enabled override** on or off, or choose **Use runtime default**.
3. Edit **Settings JSON** if the tool takes settings.
4. For a tool that can modify files, execute commands or use stored secrets, tick the confirmation box.
5. Select **Save**. Use **Revert override** later to go back to the runtime default.

## MCP servers

An MCP server adds tools from outside dewee, such as GitHub or a ticketing system. A connected server stays unavailable to agents until you grant it.

::shot{id="mcp-servers"}

1. Select **New server** and fill in the **Profile**: a name (lowercase letters, numbers and hyphens), a display name, a tool prefix and a timeout.
2. Pick the transport. **stdio** runs a command with arguments and environment variables, with secret variables kept masked. **SSE** and **Streamable HTTP** take a URL, headers and an optional API key.
3. Save the server. For SSE and Streamable HTTP servers that use OAuth, open the **OAuth** tab, keep the registration mode on **Auto (Recommended)** unless the server needs otherwise, and select **Authorize**.
4. On the **Test** tab, select **Test connection** to check the server and discover its tools.
5. On the **Grants** tab, pick an **Agent**, a **Team** (its current agents) or a **User**, choose allowed or denied tools, and select **Save grant**.

Revoke a grant from the same tab. Turning a server off keeps it configured but unavailable to agents.

## Hooks

A hook runs your own handler when an agent event happens, to allow, block or add context to what comes next. The hooks workbench is in beta.

::shot{id="hooks"}

| Event | Blocks the operation? |
|---|---|
| `user_prompt_submit`, `pre_tool_use`, `subagent_start` | Yes: an error or block decision stops it |
| `session_start`, `post_tool_use`, `stop`, `subagent_stop` | No: the hook runs asynchronously |

To add one:

1. Select **New hook**, name it and pick the **Event**.
2. Choose a **Handler**: **Prompt** (a prompt template run on a model; needs a tool matcher or an if expression), **HTTP** (an http or https endpoint with JSON headers) or **Script** (sandboxed JavaScript, up to 32 KiB).
3. Set the **Scope** to the whole tenant or to selected agents, and set the priority.
4. Set **Timeout (ms)**, from 0 to 10,000, and **On timeout**: **Block** or **Allow**.
5. Select **Create hook**, then use **Dry run** with a sample event to check it. Dry runs are not written to history.

The **History** tab shows past runs, with secret-looking values redacted. Global, built-in and command hooks set up by the runtime operator appear read-only. Deleting a hook stops it from running, but its history stays for audit.

> [!WARNING]
> A blocking hook that fails or times out with **On timeout** set to **Block** stops the agent's operation. Test with a dry run before you enable it.

## Runtime packages

**Runtime packages** shows the package policy for your deployment mode. On AaaS, packages are curated by the operator for all workspaces, so you request new ones through support. On Dedicated and On-Premises, your runtime is isolated, so packages can be installed into it directly while the licence is active, or requested for the operator to review. The **CLI Credentials** tab pairs a developer terminal with the workspace runtime; you approve the pairing in the pairing inbox.

## Voice (TTS & STT)

**Voice (TTS & STT)**, labelled **TTS Providers** in some versions of the menu, sets how agents speak and listen on channels. For text-to-speech, choose the active engine (OpenAI, ElevenLabs, Edge, MiniMax or Gemini), when to synthesize (**Off**, **Inbound voice replies** or **Always synthesize**), a character limit and a timeout, then test the connection or synthesize a preview. For speech-to-text, set a primary and a fallback provider. Provider keys are write-only.

## Related

- [Tools and permissions](/docs/concepts/tools-and-permissions)
- [Hooks](/docs/concepts/hooks)
- [Webhooks and MCP](/docs/api/webhooks-and-mcp)
- [Agents](/docs/console/agents)
- [Support and billing](/docs/console/support-and-billing)
