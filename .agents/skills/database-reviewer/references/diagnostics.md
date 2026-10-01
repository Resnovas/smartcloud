# Diagnostic commands

## Safety first

Run these against a development database or a read replica, never production.
`EXPLAIN ANALYZE` actually executes the statement, so on anything that writes
it is not a read-only operation. Never paste a live connection string into a
command that will be committed or logged.

## Commands

```bash
# Interactive session
psql "$DATABASE_URL"

# Slowest statements by mean execution time (needs pg_stat_statements)
psql -c "SELECT query, mean_exec_time, calls
         FROM pg_stat_statements
         ORDER BY mean_exec_time DESC
         LIMIT 10;"

# Largest tables, including indexes and TOAST
psql -c "SELECT relname, pg_size_pretty(pg_total_relation_size(relid))
         FROM pg_stat_user_tables
         ORDER BY pg_total_relation_size(relid) DESC;"

# Index usage: a large index with idx_scan near zero is dead weight
psql -c "SELECT indexrelname, idx_scan, idx_tup_read
         FROM pg_stat_user_indexes
         ORDER BY idx_scan DESC;"
```

## Reading the results

- A sequential scan is not automatically wrong. On a small table it is
  faster than an index scan; the finding is a sequential scan on a large
  table inside a hot query.
- `idx_scan = 0` on a long-lived database means the index is never used:
  it costs write throughput and storage for nothing. Confirm the counter has
  not been reset before recommending a drop.
- `mean_exec_time` ranks by average. A query that is fast on average but
  occasionally catastrophic will not surface here; check the max as well when
  the complaint is intermittent.
