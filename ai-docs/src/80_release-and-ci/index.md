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

### smartcloud on itself

`smartcloud.yml` runs smartcloud on this repository from a bundle of the
default branch, never from pull request code, with the config read from the
default branch so a pull request cannot loosen its own rules. It acts with a
GitHub App token because the config extends the house preset in the private
`Resnovas/.github`; forks and Dependabot get no secrets and run restricted.
