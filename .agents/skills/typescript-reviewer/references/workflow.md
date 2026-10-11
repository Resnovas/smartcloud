# Review workflow

How to enter a review, what to run, and how to report. Read this at the start
of a review; the findings themselves come from `references/review-priorities.md`.

## Establishing scope

Do this before commenting on anything.

1. **Pull request review**: use the actual base branch when available, for
   example `gh pr view --json baseRefName`, or the current branch's
   upstream merge-base. Do not hard-code `main`.
2. **Local review**: prefer `git diff --staged`, then `git diff`.
3. **Shallow or single-commit history**: fall back to
   `git show --patch HEAD -- '*.ts' '*.tsx' '*.js' '*.jsx'` so you still
   inspect code-level changes.
4. If none of these produce relevant TypeScript or JavaScript changes, stop
   and report that the review scope could not be established reliably. Do not
   review from the file tree instead.

## Merge readiness

Before reviewing a pull request, inspect readiness when the metadata is
available, for example
`gh pr view --json mergeStateStatus,statusCheckRollup`:

- Required checks failing or pending: stop and report that review should wait
  for green CI.
- Merge conflicts or a non-mergeable state: stop and report that conflicts
  must be resolved first.
- Readiness not verifiable from the available context: say so explicitly
  before continuing.

## Commands

Prefer the project's own scripts and its declared package manager over the
fallbacks below.

```bash
pnpm typecheck                       # canonical typecheck when the project defines one
tsc --noEmit -p <relevant-config>    # fallback, for the tsconfig that owns the changed files
eslint . --ext .ts,.tsx,.js,.jsx     # linting
prettier --check .                   # format check
pnpm audit                           # dependency advisories
vitest run                           # tests (Vitest)
jest --ci                            # tests (Jest)
```

Notes:

- When no typecheck script exists, choose the `tsconfig` file or files that
  cover the changed code rather than defaulting to the repo-root
  `tsconfig.json`. In project-reference setups, prefer the repo's
  non-emitting solution check over invoking build mode blindly.
- Skip the typecheck cleanly for JavaScript-only projects instead of failing
  the review.
- If linting or typechecking fails, stop and report rather than reviewing on
  top of a red build.

## Reading the diff

Focus on modified files, and read the surrounding context before commenting.
A finding that ignores the function it sits in is usually wrong.

## Output format

Group findings by severity. For each:

```text
[SEVERITY] short title
File: path/to/file.ts:42
Issue: one-sentence description
Why: the impact
Fix: concrete recommended change
```

Always include the file path and line number. Quote the offending snippet when
it improves clarity.

## Approval criteria

- **Approve**: no CRITICAL or HIGH issues.
- **Warning**: MEDIUM issues only; mergeable with caution.
- **Block**: any CRITICAL or HIGH issue.

Review with the mindset: would this code pass review at a well-maintained
open-source project?
