# Metrics and workflow

## pass@k and pass^k

**pass@k** - at least one success in k attempts.

- `pass@1`: direct reliability, first-attempt success rate
- `pass@3`: practical reliability under controlled retries

**pass^k** - all k trials succeed. A higher bar, for critical paths.

- `pass^3`: three consecutive successes, a stability test

### Recommended thresholds

- Capability evals: pass@3 >= 0.90
- Regression evals: pass^3 = 1.00 for release-critical paths

## The workflow

### 1. Define, before coding

```markdown
## EVAL DEFINITION: feature-xyz

### Capability Evals
1. Can create a new user account
2. Can validate email format
3. Can hash a password securely

### Regression Evals
1. Existing login still works
2. Session management unchanged
3. Logout flow intact

### Success Metrics
- pass@3 > 90% for capability evals
- pass^3 = 100% for regression evals
```

Defining first is the point. Written afterwards, the evals describe what was
built rather than what was needed.

### 2. Implement

Write the code to pass the defined evals.

### 3. Evaluate

Run each capability eval and record PASS or FAIL. Run the regression suite.
Record every trial, including the failures: an eval run whose failures are
not recorded cannot support a pass@k claim.

### 4. Report

```markdown
EVAL REPORT: feature-xyz
========================

Capability Evals:
  create-user:     PASS (pass@1)
  validate-email:  PASS (pass@2)
  hash-password:   PASS (pass@1)
  Overall:         3/3 passed

Regression Evals:
  login-flow:      PASS
  session-mgmt:    PASS
  logout-flow:     PASS
  Overall:         3/3 passed

Metrics:
  pass@1: 67% (2/3)
  pass@3: 100% (3/3)

Status: READY FOR REVIEW
```

## Artifact layout

Store evals with the code they test; they are first-class artifacts and are
versioned alongside it.

```text
.claude/evals/<feature>.md      # definition
.claude/evals/<feature>.log     # run history
.claude/evals/baseline.json     # regression baselines
docs/releases/<version>/eval-summary.md   # release snapshot
```

## Best practices

1. Define evals before coding; it forces clear thinking about success.
2. Run them frequently, to catch regressions early.
3. Track pass@k over time, to see reliability trends rather than points.
4. Prefer code graders; deterministic beats probabilistic.
5. Human review for anything security-relevant. Never fully automate it.
6. Keep evals fast. Slow evals do not get run, and an eval that is not run
   is not a gate.
7. Version evals with the code.

## Anti-patterns

- Overfitting prompts to the known eval examples.
- Measuring only happy-path outputs.
- Chasing pass rates while ignoring cost and latency drift.
- Allowing a flaky grader in a release gate. It trains everyone to re-run
  until green, which quietly converts pass^3 into pass@many.
