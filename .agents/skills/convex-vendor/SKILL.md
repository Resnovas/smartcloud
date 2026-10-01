---
name: convex-vendor
description: Convex-published coding rules for writing Convex backends: function syntax (query/mutation/action), validators, schema design, indexes over filters, pagination, file storage, scheduling and cron, HTTP endpoints, TypeScript typing of Id and Doc. Use when writing or reviewing code that runs on Convex or calls a Convex deployment.
---
# Convex vendor routing

A routing layer over Convex's published agent rules for writing Convex
backends: function syntax, validators, schema design, indexes, pagination,
file storage, scheduling, HTTP endpoints and the typing of `Id` and `Doc`.

**Posture: routing only.** Convex maintains a single canonical rules file and
versions it. Fetch that; this page carries only the house overrides.

## The two rules that bite hardest

1. **These rules apply only to a project that has already chosen Convex.**
   They are not an argument for choosing it. The house data-layer default is
   Drizzle with Neon; reading this skill is not a decision to switch.
2. **Prefer `withIndex` over `.filter()`, always.** `.filter()` reads the
   whole table and discards rows in the client. It looks identical in a small
   development dataset and degrades without warning as the table grows.

## Source

Convex-published agent rules at <https://convex.link/convex_rules.txt>
(canonical, roughly 30 KB, versioned by Convex, also linked from
<https://docs.convex.dev/ai>). None of this came from Context7; the vendor's
maintained rules file was the better source and was used directly.

## How to use

Fetch <https://convex.link/convex_rules.txt> before writing Convex code and
follow it. What it enforces, in outline:

- The new function syntax, with `args` and `returns` validators, using
  `v.null()` when nothing is returned.
- Indexes (`withIndex`) over `.filter()`, with indexes named for their fields
  (`by_field1_and_field2`).
- `internalQuery` / `internalMutation` / `internalAction` for private
  functions, and `api.*` versus `internal.*` references.
- Typed environment variables declared in `convex/convex.config.ts` and read
  through the generated `env`, not `process.env`.
- Actions for Node APIs (`"use node";`), with no `ctx.db` inside an action.

For live API detail, use the installed Convex MCP server or Context7 rather
than memory.

## House overrides

Vendor instructions deliberately not adopted:

1. **Data-layer default**: see rule 1 above.
2. **Package manager**: vendor examples assume npm. Use PNPM.

No credential conflict: the rules file's environment guidance goes through
Convex's own typed config, and `NEXT_PUBLIC_CONVEX_URL` is a public value.

## Files

| File | Read it when |
|---|---|
| `CHANGELOG.md` | Recent changes to this skill, newest first. Rolling 30-entry window. |
| `HANDOVER.md` | What is in flight on this skill. Read first when resuming work on it. |

Read these files directly from `.agents/skills/convex-vendor/` in the repository; the published catalogue mirrors them with version history.

## Companions

- `coding-preferences` - the house data-layer decision this skill defers to.
- `neon-vendor` - the default Postgres platform, for projects that did not
  choose Convex.
- `typescript-reviewer` - reviewing the resulting Convex TypeScript.

## Maintaining this skill

When resuming work on this skill, read `HANDOVER.md` first, then
`CHANGELOG.md`. Add a one-line `CHANGELOG.md` entry on every meaningful
change and trim past the window as you write. Overwrite your `HANDOVER.md`
section at the end of a session and delete it when the work lands.

Keep this thin: a pointer, an outline of what the vendor file enforces, and
the override list. Re-fetch the rules file when refreshing rather than
trusting the outline here. Prefer the smallest edit primitive (`edits`) over
a full body replace, and chain `base_version`.