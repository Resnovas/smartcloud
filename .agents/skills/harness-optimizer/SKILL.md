---
name: harness-optimizer
description: Improve agent-harness configuration for reliability and cost - hooks, evals, routing, context and safety - grading every change with pass@k and pass^k from the eval-harness skill. Use when an agent setup is unreliable or expensive, when repeated weak runs point at configuration rather than any single task, or when auditing harness health.
---
# Harness optimizer

Improve agent-harness configuration for reliability and cost - hooks, evals,
routing, context and safety - grading every proposed change with the
eval-driven method from `eval-harness` rather than by judgement.

**Posture: write surface, configuration only.** This skill changes harness
configuration: hooks, agents, skills and command metadata, settings. It does
not touch application or product code.

This body is a thin index. The three-step workflow and the worked examples
live in the bundled files below; do not grow this file.

## The three rules that bite hardest

1. **Never run a generic harness audit script against an unknown layout.** A
   script that looks for `.claude/agents`, `.claude/hooks.json` and
   `.claude-plugin/plugin.json` will report a perfectly healthy setup as
   entirely missing when the harness stores its configuration elsewhere.
   Gather the baseline from the running harness's own introspection
   commands.
2. **A security- or safety-relevant diff may never report SHIP IT.** It
   stays BLOCKED until a human approval is recorded. That covers broader
   tool permissions, credential or secret access, new exfiltration paths,
   and any weakening of an existing safety control.
3. **Snapshot before you touch anything, and restore automatically on
   failure.** Never hand back a partially applied configuration change: a
   half-migrated harness is harder to diagnose than a broken one, because it
   still mostly works.

## Output format

`EVAL REPORT: harness-optimization`

- Capability Evals: results per leverage area, pass/fail and pass@k
- Regression Evals: results, with pass^k for safety-critical paths
- Applied changes as a final diff, and the remaining risks
- Status: READY FOR REVIEW / SHIP IT / BLOCKED

## Files

| File | Read it when |
|---|---|
| `references/workflow.md` | Running an optimisation. The three steps - understand, execute, verify - with the baseline commands, the snapshot discipline, and how to compute pass@k and pass^k. |
| `references/examples.md` | You want a worked case. Two end-to-end examples: an automation disabling itself on a transient failure, and a cheap task routed to an expensive model. |
| `CHANGELOG.md` | Recent changes to this skill, newest first. Rolling 30-entry window. |
| `HANDOVER.md` | What is in flight on this skill. Read first when resuming work on it. |

Read these files directly from `.agents/skills/harness-optimizer/` in the repository; the published catalogue mirrors them with version history.

## Companions

- `eval-harness` - the eval definitions, grader types and pass@k/pass^k
  methodology this skill is required to use. Read it first; the output
  format here is a direct derivative of it, not an ad-hoc scorecard.
- `agent-self-evaluation` - scoring a single run, when the problem is one
  output rather than the configuration behind it.

## Maintaining this skill

When resuming work on this skill, read `HANDOVER.md` first, then
`CHANGELOG.md`, then only the reference file the task needs. Workflow
changes go in `references/workflow.md`; new worked cases in
`references/examples.md`. This body only gains a pointer. Add a one-line
`CHANGELOG.md` entry on every meaningful change and trim past the window as
you write. Overwrite your `HANDOVER.md` section at the end of a session and
delete it when the work lands. Prefer the smallest edit primitive (`edits` /
`file_edits`) over a full replace, and chain `base_version`.

<!-- Ported from the ECC agent `harness-optimizer` (github.com/affaan-m/ECC, MIT).
     Shared prompt-defense boilerplate removed; untrusted content is handled by
     the host agent's own rules. -->