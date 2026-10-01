# Changelog

Rolling window - the last 30 entries, newest first. When you add an entry,
delete anything past the thirtieth. Do not archive: store versions are
immutable, so the full history already exists at no cost. Leave a single
pointer at the bottom naming the cutoff version when you trim.

One terse line per change. If an entry wants a second sentence, that sentence
belongs in a reference file and the line points at it.

## 2026-09-19

- Migrated from the local `.agents/skills` tree into the store in house style: thin index body, failure patterns and commands moved to `references/`.
- Rewrote a corrupted Related block that had duplicated text nested inside backticks, and dropped its references to rule files and slash commands that do not exist here.
