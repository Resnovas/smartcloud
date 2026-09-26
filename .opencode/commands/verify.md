---
description: Run the gate CI runs and fix what fails
---

Run the same gate CI runs and fix what fails, without deleting tests or lowering coverage thresholds.

1. `pnpm run check` (lint, typecheck, test and build every project, then the licence headers and the agent command check).
2. `pnpm run typecheck:tests`.
3. `pnpm run docs:reference:check`; if it fails, run `pnpm run docs:reference` and review the diff.
4. Report each failure, its cause and the fix, then rerun until everything passes.
