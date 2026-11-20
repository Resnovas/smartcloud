# ORM hot paths: do not block saves

UI saves, especially on `res.partner`, must not wait on mailing rescans,
analytics, SMTP, Graph or API calls, PDF generation, or child fan-out. Prefer
`cr.postcommit` or an existing `_schedule_*` helper. Prefer **not** to use
`queue_job` unless the project already standardises on it.

## What stays synchronous

- Validation and constraints
- `AccessError` and ACL checks that must fail the save
- Cheap normalisation
- Anything that must return a value within the request

## What to defer

Capture the ids and dbname, then `self.env.cr.postcommit.add(runner)` with a
new cursor (`Registry` plus `Environment(SUPERUSER_ID, {})`).

In tests, run it inline via `config['test_enable']` or a context flag.

Prefer deltas over full rescans, and gate heavy work on the fields that
actually changed.

## Worked examples

```python
# BAD - blocks the save
def write(self, vals):
    res = super().write(vals)
    self._sync_all_mailing_lists()
    return res

# GOOD - postcommit plus delta
def write(self, vals):
    res = super().write(vals)
    if "category_id" in vals:
        self._schedule_category_mailing_list_delta(deltas)
    return res
```

```python
# BAD
self.message_post(..., force_send=True)
client.capture(...)

# GOOD
self.message_post(..., force_send=False)
# External HTTP and ensure calls go to postcommit
```

## Commit-level audit

Before finishing or committing an ORM-hook diff, audit **every** changed file
in the unit:

- [ ] Blocking IO on create, write or unlink (HTTP, SMTP, Graph or API, PDF, analytics)
- [ ] Full rescans instead of deltas
- [ ] Child fan-out waiting on the save
- [ ] `force_send=True` or synchronous mail on the hot path
- [ ] Side effects that should use `cr.postcommit` or `_schedule_*` but run inline
- [ ] Write-from-write loops without deferral or guards
- [ ] Heavy work not gated on changed fields

## Timing

Before finishing create, write, unlink, cron or hot controller work, measure
with and without the change.

1. Wall-clock in a `TransactionCase` using `time.perf_counter()`, against a
   generous local budget - for example a partner write under one second warm.
2. Focused tests with `--log-level=test`.
3. Optionally the built-in Odoo profiler for a single reproduction.

A change that is not timed has not been shown to help.
