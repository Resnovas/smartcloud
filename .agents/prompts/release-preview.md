---
label: Preview release
description: Dry-run the next release and summarise what would ship
---

Preview the next smartcloud release without publishing anything.

1. Run `pnpm run release:dry-run` (add `--first-release --specifier 2.0.0` if no `v*` tag exists yet). Never run `nx release` without `--dry-run`.
2. Summarise the version it would cut, why (which conventional commits drove it), and the changelog it would write.
3. Flag anything that would make the release wrong: unconventional commit titles, breaking changes without a `!`, features missing from the docs, or a failing `pnpm run bundle`.
