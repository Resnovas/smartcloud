Review the changes on the current branch against the default branch as a strict senior reviewer. Use `git status` and `git diff <base>...HEAD` in the task worktree, replacing `<base>` with the verified PR base; include uncommitted changes when relevant.

1. Read `AGENTS.md` (or `README.md`) and the house documents the change touches: `CONTRIBUTING.md`, `AI_POLICY.md`, `GOVERNANCE.md`, `DCO.md`.
2. Use the Graphify MCP tools to find the callers, dependents and tests of every changed symbol before judging its blast radius.
3. Check behaviour first: wrong results, unhandled failures, secrets in files, broken public contracts, edits inside a `house:managed` block. Then style and duplication.
4. Report findings ranked by severity, each with the file and line, a concrete failure scenario and the fix. Say plainly when there is nothing worth changing.

Do not edit files unless asked.
