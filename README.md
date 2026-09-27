# smartcloud

[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/Resnovas/smartcloud/badge)](https://scorecard.dev/viewer/?uri=github.com/Resnovas/smartcloud)

smartcloud is a GitHub Action for repository automation and contribution policy, configured in one file: `.github/smartcloud.yml`.

It keeps labels in sync and applies them by condition, checks pull request and issue titles, enforces DCO sign-off and AI attribution on commits, reads the AI disclosure in pull request descriptions, gates merges on maintainer review, marks inactive work stale, locks long-closed threads, backports merged pull requests by label, applies repository settings, syncs shared files from a template repository, sends policy failures and stale items to Slack, Discord or Linear, and answers slash commands such as `/label`, `/rebase` and `/backport` in comments. Each feature has its own config section and runs only when that section is present.

Version 2 is a rewrite. It still reads a v1 `.github/config.json`, migrating it on every run with a warning for anything it drops; `smartcloud migrate` converts it once. The v1 action remains available at the `1.0.0-beta.8` tag.

## Quick start

Add `.github/smartcloud.yml`:

```yaml
# yaml-language-server: $schema=https://raw.githubusercontent.com/Resnovas/smartcloud/main/schema/smartcloud.schema.json
version: 2

labels:
  docs:
    name: documentation
    color: 0075CA

labelling:
  docs:
    label: docs
    on: [pullRequest]
    when:
      condition:
        - type: filesMatch
          condition: 'docs/**'

conventions:
  rules:
    title:
      on: [pullRequest]
      preset: conventionalCommits
```

Then add a workflow:

```yaml
name: smartcloud

on:
  pull_request:
  pull_request_review:
  issues:
  push:
    branches: [main]
  schedule:
    - cron: '0 6 * * *'
  workflow_dispatch:

permissions:
  contents: write
  pull-requests: write
  checks: write
  issues: write

jobs:
  smartcloud:
    runs-on: ubuntu-latest
    timeout-minutes: 75
    steps:
      - uses: resnovas/smartcloud@v2
```

Coming from v1? `smartcloud migrate` converts `.github/config.json`; see the [migration guide](docs/migration.mdx).

## Telemetry

smartcloud sends anonymous telemetry to PostHog: usage events, logs, traces, metrics and errors, identified only by a hash of the repository name, with tokens, emails and names redacted. It also reads per-feature flags from PostHog. Turning it off is discouraged, but `telemetry: false` in the config, the action's `telemetry: false` input, `SMARTCLOUD_TELEMETRY=false` or `DO_NOT_TRACK=1` does so; flags then keep their defaults. See [telemetry](docs/telemetry.mdx) for exactly what is and is not collected.

## Documentation

The documentation lives in [`docs/`](docs/introduction.mdx) and is built with Mintlify. Start with the [introduction](docs/introduction.mdx), then [configuration](docs/configuration.mdx), the [conditions](docs/conditions.mdx), the [migration guide](docs/migration.mdx) and [telemetry](docs/telemetry.mdx).

## Development

This is an Nx and pnpm workspace on Node 24 or later. CI runs the tests on Linux, macOS and Windows, with Node 24 and the current release.

```sh
pnpm install
pnpm nx run-many -t lint typecheck test build
```

See [AGENTS.md](AGENTS.md) for the layout and conventions. After changing the config schema, regenerate the JSON Schema with `SMARTCLOUD_UPDATE_SCHEMA=1 pnpm nx test @resnovas/config-tests`, then the configuration reference with `pnpm docs:reference`. CI fails when either is stale.

## Licence

Licensed under the Fair Core License, Version 1.0, MIT Future License (FCL-1.0-MIT). See [LICENSE](LICENSE).
