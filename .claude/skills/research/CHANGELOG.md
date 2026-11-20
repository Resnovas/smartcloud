# Changelog

Rolling window - the last 30 entries, newest first. When you add an entry,
delete anything past the thirtieth. Do not archive: store versions are
immutable, so the full history already exists at no cost. Leave a single
pointer at the bottom naming the cutoff version when you trim.

One terse line per change. If an entry wants a second sentence, that sentence
belongs in a reference file and the line points at it.

## 2026-09-19

- Migrated from the local `.agents/skills` tree into the store in house style: thin index body with a mode-selection table, one reference file per mode.
- Dropped the orphaned `references/primary-sources-references/primary-sources.md`, a byte-identical duplicate, and the unreferenced `agents/openai.yaml`.
- Removed the fact-check mode's links to a `blog-analyze` skill and a `blog-flow` framework file, neither of which exists in this store.
