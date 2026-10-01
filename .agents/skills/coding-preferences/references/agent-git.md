# Agent-first and source availability

Preferences and rationale only.

---

## Agent-first design

**Preference:** Design platforms so agents can operate them: shared operations (UI and agents call the same actions), shared data, shared application state as agent context. Prefer Effect AI, MCP, and Effect Toolkit patterns over bolt-on chat wrappers.

---

## Git and source availability

**Preference:** Prefer **source available** dependencies agents can read. Vendor critical SDKs under `externals/` (Git subtree preferred over submodules). Pattern files and house generators beat opaque `node_modules`-only knowledge.

**AI disclosure:** Our own agents follow the public house AI policy (`AI_POLICY.md` in `Resnovas/.github`) exactly as outside contributors do. Every commit an agent writes or materially changes carries, for each AI tool, a `Co-authored-by` trailer naming the tool and model at the tool's attribution address (AI-02), and an `Assisted-by: TOOL:MODEL` trailer only where the repository sets `commits.assistedBy`, above the human's `Signed-off-by`; the commit author is the accountable human and an AI tool never signs off (AI-03). Every pull request an agent opens is a draft that declares `AI level: autonomous` and names each tool and model (AI-01, AI-20, AI-32), leaving the accountable human and human review for the person who marks it ready. A host's own attribution line uses a different format, so agents write the policy's trailer themselves and replace the host's. No "Generated with" footer, robot emoji or session line. Why: the house enforces disclosure on every contributor, its own agents included.

**House repository:** `Resnovas/.github` is the single source of truth for every project's governance files and scaffold - contributing guidelines, AI contribution policy, code of conduct, DCO, FCL-1.0-MIT licence, cooperation commitment, issue and PR templates, and the policy checks. It covers Climb, Resnovas, Eventiva and personal repositories. New projects start from it; existing ones pull the latest version through its GitHub Actions sync workflow, with per-repo values in `.github/house.yml`. Change governance there, never in a downstream copy, because the next sync overwrites it.

**One pull request per batch, not per feature:** Work a sprint or collection of issues locally as stacked GitButler branches. Resolve problems locally: run the full gate and dry runs before anything is pushed, so CI is not the debugger. Squash each feature's branch to one conventional, signed-off commit carrying the AI-02 trailers (`but squash`), then publish a single pull request for the whole batch for the maintainer's review. Once the maintainer approves it, it lands as an owner fast-forward: its signed commits are pushed onto main unchanged with the maintainer's ruleset bypass, after the full gate passes on current main, so each feature keeps its own signed commit, and the pull request is closed with links to them. The merge queue itself squashes, because GitHub does not sign commits it rewrites with "Rebase and merge" and the ruleset requires signed commits. Why: a pull request per feature re-ran CI, smartcloud and the review bots on every restack, which burned the AI tools' credits and the Resnovas Bot app's API quota. Open pull requests are merged before new work starts.

**One Linear team per product:** Every product gets its own Linear team, with the GitHub integration linked to its repositories, and its work is organised as projects inside that team rather than one catch-all project or another product's team. This keeps planning, like telemetry, separate per product.

**Brand vs personal repos:** Brand product repos live under the correct company GitHub org. Short-lived, throwaway, or archived experiments go under the personal GitHub account instead of clogging brand orgs. (Org placement guidance also lives in Mem0.)