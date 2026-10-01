# Recent changes

**Rolling window - last 30 entries.** One line per change; detail belongs in the bundled file that owns it. Trim as you append. Dropped entries are not archived - store versions are immutable, so anything trimmed stays readable in an earlier version of this skill. (Pattern 7 in `patterns.md` - this skill eats its own dogfood. Entry-count window rather than a day window because this skill changes slowly.)

## 2026-08-27

- Community publishing caps descriptions at 1024 chars: own description trimmed to fit; rule added to `spec-checklist.md` and pattern 1.
- Scrubbed for community publication: exemplar skills are described by shape instead of by name, and internal scout, tool, and owner references are gone. No pattern changed.

## 2026-07-28

- Pattern 7 rewritten from append-log to **rolling window**: contract stated in the file's own header, a real number instead of "when unwieldy", trim-on-append, drop-don't-archive, and one line per entry with the detail in the owning file. `CHANGELOG-archive.md` retired as a pattern. Drawn from one living skill reaching 66 KB of changelog in 8 days.
- Added a living-memory routing table at the top of section B - which of `issues/` / `environment-notes.md` / `HANDOVER.md` / `CHANGELOG.md` a given fact belongs in, decided by durability and whether anything owns it.
- Pattern 6 gains the **sectioned handover**: whole-file clobber breaks once parallel sessions are the norm, so one `## ` section per workstream, deleted when the work lands, with durable reference moved out.

## 2026-07-01

- v1: created. House patterns distilled from four long-running operational skills; official spec checklist seeded from the canonical sources listed in `spec-checklist.md`.
