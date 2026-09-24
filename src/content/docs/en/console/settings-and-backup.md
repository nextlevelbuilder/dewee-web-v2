---
title: Settings and backup
description: Tune workspace runtime settings and the default time zone, export or restore workspace data, and use the owner-only pages on Dedicated and On-Premises.
section: console
order: 13
screens: [settings, backup]
updated: 2026-09-25
---

**Settings** holds the options that apply to the whole workspace, from pairing messages to the default time zone. **Backup** shows how your data is protected in your deployment mode and where to ask for an export or a restore. On Dedicated and On-Premises, the workspace owner also gets a few pages for the runtime they run themselves.

## Who can use it

| Area | Who |
|---|---|
| Settings | `settings.manage` |
| Backup and export | `backup.export` |
| Restore request | `backup.restore.request` |
| License binding, System Configuration, Import / Export, Workstations | Workspace owner, on Dedicated and On-Premises |

See [Members, roles and API keys](/docs/console/members-roles-and-api-keys).

## Settings

The page has four sections: **Runtime settings**, **General**, **Access** and **Related**.

::shot{id="settings"}

**Runtime settings** lists the settings your runtime lets a workspace change, in groups:

| Group | What it controls |
|---|---|
| Task status updates | The default for sending task progress to channels: off (the default), progress, completion or both. Agents and channels can narrow or override it. |
| Pairing messages | The message a new sender gets with their pairing code, and the one sent after approval. |
| Text-to-speech | The voice provider, when replies are spoken, and the voice and model per provider. |
| Speech-to-text | The provider that transcribes voice messages. |
| Skills | The maximum skill upload size and how slash commands find skills. |

Each setting shows whether it uses the **Runtime default** or is **Overridden** for this workspace. To change one:

1. Edit the value in its group.
2. Select **Save changes** for that group.
3. To go back to the defaults, select **Reset section**.

Pairing messages can include placeholders. The request message supports `{{senderId}}`, `{{pairingCode}}` and `{{channel}}`; the approval message supports `{{botName}}`, `{{senderId}}` and `{{channel}}`.

**General** shows the workspace ID, the edition (hosted SaaS or self-hosted), the runtime tenant with a **Copy reference** button, and the onboarding status. Set the **Default time zone** here and select **Save time zone**. New schedules, and members without their own preference, use this zone; leave it blank to use each viewer's browser zone.

**Access** shows your role and how many members the workspace has, and **Related** links to Members, Roles, API keys and Billing.

## Backup

**Backup** starts with a summary: deployment mode, backup policy, runtime tenant and whether a self-service export endpoint is set up. How backups work depends on the mode:

- **Shared SaaS**: backups are operator-managed. Exports go through support so the operator can confirm the request belongs to your workspace.
- **Dedicated** and **On-Premises**: backups are self-serve. **Export backup** works once your operator has configured the export endpoint; until then, request the export through support.

::shot{id="backup"}

The **Backup preflight** checks whether the runtime tenant is connected, whether the export endpoint is configured and whether the support route is available. Copy the tenant reference into your request so it can be verified.

To get your data back:

1. Select **Open restore request**.
2. Fill in and submit the request.
3. Wait for review. A restore request starts as a dry run and needs approval from an operator or your local admin before anything is overwritten.

> [!WARNING]
> A restore can overwrite workspace data. Make sure a fresh backup exists before you request one.

**Export and restore history** lists the export jobs requested from this page.

## Owner pages on Dedicated and On-Premises

On these deployments the workspace owns its runtime, so the owner gets four more pages. On Shared SaaS they show **Not available in this deployment**, because the platform operator runs the runtime; ask support for changes there. Each page also waits until onboarding is finished.

- **License binding**: enter the annual license key from your order and select **Bind license to this workspace**. The key is used once and never shown again. Binding claims your entitlement but does not use up an activation slot; each runtime machine still activates separately. On a self-hosted install, bind the key in the hosted customer portal instead.
- **System Configuration**: deployment-wide runtime settings, with credential values masked.
- **Import / Export**: move agent, team, skill and MCP packages in or out, with a dry run before anything is applied.
- **Workstations Admin**: the runtime machines that belong to the workspace.

> [!NOTE]
> Never paste license keys or runtime tokens into a support ticket. Your operator provides license keys after payment.

## Related

- [Choose a deployment](/docs/get-started/deployment-options)
- [Licence activation](/docs/runtime/licence)
- [Install and run the gateway](/docs/runtime/install-and-run)
- [Channels, pairing and contacts](/docs/console/channels-and-contacts)
- [Support and billing](/docs/console/support-and-billing)
