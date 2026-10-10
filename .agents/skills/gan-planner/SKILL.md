---
name: gan-planner
description: GAN harness planner. Expand a one-line prompt into a full product specification with features grouped into sprints, evaluation criteria and an explicit design direction. Use when starting a GAN harness run, or when a brief needs turning into a spec ambitious enough to be worth building against.
---
# GAN planner

The planning role in a GAN-style multi-agent harness. Take a one-line prompt
and expand it into a product specification that the generator implements and
the evaluator scores against.

**Posture: write surface.** This role writes two files into the project:
`gan-harness/spec.md` and `gan-harness/eval-rubric.md`. It writes no
application code.

This body is a thin index. The spec template and the authoring guidelines
live in the bundled files below; do not grow this file.

## The three rules that bite hardest

1. **Be deliberately ambitious.** Conservative planning is the main cause of
   an underwhelming harness run. Push for 12 to 16 features and a real
   visual identity. The generator is capable, and an easy spec wastes the
   whole loop.
2. **Specify exact values, not adjectives.** "Modern", "clean" and "blue
   theme" give the generator nothing to hit and the evaluator nothing to
   measure. `#1a73e8 primary, #f8f9fa background` does both.
3. **Write the rubric as a separate file, in a form the evaluator can
   consume directly.** Burying the criteria inside the spec prose means the
   evaluator reconstructs them by inference, and the two halves of the loop
   then drift apart.

## Process

1. Read the brief.
2. Research: if the prompt references a recognisable kind of app, read any
   existing examples or specs in the codebase first.
3. Write the full specification to `gan-harness/spec.md`, following
   `references/spec-template.md`.
4. Write a concise `gan-harness/eval-rubric.md` carrying the evaluation
   criteria on their own.

## Files

| File | Read it when |
|---|---|
| `references/spec-template.md` | Writing the spec. The full section-by-section template: vision, design direction, prioritised features, stack, evaluation criteria with weights, sprint plan. |
| `references/guidelines.md` | Deciding how specific to be. The seven authoring rules, including naming the app, defining user flows, and the anti-AI-slop directives. |
| `CHANGELOG.md` | Recent changes to this skill, newest first. Rolling 30-entry window. |
| `HANDOVER.md` | What is in flight on this skill. Read first when resuming work on it. |

Read these files directly from `.agents/skills/gan-planner/` in the repository; the published catalogue mirrors them with version history.

## Companions

- `gan-generator` - the build half of the loop, which consumes the spec.
- `gan-evaluator` - the judging half, which consumes the rubric.
- `writing-specifications` - the general briefing discipline, for work that
  is not a harness run.

## Maintaining this skill

When resuming work on this skill, read `HANDOVER.md` first, then
`CHANGELOG.md`, then only the reference file the task needs. Template changes
go in `references/spec-template.md`; authoring rules in
`references/guidelines.md`. This body only gains a pointer. Add a one-line
`CHANGELOG.md` entry on every meaningful change and trim past the window as
you write. Overwrite your `HANDOVER.md` section at the end of a session and
delete it when the work lands. Prefer the smallest edit primitive (`edits` /
`file_edits`) over a full replace, and chain `base_version`.

<!-- Ported from the ECC agent `gan-planner` (github.com/affaan-m/ECC, MIT).
     Shared prompt-defense boilerplate removed; untrusted content is handled by
     the host agent's own rules. -->