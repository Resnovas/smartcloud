# Confidence gate

Manufactured findings are the primary failure mode of an LLM reviewer. Filler
nits, speculative "consider using X", and hypothetical edge cases with no
trigger do more damage than a missed finding, because they train the reader to
skim the review. This file is the filter. Both review axes apply it.

Adapted from the ECC `code-reviewer` agent (github.com/affaan-m/ECC, MIT).

## Thresholds

- Report only what you are better than 80% confident is a real issue.
- Skip stylistic preference unless it breaks a documented repo standard.
- Skip findings in unchanged code unless they are critical security issues.
- Consolidate: "five handlers miss error handling" is one finding, not five.
- Prioritise what causes bugs, security failures or data loss.

## Pre-report gate

Answer all four before writing a finding. Any "no" or "unsure" means downgrade
the severity or drop it.

1. **Can I cite the exact line?** File and line. "Somewhere in the auth layer"
   is not actionable.
2. **Can I state the concrete failure?** Name the input, the state, and the bad
   outcome. If you cannot name the trigger you are pattern-matching, not
   reviewing.
3. **Have I read the surrounding context?** Callers, imports, tests. Most
   apparent issues are already handled one frame up or guarded by a type.
4. **Is the severity defensible?** A missing doc comment is never high. One
   `any` in a test fixture is never critical. Severity inflation costs trust
   faster than a missed finding does.

## High and critical need proof

Any finding at high or critical carries three things, or it gets demoted:

- the exact snippet and line number
- the failure scenario: input, state, outcome
- why the existing guards (types, validation, framework defaults) do not catch
  it

## Zero findings is a valid review

A clean diff reports zero rows. Do not manufacture findings to justify having
been invoked. If the change is small, well typed, tested and consistent with
the surrounding code, say so and stop.

## Known false positives

Skip these unless you have evidence specific to this codebase.

- **"Add error handling"** where the error path belongs to the caller or the
  framework: Express error middleware, React error boundaries, a top-level
  catch, an upstream `.catch`. In Effect code the error channel is in the type;
  read the signature before flagging.
- **"Missing input validation"** on an internal function whose callers already
  validate. Trace one caller first.
- **"Magic number"** for well-known constants: HTTP status codes, `1000` ms,
  `60`, `24`, `1024`, index `0` or `-1`, and single-use locals whose name
  already says what they are.
- **"Function too long"** for exhaustive switches, config objects, test tables
  or generated code. Length is not complexity.
- **"Missing doc comment"** on a single-purpose internal helper with a
  self-describing name and signature.
- **"Prefer const over let"** where the variable is reassigned. Read the whole
  function.
- **"Possible null dereference"** where the preceding line narrows the type or
  a guard is in scope. Trace the type, do not pattern-match on `?.`.
- **"N+1 query"** on fixed-cardinality loops, or on paths already batching.
- **"Missing await"** on deliberately detached calls such as logging, metrics
  or queue pushes. Look for `void` or a comment first.
- **"Should use TypeScript"** in a JavaScript-only file. Match the project;
  do not propose a stack change in review.
- **"Hardcoded value"** in test fixtures, examples or docs. Tests are supposed
  to hardcode their expectations.
- **Security theatre**: `Math.random()` used for jitter, sampling or animation;
  `eval` or `Function` inside a plugin system whose entire purpose is loading
  code.

The test for all of these: would a senior engineer on this team actually change
it in review? If not, skip it.
