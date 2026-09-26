---
name: graphify
description: Query and maintain this repository's committed Graphify knowledge graph (graphify-out/graph.json). Use before broad code searches, when asked what depends on, calls or touches something, when orienting in an unfamiliar area, after changing code (to refresh the graph), and when graph.json conflicts in a merge.
---

<!-- Synced from Resnovas/.github templates/.agents/skills/graphify/SKILL.md. Edit it there. -->

# Graphify in this repository

This repository commits a knowledge graph of its code in `graphify-out/graph.json`: files, symbols, imports, calls and Markdown structure, plus document concepts where a maintainer has added them.
Querying it returns the relevant slice of the codebase in a few thousand tokens, instead of reading files until the answer turns up.
Everything runs locally through `tools/graphify/graphify`.

## Set up once per clone

```sh
sh tools/graphify/graphify setup
```

This installs the latest Graphify release once per machine (under `~/.local/share/resnovas-graphify`, shared by every clone), and installs git hooks that rebuild the code graph after each commit and checkout.
It also registers the union merge driver for `graph.json`.
It needs [`uv`](https://docs.astral.sh/uv/) on `PATH`.
Add `--no-hooks` to skip the hooks.
Graphify is not pinned: the wrapper checks for a newer release at most once a day, so an upgrade can change the graph on your next `update`.

## Query before you search

| Question | Command |
| --- | --- |
| Where is X handled, and what is involved? | `sh tools/graphify/graphify query "how are refunds calculated"` |
| What is this node and what surrounds it? | `sh tools/graphify/graphify explain "render.mjs"` |
| How does A reach B? | `sh tools/graphify/graphify path "renderAll" "writeFileSync"` |
| What breaks if I change X? | `sh tools/graphify/graphify affected "loadValues"` |

Raise `--budget 8000` when an answer is truncated.
Treat the graph as a map, not as proof: open the files it points to before you change them.

To use it from an MCP client, run `sh tools/graphify/graphify mcp --print-config` and add the printed block to the client configuration.
The server runs over stdio only.

## Keep the graph current

1. After changing code, run `sh tools/graphify/graphify update`.
   It uses local parsers only: no model, no network, no cost.
   It keeps document nodes already in the graph.
2. Commit the changes under `graphify-out/` in the same pull request, as their own commit (`chore(graphify): refresh the code graph`).
   `graphify-out/.gitignore` decides what is committed; do not force-add anything it ignores.
3. `sh tools/graphify/graphify check` exits 1 when the last commit's graph does not match its code.
   CI runs the same check on pull requests and reports a stale graph without failing, and the default branch refreshes itself through a bot pull request.

The hooks rebuild after a commit, so the working tree then shows a changed `graph.json`.
That is expected: commit it with your next change.

## Merge conflicts in graph.json

With the merge driver registered (by `setup`), git merges `graph.json` as a union and does not conflict.
If it conflicts anyway, for example in a clone that never ran `setup`:

1. Take either side: `git checkout --theirs graphify-out/graph.json`.
2. Run `sh tools/graphify/graphify update --force`.
3. Commit the result.

Never edit `graph.json` by hand.

## Documents (maintainers)

`sh tools/graphify/graphify semantic` adds document concepts through a **local** Ollama model (`qwen2.5-coder:7b`, run `ollama pull qwen2.5-coder:7b` first).
Every result is stored in `graphify-out/cache/semantic/`, keyed by file content, and committed, so nobody pays to extract an unchanged document twice.
Commit the new cache files with the graph.

## Do not

- Run a paid or remote model backend over the repository. The wrapper clears provider API keys for this reason.
- Run `graphify install`, `graphify claude install`, `graphify global add` or other commands that write outside the repository or merge it into a shared global graph.
- Serve the graph over HTTP. Shared remote access for maintainers is a separate, private Graphify Cloud workspace.
- Treat the graph as memory. It describes the code; decisions and preferences belong in the repository's docs.
