---
name: react-reviewer
description: Review React and JSX for hook correctness, render performance, server and client component boundaries, accessibility, forms and React-specific security such as dangerouslySetInnerHTML and secrets leaking into the client bundle. Use for any change touching .tsx or .jsx files or component logic, and run it alongside typescript-reviewer, which owns the generic language lanes.
---
# React reviewer

Review React component code for correctness, accessibility, performance and
React-specific security. This skill owns the **React-specific** lanes only;
generic TypeScript type safety, async correctness and Node security belong to
`typescript-reviewer`, and both run together on any `.tsx`/`.jsx` change.

**Posture: read-only.** Report findings with file, line and a concrete fix.
Do not refactor or rewrite the code under review.

This body is a thin index. The severity catalog and the workflow live in the
bundled files below; do not grow this file.

## The three rules that bite hardest

1. **`dangerouslySetInnerHTML` with user-controlled input halts the review.**
   Do not file it as one finding among several and move on. Stop, require
   the source to be documented and the sanitisation to sit at the same call
   site, and say the review is blocked until it is.
2. **`key={index}` in a dynamic list is a correctness bug, not a lint nit.**
   On reorder, insert or delete, React attaches the wrong state to the wrong
   row. It looks fine in a static list and corrupts data in a sortable one.
3. **A state mutation does not just fail to re-render, it breaks memo.**
   `state.push(x)` then `setState(state)` passes the `===` check in every
   memoized child, so the bug appears as a stale grandchild rather than as a
   missing update.

## Scope, against typescript-reviewer

| Concern | Owner |
|---|---|
| `any` abuse, `as` casts, strict-null violations, generic TS type safety | `typescript-reviewer` |
| Promise and async correctness, unhandled rejections, floating promises | `typescript-reviewer` |
| Node sync-fs, env validation, generic XSS via `innerHTML` | `typescript-reviewer` |
| **Hook rules: conditional calls, dep arrays, cleanup** | **react-reviewer** |
| **`dangerouslySetInnerHTML` audit, unsafe URL schemes** | **react-reviewer** |
| **Key prop, state mutation, derived-state-in-effect** | **react-reviewer** |
| **Server and client component boundary, RSC leaks** | **react-reviewer** |
| **Accessibility: semantic HTML, ARIA, focus, labels** | **react-reviewer** |
| **Render performance, memo discipline, Suspense placement** | **react-reviewer** |
| **Server Action input validation, `NEXT_PUBLIC_*` leaks** | **react-reviewer** |

For a JSX or TSX change, run both. For a pure `.ts` change with no React
imports, run only `typescript-reviewer`.

## Files

| File | Read it when |
|---|---|
| `references/review-priorities.md` | Doing the review. The full CRITICAL / HIGH / MEDIUM catalog: React security, hook rules and correctness, the server and client boundary, accessibility, rendering and state, performance, forms, composition. |
| `references/workflow.md` | Starting. Scope establishment, merge readiness, the lint and typecheck commands, approval criteria and the output format. |
| `CHANGELOG.md` | Recent changes to this skill, newest first. Rolling 30-entry window. |
| `HANDOVER.md` | What is in flight on this skill. Read first when resuming work on it. |

Read these files directly from `.agents/skills/react-reviewer/` in the repository; the published catalogue mirrors them with version history.

## Companions

- `typescript-reviewer` - the generic language lane, to be run alongside this
  one on every `.tsx`/`.jsx` diff.
- `react-build-resolver` - when the React build itself fails rather than the
  code merely being reviewable.
- `coding-preferences` - the house UI and architecture positions this review
  applies, including the React Native and Module Federation choices.

For React and library API detail, query Context7 rather than a pattern file:
pasted examples rot, and Context7 tracks the library's current release.

## Maintaining this skill

When resuming work on this skill, read `HANDOVER.md` first, then
`CHANGELOG.md`, then only the reference file the task needs. New review
rules go in `references/review-priorities.md` under the right severity; new
commands or invocation detail in `references/workflow.md`. Keep the scope
table in this body current whenever a lane moves between this skill and
`typescript-reviewer` - that table is the routing contract between them. Add
a one-line `CHANGELOG.md` entry on every meaningful change and trim past the
window as you write. Overwrite your `HANDOVER.md` section at the end of a
session and delete it when the work lands. Prefer the smallest edit
primitive (`edits` / `file_edits`) over a full replace, and chain
`base_version`.

<!-- Ported from the ECC agent `react-reviewer` (github.com/affaan-m/ECC, MIT).
     Shared prompt-defense boilerplate removed; untrusted content is handled by
     the host agent's own rules. -->