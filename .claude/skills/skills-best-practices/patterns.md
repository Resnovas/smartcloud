# House pattern catalog

Each pattern names the convention, why it exists, and what it looks like in practice. These sit ON TOP of the official rules in `spec-checklist.md` - pass those first. Not every skill needs every pattern: 1-5 and 15-16 are universal; the living-memory and layout patterns (6-12) apply as the skill's job demands.

## A. Retrieval and body

### 1. Trigger-rich description

The description is the ONLY thing an agent sees before deciding to load the skill - it is the retrieval surface. Pack it with: the job-to-be-done, what's covered (so the agent doesn't have to load it to find out), companions, and concrete trigger phrases - a debugging runbook skill might end with `Trigger on 'job not running', 'empty inbox', '429 / rate limited'…`. Long is fine up to the limit; vague is not. The store accepts 4096 chars, but publishing to the community store and the Agent Skills spec both cap descriptions at 1024, so write for 1024.

### 2. Thin index body

The body is an index, not a manual: what this is (1-2 paragraphs), top gotchas, file map, companions, maintenance contract. Say so explicitly and forbid growth: "This body is a thin index; the real detail lives in the bundled reference files below. Don't grow this file - new detail goes in a reference file". If the body needs a scroll, something in it belongs in a bundled file.

### 3. Top gotchas up front

Surface the 1-3 rules that cause the most damage when unknown IN the body, even though full detail lives in files: "Two rules before you query", "The two rules that bite hardest", "Golden rule: trust live prod, not the warehouse". Include *why*: one debugging skill carries a one-line war story ("The first time we trusted the warehouse it sent us down a wrong path") - that's what makes the rule stick.

### 4. Progressive-disclosure file map

A table or bullet list mapping each bundled file to *when to read it* ("Read before adding / reordering / editing tiles"). Include the copy-paste pull command (`call skill-file-get {...}`). Tell the agent NOT to read everything: "Pull only the reference file the task needs".

### 5. Start-here ritual

Numbered steps for entering a session: read HANDOVER.md first, then the backlog/index, then only what the task needs ("When resuming a session", "Start here each session", or a warehouse skill pointing at `architecture.md` - "START HERE when changing any view").

## B. Living-memory files

**Which file does this fact go in?** The drift these patterns guard against is a fact landing somewhere nobody prunes or refreshes. Two questions settle it:

| Still true in 30 days? | Has an owner who refreshes it? | Goes in |
|---|---|---|
| Yes | Yes - a tracked work item | `issues/NN` / `ideas/NN` (#8) |
| Yes | No - durable reference | `environment-notes.md` or a `references/` file (#10) |
| No, but in flight right now | Yes - you, this session | your `HANDOVER.md` section (#6) |
| No - just "this happened" | - | `CHANGELOG.md`, one line (#7) |

Ask them in that order. A fact that is still load-bearing a month from now is reference content, not a changelog entry, however it arrived. The commonest failure is durable detail written into the changelog because the changelog is what you were already editing.

### 6. HANDOVER.md - the clobber file

Session-to-session state: what's in flight, pending/blocked, what's next. Read FIRST when resuming; OVERWRITE at end of session. "Keep it current, not cumulative - it's a clobber file, not a log (the log is CHANGELOG.md)".

**Section it once parallel sessions are the norm.** Whole-file clobber breaks the moment two workstreams are in flight: the second session has to append rather than overwrite, and the file quietly becomes a second changelog. One fast-moving skill moved to one `## ` section per active workstream plus an **Active workstreams** table at the top - you overwrite your own section, never anyone else's, and **delete it when the work lands**. That deletion is load-bearing: whole-file clobber kept the file from rotting for free, sectioning does not. Durable reference has to move out to its own file (#10) at the same time, because it has no owning workstream and would otherwise be the first thing lost to a tidy-up.

### 7. CHANGELOG.md - the rolling window

Not an append-only log - a **bounded window of recent changes**, sized in days or entries and stated in the file's own header. Four rules, each fixing a way the old "append forever, condense when unwieldy" version failed:

- **Put the contract in the file, not just the skill body.** Line 1 of `CHANGELOG.md` states the window and the trim rule, because that is what an agent has in context at the moment it appends. One changelog opens with "Rolling window - last 14 days. When you add an entry, delete anything older than the window."
- **Pick a number.** "When it grows unwieldy" never fires - an agent mid-task always judges the file tolerable. 14 days suits a fast-moving workstream, 30-40 entries a slower one. State the number; don't imply it.
- **Trim on append.** Rotation is part of every changelog write - prepend the line, delete past the boundary, one `file_edits` call. A separate "rotate the changelog occasionally" chore does not happen.
- **Drop, don't archive.** Store versions are immutable, so the history already exists at zero cost. Delete old entries and leave one pointer at the bottom naming the cutoff and the version - "full pre-compression prose is in versions ≤156". A `CHANGELOG-archive.md` only moves the bytes into the same file bundle; don't create one.

**One line, and the detail goes where it has an owner.** This is the rule that actually caps size. If an entry wants a second sentence, that sentence belongs in `issues/NN`, `investigations/`, or `environment-notes.md`, and the changelog line points at it: `Issue 15 - added the cost identity and the edit-rate denominator problem → issues/15`. Same principle as the thin index body (#2), one level down.

The failure this is drawn from: one living skill's changelog reached **66 KB in 8 days** - 75 entries at a 760-char median, the longest 2,766 chars - writing issue-file content into the changelog while its own convention already said "one terse line each". A stated rule with no size cap, no owning-file alternative, and no firing trim condition loses to whatever is easiest at write time.

Two mechanical helpers: amend rather than append for the same PR or issue on the same day, and group entries under `## YYYY-MM-DD` headings so both amending and boundary-trimming are unambiguous edits.

### 8. issues/ - the backlog

One file per issue (`issues/NN-short-slug.md`) plus `issues/README.md` as a status-at-a-glance index. Numbered prefixes give stable cross-session handles ("issue 26"). Scales well: one backlog skill has run past 30 issues this way.

### 9. investigations/ - the post-mortem archive

One self-contained file per notable debug session: `investigations/YYYY-MM-DD-<topic>.md`, shaped trigger → what we checked (including dead-ends) → root cause → evidence → fixes → open items. Then FOLD reusable lessons back into the matching `references/` runbook - the investigation is the record; the runbook is the reusable memory.

## C. Bundled-file layout

### 10. references/ - runbooks and deep detail

Symptom-shaped runbooks ("symptom → how to confirm → root-cause checks → fixes, with copy-paste commands") or reference catalogs (a `views.md` column catalog, a dashboard `layout.md`). The body routes to them by symptom or task ("Pick an avenue"). Name files by job (`no-emissions.md`, `sampling-and-health.md`), never by type (`misc.md`, `notes.md`).

### 11. recipes/ - copy-paste artifacts

Heavy SQL / scripts / commands live in their own files (`recipes/*.sql`, `references/*.py`), formatted for humans (multi-line, indented, comments) - never inlined into prose. A warehouse skill bundling nine SQL recipes and a debugging skill shipping a Python log parser are typical.

### 12. Paired-update rules for structure docs

When a skill documents a system, keep structure (lineage DAG, ER diagram, layout) in one file and per-item catalogs in another, and make the maintenance contract pair them: "Any view add / repoint / retire must update architecture.md's DAG + table and views.md's catalog in the same step".

## D. Cross-skill hygiene

### 13. Companions section - link, don't duplicate

Name the sibling skills, what each covers, and the division of responsibility - including where to LOG things ("log new investigations there"). "Don't duplicate it; link to it". Reference siblings by name or `skill://<name>`.

### 14. Posture statement

Say whether the skill is read-only/observational or a write surface, and where writes belong instead: "Read-only / observational. To *change* a scout's schedule/posture/body use the scout config tool or the authoring skill, not this skill".

## E. Maintenance contract

### 15. "Maintaining this skill" section

Every living skill ends with an explicit contract: which files to update on which kind of change, the changelog rule, the end-of-session handover clobber, "prefer the smallest edit primitive", and "keep this body thin". This section is what keeps the skill from rotting back into a mess. Every exemplar this catalog draws on has one.

### 16. Metadata

Set `metadata` keys for ownership and discoverability: at minimum `owner`, plus `product` / `category` / `scope` as applicable - `{owner: <person-or-team>, product: code, category: debugging}`.
