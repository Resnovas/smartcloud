<!--
  Generated from ai-docs/src by tools/ai-docs/docgen.mjs. Do not edit by hand:
  edit the sources and run `node tools/ai-docs/docgen.mjs`.
-->

# @resnovas/smartcloud-workspace for agents

Guidance for an AI agent working on or with this repository, assembled into one
file so it can be read in a single pass. Each example is a real file under
`ai-docs/src`, kept compiling by the repository type check. The people-facing
documentation covers the same ground in plain words; see the README.

---

## House standards

Every Resnovas repository follows the same standards. This section is synced from
[`Resnovas/.github`](https://github.com/Resnovas/.github); the rules come from
`AGENTS.md`, `CONTRIBUTING.md`, `AI_POLICY.md` and the PostHog skill
`coding-preferences`, and those documents win if this summary ever disagrees
with them. The sections after this one describe this repository itself.

### Code

- **Effect-TS v3 first.** TypeScript is the primary language, written with
  Effect v3: services as `Context.Tag` with `Layer`s, `Effect.gen` for
  sequencing, `Schema` to decode anything from outside the process. Load the
  PostHog skill `coding-preferences` and its `effect` reference before writing
  Effect code, and look up current APIs with Context7 rather than from memory.
- **Strict TypeScript, never `any`.** Keep `strict` on. Decode unknown input
  with `Schema` instead of casting it.
- **Typed errors.** Model failures as tagged errors (`Data.TaggedError` or
  `Schema.TaggedError`) in the error channel, so a caller sees every way a call
  can fail. Do not throw for expected failures.
- **Secrets through `Config` and `Redacted`.** Read configuration with
  Effect `Config`, and hold every secret as `Redacted` (`Config.redacted`)
  until the boundary that needs its value. Never put a secret in source, logs,
  telemetry, command-line arguments, issues or pull requests.
- **PostHog telemetry and feature flags.** Every app ships PostHog feature
  flags; new behaviour goes behind a flag with a safe default in code, never
  behind an environment variable or configuration toggle (house skill
  `feature-flags`). Telemetry events carry no secret or personal data.
- **Module boundaries.** The core package holds domain-agnostic building
  blocks only. Vendor SDKs and API clients live in
  `@resnovas/integrations.<vendor>`. Features depend on core and
  integrations, never the other way round (`AI_POLICY.md` AI-13).
- **Comments explain why.** Constraints, trade-offs and anything surprising;
  never a restatement of the code.

### Tests

- Write tests with `@effect/vitest`. Line and branch coverage never falls
  below 90%, and most repositories hold 100%.
- **Never delete, skip or weaken a test** to make a change pass: fix the code
  (`AI_POLICY.md` AI-11). A flaky test is a bug to fix, not to retry away.
- Every bug fix comes with a regression test that fails before the fix.

### Files

- Every source file carries the FCL-1.0-MIT licence header; the repository's
  header check adds and verifies it.
- ASCII hyphen-minus only in text an agent writes: no em or en dashes, and no
  emoji in titles or descriptions (house skill `no-em-or-en-dashes`,
  `AI_POLICY.md` AI-09).

### Commits and pull requests

- Conventional commits (`type(scope): summary`, imperative mood), one logical
  change each, and every commit signed off for the Developer Certificate of
  Origin with the commit author's name and address. An AI tool never signs off
  (`AI_POLICY.md` AI-03).
- In the maintainer's own repositories agents add no AI attribution: no AI
  co-author trailer and no "Generated with" footer (house skill
  `commits-and-rd-evidence`). Outside contributors follow `AI_POLICY.md` AI-02.
- One pull request per batch of work: one stacked branch per issue, each
  squashed to one conventional, signed-off commit naming its issue, all opened
  as a single pull request. Once Jonathan approves it, it lands as an owner
  fast-forward (its signed commits pushed onto the default branch unchanged),
  so each issue keeps its own commit; the merge queue squashes, because GitHub
  cannot sign rebased commits. Run the full gate locally first; CI is not the
  debugger.
- Deterministic gates (the repository's checks and the `smartcloud` check)
  decide a merge. AI review bots are advisory.

### Document everything twice

Every change to a feature, option, preset or workflow updates both kinds of
documentation in the same commit:

- **ELI5 docs for people.** Plain words and short sentences; what it is and why
  you would want it before how; step-by-step setup; one complete example; what
  you will see when it runs; every option with its default; common problems
  and their fixes.
- **ai-docs for agents.** The sections under `ai-docs/src`, with compiling
  examples in the codebase's own style. `LLMS.md` is generated from them by
  `node tools/ai-docs/docgen.mjs` and checked in CI with `--check`; never edit
  it by hand.

---

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

### Running smartcloud for one event

`runEvent` is the pipeline every surface shares: config, features, report,
notifications. Only the `GitHub` service decides where it acts, so this
runs against the in-memory GitHub exactly as the action runs against the
real one.

```ts
import { GitHubMemory } from '@resnovas/integrations.github'
import { runEvent } from '@resnovas/runtime'
import { Effect } from 'effect'

// Config given as text is used as it is; without `text`, runEvent reads the
// first of CONFIG_CANDIDATES from the repository through the GitHub service.
const config = {
  text: { text: 'version: 2\nlabels: { bug: { name: bug, color: d73a4a } }\n', source: '.github/smartcloud.yml' },
}

export const example = runEvent({
  config,
  // Omit `features` to run every feature; a name that does not exist fails
  // with UnknownFeatures rather than being ignored.
  features: ['labels'],
  // As GitHub sends it: the event name and the payload.
  event: { name: 'schedule', payload: {} },
}).pipe(
  Effect.map(({ result, published, warnings }) => ({
    ran: result.ran,
    skipped: result.skipped,
    findings: result.findings.length,
    summary: published.summary,
    warnings,
  })),
  Effect.provide(GitHubMemory()),
)
```

---

## Configuration

The config lives in `@resnovas/config`; reading it from a repository lives in
`@resnovas/runtime` (`loadConfig`, `loadConfigText`, `CONFIG_CANDIDATES`).

### Loading

`loadConfigText` returns the first of `.github/smartcloud.yml`,
`.github/smartcloud.yaml` and `.github/config.json` on the default branch (or a
given `path` and `ref`), and fails with `NoConfig` when there is none.
`loadConfig` then calls `resolveConfig`, which:

1. parses YAML or JSON (`ConfigParseError` otherwise). A label `color` that
   YAML reads as a number keeps its source text, so `000123` stays `'000123'`
   and `1e3` stays `'1e3'` (and fails the six-hex-digit check) instead of
   becoming `1000`. The `Color` schema also accepts a whole number from 0 to
   999999 and pads it to six digits, for configs built in code or JSON;
2. migrates a file without `version: 2` from v1 (`migrateV1`), with a warning
   for every v1 key it cannot carry over;
3. reads each `extends` entry through the `ConfigSource` service
   (`ConfigSourceFromGitHub` in a run, so a dry run reads presets through the
   dry-run layer too), depth first, at most 5 deep, failing on a loop with
   `ExtendsCycle`;
4. merges presets first, in order, and the repository's own file last;
5. decodes the merged result against `SmartcloudConfig`.

A config that says `telemetry: false` turns telemetry off for the rest of the
process as soon as it is read.

### Presets and locking

An `extends` entry is `owner/repo/path@ref` (`parseExtendsRef`; the ref is
optional and means the default branch). No segment may be empty, `.` or `..`.
Everything a preset sets is **locked** (`mergeLocked`): a repository may add
rules but a change to an inherited value fails with `LockedRule`, naming the
path and the preset. `ResolvedConfig.locked` lists the locked dotted paths, and
a condition group (`when`) is inherited whole.

A restricted run (see the GitHub section) may leave out a preset in another
repository that its token cannot read (`skippablePreset`). The rest of the
config still runs; a section that only a skipped preset could have completed is
dropped, and both appear in `ResolvedConfig.skipped` and as findings.

### Lenient decoding: unknown keys never break a run

A preset written for a newer smartcloud must still run on an older one, so a
run is lenient (`dropInvalid` in `lenient.ts`):

- an unknown key or an invalid value is **dropped with a warning** naming the
  file and the key, listed in `ResolvedConfig.ignored` and reported as a
  `config.ignored` warning finding on its own `smartcloud / config` check;
- a problem anywhere in a rule's `when` drops the whole `when`, and a problem
  inside a list drops the whole list, so a rule never runs with part of its
  conditions gone;
- an invalid value in a setting that only tightens policy (`RESTRICTIONS` in
  `lenient.ts`: `roles.maintainers`, `reviews.gate`, `commits`,
  `settings.ruleset`, ...) is also listed in `loosened` and reported as an
  **error**, because the run applied looser policy than asked for.

What is not about one key still fails: text that is not YAML or JSON, a
top-level value that is not a mapping, a malformed `extends`, an unreadable
preset, a cycle, and a change to a locked value. `resolveConfig(text, source,
{ strict: true })`, which `smartcloud validate` and the MCP `validate_config`
tool use, fails on every problem instead.

### Cross-field checks

A rule that ties two keys together is a `Schema.filter` on the struct that
holds both, checked on the merged config (a preset may set one key and the
repository the other). Return `Schema.FilterIssue`s whose `path` points at the
one key a lenient run should drop, never the whole struct: a failing filter
without a path drops the object it sits on, which for `settings.ruleset` would
throw away every branch protection. Give the filter `jsonSchema: {}` unless
the rule can be written as JSON Schema too.

The merge queue check (SMC-122) is the model: `mergeQueueConflicts` in
`sections.ts` reports `settings.ruleset.mergeQueue.method` when it is `merge`
under `linearHistory: true`, or not in `pullRequest.mergeMethods`.

- `smartcloud validate` (strict) fails with the message and path.
- A run drops only the method, with a `config.ignored` warning. The path is in
  `FALLBACKS` in `lenient.ts`, so it is not counted as `loosened`: the planner
  (`defaultQueueMethod` in `feature.settings/src/plan.ts`) then picks squash,
  else the first of rebase and merge the ruleset allows.
- `planRepositorySettings(config, resolved.ignored)` keeps the `settings.*`
  lines of `ignored`, and `settingsPlanText` lists them under "Ignored, so not
  applied", so `smartcloud plan settings` and the MCP `plan_settings` tool
  show them.

When the dropped value has a safe fallback like this, add its path to
`FALLBACKS`; otherwise leave it a restriction so dropping it is an error.

### The schema

`SmartcloudConfig` in `packages/config/src/schema.ts` is the single source of
truth. Sections live in `sections.ts` (and `schema.ts` for labels,
conventions and sizes). Two artefacts are generated from it and checked:

| Artefact                                      | Regenerate                                                       | Checked by                             |
| --------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------- |
| `schema/smartcloud.schema.json` (for editors) | `SMARTCLOUD_UPDATE_SCHEMA=1 pnpm nx test @resnovas/config-tests` | `tests/config/src/json-schema.spec.ts` |
| `docs/reference/configuration.mdx`            | `pnpm docs:reference`                                            | `pnpm docs:reference:check`            |

The JSON Schema declares draft-07, where every keyword beside a `$ref` is
ignored. `configJsonSchema` (`packages/config/src/json-schema.ts`) therefore
rewrites Effect's output so no `$ref` has siblings: annotations (`title`,
`description`) stay on the node and constraints move into an `allOf`, and the
root points at `SmartcloudConfig` the same way beside `$defs`:

```json
{
  "description": "The fewest lines added plus deleted that make a pull request Size: S. Defaults to 10.",
  "title": "positive",
  "allOf": [{ "$ref": "#/$defs/Int" }, { "exclusiveMinimum": 0 }]
}
```

A spec in `json-schema.spec.ts` fails if any `$ref` gains a sibling, and
`tools/docs/config-reference.ts` folds the wrapper back when it renders the
reference page. Keep both in step if you change the shape.

Annotate every field with a `description` (it becomes the JSON Schema and the
reference page), and use `Schema.optionalWith(x, { exact: true })` for optional
keys, as the `opt` helper in `sections.ts` does, because
`exactOptionalPropertyTypes` is on.

### Adding a config section

1. Define the section's schema in `packages/config/src/sections.ts` with an
   `identifier` annotation, a JSDoc description and a runnable
   `ts import.meta.vitest` example, and export it from `index.ts`.
2. Add it to `SmartcloudConfig` as an optional key.
3. If a value only tightens policy, add its path to `RESTRICTIONS` in
   `lenient.ts`, so dropping it is an error rather than a warning.
4. Map it to the feature that reads it in `FEATURE_SECTIONS`
   (`packages/runtime/src/features.ts`), which the `config resolved` analytics
   event and `explainConfig` use.
5. If v1 had an equivalent, carry it over in `v1.ts`; otherwise nothing.
6. Regenerate the JSON Schema and the configuration reference, add specs in
   `tests/config`, and document the section for people in `docs/` and for
   agents here.

Never make an existing optional key required, and never reject a key a
previous release accepted: presets are shared across repositories on
different versions.

### Resolving a config with presets

`resolveConfig` reads presets only through `ConfigSource`, so it makes no
network calls of its own. A run provides `ConfigSourceFromGitHub`; this
provides presets from memory, as the config tests do.

```ts
import { ConfigNotFound, ConfigSource, formatExtendsRef, resolveConfig } from '@resnovas/config'
import { Effect, Layer } from 'effect'

// Presets keyed by owner/repo/path@ref, as formatExtendsRef writes them.
const presets: Readonly<Record<string, string>> = {
  'acme/.github/smartcloud/base.yml@main': 'version: 2\nlabels: { bug: { name: bug, color: d73a4a } }\n',
}

const FromMemory = Layer.succeed(ConfigSource, {
  read: (ref) =>
    Effect.fromNullable(presets[formatExtendsRef(ref)]).pipe(
      Effect.mapError(() => new ConfigNotFound({ source: formatExtendsRef(ref) })),
    ),
})

// `futureOption` is a key this build does not know: a run drops it with a
// warning instead of failing, so a preset written for a newer smartcloud
// still runs here.
const repositoryConfig = `version: 2
extends: ['acme/.github/smartcloud/base.yml@main']
labels: { docs: { name: docs, color: 0075ca } }
futureOption: true
`

export const example = resolveConfig(repositoryConfig, '.github/smartcloud.yml').pipe(
  Effect.map((resolved) => ({
    // Presets first, the repository's own file last.
    sources: resolved.sources,
    // The repository added `docs`; it could not have changed `bug`, which the
    // preset set and so locked.
    labels: Object.keys(resolved.config.labels ?? {}),
    bugColorLocked: resolved.locked.has('labels.bug.color'),
    // One line per dropped key, naming the file and the key.
    ignored: resolved.ignored ?? [],
  })),
  // A repository changing an inherited value fails with LockedRule, which
  // names the path and the preset; there is nothing to recover, so report it.
  Effect.catchTag('LockedRule', (error) => Effect.fail(error.message)),
  Effect.provide(FromMemory),
)
```

### The shape of a config section

Sections are Effect Schemas with an identifier and a description on every
field, because both flow into the generated JSON Schema and the
configuration reference. This is the pattern `sections.ts` follows; a real
section is then added to `SmartcloudConfig`.

```ts
import { Schema } from 'effect'

// exactOptionalPropertyTypes is on, so optional keys are exact: absent is
// allowed, `undefined` written out is not.
const opt = <A, I, R>(schema: Schema.Schema<A, I, R>) => Schema.optionalWith(schema, { exact: true })

export const Archive = Schema.Struct({
  /** Days an item has been closed before it is archived. */
  afterDays: Schema.NonNegative.annotations({ description: 'Days an item has been closed before it is archived.' }),
  label: opt(Schema.String.annotations({ description: 'Added to the item when it is archived.' })),
  exempt: opt(Schema.Struct({ labels: opt(Schema.Array(Schema.String)) })),
}).annotations({ identifier: 'Archive', description: 'Scheduled archiving of long-closed items.' })

// The loader decodes with every error and rejects excess properties, then
// drops the offending keys itself; strict validation sees the same errors.
const decode = Schema.decodeUnknownEither(Archive, { onExcessProperty: 'error', errors: 'all' })

export const example = {
  valid: decode({ afterDays: 30, label: 'archived' }),
  missingKey: decode({ label: 'archived' }),
}
```

### A cross-field check that drops one key

A filter on the struct that holds both keys, returning an issue whose path
names the key to drop. Strict decoding reports it at that path; a lenient
run drops only that key and warns.

```ts
import { Settings } from '@resnovas/config'
import { Schema } from 'effect'

type Method = 'squash' | 'rebase' | 'merge'

// The shape `mergeQueueConflicts` in sections.ts follows.
export const queueConflicts = (ruleset: {
  readonly linearHistory?: boolean
  readonly mergeQueue?: { readonly method?: Method }
}): Array<Schema.FilterIssue> =>
  ruleset.mergeQueue?.method === 'merge' && ruleset.linearHistory === true
    ? [{ path: ['mergeQueue', 'method'], message: 'the merge queue cannot use merge while linearHistory is on' }]
    : []

export const Ruleset = Schema.Struct({
  linearHistory: Schema.optionalWith(Schema.Boolean, { exact: true }),
  mergeQueue: Schema.optionalWith(
    Schema.Struct({ method: Schema.optionalWith(Schema.Literal('squash', 'rebase', 'merge'), { exact: true }) }),
    { exact: true },
  ),
}).pipe(Schema.filter(queueConflicts, { jsonSchema: {} }))

const decode = Schema.decodeUnknownEither(Settings, { errors: 'all' })

export const example = {
  // Left: ["ruleset"]["mergeQueue"]["method"] with the message.
  conflict: decode({ ruleset: { linearHistory: true, mergeQueue: { method: 'merge' } } }),
  // Right: leave the method out and the planner picks one that fits.
  fits: decode({ ruleset: { linearHistory: true, mergeQueue: {} } }),
}
```

---

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

### Writing a feature

A feature declares what it handles, when the config enables it and which
facets it needs, then acts only through the `GitHub` service and records
through `Report`. It has no dry-run branch and no error handling of its
own for the engine to duplicate.

```ts
import { evaluate, requiredFacets, type ConditionGroup } from '@resnovas/conditions'
import { Report, type Feature } from '@resnovas/engine'
import { GitHub } from '@resnovas/integrations.github'
import { Effect } from 'effect'

// A pull request that touches the workflows and is not yet labelled `ci`.
const touchesWorkflows: ConditionGroup = {
  condition: [
    { type: 'filesMatch', condition: '.github/workflows/**' },
    { type: 'hasLabel', label: 'ci', condition: false },
  ],
}

export const workflowLabel: Feature = {
  name: 'workflow-label',
  handles: ['pullRequest'],
  // Enabled by a section of its own in a real feature; here, by the label
  // being defined, so the repository has opted in to it.
  enabled: (config) => config.labels?.['ci'] !== undefined,
  // Declared, not fetched: the engine loads `files` once for every feature
  // that asks, and fails only the features that need a facet it cannot load.
  facets: () => requiredFacets([touchesWorkflows]),
  run: ({ subject }) =>
    Effect.gen(function* () {
      if (subject === undefined) return
      const report = yield* Report
      const evaluation = yield* evaluate(touchesWorkflows, subject)
      if (!evaluation.passed) return
      // In a dry run this is recorded in DryRunLog; in a restricted run a
      // Forbidden answer is recorded and skipped. The feature cannot tell.
      yield* (yield* GitHub).addLabels(subject.number, ['ci'])
      yield* report.change({ feature: 'workflow-label', description: `labelled #${subject.number} "ci"` })
      yield* report.add({
        feature: 'workflow-label',
        rule: 'workflow-label.applied',
        level: 'notice',
        message: 'This pull request changes the workflows, so a maintainer must review it.',
      })
    }),
}
```

### Running features in a dry run

`runFeatures` is the engine without config loading or publishing. Under
`DryRun` every read reaches the provided GitHub and every write is only
recorded, which is how the CLI previews a run.

```ts
import { runFeatures } from '@resnovas/engine'
import { DryRun, DryRunLog, GitHubMemory } from '@resnovas/integrations.github'
import { FEATURES } from '@resnovas/runtime'
import { Effect, Layer } from 'effect'

export const example = Effect.gen(function* () {
  const result = yield* runFeatures({
    config: { version: 2, labels: { bug: { name: 'bug', color: 'd73a4a' } } },
    event: 'schedule',
    payload: {},
    features: FEATURES,
    // Switched off from outside the config, with the reason the report shows.
    turnedOff: new Map([['sync', 'turned off by feature flag smartcloud-sync']]),
  })
  const writes = yield* (yield* DryRunLog).writes
  return {
    ran: result.ran,
    // Each skipped feature says why: not configured, wrong event kind, a flag.
    skipped: result.skipped,
    // A failed feature is recorded here, never thrown.
    failed: result.failed,
    writes: writes.map((write) => write.operation),
  }
  // DryRun wraps whichever GitHub is provided below it.
}).pipe(Effect.provide(DryRun.pipe(Layer.provide(GitHubMemory()))))
```

### Turning on auto-merge by rule

An `autoMerge` rule turns on GitHub auto-merge for an open pull request its
conditions match. Here a Dependabot patch update matches, so the feature
reads the pull request, turns auto-merge on with the rule's method through
a GraphQL mutation (recorded, not made, under `DryRun`) and comments why.

```ts
import { runFeatures } from '@resnovas/engine'
import { DryRun, DryRunLog, GitHub, makeMemoryGitHub } from '@resnovas/integrations.github'
import { FEATURES } from '@resnovas/runtime'
import { Effect, Layer } from 'effect'

const memory = makeMemoryGitHub()
// The memory service answers raw requests with null, so answer the pull
// request read the way GitHub does: auto-merge is off.
const github = Layer.succeed(GitHub, {
  ...memory.service,
  repositoryRequest: () => Effect.succeed({ node_id: 'PR_7', state: 'open', auto_merge: null }),
})

export const example = Effect.gen(function* () {
  const result = yield* runFeatures({
    config: {
      version: 2,
      autoMerge: {
        rules: {
          'dependabot-patch': {
            when: { condition: [{ type: 'dependencyUpdateType', condition: ['patch'] }] },
            method: 'squash',
          },
        },
      },
    },
    event: 'pull_request',
    payload: {
      action: 'opened',
      pull_request: {
        number: 7,
        title: 'Bump effect from 3.1.0 to 3.1.1',
        body: '',
        user: { login: 'dependabot[bot]', type: 'Bot' },
        state: 'open',
        locked: false,
        labels: [],
        updated_at: '2026-09-01T00:00:00Z',
        head: { ref: 'dependabot/npm_and_yarn/effect-3.1.1', sha: 'abc' },
      },
    },
    features: FEATURES.filter((feature) => feature.name === 'automerge'),
  })
  const writes = yield* (yield* DryRunLog).writes
  return {
    // "Turned on auto-merge (squash) for #7 (dependabot-patch)."
    changes: result.changes.map((change) => change.description),
    // The enablePullRequestAutoMerge mutation and the explaining comment.
    writes: writes.map((write) => write.operation),
  }
}).pipe(Effect.provide(DryRun.pipe(Layer.provide(github))))
```

### Applying a renamed label that is still on a pull request

`bug` was renamed from `defect`. The pull request still carries `defect`
because label sync has not run yet, so labelling swaps the old name for the
current one instead of leaving both.

```ts
import { runFeatures } from '@resnovas/engine'
import { GitHub, makeMemoryGitHub } from '@resnovas/integrations.github'
import { FEATURES } from '@resnovas/runtime'
import { Effect } from 'effect'

const memory = makeMemoryGitHub()
memory.state.issues.set(3, { labels: ['defect'], comments: [], open: true })

export const example = Effect.gen(function* () {
  const result = yield* runFeatures({
    config: {
      version: 2,
      labels: { bug: { name: 'Type: Bug', color: 'd73a4a', aliases: ['defect'] } },
      labelling: { bug: { label: 'bug', when: { condition: [{ type: 'titleMatches', condition: '^bug' }] } } },
    },
    event: 'issues',
    payload: {
      action: 'edited',
      issue: {
        number: 3,
        title: 'bug: sync fails',
        body: null,
        user: { login: 'sam' },
        state: 'open',
        locked: false,
        labels: [{ name: 'defect' }],
        updated_at: '2026-09-01T00:00:00Z',
      },
    },
    // Only the labels feature has a section here, so only it runs.
    features: FEATURES,
  })
  // ['added label "Type: Bug" to #3, replacing its old name "defect"',
  //  'removed label "defect" (an old name of "Type: Bug") from #3']
  return result.changes.map((change) => change.description)
}).pipe(Effect.provideService(GitHub, memory.service))
```

---

## Conditions

Conditions are how a config says "when": a labelling rule, a convention, a
stale exemption, a required-checks rule. They live in `@resnovas/conditions`,
which is `type_core`: pure schemas and a pure evaluator, with no GitHub and no
I/O.

### The language

- A **leaf condition** is `{ type, ... }`, such as `titleMatches`,
  `filesMatch`, `hasLabel`, `isStale` or `checksPass`. The `Leaf` union in
  `schema.ts` lists every one.
- A **`ConditionGroup`** is `{ requires?, condition: [...] }`: it passes when at
  least `requires` of its conditions pass, all of them when `requires` is
  omitted.
- **Combinators** nest groups: `$and`, `$or`, `$not` and `$only` (exactly
  `requires` groups pass). `$not` accepts the three shapes v1 wrote.
- Patterns (`Pattern`) are either a bare regular expression or a delimited one
  with flags (`/^feat/i`), exactly as v1 read them; the schema rejects an
  invalid one, so `compilePattern` never throws on decoded config.
- Patterns run on text contributors control (titles, bodies, branch names,
  comments), so `compilePattern` also refuses one open to catastrophic
  backtracking, such as `^(a+)+$` or `(a|aa)+$`, using `backtrackingRisk` in
  `backtracking.ts`: a static check (it never runs the pattern) that builds the
  pattern's position automaton and looks for a state with two different loops
  over the same text. A repeat that nothing after it can fail, as in an
  unanchored `^fix: (\w+\s?)+`, is checked at its minimum count. The refusal
  is an ordinary `Pattern` failure: `validate` errors, and a run's lenient
  decode drops the group that holds it with a warning naming the pattern
  (`describe` in `packages/config/src/lenient.ts` prefers a refinement message
  over a union member mismatch). Every pattern that takes config text must go
  through `Pattern` and `compilePattern`; never `new RegExp` on config text.
  Each verdict is cached per source and flags, so compiling on every event is
  cheap. Keep `tests/conditions/src/backtracking.spec.ts` green: it runs every
  YAML pattern in `docs/` and smartcloud's own configs through the check.

### The subject and its facets

`evaluate(group, subject)` tests a `Subject`: the issue or pull request as the
event described it. Anything that costs an API call is a **facet**, loaded
only when a condition needs it: `files`, `changedFiles`, `reviews`,
`pendingReviewers`, `requestedReviewers`, `commits`, `mergeable`, `checks`,
`codeowners`, `comments` and `reactions`.

`requiredFacets(groups)` walks every group, combinators included, and returns
the facets they need; a feature returns it from `facets`, and the engine's
`loadFacets` loads each one once, concurrently. A condition that reads a facet
that was not loaded fails with `MissingFacet`, which is an engine bug, not a
user error. On an issue, a pull-request-only condition (`PULL_REQUEST_ONLY` in
`evaluate.ts`) fails with the detail "only applies to pull requests" rather
than erroring.

Every result carries a `detail` line ("title matches ^feat", "3 changed
file(s)") that reports show, so write one that explains the outcome.
Time-based conditions read Effect's `Clock`, so tests control them with
`TestClock`. GitHub lists at most 3,000 files of a pull request, so a
file-based condition that finds no match in a full list fails rather than
guessing.

### Adding a condition

The recent `feat(conditions)` commits (`dependencyUpdateType`, `commentMatches`,
`lockfileChanged`) are worked examples. The steps:

1. **Schema** in `packages/conditions/src/schema.ts`: a `Schema.Struct` with a
   `type` literal, an `identifier` equal to the type and a `description`, using
   the `flag` or `matches` helper when it fits. Add a JSDoc description and a
   runnable `ts import.meta.vitest` example, add it to the `Leaf` union, and
   export it from `index.ts`.
2. **Evaluation**: a `case` in `evaluateCondition` in `evaluate.ts`, returning
   `result(type, passed, detail)`. Read a facet only through the `facet`
   helper, so a missing one fails with `MissingFacet`.
3. **Facets**: list what it needs in `FACETS`, and add the type to
   `PULL_REQUEST_ONLY` if it means nothing on an issue.
4. **A new facet** (only if no existing one carries the data): add it to
   `Subject` and `Facet` in `subject.ts`, a read to `GitHubService` with its
   live, cached and in-memory implementations in `integrations.github`, and
   its load to `loadFacets` in `packages/engine/src/runner.ts`.
5. **Generated artefacts**: regenerate `schema/smartcloud.schema.json` and
   `docs/reference/configuration.mdx` (see the config section).
6. **Tests and docs**: cases in `tests/conditions/src/evaluate.spec.ts` and
   `schema.spec.ts` (both outcomes, the detail, the issue case, the 3,000-file
   limit when it reads files), and the condition in `docs/conditions.mdx`.

A condition must never be able to pass on data an outsider controls without
saying so: `dependencyUpdateType` checks the reserved `[bot]` login, not the
branch or title, so a fork cannot pose as Dependabot.

### Evaluating conditions

`evaluate` is pure apart from the Clock, so the same group gives the same
answer in a run, a dry run and a test. `requiredFacets` says what to load
before calling it; the engine does that loading for a feature.

```ts
import { evaluate, requiredFacets, type ConditionGroup, type Subject } from '@resnovas/conditions'
import { Effect } from 'effect'

// Two of three must pass. The `$not` group passes when its own group fails.
const ready: ConditionGroup = {
  requires: 2,
  condition: [
    { type: 'titleMatches', condition: '/^(feat|fix)(\\(.+\\))?: /i' },
    { type: 'filesMatch', condition: 'packages/**' },
    { type: '$not', condition: { condition: [{ type: 'isDraft', condition: true }] } },
  ],
}

const pullRequest: Subject = {
  kind: 'pullRequest',
  number: 7,
  title: 'feat(labels): prune unused labels',
  body: '',
  author: 'sam',
  open: true,
  locked: false,
  labels: [],
  updatedAt: new Date(0),
  draft: false,
  // A facet: loaded only because filesMatch asked for it.
  files: ['packages/feature.labels/src/sync.ts'],
}

export const example = Effect.gen(function* () {
  const facets = requiredFacets([ready])
  const evaluation = yield* evaluate(ready, pullRequest)
  return {
    facets: [...facets],
    passed: evaluation.passed,
    // Each result's detail is what reports print to explain the outcome.
    details: evaluation.results.map((entry) => `${entry.type}: ${entry.detail}`),
  }
  // Forgetting to load a facet is an engine bug, surfaced as MissingFacet.
}).pipe(Effect.catchTag('MissingFacet', (error) => Effect.die(error)))
```

---

## The GitHub service

`@resnovas/integrations.github` is the only package that talks to GitHub, and
the only one that imports Octokit. Everything else takes the `GitHub` service
(`Context.Tag`) from the Effect context and calls the operations on
`GitHubService`, which is bound to one repository (`github.coordinates`). If a
feature needs an endpoint the interface lacks, add a typed operation to
`GitHubService` and implement it in `live.ts`, `memory.ts`, `cache.ts` (reads)
and `dry-run.ts` and `restricted.ts` (writes); `repositoryRequest` and
`graphql` are escape hatches for the settings feature's many endpoints, not a
shortcut around that.

Small helpers built on those escape hatches may live in the package itself,
next to the service, when more than one feature needs them: `reviewers.ts`
(review requests) and `auto-merge.ts` (`readAutoMerge`, `enableAutoMerge`,
`disableAutoMerge`, `autoMergeRefusal`, `MERGE_METHODS`, shared by the
`/automerge` command and the auto-merge feature). Reuse them rather than
writing the query or mutation again in a feature.

### Layers

| Layer                                           | Use                                                                                                                                                                                                                       |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GitHubLive`                                    | The real API: `GITHUB_TOKEN` (read with `Config.redacted`, never unwrapped outside the client) and `GITHUB_REPOSITORY`. `makeLiveGitHub` builds one for any token and repository.                                         |
| `DryRun`                                        | Wraps whichever service is below it: reads pass through, writes are recorded in `DryRunLog`. A `url` field in a recorded raw request keeps only its origin; comment bodies and GraphQL variables are recorded as written. |
| `Restricted`                                    | Wraps it for a read-only token: a write GitHub refuses as `Forbidden` is recorded in `SkippedWrites` and answered as in a dry run.                                                                                        |
| `GitHubMemory(seed)` / `makeMemoryGitHub(seed)` | In memory, for tests; see the testing section.                                                                                                                                                                            |

### Tokens: in-repository, privileged and house

The action splits its tokens (`connectTokens` in `@resnovas/runtime`), so each
does only its own job:

| Service            | Token                                    | Used for                                                                                                   |
| ------------------ | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `GitHub`           | the workflow token (`workflowToken`)     | Everything in the repository: check runs, comments, labels, reviews, facets, the repository's own config.  |
| `PrivilegedGitHub` | the app or access token (`GITHUB_TOKEN`) | Features with `privileged: true` (settings, sync, codeowners, backport) and presets in other repositories. |
| house reads        | the read-only house token (`houseToken`) | `getFile` and `listDirectory` in another `.github` repository, through `withHouseReads` on both services.  |

`withHouseReads` routes only `getFile` and `listDirectory`. `resolveRef` and
`getArchive` go to the wrapped service, so a run whose only way into another
organisation's `.github` is the house token reads that source file by file
(sync's fallback) rather than as an archive.

- `PrivilegedGitHub` is optional. The CLI, the MCP server and any run with one
  token provide only `GitHub`, and everything uses it, so a feature must never
  require `PrivilegedGitHub`: mark it `privileged: true` and keep using `GitHub`.
  The engine provides the privileged service as `GitHub` to such a feature.
- A restricted run (fork, Dependabot, only the workflow token, or a rejected
  token) has no privileged service. The house token is ignored on forks and
  Dependabot runs. A restricted pull request run with a house token keeps the
  sync edit check (`Access.houseReads`, `restrictedFeatures(access, event)`).
- The workflows mint the app token only on `push`, `schedule` and
  `workflow_dispatch` of the default branch, and on the `closed` event of a
  merged pull request from the repository itself (trusted, merged code), for
  backport: pull requests opened with the workflow token start no CI. Never
  mint it for other `pull_request` or `issue_comment` runs.
- `Restricted` never skips a refused `backport`: it fails with `Forbidden`, so
  the backport feature warns that nothing was backported instead of
  announcing a dry-run style #0.
- `DryRun` wraps `PrivilegedGitHub` too, into the same `DryRunLog`.
- `withHouseReads` falls back to the wrapped service when the house token
  answers `Forbidden` or `NotFound`, such as for another organisation's
  `.github`.

### Refs and archives

Two reads serve a whole tree at a commit for the price of two requests:

- `resolveRef({ owner, repo, ref? })` answers the commit SHA of a branch, tag
  or commit (`GET /repos/{owner}/{repo}/commits/{ref}` with the `sha` media
  type, so no diff is sent); `HEAD` when `ref` is omitted.
- `getArchive({ owner, repo, ref?, path?, paths?, maxBytes? })` downloads the
  repository's tarball at `ref` (the default branch when omitted) and answers
  every regular file under `path` (relative to it), or only `paths`, as
  `{ path, content, executable }`, the execute bit from the tar mode. GitHub
  answers the tarball endpoint with a redirect to codeload; the live service
  follows it itself, without the token, as GitHub requires. The read is one
  Effect `Stream` in `archive.ts`: `Stream.fromReadableStream` over the
  download, `limitBytes` (a `mapAccumEffect` that fails past `maxBytes`),
  gunzip through Node's `DecompressionStream` (bridged with
  `Stream.toReadableStream` and back), then `readTar`, a `mapAccumEffect`
  over an incremental ustar and pax parser (`x` and `g` headers, GNU `L`
  names, base-256 sizes); links, directories and submodules are skipped, and
  the whole thing is collected with `Stream.runCollect`. Its typed errors,
  `ArchiveRejected` (status 422: over the limit, not gzip, not tar) and
  `DownloadFailed` (codeload's status, or none for a broken connection), go
  through the same status mapping as every other call, so the first is a
  `ValidationFailed` that is never retried and an outage is retried. Both
  reads are cached in the contents family with the file reads, so a proposal
  invalidates them. The live service's `attempt` runs any Effect as one
  instrumented, retried call; `call` is the one-request case on top of it.

### Errors

Every operation fails with `GitHubError`, a union of five tagged errors, each
carrying `operation` and GitHub's `detail`:

| Tag                | Meaning                                            | Retried                                 |
| ------------------ | -------------------------------------------------- | --------------------------------------- |
| `NotFound`         | 404: missing, or the token cannot see it.          | No                                      |
| `Forbidden`        | 401 or 403 that is not a rate limit.               | No                                      |
| `RateLimited`      | 429, or 401/403 whose message says rate limit.     | Yes, with backoff                       |
| `ValidationFailed` | Any other 4xx except 408: the request's own fault. | No                                      |
| `Unavailable`      | Timeouts, 5xx, network failures.                   | Yes, except calls that create something |

`fromStatus` and `fromGraphqlErrors` do the mapping. Retries use exponential
backoff from one second, jittered, at most three times. A call that creates
something (a comment, review, label, check run, branch, pull request, REST
`POST` or GraphQL mutation) is not retried on an outage, because GitHub may
already have acted and a repeat would duplicate it. Handle the tags you
expect with `Effect.catchTag`; a `NotFound` on an optional file is normal.

### Caching and ETags

Two layers of reuse keep a run within its rate limit:

- **Request cache** (`cacheReads` in `cache.ts`): every read is an Effect
  `Request`, so equal reads share one cache entry and concurrent equal reads
  share one call, for the life of the service. Each write invalidates exactly
  the families of reads it can change (a label write the labels, a comment
  write the comments, a proposal the files, pull requests and checks, a raw
  write or GraphQL mutation everything), so a run never reads stale data after
  its own write. Sweeps and pollers (`listClosedUnlocked`,
  `listOpenPullRequests`, `listCommitChecks`) are never cached.
- **Conditional requests** (`observedClient` in `live.ts`): a repeated `GET`
  sends the last response's ETag as `If-None-Match`; GitHub does not count a
  `304 Not Modified` against the rate limit, and the stored response is
  returned.

### Telemetry

Each call is traced as `smartcloud.github.<operation>`, counted in
`smartcloud.github.requests` and timed in `smartcloud.github.duration_ms`,
recording only the operation, the outcome and the HTTP status.
`githubUsage` reports the calls a run made and the rate limit left.

### Calling GitHub and handling its errors

Take the service from context and match the tags you expect. Rate limits
and outages have already been retried by the time an error arrives, so do
not add a retry of your own.

```ts
import { GitHub } from '@resnovas/integrations.github'
import { Effect, Option } from 'effect'

// A file that may legitimately be absent: NotFound is an answer, not a
// failure. Every other GitHubError still fails the caller.
export const readOptionalFile = (path: string) =>
  Effect.gen(function* () {
    const github = yield* GitHub
    const { owner, repo } = github.coordinates
    return yield* github.getFile({ owner, repo, path }).pipe(
      Effect.map(Option.some),
      Effect.catchTag('NotFound', () => Effect.succeedNone),
    )
  })

// A write that a read-only token cannot make. Under the Restricted layer the
// Forbidden never reaches here; without it, report it as a finding's text
// rather than failing the whole feature.
export const labelIssue = (issue: number, label: string) =>
  Effect.gen(function* () {
    const github = yield* GitHub
    yield* github.addLabels(issue, [label])
    return `labelled #${issue} "${label}"`
  }).pipe(
    Effect.catchTags({
      Forbidden: (error) => Effect.succeed(`could not label #${issue}: ${error.message}`),
      // The request's own fault, such as a label GitHub rejects: retrying
      // would fail the same way.
      ValidationFailed: (error) => Effect.succeed(`GitHub rejected the label: ${error.detail}`),
    }),
  )
```

### Running with a read-only token

A pull request from a fork or Dependabot runs with the workflow token,
which cannot label, comment or create check runs. `Restricted` turns each
refused write into a recorded skip, so the feature that tried still
finishes and the report says what was not written.

```ts
import { Forbidden, GitHub, makeMemoryGitHub, Restricted, SkippedWrites } from '@resnovas/integrations.github'
import { Effect, Layer } from 'effect'

// An in-memory GitHub that refuses to comment, as the workflow token on a
// fork's pull request does.
const { service } = makeMemoryGitHub()
const readOnly = Layer.succeed(GitHub, {
  ...service,
  createComment: () => Effect.fail(new Forbidden({ operation: 'createComment', detail: 'read-only token' })),
})

export const example = Effect.gen(function* () {
  const github = yield* GitHub
  // Answered like a dry run: a comment with id 0.
  const comment = yield* github.createComment(1, 'Thanks for the pull request!')
  const skipped = yield* (yield* SkippedWrites).writes
  return { commentId: comment.id, skipped: skipped.map((write) => write.operation) }
}).pipe(Effect.provide(Restricted.pipe(Layer.provide(readOnly))))
```

### Splitting the tokens: in-repository, privileged and house

The action connects with up to three tokens through `connectTokens`. The
workflow token's service is provided as `GitHub` and does everything in
the repository. The app token's service is provided as `PrivilegedGitHub`
and is used only by features marked `privileged` (settings, sync,
codeowners, backport) and for presets in other repositories. Both read files in a
`.github` repository with the read-only house token first.

```ts
import { GitHub, makeMemoryGitHub, PrivilegedGitHub } from '@resnovas/integrations.github'
import { connectTokens, FULL_ACCESS } from '@resnovas/runtime'
import { Effect, Layer, Option, Redacted } from 'effect'

// One in-memory GitHub per token, so the example can tell them apart.
const services = new Map([
  ['ghs_app', makeMemoryGitHub().service],
  ['ghs_workflow', makeMemoryGitHub().service],
  ['ghs_house', makeMemoryGitHub().service],
])

export const example = Effect.gen(function* () {
  const { service, privileged } = yield* connectTokens({
    token: Redacted.make('ghs_app'),
    workflowToken: Option.some(Redacted.make('ghs_workflow')),
    houseToken: Option.some(Redacted.make('ghs_house')),
    access: FULL_ACCESS,
    connect: (token) => Effect.succeed(services.get(Redacted.value(token)) ?? makeMemoryGitHub().service),
  })
  // Provide both: the engine hands `PrivilegedGitHub` to privileged features as their `GitHub`.
  const layer =
    privileged === undefined
      ? Layer.succeed(GitHub, service)
      : Layer.merge(Layer.succeed(GitHub, service), Layer.succeed(PrivilegedGitHub, privileged))
  return layer
})
```

---

## Testing

### Layout and tools

- Tests live in `tests/<name>`, one project per package, and mirror sources
  file for file: `packages/<name>/src/<path>.ts` is tested by
  `tests/<name>/src/<path>.spec.ts`. Barrels and type-only files need no spec;
  shared helpers are non-spec files such as `fixtures.ts`.
- Write specs with `@effect/vitest`: `it.effect` for an Effect, which provides
  a `TestClock` and `TestContext`, `it.live` only when real time is the point.
- `pnpm nx test <project>` runs one project with coverage, `pnpm run test:file
<path>` one file without it, and `pnpm typecheck:tests` type-checks every
  test project (Nx's inferred typecheck skips them, because they set `noEmit`).

### Coverage: 90% enforced, 100% the goal

`testProject` in `vitest.shared.ts` fails a project below 90% of lines,
functions, statements or branches of the package it covers. 100% is the goal:
below it the run passes, and `tools/ci/coverage-goal.ts` warns (an annotation
on CI) with each metric that falls short. The GitHub ruleset blocks a pull
request only below 80%. Aim for 100% in every change; never lower a threshold,
skip a test or delete one to make a build pass; add the missing case. On CI a failed test is retried twice and each test that passed
only on a retry is reported as flaky: that is a bug to fix, not a reason to
raise the retry count. Keep tests portable across Linux, macOS and Windows:
build paths with `node:path`, and never assume a shell, a line ending or a
case-sensitive file system.

### The in-memory GitHub

`makeMemoryGitHub(seed)` returns a `GitHubService` and its live, mutable
`MemoryState`. Seed what the test needs (labels, `issues` by number, `pulls`,
`openIssues`, `closedIssues`, `files` keyed by `fileKey(owner, repo, path,
ref)`, ...), run the feature, then read the state to see what it did: labels,
comments, `proposals`, `backports`, `checkRuns`, raw `requests`. It behaves
like GitHub where features depend on it: labels are unique ignoring case,
missing things fail with `NotFound`, a proposal updates the open pull request
from its branch. `GitHubMemory(seed)` is the same as a layer, for a test that
does not inspect the state. To test a failure, spread the service and replace
one operation with `Effect.fail(new Forbidden(...))`.

Every call is recorded by name in `state.calls`, so a test asserts a
feature's request budget (`expect(state.calls).toStrictEqual([...])`).
`getArchive` serves the seeded `files` at a ref with their `executables`, and
`resolveRef` answers `refs` (`refKey(owner, repo, ref)` to a SHA), or the ref
itself; an archive read at a SHA also serves the files of every ref that
resolves to it, and a read of the service's own default branch by name serves
the files seeded with an empty ref. `maxBytes` is honoured, so a small limit
exercises a feature's fallback.

Test a feature through `runFeatures`, as a run would, so facet loading,
enabling and isolation are exercised too. Put the clock under test control
with `TestClock.setTime` before anything reads the time.

### Documentation examples are tests

An `@example` fence marked `ts import.meta.vitest` in a package's JSDoc runs as
a test through `@effect/doctest`, asserting each trailing `// => value`
comment (primitives only: Effect 3's `Equal` compares plain objects and arrays
by reference). Its coverage counts against the source file it sits in, so a
runnable example must call every function it defines. Every other `@example`
is still type-checked by the `docgen` target. The examples in this `ai-docs`
tree are type-checked by the `@resnovas/ai-docs` project's `typecheck`.

### Testing a feature against the in-memory GitHub

The shape of a spec in `tests/feature.<name>`: seed the memory GitHub, fix
the clock, run the feature through the engine and assert on the state it
left. Nothing is mocked; the feature runs as it would in the action.

```ts
import { describe, expect, it } from '@effect/vitest'
import { runFeatures } from '@resnovas/engine'
import { GitHub, makeMemoryGitHub } from '@resnovas/integrations.github'
import { FEATURES } from '@resnovas/runtime'
import { Effect, TestClock } from 'effect'

const DAY = 86_400_000
const NOW = Date.UTC(2026, 8, 26)

describe('lock', () => {
  it.effect('locks an issue closed for longer than afterDays', () =>
    Effect.gen(function* () {
      const github = makeMemoryGitHub({
        closedIssues: [
          {
            number: 1,
            title: 'item 1',
            body: '',
            author: 'sam',
            open: false,
            locked: false,
            labels: [],
            updatedAt: new Date(NOW - 40 * DAY),
            closedAt: new Date(NOW - 40 * DAY),
            isPullRequest: false,
          },
        ],
      })
      github.state.issues.set(1, { labels: [], comments: [], open: false })
      // it.effect runs on the TestClock, which starts at 0 until it is set.
      yield* TestClock.setTime(NOW)

      const result = yield* runFeatures({
        config: { version: 2, lock: { afterDays: 30, on: ['issue'] } },
        event: 'schedule',
        payload: {},
        features: FEATURES.filter((feature) => feature.name === 'lock'),
      }).pipe(Effect.provideService(GitHub, github.service))

      expect(result.failed).toStrictEqual([])
      expect(github.state.issues.get(1)?.locked).toBe(true)
      expect(result.changes.map((change) => change.description)).toStrictEqual(['locked #1'])
    }),
  )
})
```

---

## Telemetry and feature flags

`@resnovas/integrations.posthog` sends product analytics, error tracking, logs,
traces and metrics to PostHog, and evaluates feature flags through
OpenFeature. Every surface provides `telemetry(surface, version)` from
`@resnovas/runtime` once, around everything it runs; the surfaces read
telemetry through the runtime, never the integration directly.

### It never changes behaviour, and it names nothing

- **Opt-out, one switch.** Nothing is sent when `SMARTCLOUD_TELEMETRY=false`,
  `DO_NOT_TRACK=1` or the action input `telemetry: false` is set, and sending
  stops once a config says `telemetry: false` (`optOut`). Opting out never
  changes what smartcloud does: every flag then keeps its default.
- **Failing to send never fails the caller.** `emit`, `reportError` and
  `evaluateFlag` return `Effect<void>` or the fallback, never an error.
- **Values name nothing.** Events carry counts, outcomes and fixed names only.
  Repositories are hashed (`identify`), a rule a repository named is sanitised
  (`sanitiseRule`), and every message and stack is passed through `redact`,
  which removes GitHub tokens, bearer credentials, email addresses and given
  secrets. Spans and logs follow the same rule: feature names, the event,
  counts and outcomes, never what the event is about. A finding's message can
  quote titles and logins, so only its feature, rule and level are logged.

### Analytics events

`ANALYTICS_EVENTS` in `packages/runtime/src/analytics.ts` is the whole
taxonomy, each event with a schema for its properties: `command run`, `config
resolved`, `feature run`, `sync proposed` and `settings applied`. Nothing else
names an event. A feature does not call `emit`; it records a `Fact` with
`report.measure`, and `measuredEvents` turns the facts it knows into events
after the run. To add an event, add its schema to `ANALYTICS_EVENTS`, build it
from the run in `analytics.ts`, and document it on the telemetry page.

### Metrics and traces

`smartcloud.findings` (by level and feature), `smartcloud.feature.duration_ms`
(by feature and outcome) and the `smartcloud.github.*` metrics are Effect
`Metric`s. Spans are `Effect.withSpan` with `captureStackTrace: false` and
attributes that follow the rules above. `EFFECT_DEVTOOLS=true` streams the
CLI's and MCP server's spans to the Effect Dev Tools extension; never set it
on CI.

### Feature flags

New behaviour ships behind a PostHog flag with a safe default in code, never
behind an environment variable or a config toggle. Each feature has one flag,
`smartcloud-<feature>` (`flagFor`), listed with its default in
`FEATURE_FLAGS` in `packages/runtime/src/flags.ts`, the only place a flag
default lives. `turnedOffFeatures` evaluates them before a run, and the engine
skips a feature whose flag is off with the flag named as the reason. A flag
for finer behaviour inside a feature goes in the same map and is read with
`featureEnabled`; a test checks that every feature has its flag.

### Reading a flag and recording a measurement

Flags are read through the runtime, which knows each flag's default; with
telemetry off or PostHog unreachable the default is the answer. A feature
measures what it did as a `Fact` on the report rather than sending an
event itself.

```ts
import { Report } from '@resnovas/engine'
import { featureEnabled, flagFor, turnedOffFeatures, FEATURES } from '@resnovas/runtime'
import { Effect } from 'effect'

const repository = { owner: 'Resnovas', repo: 'smartcloud' }

// Without the Telemetry service (as here) every flag keeps its default from
// FEATURE_FLAGS, so opting out of telemetry never changes behaviour.
export const flags = Effect.gen(function* () {
  const labelsOn = yield* featureEnabled(repository, 'smartcloud-labels')
  const off = yield* turnedOffFeatures(repository, FEATURES)
  return { flag: flagFor('labels'), labelsOn, turnedOff: [...off.keys()] }
})

// Counts, outcomes and fixed names only: the values reach product analytics.
// `measuredEvents` turns the facts it knows, such as `sync proposed`, into
// events once the run is over.
export const measure = Effect.flatMap(Report, (report) =>
  report.measure({
    feature: 'sync',
    name: 'sync proposed',
    values: { created: 2, updated: 1, mode: 0, conflicts: 0, pull_request: 'created' },
  }),
)
```

---

## Release and CI

### CI (`.github/workflows/ci.yml`)

The jobs run in parallel on the affected projects:

| Job         | Runs                                                                                                                                                                                                                                                                                                                                        |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `changes`   | `tools/ci/changes.ts`: decides which jobs a change needs. Markdown, MDX and `docs/` files that no code depends on (by the Graphify graph) need only `lint` and `docs`; files in Nx projects need the jobs whose targets `nx show projects --affected` reports; anything else (workflows, root config, `tools/`, `scripts/`) runs every job. |
| `lint`      | `nx affected -t lint`, `pnpm headers`, `pnpm run format:check`, `pnpm ai-docs:check`.                                                                                                                                                                                                                                                       |
| `typecheck` | `nx affected -t typecheck` (this `ai-docs` project included) and `pnpm typecheck:tests`.                                                                                                                                                                                                                                                    |
| `test`      | `nx affected -t test` on Linux, macOS and Windows with Node 24 and the current release.                                                                                                                                                                                                                                                     |
| `build`     | `nx affected -t build` and the action bundle size budget (`bundle-size.json`, `tools/ci/bundle-size.ts`).                                                                                                                                                                                                                                   |
| `smoke`     | The action end to end, below.                                                                                                                                                                                                                                                                                                               |
| `docs`      | `nx affected -t docgen contracts` and `pnpm docs:reference:check`.                                                                                                                                                                                                                                                                          |
| `check`     | The one required context: passes only when every job passed or was skipped because `changes` said it was not needed.                                                                                                                                                                                                                        |

A new CI job goes in `check`'s `needs`, never in the ruleset's required
checks. Every night (02:23 UTC) and on a manual run every job runs on every
project with no cache, so a failure no change set off (a new Node or runner
image, a dependency) shows up the next morning. A merge queue group is
compared with the commit it lands on. Nx cache entries are restored between
runs, except in the release workflows, which never restore a cache.

Workflow rules: pin every third-party action to a full commit SHA with its
release in a trailing comment; `permissions: {}` at the top and per-job
scopes; `timeout-minutes` on every job with steps. actionlint and zizmor run
on every pull request (`uvx --from actionlint-py actionlint`, `uvx zizmor .`).

### Smoke tests

For each event recorded in `tools/ci/smoke/events` (`issues`,
`pull_request`, `push`, `schedule`), the `smoke` job bundles the action, runs
it through `uses: ./` with `dryRun: true`, telemetry off and the inline config
in `tools/ci/smoke/config.yml`, and `tools/ci/smoke/check.ts` compares the job
summary with `tools/ci/smoke/expected.json`. The `replay.ts` preload points
`GITHUB_EVENT_NAME` and `GITHUB_EVENT_PATH` at the recording. When a change
alters what the action reports for a recorded event, update `expected.json`
in the same pull request; to add an event, record its payload, add its
expectations and add it to the job's matrix.

### Releases

- **Stable** (`release.yml`, run by hand on `main`): Nx release computes the
  version from the conventional commits since the last `v*` tag, pushes a
  `v<version>` tag on a release commit holding `dist/index.js` and the bumped
  versions (never on `main`, whose versions stay `0.0.0`), moves `v<major>`,
  publishes `@resnovas/smartcloud` to npm, attaches SBOMs and attestations,
  then publishes the GitHub release. Its `changelogs` job opens a
  `chore(release): changelogs for v<version>` pull request; merge it before
  the next release. `dry-run` is ticked by default.
- **Nightly** (`nightly.yml`, 02:30 UTC): cuts `v<next>-nightly.<date>` from
  `main` when `main` has moved, as a GitHub pre-release, nothing to npm, and
  moves `v2` to it until the first stable 2.x. `releaseTag.strictPreid` in
  `nx.json` keeps nightly tags out of stable versions; never turn it off.

Never run `nx release` without `--dry-run`: a local run pushes and creates a
GitHub release. Preview with `pnpm release:dry-run`. Commit types decide the
bump, so title commits and pull requests with conventional commits.

### Release preview on pull requests

`release-preview.yml` runs on every pull request (opened, pushed, reopened,
and edited when the title or base changes; kept out of `ci.yml` so a rename
does not rerun CI). `tools/release/release-preview.ts` swaps the merge commit
for the squash commit that would land (title plus ` (#<number>)` over the
commit messages, as GitHub writes it), runs Nx `releaseVersion` and
`releaseChangelog` in dry-run mode, and writes the report to the job summary
and a `report` output. A second job, with only `pull-requests: write` and no
checkout, keeps one comment marked `<!-- smartcloud:release-preview -->` up to
date; it is skipped for forks and Dependabot. Pure logic (`squashMessage`,
`bumpOf`, `renderPreview`, `renderFailure`, `isFirstRelease`) lives in
`tools/release/preview.ts`, tested in `tests/tools`; the example below shows
how a squash commit's bump is read.

The preview never fails a pull request: errors become a warning and a short
report, both jobs set `continue-on-error`, and it is not in `check`'s `needs`.
With no stable `v*` tag it previews the first release as `2.0.0`. Locally,
`pnpm release:preview` previews HEAD as it is (no squash outside Actions).

### smartcloud on itself

`smartcloud.yml` runs smartcloud on this repository from a bundle of the
default branch, never from pull request code, with the config read from the
default branch so a pull request cannot loosen its own rules. It acts with a
GitHub App token because the config extends the house preset in the private
`Resnovas/.github`; forks and Dependabot get no secrets and run restricted.

### Reading the bump a pull request's squash commit calls for

The merge queue squashes a pull request into one commit: its title with the
number added, over its commits' messages. A `BREAKING CHANGE:` in any of
those messages makes the whole commit a major release, whatever the title's
type, which is what the release preview reports.

```ts
// The release preview is a repository tool, not a workspace library, so no
// package name reaches it; the example imports it by path on purpose.
// eslint-disable-next-line @nx/enforce-module-boundaries
import { bumpOf, renderPreview, squashMessage } from '../../../tools/release/preview.js'

const types = { feat: { semverBump: 'minor' }, fix: { semverBump: 'patch' } }

const message = squashMessage('feat(labels): colour aliases', 712, [
  'feat(labels): colour aliases',
  'fix(labels): drop the old colour field\n\nBREAKING CHANGE: labels.color is now labels.colour',
])

// 'major'
export const bump = bumpOf(message, types)

export const report = renderPreview({
  version: '3.0.0',
  current: '2.4.1',
  firstRelease: false,
  commit: message.split('\n')[0],
  bump,
  notes: '## 3.0.0\n\n### Breaking changes\n\n- **labels:** drop the old colour field',
})
```

---

## Documentation

Everything is documented twice, in the same change as the code. A feature,
option, preset, CLI command, MCP tool or workflow is not done until both are
updated.

| For    | Where                                                                       | Style                                                                                                                                                                                                   |
| ------ | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| People | `docs/` (the Mintlify site, navigation in `docs/docs.json`) and `README.md` | ELI5: what it is and why before how, step-by-step setup, one complete example, what they will see on GitHub, every option with its default, common problems and fixes, every term defined on first use. |
| Agents | `ai-docs/src`, assembled into `LLMS.md`                                     | Why, the rules that matter, and compiled examples in the codebase's own style.                                                                                                                          |

### Setup guides

The human setup guides live in `docs/guides/` (the "Setup guides" group in
`docs/docs.json`) and are the first place a newcomer is sent from
`getting-started`, `configuration`, `presets` and `features/sync`:

| Page                                 | Covers                                                                                                                                |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/guides/settings-file.mdx`      | `.github/smartcloud.yml` built one section at a time, in newcomer order, with what each does when a run starts and on which events.   |
| `docs/guides/recommended-setups.mdx` | Complete files for a small repository, a monorepo, an open-source project, and an organisation preset plus a repository extending it. |
| `docs/guides/organisation-hub.mdx`   | Any organisation's own `<org>/.github` as the sync hub: preset, `templates/`, managed blocks, placeholders, app, first sync, rollout. |

When a section, option, default or event changes, update these guides with the
feature page. Every YAML config in them must decode: write it to a file and run
`pnpm run cli validate <file>` (a fragment gets `version: 2` prepended; a file
that `extends` a fictional `my-org` preset is resolved with `resolveConfig`
and an in-memory `ConfigSource` serving the guide's own preset). Quote label
colours, since an all-digit colour decodes as a number.

### Generated artefacts

Never edit one by hand; edit its source and regenerate.

| Artefact                                            | Source                                  | Regenerate                                                       | Checked by                                               |
| --------------------------------------------------- | --------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------- |
| `LLMS.md`                                           | `ai-docs/src`                           | `pnpm ai-docs`                                                   | `pnpm ai-docs:check` (in `pnpm run check` and CI `lint`) |
| `ai-docs` examples compile                          | `ai-docs/src/**/*.ts`                   | -                                                                | `nx run @resnovas/ai-docs:typecheck`                     |
| `schema/smartcloud.schema.json`                     | `SmartcloudConfig`                      | `SMARTCLOUD_UPDATE_SCHEMA=1 pnpm nx test @resnovas/config-tests` | `tests/config`                                           |
| `docs/reference/configuration.mdx`                  | the JSON Schema                         | `pnpm docs:reference`                                            | `pnpm docs:reference:check`                              |
| API docs (`dist/docs`) and contracts                | JSDoc in `packages/*/src`, `apps/*/src` | `pnpm docs:api`                                                  | the `docgen` and `contracts` targets                     |
| `.claude/commands`, `.cursor/commands`, MCP configs | `.agents/prompts`, `.agents/mcp.jsonc`  | `node tools/dev/surfaces.mjs sync`                               | `node tools/dev/surfaces.mjs check`                      |

### API contracts

Every exported const, function and class carries a description, a typed
`@example` importing from the package's public path, `@param` per parameter
and `@returns` unless it returns void, with `@remarks` for behaviour a caller
relies on. Exports left out of a package's `index.ts` are marked `@internal`.
`docgen` type-checks every example; `contracts` checks the built declarations
for the tags.

### Writing ai-docs

- A section is `ai-docs/src/NN_name/index.md`, starting with a `##` heading.
  `05_house-standards`, `ai-docs/README.md` and `tools/ai-docs/docgen.mjs` are
  synced from `Resnovas/.github`; edit them there. smartcloud's own sections
  start at `10_`.
- Examples are `.ts` files beside `index.md` with a leading JSDoc `@title`.
  Import from the packages' public paths, as a consumer would; the
  `@resnovas/ai-docs` project may import any package (tag `type_docs`), and
  its `package.json` lists the ones it uses.
- Comment the why. When a source file changes behaviour an example or
  section describes, update it in the same change, then run `pnpm ai-docs`.
