# Refactoring a messy skill

Audit → design → execute → verify → log. Read `spec-checklist.md` + `patterns.md` first for the target shapes; read `write-mechanics.md` before executing any writes.

## 0. Fetch and size up

- `call skill-get {"skill_name": "<name>"}` - read the body, description, `outline`, `files` manifest, and `version` (you'll chain `base_version` from it).
- Pull each bundled file worth auditing with `skill-file-get`.
- Snapshot everything locally (scratchpad) so you can diff round-trips later and nothing is lost if a write goes sideways.

## 1. Audit

**First: the compliance floor.** Run `spec-checklist.md` - frontmatter/fields, name format, description quality, body size, single responsibility, link hygiene, instruction style, secrets. Anything that would make the skill fail to load gets fixed before style work.

**Then: the house smell checklist.** Each smell maps to a pattern in `patterns.md`:

- [ ] **Vague description** - no trigger phrases, no coverage list; an agent can't tell when to load it → pattern 1
- [ ] **Monolithic body** - over ~100 lines / one screen; detail inline that's read once per task at most → patterns 2, 4
- [ ] **Buried gotchas** - hard-won rules hidden mid-file instead of surfaced up top → pattern 3
- [ ] **No entry ritual** - nothing says "read this first when resuming" → patterns 5, 6
- [ ] **No change history** - can't tell what changed when, or why → pattern 7
- [ ] **Session state mixed into reference content** - "current status" paragraphs rotting inside runbooks → pattern 6 (extract to HANDOVER.md)
- [ ] **Inline heavy artifacts** - big SQL/scripts inside prose → pattern 11
- [ ] **Duplicated companion content** - re-explains what a sibling skill owns → pattern 13
- [ ] **Unclear posture** - can't tell if it's read-only or a write surface → pattern 14
- [ ] **No maintenance contract** - nothing tells the next agent how to keep it clean → pattern 15
- [ ] **Orphan or type-named files** - files the body never mentions, or `misc.md`/`notes.md` naming → patterns 4, 10
- [ ] **Stale content** - renamed tools/views/files, dead links, hardcoded dates that rotted. Fix or delete while you're in there.

## 2. Design the target layout

- Decide which patterns apply. A pure reference skill needs 1-4 + 15-16; only living operational skills need HANDOVER / issues/ / investigations/.
- Sketch the file map: what stays in the body (index + gotchas), what moves to `references/`, `recipes/`, etc. Name files by job, not type.
- Plan the description rewrite LAST - after restructuring you know exactly what the skill covers, so the triggers write themselves.
- Sanity-check single responsibility: if the audit found two unrelated jobs, propose a split (`skill-duplicate` then trim each) rather than a tidier kitchen sink.

## 3. Execute (order matters)

Chain `base_version` call-to-call (see `write-mechanics.md`):

1. **Create new bundled files** (`skill-file-create`) with content extracted from the body/old files. Large files: sentinel-append technique.
2. **Shrink the body** - a restructure is the one legitimate case for a full-`body` replace via `skill-update`. New body: intro, gotchas, file map, companions, maintaining.
3. **Trim/patch surviving files** with `file_edits` (find/replace) - never delete-and-recreate just to change content.
4. **Rename** poorly named files with `skill-file-rename`.
5. **Rewrite the description** (same `skill-update` as the body, or a follow-up).
6. **Set/extend `metadata`** if missing (owner, product, category).

## 4. Verify

- `call skill-get` - outline matches the target layout; every file in the manifest is mentioned in the body and vice versa.
- Round-trip any large file: `call --json skill-file-get` and diff against your local source (watch for collapsed blank lines at chunk seams - `write-mechanics.md`).
- Read the new body cold: could an agent with zero context route itself from it to the right file in one hop?

## 5. Log

- Add a dated `CHANGELOG.md` entry in the refactored skill - create the file if it didn't have one (that's pattern 7 landing).
- If the skill has `HANDOVER.md`, update it.
- Report to the user: a short old→new map of what moved where, plus anything you deleted and why.
