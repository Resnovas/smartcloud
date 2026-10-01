---
name: writing-specifications
description: Write a brief an agent can execute without guessing: goal, context, validation, out-of-scope and escalation. Use when creating a work-tracking card, delegating a task to another agent or a report, turning a vague request into executable work, or reviewing whether a brief is ready to send.
---
# Writing specifications

Write a brief the receiving agent can execute without guessing. Five sections,
all of them, every time: goal, context, validation, out of scope, escalation.

Most failed agent work is not a capability problem. It is a brief that left
the outcome, the constraints or the finish line unstated, and the agent filled
the gap with a plausible assumption.

This body is a thin index. The section-by-section guidance and worked examples
live in the bundled files below; do not grow this file.

## The three rules that bite hardest

1. **Validation is the section that gets dropped, and it is the one that
   decides whether the work is acceptable.** "Works properly" and "is well
   tested" are not validation. If you cannot write a condition someone could
   check, the requirement is not understood yet and the card is not ready to
   send.
2. **State the goal as an outcome, not as a step.** "Create a reservations
   module" forecloses the better design the specialist might see. "Exhibitors
   can reserve a stand and pay a deposit online" does not.
3. **A short specification with all five sections beats a long one missing
   one.** Length is not the quality signal; completeness is.

## The five sections

| Section | Answers |
|---|---|
| 1. Goal | What outcome, and why it matters |
| 2. Context | What already exists that the work must fit |
| 3. Validation | How both of you will know it is done |
| 4. Out of scope | What you are explicitly not asking for |
| 5. Escalation | When to stop rather than proceed on a guess |

## Files

| File | Read it when |
|---|---|
| `references/sections.md` | Writing the brief. Each of the five sections in detail, with worked examples of a good and a bad version. |
| `references/judging.md` | Before you send. The four-question read-back that catches an unusable brief, and where specifications live. |
| `CHANGELOG.md` | Recent changes to this skill, newest first. Rolling 30-entry window. |
| `HANDOVER.md` | What is in flight on this skill. Read first when resuming work on it. |

Read these files directly from `.agents/skills/writing-specifications/` in the repository; the published catalogue mirrors them with version history.

## Companions

- `workboard` - creating, assigning and dispatching the card this brief goes
  on, and why a claimed card cannot be re-briefed.
- `grilling` - when the request is not yet understood well enough to specify
  and needs an interview first.
- `research` - when the context section cannot be written without finding
  something out first.

## Maintaining this skill

When resuming work on this skill, read `HANDOVER.md` first, then
`CHANGELOG.md`. Add a one-line `CHANGELOG.md` entry on every meaningful
change and trim past the window as you write. Overwrite your `HANDOVER.md`
section at the end of a session and delete it when the work lands.

The five sections are the stable spine and should not change. New guidance
about how to write one of them goes in `references/sections.md`; new failure
modes to catch before sending go in `references/judging.md`. This body only
gains a pointer. Prefer the smallest edit primitive (`edits` / `file_edits`)
over a full replace, and chain `base_version`.