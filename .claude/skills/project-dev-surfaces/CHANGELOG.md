# Changelog

Rolling window - the last 30 entries, newest first.

## 2026-09-26 (v3)

- The generic surfaces are now synced house templates with managed blocks (`//` markers in JSON), built on the `setup`, `check` and `test` scripts run with `node --run`, plus a synced `.prettierignore`.

## 2026-09-26

- Corrected: Zed needs native `.zed` files; Orca quick commands and agent prompts, and OpenChamber project actions, are installed through the surfaces tool rather than listed in AGENT-SETUP.md. Added one prompt source in `.agents/prompts` with a drift check, OpenCode commands, and a docs server task.

## 2026-09-24

- Created: commands, actions and debug surfaces per tool, the shared setup script contract, cloud agent wiring, and AGENT-SETUP.md in caveman ultra.