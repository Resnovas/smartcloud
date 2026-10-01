---
name: graphify-vendor
description: Graphify vendor routing (Graphify-Labs/graphify, Apache-2.0): Graphify's own Claude skill for the /graphify pipeline, query, path and explain, updates and watch mode, exports (HTML, Obsidian, wiki, Neo4j), git hooks and merge driver, transcription, and the extraction spec. Routes to the upstream skill at a pinned commit, kept current by skills-upstream-sync, and carries the house overrides: use the repository wrapper tools/graphify/graphify, local models only, never graphify install or global add. Use when a task needs Graphify behaviour the house graphify skill does not cover, or when checking what a Graphify command does.
license: MIT
---
# Graphify vendor routing

A routing layer over Graphify's own Agent Skill for Claude (Graphify-Labs/graphify, Apache-2.0).

**Posture: routing only.** Graphify maintains the skill; fetch it for tool behaviour. This page carries the house overrides. The house standard itself (what is committed, the wrapper, Cloud) is the `graphify` skill, and it wins wherever the two disagree.

## The two rules that bite hardest

1. **Run Graphify through the repository wrapper, `sh tools/graphify/graphify`, not a bare `graphify`.** The wrapper clears provider API keys, keeps the global graph out of shared locations and upgrades Graphify daily. The vendor skill assumes a global install, `graphify install` and whichever model backend has a key; none of that applies here.
2. **No paid or remote model over a repository.** The vendor pipeline dispatches semantic extraction to assistant subagents or an API backend. In house repositories, documents go through local Ollama only (`sh tools/graphify/graphify semantic`); code extraction needs no model at all.

## Source

Repo <https://github.com/Graphify-Labs/graphify> (default branch `v8`), docs <https://docs.graphify.com>. Pinned commit `4000de15466588ec3ee32f9e10a587ca97d3b8a5`.

## How to use

Fetch the vendor skill and only the reference the task needs from `https://raw.githubusercontent.com/Graphify-Labs/graphify/4000de15466588ec3ee32f9e10a587ca97d3b8a5/graphify/<file>`:

| File | Use for |
|---|---|
| `skill.md` | The full /graphify pipeline, flags and outputs |
| `skills/claude/references/query.md` | query, path, explain, affected and traversal options |
| `skills/claude/references/update.md` | Incremental updates, --update, cluster-only and labels |
| `skills/claude/references/hooks.md` | Git hooks behaviour |
| `skills/claude/references/github-and-merge.md` | Cloning, merge-graphs and the graph.json merge driver |
| `skills/claude/references/exports.md` | HTML, Obsidian, wiki, SVG, GraphML, Neo4j and FalkorDB exports |
| `skills/claude/references/add-watch.md` | add (fetch a URL) and watch mode |
| `skills/claude/references/transcribe.md` | Video and audio transcription |
| `skills/claude/references/extraction-spec.md` | The node and edge schema extraction produces |

A local copy at the pinned commit lives in the repository under `.agents/skills/upstream/graphify-labs/graphify/`.

## House overrides

1. **Wrapper**: every command through `sh tools/graphify/graphify`; use `-- <args>` for anything it does not wrap.
2. **Backends**: `--backend ollama` only, through the wrapper's `semantic`. Never `claude`, `openai`, `gemini`, `kimi`, `deepseek` or `bedrock` over a repository, and never the assistant-subagent extraction path.
3. **Install**: never `graphify install`, `graphify <platform> install`, `graphify global add` or `extract --global`; they write outside the repository or pool graphs into a shared global graph.
4. **Committed output**: only `graph.json` and `cache/semantic*/`. Exports (`graph.html`, Obsidian, wiki) are generated on demand and never committed.
5. **MCP**: stdio through `sh tools/graphify/graphify mcp`. Shared HTTP serving is for the maintainer's private Graphify Cloud, not a repository.

## Companions

- `graphify` - the house code-knowledge standard this router serves.

## Maintaining this skill

Keep this thin: the file table, the overrides, the pinned commit. On a sync, move the pin in `.agents/skills-upstream-catalog.yaml`, in the raw URLs and in the metadata together, refresh the local copy, and re-check the file list against `graphify/skills/claude/references/`.
</content>
