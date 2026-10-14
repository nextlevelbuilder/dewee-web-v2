---
title: Settings and backup
description: Change workspace settings with one save bar, see how backups work in your deployment, ask for an export or restore, and use the owner pages.
section: console
order: 13
screens: [settings, backup]
updated: 2026-10-14
---

**Settings** holds the options that apply to the whole workspace, from its name and default time zone to the settings your runtime lets you change. **Backup** shows how your data is protected in your deployment mode and how to ask for an export or a restore. On Dedicated and On-Premises, the workspace owner also gets a few pages for the runtime they run themselves.

## Who can use it

| Area | Who |
|---|---|
| Settings | `settings.manage` |
| Rename the workspace | Workspace owner or admin |
| Backup and export | `backup.export` |
| Restore request | `backup.restore.request` |
| License binding, System configuration, Import / Export, Workstations | Workspace owner, on Dedicated and On-Premises |

See [Members, roles and API keys](/docs/console/members-roles-and-api-keys).

## Settings

**Settings** has a section list on the left and the selected section on the right:

- **General**: the workspace name and reference details.
- **Branding**, **Security**, **Notifications**, **Agent defaults**, **Data retention** and **Decision layer**: your deployment does not report these, so each shows **Not reported yet**.
- **Localization**: the default time zone.
- **Voice**: text-to-speech and speech-to-text settings from the runtime.
- **Channels & pairing**: pairing and task update settings from the runtime.
- **Skills policy**: skill settings from the runtime.
- **Danger zone**: ownership transfer and workspace deletion.
- **More runtime settings**: any other settings the runtime reports. It only appears when there are some.

::shot{id="settings"}

The runtime decides which settings appear in **Voice**, **Channels & pairing**, **Skills policy** and **More runtime settings**, and how they are grouped. Each setting shows whether it is **Overridden for this workspace** or **Inherited from the runtime default**. **Reset to default** clears one override, and **Reset section** clears every override in a group.

Changes across all sections collect in one save bar at the bottom. It shows **Unsaved changes** with **Discard** and **Save changes**. There is no separate save button per section.

### General

**Workspace name** can be changed by the workspace owner or an admin, who select **Save** next to it. Below it you see the **Slug**.

The **Workspace** card shows the **Workspace ID**, the **App edition** (**Hosted (SaaS)** or **Self-hosted**), the **Runtime tenant** with a **Copy reference** button, and the **Onboarding status**. **Access** shows **Your role** and how many members the workspace has, and **Related** links to Members, Roles, API keys and Billing.

### Localization

Pick the **Default time zone** and save it with the save bar. New schedules, and members without their own preference, use this zone. Leave it on **Browser zone** to use each viewer's browser zone. Each person sets their own language on their account page.

### Danger zone

**Transfer ownership** and **Delete workspace** are not done in the app. Both link to **Contact support**.

## Backup

**Backup** explains how backups work in your deployment mode:

- **Shared SaaS**: backups are **Operator-managed**. Export is not self-service: select **Request export via support** so the operator can confirm the request belongs to your workspace.
- **Dedicated (TOSE)** and **On-premises**: backups are **Self-serve**. **Back up now** stays disabled until your operator configures the export endpoint.

::shot{id="backup"}

The page has these cards:

- **Schedule**: shows that the deployment doesn't report a backup schedule or retention.
- **Export and restore history**: the export jobs requested from this workspace during your current session. It stays empty while the export endpoint is not configured.
- **How backups work here**: the **Deployment mode**, **Backup policy**, **Support reference** and whether the **Export endpoint** is **Configured** or **Not configured**.
- **Backup preflight**: checks **Runtime tenant connected**, **Self-service export endpoint** and **Support request route**, each marked **Ready** or **Needs attention**.

Copy the support reference into any request so support can verify it.

### Restore

A restore always goes through support. Select **Request restore** in the header, or **Open restore request** in the **Restore requires approval** banner. The **Restore request** page has no form:

1. **Backup to restore** explains that the deployment doesn't report a list of backups.
2. **Request it through support** shows your **Support reference** and **Workspace**.
3. Select **Open a support ticket** and describe what you want restored. If tickets aren't available, the button is **Go to support**.

Support confirms the plan with you before running it.

> [!WARNING]
> A restore can overwrite workspace data. Make sure a recent backup exists before you ask for one.

## Owner pages on Dedicated and On-Premises

On these deployments the workspace owns its runtime, so the owner gets four more pages. On Shared SaaS they show **Not available in this deployment**, because the platform operator runs the runtime; ask support for changes there. **System configuration** also waits until onboarding is finished.

- **License binding**: enter the **License key** from your order and select **Bind license to this workspace**. The key is used once and never shown again. Binding claims your license but does not use up an activation slot; each runtime machine still activates separately. On a self-hosted install, select **Open hosted customer portal** and bind it there. You reach this page from Billing with **Open activation**.
- **System configuration**: deployment-wide runtime settings. Search with **Search config keys…**; credential values show as **Masked**. Edits wait as pending changes until you select **Review & apply**, then **Apply changes**. They take effect immediately.
- **Import / Export**: the **Export**, **Import** and **History** tabs move agents, teams, skills, MCP servers and providers in or out as runtime archives. To export, enter a **Resource ID**, select **Build export preview**, then **Download archive**. To import, run a **Dry run** first, then **Apply import**. **Credentials aren't included** in archives.
- **Workstations**: the runtime nodes registered to this workspace. **Register workstation** asks for a name and an endpoint. The table shows each node's endpoint, status and when it was **Last seen**.

> [!NOTE]
> Never paste license keys or runtime tokens into a support ticket. Your operator provides license keys after payment.

## Related

- [Choose a deployment](/docs/get-started/deployment-options)
- [Licence activation](/docs/runtime/licence)
- [Install and run the gateway](/docs/runtime/install-and-run)
- [Channels, pairing and contacts](/docs/console/channels-and-contacts)
- [Support and billing](/docs/console/support-and-billing)
