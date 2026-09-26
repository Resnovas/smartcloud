# AGENT-SETUP

Machine-only. People: `README.md`, `AGENTS.md`.

## Needs

- Linux, macOS or Windows.
- Node 24+ (`.nvmrc` = minimum major; `engines.node` `>=24`). Launcher uses nvm or fnm when present.
- pnpm `12.4.2` (`packageManager`). Script provides it: installed pnpm, else corepack, else `npx pnpm@12.4.2`.
- No services, no Docker, no database. Disk about 600 MB with `node_modules`.

## Env

| Var                                                           | Req                                        | Source                                                                                                                                             |
| ------------------------------------------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GITHUB_TOKEN`                                                | optional; setup, build, test never need it | Local: `gh auth token` (runtime falls back to `gh` when unset), or Proton Pass GitHub token item via `pass-cli run`. Cloud: runner secret settings |
| `SMARTCLOUD_COMMITTER_NAME`, `SMARTCLOUD_COMMITTER_EMAIL`     | optional                                   | Override commit identity for `sync` writes; defaults in code                                                                                       |
| `GITHUB_REPOSITORY`, `GITHUB_EVENT_NAME`, `GITHUB_EVENT_PATH` | `pnpm run action` only                     | Sample set in `.vscode/launch.json` and `.run/action-schedule.run.xml`; payload `tools/dev/event.schedule.json`                                    |
| `INPUT_*` (`INPUT_DRYRUN`, `INPUT_CONFIG`, `INPUT_FEATURES`)  | `pnpm run action` only                     | Mirrors `action.yml` inputs. Use `INPUT_DRYRUN=true` locally                                                                                       |
| `CI`                                                          | optional                                   | Set: `pnpm install --frozen-lockfile`                                                                                                              |
| `NX_NO_CLOUD`                                                 | set by script                              | No Nx Cloud                                                                                                                                        |

Never write values into repo files.

## Network

- `registry.npmjs.org` (deps, pnpm via corepack or npx)
- `nodejs.org` (only when nvm or fnm installs Node)
- `github.com`, `api.github.com` (only CLI `dry-run`, `plan`, `sync`, MCP server, action)

## Setup

- `scripts/agent-setup` (Windows: `scripts\agent-setup.cmd`; any OS: `node scripts/agent-setup.ts`). Idempotent. Non-interactive.
- Steps: Node check, pnpm, `pnpm install`, `pnpm nx sync`, `pnpm nx run-many -t build`, `pnpm run cli --version`.
- `--no-build`: stop after `nx sync`.
- Success: last line `agent-setup: ok`. About 20 s warm, few minutes clean.

## Run

| Job               | Cmd                                                                |
| ----------------- | ------------------------------------------------------------------ |
| dev (watch build) | `pnpm run dev`                                                     |
| build             | `pnpm run build`                                                   |
| test              | `pnpm run test` (100% line coverage gate)                          |
| one file          | `pnpm run test:file <path>` (coverage off)                         |
| lint              | `pnpm run lint`                                                    |
| types             | `pnpm run typecheck`, then `pnpm run typecheck:tests`              |
| format            | `pnpm run format` (check: `pnpm run format:check`)                 |
| headers           | `pnpm run headers` (fix: `pnpm run headers:fix`)                   |
| bundle            | `pnpm run bundle` (`dist/index.js`, `apps/cli/release/`)           |
| docs              | `pnpm run docs:reference` (check: `pnpm run docs:reference:check`) |
| all CI            | `pnpm run check`                                                   |
| CLI               | `pnpm run cli <command>` after build                               |
| MCP               | `pnpm run mcp` (stdio; stdout is protocol)                         |
| action            | `pnpm run action` with env above                                   |

No ports. No server. Affected only: `pnpm nx affected -t lint typecheck test build`.

## Verify

- `pnpm run cli --version` prints version.
- Full: `CI=true NX_NO_CLOUD=true pnpm nx run-many -t lint typecheck test build`.

## Runner notes

| Runner          | Repo file                                                           | UI setting                                                                                                                           |
| --------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Cursor cloud    | `.cursor/environment.json`                                          | secret `GITHUB_TOKEN` if GitHub-facing work                                                                                          |
| Claude Code web | `.claude/settings.json` SessionStart hook, `.mcp.json`, `CLAUDE.md` | setup script `scripts/agent-setup`; network Trusted; add Network domains as Custom if blocked; env `GITHUB_TOKEN` optional           |
| Codex cloud     | `AGENTS.md`                                                         | setup and maintenance scripts both `scripts/agent-setup`; secret `GITHUB_TOKEN` optional; agent internet only for GitHub-facing work |
| Copilot         | `.github/workflows/copilot-setup-steps.yml`                         | repo secret or variable `GITHUB_TOKEN` optional                                                                                      |
| Codex desktop   | `.codex/environments/environment.toml`                              | none                                                                                                                                 |
| Orca            | `orca.yaml`                                                         | Quick Commands: `pnpm run check`, `pnpm run test:file <path>`, `pnpm run headers:fix`                                                |

## Breaks

| Break                                       | Cause                           | Fix                                                          |
| ------------------------------------------- | ------------------------------- | ------------------------------------------------------------ |
| `pnpm setup` configures PNPM_HOME, no setup | pnpm builtin wins               | `pnpm run setup`                                             |
| `pnpm docs` opens browser                   | pnpm builtin                    | `pnpm run docs:reference`                                    |
| `Node 24 or newer is required`              | old Node                        | `nvm install` or `fnm use --install-if-missing`, rerun       |
| `corepack: command not found`               | Node 25+ dropped corepack       | none; script falls back to npx                               |
| `Cannot find module .../dist/main.js`       | not built                       | `pnpm run build`                                             |
| test fails `does not meet global threshold` | new code untested               | add specs; never lower threshold or delete test              |
| `Missing or outdated licence header`        | new source file                 | `pnpm run headers:fix`                                       |
| `docs:reference:check` fails                | schema changed                  | `pnpm run docs:reference`, commit result                     |
| `no GitHub token: set GITHUB_TOKEN`         | GitHub-facing command, no token | export `GITHUB_TOKEN` from secret source, or `gh auth login` |
