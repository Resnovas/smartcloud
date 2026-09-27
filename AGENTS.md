<!-- house:managed:begin - synced from Resnovas/.github templates/AGENTS.md. Edits inside this block are overwritten. -->
# Agent instructions (portable)

Copy this file (or its contents) into Cursor, Claude Code, Codex, GitHub Copilot, Linear Agent, Antigravity, and peer hosts as the always-on instruction surface (`AGENTS.md`, `CLAUDE.md`, custom instructions, or equivalent). Keep one canonical copy; do not fork divergent house rules per host.

**Owner:** Jonathan (Resnovas / Eventiva / Climb).  
**Canonical location:** `templates/AGENTS.md` in [`Resnovas/.github`](https://github.com/Resnovas/.github), synced into every repository's `AGENTS.md`. `CLAUDE.md` imports this file; agents must not depend on any local vault path. Change the house rules in that template; add a repository's own instructions below the `house:local` line at the end.  
**Updated:** 2026-09-26

Assume a **clean machine**: no Second Brain vault, no private disk SoT, no host-specific home paths. Standards live in **PostHog skills**; memory and knowledge live in **Cognee**. Tools live behind **Mem0 Gateway**. Engineering method is **Compound Engineering**, with **`lfg`** as the autonomous ship path.

---

## Mission

Ship correct software and durable knowledge. Prefer Compound Engineering for software work. Prefer `lfg` when autonomous shipping is the ask. Prefer Mem0 Gateway for external tools. **Always use Context7** (via Mem0 Gateway) for library and framework API detail - never invent SDK examples. Prefer **source-available** dependencies via **git subtree** under `externals/` so agents can read real implementation. Prefer published house standards over reinvented taste. Keep durable memory in **Cognee** (vault knowledge, preferences, decisions, agent memory) and knowledge about code in **Graphify** (a committed graph per repository); never add a third store. Feed SuperMe only **sanitized** concepts, actions, and learnings - never raw PII or secrets.

## How to load house knowledge (no vault required)

| Need | Where | How (via Mem0 Gateway / PostHog) |
| --- | --- | --- |
| Coding standards | PostHog skill `coding-preferences` (Resnovas org, **Default** project) | `find_tools` for PostHog skills -> `skill-get` / `skill-file-get` (or gateway equivalents). Load the thin body, then **one** reference file for the task. |
| Soft preferences / durable facts | **Cognee** (single memory store) | `recall` for a targeted lookup; auto-recall injects `<company_memory>` / `<user_memory>` / `<agent_memory>`. Add durable lessons with `remember` when they should follow Jonathan across chats. |
| Skill authoring rules | PostHog `skills-spec`, `skills-best-practices` | Same PostHog skill tools as above. |
| Library / current API docs | **Context7 (mandatory)** | Always `find_tools` for Context7 (or gateway Context7 tools) before relying on memory for APIs. Never invent SDK examples into skills, issues, or this file. |
| Personal / network intelligence | SuperMe | Gateway `superme__*` tools (see SuperMe section). |
| Tracker for **our** products | Linear | Gateway Linear tools after `find_tools`. |
| Upstream / third-party bugs | GitHub Issues on that repo | Gateway GitHub tools after `find_tools`. |

If a needed tool is not granted: `find_tools(type="requestable")` then `request_access(tool_names=[...], reason="...")`. Tell the user; do not poll; do not bypass with personal API keys.

Repo-local `AGENTS.md` / `CLAUDE.md`, when present, wins for that repository. Raise conflicts with this file instead of silently ignoring either.

## Priority stack (read every turn)

1. **Setup check** - workspace ecosystem ready (see Setup your ecosystem). Fix gaps or ask before deep work.
2. **Compound Engineering always** for software work. Install/use [compound-engineering](https://github.com/everyinc/compound-engineering-plugin). Do not invent a parallel plan/build/review loop.
3. **`lfg` is the default autonomous pipeline** for end-to-end ship (plan -> work -> simplify -> review/fix -> commit -> push/PR -> CI). Prefer `ce-brainstorm` then `lfg` when shape is fuzzy; `lfg` directly when clear.
4. **Staged CE skills** when the user wants to approve stages (`ce-plan`, `ce-work`, `ce-code-review`, `ce-commit-push-pr`, `ce-debug`, `ce-compound`, …).
5. **House `coding-preferences`** for implementation and review in **any** language this stack touches (TypeScript is primary; many prefs are language-agnostic: tests, CI, integrations, auth, accounting, docs, module boundaries).
6. **Hard house standards** (PostHog skills below) - always enforce; do not paste full bodies here.
7. **Context7 always** for current library / framework / SDK behaviour (via Mem0 Gateway) - before coding against an unfamiliar or version-sensitive API.
8. **Source availability** - critical deps readable via git subtree under `externals/` (see below); do not treat opaque `node_modules` as the agent source of truth.
9. **Orca need-check** - load Orca skills only when the job needs them; ensure headless Orca on controlled boxes (see Setup).
10. **Mem0 Gateway** before any other MCP/CLI for the same external job.
11. **Issues** for defects (Linear for ours, GitHub for upstream) - clear repro + high-level fix direction only.
12. **SuperMe sanitize-and-feed** at CE review/closeout (and after meaningful non-CE learnings).
13. **Cognee memory** - `recall` before assuming; `remember` durable lessons at closeout. Never Tribunal or health content.

## Hard house standards (always)

Load the named PostHog skill when the bite applies. Do not invent parallel rules.

| PostHog skill | Hard bite |
| --- | --- |
| `whitelabel-customer-facing-copy` | No vendor/platform names in customer-facing copy unless the reader must recognise that integration |
| `prefer-community-skills` (+ `skill-discovery`) | Search/install existing skills before inventing workflows; deep path = `skill-get skill-discovery` |
| `no-em-or-en-dashes` | ASCII hyphen-minus only in agent-authored text; scan changed files before commit |
| `feature-flags` | Every app and every Odoo module has PostHog feature flags set up; new behaviour ships behind a flag with a safe in-code default; no env-var or config toggles |
| `project-dev-surfaces` | Every project ships Commands, Actions and Debug configs (`.vscode/tasks.json`, `.vscode/launch.json`, `.run/`, `orca.yaml`, `.codex/environments/environment.toml`), one idempotent `scripts/agent-setup` every surface calls, and a machine-only `AGENT-SETUP.md` (caveman ultra) so cloud agents can set up and run it on a clean machine |
| `commits-and-rd-evidence` | Commit coherent units without waiting to be asked; investigatory commits carry honest R&D prose; no AI co-author trailers or "Generated with" footers |
| `extendable-module-architecture` | Core + feature modules; no feature logic in core; secrets in config |
| `gitbutler-instead-worktrees` | Prefer GitButler `but` over git worktrees when the repo uses GitButler |
| `skills-posthog-sot` | First-party skills SoT is PostHog Resnovas Default - never ship a new house skill local-only |
| `skills-upstream-sync` | Weekly/catalog sync of watched upstream and first-party skills into PostHog |

Also useful team skills: `founder` (startup workflows), `convert-documents-to-markdown` / anydoc (office/PDF to Markdown), `proton-pass`, `orchestration` / `orca-cli` / `orca-linear` / `orca-per-workspace-env` when Orca need-check is yes.

## Setup your ecosystem

Before non-trivial work, verify the host can do the job. If something is missing, install it or tell the user exactly what to install. Prefer org-standard tools.

### Required for agent sessions

| Capability | What to install / connect | Why |
| --- | --- | --- |
| Compound Engineering | Host plugin from EveryInc/compound-engineering-plugin (`/add-plugin compound-engineering` or host equivalent) | Plan/build/review/`lfg` |
| Mem0 Gateway MCP | Connected and authenticated for this org | External tools and `request_access` (tools only - memory lives in Cognee) |
| Cognee | First route the host supports: Claude Code or Codex plugin (`cognee-memory@cognee` / `cognee`), else `cognee-mcp` in cloud mode, else the plain HTTP API with `curl`. `COGNEE_BASE_URL` and `COGNEE_API_KEY` from Proton Pass (AI Agents Vault, item "Cognee"). Load PostHog skill `cognee-memory` | Single memory and knowledge store; holds every PostHog skill, coding preference and agent instruction in `general` |
| PostHog (Resnovas Default) | Via Mem0 Gateway / PostHog MCP | `coding-preferences` and team skills |
| TypeScript toolchain | Node LTS + PNPM (global or project) | Primary language stack |
| Git | Git CLI | Repos and CE ship path |
| GitButler | `but` CLI where the repo uses GitButler | Preferred VCS writes in those repos |
| GitHub access | Via Mem0 Gateway (or `gh` if gateway unavailable after requestable empty) | PRs and upstream issues |
| Linear access | Via Mem0 Gateway | Issues for our products |
| SuperMe | Via Mem0 Gateway `superme__*` | Context feed + personal/network intelligence |
| Secrets | Proton Pass (CLI/skill when available) | Credentials - never paste secrets into chat or SuperMe feeds |
| Docs lookup | **Context7** via Mem0 Gateway (always) | Current library APIs - never invent examples |
| Vendored source | Git + `git subtree` under `externals/` | Agents read real source; prefer subtree over submodules |
| Office/PDF to Markdown | anydoc (`convert-documents-to-markdown`) | `npx -y @firecrawl/anydoc` when reading office docs |
| Orca (controlled boxes only) | Orca Remote Server / `orca serve` | Multi-agent orchestration on hosts we control (not Cursor/Codex/GitHub runners) |
| Vercel plugin (Vercel projects, local machines only) | `npx plugins add vercel/vercel-plugin` (needs Node 18+ and Bun) | Vercel's skills and tooling in the agent; not on CI runners or headless boxes. See PostHog `coding-preferences` -> `references/vercel.md` |

### Orca need-check

Before loading Orca skills or installing Orca:

- **Yes** when the job needs supervised multi-agent coordination / DAGs, Orca worktree handoffs, Orca terminal/browser control, Orca Linear flows, or per-workspace env via Orca.
- If yes: load PostHog `orchestration` / `orca-cli` / `orca-linear` / `orca-per-workspace-env` as relevant; resolve the CLI per skill stub; run `ORCA skills get <name>` before inventing commands. On Linux outside Orca-managed terminals prefer `orca-ide` (never bare `orca` - that may be the GNOME screen reader).
- If no: do not install or start Orca just because it is catalogued.

### Orca headless on controlled boxes (required)

On agent hosts **we control** that are **not** Cursor Desktop, Codex (local or cloud), or GitHub remote workers / Actions runners: install and keep **Orca Remote Server / headless** via `orca serve` ([Remote Orca Servers](https://www.onorca.dev/docs/remote-servers), [Ways to run Orca](https://www.onorca.dev/docs/ways-to-run)).

- Applies to: VPS, home servers, always-on Linux/Mac minis, OpenClaw boxes, other self-hosted agent machines.
- Does **not** apply to: Cursor Remote sessions, Codex Remote sessions, GitHub-hosted agents/runners (those already provide a host runtime).
- Prefer a private network path (e.g. Tailscale). Register provider accounts on the **server** (`orca account add --agent …`). Install skills with `orca skills install` / `update` without a Settings UI.

### Strongly recommended for monorepo / CI work

| Capability                          | Notes                                                                             |
| ----------------------------------- | --------------------------------------------------------------------------------- |
| Nx                                  | When the repo is an Nx workspace                                                  |
| Trunk                               | Merge queue / flaky quarantine when the repo uses it                              |
| resnovas/smartcloud (or equivalent) | Code-driven PR/issue conventions when present                                     |
| Browser tooling                     | For CE `ce-test-browser` / visual verify when UI ships                            |
| Git subtree fluency                 | Add/update vendor trees under `externals/` with `--prefix` and usually `--squash` |

### Setup completion criteria

- CE skills resolve on the host skill list (including `lfg`)
- Mem0 Gateway `find_tools` works
- Cognee reachable (`recall` returns and `COGNEE_API_KEY` resolves)
- PostHog `coding-preferences` can be fetched
- Context7 reachable via Mem0 Gateway (or `request_access` filed)
- TypeScript/PNPM available when the task is TS
- Tracker path chosen (Linear vs GitHub) for the product under work
- On controlled boxes (not Cursor/Codex/GitHub runners): Orca headless/`orca serve` installed when that host runs agents
- anydoc available (`npx -y @firecrawl/anydoc`) when office/PDF conversion may be needed

If setup fails, stop and report the gap instead of improvising unsafe substitutes.

## Set up this repository's workspace

The ecosystem above is the host. This section covers the checkout: the editor and agent toolsets committed in the repository (house standard `project-dev-surfaces`). Every Resnovas repository gets the same set from the house sync, so these steps work in any of them.

### On a clean clone

1. Install Node 24 or later (`engines.node` in `package.json`). The toolsets run package scripts with `node --run`, so npm and pnpm both work.
2. Run `node --run setup`. Every repository's `setup` runs `node tools/dev/surfaces.mjs install`, which registers the Orca quick commands and OpenChamber project actions for the checkout (see Orca below), next to its own install steps. It skips any app that is not installed or not running, so it is safe on a headless box.
3. Export the MCP credentials (see MCP servers below), then run `sh tools/graphify/graphify setup` once per clone. It installs Graphify (once per machine) and the git hooks that keep `graphify-out/graph.json` current. Load the `graphify` skill for how to query it.
4. Run `node --run check` to confirm the checkout is healthy. It is the same gate CI runs.

Every step is idempotent: re-run it whenever a sync pull request changes a toolset, and after adding or editing a prompt.

### Which toolset each host reads

| Path | Host | What it gives you |
| --- | --- | --- |
| `.agents/prompts/*.md` | Every agent (the source) | Each slash command written once: the house `review`, `verify` and `address-review`, plus the repository's own. Edit prompts here only. |
| `.agents/skills/` | Codex and other hosts that read `.agents/skills` | Repository skills, such as `graphify`. |
| `.agents/mcp.jsonc` | Every MCP host (the source) | The MCP servers; see MCP servers below. |
| `.agents/surfaces.jsonc` | Orca and OpenChamber | The action list: the synced `house` actions (setup, check, test, graph) and the repository's own `actions`. |
| `CLAUDE.md`, `.mcp.json`, `.claude/commands/`, `.claude/skills/` | Claude Code | `CLAUDE.md` imports this file; `.mcp.json` and the commands are generated from `.agents` (`/review`, `/verify`, ...); `graphify` is the skill. `.claude/settings.local.json` is per-user and not committed. |
| `.codex/environments/environment.toml`, `.codex/config.toml` | Codex | The environment runs `node --run setup` when Codex desktop creates the local environment and adds Check, Test and code graph actions (Codex cloud does not read it). `config.toml` holds the generated MCP servers; Codex loads it once the project is trusted. |
| `.cursor/commands/`, `.cursor/mcp.json` | Cursor | The same commands and MCP servers, generated from `.agents`. Cursor also reads `.vscode/`. |
| `.vscode/tasks.json`, `.vscode/launch.json`, `.vscode/mcp.json` | VS Code and Cursor | Tasks: setup, check, test, graph open/update/check, agents sync/install, plus the repository's own. Launch configs debug the current file and a dry-run surfaces install, plus the repository's own. `mcp.json` is generated from `.agents/mcp.jsonc`. |
| `.zed/tasks.json`, `.zed/debug.json` | Zed | The same tasks and debug configurations. |
| `.run/*.run.xml` | JetBrains IDEs | The same actions as run configurations: `house-*.run.xml` are synced, the rest belong to the repository. |
| `orca.yaml` | Orca | Worktree setup; see below. |

OpenCode is not supported: the house does not generate `.opencode/commands`, and `node tools/dev/surfaces.mjs sync` deletes it where an older sync left it.

### How Orca sets itself up

- **Worktrees.** `orca.yaml` sets `scripts.setup: node --run setup`, so Orca runs setup after it creates each worktree. `setupAgentStartupPolicy: wait-for-setup` holds agents until setup finishes, so an agent in an Orca worktree starts with its workspace ready and should not run setup again. A repository can open default tabs, such as an agent, with `defaultTabs` after the `house:local` line.
- **Quick commands and prompts.** Orca keeps these in per-user settings, not in the repository, so `node tools/dev/surfaces.mjs install` (run by setup) writes them through Orca's local socket. Orca must be running and the checkout must be added to Orca, otherwise install says so and skips. It adds one quick command per action in `.agents/surfaces.jsonc`, plus one agent prompt per prompt for each agent in its `agents` list (Claude and Codex); prompts that take `$ARGUMENTS` stay editor-only. It only touches entries prefixed with the repository name and refuses to exceed Orca's limit of 40 quick commands.
- **Check before writing.** `node tools/dev/surfaces.mjs install --dry-run` reports what it would change and writes nothing.

### MCP servers

`.agents/mcp.jsonc` is the one list of MCP servers. The host configs (`.mcp.json`, `.cursor/mcp.json`, `.vscode/mcp.json`, `.codex/config.toml`) are strict JSON or TOML, so they are generated by `node tools/dev/surfaces.mjs sync` rather than synced with managed blocks. The house servers:

| Server | What it is | Needs |
| --- | --- | --- |
| `mem0-gateway` | External tools (see Mem0 Gateway) | `MEM0_GATEWAY_TOKEN` |
| `cognee` | Memory and knowledge on Cognee Cloud, through `uvx cognee-mcp` | `uv`, `COGNEE_BASE_URL`, `COGNEE_API_KEY` |
| `graphify` | This repository's committed code graph, over stdio | `sh tools/graphify/graphify setup` once per clone |
| `graphify-cloud` | Graphify Cloud, across repositories | OAuth sign-in on first use (Codex: `codex mcp login graphify-cloud`) |

No config holds a credential. Take the values from Proton Pass (AI Agents Vault) and export them in the shell or agent environment before starting the host; each config only references the variable. A repository adds its own servers under `servers` in `.agents/mcp.jsonc`, never by editing a generated file.

### Changing a toolset

- Synced files carry a `house:managed` block. Put repository-specific tasks, actions, debug configurations and Orca settings after the `house:local` line; never edit inside the managed block. The managed content comes from `templates/` in `Resnovas/.github`; change it there (its `change-template` command) and the next sync pull request carries it here.
- `.claude/commands/`, `.cursor/commands/` and the MCP configs are generated. Edit `.agents/prompts/` or `.agents/mcp.jsonc`, then run `node tools/dev/surfaces.mjs sync`; `check` fails while they are out of date.
- After changing `.agents/surfaces.jsonc`, re-run `node --run setup` so Orca and OpenChamber pick it up.

## Context7 (always)

**Always** resolve library, framework, and SDK behaviour through Context7 via Mem0 Gateway before implementing or reviewing against that API - including well-known stacks (Effect, Nx, React Native, Blnk, WorkOS, etc.). Training data and pasted snippets go stale; Context7 tracks current docs.

### Loop

1. `find_tools(task="Context7 docs for <library> <topic>")` (or the gateway Context7 tools if already granted).
2. Resolve library id, then query the specific topic.
3. If Context7 is not granted: `requestable` -> `request_access`; tell the user; do not invent API examples while waiting.

### Hard rules

- Never invent SDK call shapes, flags, or config keys into code, skills, issues, or SuperMe feeds
- Never paste long sticky API tutorials into PostHog skills - Context7 is the how; skills hold which/why
- Prefer Context7 over scraping random blogs when both could answer
- Where extensive utilisation of tool (e.g. effect); prefer source availability

## Source availability (git subtree)

**Preference:** Agents are far better when they can read real source. For major or agent-heavy dependencies, keep **source available** in the project via **`git subtree`** under **`externals/`** (PostHog `coding-preferences` -> `references/vendoring.md` and `references/agent-git.md`).

### Why

- `node_modules` is often compiled, flattened, or gitignored - agents are deoptimized there
- Docs explain the public surface; source shows how it actually behaves
- Subtree directories behave like normal files (unlike submodules / `.gitmodules` friction)

### Practice

- Prefer **subtree** over **submodules**
- Use `--prefix=externals/<name>` and usually `--squash` so each add/update is one reviewable commit (full upstream history does not need to live in the product repo)
- Vendor official TypeScript SDKs and other critical libs agents must navigate when the project depends on them deeply
- Optionally add short **pattern files** for recurring usage after first substantial work with a library
- The point is a **readable checkout** agents can open - not a second remote clone workflow

### When not to vendor

- Repo is enormous relative to value
- You must contribute upstream in a submodule-style fork workflow
- No stable public git URL

If a critical dependency is only in `node_modules`, prefer adding a subtree (or tell the user) before asking agents to reverse-engineer minified packages.

## Compound Engineering and `lfg`

### Always-on CE

For software change (feature, bugfix, shipping refactor, CI repair):

- Use CE skills from the installed plugin. Resolve names against the host available-skills list exactly (namespaced or bare).
- Prefer CE git helpers when available.
- After review / before declaring done: run **SuperMe sanitize-and-feed** (below) and **`ce-compound` / learn-capture** when there is reusable learning.

### When `lfg` is the priority

Default to `lfg` when the user asks to build/ship/implement or wants hands-off progress to an open PR, and the task is software-bounded (or already brainstormed).

```text
ce-brainstorm <feature>
lfg
```

or

```text
lfg <feature description>
```

Hard order: plan verified before work; evidence before ship; review/fix before PR; bounded CI repair after PR.

### When not to run `lfg`

Answer-seeking; non-software work; stage-by-stage approval; merge-to-main without grant; product still needs brainstorming first.

### Host invoke cheat-sheet

| Host family | Typical invoke |
| --- | --- |
| Cursor / Claude Code / slash hosts | `/lfg`, `/ce-brainstorm`, `/ce-plan` |
| Codex | `$lfg`, `$ce-plan` |
| oh-my-pi / similar | `/skill:lfg` when required |
| Antigravity / Cline / Devin / Grok / peers | Host skill runner after CE install |

## SuperMe (sanitized context feed)

SuperMe needs ongoing context from real work, but **must never receive real PII, secrets, customer payloads, credentials, private emails/phones, account numbers, or raw proprietary dumps**. Feed **concepts, actions, and new learnings** only.

### When to feed (CE stack placement)

Run sanitize-and-feed at the **end of the CE review / closeout phase**:

- After `ce-code-review` (and apply/fix) on staged runs
- After `lfg` review + residual capture, before or right after PR open
- After `ce-compound` / learn-capture when new durable lessons exist
- After meaningful non-CE sessions that produced reusable concepts (still sanitize)

Do not stream every keystroke. Batch one concise feed per completed unit of work.

### What to include

- Concepts: architecture choices, patterns, constraints, capability bars (e.g. auth must-haves, local vs online accounting roles)
- Actions: what was done at a process level (planned, implemented X module, quarantined flaky test, opened PR, filed Linear issue)
- Learnings: failures of stock approaches, preferred defaults, gotchas that should compound

### What to strip (hard ban)

- Names of private individuals beyond public maintainer handles already in git
- Emails, phone numbers, addresses, government IDs
- Tokens, passwords, API keys, `.env` contents
- Customer records, invoice amounts tied to identity, health/Tribunal content
- Full file dumps, database rows, screenshots with real data
- Internal URLs that embed secrets

Replace with roles and shapes: "finance admin", "tenant org", "ISO-4217 amount", "OAuth client id (redacted)".

### How to feed (via Mem0 Gateway)

1. `find_tools(task="SuperMe save library note or ask my agent")`
2. Prefer instructing My Agent to **create/update a library note or insight** with the sanitized brief, e.g. via `superme__ask_my_agent` with an explicit "save this as a private library note; content is already PII-scrubbed" instruction.
3. Mirror the same scrubbed one-liner into Cognee with `remember` when it should follow across hosts.
4. If SuperMe tools are missing: `requestable` -> `request_access`; tell the user; continue the CE ship path without blocking on SuperMe.

### Completion criteria

Sanitized feed sent, or access requested and user informed, or explicitly no new learning this turn (state that in the turn checklist).

## Cognee (memory and knowledge)

Store for durable general memory and vault knowledge, on hosted Cognee Cloud. It does not hold code: see "Graphify (code knowledge)" below. **Mem0 memories and Graphiti are retired.** Do not reintroduce them and do not stand up another memory system alongside these two.

Mem0 **Gateway** is a different product and stays: it fronts external tools, not memory.

Connect with the first route the host supports: the Claude Code or Codex plugin, else `cognee-mcp` in cloud mode, else the plain HTTP API. Hosts that cannot install plugins use MCP or HTTP; nothing requires a plugin. Credentials, routes and endpoints: PostHog skill `cognee-memory`.

Memory is split by dataset, not by file path:

| Dataset | Holds |
| --- | --- |
| `general` (default) | Coding preferences, agent instructions, every PostHog skill, tooling and personal preferences |
| `resnovas` | Resnovas, Eventiva, freelance work |
| `climbuk-climbgroup` | Climb work |

### Loop

1. With a plugin, relevant memory is recalled automatically each turn; call `recall` explicitly for a targeted lookup. Without one, `recall` before assuming.
2. Write durable lessons with `remember`, always passing the dataset.
3. Never call `forget` without Jonathan's explicit approval; it deletes a whole dataset.
4. Session entries bridge into the permanent graph at session end.

### Hard rules

- Same sanitization bar as SuperMe: no secrets, credentials, customer payloads, or raw PII.
- Cloud mode has **no partial update** - a changed file is deleted and re-added, and the re-ingest is billed per token. Batch vault writes; do not sync per keystroke.
- Code repositories are not indexed in Cognee; do not create `codebase-*` datasets. Structural code questions go to the repository's Graphify graph. Decisions and lessons about code (why something was chosen) still go to Cognee.

## Graphify (code knowledge)

Every repository commits a Graphify graph of its own code in `graphify-out/graph.json`, built and queried through `tools/graphify/graphify`, which the house sync brings from `Resnovas/.github`. It works offline for anyone who clones the repository, external contributors included.

- Query the graph before broad code searches: `sh tools/graphify/graphify query "<question>"`, or `explain`, `path`, `affected`.
- After changing code, run `sh tools/graphify/graphify update` and commit `graphify-out/` in the same pull request.
- Never run a paid or remote model over a repository; documents go through local Ollama only (`semantic`).
- Commit only `graph.json` and the semantic cache; `graphify-out/.gitignore` enforces it.
- Jonathan's Graphify Cloud workspace is private and spans repositories, `Resnovas/.github` and the Second Brain. Never commit a combined graph.

Full procedure: PostHog skill `graphify`.

### Cognee datasets and memory routing

Extends Cognee's built-in `cognee-datasets` skill (v1.1.0) with this user's fixed domains. Cognee's rule still applies: default dataset for general memory, a dedicated dataset only where there is a clear separation. Here the clear separations are WORK domains. Personal and general memory lives in the default.

#### Datasets (check this list first, skip the lookup if it covers you)
| Dataset | Domain | What goes here |
|---|---|---|
| `general` | Personal / general (DEFAULT) | Code preferences, bot and tooling preferences, personal preferences, facts about the user, dataset routing rules, skills and how agents should work, anything not in a work domain below |
| `climbuk-climbgroup` | Work: Climb | ClimbUK, Climb Group, InvestorLadder, CRSI, all Climb events (Climb25/26/27). Audiences/ICP, partners (sponsors, exhibitors, speakers, collaborations), brand, funnels, analytics, Odoo, Linear team ClimbGroup |
| `resnovas` | Work: Resnovas | Resnovas, Eventiva, freelance work |

#### Finding and adding datasets
1. `list_datasets_json` shows what exists. If one isn't in the table above, search it read-only (`recall` with `datasets` set to it) and tell the user so the table gets updated.
2. Don't create new datasets on your own. Suggest one only when the user has a clear new separation (a new client, company or project). Reuse an existing one rather than a near-duplicate. A dataset is created automatically the first time you `remember` to a new name, so a typo in `dataset_name` creates a stray dataset. Copy names exactly.
3. `get_client_info_json` shows your agent's auto-dataset. Don't use it for durable facts.

#### Saving (permanent memory)
- ALWAYS pass `dataset_name`. A blank name writes to your agent auto-dataset, not the default.
- Pick by domain: Climb work to `climbuk-climbgroup`, Resnovas/Eventiva/freelance to `resnovas`, everything else to `general`. If a fact spans domains, write it to each, worded for that domain.
- One self-contained fact per call, with the date and source ("2026-09-24, user said …").
- `recall` first so you don't save duplicates.
- To correct a fact, save the corrected version and say what it replaces. `forget` deletes a WHOLE dataset, so never call it without the user's explicit approval.
- Never store secrets, tokens, passwords or credentials.
- Dual-write: durable facts also go into your built-in agent memory. Cognee is the shared copy other agents read, and it doesn't replace built-in memory.

#### Recalling
- New session or general task: `recall` with `datasets="general"` for preferences and rules.
- Climb audience, ICP, partner, brand, campaign or event work: `recall` with `datasets="climbuk-climbgroup"` before starting.
- Resnovas/Eventiva/freelance work: `recall` with `datasets="resnovas"`.
- Always scope `datasets`. Use search_type `CHUNKS` when you need the exact original wording.

#### Session memory (when appropriate)
Use a session (`remember` / `recall` with `session_id`) for multi-step work spanning several turns or agents (review loops, research passes, roundtables, migrations), working notes, drafts, hand-off context, and findings not yet confirmed. Use permanent memory for confirmed decisions, preferences, facts, and a loop's final outcome.
- Name sessions `<dataset>__<agent>__<yyyy-mm-dd>__<topic>`, e.g. `climbuk-climbgroup__polly__2026-09-24__climb27-partners`.
- Put the session id in any hand-off (Linear comment, agent message) so the next agent can `recall` with it.
- At the end, promote durable conclusions into permanent memory in the right dataset. Never leave something important only in a session.
- Quick one-off questions don't need a session.
- If a Cognee plugin is installed where you run (for example Claude Code's `cognee-memory`, which uses `COGNEE_PLUGIN_DATASET`), set it to the matching dataset above and keep the same session naming.

## Mem0 Gateway (tools)

Principal front door for external capabilities. Credentials and org scope are server-side.

1. `find_tools(task="...")` - plain-language job.
2. On match: `describe_tool` then `invoke` (or call if already exposed).
3. On `[]`: `find_tools(type="requestable")`.
4. `request_access(tool_names=[...], reason="...")` - report pending; **do not poll**.
5. `discover()` for full inventory when needed.
6. Other MCP/CLI only when both granted and requestable are empty for that job.

Never invent that a tool "must not exist." Prefer request over give-up.

## Coding standards (pointer)

Do not paste the full preferences here.

1. Load PostHog **`coding-preferences`** (Resnovas Default).
2. Pull one reference for the task (`effect`, `language`, `architecture`, `ci`, `auth`, `accounting`, `integrations`, `docs`, `agent-git`, `vendoring`, …).
3. **Always** use Context7 via Mem0 Gateway for current APIs before coding against them.
4. Prefer reading vendored source under `externals/` when present; push for subtree vendoring when agents otherwise thrash on `node_modules`.

TypeScript is the **primary** language; apply language-agnostic prefs to other languages when relevant (testing, CI/merge gates, integrations vs core, auth capability bar, accounting roles, docs contracts, no deleting failing tests, secrets out of source).

Hard bites even before the skill loads:

- Prefer typed, strict code; never `any` in TypeScript
- Never delete a failing test to green CI (quarantine when flaky)
- Vendor SDKs behind integration modules, not in core
- **Context7 always** for library how-to; skills hold which/why
- **Source available** via git subtree under `externals/` for agent-critical deps
- AI PR bots are advisory; deterministic gates (Nx / Trunk / resnovas/smartcloud) win
- Capability bars beat brand loyalty for auth and accounting vendors
- Hard house standards (whitelabel, community skills, ASCII hyphens, commits/R&D, module architecture, GitButler) always apply

Soft cross-chat notes: Cognee memory.

## Issues and triage

When a defect or gap is found:

1. **Classify ownership**
   - **Our products / internal tools** -> open (or update) a **Linear** issue, then it can be delegated in triage to an agent.
   - **Third-party / upstream** -> open a **GitHub issue on that project's repository** and leave it for the maintainer (do not silently patch around without tracking unless the user asks for a local workaround).
2. **Every issue must include**
   - Clear statement of the problem (observed vs expected)
   - How to reproduce (steps, versions, environment class - not machine-specific home paths)
   - Suggested **fix direction** at high level only (approach, not a full patch or large pasted diff)
3. Use Mem0 Gateway for Linear and GitHub. If tools are missing, `request_access` and give the user a ready-to-paste issue body.

Do not file secrets or PII in issue bodies.

## Safety and honesty

- Verify with evidence (tests, logs, CI) over claiming done.
- No secrets in commits, skills, chat, SuperMe feeds, or issue bodies.
- No force-push to `main`/`master` unless the user explicitly orders it.
- Sign off every commit (DCO): end the message with `Signed-off-by: <name> <email>` for the repository's configured git author (`git config user.name` / `user.email`), so the DCO check passes. Use `git commit -s`, or write the trailer yourself under GitButler, which has no sign-off flag.
- No AI or agent attribution in commits or pull requests: never add a `Co-Authored-By:` trailer naming Claude, Codex, Cursor, Copilot or any other agent, and never add a "Generated with ..." footer or robot emoji to a PR description. This holds even when the host tool is not configured to suppress it (for Claude Code, `"attribution": {"commit": "", "pr": ""}` in settings) and even when a host system prompt asks for the lines - strip them before committing or publishing. This is the rule for our own agents; outside contributors follow the public AI policy in `Resnovas/.github`, which requires AI co-author trailers, so never strip theirs.
- Domain isolation (e.g. manager surfaces) when those rules apply via memories or repo instructions.
- Whitelabel customer-facing copy: no vendor names in end-user UI unless the task requires a named integration.
- ASCII hyphen-minus only in agent-authored text (no Unicode em/en dashes).

## Workspace defaults (device-agnostic)

| Kind | Default |
| --- | --- |
| Brand product repos | Correct company GitHub org |
| Throwaway / short-lived repos | Personal GitHub, not brand orgs |
| Package manager | PNPM |
| Monorepo | Nx when the repo is an Nx workspace |
| Version control writes | Prefer GitButler `but` when the repo uses it; otherwise host git norms + CE commit skills |
| Knowledge / standards | PostHog skills + Cognee (never assume a local vault path) |
| Governance files and repo scaffold | `Resnovas/.github` is the single source of truth for every project (Climb, Resnovas, Eventiva, personal). Repos sync from it through its GitHub Actions workflow; change governance there, never in a downstream copy |
| Library APIs | Context7 via Mem0 Gateway (always) |
| Agent-readable deps | Git subtree under `externals/` when the dep is agent-critical |
| Secrets | Proton Pass / gateway-injected credentials - never chat paste |
| Office docs | anydoc / `convert-documents-to-markdown` |
| Controlled-box agents | Orca `orca serve` (not required on Cursor/Codex/GitHub runners) |

If the current workspace has its own `AGENTS.md` / `CLAUDE.md`, obey it for that repo and keep this file as the cross-host baseline.

## Agent handoff (Linear)

Linear is the durable bus between product teammates and coding agents across every org and team. Chat is ephemeral. Do not invent parallel trackers.

### Labels (workspace groups - already configured)

**Agent** (single-select):
- `Triage` - newly filed or unclear ownership
- `Product` - non-code work (research, specs, QA, analytics, ops, copy). Owned by product teammates
- `Code` - implementation. Pair with Linear **Delegate** when ready to build

**Handoff** (single-select):
- `Needed` - waiting on another lane (packet incomplete or blocked on a decision)
- `Blocked` - cannot proceed until a named blocker clears

### Who does what

| Lane | Who | How work starts |
| --- | --- | --- |
| Product | Product teammates (this host and peers) | Issue has `Agent` = `Product` |
| Code | Linear Agents: Cursor, Codex, GitHub Copilot (more later) | Issue has `Agent` = `Code` **and** **Delegate** set |
| Triage | Product triage routine / product teammate | Issue has `Agent` = `Triage` (or missing Agent label) |

### Required handoff packet

Every issue that leaves Triage must have, in the description or a pinned comment:

1. **Goal** - one sentence outcome
2. **Context** - links to parent, PR, dashboard, or prior issue
3. **Acceptance criteria** - checklist a stranger can verify
4. **Constraints** - secrets out of the issue; cite Pass / secure input only
5. **Done signal** - what label/state/comment means "lane finished"

When shipping code work from Product -> Code: set `Agent` = `Code`, clear or leave `Handoff` empty unless still waiting, set **Delegate** to `Cursor`, `Codex`, or `GitHub Copilot`, and keep the packet complete.

Product teammates **can** set Delegate via Linear MCP (`save_issue` / create with `delegate`).

### Multi-teammate / multi-angle work

Prefer **one parent + child issues** over splitting ownership across mystery labels:

- Parent keeps the goal and final decision; `Agent` = `Product` (or `Code` once implementation is the remaining work)
- Children explore angles in parallel, e.g. titles prefixed `[UX]`, `[Architecture]`, `[Devil's advocate]`
- Each child has its own packet and acceptance criteria; conclusions roll up as comments on the parent
- When implementation starts, either convert the parent to `Agent` = `Code` + Delegate, or open a focused Code child and link it

Peer product bots (cross-chat) may discuss privately, but **durable decisions and artifacts must land on the Linear issue**. Same rule for external agent-team patterns: children in Linear are the shared ledger.

### Coding-agent duties on create

When a coding agent opens or claims an issue:

1. Ensure the correct product **team**
2. Set `Agent` = `Code` (or `Triage` if ownership is unclear)
3. Fill the handoff packet before asking for Product review
4. On needing Product input: set `Handoff` = `Needed`, `Agent` = `Product`, and comment with the exact question

### Product-teammate triage (routine)

On a schedule (default: weekdays hourly in working hours), or when asked:

1. List open issues with `Agent` = `Triage`, or with `Handoff` = `Needed` / `Blocked`
2. Complete or request the packet
3. Route: `Product` vs `Code`
4. If `Code` and ready: set Delegate (default Cursor unless the issue names Codex / Copilot)
5. Comment briefly what changed; ping Jonathan only for blocked decisions or secrets

## Turn checklist

Complete every item before declaring done. Mark N/A only with a one-line reason.

### A. Ecosystem

- [ ] CE available (or install/report gap)
- [ ] Repository workspace set up (`node --run setup`, Graphify hooks) or already done by Orca worktree setup
- [ ] Mem0 Gateway usable (`find_tools` works)
- [ ] Cognee reachable (`recall` works) when memory is read or written
- [ ] Needed PostHog skills reachable (`coding-preferences` when implementing/reviewing)
- [ ] Hard house standards applied (whitelabel, community skills / skill-discovery, ASCII hyphens, commits, modules, GitButler)
- [ ] Orca need-check done (loaded Orca skills only if needed; controlled-box headless OK)
- [ ] anydoc used when office/PDF content had to be read
- [ ] Tracker path ready (Linear and/or GitHub via gateway) when issues may be filed

### B. Method

- [ ] CE used for software work (`lfg` when autonomous ship was the ask; otherwise staged CE)
- [ ] Plan/evidence/review gates respected (no skipped `lfg` order)

### C. Standards and tools

- [ ] House `coding-preferences` applied for this change (TS primary; language-agnostic prefs applied when relevant)
- [ ] **Context7 used** for any library/framework/SDK detail touched this turn (or access requested)
- [ ] Source availability OK: read `externals/` when present; propose subtree vendoring if agents are blocked on opaque packages
- [ ] External tools routed through Mem0 Gateway; `request_access` filed if blocked

### D. Quality and tracking

- [ ] Verification evidence for behavior-changing work
- [ ] Defects filed (Linear for ours, GitHub for upstream) with problem / repro / high-level fix direction
- [ ] Secrets and PII absent from tree, transcript, issues, and SuperMe feed
- [ ] For our products: durable handoffs go through Linear labels + packet, not chat alone
- [ ] No vendor names in process labels
- [ ] Code work: `Agent`/`Code` + Delegate set before expecting a coding agent to run
- [ ] Multi-angle work: parent + children, conclusions on the parent

### E. Compounding

- [ ] SuperMe sanitize-and-feed done (or N/A: no new learning)
- [ ] `ce-compound` / Cognee memory updated when the lesson should recur across chats

If any required box is unchecked, fix it before done.
<!-- house:managed:end -->
<!-- house:local - add this repository's own agent instructions below this line. -->
<!-- Previous content of this file, kept when it was first synced. Re-add what is still needed as local rules, then delete this. -->
<!--
# Working in smartcloud

smartcloud v2 is tracked in Linear (team SMC). v1 is no longer in the tree; its last release is the `1.0.0-beta.8` tag, and v1 configs are still read through the migration in `packages/config`.

House standards apply: the PostHog skill `coding-preferences` (Effect v3, strict TypeScript, pnpm, Nx module boundaries, FCL-1.0-MIT) and the rules in `Resnovas/.github`.

The Effect Language Service (`@effect/language-service`) is a TypeScript plugin in `tsconfig.base.json`, and `pnpm install` patches the workspace TypeScript (`prepare`) so its diagnostics also fail `typecheck`. Use the workspace TypeScript in your editor (`.vscode/settings.json` and `.zed/settings.json` set it). Set `EFFECT_DEVTOOLS=true` to stream the CLI's or MCP server's spans to the Effect Dev Tools extension (`effectful-tech.effect-vscode`).

## Layout

| Path              | What lives there                                                                                                                                                                                                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/<name>` | Libraries. Tag every project with a type (`type_core`, `type_shared`, `type_database`, `type_extension`, `type_platform`) and a layer (`layer_shared`, `layer_backend`, `layer_frontend`) under `tags` in its `project.json`. GitHub API code only in `packages/integrations.github`. |
| `apps/<name>`     | Platforms: the GitHub Action, the CLI and the MCP server. Their `project.json` sets `projectType: library`, because the test projects import them and Nx forbids importing an application.                                                                                            |
| `tests/<name>`    | One test project per package, mirroring `packages/<name>/src`, and `tests/tools` for the release tooling under `tools/release`. Tagged `type_test`.                                                                                                                                   |
| `tools/`          | Workspace scripts, run with Node's built-in TypeScript support.                                                                                                                                                                                                                       |

## Commands

Agents and cloud runners set up with `scripts/agent-setup` (Windows: `scripts\agent-setup.cmd`); `AGENT-SETUP.md` lists the environment, network and runner settings. Editor tasks, debug configurations and agent surfaces only call the package scripts below.

```sh
pnpm install
pnpm run setup                                   # install, nx sync, build (idempotent)
pnpm nx run-many -t lint typecheck test build   # everything
pnpm nx affected -t lint typecheck test build   # what a change affects
pnpm headers                                     # licence header check (pnpm headers:fix to add them)
pnpm typecheck:tests                             # type-check every test project (Nx skips them)
pnpm docs:api                                    # docgen (type-checks @example blocks) and the contracts check
```

## Editor and agent surfaces

The editor tasks, debug configurations and app actions are synced from `Resnovas/.github` with managed blocks: `.zed/`, `.vscode/tasks.json` and `launch.json`, `.run/house-*.run.xml`, `.codex/environments/environment.toml`, `orca.yaml`, `.agents/surfaces.jsonc`, `.agents/mcp.jsonc` and the `verify`, `review` and `address-review` prompts. Never edit inside a `house:managed` block; add smartcloud's own entries after the `house:local` line (or, for JetBrains and prompts, as other files). Every entry calls a package script or a synced tool.

Orca quick commands and OpenChamber project actions live in per-user settings, so `node tools/dev/surfaces.mjs install` (run by the setup script) registers everything in `.agents/surfaces.jsonc` for the checkout. Agent prompts live once in `.agents/prompts/<name>.md`, and MCP servers once in `.agents/mcp.jsonc`; `node tools/dev/surfaces.mjs sync` writes the prompts to `.claude/commands` and `.cursor/commands` and the servers to `.mcp.json`, `.cursor/mcp.json`, `.vscode/mcp.json` and `.codex/config.toml`, and `pnpm run check` fails when those drift. Edit the sources, never the generated copies.

## Workflows

Pin every third-party action to a full commit SHA with its release as a trailing comment (`uses: actions/checkout@<sha> # v7.0.1`); Dependabot's `github-actions` update moves the SHA and the comment together. Only first-party references stay on a ref: the local action (`uses: ./`) and the `Resnovas/.github` reusable workflows, which track `main` so house changes roll out on the next run.

Grant the workflow token per job: set `permissions: {}` at the top of every workflow and give each job only the scopes it uses, so a new job starts with no access. A job that calls a reusable workflow grants no more than that workflow's jobs declare.

Set `timeout-minutes` on every job that runs steps, a few times its usual run, so a hung step fails in minutes instead of holding a runner for GitHub's six-hour default. A job that calls a reusable workflow cannot set one; the called workflow's jobs do.

CI (`.github/workflows/ci.yml`) runs `lint`, `typecheck`, `test`, `build` and `docs` as parallel jobs on the affected projects. On pull requests and the merge queue, the `changes` job (`tools/ci/changes.ts`) first decides which of the last four the change needs: Markdown, MDX and `docs/` files that no code depends on in the Graphify graph need only `lint` and `docs`; files inside Nx projects need the jobs whose targets `nx show projects --affected` reports; any other file (workflows, root configuration, `tools/`, `scripts/`) runs every job, as do pushes to `main`. The `check` job needs them all and passes only when each succeeded or was skipped because `changes` said it was not needed; it is the single context the ruleset and the merge queue require, so add a new CI job to its `needs` rather than to `statusChecks.checks` in `.github/smartcloud.yml`, and gate it on a `changes` output only when its work is covered by one.

A job that runs Nx restores and saves `.nx/cache` with `actions/cache`, keyed on the runner OS, the `pnpm-lock.yaml` hash, the commit, the workflow and the job, and restoring the latest earlier entry, so tasks whose inputs did not change replay from the last run. Never restore a cache in the release workflow, so nothing it builds or publishes can come from a cache entry.

The synced House workflow lint runs actionlint and zizmor on every pull request and fails on any finding. Run them locally with `uvx --from actionlint-py actionlint` and `uvx zizmor .`. zizmor reads the synced `.github/zizmor.yml`; ignore an intended finding where it occurs with a trailing `# zizmor: ignore[<audit>]` comment, and put the reason on the line above. smartcloud's actionlint exceptions go in `.github/actionlint.yaml`.

The synced House dependency review fails a pull request that adds a runtime or development dependency with a high or critical advisory, and lists the changed dependencies in its job summary. Allow an advisory that does not apply, with the reason, in `.github/dependency-review-config.yml` (`allow-ghsas`).

The synced House Scorecard runs OpenSSF Scorecard on `main` weekly and on every push, uploads its findings to code scanning (category `scorecard`) and publishes the score behind the README badge. It uses only the workflow token; fix a finding in the repository rather than suppressing it.

## Review bots

CodeRabbit, Copilot code review, Qodo, Cursor Bugbot and Graphify each have one job, set in `GOVERNANCE.md` (Review bots) and configured by files synced from `Resnovas/.github`: `.coderabbit.yaml`, `.github/copilot-instructions.md` and `.github/instructions/house-*.instructions.md`, `.pr_agent.toml`, `.cursor/BUGBOT.md` and `.graphifyignore`. smartcloud's own review rules go after each file's `house:local` line, or in `.github/instructions/smartcloud-*.instructions.md`. Only a Copilot security finding, a CodeRabbit major or critical comment, the Graphify gate and a Qodo ticket mismatch block a merge (`APPROVAL_POLICY.md`, AP-31).

## Adding a package

1. `packages/<name>/package.json`: `"name": "@resnovas/<name>"`, `"type": "module"`, and an export map whose `.` entry lists `"@resnovas/source": "./src/index.ts"` first, then `types` and `import` pointing at `dist/`. Nx configuration stays out of `package.json`.
2. `packages/<name>/project.json`: `name` (the package name), `$schema` (`../../node_modules/nx/schemas/project-schema.json`), `projectType: library`, `sourceRoot: packages/<name>/src` and the `tags`. Targets come from the Nx plugins and `targetDefaults` in `nx.json`; declare one here only for what those do not provide, and spread (`"..."`) any inherited array you extend.
3. `packages/<name>/tsconfig.json` referencing `tsconfig.lib.json`, which extends `../../tsconfig.base.json` with `rootDir: src`, `outDir: dist` and `emitDeclarationOnly: false`.
4. `packages/<name>/eslint.config.mjs` spreading the root config.
5. `tests/<name>/`: a `package.json` depending on `@resnovas/<name>` with `workspace:*`, a `project.json` tagged `type_test` and the package's layer, `vitest.config.mts` calling `testProject('<name>', ['packages/<name>/src/**'])` from `vitest.shared.ts`, a `tsconfig.json` with `noEmit`, and `src/**/*.spec.ts` using `@effect/vitest`.
6. `pnpm install`, then `pnpm headers:fix`.

Coverage runs on every test and fails below 100% of lines, functions and statements. Never delete a test to make a build pass.

Tests mirror sources file for file: `packages/<name>/src/<path>.ts` is tested by `tests/<name>/src/<path>.spec.ts` (apps map the same way). Barrels and type-only files need no spec; shared fixtures stay as non-spec helper files.

## API contracts

Every exported const, function and class carries a description, a typed `@example` importing from the package's public path, `@param` per parameter and `@returns` unless it returns void; add `@remarks` where behaviour needs explaining. Exports left out of the package's `index.ts` are marked `@internal`. Each package and app has a `docgen.json` for `@effect/docgen`, whose `docgen` target type-checks every example and writes the API docs to `dist/docs`; the `contracts` target (`tools/docs/check-contracts.ts`) checks the built declarations for the tags. Mark an example fence `ts import.meta.vitest` to run it as a test through `@effect/doctest`, and assert with a trailing `// => value` comment (primitives only: Effect 3's `Equal` compares plain objects and arrays by reference). Vitest counts a run example's coverage against the source file it sits in, so a runnable example must call every function it defines; leave the marker off an example that cannot.

## Releasing

Releases are cut by Nx release from the `release` workflow (Actions, run on `main`); see `docs/releasing.mdx`. Conventional commits since the last `v*` tag decide the version, and the tag is the only record of it: the release commit is never on `main`, whose app versions stay `0.0.0`. The workflow pushes a `v<version>` tag on a release commit that holds `dist/index.js` and the bumped versions, writes the notes to a draft GitHub release, moves `v<major>`, publishes `@resnovas/smartcloud` to npm, attaches the SBOMs and attestations, and then publishes the release (immutable releases lock a published one).

The GitHub release holds the main notes. Nx writes the same notes, through `tools/release/changelog-renderer.ts`, to the root `CHANGELOG.md` (v2 releases above the v1 history) and to `CHANGELOG.md` in `apps/action`, `apps/cli` and `apps/mcp`. The workflow's `changelogs` job commits them through the GitHub API as the Resnovas Bot app (a GitHub-signed commit) and opens a `chore(release): changelogs for v<version>` pull request to `main`; merge it before the next release.

- Never run `nx release` without `--dry-run`: the workflow is the only release path, and a local run pushes and creates a GitHub release.
- The first v2 release has no `v*` tag to count from (v1's tags have no `v`): run the workflow once with `specifier` `2.0.0` and `first-release` ticked. Every later release leaves both empty.
- Preview a release, with its notes and the change to each changelog file, with `pnpm release:dry-run` (add `--first-release --specifier 2.0.0` before the first release), or run the workflow with `dry-run` ticked (the default).
- The `nightly` workflow cuts a `v<version>-nightly.<date>` pre-release from `main` each night when `main` has moved, and moves `v2` to it until the first stable 2.x release. `releaseTag.strictPreid` in `nx.json` keeps nightly tags out of a stable release's version and notes; never turn it off.

## Commits and pull requests

Small stacked pull requests through GitButler, one Linear issue each, titled with conventional commits and the issue key in the branch. Every commit is signed off (DCO).
-->
