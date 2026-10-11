# Review checklist

Work the four review areas in order of blast radius, then apply the key
principles and scan for the anti-patterns. Finish on the tick-list.

## 1. Query performance (CRITICAL)

- Are the WHERE and JOIN columns indexed?
- Run `EXPLAIN ANALYZE` on complex queries and check for sequential scans on
  large tables.
- Watch for N+1 query patterns.
- Verify composite index column order: equality columns first, then range.

## 2. Schema design (HIGH)

- Use proper types: `bigint` for IDs, `text` for strings, `timestamptz` for
  timestamps, `numeric` for money, `boolean` for flags.
- Define constraints: primary key, foreign key with an explicit `ON DELETE`,
  `NOT NULL`, `CHECK`.
- Use `lowercase_snake_case` identifiers, with no quoted mixed case.

## 3. Security (CRITICAL)

- RLS enabled on multi-tenant tables, using the `(SELECT auth.uid())` pattern
  so the function is evaluated once rather than per row.
- RLS policy columns indexed.
- Least privilege: no `GRANT ALL` to application users.
- Public schema permissions revoked.

## 4. Migration safety (CRITICAL)

- Does the migration take a lock that blocks writes on a large table? Prefer
  `CREATE INDEX CONCURRENTLY`, and add `NOT NULL` via a `CHECK` constraint
  followed by a validate step.
- Is it reversible, and has the down path been tested?
- Does it assume a deploy order between schema and application code? Expand
  first, migrate the data, then contract in a later release.

## Key principles

- **Index foreign keys** - always, no exceptions.
- **Partial indexes** - `WHERE deleted_at IS NULL` for soft deletes.
- **Covering indexes** - `INCLUDE (col)` to avoid a table lookup.
- **`SKIP LOCKED` for queues** - far higher throughput for worker patterns.
- **Cursor pagination** - `WHERE id > $last` instead of `OFFSET`.
- **Batch inserts** - multi-row `INSERT` or `COPY`, never individual inserts
  in a loop.
- **Short transactions** - never hold locks during an external API call.
- **Consistent lock ordering** - `ORDER BY id FOR UPDATE` to prevent
  deadlocks.

## Anti-patterns to flag

- `SELECT *` in production code.
- `int` for IDs (use `bigint`); `varchar(255)` without a reason (use `text`).
- `timestamp` without a time zone (use `timestamptz`).
- Random UUIDs as primary keys (use UUIDv7 or `IDENTITY`).
- `OFFSET` pagination on large tables.
- Unparameterized queries, which are an injection risk.
- `GRANT ALL` to application users.
- RLS policies calling a function per row rather than wrapping it in a
  `SELECT`.

## Finish on this

- [ ] All WHERE and JOIN columns indexed
- [ ] Composite indexes in the correct column order
- [ ] Proper data types (bigint, text, timestamptz, numeric)
- [ ] RLS enabled on multi-tenant tables
- [ ] RLS policies use the `(SELECT auth.uid())` pattern
- [ ] Foreign keys have indexes
- [ ] No N+1 query patterns
- [ ] `EXPLAIN ANALYZE` run on complex queries
- [ ] Transactions kept short
- [ ] Migration is reversible and does not lock a large table

Database issues are often the root cause of an application performance
problem. Use `EXPLAIN ANALYZE` to verify assumptions rather than reasoning
about the plan from the query text.
