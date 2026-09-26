Run the same gate CI runs and fix what fails, without deleting tests or lowering coverage thresholds.

1. Read `AGENTS.md` (or `README.md`) for any gate beyond the house ones.
2. `node --run check`, which runs everything CI runs, including the agent command drift check.
3. `sh tools/graphify/graphify check`; if the committed graph is stale, run `sh tools/graphify/graphify update` and review the diff.
4. Report each failure, its cause and the fix, then rerun until everything passes.
