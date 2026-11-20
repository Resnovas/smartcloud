# Eval types and graders

## Capability evals

Test whether the agent can do something it could not before.

```markdown
[CAPABILITY EVAL: feature-name]
Task: what the agent should accomplish
Success Criteria:
  - [ ] Criterion 1
  - [ ] Criterion 2
  - [ ] Criterion 3
Expected Output: description of the expected result
```

## Regression evals

Ensure a change does not break what already worked.

```markdown
[REGRESSION EVAL: feature-name]
Baseline: SHA or checkpoint name
Tests:
  - existing-test-1: PASS/FAIL
  - existing-test-2: PASS/FAIL
Result: X/Y passed (previously Y/Y)
```

## Grader types

Prefer a deterministic grader wherever one is possible. Probabilistic
graders are for what code cannot check, not for what code merely makes
tedious.

### 1. Code grader

Deterministic assertions. Exit codes, greps, test runs, build success.

```bash
grep -q "export function handleAuth" src/auth.ts && echo PASS || echo FAIL
pnpm test -- --testPathPattern="auth" && echo PASS || echo FAIL
pnpm build && echo PASS || echo FAIL
```

### 2. Rule grader

Regex or schema constraints on the output. Deterministic, but expressing a
shape rather than an exact value.

### 3. Model grader

An LLM judging open-ended output against a rubric.

```markdown
[MODEL GRADER PROMPT]
Evaluate the following code change:
1. Does it solve the stated problem?
2. Is it well-structured?
3. Are edge cases handled?
4. Is error handling appropriate?

Score: 1-5 (1 = poor, 5 = excellent)
Reasoning: [explanation]
```

### 4. Human grader

Manual adjudication, for ambiguity and for anything security-relevant.
Never fully automate a security check.

```markdown
[HUMAN REVIEW REQUIRED]
Change: what changed
Reason: why human review is needed
Risk Level: LOW / MEDIUM / HIGH
```
