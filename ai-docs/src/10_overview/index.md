## What smartcloud is

smartcloud is declarative repository automation for GitHub. A repository
describes its policy once, in `.github/smartcloud.yml` (labels, conventions,
reviews, stale and lock sweeps, settings, file sync, notifications and more),
and smartcloud enforces it on every event, reporting what it found as check
runs, one comment and a job summary.

It ships as three surfaces over one runtime:

| Surface       | Package                                 | What it is for                                                                                                                                                        |
| ------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GitHub Action | `apps/action` (`@resnovas/action`)      | Runs on workflow events; the only surface that writes by default.                                                                                                     |
| CLI           | `apps/cli` (`@resnovas/smartcloud`)     | `validate`, `migrate`, `check-commit`, `dry-run`, `plan settings`, `sync`, `doctor`.                                                                                  |
| MCP server    | `apps/mcp` (`@resnovas/smartcloud-mcp`) | The same operations as tools for an agent: `validate_config`, `explain_config`, `dry_run`, `plan_settings`, `check_commit_message`, `explain_rule`, `migrate_config`. |

## Packages and layers

Nx enforces the boundaries in `eslint.config.mjs`: a project depends only on
types at or below its own, and backend and frontend never meet.

| Package                      | Type             | Holds                                                                             |
| ---------------------------- | ---------------- | --------------------------------------------------------------------------------- |
| `conditions`                 | `type_core`      | The condition language: schemas, the `Subject`, a pure evaluator.                 |
| `config`                     | `type_core`      | The config schema, v1 migration, presets (`extends`), lenient decoding.           |
| `integrations.github`        | `type_extension` | The only code that talks to GitHub: the `GitHub` service and its layers.          |
| `integrations.posthog`       | `type_extension` | Telemetry and feature flags, redacted, behind one opt-out.                        |
| `engine`                     | `type_extension` | Event decoding, the `Feature` interface, the runner and the `Report`.             |
| `feature.*`                  | `type_extension` | One package per feature (`labels`, `stale`, `lock`, `sync`, ...).                 |
| `reporting`, `notifications` | `type_extension` | Check runs, the comment and summary; Slack, Discord and Linear.                   |
| `runtime`                    | `type_extension` | What the three surfaces share: the feature list, flags, config loading, dry runs. |
| `apps/*`                     | `type_platform`  | The action, CLI and MCP server.                                                   |

`tests/<name>` mirrors each package file for file, and `ai-docs` (this tree)
may import any package, like the tests.

## How a run flows

1. **Event.** The action reads `GITHUB_EVENT_NAME` and the payload at
   `GITHUB_EVENT_PATH`. `decodeEvent` in `@resnovas/engine` normalises it into
   an `Envelope`: `pullRequest`, `issue`, `comment`, `repository` (push,
   schedule, dispatch, merge queue) or `unsupported`, which is a notice, never
   a failure.
2. **Access.** `accessFor` and `externalRun` in `@resnovas/runtime` decide
   whether the run is restricted (a fork, Dependabot, or only the workflow
   token). A restricted run acts with the workflow token and skips the
   features in `PAT_ONLY_FEATURES` (`settings`, `sync`).
3. **Config.** `loadConfig` reads the first of `CONFIG_CANDIDATES`
   (`.github/smartcloud.yml`, `.yaml`, then the v1 `.github/config.json`),
   migrates v1, resolves every `extends` preset through the same `GitHub`
   service, and drops unknown keys with a warning.
4. **Features.** `selectFeatures` picks from `FEATURES`, feature flags and
   access turn some off, and `runFeatures` runs the rest: each one that handles
   the envelope's kind and is enabled by the config, with the facets its
   conditions need loaded onto the subject, isolated so one failure never stops
   the others.
5. **Report.** `publishReport` in `@resnovas/reporting` writes check runs, one
   updatable comment and the job summary; `notify` sends what is configured.
   Reporting and notifying never fail the run.

`runEvent` in `@resnovas/runtime` is that whole pipeline, and every surface
calls it. Everything goes through the `GitHub` service, which is why the same
run is a dry run under the `DryRun` layer and a test under `GitHubMemory`.

## Rules that explain most of the code

1. **Only `integrations.github` talks to GitHub.** Features take the `GitHub`
   service from context and never import Octokit.
2. **Reporting is not failing.** A feature records findings through `Report`;
   the runner, not the feature, decides what a failure costs.
3. **Unknown config never breaks a run.** Presets from a newer smartcloud must
   still run on an older one: unknown keys and invalid values are dropped with
   a warning (see the config section). Only `smartcloud validate` is strict.
4. **Telemetry names nothing.** Spans, logs, metrics and events carry counts,
   outcomes and fixed names, never titles, logins, paths or repository names.
