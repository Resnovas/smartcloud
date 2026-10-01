---
name: eval-harness
description: Eval-driven development for agent workflows: define capability and regression evals before implementing, grade them with code, rule, model and human graders, and measure reliability with pass@k and pass^k. Use when an agent workflow needs a formal eval before it is trusted or changed, when setting pass/fail criteria for task completion, when building a regression suite for a prompt or agent change, or when benchmarking across model versions.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---
# Eval harness

Eval-driven development for agent workflows. Evals are the unit tests of AI
development: define the expected behaviour before implementing, run them
continuously, track regressions on every change, and measure reliability with
pass@k rather than by impression.

**Posture: measurement.** This skill defines and runs evaluations and reports
results. It does not implement the feature under test, and it never promotes
a change on its own.

This body is a thin index. The eval templates, grader types, metrics and
workflow live in the bundled files below; do not grow this file.

## The three rules that bite hardest

1. **Define the evals before writing the code.** Written afterwards, they
   describe what you built rather than what was needed, and they will pass.
   That is the whole failure mode eval-driven development exists to prevent.
2. **Never present static analysis, a passing utility test, or a signed
   receipt as evidence that candidate code was safely executed.** They are
   different claims. See `references/execution-safety.md`; getting this
   wrong means reporting a containment guarantee you do not have.
3. **A flaky grader in a release gate is worse than no gate.** It trains
   everyone to re-run until green, which silently converts pass^3 into
   pass@many. Fix or remove the grader.

## Eval types at a glance

- **Capability evals** - can the agent do something it could not before?
  Target pass@3 at 0.90 or above.
- **Regression evals** - do the existing behaviours still work? Target
  pass^3 at 1.00 for release-critical paths.

## Files

| File | Read it when |
|---|---|
| `references/eval-types-and-graders.md` | Writing evals. The capability and regression templates, and the four grader types: code, rule, model and human. |
| `references/metrics-and-workflow.md` | Running and reporting. pass@k versus pass^k, recommended thresholds, the four-step define-implement-evaluate-report workflow, the report format, the artifact layout, and the eval anti-patterns. |
| `references/execution-safety.md` | Before executing or scoring candidate code. What a containment boundary actually requires, and which claims must never be substituted for it. |
| `CHANGELOG.md` | Recent changes to this skill, newest first. Rolling 30-entry window. |
| `HANDOVER.md` | What is in flight on this skill. Read first when resuming work on it. |

Read these files directly from `.agents/skills/eval-harness/` in the repository; the published catalogue mirrors them with version history.

## Companions

- `harness-optimizer` - applies this methodology to harness configuration
  itself. Its `EVAL REPORT` format is a direct derivative of the one here,
  so changes to the report shape need to land in both.
- `agent-self-evaluation` - a five-axis scorecard for a single run, when the
  question is the quality of one output rather than the reliability of a
  workflow across trials.
- `code-review` - for judging a change against standards and spec, which is
  a different question from whether it passes an eval.

## Maintaining this skill

When resuming work on this skill, read `HANDOVER.md` first, then
`CHANGELOG.md`, then only the reference file the task needs. New grader
types or templates go in `references/eval-types-and-graders.md`; metric and
workflow changes in `references/metrics-and-workflow.md`. Keep the threshold
numbers in sync with `harness-optimizer`, which cites them. This body only
gains a pointer. Add a one-line `CHANGELOG.md` entry on every meaningful
change and trim past the window as you write. Overwrite your `HANDOVER.md`
section at the end of a session and delete it when the work lands. Prefer
the smallest edit primitive (`edits` / `file_edits`) over a full replace,
and chain `base_version`.