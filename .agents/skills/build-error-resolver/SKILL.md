---
name: build-error-resolver
description: Resolve build and TypeScript type errors with minimal diffs and no architectural edits: tsc failures, module resolution, dependency and tsconfig problems. Use when a build or typecheck is red and the goal is to get it green quickly without refactoring.
---
# Build error resolver

Get a red build or typecheck green with the smallest possible diff. No
refactoring, no architecture changes, no improvements taken along the way.

**Posture: write surface, narrowly scoped.** This skill edits code, but only
to clear the error. Anything larger belongs to another lane; see When not to
use below.

This body is a thin index. The fix catalog and the workflow live in the
bundled files below; do not grow this file.

## The three rules that bite hardest

1. **Never silence a real type error with `any`, `as` or `@ts-ignore`.**
   That does not fix the build, it converts a compile-time failure into a
   runtime one and hides it from the next reader. If the type is genuinely
   wrong, fix the type or stop and say so.
2. **Collect every error before fixing any of them.** Type errors cascade:
   one bad inference produces a dozen downstream complaints that vanish on
   their own. Fixing top-down without the full list means fixing symptoms.
3. **Use the project's own scripts and package manager.** Reaching for
   `npm run build` in a PNPM workspace, or an unpinned `npx tsc`, produces
   results that do not reproduce on anyone else's machine.

## When not to use

This skill clears the error. Hand the work on when the real problem is
something else:

- The code needs restructuring rather than a type fix.
- The failure points at an architectural decision, not a compile error.
- A feature is missing, rather than broken.
- The build compiles and the tests fail; that is a test problem.
- The error exposes a security issue. Say so and stop.

## Files

| File | Read it when |
|---|---|
| `references/common-fixes.md` | Working through the errors. The error-to-fix table, the DO and DON'T list, and the priority levels. |
| `references/workflow.md` | Starting. Diagnostic commands, the collect-then-fix loop, the cache-clearing recovery steps and the success criteria. |
| `CHANGELOG.md` | Recent changes to this skill, newest first. Rolling 30-entry window. |
| `HANDOVER.md` | What is in flight on this skill. Read first when resuming work on it. |

Read these files directly from `.agents/skills/build-error-resolver/` in the repository; the published catalogue mirrors them with version history.

## Companions

- `react-build-resolver` - when the failure is React, JSX or bundler
  specific, including hydration mismatches and server/client boundaries.
- `typescript-reviewer` - once the build is green, for the type-safety and
  security review of the change.
- `silent-failure-hunter` - if the fix involved widening a catch or adding a
  fallback, to check it did not bury the failure instead.

## Maintaining this skill

When resuming work on this skill, read `HANDOVER.md` first, then
`CHANGELOG.md`, then only the reference file the task needs. New error
patterns go in `references/common-fixes.md`; new commands in
`references/workflow.md`. This body only gains a pointer. Add a one-line
`CHANGELOG.md` entry on every meaningful change and trim past the window as
you write. Overwrite your `HANDOVER.md` section at the end of a session and
delete it when the work lands. Prefer the smallest edit primitive (`edits` /
`file_edits`) over a full replace, and chain `base_version`.

<!-- Ported from the ECC agent `build-error-resolver` (github.com/affaan-m/ECC, MIT).
     Shared prompt-defense boilerplate removed; untrusted content is handled by
     the host agent's own rules. -->