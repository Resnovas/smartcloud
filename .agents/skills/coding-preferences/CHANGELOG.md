# Changelog

- 2026-09-26: Effect repositories install the Effect Language Service (tsconfig plugin, patched tsc via `prepare`, workspace TypeScript in editors) and Effect Dev Tools (extension recommendation, opt-in `EFFECT_DEVTOOLS` layer) by default. See `references/effect.md`.

Rolling window - the last 30 entries, newest first. When you add an entry,
delete anything past the thirtieth. Do not archive: store versions are
immutable, so the full history already exists at no cost. Leave a single
pointer at the bottom naming the cutoff version when you trim.

One terse line per change. If an entry wants a second sentence, that sentence
belongs in a reference file and the line points at it.

## 2026-09-27

- Replaced no AI attribution with AI disclosure per the public AI policy (AI-02 trailers, draft PRs, AI level autonomous) in `references/agent-git.md`.

- Added the two-docs rule (ELI5 human docs and synced ai-docs/LLMS.md for agents) to `references/docs.md`.

- Added one pull request per batch, not per feature (local stacked branches squashed per feature, rebase-merged after review) to `references/agent-git.md`.

## 2026-09-26

- Added one PostHog project per product to `references/telemetry.md`, and one GitHub-linked Linear team per product, with projects, to `references/agent-git.md`.
- Replaced release-please with Nx release for Nx workspaces in `references/ci.md`.

- Replaced Graphiti with the agent knowledge split in `references/docs.md`: Graphify for code (committed per repository, private Cloud workspace across repos), Cognee for memory. Added companion `graphify`.

## 2026-09-25

- Added `Resnovas/.github` as the single source of governance files, and scoped no-AI-attribution to our own agents, in `references/agent-git.md`.

- Added no AI attribution in commits or PRs to `references/agent-git.md`.

## 2026-09-24

- Added companions `project-dev-surfaces` (run, debug and cloud-agent setup surfaces) and `cognee-memory`.

- Added Effect first but never at the cost of functionality to `references/effect.md`, with the current decisions table.
- Added `references/vercel.md` and `references/ai.md`: Vercel deployment priority, agent plugin, Connect, eve, Sandbox, BotID, Workflow, Chat SDK, and the AI SDK alongside Effect AI.

- Added component-first design and replaced Zephyr with self-hosted Module Federation 2.0 and Re.Pack; see `references/ui.md`.
- Moved the feature-flag standard into its own `feature-flags` skill; `references/telemetry.md` points there.
- Made PostHog feature flags mandatory on every application and Odoo module, including offline-first apps.

## 2026-09-21

- Added references for integrations, CI (Nx/Trunk/smartcloud/AI review), local vs online accounting, enterprise auth, docs/agent knowledge, agent-git.

## 2026-09-19

- Migrated from the local `.agents/skills` tree into the store in house style: thin index body over the eight area files.
- Replaced the pointer to a private vault note as source of truth. This skill is now the authoritative published form, since a vault path is unreachable for every agent reading from the store.
- Removed a duplicated Context7 line that appeared twice at the head of each reference file.