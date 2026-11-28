<!-- Synced from Resnovas/.github templates/docs/graphify.md. -->
# Local graph navigation

Graphify is a navigation aid, not a merge gate. `graphify-out/graph.json` and caches are ignored local build products. Never stage, commit, force-add or push local regenerated output. Only repository automation updates the separate tracked `graphify-snapshot/` navigation files. Source architecture checks remain independently required.

## Setup and freshness

Run `sh tools/graphify/graphify setup` explicitly after installing `uv`. Setup installs the extractor if missing, composes post-commit, post-checkout, post-merge and post-rewrite hooks, then builds the graph. No package-manager install lifecycle generates a graph. CI setup must not invoke local graph setup on PRs.

Hooks refresh synchronously and warn on failure without failing a completed Git operation. Git has no universal post-pull hook: post-merge covers ordinary pulls and post-rewrite covers rebases; queries refresh before use even when a hook was unavailable. `update` compares source names/content, ignore/configuration files and the exact installed extractor version, including uncommitted edits, additions, deletions and renames. `check` checks local freshness only; do not add it to PR CI or required checks.

`query`, `explain`, `path` and `affected` refresh before querying. MCP stays stdio-only and refreshes before each tool/resource read; calls are serialized so the upstream file-change reload cannot return a stale concurrent context. A failed refresh returns an error, not stale navigation. Atomic replacement and a per-checkout OS lock protect readers from partial JSON. A source edit during extraction retains the previous graph and asks for a retry.

Normal generation uses isolated copies of eligible source, local parsers only, and no model. Ignored build outputs and historical examples do not enter the copy. Existing semantic caches remain untouched and are not published. The machine install is shared, but each checkout owns its graph and lock. There is no automatic upgrade during Git events; deliberate upgrades invalidate the version-keyed fingerprint. Versions are recorded, not pinned by this migration.

Explicit `semantic [--force]` requires an already-installed local Ollama model on loopback port 11434. It writes separately under `graphify-out/semantic/`, initially copying existing caches without deleting originals. It never downloads a model or changes the navigation snapshot. Raw upstream command passthrough is removed because it could reinstall hooks or write outside these boundaries.

## Migrate an existing clone safely

Before merging the migration, preserve source work and back up any local `graphify-out/cache/semantic*` directories outside the checkout. Check `git ls-files graphify-out` and `git status --short` before changing the index. A tracked cache must be copied and its checksum verified before removal from the index. Keep `.gitignore` and `.gitattributes` tracked. The migration uses `git rm --cached` for generated files so usable local files remain; do not use `git clean` or delete caches.

Run setup after migration. The installer backs up existing post-event hooks, replaces only bounded Graphify-owned marker blocks, and preserves foreign shell commands and their exit statuses. It refuses ambiguous markers, symlinks and non-shell hooks for manual composition. Pre-commit and commit-msg are never replaced by Graphify. If setup reports a pre-commit ownership mismatch, integrate the existing repository verification runner explicitly rather than deleting or bypassing it.

The existing house commit-msg check rejects force-added local output and manual snapshot changes because committing them causes merge conflicts; graph updates are handled only by repository automation. Normal source/configuration changes and removal of formerly tracked local output remain allowed. Message-only or emergency-check switches do not bypass this guard. Local hook/context checks are accident prevention, not authentication or a replacement for GitHub protections.

The output attributes no longer select the legacy merge driver. Its local Git configuration is deliberately retained because linked worktrees may still need it. Once every sibling worktree has migrated, inspect `git config --get-regexp '^merge\.graphify\.'` and remove only the known upstream Graphify entries if desired; do not remove custom configuration or edit a shared config blindly.

Owners of in-flight branches should remove only obsolete generated graph changes, retain source changes, then rebase or merge the migration. Resolve a one-time graph modify/delete conflict in favor of the migration's deletion, after preserving local caches; regenerate locally afterward. Do not rewrite someone else's branch. Rollback requires coordinated restoration of the former tracked graph/configuration and hooks from Git/history/backups, not re-adding a local snapshot on a feature branch.

## Shared daily snapshots

The migrated `house-graphify.yml` calls `graphify-snapshot.yml` at 04:23 UTC daily and on manual dispatch from `main`. It captures the event's main SHA, generates locally without model credentials, then proposes only `graphify-snapshot/graph.json` and `graphify-snapshot/provenance.json` on the dedicated `house/graphify-navigation` automation branch. The existing repository-scoped App token creates signed commits and triggers normal PR checks. No direct-main push, automatic merge or protection bypass occurs. This replaces the earlier artifact-only proposal; it does not allow graph generation in PR workflows or generated changes on feature/fix branches.

The same run retains revision-labelled graph/provenance artifacts for seven days. A snapshot may be over a day old after a failed run or pending publication PR. Inspect `source_sha`, `generator_version`, `fingerprint` and `configuration_sha256`; a snapshot is not evidence of current main or PR correctness. Local regeneration always writes ignored `graphify-out/`, never the tracked snapshot, and excludes the snapshot from its source fingerprint. Rebase source branches onto new main snapshots without regenerating or editing the tracked files.

The approved initial publisher rollout is only Resnovas/Eventiva and Resnovas/.github. The legacy reusable `graphify.yml` is retained for unmigrated callers so publishing this source does not change other repositories live. Do not merge Graphify-related house-sync proposals elsewhere until their owners approve migration, untracking and setup integration. Other repositories are not accepted adopters merely because templates were published.
