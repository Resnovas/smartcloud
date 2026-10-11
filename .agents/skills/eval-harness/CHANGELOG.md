# Changelog

Rolling window - the last 30 entries, newest first. When you add an entry,
delete anything past the thirtieth. Do not archive: store versions are
immutable, so the full history already exists at no cost. Leave a single
pointer at the bottom naming the cutoff version when you trim.

One terse line per change. If an entry wants a second sentence, that sentence
belongs in a reference file and the line points at it.

## 2026-09-19

- Migrated from the local `.agents/skills` tree into the store in house style: thin index body, eval types, metrics and execution safety moved to `references/`.
- Generalised the "Local Framework Utilities" section, which described one machine's `scripts/lib/eval-harness/` implementation; its containment guarantees are now stated as requirements in `references/execution-safety.md` rather than as facts about a specific local tool.
- Moved the `tools` frontmatter key to `allowed_tools`, which is the field the store and the Agent Skills spec use.
