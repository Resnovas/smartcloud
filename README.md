# smartcloud

smartcloud is a GitHub Action for repository automation and contribution policy, configured in one file: `.github/smartcloud.yml`.

It keeps labels in sync and applies them by condition, checks pull request and issue titles, enforces DCO sign-off and AI attribution on commits, reads the AI disclosure in pull request descriptions, gates merges on maintainer review, marks inactive work stale, applies repository settings, and syncs shared files from a template repository. Each feature has its own config section and runs only when that section is present.

Version 2 is a rewrite. The v1 action lives in `legacy/` until v2 replaces it.

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
          condition: "docs/**"

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
    - cron: "0 6 * * *"
  workflow_dispatch:

permissions:
  contents: write
  pull-requests: write
  checks: write
  issues: write

jobs:
  smartcloud:
    runs-on: ubuntu-latest
    steps:
      - uses: resnovas/smartcloud@v2
```

Coming from v1? `smartcloud migrate` converts `.github/config.json`; see the [migration guide](docs/migration.mdx).

## Documentation

The documentation lives in [`docs/`](docs/introduction.mdx) and is built with Mintlify. Start with the [introduction](docs/introduction.mdx), then [configuration](docs/configuration.mdx), the [conditions](docs/conditions.mdx) and the [migration guide](docs/migration.mdx).

## Development

This is an Nx and pnpm workspace on Node 24 or later.

```sh
pnpm install
pnpm nx run-many -t lint typecheck test build
```

See [AGENTS.md](AGENTS.md) for the layout and conventions. After changing the config schema, regenerate the JSON Schema with `SMARTCLOUD_UPDATE_SCHEMA=1 pnpm nx test @resnovas/config-tests`, then the configuration reference with `pnpm docs:reference`. CI fails when either is stale.

## Licence

Licensed under the Fair Core License, Version 1.0, MIT Future License (FCL-1.0-MIT). See [LICENSE](LICENSE).
