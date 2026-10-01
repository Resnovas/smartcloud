---
name: project-dev-surfaces
description: House standard for how every project is run, debugged and bootstrapped: one-click commands, actions and debug configs for Orca, OpenChamber, Cursor, VS Code, Zed, JetBrains and Codex; one-click agent prompts from one source in .agents/prompts; one idempotent cross-platform setup script; and a machine-only AGENT-SETUP.md so cloud agents (Cursor, Claude Code web, Codex, Copilot) can set up and run the project. Covers .vscode, .zed, .run, orca.yaml, Orca quick commands, OpenChamber project actions, .agents/surfaces.json, .codex/environments, .cursor/environment.json, SessionStart hooks and copilot-setup-steps.yml. Use when creating or onboarding a repo, adding a script, docs server, debug target or agent prompt, or when a cloud agent cannot set up a project. Trigger on 'tasks.json', 'launch.json', 'zed tasks', 'orca.yaml', 'quick commands', 'openchamber', 'copilot-setup-steps', 'setup script', 'run configuration'.
license: MIT
---
# Project dev surfaces

**Posture: standards.** Every project ships ready-made ways to run, test, debug and set itself up, for people and for agents, in every tool that can read them from the repo.

## Synced, not hand-written

The generic surfaces are house templates in `Resnovas/.github` (`templates/`), synced to every repository with managed blocks like the rest of the configuration. Each repository adds only its own entries (dev server, docs server, debug targets, extra prompts) after the `house:local` line, or as extra files for JetBrains `.run/` and `.agents/prompts/`. The synced entries rely on three package scripts every repository must have, `setup`, `check` and `test`, run with `node --run` so npm and pnpm repositories share them, and on the synced `tools/dev/surfaces.mjs`, `tools/dev/open.mjs` and `tools/graphify/graphify`. The JSON files are JSON with comments, so their markers are `//` lines; a local entry may not reuse a synced label, name or id. A synced `.prettierignore` keeps formatters off every synced file.

## The three rules that bite hardest

1. **One source of truth for commands.** Every run, build, test, lint and dev command is a package script or Nx target (or the Odoo equivalent). Editor tasks, Orca tabs, Codex actions and cloud setup files only call those. Logic that lives in a `tasks.json` and nowhere else is a defect.
2. **One idempotent setup script, called by every surface.** `scripts/agent-setup` installs everything a clean machine needs and is safe to run repeatedly. Cursor, Claude Code, Codex, Copilot, Orca and dev containers all call it instead of carrying their own install steps. It must work on Linux, macOS and Windows (write it in Node or TypeScript, or ship `.sh` and `.ps1` twins).
3. **Secrets never go in these files.** They name the variables and where they come from (Proton Pass item, platform secret settings), never the values.

## What every project ships

| Surface | Files | Covers |
|---|---|---|
| Commands | `.vscode/tasks.json` | VS Code and Cursor. Setup, dev, build, test, lint, typecheck, format, docs server, code graph, with a default build and test task |
| Debug | `.vscode/launch.json` | VS Code and Cursor. One config per runnable service plus a compound for the whole stack |
| Zed | `.zed/tasks.json`, `.zed/debug.json` | Always. Zed does not pick up the VS Code files in practice, so mirror the tasks and debug configs natively |
| JetBrains | `.run/*.run.xml` | Shared run and debug configurations for the main commands |
| Orca | `orca.yaml` | `scripts.setup` calls the setup script; `defaultTabs` opens the dev server and an agent tab; `worktree.sharedDirectories` for shared caches |
| Orca quick commands, OpenChamber actions | `.agents/surfaces.json` + `tools/dev/surfaces` `install` | Both apps keep these in per-user settings, so a committed manifest lists them and the setup script registers them |
| Codex desktop | `.codex/environments/environment.toml` | `[setup]` calls the setup script; `[[actions]]` mirror the main commands |
| Agent prompts | `.agents/prompts/*.md` (source), generated `.claude/commands`, `.cursor/commands`, `.opencode/commands` | Reusable agent prompts for recurring jobs such as verify, review or address review; `check` fails on drift |
| Cloud agents | `AGENT-SETUP.md` plus runner files | See `references/cloud-agents.md` |

A repository with a docs site ships a `docs:dev` script and task for local review; one without says so in its README.

## Files

| File | Read it when |
|---|---|
| `references/editor-surfaces.md` | Writing tasks, launch, Zed, JetBrains, Orca, OpenChamber or Codex action files, or agent prompts |
| `references/cloud-agents.md` | Making a repo set up and run in Cursor cloud, Claude Code on the web, Codex cloud or the Copilot coding agent |
| `references/agent-setup-md.md` | Writing `AGENT-SETUP.md`: required sections and the caveman ultra style |
| `CHANGELOG.md` | Recent changes, newest first |

Read these files directly from `.agents/skills/project-dev-surfaces/` in the repository; the published catalogue mirrors them with version history. For field-level detail of each file format use the vendor docs named in the reference files or Context7; this skill records decisions, not schemas.

## Companions

- `coding-preferences` - Nx targets, PNPM, CI, and the cross-platform requirement.
- `feature-flags` - the setup script provisions the PostHog flag configuration like any other dependency.

## Maintaining this skill

Re-check the vendor formats when refreshing; several runners move settings between the repo and their web UI. Mirror every new version into Graphify Cloud memory.
</content>
