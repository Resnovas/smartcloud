# Editor and tool surfaces

Decisions only. Field-level schemas: VS Code tasks and debugging docs, zed.dev/docs/tasks and /debugger, JetBrains run configuration docs, the Orca source (`src/shared/orca-yaml.ts`), and openai/codex's own `.codex/environments/environment.toml`.

## VS Code and Cursor (`.vscode/`)

- `tasks.json`: one task per package script or Nx target that a person runs by hand. Mark the default build task and the default test task. Add per-OS overrides (`windows`, `linux`, `osx`) instead of assuming a shell. Background tasks (dev servers, watchers) set `isBackground` with a problem matcher so debug configs can wait on them.
- `launch.json`: one configuration per runnable service (API, web, worker, CLI, tests under the debugger), each with a `preLaunchTask` that builds or starts what it needs. Add a compound that starts the whole stack with `stopAll: true`.
- Cursor reads `.vscode/*`; do not duplicate into a Cursor-specific file. Known Cursor gaps (launch `inputs`) mean configs must not depend on interactive inputs.
- Commit a `.vscode/extensions.json` recommending the linters and debug adapters the configs need.

## Zed (`.zed/`)

Always ship `.zed/tasks.json` and `.zed/debug.json`. Zed only falls back to `.vscode/launch.json` when `.zed/debug.json` has no configurations, and in practice showed none of the VS Code tasks, so mirror them natively. Tasks: `label`, `command`, `use_new_terminal`, `reveal`, `hide`, `tags`, with `$ZED_RELATIVE_FILE` and `$ZED_WORKTREE_ROOT`. Debug: `adapter: "JavaScript"` (vscode-js-debug options pass through) with an optional `build: {command, args}` in place of `preLaunchTask`.

## JetBrains (`.run/`)

Store the main run and debug configurations as project files and commit `.run/*.run.xml`. Keep them to the same commands as the VS Code tasks.

## Orca (`orca.yaml`)

- `scripts.setup` runs `scripts/agent-setup` after each worktree is created; `setupAgentStartupPolicy: wait-for-setup` so agents never start on a half-installed tree.
- `defaultTabs`: at least the dev server and one agent tab (for example Claude Code or Codex started in the worktree). This is the only committed way to launch agents in Orca.
- `worktree.sharedDirectories` for large gitignored caches; `.worktreeinclude` for gitignored files that each worktree needs.
- `environmentRecipes` only when the project needs a per-workspace remote environment; see `orca-per-workspace-env`.
- Orca quick commands live in app settings (at most 40 in total, scoped globally or per repo) and cannot be committed, but they can be installed: the surfaces tool calls Orca's runtime RPC over the socket named in `orca-runtime.json` (`repo.list`, `settings.getTerminalQuickCommands`, `settings.updateTerminalQuickCommands` with an upsert or delete mutation). Two kinds: `terminal-command` for each package-script action, and `agent-prompt` (agent `claude`, `codex` or `opencode`) for each prompt that takes no arguments. Ids are prefixed with the repo name so the tool only ever removes its own entries.

## OpenChamber

Project actions live per user in `~/.config/openchamber/projects/path_<base64url(checkout path)>.json` (`projectActions` of `{id, name, command, autoOpenUrl?, openUrl?}`, `projectActionsPrimaryId`). The surfaces tool merges its prefixed entries in and keeps everything else. Never commit `.openchamber/openchamber.json`: OpenChamber migrates it into user settings and deletes it. Its prompt starters are OpenCode commands, so `.opencode/commands` covers them.

## The surfaces tool

`.agents/surfaces.json` is JSON with comments: the managed block holds `repository`, `agents` and the synced `house` actions; the repository's own go in `actions` after the `house:local` line. Each action has `id`, `label`, and either `script` (run as `node --run <script>`) or `command`, plus optional `url` and `primary`. Entry ids are prefixed with the repository name. The synced `tools/dev/surfaces.mjs` has `sync`, `check` and `install [--dry-run]`; the repository's `setup` runs `install` outside CI and never fails on it, and its `check` runs `surfaces.mjs check`. The tool owns `.claude/commands`, `.cursor/commands` and `.opencode/commands`, so a repository's own prompts belong in `.agents/prompts`. A repository with a licence-header check excludes the synced `tools/dev/*.mjs`, which cannot carry a local header. Source: `Resnovas/.github` templates; adopted in `Resnovas/smartcloud`.

## Codex desktop (`.codex/environments/environment.toml`)

`[setup]` calls `scripts/agent-setup`; `[[actions]]` mirror the main tasks (dev, test, lint) with names and icons. This file drives Codex desktop local environments only, not Codex cloud.

## Agent prompts

Each recurring agent job is written once in `.agents/prompts/<name>.md`, with `label`, `description` and optional `argument-hint` frontmatter and `$ARGUMENTS` where it takes input. `surfaces sync` writes the Claude Code (`description`, `argument-hint`), Cursor (body only) and OpenCode (`description`) copies and owns those folders; never edit the copies.

## Odoo projects

The same rules apply with the Odoo commands (start the stack from the compose file, run module tests, update a module) as the source of truth; resolve paths from the compose file rather than hardcoding host paths.