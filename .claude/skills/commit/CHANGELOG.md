# Changelog

Rolling window - the last 30 entries, newest first. When you add an entry,
delete anything past the thirtieth. Do not archive: store versions are
immutable, so the full history already exists at no cost. Leave a single
pointer at the bottom naming the cutoff version when you trim.

One terse line per change. If an entry wants a second sentence, that sentence
belongs in a reference file and the line points at it.

## 2026-09-27

- Replaced the ban on AI attribution with the AI policy: AI-02 trailers on every agent commit, and agent PRs as drafts carrying the AI disclosure.

## 2026-09-25

- Required a DCO `Signed-off-by` for the configured git author on every commit.

- Forbade AI/agent `Co-Authored-By` trailers and "Generated with" footers in commits and PRs, regardless of host tool defaults.

## 2026-09-19

- Migrated from the local `.agents/skills` tree into the store, and restructured to house style: thin index body, publishing, message shape and duration moved to `references/`.
- Generalised the machine-specific vault path and the named activity-capture tool, so the skill is portable across agents reading it from the store.