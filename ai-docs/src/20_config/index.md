## Configuration

The config lives in `@resnovas/config`; reading it from a repository lives in
`@resnovas/runtime` (`loadConfig`, `loadConfigText`, `CONFIG_CANDIDATES`).

### Loading

`loadConfigText` returns the first of `.github/smartcloud.yml`,
`.github/smartcloud.yaml` and `.github/config.json` on the default branch (or a
given `path` and `ref`), and fails with `NoConfig` when there is none.
`loadConfig` then calls `resolveConfig`, which:

1. parses YAML or JSON (`ConfigParseError` otherwise);
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
