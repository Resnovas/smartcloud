# Worked examples

## An automation disabling itself on a transient failure

**Input.** The cron listing shows a compile job in an error state, and its
last diagnostic is a file-not-found for a note that was deleted mid-run. The
scheduler disables an automation after repeated failures, so a sync landing a
deletion during a 70-second compile can switch compilation off entirely.

**Action.** Define a Regression Eval that the linter stays at zero errors.
Give the command payload a single retry, so a transient vanish recovers while
a genuine failure still fails. Re-run the Step 1 commands.

**Output.** `EVAL REPORT: harness-optimization`, with the capability eval for
automation resilience at pass@3, Regression Evals unaffected, Status: SHIP
IT.

The general lesson: an automation that disables itself on a transient fault
is a reliability bug in the scheduler's interaction with the workload, not in
either one alone. Look for the interaction.

## A cheap task routed to an expensive model

**Input.** The agent roster shows a utility agent with no model override, so
it inherits the long-task default instead of the cheap tier.

**Action.** Define a Capability Eval that the agent's output quality holds at
the cheaper tier across three trials. Pin the model. Measure the token delta.

**Output.** `EVAL REPORT: harness-optimization`, with the capability eval for
utility routing at pass@3 and a recorded cost reduction, Status: SHIP IT.

The general lesson: inherited defaults are the commonest source of avoidable
cost, and they are invisible until you list the roster explicitly. A missing
override does not show up as a configuration error anywhere.
