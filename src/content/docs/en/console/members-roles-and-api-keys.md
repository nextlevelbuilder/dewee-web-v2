---
title: Members, roles and API keys
description: Invite people to your workspace, decide what each person can do with built-in and custom roles, and create scoped API keys for the CLI, scripts and AI clients.
section: console
order: 12
screens: [members, roles, api-keys]
updated: 2026-10-14
---

A workspace is shared by people and reached by programs. **Members** controls who belongs to the workspace, **Roles** controls what each person may do, and **API keys & docs** lets the CLI, your own code and external AI clients call the workspace without a person signing in.

## Who can use it

| Task | Who |
|---|---|
| Invite members | `members.invite` |
| Create and edit custom roles, invite with a custom role, change a member's custom roles, remove members | `roles.manage` |
| Create, rotate and revoke API keys | `api_keys.manage` |
| Invite admins, change or remove owners and admins | Workspace owner only |

## Members

**Members** counts the workspace's **Members**, **Owners**, **Admins** and **Pending invites**, then has two tabs: **Members** and **Invites**. The **Members** tab lists each person with their **Role** (the built-in role plus any custom roles), when they **Joined** and their **Last sign-in**.

::shot{id="members"}

To invite people:

1. Select **Invite members**.
2. Under **Email addresses**, enter one or more addresses. You can paste a list separated by commas, spaces or semicolons.
3. Pick the **Role**: **Member** or **Admin**. Only an owner can invite an admin.
4. Optionally pick a **Custom role**. This needs `roles.manage`.
5. Select **Send invites**. Each person gets an email with a link to join.

If the deployment cannot deliver invite email, the dialog shows **Share these links yourself** with a copy button for each address. Send each link to the person it belongs to.

An invite is valid for 7 days. The **Invites** tab lists each invite's **Email**, **Role**, **Status** (**Pending**, **Accepted**, **Expired** or **Revoked**), **Delivery** and **Expires**. For a pending invite you can **Resend**, **Copy invite link** or **Revoke**. Revoking asks you to confirm with **Revoke invite**, and the link stops working immediately. An expired link needs a new invite.

To change what a member can do, select **Change custom roles** in their row menu. In **Custom roles for {email}**, tick the roles and select **Save roles**. The change takes effect immediately.

**Remove from workspace** takes a member out of the workspace. Confirm with **Remove member**: their app access is removed first, then their runtime access is revoked. Until the runtime side finishes, the row shows a **Removal** badge.

The workspace always keeps at least one owner. Only an owner can change an owner's or admin's roles, remove an owner or admin, or change their own custom roles.

## Roles

There are three built-in roles. They are shown as cards marked **Built in, read-only**, with how many members hold each:

- **Owner**: full access, including billing, backups, member management and the owner-only pages.
- **Admin**: holds every permission key. Only owners can invite admins or change other admins.
- **Member**: holds only the keys granted through their custom roles.

::shot{id="roles"}

To create a custom role:

1. On **Roles**, select **New role**. The **Create custom role** panel opens.
2. Enter a **Name** (up to 80 characters), a **Role key** and an optional **Description** (up to 280 characters). The key uses lowercase letters, numbers, dots, underscores and hyphens, is 2 to 64 characters long, and cannot be `owner`, `admin` or `member`. It can't be changed later.
3. Tick at least one permission in the matrix.
4. Select **Create role**.

Assign the new role to people from **Members**.

The **Custom roles** table lists each role with its key, permissions and members. The row menu has **Edit** and **Duplicate**. **Delete** is not available for custom roles. When you edit a role that members already hold, **Save changes** first asks you to confirm **Update custom role**, because those members get the new permissions immediately.

If you manage roles without being the owner, the editor shows **Scoped role manager**: you can only grant permissions you hold yourself. The server enforces this when you save.

Each permission is a single key that is either granted or not. The matrix groups them:

| Group | Keys |
|---|---|
| Commercial | `billing.manage`, `backup.export`, `backup.restore.request` |
| Runtime operations | `provider.manage`, `chat.use`, `sessions.read`, `agents.manage`, `observability.read`, `settings.manage` |
| Collaboration | `members.invite`, `roles.manage`, `teams.manage`, `tasks.manage` |
| Extensions | `api_keys.manage`, `packages.request`, `packages.install`, `skills.manage`, `integrations.manage`, `contacts.manage` |
| Knowledge | `memory.read`, `memory.manage`, `vault.manage`, `storage.manage` |
| Other | `system_config.manage`, `import_export.manage`, `workstations.manage` |

The **Other** keys belong to the owner pages on Dedicated and On-Premises. See [Settings and backup](/docs/console/settings-and-backup).

## API keys

**API keys & docs** has four tabs:

- **Keys**: the keys in the workspace.
- **Docs**: **Authentication and limits**, the **Endpoints** with the scope each one needs, **Code samples** for cURL, JavaScript, Python, WebSocket and MCP clients, and **Download OpenAPI spec**.
- **Audit**: the history of key changes, with the time, action, key, actor and request ID.
- **Connect an MCP client**: step-by-step setup for an AI client. See [Connect an MCP client](#connect-an-mcp-client).

::shot{id="api-keys"}

To create a key:

1. Select **Create key** and enter a **Name** (2 to 80 characters).
2. Choose the **Access**. Each option shows its scopes and a risk badge, **standard** or **sensitive**:
   - Under **Operator**, **Read** gives read-only access to the workspace API, and **Read and write** adds write access.
   - Under **MCP (tool access only)**, **MCP read** lets an AI client such as Claude Code, Cursor, VS Code or Gemini CLI use the workspace's read-only MCP tools, and **MCP read and write** adds the MCP tools that change things.
3. Choose an **Environment**: Production, Staging, Development or Automation. This is a label to help you tell keys apart.
4. Set the **Expiry**: 1 hour, 1 day, 30 days, 90 days or **No expiry**. The default is 30 days.
5. Select **Create key**.

**Copy your new API key** shows the full key once. Store it in your secret manager, then tick **I've saved this key somewhere safe** before you close the dialog.

The **Keys** tab shows each key's prefix, scopes, last use, expiry and status: **Active**, **Expiring**, **Expired** or **Revoked**. The row menu has **View details**, **Rotate** and **Revoke**:

- **Rotate** revokes the current key and shows a new one once. Confirm with **Rotate key**, then update every client that uses it.
- **Revoke** stops a key immediately, so every client using it stops working. Type the key's name to confirm, then select **Revoke key**.

Both actions are recorded under **Audit**. A key's scopes come from the access chosen when it was created; to change them, create a new key.

Creating and rotating keys is limited to 20 an hour, and revoking to 30 an hour. You can create keys once the workspace has finished provisioning.

> [!WARNING]
> Anyone holding a key can act on the workspace within its access. Prefer the narrowest access and a set expiry, and rotate any key you think has leaked.

### Connect an MCP client

The **Connect an MCP client** tab lets an AI tool such as Claude Code, Cursor, VS Code or Gemini CLI use this workspace's agent tools. It walks through five steps:

1. **Endpoint status**: the endpoint address, the number of read and write tools, and the limits. A workspace admin can **Enable MCP** or **Turn off MCP** here. Turning it off stops every connected client, but keeps the keys.
2. **Choose an agent**: the agent clients talk to. Leave it empty to use the workspace's default agent.
3. **Issue a key**: a key that only works for MCP. **Read tools** are always included; turn on **Also allow write tools** only if the client needs them. Select **Issue key** and copy the key, which is shown once.
4. **Copy the client config**: pick your client under **MCP clients** and select **Copy config**.
5. **Test the connection**: paste an **MCP key** and select **Test connection**. The test runs the same handshake a client does, and the key isn't stored.

> [!NOTE]
> MCP keys let outside AI clients call dewee. To let dewee's agents call an outside MCP server instead, add it on [Built-in tools, MCP servers and hooks](/docs/console/tools-mcp-and-hooks).

## Related

- [Authentication](/docs/api/authentication)
- [API overview](/docs/api/overview)
- [Webhooks and MCP](/docs/api/webhooks-and-mcp)
- [Secrets, roles and audit](/docs/security/secrets-roles-and-audit)
- [Multi-tenant isolation](/docs/concepts/multi-tenancy)
