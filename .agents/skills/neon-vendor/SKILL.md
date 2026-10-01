---
name: neon-vendor
description: Neon vendor guidance for Lakebase Postgres: connections (pooled vs direct), schema migrations, branch-first workflow, autoscaling, scale-to-zero, instant restore, read replicas, Lakebase Search, Neon Auth, Object Storage, Functions and the AI Gateway. Use when writing code against a Neon database or the Neon API, planning Neon branching, or choosing Neon platform primitives. Complements the coding-preferences data layer choice (Drizzle + Neon).
---
# Neon vendor routing

A routing layer over Neon's published Agent Skills for Lakebase Postgres:
connections, migrations, the branch-first workflow, autoscaling,
scale-to-zero, instant restore, read replicas, Lakebase Search, Neon Auth,
Object Storage, Functions and the AI Gateway.

**Posture: routing only.** Neon ships and maintains its own skills; fetch the
one matching the task. This page carries the house overrides.

## The two rules that bite hardest

1. **Do not let `neon env pull` or `neon link` write secrets to a local
   file.** The vendor workflow persists `DATABASE_URL` into `.env` or
   `.env.local`. Use the vendor's own documented escape hatch,
   `neon checkout <branch> --no-env-pull`, and inject the environment at run
   time instead.
2. **Vendor snippets are platform-behaviour reference, not the data-access
   pattern.** Neon's examples use raw SQL or `@neondatabase/serverless`
   directly. The house data layer is Drizzle with Effect. Copying a vendor
   snippet into application code imports the wrong access pattern along with
   the correct platform behaviour.

## Source

Neon-published Agent Skills at
<https://github.com/neondatabase/agent-skills>, with docs at
<https://neon.com/docs/ai/ai-rules-neon-serverless>. None of this came from
Context7; the vendor repo was the better source and was used directly.

## How to use

Fetch the vendor skill matching the task from
`https://raw.githubusercontent.com/neondatabase/agent-skills/main/skills/<skill>/SKILL.md`:

| Vendor skill | Use for |
|---|---|
| `neon` | Platform overview: Auth, Object Storage, Functions, AI Gateway, CLI and MCP setup, branch-first workflow, Claimable Neon |
| `neon-postgres` | Existing `DATABASE_URL` work: SQL, schema, migrations, pooled versus direct connections, branching, search |

The vendor also ships more granular skills for branches and platforms; see
the repo README for the current list.

Neon's branch-first workflow, a Neon branch per task via `neon checkout`,
pairs naturally with a branch-per-task version-control habit.

For live API detail prefer the installed Neon MCP server tools over pasted
examples.

## House overrides

Vendor instructions deliberately not adopted:

1. **Credentials in `.env`**: see rule 1 above.
2. **Package manager**: vendor examples say `npm install pg`. Use PNPM.
3. **ORM**: see rule 2 above. The house data layer is Drizzle ORM with
   Effect; see `coding-preferences`, `references/data.md`.

## Files

| File | Read it when |
|---|---|
| `CHANGELOG.md` | Recent changes to this skill, newest first. Rolling 30-entry window. |
| `HANDOVER.md` | What is in flight on this skill. Read first when resuming work on it. |

Read these files directly from `.agents/skills/neon-vendor/` in the repository; the published catalogue mirrors them with version history.

## Companions

- `coding-preferences` - the Drizzle and Neon data-layer decision itself.
- `database-reviewer` - reviewing the resulting schema, indexes, migrations
  and access model.
- `convex-vendor` - the alternative backend, for projects that chose it.

## Maintaining this skill

When resuming work on this skill, read `HANDOVER.md` first, then
`CHANGELOG.md`. Add a one-line `CHANGELOG.md` entry on every meaningful
change and trim past the window as you write. Overwrite your `HANDOVER.md`
section at the end of a session and delete it when the work lands.

Keep this thin: the vendor skill table, the override list, and nothing that
restates Neon's own documentation. Re-check the repo README when refreshing,
since the granular skill list grows. Prefer the smallest edit primitive
(`edits`) over a full body replace, and chain `base_version`.