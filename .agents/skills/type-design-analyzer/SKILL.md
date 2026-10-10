---
name: type-design-analyzer
description: Analyze whether types make illegal states unrepresentable, scoring encapsulation, invariant expression, invariant usefulness and enforcement. Use when reviewing a type, interface or schema, when asked whether a model is well designed, or when bugs keep arising from states the types allow but the domain forbids.
---
# Type design analyzer

Evaluate whether a set of types makes illegal states unrepresentable, and score
the result. This is a design review of the type surface, not a compile check:
code that typechecks cleanly can still permit states the domain forbids.

**Posture: read-only.** Score the types and recommend changes. Do not rewrite
them; hand the change itself to whoever owns the module.

## The two rules that bite hardest

1. **Score the invariants that matter, not the ones that are easy to state.**
   A type can express a great deal and still prevent no real bug. Ask which
   production incident each invariant would have stopped; if the answer is
   none, say so rather than awarding points for rigour.
2. **An escape hatch defeats an invariant entirely.** A public constructor, an
   exported mutable field, or a widely used `as` cast means the type system is
   not enforcing the rule, whatever the type declares. Look for the hatch
   before crediting the invariant.

## Evaluation criteria

Score each dimension and justify it against the actual code.

### 1. Encapsulation

- Are internal details hidden?
- Can invariants be violated from outside?

### 2. Invariant expression

- Do the types encode business rules?
- Are impossible states prevented at the type level?

### 3. Invariant usefulness

- Do these invariants prevent real bugs?
- Are they aligned with the domain?

### 4. Enforcement

- Are invariants enforced by the type system?
- Are there easy escape hatches?

## Output format

For each type reviewed:

- Type name and location
- Scores for the four dimensions
- Overall assessment
- Specific improvement suggestions

## Files

| File | Read it when |
|---|---|
| `CHANGELOG.md` | Recent changes to this skill, newest first. Rolling 30-entry window. |
| `HANDOVER.md` | What is in flight on this skill. Read first when resuming work on it. |

Read these files directly from `.agents/skills/type-design-analyzer/` in the repository; the published catalogue mirrors them with version history.

## Companions

- `typescript-reviewer` - the broader type-safety lane on a concrete diff:
  `any` abuse, unsound casts, strict-null violations. Run that for a pull
  request; run this when the question is whether the model itself is right.
- `coding-preferences` - the house position on language and module design that
  this analysis is scored against.

## Maintaining this skill

When resuming work on this skill, read `HANDOVER.md` first, then
`CHANGELOG.md`. Add a one-line `CHANGELOG.md` entry on every meaningful
change and trim past the window as you write. Overwrite your `HANDOVER.md`
section at the end of a session and delete it when the work lands.

Keep this body thin. The four dimensions are the stable part; if worked
examples or language-specific patterns accumulate, move them into
`references/` rather than growing this file. Prefer the smallest edit
primitive (`edits`) over a full body replace, and chain `base_version`.

<!-- Ported from the ECC agent `type-design-analyzer` (github.com/affaan-m/ECC, MIT).
     Shared prompt-defense boilerplate removed; untrusted content is handled by
     the host agent's own rules. -->