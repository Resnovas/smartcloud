# Changelog

Rolling window - the last 30 entries, newest first. When you add an entry,
delete anything past the thirtieth. Do not archive: store versions are
immutable, so the full history already exists at no cost. Leave a single
pointer at the bottom naming the cutoff version when you trim.

One terse line per change. If an entry wants a second sentence, that sentence
belongs in a reference file and the line points at it.

## 2026-09-19

- Added the living-memory files: a rolling `CHANGELOG.md` and a `HANDOVER.md` clobber file.
- Migrated from the local `.agents/skills` tree into the store and restructured to house style: posture, top gotchas, companions, maintenance contract and the house metadata keys.
- Added a caveat that presence in the directory records what a vendor publishes, not whether that integration is provisioned anywhere.
