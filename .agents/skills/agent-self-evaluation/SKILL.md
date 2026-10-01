---
name: agent-self-evaluation
description: Rate agent output against a five-axis rubric - accuracy, completeness, clarity, actionability, conciseness - with concrete evidence per axis and a 1-5 scorecard, then act on the weakest axis. Use after any non-trivial task: a change spanning several files, a multi-step workflow, a debugging session that took several attempts, or a written design or analysis. Also use when scoring another agent's output rather than your own.
---
# Agent self-evaluation

After completing a non-trivial task, pause and rate the output against a
five-axis rubric. This is **not** a pass/fail gate. It is a deliberate
reflection step that catches omissions, flags overconfidence, and surfaces
weaknesses before the user has to.

**Posture: assessment, then one action.** The evaluation is not the
deliverable. A weak axis is either fixed on the spot or explicitly flagged;
scoring and then delivering unchanged wastes the exercise.

This body is a thin index. The scoring anchors, worked examples, report
template and the external-evaluator stance live in the bundled files below;
do not grow this file.

## The three rules that bite hardest

1. **Every score below 5 must cite specific evidence.** A 3 cannot say
   "could be better"; it must say exactly what is missing or wrong. Show the
   gap, do not just name it. A scorecard of unevidenced numbers is theatre.
2. **Tool output is ground truth.** If you claimed "tests pass" and the
   terminal shows a failure, that is an automatic Accuracy of 2 or below.
   Claims without verification are the single commonest source of a low
   accuracy score.
3. **A simple task done perfectly is a 5.** The rubric scales with
   complexity. Do not invent gaps to justify a lower score, and do not score
   every axis 4 out of modesty. Both distort the signal the exercise exists
   to produce.

## The five axes

| Axis | Question | What it catches |
|---|---|---|
| **Accuracy** | Are the facts, claims and outputs correct? | Hallucinations, wrong API names, incorrect syntax, false statements |
| **Completeness** | Did it cover everything asked? | Missed edge cases, unhandled error paths, forgotten requirements, skipped subtasks |
| **Clarity** | Is the explanation understandable and well structured? | Confusing explanations, undefined jargon, missing context, rambling |
| **Actionability** | Can the user act on it immediately? | Vague suggestions, missing steps, "you should X" without showing how, no verification path |
| **Conciseness** | Did it use the minimum words needed? | Redundancy, over-explanation, restating the question, filler |

```text
5 - Exceptional: no reasonable improvement possible
4 - Good: minor nits only, no substantive gaps
3 - Adequate: meets the request, one notable weakness
2 - Weak: a clear gap affecting usability or correctness
1 - Poor: fundamentally misses the request, or significant errors
```

## Workflow

1. **Collect the raw material**: the original request, your final output, any
   tool output verifying correctness, and any corrections the user made
   during the task.
2. **Score each axis independently.** Do not average in your head and work
   backwards. For each axis: read the question, find the evidence or its
   absence, assign 1 to 5, and if below 5 write a one-sentence improvement
   citing the gap.
3. **Produce the report** using `references/report-template.md`.
4. **Act on the weakest axis.** If anything scored 3 or below: state what you
   would do differently; fix it now if the gap takes under 30 seconds, such
   as a missing link or unclear phrasing; otherwise flag it explicitly with
   the score it would reach if fixed.

## Files

Pull only what the task needs.

| File | Read it when |
|---|---|
| `references/evaluation-criteria.md` | A score is borderline, a 4 against a 3 or a 2 against a 1. Concrete anchors and a worked example for every band on every axis, plus the edge cases: ambiguous instructions, inherently simple tasks, errors you caught yourself. |
| `references/report-template.md` | Writing the report. The full scorecard format, the scoring-trigger table that maps a symptom to a ceiling, when to skip evaluating at all, and what to do at each overall score. |
| `references/worked-examples.md` | You want to see the rubric applied. A strong evaluation and a weak one on the same task, with the evidence that produced each score. |
| `references/evaluating-another-agent.md` | Scoring someone else's output rather than your own. The change of stance, the read-only verification constraint, and the failure mode specific to external review. |
| `references/hook-integration.md` | Wiring an automatic reminder at session end. Opt-in hook configuration, and why manual invocation is usually the better choice. |
| `CHANGELOG.md` | Recent changes to this skill, newest first. Rolling 30-entry window. |
| `HANDOVER.md` | What is in flight on this skill. Read first when resuming work on it. |

Read these files directly from `.agents/skills/agent-self-evaluation/` in the repository; the published catalogue mirrors them with version history.

## Companions

- `eval-harness` - when the question is the reliability of a workflow across
  repeated trials rather than the quality of one output. That is pass@k
  territory; this is a scorecard.
- `harness-optimizer` - when repeated weak scores point at the harness
  configuration rather than at any single run.
- `code-review` - when the output under assessment is a code change and the
  real question is whether it meets the repo's standards and its spec.

## Maintaining this skill

When resuming work on this skill, read `HANDOVER.md` first, then
`CHANGELOG.md`, then only the reference file the task needs. New scoring
anchors go in `references/evaluation-criteria.md`; new report mechanics in
`references/report-template.md`; new worked cases in
`references/worked-examples.md`. The five axes are the stable spine and
should not change without a good reason, because every stored scorecard is
measured against them. This body only gains a pointer. Add a one-line
`CHANGELOG.md` entry on every meaningful change and trim past the window as
you write. Overwrite your `HANDOVER.md` section at the end of a session and
delete it when the work lands. Prefer the smallest edit primitive (`edits` /
`file_edits`) over a full replace, and chain `base_version`.