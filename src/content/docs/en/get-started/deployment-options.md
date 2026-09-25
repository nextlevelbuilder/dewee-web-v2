---
title: Choose a deployment
description: "Compare the four ways to run dewee: Self-install, AaaS on shared cloud, a dedicated runtime on TOSE, or On-Premises set up by us, with prices and trade-offs."
section: get-started
order: 3
updated: 2026-09-25
---

dewee is the same product in every deployment: the same console, the same agents, tools, memory and API. What changes is where the runtime gateway runs, who operates it, what you may install on it, and how it is licensed. This page lays the four options side by side so you can pick one before you start. In Vietnam, we offer Self-install and On-Premises.

## At a glance

| | Self-install | AaaS | Dedicated on TOSE | On-Premises |
|---|---|---|---|---|
| **Runtime runs on** | Your own computer or server | Our shared cloud | Your own isolated runtime on TOSE.sh | Your VPS, server or Mac mini |
| **Price** | Free to install; $500 per year licence to connect channels | $500 per year | $500 per year licence + $99 TOSE credit deposit | From $5K, quoted per project, includes the $500/year licence |
| **Runtime size** | Your hardware, 2 GB RAM minimum | Shared | From 1 vCPU / 2 GB; top up TOSE credits as you grow | Your hardware |
| **Extra packages and CLIs** | Install what you need | Curated set only | Install what you need | Install what you need |
| **Licence key** | Needed to connect channels | None | Yes | Yes |
| **Setup** | You run the install script | Start the same day | Set up on TOSE.sh | 1 to 3 weeks, with our team |
| **Where your data lives** | Your machine or network | Our cloud | Your isolated runtime | Your network only |
| **Offered in Vietnam** | Yes | No | No | Yes |

Prices are also on the [pricing page](/pricing).

## Self-install

You install dewee on your own Mac, Linux machine or server with our install script, as a standalone binary or with Docker, and set everything up yourself in the local dashboard.

- **What you get:** the runtime and its dashboard at `http://localhost:4321`, where you create the owner account, add an LLM provider and build agents. Installing and using agents, providers and skills is free.
- **Licence key:** connecting channels such as Zalo, Telegram, Discord or Slack needs a dewee licence at $500 per year, activated in the dashboard. Early Access takes 50% off the first year for the first 50 licences, until 15 October 2026; see [pricing](/pricing).
- **Trade-offs:** no setup help is included, and updates and backups are yours to run. If you want us to do the install, choose On-Premises.

Choose Self-install when you want to try dewee on your own hardware today, or when you are comfortable operating the runtime yourself. [Install dewee yourself](/docs/get-started/self-install) walks through it.

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

Choose On-Premises when data must not leave your network and you want our team to set it up, or when you want agents to use local models through Ollama inside that network.

> [!TIP]
> Self-installing? [Install dewee yourself](/docs/get-started/self-install) covers the install script and the dashboard. Operating the gateway for On-Premises? [Install and run the gateway](/docs/runtime/install-and-run) lists what the host needs: Docker or a Go build, and PostgreSQL 18 with pgvector.

## Questions to settle before you choose

- **Where must the data live?** If the answer is "inside our network", choose Self-install or On-Premises.
- **Do agents need your own tools?** Custom CLIs, language runtimes or system packages need Self-install, Dedicated or On-Premises.
- **Who will operate the runtime?** AaaS and Dedicated leave hosting to us and TOSE; Self-install and On-Premises put the hardware in your hands, and with Self-install the setup and updates are yours too.
- **How soon do you need it?** AaaS starts the same day, and you can run the Self-install script whenever you are ready; On-Premises is a short project.

Not sure yet? [Talk to us](/contact) and describe your constraints; we will suggest a fit.

## Next steps

- [Install dewee yourself](/docs/get-started/self-install): the Self-install route, step by step.
- [Quickstart](/docs/get-started/quickstart): sign in and get your first agent reply.
- [Licence activation](/docs/runtime/licence): how Self-install, Dedicated and On-Premises runtimes are activated.
- [Security model](/docs/security/overview): what each layer protects, whichever deployment you pick.
