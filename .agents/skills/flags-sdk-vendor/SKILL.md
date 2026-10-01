---
name: flags-sdk-vendor
description: Vercel Flags SDK vendor routing (npm `flags`, MIT): declaring feature flags as code in Next.js and SvelteKit, adapters (PostHog, OpenFeature and others), precompute, identify/dedupe, Flags Explorer and Toolbar, encrypted flag values. Routes to Vercel's own flags-sdk Agent Skill at a pinned commit and carries the house overrides: PostHog is the provider, OpenFeature is supported by default, Vercel Flags is not the flag store. Use when adding or reading a flag in a Next.js or SvelteKit app, choosing a flag adapter, or wiring OpenFeature. Companion to the `feature-flags` house standard.
license: MIT
---
# Flags SDK vendor routing

A routing layer over Vercel's published Agent Skill for the Flags SDK (npm `flags`, MIT).

**Posture: routing only.** Vercel maintains the skill; fetch it for SDK behaviour. This page carries the house overrides. The policy itself (what goes behind a flag, defaults, clean-up, Odoo, offline) is the `feature-flags` skill.

## The two rules that bite hardest

1. **PostHog is the flag provider.** Use the `@flags-sdk/posthog` adapter, or `@flags-sdk/openfeature` over PostHog's official OpenFeature provider. The vendor skill defaults to `vercelAdapter` and the `vercel flags` CLI; do not create flags in Vercel Flags.
2. **The Flags SDK covers Next.js and SvelteKit only, evaluated on the server.** It has no React Native, Expo or Python support. Elsewhere use OpenFeature with the PostHog provider, or the PostHog SDK directly behind the app's flag helper; see `feature-flags`.

## Source

Repo <https://github.com/vercel/flags>, docs <https://flags-sdk.dev>. Pinned commit `b76dc078e5652be85cc797e6086373f8e1f1b829`.

## How to use

Fetch the vendor skill and only the reference the task needs from `https://raw.githubusercontent.com/vercel/flags/b76dc078e5652be85cc797e6086373f8e1f1b829/skills/flags-sdk/<file>`:

| File | Use for |
|---|---|
| `SKILL.md` | Overview, `flag()` declarations, adapters, precompute, Explorer and Toolbar |
| `references/api.md` | Full API surface |
| `references/nextjs.md` | Next.js App and Pages Router patterns |
| `references/sveltekit.md` | SvelteKit patterns |
| `references/providers.md` | Adapter setup, including PostHog and OpenFeature |

For current API detail use Context7 (`/vercel/flags`).

## House overrides

1. **Provider**: PostHog, per rule 1. OpenFeature is the default integration surface so the provider can be swapped without touching flag call sites.
2. **Secrets**: `FLAGS_SECRET` and PostHog keys come from the secret manager at run time, never a committed or pulled `.env` file.
3. **Package manager**: PNPM, not the npm commands in vendor examples.
4. **Effect**: flag evaluation used from Effect code goes through an Effect service that owns the in-code defaults.

## Companions

- `feature-flags` - the house flag standard this router serves.
- `coding-preferences` - `references/telemetry.md` and `references/vercel.md`.
- `instrument-feature-flags` (ships with the PostHog MCP) - PostHog SDK wiring.

## Maintaining this skill

Keep this thin: the file table, the overrides, the pinned commit. On a sync, move the pin in `.agents/skills-upstream-catalog.yaml` and in the raw URLs together, and re-check the file list.