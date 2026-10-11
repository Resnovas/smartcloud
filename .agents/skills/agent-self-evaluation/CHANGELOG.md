# Changelog

Rolling window - the last 30 entries, newest first. When you add an entry,
delete anything past the thirtieth. Do not archive: store versions are
immutable, so the full history already exists at no cost. Leave a single
pointer at the bottom naming the cutoff version when you trim.

One terse line per change. If an entry wants a second sentence, that sentence
belongs in a reference file and the line points at it.

## 2026-09-19

- Migrated from the local `.agents/skills` tree into the store in house style: thin index body over five reference files.
- Absorbed the separate `agent-evaluator` skill as `references/evaluating-another-agent.md`. The two skills shared one rubric and one report format, and the only real difference was the reviewer's stance and the read-only verification constraint.
- Did not migrate `scripts/evaluate.py`, the 15KB keyword-heuristic scorer. Its own docstring calls it a first pass to be paired with an LLM judge, and every consumer of this store is one; the report format it produced is preserved in `references/report-template.md`. Re-add it if a non-LLM caller needs it.
