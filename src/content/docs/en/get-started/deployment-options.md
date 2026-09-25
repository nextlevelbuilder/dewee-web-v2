---
title: Choose a deployment
description: Compare the three ways to run dewee (AaaS on our shared cloud, a dedicated runtime on TOSE, or On-Premises on your hardware) with prices and trade-offs.
section: get-started
order: 3
updated: 2026-09-25
---

dewee is the same product in every deployment: the same console, the same agents, tools, memory and API. What changes is where the runtime gateway runs, who operates it, what you may install on it, and how it is licensed. This page lays the three options side by side so you can pick one before you start.

## At a glance

| | AaaS | Dedicated on TOSE | On-Premises |
|---|---|---|---|
| **Runtime runs on** | Our shared cloud | Your own isolated runtime on TOSE.sh | Your VPS, server or Mac mini |
| **Price** | $500 per year | $500 per year licence + $99 TOSE credit deposit | From $5K, quoted per project, includes the $500/year licence |
| **Runtime size** | Shared | From 1 vCPU / 2 GB; top up TOSE credits as you grow | Your hardware |
| **Extra packages and CLIs** | Curated set only | Install what you need | Install what you need |
| **Licence key** | None | Yes | Yes |
| **Setup** | Start the same day | Set up on TOSE.sh | 1 to 3 weeks, with our team |
| **Where your data lives** | Our cloud | Your isolated runtime | Your network only |

Prices are also on the [pricing page](/pricing). In Vietnam, dewee is offered as On-Premises only.

## AaaS (AI as a Service)

Your workspace runs on a hosted, multi-tenant runtime that we operate. Tenant isolation keeps your agents, sessions and memory apart from other customers (see [Multi-tenant isolation](/docs/concepts/multi-tenancy)).

- **What you get:** the hosted runtime gateway, the console at `app.dewee.sh`, agent, channel and skill templates, and role-based access for your team.
- **Billing:** one annual plan at $500 per year. There is no free trial; instead, the workspace owner can ask for a full refund within 14 days. A refund immediately turns off chat, API keys and provider setup for that workspace.
- **Trade-offs:** the infrastructure is shared, and you cannot install your own runtime packages or CLIs; the runtime offers a curated set.

Choose AaaS when you want agents running today and do not need custom packages or control over where the runtime lives.

## Dedicated on TOSE

Each workspace gets its own Docker runtime on [TOSE.sh](https://tose.sh), isolated from other customers, managed from the same console.

- **What you get:** everything in AaaS, plus a runtime that is yours alone, starting at 1 vCPU and 2 GB of memory, where you can install the packages and command-line tools your agents need.
- **Billing:** the $500 per year licence, plus a $99 TOSE credit deposit that pays for hosting. Top up TOSE credits as usage grows.
- **Licence key:** the runtime activates with a licence key bound in the console. See [Licence activation](/docs/runtime/licence).
- **Trade-offs:** a higher running cost than AaaS, and a little more to learn about the runtime.

Choose Dedicated when you need isolation or custom tooling but do not want to run servers yourself.

## On-Premises

The runtime runs on hardware you own, inside your network. Our team does the setup with you.

- **What you get:** the runtime on your VPS or Mac mini, 5 custom workflows built with your team, and 1 year of maintenance and updates. The $500 per year licence is included in the quote, which starts at $5K.
- **Licence key:** a licence-key guard protects the runtime, and per-use billing is switched off.
- **Your data:** conversations, memory, files and provider keys stay in your network.
- **Trade-offs:** setup takes 1 to 3 weeks, and you own and look after the hardware.

Choose On-Premises when data must not leave your network, when you want agents to use local models through Ollama inside that network, or when you are in Vietnam.

> [!TIP]
> Running the runtime yourself? [Install and run the gateway](/docs/runtime/install-and-run) lists what the host needs: Docker or a Go build, and PostgreSQL 18 with pgvector.

## Questions to settle before you choose

- **Where must the data live?** If the answer is "inside our network", only On-Premises fits.
- **Do agents need your own tools?** Custom CLIs, language runtimes or system packages need Dedicated or On-Premises.
- **Who will operate the runtime?** AaaS and Dedicated leave hosting to us and TOSE; On-Premises puts the hardware in your hands.
- **How soon do you need it?** AaaS starts the same day; On-Premises is a short project.

Not sure yet? [Talk to us](/contact) and describe your constraints; we will suggest a fit.

## Next steps

- [Quickstart](/docs/get-started/quickstart): sign in and get your first agent reply.
- [Licence activation](/docs/runtime/licence): how Dedicated and On-Premises runtimes are activated.
- [Security model](/docs/security/overview): what each layer protects, whichever deployment you pick.
