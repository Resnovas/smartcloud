---
name: code-review
description: Review the changes since a fixed point (commit, branch, tag or merge-base) along two independent axes: Standards, meaning does the code follow this repo's documented conventions plus a Fowler smell baseline, and Spec, meaning does it implement what the originating issue asked for. Runs both as parallel sub-agents and reports them side by side without merging. Use when reviewing a branch, a pull request, work in progress, or when asked to review since a given point.
license: MIT
---
# Code review

Two-axis review of the diff between `HEAD` and a fixed point the user
supplies:

- **Standards** - does the code conform to this repo's documented coding
  standards, plus a baseline of Fowler code smells?
- **Spec** - does the code faithfully implement the originating issue or
  spec?

Both axes run as parallel sub-agents so they do not pollute each other's
context, and this skill aggregates their findings without merging them.

**Posture: read-only.** This skill reports findings. It does not fix them.

This body is a thin index. The smell baseline, the sub-agent prompts and the
confidence gate live in the bundled files below; do not grow this file.

## The three rules that bite hardest

1. **Read `references/confidence.md` before reporting anything, and pass it
   to both sub-agents.** Manufactured findings are the primary failure mode
   of an LLM reviewer: filler nits train the reader to skim, which costs
   more than a missed finding. Zero findings is a valid review.
2. **Never merge or rerank the two axes.** Code can follow every standard
   and implement the wrong thing, or do exactly what the issue asked and
   break every convention. Reporting them separately is the entire point;
   merging lets one axis mask the other.
3. **Validate the fixed point before spawning anything.** Confirm
   `git rev-parse <fixed-point>` resolves and the diff is non-empty. A bad
   ref should fail here, not twice over inside two parallel sub-agents.

## Process

1. **Pin the fixed point.** Whatever the user named: a SHA, branch, tag,
   `main`, `HEAD~5`. If they did not name one, ask. Capture
   `git diff <fixed-point>...HEAD` (three dots, so the comparison is against
   the merge-base) and `git log <fixed-point>..HEAD --oneline`. Validate
   before continuing.
2. **Identify the spec source**, in order: issue references in the commit
   messages; a path the user passed; a spec file under `docs/`, `specs/` or
   `.scratch/` matching the branch or feature; otherwise ask. If there is
   genuinely no spec, the Spec axis skips and reports so.
3. **Identify the standards sources.** Anything documenting how code should
   be written here, such as `CODING_STANDARDS.md` or `CONTRIBUTING.md`, plus
   the smell baseline in `references/smell-baseline.md`.
4. **Spawn both sub-agents in parallel**, using the briefs in
   `references/subagent-prompts.md`.
5. **Aggregate.** Present both reports under `## Standards` and `## Spec`,
   verbatim or lightly cleaned, then one summary line: findings per axis and
   the worst issue within each axis. Do not pick a winner across axes.

If the repo has no issue-tracker workflow documented, ask which tracker it
uses and how to query it before starting the Spec axis.

## Files

| File | Read it when |
|---|---|
| `references/confidence.md` | Always, before reporting, and pass it to both sub-agents. The 80 percent threshold, the four-question pre-report gate, what high and critical must carry, and the known false positives. |
| `references/smell-baseline.md` | Building the Standards brief. The twelve Fowler smells, each as what-it-is then how-to-fix, and the two rules binding them. |
| `references/subagent-prompts.md` | Spawning the sub-agents. The exact Standards and Spec briefs, what to paste into each, and the aggregation rule. |
| `CHANGELOG.md` | Recent changes to this skill, newest first. Rolling 30-entry window. |
| `HANDOVER.md` | What is in flight on this skill. Read first when resuming work on it. |

Read these files directly from `.agents/skills/code-review/` in the repository; the published catalogue mirrors them with version history.

## Companions

- `typescript-reviewer`, `python-reviewer`, `react-reviewer`,
  `database-reviewer` - the language and domain review lanes. Those apply a
  fixed severity catalog to a diff; this skill reviews against *this repo's*
  standards and *this change's* spec, which no generic lane can know.
- `commit` - getting the reviewed change onto the target branch.
- `silent-failure-hunter` - a focused sweep on one defect class, when the
  Standards axis keeps surfacing swallowed errors.

## Maintaining this skill

When resuming work on this skill, read `HANDOVER.md` first, then
`CHANGELOG.md`, then only the reference file the task needs. New smells go
in `references/smell-baseline.md`; prompt changes in
`references/subagent-prompts.md`; new false positives in
`references/confidence.md`, which is the file most worth growing as real
reviews expose them. This body only gains a pointer. Add a one-line
`CHANGELOG.md` entry on every meaningful change and trim past the window as
you write. Overwrite your `HANDOVER.md` section at the end of a session and
delete it when the work lands. Prefer the smallest edit primitive (`edits` /
`file_edits`) over a full replace, and chain `base_version`.

<!-- Adapted from mattpocock/skills (MIT). The confidence gate is adapted from
     the ECC `code-reviewer` agent (github.com/affaan-m/ECC, MIT). -->