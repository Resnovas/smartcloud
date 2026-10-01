---
name: coding-preferences
description: The authoritative TypeScript preferences for all work here: Effect-TS v3 as the foundation (Effect first, never at the cost of functionality), TypeScript over JavaScript, PNPM, FCL-1.0-MIT licensing, Nx module boundaries and tags, Drizzle with Neon, component-first React Native with self-hosted Module Federation, local-first architecture, i18n by default, PostHog telemetry and feature flags, Vercel as the default deployment target, the AI SDK alongside Effect AI, Git subtree vendoring, and testing with @effect/vitest. Also covers integration-module wiring vs core, Nx/Trunk/smartcloud CI with AI advisory PR review, Blnk/Airwallex accounting roles, enterprise auth, docs, Vercel Connect, eve, Sandbox, BotID, Workflow and Chat SDK. Use when writing, reviewing or scaffolding TypeScript, choosing a package, tool, platform or AI library, setting up a project, CI, auth, integrations, deployment, docs, or structure.
---
# Coding preferences

These are decisions, not documentation. They record *what has been chosen* and
*why*. They deliberately do not restate how the underlying libraries work.

**Posture: standards.** This skill is the authoritative published form of
these preferences, and it is what every agent reads. A preference that is not
written down here is not one an agent can be expected to follow, so raise the
gap rather than inferring one.

This body is a thin index. Each area lives in its own bundled file; do not
grow this file.

## The three rules that bite hardest

1. **Never write a library API example into this skill or any of its files.
   Call Context7 instead.** A code sample pasted into a skill was accurate the
   day it was written and has been rotting ever since. Context7 tracks the
   library's current release. This is why the reference files carry
   preferences and rationale but no API examples, and it is the rule most
   easily broken by someone being helpful.
2. **No `any`, ever.** Use `unknown` with a type guard, a precise generic, or
   an Effect Schema or branded type. `strict: true` is not optional. An `any`
   does not fail a build; it silently removes the guarantee the language was
   chosen for.
3. **No existing test is ever deleted.** If the code fails, fix the code. If
   coverage is insufficient, improve the tests. Deleting a failing test
   converts a known defect into an unknown one.

## Files

Load only the one you need.

| File | Read it when |
|------|--------------|
| `references/effect.md` | Writing Effect code, or choosing between an Effect-native tool and another library. Effect-TS v3 as the foundation, Effect first but never at the cost of functionality, style rules, Schema, Platform, Configuration, batching and caching, and testing with `@effect/vitest`. |
| `references/language.md` | Choosing a language or package manager. TypeScript over JavaScript, strictness rules, and PNPM with the workspace protocol. |
| `references/licensing.md` | Creating a new file or repository. FCL-1.0-MIT and the canonical header. |
| `references/architecture.md` | Structuring a system. Nx module boundaries and the tag system, monorepo configuration hierarchy, AI-first design, local-first architecture. |
| `references/data.md` | Touching the database. Drizzle ORM with Effect, over Neon. |
| `references/ui.md` | Building an interface. Component-first design, React Native with Expo, open-source Module Federation, and i18n by default. |
| `references/vercel.md` | Deploying or choosing platform services. Vercel as the default deployment target, the Vercel agent plugin, Connect, eve, Sandbox, BotID, Workflow and Chat SDK. |
| `references/ai.md` | Adding AI. AI SDK alongside Effect AI, PostHog-controlled prompts and agents, which Vercel tool covers which job. |
| `references/telemetry.md` | Instrumenting anything. PostHog as mandatory, which features to deploy, feature flags on every app and Odoo module, and the opt-out. |
| `references/vendoring.md` | Bringing in external source. Git subtree over submodules, why vendored source beats `node_modules` for agents, and pattern files. |
| `references/integrations.md` | Wiring third-party services. Core vs integration modules, one core per vendor, feature hooks, and secrets in config. |
| `references/ci.md` | CI and quality gates. Nx affected pipelines, Trunk merge queue and flaky tests, smartcloud remote CI, and AI advisory review on PRs. |
| `references/accounting.md` | Money and ledger roles. Local-first Blnk-style ledger vs online payment rails (Airwallex and peers), and when each applies. |
| `references/auth.md` | Identity and enterprise auth. SSO, SCIM, MFA, org admin, auth behind integration modules, WorkOS as usual starter. |
| `references/docs.md` | Product and agent documentation. API contracts in d.ts, Docs7 plus Mintlify, Documentation Creator patterns, the agent knowledge system: Graphify for code and memory, and the two-docs rule (ai-docs for agents, ELI5 for people). |
| `references/agent-git.md` | Agent operability and repos. Agent-first shared operations, source-available deps, externals vendoring, brand vs personal GitHub org placement, AI disclosure on our agents' commits and pull requests (the public AI policy), and `Resnovas/.github` as the single source of governance files, and one pull request per batch of work. |
| `CHANGELOG.md` | Recent changes to this skill, newest first. Rolling 30-entry window. |
| `HANDOVER.md` | What is in flight on this skill. Read first when resuming work on it. |

Read these files directly from `.agents/skills/coding-preferences/` in the repository; the published catalogue mirrors them with version history.

## Companions

These stay separate because they are procedures rather than preferences.
Do not restate their content here, and do not restate this there.

- `commit` - commit message convention, evidence prose, and getting the work
  onto the target branch.
- `code-review` - reviewing a change against the repo's standards and against
  what the originating issue asked for.
- `typescript-reviewer` and `react-reviewer` - the review lanes that apply
  these preferences to a concrete diff.
- `neon-vendor` and `convex-vendor` - platform behaviour for the data layer
  chosen here, and for the alternative when a project has chosen it.
- `feature-flags` - the feature-flag standard for every app and Odoo module.
- `ai-sdk-vendor`, `workflow-sdk-vendor`, `chat-sdk-vendor`, `flags-sdk-vendor` - Vercel's own skills behind the house overrides.
- `project-dev-surfaces` - every project ships Commands, Actions and Debug configs for each tool, one idempotent setup script, and a machine-only `AGENT-SETUP.md` for cloud agents.
- `graphify` - the committed per-repository code graph, and the private cross-repo Graphify Cloud workspace.

**Compound Engineering** (`everyinc/compound-engineering-plugin`) is a Cursor/Codex
**plugin**, not a PostHog skill companion. Install it in the IDE when you want its
workflows; do not restate its bundled skills here.

## Maintaining this skill

When resuming work on this skill, read `HANDOVER.md` first, then
`CHANGELOG.md`, then only the reference file the task needs. A new preference
goes in the file for its area and gains a row in the table above; a new area
gets a new file. This body only gains a pointer. Above all, keep API examples
out: if a reference file starts to explain how a library works rather than
which one was chosen and why, that content belongs in Context7, not here. Add
a one-line `CHANGELOG.md` entry on every meaningful change and trim past the
window as you write. Overwrite your `HANDOVER.md` section at the end of a
session and delete it when the work lands. Prefer the smallest edit primitive
(`edits` / `file_edits`) over a full replace, and chain `base_version`.
</content>
