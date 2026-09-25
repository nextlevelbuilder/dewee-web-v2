---
title: Licence activation
description: How a Self-install, Dedicated or On-Premises runtime is bound to your workspace with its annual licence key, and what suspension, expiry and revocation do.
section: runtime
order: 3
updated: 2026-09-25
---

Dedicated and On-Premises runtimes carry an annual licence key; AaaS workspaces do not, because the subscription covers them. The key ties a runtime you operate to the workspace and order it belongs to. It is an entitlement record, not a security boundary: your data stays protected by the gateway token, API keys and roles described in [Security overview](/docs/security/overview).

> [!NOTE]
> Self-install runtimes use the same annual licence key, at $500 per year, to connect channels. Agents, providers and skills work without it. The owner pastes the key into the dashboard to activate it; see [Install dewee yourself](/docs/get-started/self-install).

Licence enforcement is opt-in on the runtime and off by default. It is switched on for licensed deployments with `DEWEE_LICENSE_REQUIRED=1`.

## The steps at a glance

1. **You receive the key.** After your Dedicated or On-Premises order is paid, we issue an annual licence and send you the key. It is shown once, so store it in your secret manager.
2. **The owner binds it to the workspace.** In the console, open **Billing**, then **License binding**, and enter the key. Binding only pairs the order with the workspace; it does not use an activation.
3. **The runtime activates.** The runtime sends the key once to the licence service at `app.dewee.sh`, together with its workspace and instance ID. From then on it uses a runtime credential and never sends the raw key again.
4. **The runtime checks in.** Every five minutes it sends a heartbeat. Business traffic is accepted only while the licence is active.

Only the workspace owner can bind a licence. A workspace that already holds an active licence shows its status instead of the form.

## Configure the runtime

The licence settings are read from environment variables only. The raw key is never read from the config file or the command line.

| Variable | Purpose |
|---|---|
| `DEWEE_LICENSE_REQUIRED` | `1` to require an active licence before the runtime accepts work. Default: off |
| `DEWEE_LICENSE_SERVER` | The licence service, `https://app.dewee.sh` in production. Must be `https://` |
| `DEWEE_LICENSE_RUNTIME_INSTANCE_ID` | A stable name you choose for this deployment: 1 to 128 letters, digits, dots, dashes or underscores |
| `DEWEE_LICENSE_STATE_FILE` | Absolute path where the runtime keeps its activation state |
| `DEWEE_LICENSE_BOOTSTRAP_ADDR` | Address of the activation page. Default: `127.0.0.1:18791` |
| `DEWEE_LICENSE_KEY_FILE` or `DEWEE_LICENSE_KEY_FD` | For unattended activation: a file or file descriptor that holds the key. Use one, not both |
| `DEWEE_LICENSE_WORKSPACE_ID` | The workspace to activate for. Required with `KEY_FILE` or `KEY_FD` |

Keep the state file on persistent storage. In the Docker setup it lives in the data volume the runtime already uses.

## Activate interactively

With licensing required and no activation yet, the runtime starts a small activation page on `127.0.0.1:18791` and holds back all business work: no channels, schedules, webhooks or task recovery run, and `/readyz` reports not ready. The page listens on loopback only, so open it from the host itself or through an SSH or `kubectl port-forward` tunnel.

```bash
docker compose -f docker-compose.yml -f docker-compose.selfhosted.yml -f docker-compose.licensed.yml up -d
```

Open `http://127.0.0.1:18791` and enter the licence key and your workspace ID; the **License binding** page in the console shows the ID. Once the licence service confirms the activation, the page closes, `/readyz` turns ready and the runtime starts its workers.

## Activate unattended

For automated installs, hand the key to the runtime once through `DEWEE_LICENSE_KEY_FILE` or `DEWEE_LICENSE_KEY_FD`, together with `DEWEE_LICENSE_WORKSPACE_ID`. A key file must be a regular file readable only by its owner; the runtime reads it once and deletes it, and refuses to start if it cannot. Feed the key from your secret manager rather than leaving it on disk.

## Heartbeats and grace

The runtime checks in every five minutes with its activation ID and runtime credential. If the licence service cannot be reached, the runtime keeps working for up to 24 hours from the last successful check-in, but never past the end of the licence year. Restarts do not reset that clock.

## Suspension, expiry and revocation

| Status | What the runtime does | How it recovers |
|---|---|---|
| Suspended | Stops accepting work | After we lift the suspension, the owner activates again with the same key through the activation page |
| Activation credential invalid | Stops accepting work | The same way as a suspension |
| Expired | Stops accepting work and drains running jobs | The key cannot be reactivated; contact us to renew |
| Revoked | Stops accepting work and drains running jobs | Permanent; a revoked key never works again |

> [!IMPORTANT]
> Setting `DEWEE_LICENSE_REQUIRED=0` turns enforcement off for that deployment, as a rollback. It does not change the licence's status with us, and it cannot bring back a revoked or expired key.

## Where the licence shows in the console

**License binding**, under **Billing**, shows whether a licence is bound to the workspace, the onboarding status and whether the runtime tenant is connected. The runtime's connection and capacity appear on [Runtime health](/docs/console/monitoring). For renewals, extra runtimes or a changed instance ID, use [Support and billing](/docs/console/support-and-billing) or [contact us](/contact).
