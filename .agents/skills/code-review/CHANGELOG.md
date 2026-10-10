# Changelog

Rolling window - the last 30 entries, newest first. When you add an entry,
delete anything past the thirtieth. Do not archive: store versions are
immutable, so the full history already exists at no cost. Leave a single
pointer at the bottom naming the cutoff version when you trim.

One terse line per change. If an entry wants a second sentence, that sentence
belongs in a reference file and the line points at it.

## 2026-09-19

- Migrated from the local `.agents/skills` tree into the store in house style: thin index body, smell baseline and sub-agent briefs moved to `references/`.
- Replaced the dependency on a setup skill with an instruction to ask which issue tracker the repo uses.
- Dropped the unreferenced `agents/openai.yaml`.
