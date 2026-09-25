---
title: Members, roles and API keys
description: Invite people to your workspace, decide what each person can do with built-in and custom roles, and create scoped API keys for the CLI, scripts and AI clients.
section: console
order: 12
screens: [members, roles, api-keys]
updated: 2026-09-25
---

A workspace is shared by people and reached by programs. **Members** controls who belongs to the workspace, **Roles** controls what each person may do, and **API keys** lets the CLI, your own code and external AI clients call the workspace without a person signing in.

## Who can use it

| Task | Who |
|---|---|
| Invite members | `members.invite` |
| Create and edit custom roles, invite with a custom role | `roles.manage` |
| Create, rotate and revoke API keys | `api_keys.manage` |
| Invite admins, change or remove owners and admins | Workspace owner only |

## Members

**Members** shows how many members, owners, admins and pending invites the workspace has, then lists each member with their base role, custom roles and status.

::shot{id="members"}

To invite someone:

1. Select **Invite member** and enter one email address.
2. Pick the **Built-in role**: **Member** or **Admin**. Only an owner can invite an admin.
3. Optionally pick a **Custom role**. This needs `roles.manage`.
4. Select **Send invite**. The invite is emailed, and a **Manual invite link** is shown so you can share it yourself.

An invite is valid for 7 days. Under **Invites** you can **Resend** or **Revoke** a pending invite; an expired link needs a new invite.

To change what a member can do, choose their custom roles under **Assign roles** and select **Save**. The change takes effect immediately. **Remove** takes a member out of the workspace: their console access goes first, then their runtime access is revoked.

The workspace always keeps at least one owner. Only an owner can change an owner's or admin's roles, remove an owner or admin, or change their own custom roles.

## Roles

There are three built-in roles, and they cannot be edited:

- **Owner**: can do everything, including the owner-only pages.
- **Admin**: holds every permission key.
- **Member**: holds only the keys granted through their custom roles.

::shot{id="roles"}

To create a custom role:

1. On **Roles**, fill in **Role key**, **Display name** and an optional **Description**. The key uses lowercase letters, numbers, dots, underscores and hyphens, is 2 to 64 characters long, and cannot be `owner`, `admin` or `member`.
2. Tick at least one permission in the matrix.
3. Select **Create role** and confirm.

To edit a role, select **Edit** in **Current roles**. Members who hold it get the new permissions immediately.

If you manage roles without being the owner, you can only grant permissions you hold yourself. The server enforces this when you save.

Each permission is a single key that is either granted or not:

| Group | Keys |
|---|---|
| Commercial | `billing.manage`, `backup.export`, `backup.restore.request` |
| Runtime operations | `provider.manage`, `chat.use`, `sessions.read`, `agents.manage`, `observability.read`, `settings.manage` |
| Collaboration | `members.invite`, `roles.manage`, `teams.manage`, `tasks.manage` |
| Extensions | `api_keys.manage`, `packages.request`, `packages.install`, `skills.manage`, `integrations.manage`, `contacts.manage` |
| Knowledge | `memory.read`, `memory.manage`, `vault.manage`, `storage.manage` |

An **Other** group lists the keys for owner pages on Dedicated and On-Premises. See [Settings and backup](/docs/console/settings-and-backup).

## API keys

**API keys** has four tabs: **Keys**, **Docs** with the API reference and a try-it form, **Examples** with ready-to-copy snippets for cURL, JavaScript, Python, WebSocket and MCP clients, and **Audit**, the history of key changes.

::shot{id="api-keys"}

To create a key:

1. Select **New API key** and enter a **Name**.
2. Choose an **Environment**: Production, Staging, Development or Automation. This is a label to help you tell keys apart.
3. Choose the access:
   - **Read**: read-only access to the workspace API.
   - **Read and write**: read and write access to the workspace API.
   - **MCP read**: lets an AI client such as Claude Code, Cursor, VS Code or Gemini CLI use the workspace's read-only MCP tools.
   - **MCP read and write**: adds the MCP tools that change things.
4. Set the **Expiry**: 1 hour, 1 day, 30 days, 90 days or no expiry.
5. Review, select **Create key**, and copy the value.

The key is shown once. Store it in your secret manager before you close the dialog.

The list shows each key's prefix, scopes, last use, expiry and status: **Active**, **Expiring**, **Expired** or **Revoked**. **Rotate** issues a new value, shown once, and revokes the old one. **Revoke** stops a key immediately, so every client using it stops working. Both actions are recorded under **Audit**.

> [!NOTE]
> MCP keys let outside AI clients call dewee. To let dewee's agents call an outside MCP server instead, add it on [Built-in tools, MCP servers and hooks](/docs/console/tools-mcp-and-hooks).

Creating and rotating keys is limited to 20 an hour, and revoking to 30 an hour. You can create keys once the workspace has finished provisioning.

> [!WARNING]
> Anyone holding a key can act on the workspace within its access. Prefer the narrowest access and a set expiry, and rotate any key you think has leaked.

## Related

- [Authentication](/docs/api/authentication)
- [API overview](/docs/api/overview)
- [Webhooks and MCP](/docs/api/webhooks-and-mcp)
- [Secrets, roles and audit](/docs/security/secrets-roles-and-audit)
- [Multi-tenant isolation](/docs/concepts/multi-tenancy)
