# Report template

Fill this in after completing a task.

```text
============================================================
AGENT SELF-EVALUATION REPORT
============================================================
Summary: Overall score X.X/5 across 5 quality axes.

  Accuracy         5/5    or    3/5
    + [Evidence: passing tests, verified claims]
    - [Gaps: unverified claims, hedging language]
    -> [Improvement, if the score is below 5]

  Completeness      5/5
    + [What is covered: all requirements plus edge cases]
    - [What is missing: acknowledge gaps explicitly]
    -> [Improvement, if below 5]

  Clarity           5/5
    + [Structure: headings, code blocks, bullets]
    - [Issues: undefined terms, wall of text, no summary]
    -> [Improvement, if below 5]

  Actionability     5/5
    + [User can: merge the PR, run the command, review the file]
    - [Blockers: missing steps, vague suggestions]
    -> [Improvement, if below 5]

  Conciseness       5/5
    + [Tight: no repetition, high information density]
    - [Bloat: filler, meta-commentary, repeated points]
    -> [Improvement, if below 5]

  OVERALL           X.X/5

CRITICAL ISSUES (axes at 2 or below):
  [Axis] Score N/5 - specific fix needed
  (or "None")

Self-check: Would the user agree with this assessment? [Yes/No, and why]

TOP IMPROVEMENTS:
  1. [Highest impact fix]
  2. [Second highest]
  (Only axes scoring below 4, ranked by user impact)

VERDICT: [Deliver as-is / Fix N issues then deliver / Redo from scratch]
```

## Scoring triggers

A symptom on the left caps the axis at the score shown.

| If you see this | Accuracy | Completeness | Clarity | Actionability | Conciseness |
|---|---|---|---|---|---|
| "should work", "probably fine" | <=4 | - | - | - | - |
| "I think", "I believe" | <=4 | - | - | - | - |
| No test output cited | <=4 | - | - | - | - |
| TODO or FIXME left behind | <=3 | <=3 | - | <=3 | - |
| Missing error handling | - | <=3 | - | - | - |
| Only the happy path covered | - | <=3 | - | - | - |
| Wall-of-text paragraph over 200 words | - | - | <=3 | - | - |
| No headings or structure | - | - | <=3 | - | - |
| "You should..." without specifics | - | - | - | <=3 | - |
| No PR or file created | - | - | - | <=3 | - |
| User must work out the next step | - | - | - | <=2 | - |
| Points repeated three or more times | - | - | - | - | <=3 |
| "Let me explain" or "to summarize" three or more times | - | - | - | - | <=3 |
| Output more than 15 times longer than the task | - | - | - | - | <=3 |

## When to skip

Skip the evaluation entirely if:

- The task was a single tool call, such as reading one file
- The user said "do not evaluate" or "just do it"
- The task is purely conversational
- You are mid-workflow and the user will judge the final output rather than
  an intermediate step

## What to do with the score

| Overall | Action |
|---|---|
| 4.5 and above | Deliver as-is. No changes needed. |
| 3.5 to 4.4 | Flag the top improvement, but deliver. Fix it if it takes under 30 seconds. |
| 2.5 to 3.4 | State what you would change, then ask: redo that axis, or deliver as-is? |
| Below 2.5 | Do not deliver. Say what it scored and why, then redo with the specific fix. |
