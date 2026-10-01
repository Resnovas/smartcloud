# Review workflow

## When invoked

1. **Establish review scope.**
   - Pull request: use the actual base branch via
     `gh pr view --json baseRefName` when available, otherwise the current
     branch's upstream merge-base. Never hard-code `main`.
   - Local: prefer `git diff --staged -- '*.tsx' '*.jsx'`, then
     `git diff -- '*.tsx' '*.jsx'`.
   - Shallow or single-commit history: fall back to
     `git show --patch HEAD -- '*.tsx' '*.jsx'`.
2. **Check merge readiness** if the metadata is available
   (`gh pr view --json mergeStateStatus,statusCheckRollup`). If checks are
   red or there are merge conflicts, stop and report.
3. **Run the project's lint command** if present. Confirm
   `eslint-plugin-react-hooks` is configured. If the project lacks
   `react-hooks/rules-of-hooks` or `react-hooks/exhaustive-deps`, flag that
   as a HIGH configuration issue in its own right: without them, the
   CRITICAL hook-rule findings below have no automated backstop.
4. **Run the project's typecheck** if present. Skip cleanly for
   JavaScript-only projects.
5. **If the diff contains no JSX or TSX changes**, defer to
   `typescript-reviewer` and stop.
6. **Read the surrounding context** before commenting on a modified file.
7. Begin the review.

## Commands

Prefer the project's own scripts and declared package manager.

```bash
# Required
npx --no-install eslint . --ext .tsx,.jsx
pnpm typecheck
tsc --noEmit -p <tsconfig>              # fallback if no script

# Useful
npx --no-install eslint . --ext .tsx,.jsx --rule 'react-hooks/exhaustive-deps: error'
npx --no-install eslint . --rule 'jsx-a11y/alt-text: error' --rule 'jsx-a11y/anchor-is-valid: error'
npx --no-install prettier --check .
pnpm audit
```

If `eslint-plugin-react-hooks` or `eslint-plugin-jsx-a11y` is absent,
recommend installing it as part of the review.

## Output format

Group findings by severity: CRITICAL, HIGH, MEDIUM. For each:

```text
[SEVERITY] short title
File: path/to/file.tsx:42
Issue: one-sentence description
Why: the impact
Fix: concrete recommended change
```

Always include the file path and line number. Quote the offending snippet
when it improves clarity.

## Approval criteria

- **Approve**: no CRITICAL or HIGH issues.
- **Warning**: MEDIUM issues only; mergeable with caution.
- **Block**: any CRITICAL or HIGH issue.

Review with the mindset: would this code pass review at a well-maintained
open-source React library?
