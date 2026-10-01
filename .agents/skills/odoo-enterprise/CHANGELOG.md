# Changelog

Rolling window - the last 30 entries, newest first. When you add an entry,
delete anything past the thirtieth. Do not archive: store versions are
immutable, so the full history already exists at no cost. Leave a single
pointer at the bottom naming the cutoff version when you trim.

One terse line per change. If an entry wants a second sentence, that sentence
belongs in a reference file and the line points at it.

## 2026-09-19

- Added the living-memory files: a rolling `CHANGELOG.md` and a `HANDOVER.md` clobber file.
- Migrated from the local `.agents/skills` tree into the store and restructured to house style: thin index over `references/hot-paths.md`, `references/logging-and-settings.md` and `references/upgrades-and-ceiling.md`.
- Inlined the manifest semver rule, which previously pointed at a `bump-version-manifest` skill that lost its upstream and was not migrated.
