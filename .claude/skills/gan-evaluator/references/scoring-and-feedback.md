# Scoring and feedback

## Calibration

Score each criterion 1 to 10 against `gan-harness/eval-rubric.md`.

| Score | Means |
|---|---|
| 1-3 | Broken, embarrassing, would not show to anyone |
| 4-5 | Functional but clearly AI-generated, tutorial quality |
| 6 | Decent but unremarkable, missing polish |
| 7 | Good: a junior developer's solid work |
| 8 | Very good: professional quality, some rough edges |
| 9 | Excellent: senior developer quality, polished |
| 10 | Exceptional: could ship as a real product |

```text
weighted = (design * 0.3) + (originality * 0.2) + (craft * 0.3) + (functionality * 0.2)
```

Pass threshold: 7.0.

## The feedback file

Write to `gan-harness/feedback/feedback-NNN.md`.

```markdown
# Evaluation - Iteration NNN

## Evaluation Mode

**Achieved:** `browser` | `screenshot` | `code-only`

State the mode actually completed, not the mode the harness requested. If
the requested mode was unavailable, explain why and which fallback was used.

## Scores

| Criterion | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Design Quality | X/10 | 0.3 | X.X |
| Originality | X/10 | 0.2 | X.X |
| Craft | X/10 | 0.3 | X.X |
| Functionality | X/10 | 0.2 | X.X |
| **TOTAL** | | | **X.X/10** |

## Verdict: PASS / FAIL (threshold: 7.0)

## Critical Issues (must fix)
1. [Issue]: [what is wrong] -> [how to fix]

## Major Issues (should fix)
1. [Issue]: [what is wrong] -> [how to fix]

## Minor Issues (nice to fix)
1. [Issue]: [what is wrong] -> [how to fix]

## What Improved Since Last Iteration
- [Improvement]

## What Regressed Since Last Iteration
- [Regression, if any]

## Specific Suggestions for Next Iteration
1. [Concrete, actionable suggestion]

## Screenshots
- [What was captured, and the key observations]
```

## Feedback quality rules

1. **Every issue carries a how-to-fix.** Not "the design is generic" but
   "replace the gradient background with a solid colour from the spec
   palette, and add a subtle texture for depth". The generator acts on this
   directly; an issue with no fix is a complaint.
2. **Reference specific elements.** Not "the layout needs work" but "the
   sidebar cards at 375px overflow their container; set `max-width: 100%`
   and add `overflow: hidden`".
3. **Quantify where you can.** "CLS is 0.15, should be under 0.1" or "3 of
   7 features have no error-state handling".
4. **Compare to the spec.** "Spec requires drag-and-drop reordering, feature
   4. Currently not implemented."
5. **Acknowledge genuine improvements.** When the generator fixes something
   well, say so. This calibrates the loop; unrelieved criticism teaches it
   nothing about what worked.
