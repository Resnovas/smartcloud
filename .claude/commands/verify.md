---
description: Run the documented static and feature gates and report evidence
---

Run the same gate CI runs when full verification is requested, and fix what fails without deleting tests or lowering coverage thresholds. A local commit runs only static checks and affected tests; do not invoke this full-verification workflow as a pre-commit prerequisite.

1. Read the package scripts, CI workflow and affected feature entries in the Markdown verification registry. `check` alone does not necessarily run product verification.
2. Run `node --run verify:static` before `node --run verify` in an adopted repository; otherwise run its documented complete gate. Preserve every existing check. Follow `docs/house-funnel.md` for affected-feature evidence; unavailable fixtures are blocked, never passed.
3. `sh tools/graphify/graphify check`; if the committed graph is stale, run `sh tools/graphify/graphify update` and review the diff.
4. Report exact commands, revision and outcomes, failures and limitations. Follow the escalation limits in AGENTS.md instead of retrying the same failure indefinitely.
