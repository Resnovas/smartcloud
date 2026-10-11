---
name: typescript-reviewer
description: Review TypeScript and JavaScript for type safety, async correctness, error handling, Node and web security, performance and idiomatic patterns. Use for any change touching .ts, .tsx or .js files, when reviewing a TypeScript pull request, or when asked whether TypeScript code is safe or idiomatic.
---
# TypeScript reviewer

Review a TypeScript or JavaScript change for type safety, async correctness,
error handling, Node and web security, performance and idiom. This skill owns
the generic language lanes; React-specific concerns belong to `react-reviewer`
and the two run together on any `.tsx`/`.jsx` diff.

**Posture: read-only.** Report findings with file, line and a concrete fix.
Do not refactor or rewrite the code under review.

This body is a thin index. The detail lives in the bundled files below; do not
grow this file.

## The three rules that bite hardest

1. **Establish the scope before you comment, and never hard-code `main`.**
   Use the real base branch (`gh pr view --json baseRefName`) or the current
   branch's merge-base. Reviewing against the wrong ref produces findings on
   code the author never touched, which is the fastest way to lose a reader.
2. **If lint or typecheck fails, stop and report.** A review written on top of
   a red build is noise: half the findings are downstream of the compile
   error, and the author has to re-read everything after fixing it.
3. **Zero findings is a valid result.** Manufacturing a MEDIUM to look
   thorough costs more trust than it buys. Say the change is clean.

## Files

Pull only what the task needs.

| File | Read it when |
|---|---|
| `references/review-priorities.md` | Doing the actual review. The full CRITICAL / HIGH / MEDIUM catalog: security, type safety, async correctness, error handling, idiom, Node specifics, performance. |
| `references/workflow.md` | Starting a review. Scope establishment, merge-readiness checks, which typecheck and lint commands to run, approval criteria and output format. |
| `CHANGELOG.md` | Recent changes to this skill, newest first. Rolling 30-entry window. |
| `HANDOVER.md` | What is in flight on this skill. Read first when resuming work on it. |

Read these files directly from `.agents/skills/typescript-reviewer/` in the repository; the published catalogue mirrors them with version history.

## Companions

- `react-reviewer` - the React lane (hooks, RSC boundaries, accessibility,
  render performance). Run it alongside this skill on any `.tsx`/`.jsx` diff;
  run this one alone for a pure `.ts` change with no React imports.
- `type-design-analyzer` - whether the types make illegal states
  unrepresentable, as opposed to whether they merely compile.
- `silent-failure-hunter` - a focused sweep on swallowed errors across a
  codebase rather than within one diff.
- `build-error-resolver` - when the typecheck is red and the job is to get it
  green rather than to review it.
- `coding-preferences` - the house language, tooling and architecture choices
  this review applies.

For library API detail, query Context7 rather than relying on recall; pasted
examples rot and Context7 tracks the current release.

## Maintaining this skill

When resuming work on this skill, read `HANDOVER.md` first, then
`CHANGELOG.md`. Add a one-line `CHANGELOG.md` entry on every meaningful
change and trim past the window as you write. Overwrite your `HANDOVER.md`
section at the end of a session and delete it when the work lands.

New review rules go in `references/review-priorities.md` under the right
severity, not in this body. New tooling or invocation detail goes in
`references/workflow.md`. This body only gains a pointer. Prefer the smallest
edit primitive (`edits` / `file_edits`) over a full replace, and chain
`base_version` between writes.

<!-- Ported from the ECC agent `typescript-reviewer` (github.com/affaan-m/ECC, MIT).
     Shared prompt-defense boilerplate removed; untrusted content is handled by
     the host agent's own rules. -->