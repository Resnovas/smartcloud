# Cloud agent setup

Goal: any cloud coding agent can set up, run and test the project on a clean machine without a human. Every runner calls `scripts/agent-setup`; the runner files below only wire it in.

| Runner | Committed in the repo | Set in the vendor UI (document it in `AGENT-SETUP.md`) |
|---|---|---|
| Cursor cloud agents | `.cursor/environment.json`: `install` runs the setup script (must be idempotent); `start` for per-boot work; `terminals` for the dev server with a description the agent reads; `ports`; `egressAllowlist` for required domains | Secrets, snapshots |
| Claude Code on the web | `.claude/settings.json` SessionStart hook (matcher `startup|resume`) that runs the setup script when `CLAUDE_CODE_REMOTE=true`; `.mcp.json`; `CLAUDE.md` pointing at `AGENT-SETUP.md` | Setup script (set it to call `scripts/agent-setup`), environment variables, network level (Trusted by default; add Custom domains the setup needs) |
| Codex cloud | `AGENTS.md` pointing at `AGENT-SETUP.md` (Codex reads AGENTS.md; keep it under 32 KiB) | Setup and maintenance scripts (both call `scripts/agent-setup`), environment variables, secrets (setup phase only), internet access for the agent phase |
| GitHub Copilot coding agent | `.github/workflows/copilot-setup-steps.yml` on the default branch, one job named `copilot-setup-steps` that checks out and runs the setup script (max 59 minutes; only steps, permissions, runs-on, services, snapshot and timeout-minutes are honoured) | Secrets and variables in repo settings |
| Dev containers (people, Codespaces) | Optional `.devcontainer/devcontainer.json` whose `postCreateCommand` runs the setup script | - |

No cloud agent above is documented to honour dev containers, so the setup script, not the dev container, is the contract.

## Setup script contract

- Idempotent: safe on a fresh machine, a cached snapshot and a resumed session.
- Installs pinned runtimes (Node LTS, PNPM, Python and uv where needed), dependencies, and local services (Docker Compose when available), then runs a fast verification (typecheck or a smoke test) and exits non-zero on failure.
- Reads secrets only from environment variables and fails with a clear message naming any that are missing.
- Finishes in about 5 minutes on a clean machine (Claude Code's limit); anything slower moves to a lazily run step documented in `AGENT-SETUP.md`.
- Never needs an interactive prompt.