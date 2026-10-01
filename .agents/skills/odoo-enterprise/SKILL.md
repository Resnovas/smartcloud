---
name: odoo-enterprise
description: Odoo Enterprise engineering defaults: keeping blocking IO off ORM hot paths with cr.postcommit, log-level discipline, Settings sidebar configuration, the architecture ceiling question, and module upgrade verification. Use when implementing or reviewing Odoo addon code, writing create/write/unlink hooks, adding settings, or verifying a module upgrade.
---
# Odoo Enterprise engineering

House engineering defaults for Odoo Enterprise work: keeping blocking IO off
ORM hot paths, log-level discipline, Settings sidebar configuration, where
the platform's architectural ceiling actually is, and verifying a module
upgrade actually took.

Applies to Odoo Enterprise, default version 19 or later unless the user says
otherwise.

This body is a thin index. The detail lives in the bundled files below; do
not grow this file.

## The three rules that bite hardest

1. **A UI save must never wait on a mailing rescan, analytics, SMTP, a Graph
   or API call, or child fan-out.** Defer it with `cr.postcommit` or an
   existing `_schedule_*` helper. This is the single most common cause of
   `res.partner` saves crawling, and it is invisible in development where
   one editor has one record.
2. **`info` is not progress chatter.** Start, retry, skip and
   handled-fallback all belong at `debug`. A WARNING often blocks a build and
   demands review; ERROR and CRITICAL are blockers. Logging at the wrong
   level turns the log into noise and buries the real failure.
3. **A long-running server keeps stale `sys.modules` after a Python field or
   model change.** The code you just wrote is not the code running. Verify
   the upgrade with `-u MODULE --stop-after-init` in a one-off process, or
   restart the container, before concluding anything about behaviour.

## Files

Pull only what the task needs.

| File | Read it when |
|---|---|
| `references/hot-paths.md` | Writing or reviewing `create`, `write` or `unlink` hooks. What stays synchronous, how to defer with `cr.postcommit`, worked before-and-after examples, the commit-level audit list and how to time the change. |
| `references/logging-and-settings.md` | Choosing a log level, or adding admin configuration. The level table and the Settings sidebar app pattern. |
| `references/upgrades-and-ceiling.md` | Verifying a module upgrade, or being told Odoo cannot do something. Upgrade verification mechanics, and the architecture-ceiling position. |
| `CHANGELOG.md` | Recent changes to this skill, newest first. Rolling 30-entry window. |
| `HANDOVER.md` | What is in flight on this skill. Read first when resuming work on it. |

Read these files directly from `.agents/skills/odoo-enterprise/` in the repository; the published catalogue mirrors them with version history.

## Companions

- `odoo-module-separation` - core versus feature module layout for external
  service integrations, which applies the hot-path rules structurally.
- `python-reviewer` - the general Python review lane for the same diff.
- `database-reviewer` - when the change reaches past the ORM into SQL,
  indexes or a migration.
- `commit` - conventional commits and evidence prose when the work lands.

## Maintaining this skill

When resuming work on this skill, read `HANDOVER.md` first, then
`CHANGELOG.md`. Add a one-line `CHANGELOG.md` entry on every meaningful
change and trim past the window as you write. Overwrite your `HANDOVER.md`
section at the end of a session and delete it when the work lands.

New hot-path patterns go in `references/hot-paths.md`; new logging or
settings conventions in `references/logging-and-settings.md`; upgrade and
ceiling material in `references/upgrades-and-ceiling.md`. This body only
gains a pointer. Update the default Odoo version in the opening line when it
moves. Prefer the smallest edit primitive (`edits` / `file_edits`) over a
full replace, and chain `base_version`.