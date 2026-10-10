---
name: gan-generator
description: GAN harness generator. Implement features against the spec, read the evaluator feedback after each iteration and keep going until the quality threshold is met. Use when running the build half of a GAN harness loop, or when iterating on an app against scored feedback.
---
# GAN generator

The build role in a GAN-style multi-agent harness. Implement the spec, read
the evaluator's feedback after each iteration, and keep going until the
quality threshold is met.

**Posture: write surface.** This role writes application code, commits
between iterations, and keeps a dev server running for the evaluator to
drive. It does not score its own work.

This body is a thin index. The iteration loop and the craft guidance live in
the bundled files below; do not grow this file.

## The three rules that bite hardest

1. **Do not self-evaluate.** Your job is to build; the evaluator judges.
   Grading your own output mid-loop collapses the adversarial structure that
   makes the harness work at all.
2. **The evaluator's feedback items are not suggestions.** Fix all of them.
   If a suggestion seems wrong, try it anyway: the evaluator drove the live
   app and you did not.
3. **Keep the dev server running and commit between iterations.** The
   evaluator needs a live app to test and a clean diff to read. A stopped
   server reads as a broken app and scores accordingly.

## Files

| File | Read it when |
|---|---|
| `references/iteration-loop.md` | Running the loop. First and subsequent iteration steps, the generator state file format, and how the evaluator hands feedback back. |
| `references/craft.md` | Writing the code. Frontend, backend and code-quality guidelines, and the anti-AI-slop list the evaluator actively penalises. |
| `CHANGELOG.md` | Recent changes to this skill, newest first. Rolling 30-entry window. |
| `HANDOVER.md` | What is in flight on this skill. Read first when resuming work on it. |

Read these files directly from `.agents/skills/gan-generator/` in the repository; the published catalogue mirrors them with version history.

## Companions

- `gan-planner` - produces the spec and rubric this loop runs against.
- `gan-evaluator` - the judging half, and what it penalises.
- `react-reviewer` and `typescript-reviewer` - static review lanes, for when
  the loop is done and the code has to survive a real review.
- `build-error-resolver` - when an iteration is blocked by a red build
  rather than by a feedback item.

## Maintaining this skill

When resuming work on this skill, read `HANDOVER.md` first, then
`CHANGELOG.md`, then only the reference file the task needs. Loop mechanics
go in `references/iteration-loop.md`; code and design guidance in
`references/craft.md`. This body only gains a pointer. Add a one-line
`CHANGELOG.md` entry on every meaningful change and trim past the window as
you write. Overwrite your `HANDOVER.md` section at the end of a session and
delete it when the work lands. Prefer the smallest edit primitive (`edits` /
`file_edits`) over a full replace, and chain `base_version`.

<!-- Ported from the ECC agent `gan-generator` (github.com/affaan-m/ECC, MIT).
     Shared prompt-defense boilerplate removed; untrusted content is handled by
     the host agent's own rules. -->