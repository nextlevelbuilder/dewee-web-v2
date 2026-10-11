---
title: Chrome extension
description: "Chat with your dewee agents in Chrome's side panel and answer credential requests without pasting secrets into chat, on Dewee Cloud or a self-hosted gateway."
section: integrations
order: 4
updated: 2026-10-11
---

The [Dewee Chrome extension](https://github.com/nextlevelbuilder/dewee-chrome-ext) (MIT) opens a side panel on the right of Chrome where you chat with your dewee agents. Super Agent is always pinned first. When an agent needs an API key or an OAuth connection, the panel shows a credential card, so you never paste a secret into the chat.

The extension is a thin client. Your dewee server stays in charge of agents, sessions, permissions and the encrypted credential store, and the panel never reads the pages you visit.

## Install

You need Chrome 116 or newer. The extension is not on the Chrome Web Store yet, so you load it yourself:

1. Get the build. Download the zip attached to a release on the repository's [Releases](https://github.com/nextlevelbuilder/dewee-chrome-ext/releases) page and unzip it, or build it from source with `pnpm install` and `pnpm build` (the output is `.output/chrome-mv3`).
2. Open `chrome://extensions` and turn on **Developer mode**.
3. Choose **Load unpacked** and select the unzipped folder (or `.output/chrome-mv3`).
4. Pin the extension, then click its icon or press `Alt+Shift+D` to open the panel.

> [!NOTE]
> The extension needs a matching server: a dewee gateway that serves the browser extension API (`/v1/extension`), or Dewee Cloud with extension sign-in. If your gateway is older, update it before you connect.

## Connect

The first screen, **Connect to Dewee**, offers two modes. You can add more connections later in **Settings** and switch between them from the panel header.

### Dewee Cloud

1. Choose **Dewee Cloud**, optionally give the profile a name, and select **Sign in with Dewee**.
2. Approve access on Dewee. Sign-in uses OAuth with PKCE, so the extension never sees your password.
3. Back in the panel, pick a workspace. Every workspace where you are a member appears; ones that are *suspended* or *not ready* are listed but cannot be selected.

### Self-hosted gateway

1. Ask a gateway operator to allow the extension's origin. The gateway allows no extension by default; add the exact origin to `GOCLAW_ALLOWED_ORIGINS`:

   ```bash
   GOCLAW_ALLOWED_ORIGINS=chrome-extension://poicgajeapmbcilfbeobdfedibiffbbm
   ```

   That id belongs to the release and source builds. A Chrome Web Store build will get its own id.

2. Create a personal API key bound to your user and your tenant, with `operator.read` and `operator.write`:

   ```bash
   dewee api-keys create --name chrome-extension --scopes operator.read,operator.write --tenant-id <tenant> --owner-id <you>
   ```

   A key without an owner and a tenant is refused. See [API authentication](/docs/api/authentication) for scopes.

3. In the panel choose **Self-hosted Gateway**, enter the **Gateway URL** and the **Personal API key**, then select **Connect**. Chrome asks for access to that one address; allow it.

The URL must use HTTPS. Plain HTTP works only for `localhost` and `127.0.0.1`, for development, and the panel warns that the traffic is not encrypted. The extension checks the key with the gateway before saving anything, so a rejected key is never stored.

> [!CAUTION]
> Never use the gateway master token in the extension. The gateway refuses it on these routes, and a personal key limits the panel to what you can do in one tenant.

## Chat

- **Pick an agent.** The agent picker in the header has a **Search agents** box. It lists only active agents you are allowed to chat with, with Super Agent first.
- **Conversations.** Each agent keeps its own conversations. Open **Conversations** to go back to an earlier one, or select **New chat** (`Alt+N`) to start fresh.
- **While a reply streams** you see the agent's thinking and the tools it runs. Select **Stop**, or press `Esc`, to end the reply.
- **History.** Earlier messages load with **Load earlier messages**.
- **When a send fails,** select **Send again** on the failed message. The panel never re-sends on its own.

If you close the panel, or the connection drops while a reply is running, nothing is lost or sent twice. When you come back, the panel asks the server whether the reply is still running, reloads the conversation and any open cards, and shows *Reconnecting to the running reply…* while it catches up.

| Keys | Action |
|---|---|
| `Enter` / `Shift+Enter` | Send / new line |
| `Esc` | Stop the reply |
| `Alt+N` | New chat |
| `/` | Focus the message box |

## Credential cards

When an agent needs a credential, a card appears in the conversation instead of a request to type it into chat.

- **Secret request.** A form that shows where the value will be saved (for example *Saved to AI provider openai*) and whether it adds a new credential or replaces the stored one. Replacing needs an extra **Replace stored credential** step. Type the value and select **Save securely**.
- **OAuth request.** A card that tells you the sign-in happens on the provider's own site. Select **Open Dewee to sign in**, finish there, then select **I have signed in**. Dewee checks on the server that the sign-in actually completed.

What happens to the secret:

- It goes only to the card's respond endpoint on your dewee server, never into the chat, the extension's storage or its logs. The form clears it before the request is even sent.
- Only a person with owner or admin rights in the workspace can submit a card. Other members see the card but cannot answer it.
- The agent receives a credential reference, never the value: *Saved. The agent only receives a reference, never the value.*

The toolbar icon shows a badge with the number of cards waiting in your selected workspace, so you notice a request even with the panel closed.

Setup agents can raise these cards out of the box. Any other agent can ask for a credential only after a workspace owner or admin grants it the `credential_request` capability, with an allowlist of the targets it may ask for (for example one provider type, for creating or updating). Holding the capability never lets an agent read, approve or submit a credential. This capability requires a gateway version that includes it; the policy is managed through the gateway API.

## Where your credentials are kept

By default the extension keeps your Cloud tokens or API key in memory only, and they are cleared when Chrome closes. Tick **Remember on this device** when you connect to keep them on this computer until you sign out or remove the connection. That is convenient, but anyone with access to your Chrome profile could then use them, so leave it off on shared machines.

In **Settings**, each connection has **Verify**, **Sign out** and **Remove**:

- **Sign out** clears the stored credential. For Dewee Cloud it also revokes the sign-in on the server.
- **Remove** signs out, deletes the connection and drops Chrome's access to its address when no other connection uses it.
- A self-hosted API key stays valid on the gateway until it is revoked there. Revoke it in dewee when you stop using the extension or lose the device.

When a credential stops working (expired, revoked or rejected), the panel clears it and asks you to reconnect that same connection. It never switches to another workspace or connection on its own.

## Settings

Open **Settings** with the gear in the panel header.

| Setting | Choices |
|---|---|
| **Language** | Browser default, English or Tiếng Việt |
| **Theme** | System, Light or Dark |
| **Connections** | Add, use, verify, sign out of or remove a connection |

The `Alt+Shift+D` shortcut that opens the panel can be changed at `chrome://extensions/shortcuts`.

## Troubleshooting

| What you see | What to do |
|---|---|
| *Use HTTPS. Plain HTTP works only for localhost.* | Use the gateway's `https://` address. HTTP is only for a gateway on this computer. |
| *Chrome did not grant access to this address…* | Select **Connect** again and allow access when Chrome asks. |
| *Cannot reach the server. Check your connection.* on a self-hosted gateway | Check the URL and your network. If the gateway is reachable, its `GOCLAW_ALLOWED_ORIGINS` probably does not include `chrome-extension://poicgajeapmbcilfbeobdfedibiffbbm`. |
| *This key is not a personal key…* (`owner_binding_required`) | Create a key with both `--tenant-id` and `--owner-id`. |
| *This key is missing a required scope…* (`scope_required`) | The key needs `operator.read` and `operator.write`. A read-only key can read but cannot chat or answer cards. |
| *The API key was rejected or revoked.* / *This profile needs a new API key.* | Create a new personal key and reconnect the profile. |
| *Your Dewee Cloud session ended. Sign in again.* | Select **Sign in with Dewee** again. |
| *Only a person with owner or admin rights can answer this card.* | Ask a workspace owner or admin to answer it. |
| *Your membership in this workspace is suspended.* | Ask a workspace owner to restore your membership. |
| *Not found, or you no longer have access.* | The workspace, agent or conversation is gone or no longer yours. Pick another one. |
| *This conversation is still running.* | Wait for the reply to finish, or select **Stop**. |
| *Too many requests. Try again in …s.* | Wait for the time shown, then try again. |

## Security

- Secrets go only to the card's respond endpoint, never into chat, URLs, logs or the extension's storage.
- The gateway master token is never accepted; self-hosted mode uses a personal key scoped to one tenant.
- Cards come from a fixed list of kinds and are validated before they render. The agent's own text is shown as plain text, and Markdown is sanitized, so an agent cannot draw its own form.
- No remote code, a strict content security policy, and access to one gateway address at a time instead of every site.
- The panel never reads the page you are on.

The reasoning behind these rules is in the repository's [authentication threat model](https://github.com/nextlevelbuilder/dewee-chrome-ext/blob/main/docs/auth-threat-model.md) and [credential request threat model](https://github.com/nextlevelbuilder/dewee-chrome-ext/blob/main/docs/credential-threat-model.md).
