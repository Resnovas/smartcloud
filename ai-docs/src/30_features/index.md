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

### How sync reads: one archive per side

`packages/feature.sync` reads the template source and the repository's
default branch from one download each, so a run costs the same few requests
however many templates the house adds:

- `readTemplates` resolves the source ref to a commit (`resolveRef`, one
  request) and downloads the source archive at it (`getArchive` with the
  template directory as `path`), taking every regular file with its execute
  bit from the tar mode. `readCurrent` does the same for the target's default
  branch, restricted to the synced `paths`. A full sync run is
  `getRepository`, two `resolveRef`, two `getArchive` and `proposeChanges`,
  asserted in `tests/feature.sync` against a source of 250 and 500 files.
- An archive GitHub cannot serve fails with `ValidationFailed` (over
  `DEFAULT_ARCHIVE_LIMIT`, 64 MiB compressed, or not an archive), `NotFound`
  or `Forbidden` (the token cannot see it). On those three, and only those,
  the side falls back to the old path (`listDirectory`, then `getFile` per
  path, concurrency 8) with a `sync: could not read ... as one archive`
  warning; a `RateLimited` or `Unavailable` surfaces, since the per-file path
  would fail the same way. Both paths give the same templates, files and plan,
  which `previewSync`'s tests check.
- The pull request check (`readWanted`) keeps its old budget or better: it
  lists the template directory, keeps the touched templates, and reads up to
  `ARCHIVE_COST` (2) of them one by one, or all of them from the archive when
  there are more.
- Nothing is configurable here; do not add an option for the fallback.

### Renamed labels: aliases in labelling

A `labels` entry's `aliases` are its old names. Label sync renames a repository
label found under an alias; `applyLabels` also treats an item's label that is
an alias of a decided label as that label, because a pull request run (a fork
above all) can happen before sync has renamed anything:

- Wanted: the current name is added and the old name removed (a label under
  both names loses the old one). The old name is removed only when the add
  succeeded, so a `Forbidden` add never strips the label.
- Unwanted: the old name is removed as well as the current one.
- Current names win: `aliasesOf(config, decidedNames)` drops an alias that is
  the current name of any configured or decided label, and aliases of labels
  no rule decided are ignored. The first entry claiming an alias keeps it.
- Change descriptions say `replacing its old name "..."` and
  `(an old name of "...")`. `withSizeLabels` adds the preset name as an alias
  of a renamed size, so this also keeps one size label on a pull request.

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

### Rule-driven pull request actions: auto-merge

`feature.automerge` is the pattern for a feature that acts on an open pull
request when a keyed rule's `when` group passes. Its section is
`autoMerge: { rules: { <key>: { when, method? } }, disableWhenUnmatched? }`;
the flag is `smartcloud-automerge` and the feature name `automerge`.

- `matchingRule` evaluates the rules in key order and returns the first that
  passes (`method` defaults to `squash`). Declare the rules' facets with
  `requiredFacets`, and read the subject from `FeatureContext.subject`, which
  carries them, not from the envelope.
- Drafts and closed pull requests are skipped. Auto-merge that is already on is
  never changed, whoever turned it on.
- The GitHub calls are shared with the `/automerge` command and live in
  `@resnovas/integrations.github`: `readAutoMerge` (REST `GET /pulls/<n>`:
  node id, state, `auto_merge`), `enableAutoMerge(nodeId, method)`,
  `disableAutoMerge(nodeId)` (GraphQL mutations, so dry runs record them), and
  `autoMergeRefusal`, which names the refusals to explain instead of fail on:
  `notAllowed` (the repository setting is off: warning) and `mergeable` (the
  pull request is in a clean status, nothing to wait for: notice).
- Ownership for turning it off again is proved without storing state: the
  feature keeps one trusted marker comment (`<!-- smartcloud:auto-merge:on -->`
  or `:off`), and only turns auto-merge off when the comment says `on` and its
  author is the login GitHub reports in `auto_merge.enabled_by`.
- Every GitHub failure becomes a finding (`Forbidden` a warning, anything else
  an error), so one pull request never fails the run.

The feature runs only on pull request events; the engine does not decode
`check_suite` or `workflow_run`, so a `checksPass` condition in a rule is only
re-evaluated on the next pull request event. GitHub's auto-merge already waits
for required checks, so rules should not need it.
