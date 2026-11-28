---
name: graphify
description: Query and refresh the ignored local Graphify navigation graph. Use before broad code searches, when tracing callers or dependencies, after source edits or branch changes, and when migrating a formerly tracked graph.
---

<!-- Synced from Resnovas/.github templates/.agents/skills/graphify/SKILL.md. -->

# Graphify navigation

Use `sh tools/graphify/graphify setup` once per checkout, with `uv` available. It installs the tool if missing, composes post-commit/checkout/merge/rewrite hooks without replacing pre-commit, and builds ignored local output. Exact generator versions key freshness; upgrades are deliberate, not a side effect of Git operations.

Query before broad searching:

- `sh tools/graphify/graphify query "how are refunds calculated"`
- `sh tools/graphify/graphify explain "render.mjs"`
- `sh tools/graphify/graphify path "renderAll" "writeFileSync"`
- `sh tools/graphify/graphify affected "loadValues"`

Queries refresh first, including dirty edits, deletions and branch changes. Open the referenced source before changing it: a graph is a map, not proof. Use `mcp --print-config` for a stdio endpoint that refreshes before each read. If navigation is unavailable, report it and use text search.

After edits, `update` refreshes atomically using local parsers only. `check` diagnoses local freshness, not merge readiness. Never stage, commit, force-add or push local generated output. Only daily main automation updates the separate tracked `graphify-snapshot/` files through a signed PR. The commit-msg guard rejects manual graph changes; source/config changes and legacy output removals remain allowed. PR workflows neither generate nor publish graphs.

Read `docs/graphify.md` before migration or cache handling. Preserve semantic caches before untracking; never delete them or rewrite another owner's branch. Historical examples remain untouched. The migrated attributes do not select a merge driver; retain dormant shared Git configuration while sibling worktrees still use it.

Do not run paid/remote inference, download a model during setup/pull, install upstream hooks, serve HTTP, or merge repositories into a global graph. Graphify Cloud memory, if available, holds dated source-linked decisions separately from code navigation.
