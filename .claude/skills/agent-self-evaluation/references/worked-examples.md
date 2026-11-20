# Worked examples

The same task, evaluated well and evaluated badly. Note that in both cases
every score carries its evidence.

## A strong result

```text
Task: Add retry logic to HTTP client

Scorecard:
  Accuracy:     5 - All API calls correct. Verified: retries use
                    exponential backoff. No hallucinated methods.
  Completeness: 4 - Covered happy path plus 3 error cases. Missing:
                    timeout handling for hung connections.
  Clarity:      5 - Code comments explain the backoff formula.
                    PR description links to the incident that motivated it.
  Actionability:5 - Single merge. No follow-up tasks. Tests pass.
  Conciseness:  4 - 47 lines total. The retry loop could be extracted
                    into a helper to drop about 8 lines.

Overall: 4.6 - One gap, timeout handling. Fix before merging.
```

What makes this a good evaluation: the 4s name the specific missing thing,
and the 5s cite what was verified rather than asserting quality.

## A weak result

```text
Task: Add retry logic to HTTP client

Scorecard:
  Accuracy:     2 - Used urllib3, which does not match our
                    httpx-based codebase. Wrong library.
  Completeness: 3 - Works for GET. POST and PUT not handled, and the
                    user said "all HTTP requests".
  Clarity:      4 - Code is readable. Good variable names.
  Actionability:2 - "Add tests" mentioned but no test file created.
                    User has to write tests before merging.
  Conciseness:  3 - 120 lines. The retry config is duplicated in
                    3 places instead of one shared RetryConfig object.

Overall: 2.8 - Wrong library used. Needs an httpx rewrite.
  Fix accuracy first by switching to httpx, then extend to all
  HTTP methods, then consolidate the config.
```

Note what happens at 2.8: the verdict is not "deliver with caveats". Two
axes at 2 means the work is redone, and the improvements are **ordered**,
because fixing conciseness before accuracy would mean tidying code that is
about to be thrown away.
