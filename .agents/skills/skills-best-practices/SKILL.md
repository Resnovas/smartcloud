---
name: skills-best-practices
description: House style and refactoring playbook for house skills, layered on the Agent Skills spec (agentskills.io) and Anthropic authoring best practices. Covers the compliance floor (spec-checklist.md: frontmatter, name format, description under 1024 chars, body budget, single responsibility, link hygiene, no secrets), 16 house patterns (trigger-rich descriptions, thin index bodies, progressive-disclosure file maps, gotchas up front, HANDOVER.md clobber files, rolling-window CHANGELOG.md, where a fact belongs, references/, investigations/, issues/, recipes/, companions, posture, maintenance contracts), a smell checklist with an audit-to-log refactoring workflow, and reliable write mechanics (smallest edit primitive, base_version chaining, round-trip checks). Use when refactoring or auditing a store skill, creating one, splitting a bloated body into files, or fixing a changelog that grew unbounded. Trigger on 'clean up this skill', 'audit my skill', 'new skill', 'rotate the changelog'.
---
# Skills best practices

House style for house skills, distilled from a set of long-running operational skills (a warehouse catalog, a dashboard maintainer, a symptom-routed debugging runbook set, and a fast-moving backlog skill), layered on top of the official Agent Skills spec (agentskills.io) and Anthropic's authoring best practices. Use it to refactor a messy skill into shape, or to start a new skill right. This body is a thin index - the substance lives in the bundled files (this skill eats its own dogfood).

## The shape in one paragraph

A good store skill is: a **trigger-rich description** (the retrieval surface - the only thing an agent sees before deciding to load it), a **thin index body** (~1 screen: what it is, the gotchas that bite hardest, a file map, companions, a maintenance contract), and **bundled files pulled on demand** (progressive disclosure - the agent reads only what the task needs). Living operational skills add **HANDOVER.md** (clobber file: read first, overwrite last) and **CHANGELOG.md** (a rolling window of recent changes, one line each, trimmed as you append - not an append-only log).

## Files

| File | Read it when |
|---|---|
| `spec-checklist.md` | The official, statically-verifiable rules (Agent Skills spec + Anthropic best practices) with canonical source URLs. Compliance floor - check it first in any audit. |
| `patterns.md` | The house pattern catalog - 16 named patterns with examples from the exemplars. Read before designing a new skill or the target layout for a refactor. |
| `refactoring-workflow.md` | The audit → design → execute → verify → log workflow for cleaning up a messy skill, including the smell checklist. Read when handed a skill to clean up. |
| `write-mechanics.md` | Reliable mechanics for pushing content to the store: smallest edit primitive, `base_version` chaining, large-file sentinel appends, round-trip verification. Read before any multi-write session. |
| `CHANGELOG.md` | Recent changes to this skill, newest first - rolling window per pattern 7. |

Read these files directly from `.agents/skills/skills-best-practices/` in the repository; the published catalogue mirrors them with version history.

## The three rules that bite hardest

1. **The description is the retrieval surface.** Pack it with the job-to-be-done, concrete trigger phrases, what's covered, and companions. A perfect skill with a vague description never gets loaded.
2. **Don't grow the body.** New detail goes in a bundled file; the body only gains a pointer to it. A body that needs scrolling is a refactor waiting to happen (official budget: ~500 lines max; house style aims much thinner). The same discipline applies to `CHANGELOG.md`, which is a rolling window rather than an archive - see pattern 7.
3. **Use the smallest edit primitive.** `edits` / `file_edits` (find/replace) over full-`body` replace - full rewrites silently drop content. Full-body replace is legitimate only for a genuine restructure. Chain `base_version` between writes.

## Companions

- The `skills-store` and `working-with-skills` skills that ship with the PostHog MCP (or a local bridge such as `/phs`) - the raw `skill-*` tool surface and CRUD guidance. This skill layers house style on top; don't duplicate their mechanics.
- In-repo `writing-skills` - for skills that ship in the posthog repo (`products/*/skills/`). This skill covers the store side; the official spec rules apply to both.

## Maintaining this skill

Keep this body thin - new patterns go in `patterns.md`, new mechanics in `write-mechanics.md`. The official sources evolve: when refreshing, re-fetch the URLs in `spec-checklist.md` and update it rather than trusting the cached rules. Add a one-line entry to `CHANGELOG.md` (newest first, terse) on every meaningful change, and trim anything past the window as you write - this skill's own changelog follows pattern 7. When an exemplar skill evolves a new pattern worth canonizing, add it to `patterns.md` and cite the skill it came from.