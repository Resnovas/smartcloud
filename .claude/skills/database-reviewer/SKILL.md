---
name: database-reviewer
description: Review PostgreSQL work for query performance, indexing, schema design, row-level security, connection management, concurrency and migration safety. Use when writing SQL, creating a migration, designing a schema, or troubleshooting slow queries, deadlocks or missing indexes.
---
# Database reviewer

Review PostgreSQL work for query performance, indexing, schema design, row
level security, connection management, concurrency and migration safety.

**Posture: read-only.** Report findings with a location and a concrete fix.
Do not rewrite the schema or apply a migration as part of the review.

This body is a thin index. The detail lives in the bundled files below; do not
grow this file.

## The three rules that bite hardest

1. **Run diagnostics against a development database or a replica, never
   production.** `EXPLAIN ANALYZE` executes the query. On a write statement,
   against the wrong host, that is not a diagnostic.
2. **Index every foreign key, without exception.** An unindexed FK turns
   every parent delete or update into a sequential scan of the child table,
   and the symptom appears as unrelated lock contention rather than as a slow
   query.
3. **A migration that passes in development can still take production down.**
   The question is not whether it succeeds but what it locks and for how
   long. Check that before anything else in the diff.

## Files

Pull only what the task needs.

| File | Read it when |
|---|---|
| `references/review-checklist.md` | Doing the actual review. Query performance, schema design, security and RLS, migration safety, the key principles and the anti-pattern list, plus the tick-list to finish on. |
| `references/diagnostics.md` | You need the commands: `pg_stat_statements`, table and index size queries, index usage, and the safety rules for running them. |
| `CHANGELOG.md` | Recent changes to this skill, newest first. Rolling 30-entry window. |
| `HANDOVER.md` | What is in flight on this skill. Read first when resuming work on it. |

Read these files directly from `.agents/skills/database-reviewer/` in the repository; the published catalogue mirrors them with version history.

## Companions

- `neon-vendor` - platform behaviour when the Postgres is Neon: branching,
  pooled versus direct connections, scale-to-zero and their effects on
  connection management.
- `coding-preferences` - the house data-layer choice, Drizzle with Effect,
  which shapes what the application side should look like.
- `python-reviewer` and `typescript-reviewer` - the application-side lanes
  for the code issuing these queries.

For PostgreSQL detail beyond the checklist, index internals, JSONB,
full-text search or migration mechanics, query Context7 for the Postgres
version actually in use rather than relying on recall.

## Maintaining this skill

When resuming work on this skill, read `HANDOVER.md` first, then
`CHANGELOG.md`. Add a one-line `CHANGELOG.md` entry on every meaningful
change and trim past the window as you write. Overwrite your `HANDOVER.md`
section at the end of a session and delete it when the work lands.

New review rules go in `references/review-checklist.md`; new commands go in
`references/diagnostics.md`. This body only gains a pointer. Prefer the
smallest edit primitive (`edits` / `file_edits`) over a full replace, and
chain `base_version` between writes.

<!-- Ported from the ECC agent `database-reviewer` (github.com/affaan-m/ECC, MIT).
     Shared prompt-defense boilerplate removed; untrusted content is handled by
     the host agent's own rules. Index and RLS patterns adapted from Supabase
     Agent Skills (credit: Supabase team) under MIT license. -->