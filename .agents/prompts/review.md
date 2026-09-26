---
label: Review branch
description: Review the current branch against AGENTS.md and the house coding preferences
---

Review the changes on the current GitButler branch (`but status`, then `but diff` for this branch only) as a strict senior reviewer.

1. Read `AGENTS.md` and the parts of the `coding-preferences` skill that the change touches: Effect v3 and Effect Schema, Nx module boundaries and tags, telemetry and logging, tests mirrored under `tests/<name>/src`, API contracts, FCL-1.0-MIT headers.
2. Use the Graphify MCP tools to find callers, dependents and tests of every changed symbol before judging its blast radius.
3. Check behaviour first: wrong results, unhandled failures, missing redaction, secrets in files, broken public contracts. Then style and duplication.
4. Report findings ranked by severity, each with the file and line, a concrete failure scenario and the fix. Say plainly when there is nothing worth changing.

Do not edit files unless asked.
