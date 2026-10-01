---
name: react-build-resolver
description: Diagnose and fix React build failures across Vite, webpack, Next.js, CRA, Parcel, esbuild and Bun: JSX and TSX compile errors, tsconfig and bundler configuration, hydration mismatches, server and client boundary errors in the App Router, duplicate React copies, and Tailwind or PostCSS pipeline failures. Use when a React build is red, when the dev server will not start, or when the page hydrates with a mismatch warning.
---
# React build resolver

Fix React build, bundler and hydration failures with minimal, surgical
changes, across Vite, webpack, Next.js, Create React App, Parcel, esbuild,
Bun and Rsbuild.

This skill owns **React build, bundler and runtime hydration** failures. A
pure TypeScript type error with no React involvement - no JSX or TSX, no
`react` import - belongs to `build-error-resolver`.

**Posture: write surface, narrowly scoped.** Edit only what the error
demands. If the error exposes an architectural problem, stop and report.

This body is a thin index. The failure-pattern catalog and the commands live
in the bundled files below; do not grow this file.

## The three rules that bite hardest

1. **"Invalid hook call" almost always means React is duplicated, not that
   the hook is wrong.** Run `npm ls react`; it must show exactly one. People
   lose hours rewriting correct hook code because the error names hooks.
2. **Re-run the build after each fix, and never stack changes.** If a fix
   surfaces a new error, treat it as a fresh diagnosis. Batched fixes make
   it impossible to tell which one worked and which one caused the next
   failure.
3. **Never disable type-checking or a lint rule to make it green, and never
   add `@ts-ignore` without an inline explanation and a TODO.** Suppression
   converts a build failure into a runtime failure and removes the signal
   that would have caught it.

## Detect the build system

Run in order, stop at the first match:

```bash
test -f next.config.js -o -f next.config.ts -o -f next.config.mjs   # Next.js
test -f vite.config.js -o -f vite.config.ts -o -f vite.config.mjs   # Vite
test -f rsbuild.config.js -o -f rsbuild.config.ts                   # Rsbuild
grep -l "react-scripts" package.json                                # CRA
test -f webpack.config.js -o -f webpack.config.ts                   # webpack
{ test -f .parcelrc || grep -q '"parcel"' package.json; }           # Parcel
{ test -f bunfig.toml && grep -q '"bun"' package.json; }            # Bun
```

## Resolution workflow

1. Run the build and capture the full error output.
2. Identify the layer: TypeScript, bundler config, runtime, or hydration.
3. Read the affected file and understand its context.
4. Apply the minimal fix the error demands.
5. Re-run the build. A new error is a fresh diagnosis, not a continuation.
6. Run the tests if there are any, to confirm behaviour did not regress.

## Stop conditions

Stop and report if:

- The same error persists after three fix attempts.
- A fix introduces more errors than it resolves.
- The fix needs architectural change beyond build resolution, for example an
  RSC boundary redesign or a database client imported into a Client
  Component.
- The bundler is on a version that no longer supports the installed React
  major.

## Files

| File | Read it when |
|---|---|
| `references/failure-patterns.md` | You have an error and want the cause. JSX and TSX compile errors, tsconfig, per-bundler issues for Vite, Next.js, webpack and CRA, hydration mismatches, runtime failures, duplicate React, and Tailwind or PostCSS. |
| `references/commands-and-output.md` | Running the build or reporting. Per-bundler build commands, the dependency-diagnosis commands, the key principles, and the output format. |
| `CHANGELOG.md` | Recent changes to this skill, newest first. Rolling 30-entry window. |
| `HANDOVER.md` | What is in flight on this skill. Read first when resuming work on it. |

Read these files directly from `.agents/skills/react-build-resolver/` in the repository; the published catalogue mirrors them with version history.

## Companions

- `build-error-resolver` - a pure TypeScript type error with no React
  involvement.
- `react-reviewer` - once the build is green, for the React code review:
  hooks, accessibility, RSC boundaries, render performance.
- `typescript-reviewer` - the generic language lane on the same diff.

For framework API detail, query Context7 rather than relying on recall;
pasted examples rot and Context7 tracks the current release.

## Maintaining this skill

When resuming work on this skill, read `HANDOVER.md` first, then
`CHANGELOG.md`, then only the reference file the task needs. New error
patterns go in `references/failure-patterns.md` under the right bundler or
category; new commands in `references/commands-and-output.md`. This body only
gains a pointer. Add a one-line `CHANGELOG.md` entry on every meaningful
change and trim past the window as you write. Overwrite your `HANDOVER.md`
section at the end of a session and delete it when the work lands. Prefer the
smallest edit primitive (`edits` / `file_edits`) over a full replace, and
chain `base_version`.

<!-- Ported from the ECC agent `react-build-resolver` (github.com/affaan-m/ECC, MIT).
     Shared prompt-defense boilerplate removed; untrusted content is handled by
     the host agent's own rules. -->