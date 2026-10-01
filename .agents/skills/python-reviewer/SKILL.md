---
name: python-reviewer
description: Review Python for security, error handling, type hints, Pythonic idioms, concurrency and PEP 8, with Django, FastAPI and Flask specific checks. Use for any change touching .py files, when reviewing a Python pull request, or when asked whether Python code is idiomatic or safe.
---
# Python reviewer

Review a Python change for security, error handling, type hints, Pythonic
idiom, concurrency and PEP 8, with extra checks for Django, FastAPI and Flask.

**Posture: read-only.** Report findings with file, line and a concrete fix.
Do not refactor or rewrite the code under review.

This body is a thin index. The detail lives in the bundled files below; do not
grow this file.

## The three rules that bite hardest

1. **Run the static analysis before reading the diff.** `ruff`, `mypy` and
   `bandit` find the mechanical half in seconds. Hand-reviewing what a linter
   already reports wastes the review on findings the author could have had
   for free, and buries the ones only a human notices.
2. **A mutable default argument is a latent shared-state bug, not a style
   nit.** `def f(x=[])` binds one list to every call for the life of the
   process. It reads as harmless and behaves as a global.
3. **Zero findings is a valid result.** Manufacturing a MEDIUM to look
   thorough costs more trust than it buys.

## Files

Pull only what the task needs.

| File | Read it when |
|---|---|
| `references/review-priorities.md` | Doing the actual review. The full CRITICAL / HIGH / MEDIUM catalog: security, error handling, type hints, Pythonic patterns, code quality, concurrency. |
| `references/workflow.md` | Starting a review. Invocation steps, diagnostic commands, framework-specific checks, approval criteria and output format. |
| `CHANGELOG.md` | Recent changes to this skill, newest first. Rolling 30-entry window. |
| `HANDOVER.md` | What is in flight on this skill. Read first when resuming work on it. |

Read these files directly from `.agents/skills/python-reviewer/` in the repository; the published catalogue mirrors them with version history.

## Companions

- `silent-failure-hunter` - a deeper sweep on the swallowed-error lane alone,
  across a codebase rather than within one diff.
- `database-reviewer` - when the change touches SQL, schema or migrations.
- `odoo-enterprise` - when the Python is an Odoo addon, which has its own ORM
  hot-path rules that override generic advice.

For library detail beyond this checklist, query Context7 rather than relying
on recall.

## Maintaining this skill

When resuming work on this skill, read `HANDOVER.md` first, then
`CHANGELOG.md`. Add a one-line `CHANGELOG.md` entry on every meaningful
change and trim past the window as you write. Overwrite your `HANDOVER.md`
section at the end of a session and delete it when the work lands.

New review rules go in `references/review-priorities.md` under the right
severity, not in this body. New commands or framework checks go in
`references/workflow.md`. This body only gains a pointer. Prefer the smallest
edit primitive (`edits` / `file_edits`) over a full replace, and chain
`base_version` between writes.

<!-- Ported from the ECC agent `python-reviewer` (github.com/affaan-m/ECC, MIT).
     Shared prompt-defense boilerplate removed; untrusted content is handled by
     the host agent's own rules. -->