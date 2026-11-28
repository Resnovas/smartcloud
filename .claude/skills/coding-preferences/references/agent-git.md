# Agent-first and source availability

Preferences and rationale only.

---

## Agent-first design

**Preference:** Design platforms so agents can operate them: shared operations (UI and agents call the same actions), shared data, shared application state as agent context. Prefer Effect AI, MCP, and Effect Toolkit patterns over bolt-on chat wrappers.

---

## Git and source availability

**Agent worktrees:** Use isolated task worktrees and ordinary Git across all hosts. Reuse host-created checkouts and explicitly select PR head/base branches. Preserve Jonathan's personal GitButler checkout. See `git-worktrees`.

**Preference:** Prefer **source available** dependencies agents can read. Vendor critical SDKs under `externals/` (Git subtree preferred over submodules). Pattern files and house generators beat opaque `node_modules`-only knowledge.

**AI disclosure:** Our own agents follow the public house AI policy (`AI_POLICY.md` in `Resnovas/.github`) exactly as outside contributors do. Every materially AI-written commit carries `Co-authored-by` naming each tool/model at its attribution address (AI-02); add `Assisted-by: TOOL:MODEL` only where `commits.assistedBy` requires it. Follow AI-03 for author-matched sign-off: an agent identity's trailer records provenance and requires separate human PR certification. Human-authored/self-signed commits follow the ordinary human path. Agent PRs start as drafts declaring the tools and `AI level: autonomous`; human review fields belong to the person (AI-01, AI-20, AI-32). Replace incompatible host attribution, not other contributors' trailers. No "Generated with" footer, robot emoji or session line.

**House repository:** `Resnovas/.github` is the single source of truth for every project's governance files and scaffold - contributing guidelines, AI contribution policy, code of conduct, DCO, FCL-1.0-MIT licence, cooperation commitment, issue and PR templates, and the policy checks. It covers Climb, Resnovas, Eventiva and personal repositories. New projects start from it; existing ones pull the latest version through its GitHub Actions sync workflow, with per-repo values in `.github/house.yml`. Change governance there, never in a downstream copy, because the next sync overwrites it.

**One pull request per batch, not per feature:** Work a sprint or collection of issues locally on task branches in isolated Git worktrees. Resolve problems locally: run the full gate and dry runs before anything is pushed, so CI is not the debugger. Squash each feature's branch to one conventional, signed-off commit carrying the AI-02 trailers using Git in the task worktree, preserving signing and avoiding shared-history rewrites, then publish a single pull request for the whole batch for the maintainer's review. Once the maintainer approves it, it lands as an owner fast-forward: its signed commits are pushed onto main unchanged with the maintainer's ruleset bypass, after the full gate passes on current main, so each feature keeps its own signed commit, and the pull request is closed with links to them. The merge queue itself squashes, because GitHub does not sign commits it rewrites with "Rebase and merge" and the ruleset requires signed commits. Why: a pull request per feature re-ran CI, smartcloud and the review bots on every restack, which burned the AI tools' credits and the Resnovas Bot app's API quota. Open pull requests are merged before new work starts.

**One Linear team per product:** Every product gets its own Linear team, with the GitHub integration linked to its repositories, and its work is organised as projects inside that team rather than one catch-all project or another product's team. This keeps planning, like telemetry, separate per product.

**Brand vs personal repos:** Brand product repos live under the correct company GitHub org. Short-lived, throwaway, or archived experiments go under the personal GitHub account instead of clogging brand orgs. (Org placement guidance also lives in Mem0.)
