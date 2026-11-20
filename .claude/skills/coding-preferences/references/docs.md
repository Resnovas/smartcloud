# Documentation and agent knowledge

Preferences and rationale only. For Mintlify, Docs7, Graphify, or `@effect/docgen`, call Context7.

---

## Two docs for everything: ELI5 for people, ai-docs for agents

**Preference:** Every repository documents itself twice, by default, and a feature is not finished until both are updated in the same change.

- **People:** clear guidance and setup guides under `docs/` that cover every feature, configuration option, preset and workflow exhaustively, following the ELI5 rules: plain words and short sentences; what it is and why you would want it before how; step-by-step setup a newcomer can follow; one complete, copy-pasteable example; what the reader will see when it runs; every option with its default; common problems and fixes; every term defined on first use.
- **Agents:** an `ai-docs/` tree (numbered sections of prose plus compiled `.ts` examples) assembled into a root `LLMS.md` by `tools/ai-docs/docgen.mjs`, with a check that fails when `LLMS.md` is stale. The generator, `ai-docs/README.md` and the house-standards section are synced from `Resnovas/.github` templates; each repository adds its own sections from `10_` up. Modelled on Effect's own `ai-docs` and `Resnovas/openclaw-proton-pass`.

**Why:** people and agents read differently. People need a guided path and plain explanations; agents need one dense file whose examples are guaranteed to compile. Missing either is a defect, not an optional extra.

---

## API contract documentation

**Preference:** Every exported callable carries contracts that survive into `dist/**/*.d.ts` (`@remarks`, typed `@example`, `@param`, `@returns` unless void). Test-generation agents may treat declaration files as source of truth.

---

## Docs7 and Mintlify

**Preference:** Product docs use one MDX tree under `docs/` with Mintlify schema, rendered by both Mintlify (local authoring UX) and Docs7 (published / LLM surface: markdown per page, `llms.txt`, Context7). Write only components both accept.

---

## Documentation creator agent

**Preference:** Long-form repo guides that are not API contracts follow Documentation Creator patterns (`docs/parts/`, `docs/assembled/`, hub `docs/readme.md`) when that agent is in the workspace.

---

## Agent knowledge: Graphify for code and memory

**Preference:** One system, split by scope.

- **Graphify** holds everything about code. Every repository commits a Graphify graph of its own code in `graphify-out/graph.json`, built and queried through `tools/graphify/graphify` (synced from `Resnovas/.github`). It is offline and local first: anyone who clones the repository, external contributors included, gets the graph with no account. Committed: `graph.json` and the semantic cache (model output keyed by content hash, so an unchanged document is never paid for twice). Not committed: the AST cache, report and labels, which are free to rebuild. Extraction never uses a paid or remote model.
- **Graphify Cloud** holds durable memory through the `graphify-cloud` MCP server (`remember`, `recall`, `memories_about`): decisions, preferences, facts and agent instructions, scoped by repository. A combined graph across repositories is never committed to any repository.

**Why:** Graphify's code extraction, MCP server and utilities are stronger for code, and a committed graph works for people who cannot reach a private memory store. Graphify Cloud extends the same system to durable memory. Pair either with domain entity pages as the human-readable source of truth when both exist.