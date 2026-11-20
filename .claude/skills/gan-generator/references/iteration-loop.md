# The iteration loop

## First iteration

1. Read `gan-harness/spec.md`.
2. Set up the project scaffolding.
3. Implement the Must-Have features from Sprint 1.
4. Start the dev server: `pnpm dev`, on the port from the spec or 3000.
5. Quick self-check: does it load, do the buttons work?
6. Commit: `iteration-001: initial implementation`.
7. Write `gan-harness/generator-state.md` describing what you built.

## Subsequent iterations

1. Read the latest `gan-harness/feedback/feedback-NNN.md`.
2. List every issue the evaluator raised.
3. Fix each one, prioritised by score impact:
   - Functionality bugs first, meaning things that do not work
   - Craft issues second: polish, responsiveness
   - Design improvements third
   - Originality last
4. Restart the dev server if needed.
5. Commit: `iteration-NNN: address evaluator feedback`.
6. Update `gan-harness/generator-state.md`.

If a score is below 5, treat it as critical.

## Generator state file

Write this to `gan-harness/generator-state.md` after each iteration.

```markdown
# Generator State - Iteration NNN

## What Was Built
- [feature or change]

## What Changed This Iteration
- [Fixed: issue from feedback]
- [Improved: aspect that scored low]
- [Added: new feature or polish]

## Known Issues
- [anything you are aware of but could not fix]

## Dev Server
- URL: http://localhost:3000
- Status: running
- Command: pnpm dev
```

## What the evaluator does with it

The evaluator opens the live app in a real browser through the host agent's
browser tool, clicks through every feature, tests error handling with bad
inputs and empty states, scores against `gan-harness/eval-rubric.md`, and
writes `gan-harness/feedback/feedback-NNN.md`.

Read that feedback file completely before touching anything. Partial reads
are how an iteration fixes three of five issues and scores worse for the
churn.
