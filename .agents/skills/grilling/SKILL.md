---
name: grilling
description: Grill the user relentlessly about a plan, decision or idea to stress-test their thinking, working a design tree in rounds and putting every open decision to them before anything is built. Use when the user wants their reasoning challenged, asks to be grilled, says a plan needs pressure-testing, or before committing to an architecture that would be expensive to reverse.
license: MIT
---
# Grilling

Interview the user relentlessly until you reach a shared understanding of a
plan, decision or idea. Map it as a **design tree**: every decision branches
into the decisions that hang off it. The session ends when the tree has no
unvisited branches, not when you have enough to start.

**Posture: read-only until confirmed.** This skill produces understanding,
not code. Do not act on the outcome until the user confirms you have reached
a shared understanding.

## The three rules that bite hardest

1. **Finding facts is your job, never the user's.** When a question needs
   something from the environment - the filesystem, a tool, an API - go and
   find it. Asking the user to look something up you could have looked up
   yourself is the fastest way to lose an interview. The *decisions* are
   theirs; the *facts* are yours.
2. **A question that depends on an open question belongs in a later round.**
   Asking it now forces the user to guess at an answer they have not given
   yet, and the guess then contaminates everything downstream.
3. **Give your recommended answer with every question.** An interview that
   is only questions makes the user do all the work. The recommendation is
   what makes it a collaboration rather than an interrogation, and a wrong
   recommendation is often what surfaces the real constraint.

## The method

Work the tree in **rounds**. The **frontier** is every decision whose
prerequisites are already settled: the questions you can ask *now* without
guessing at answers you have not heard yet.

Ask the whole frontier in one round. Number each question and give your
recommended answer. Then wait for the user's answers before the next round.

Format each question like this:

```text
Q1 - <question title>: <question body, which may be several paragraphs,
including multiple choices>

-> <your recommended answer>
```

Each round of answers reshapes the tree. Settled decisions push the frontier
outward and unblock questions that depended on them. Recompute the frontier
and ask the next round.

When a frontier question needs a fact from the environment, dispatch a
sub-agent to find it. Do not block on it: a running exploration is an
unsettled prerequisite, so only the questions downstream of it wait. Ask the
rest of the frontier now.

The session is done when the frontier is empty: every branch of the design
tree visited, nothing left silently assumed.

## Variants

There is one method, invoked two ways:

- **Plain**: run the session and reach shared understanding.
- **With documentation**: run the same session, and use `domain-modeling` to
  capture the settled decisions as a `CONTEXT.md` and ADRs as you go. Prefer
  this whenever there is a repository to leave the paper trail in.

These were previously separate skills. They were near-empty stubs restating
the same approach, so they are one skill with a variant note.

## Files

| File | Read it when |
|---|---|
| `CHANGELOG.md` | Recent changes to this skill, newest first. Rolling 30-entry window. |
| `HANDOVER.md` | What is in flight on this skill. Read first when resuming work on it. |

Read these files directly from `.agents/skills/grilling/` in the repository; the published catalogue mirrors them with version history.

## Companions

- `writing-specifications` - once the tree is settled, for turning the
  understanding into a brief another agent can execute.
- `research` - when a frontier question needs an answer from outside the
  environment rather than from the user.

## Maintaining this skill

When resuming work on this skill, read `HANDOVER.md` first, then
`CHANGELOG.md`. The method is the whole skill and is short enough to live in
this body; if worked transcripts or domain-specific question banks
accumulate, put them in `references/` rather than growing this file. Add a
one-line `CHANGELOG.md` entry on every meaningful change and trim past the
window as you write. Overwrite your `HANDOVER.md` section at the end of a
session and delete it when the work lands. Prefer the smallest edit
primitive (`edits` / `file_edits`) over a full replace, and chain
`base_version`.

<!-- Adapted from mattpocock/skills (MIT), with the variant stubs folded in. -->