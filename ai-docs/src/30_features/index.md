## Features

A feature is one unit of smartcloud behaviour (`labels`, `stale`, `lock`,
`sync`, ...), in its own package `packages/feature.<name>`. The engine owns
everything around it: decoding the event, loading facets, isolation, timing,
tracing and reporting.

### The Feature interface

`Feature` in `@resnovas/engine`:

| Field            | Meaning                                                                                               |
| ---------------- | ----------------------------------------------------------------------------------------------------- |
| `name`           | The id used in findings, check runs, flags (`smartcloud-<name>`) and `--features`.                    |
| `handles`        | The envelope kinds it acts on: `pullRequest`, `issue`, `comment`, `repository`.                       |
| `enabled?`       | Whether the config asks for it, normally "its section is present". Defaults to always.                |
| `facets?`        | The subject facets its conditions need (use `requiredFacets` from `@resnovas/conditions`).            |
| `needsCheckRun?` | Runs only when the job passes `checkRunId`; skipped in a CLI dry run, and fails closed in the action. |
| `run`            | `(context) => Effect<void, unknown, GitHub \| Report>`.                                               |

`FeatureContext` carries the resolved `config`, the `envelope`, the `subject`
with every requested facet loaded, and `checkRunId` when there is one. A
`repository` envelope has no subject: a scheduled sweep lists what it needs
itself (for example `listClosedUnlocked`), and one event kind can mean several
triggers, so check `envelope.event` (`lock` sweeps only on `schedule` and
`workflow_dispatch`, not on `push`).

### Findings and changes

Features never throw and never write a report themselves. They record through
the `Report` service:

- `report.add(finding)`: a `Finding` with `feature`, `rule` (an id such as
  `AI-02` or `lock.sweep`, which `explainRule` and the MCP `explain_rule` tool
  explain), `level` (`error`, `warning` or `notice`), `message`, and optionally
  `link`, `commit`, `path` and `line` (a path and line become an annotation on
  the diff). An `error` fails the feature's check run.
- `report.change({ feature, description })`: something it changed, or would
  change in a dry run.
- `report.measure(fact)`: counts and fixed names for analytics (see the
  telemetry section).

The runner catches every failure and defect a feature raises, records the
feature as failed (its check concludes as failure, so a broken feature can
never pass a required check) and carries on with the others. An item that
fails inside a sweep should be caught and reported as an error finding naming
the item, so the sweep continues: see `sweepLocks`.

### Dry runs and restricted runs are free

A feature calls `GitHub` and nothing else, so it needs no dry-run branch:

- `DryRun` (the action's `dryRun` input, every CLI `dry-run`) passes reads
  through and records writes in `DryRunLog`; writes that return a value return
  a placeholder id `0`.
- `Restricted` (a fork, Dependabot, or only the workflow token) makes every
  call, but records and skips a write GitHub refuses as `Forbidden`.

Keep writes idempotent: find your own marker comment (`<!-- smartcloud:<name> -->`)
and update it, and trust it only when `isTrustedComment` says a bot account or
a `roles.trustedBots` login wrote it, because the marker is public.

### Adding a feature

1. Scaffold `packages/feature.<name>` and `tests/feature.<name>` as in
   AGENTS.md "Adding a package" (`type_extension`, `layer_backend`).
2. Add its config section (see the config section).
3. Export the `Feature` from the package and add it to `FEATURES` in
   `packages/runtime/src/features.ts` (the order is the reporting order), its
   sections to `FEATURE_SECTIONS`, and its flag `smartcloud-<name>` to
   `FEATURE_FLAGS` (a test fails when a feature has no flag).
4. If it needs more than the workflow token can do, add it to
   `PAT_ONLY_FEATURES` in `packages/runtime/src/access.ts` with the reason.
5. Test it through `runFeatures` against the in-memory GitHub, aiming for
   100% coverage (90% is enforced), and document it in `docs/features/` and here.
