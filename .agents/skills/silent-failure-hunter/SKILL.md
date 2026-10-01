---
name: silent-failure-hunter
description: Hunt for silent failures in code - empty catch blocks, swallowed exceptions, errors coerced to null or an empty array, inadequate logging, dangerous defaults, lost stack traces and missing timeouts. Use when a bug disappeared without an error, when reviewing error handling, or when asked why something fails quietly.
---
# Silent failure hunter

Sweep a codebase for failures that never reach anyone: swallowed exceptions,
errors coerced into a plausible-looking empty value, logs with no context, and
work that has no timeout or rollback. The defect class is defined by what the
program does *not* say when something goes wrong.

**Posture: read-only.** Report findings with locations and recommended fixes.
Do not apply the fixes in the same pass; a swallowed error often turns out to
be load-bearing, and the owner needs to decide.

## The two rules that bite hardest

1. **A fallback that produces a valid-looking value is worse than a crash.**
   `.catch(() => [])` turns a failed fetch into an empty list, and the bug
   then surfaces three layers away as "the user has no orders". Rank these
   above empty catch blocks: an empty catch is at least obvious on sight.
2. **Not every quiet path is a defect.** A deliberate best-effort call, a
   cache miss, an optional telemetry write - these are meant to fail quietly.
   Flagging them dilutes the report. Where the intent is genuinely unclear,
   say so and ask, rather than filing it as a finding.

## Hunt targets

### 1. Empty catch blocks

- `catch {}` or ignored exceptions
- Errors converted to `null` or an empty array with no context

### 2. Inadequate logging

- Logs without enough context to identify the request, record or user
- Wrong severity: a genuine failure logged at debug, or noise logged at error
- Log-and-forget handling, where the log is the entire response to the error

### 3. Dangerous fallbacks

- Default values that hide a real failure
- `.catch(() => [])` and its equivalents
- Graceful-looking paths that make downstream bugs harder to diagnose

### 4. Error propagation issues

- Lost stack traces
- Generic rethrows that discard the cause
- Missing async handling, so a rejection never reaches a handler

### 5. Missing error handling

- No timeout or error handling around network, file or database calls
- No rollback around transactional work

## Output format

For each finding:

- Location (file and line)
- Severity
- Issue
- Impact: what a user or operator sees when this fires
- Fix recommendation

Sort by impact, not by file order. Zero findings is a valid result; say so
rather than promoting a judgement call to fill the report.

## Files

| File | Read it when |
|---|---|
| `CHANGELOG.md` | Recent changes to this skill, newest first. Rolling 30-entry window. |
| `HANDOVER.md` | What is in flight on this skill. Read first when resuming work on it. |

Read these files directly from `.agents/skills/silent-failure-hunter/` in the repository; the published catalogue mirrors them with version history.

## Companions

- `typescript-reviewer` and `python-reviewer` - the full language review
  lanes, which cover error handling among much else. Use those for a pull
  request; use this for a targeted sweep of one defect class across a
  codebase.
- `database-reviewer` - for the transactional half: missing rollback, locks
  held across external calls.

## Maintaining this skill

When resuming work on this skill, read `HANDOVER.md` first, then
`CHANGELOG.md`. Add a one-line `CHANGELOG.md` entry on every meaningful
change and trim past the window as you write. Overwrite your `HANDOVER.md`
section at the end of a session and delete it when the work lands.

Keep this body thin. The five hunt targets are the stable spine; new
language-specific patterns belong in a `references/` file rather than in this
list. Prefer the smallest edit primitive (`edits`) over a full body replace,
and chain `base_version`.

<!-- Ported from the ECC agent `silent-failure-hunter` (github.com/affaan-m/ECC, MIT).
     Shared prompt-defense boilerplate removed; untrusted content is handled by
     the host agent's own rules. -->