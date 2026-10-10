# Message shape

## Conventional types

`feat` | `fix` | `perf` | `refactor` | `test` | `docs` | `chore`

Scope is the module, feature or project. Never a company or a brand.

## Classifying the unit

Classify from the work, not the file count. If unsure, treat it as routine.

- **Investigatory**: the outcome was uncertain, or a baseline you tried
  failed. Subject plus four to ten joined sentences in the fixed order below.
- **Routine**: cosmetic, a version bump, a rename, docs-only, an obvious
  follow-the-API change. Short subject plus at most one thin sentence. No
  duration. No manufactured uncertainty.

## The investigatory shape

Self-contained. Never point at another hash as the only place the baseline
lives. No field labels. No trailers that duplicate the body.

```text
type(scope): imperative summary

What changed. Why a competent professional could not look it up. What
existing path failed and why. Duration or omit.
```

Fixed order, joined into prose:

1. What changed: models, APIs, behaviour.
2. Why a competent professional could not look it up from documentation,
   vendor stock or standard patterns. Personal difficulty alone does not
   qualify.
3. What existing, stock or documented path failed, and why.
4. Duration as the last sentence, or omit the beat entirely.

Open with **what changed**, not "It was not clear whether". Never start a
line with `Uncertainty:`, `Hypothesis:`, `Approach:` or `Verify:`.

Target four to ten sentences. Name the models, errors, APIs and budgets.
First person is fine.

## Example: investigatory

```bash
git commit -m "$(cat <<'EOF'
perf(partner): defer tag mailing deltas after commit

Captures contact-tag list membership deltas and applies them after commit with
skip guards, and gates permission snapshots to the fields that need them.
A competent professional following stock mail documentation would still
rescan membership on every partner write; that path stacked with
parent-to-subuser fan-out would not stay under the save budget under
concurrent editors. Stock mail docs only offer another full rescan.
Local partner writes were timed and unit coverage was added for delta apply
with sync forced inline under test_enable. 1.5 hours.

EOF
)"
```

## Example: routine

```bash
git commit -m "$(cat <<'EOF'
chore(module_x): bump version for settings view reload

EOF
)"
```

## Honesty constraints

- Do not claim technological uncertainty or advances for routine work.
- Do not pad fake investigation. Split real investigation across commits
  instead.
- Prefer multiple commits for an investigatory feature: reproduce, try,
  iterate, harden.
- Each commit in a split series still carries its own baseline, in short
  form.