# Detailed scoring guide

Concrete anchors for each axis. Use this when unsure whether a gap merits a 4
against a 3, or a 2 against a 1.

## Accuracy

| Score | Anchor | Example |
|---|---|---|
| 5 | All facts verified against tool output, docs, or authoritative sources. No errors. | Configured retry via httpx transport, confirmed in httpx docs. All method names verified with grep against the codebase. |
| 4 | One minor inaccuracy that does not affect correctness. | Correct library, wrong default for one parameter: claimed 0.5s, docs say 1.0s. |
| 3 | One significant factual error, or three or more minor inaccuracies. | Used `urllib3.Retry` in an httpx codebase. Works in this one case but is the wrong library. |
| 2 | Multiple significant errors. The output would fail if followed. | Claimed "add this to package.json" but the project uses pyproject.toml. Two other config claims also wrong. |
| 1 | Fundamentally incorrect. Contradicts itself or known facts. | Code has syntax errors. The API endpoint does not exist. Claims a function signature that grep disproves. |

## Completeness

| Score | Anchor | Example |
|---|---|---|
| 5 | All explicit and implicit requirements covered. Edge cases handled. Error paths addressed. | User said "add retry to all HTTP requests". GET, POST, PUT, DELETE all covered. Timeout, 429 and 5xx all handled. |
| 4 | All explicit requirements covered. One implicit requirement missed. | All HTTP methods covered. Connection timeouts not handled, though not mentioned. |
| 3 | One explicit requirement missed, or two or more implicit gaps. | User said "add logging too". Retry logic added, no logging. |
| 2 | Multiple explicit requirements missed. A partial solution. | Asked for retry plus a circuit breaker. Only retry implemented. |
| 1 | Misses the core request. Delivers something adjacent. | Asked for retry logic. Wrote a health check endpoint instead. |

## Clarity

| Score | Anchor | Example |
|---|---|---|
| 5 | Perfectly structured. Jargon explained or avoided. Visual hierarchy helps scanning. No ambiguity. | A README with clear sections, code blocks, and a ten-second summary at the top. |
| 4 | Generally clear. One section could be better organised, or one term undefined. | Good structure, but "exponential backoff" is used without explanation. |
| 3 | Understandable after re-reading. Several organisational issues or undefined terms. | The explanation circles the point before reaching it. Terms used before they are defined. |
| 2 | Confusing in places. The reader would need follow-up questions. | The code works, but the PR description does not explain why retry was needed or what it fixes. |
| 1 | Unintelligible or contradictory. The reader cannot tell what was done or why. | A wall of text with no structure. Conclusions contradict earlier statements. |

## Actionability

| Score | Anchor | Example |
|---|---|---|
| 5 | One action required. Verification path included. No implicit steps. | "Merge this PR. Tests pass: 42 passed. Deploy with `./deploy.sh`." |
| 4 | One action required, but the verification path is implied rather than explicit. | "Merge this PR." Tests exist but were not cited, so the user has to check. |
| 3 | Several actions required, or one action with an unclear next step. | "Review and merge, then update the config." Which config? Where? No path. |
| 2 | The user must work out how to use the output. Critical instructions missing. | Code written, but no test file, no run instructions, no PR. The user assembles it. |
| 1 | Cannot be acted on without significant rework or clarification. | "Here is a design idea." No code, no file, no PR. |

## Conciseness

| Score | Anchor | Example |
|---|---|---|
| 5 | Every sentence earns its place. No redundancy. High information density. | 30 lines saying what 60 would. No repeated points, no filler. |
| 4 | Minor redundancy. One paragraph could be tightened. | Good overall, but the motivation is repeated in both the PR description and the code comments. |
| 3 | Noticeable redundancy. A fifth or more could be removed without loss. | Explains the same concept three times, in summary, body and conclusion. |
| 2 | Significantly bloated. Two fifths or more is filler or repetition. | 200 lines for a task needing 60. Restates the question. Irrelevant background. |
| 1 | More filler than substance. | A 500-line response to a two-line question, mostly boilerplate. |

## Edge cases

### The user's instructions were unclear

Do not penalise completeness for not reading minds. Note it instead: "The
request was ambiguous about scope. I chose interpretation A. If B was meant,
this score would drop to N."

### The task was inherently simple

A three-line bug fix can legitimately score 5 across the board. The rubric
scales with complexity, and a simple task done perfectly **is** a 5. Do not
invent gaps to justify a lower score.

### You caught your own error mid-task

If you made an error, caught it and fixed it before delivering, that is a 5
on Accuracy for the final output. The evaluation is about what the user
received, not your internal process. Note the self-correction as evidence of
thoroughness, not as a penalty.

### Tool output contradicts your claim

Automatic Accuracy of 2 or below. Tool output is ground truth.
