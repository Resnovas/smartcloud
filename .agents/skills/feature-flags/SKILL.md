---
name: feature-flags
description: House standard for feature flags: every application and every Odoo module has PostHog feature flags set up, and new behaviour ships behind a flag. Covers what 'set up' means, safe in-code defaults, flag naming and ownership, clean-up of stale flags, offline-first apps (cached flag values), React Native and web clients, module-federated components, and Odoo (server-side evaluation in the shared core module, company as PostHog group). Use when scaffolding a new app or Odoo module, adding a feature or behaviour change, planning a rollout or migration, reviewing a PR that adds behaviour without a flag, or when someone proposes env vars, config files or Odoo system parameters as toggles. Trigger on 'feature flag', 'rollout', 'kill switch', 'toggle', 'gradual release', 'new Odoo module', 'new app'.
---
# Feature flags

**Posture: standards.** Every application and every Odoo module has PostHog feature flags set up. This includes web apps, React Native apps, backends, CLIs with remote behaviour, and Odoo modules. Flags are managed only in PostHog.

This body is a thin index. Details live in the bundled files.

## The three rules that bite hardest

1. **No substitute toggles.** Do not use environment variables, config files, Odoo system parameters or another flag service in place of a PostHog flag. A toggle outside PostHog cannot be targeted, rolled out gradually or audited.
2. **Every flag has a safe default in code.** The default applies when PostHog is unreachable or the flag is missing. Offline-first apps are not exempt: they cache the last evaluated values on the device.
3. **Stale flags are a defect.** Once a rollout is complete, remove the flag and its dead branch, then archive the flag in PostHog.

## Files

Load only the one you need.

| File | Read it when |
|------|--------------|
| `references/standard.md` | Setting flags up in any app, or adding a feature. Provider, OpenFeature, which SDK per runtime, what goes behind a flag, naming, ownership, clean-up. |
| `references/odoo.md` | Working in an Odoo module. Where the client lives, server-side evaluation, the company group. |
| `references/offline-and-federation.md` | Building an offline-first app, a React Native app, or module-federated components. Cached values, cold starts, flags on independently deployed components. |
| `CHANGELOG.md` | Recent changes to this skill, newest first. Rolling 30-entry window. |

Read these files directly from `.agents/skills/feature-flags/` in the repository; the published catalogue mirrors them with version history.

For SDK calls and options, use Context7 (`/vercel/flags`, `/websites/openfeature_dev`, `posthog-js`, `posthog-react-native`, `posthog-node`, `posthog-python`). This skill records decisions, not API usage.

## Companions

- `flags-sdk-vendor` - Vercel's Flags SDK for Next.js and SvelteKit, with the house overrides.
- `coding-preferences` - the wider standard; its `references/telemetry.md` lists feature flags among the PostHog must-haves and points here.
- `instrument-feature-flags` (ships with the PostHog MCP) - SDK wiring mechanics.
- `cleaning-up-stale-feature-flags` (ships with the PostHog MCP) - finding flags that are ready to remove.

## Maintaining this skill

A new requirement goes in the reference file for its area; this body only gains a pointer. Keep API examples out. Add a one-line `CHANGELOG.md` entry on every meaningful change and trim past the window. Prefer `edits` / `file_edits` over a full replace, and chain `base_version`.