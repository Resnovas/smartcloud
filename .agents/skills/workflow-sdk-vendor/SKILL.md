---
name: workflow-sdk-vendor
description: Vercel Workflow SDK vendor routing (npm `workflow`, Apache-2.0): durable, resumable TypeScript functions that survive restarts, retry failed steps, suspend without compute while waiting for events or time, and include observability. Runs on Vercel or any infrastructure through Worlds (local, Postgres, Vercel, custom). Routes to Vercel's own workflow Agent Skill at a pinned commit and carries the house overrides, including how it sits with Effect (@effect/workflow, Effect Cluster). Use when a job must outlive a request, pause for a webhook or human approval, run a long AI agent loop, or coordinate multi-step operations over time; or when choosing between Vercel Workflow and Effect's workflow tooling.
license: Apache-2.0
---
# Workflow SDK vendor routing

A routing layer over Vercel's published Agent Skill for the Workflow SDK (npm `workflow`, Apache-2.0).

**Posture: routing only.** Vercel maintains the skill; fetch it for SDK behaviour. This page carries the house overrides.

## The two rules that bite hardest

1. **Vercel Workflow is the durable engine; Effect runs inside the steps.** `@effect/workflow` (0.x, needs Effect Cluster) covers only part of this today, so under the house rule the more complete tool wins. Write each step's logic as an Effect program and run it at the step boundary. Keep Effect's own retry, timeout and concurrency for work that lives inside one step.
2. **One durable engine per service.** Do not run Vercel Workflow and `@effect/workflow` side by side for the same process; two engines means two sources of truth for what has run. Revisit when `@effect/workflow` reaches 1.0 with equivalent observability and hosting.

## Source

Repo <https://github.com/vercel/workflow>. Pinned commit `90cc2c5b4fe608434f90e3b5e923df0c26b74416`.

## How to use

Fetch the vendor skill matching the task from `https://raw.githubusercontent.com/vercel/workflow/90cc2c5b4fe608434f90e3b5e923df0c26b74416/skills/<skill>/SKILL.md`:

| Vendor skill | Use for |
|---|---|
| `workflow` | Writing workflows and steps, hooks, sleeps, retries, streaming, observability |
| `workflow-init` | Adding the Workflow SDK to an existing project |
| `migrating-workflow-v4-to-v5` | Upgrading once v5 leaves beta |

The vendor skill insists on reading the documentation that matches the installed version; follow that, and use Context7 (`/vercel/workflow`) for API detail.

## House overrides

1. **Hosting**: on Vercel use the Vercel World. Off Vercel use the Postgres World on Neon, so local-first and self-hosted deployments keep durable state.
2. **Effect**: per rule 1. Step inputs and outputs cross the boundary through Effect Schema.
3. **Flags**: new or changed workflows ship behind a PostHog flag; see `feature-flags`.
4. **Package manager**: PNPM.

## Companions

- `coding-preferences` - `references/vercel.md` and `references/effect.md`.
- `ai-sdk-vendor` - AI agent loops that run as workflow steps.
- `neon-vendor` - the Postgres World's database.

## Maintaining this skill

Keep this thin. On a sync, move the pin in `.agents/skills-upstream-catalog.yaml` and in the raw URL together, and re-check the Effect comparison in rule 1.