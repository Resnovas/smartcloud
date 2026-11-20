# Execution safety

An eval harness that executes candidate code is running untrusted output.
This file exists because the failure here is not a crash: it is reporting a
safety property you do not actually have.

## The rule

**Never present any of the following as evidence that candidate code was
safely executed or is fit to promote:**

- Static warnings or source inspection.
- A capsule, receipt or signature verifying bytes.
- Successful tests of the harness's own utilities.

Each of those is a real check of something. None of them is containment.
Inspecting source without executing it, and verifying that a recorded
artifact has not been tampered with, are both useful and neither says the
candidate is safe to run.

## What candidate execution actually requires

Before a harness may execute and score candidate code, it needs all of:

- An independently reviewed OS-level containment boundary.
- A protected checker that the candidate cannot reach or influence.
- Audit channels the candidate cannot write to.
- Fatal rejection on a failed baseline, rather than a warning.

Until those exist, execution should refuse, and the refusal should be
recorded in the report rather than worked around. No trust flag and no
caller-supplied executor is a substitute: an escape hatch that can be
enabled by configuration is not a boundary.

## Replay and fixtures

Where a harness replays recorded runs instead of executing:

- Content-address the fixtures, and fail closed on a missing one. A silently
  skipped fixture turns a regression eval into a pass.
- Record mode invokes the real implementation, so only register
  implementations you trust.
- Declare the tools a replay is permitted to use, and refuse anything above
  the declared risk level.

## Reporting

If execution was refused, say so in the eval report, in the status line, and
name what was checked instead. A report that omits the refusal reads as a
pass.
