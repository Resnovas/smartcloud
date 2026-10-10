# The three-step workflow

## Step 1: Understand

Gather the baseline from the harness itself, not from assumptions about its
file layout. This is a Code-Based Grader input.

On an OpenClaw host:

```sh
openclaw doctor                            # gateway, plugins and config health
openclaw skills list --agent main --json   # what is loaded, and from where
openclaw cron list                         # automations, status, last diagnostic
openclaw config get agents.entries         # roster, allowlists, delegation modes
openclaw wiki doctor --agent main          # memory and wiki surface
```

On a different harness, find the equivalent introspection commands first, and
say in the report which ones you used.

Treat anything these report as broken or absent as a finding in its own
right, before proposing any change.

Then define an `EVAL DEFINITION: harness-optimization` block covering:

- **Capability Evals** for the leverage areas: hooks, evals, routing,
  context, safety.
- **Regression Evals** for the existing hooks, tests and quality gates that
  must keep passing.

## Step 2: Execute

Before touching any file, snapshot the current state of every path you intend
to change - a `git diff` or `git stash create` baseline, or a copy of the
file - so it can be restored exactly.

Apply minimal, reversible configuration changes, one leverage area at a time.
Keep the diff allowlisted to the area under test; no incidental edits.

Preserve behaviour across every harness actually in use, not only the one you
are sitting in, and avoid fragile shell quoting.

On an OpenClaw host the configuration lives in `~/.openclaw/openclaw.json`
plus the shared agent library. Back up the former before editing it.

## Step 3: Verify

Re-run the Step 1 commands, plus whatever checks the changed surface has of
its own. If either fails, automatically restore the Step 2 snapshot. Never
hand back a partially applied change.

Grade with all three eval-harness Grader Types:

- **Code-Based**: script and test exit codes.
- **Model-Based**: self-assessed diff quality.
- **Human**: any security- or safety-relevant change is BLOCKED until a
  human explicitly approves it. That includes broader tool permissions,
  credential or secret access, new exfiltration paths, and any weakening of
  an existing safety control. For changes to shared skills, agents or rules,
  explicitly check prompt-injection resilience, permission scope,
  destructive-action guards and secret-exfiltration risk.

Compute pass@k and pass^k as `eval-harness` defines them: run each capability
eval in three independent trials before reporting pass@3, and run each
safety-critical hook regression eval in three independent trials with all
three passing before reporting pass^3. Record every trial result in the
report, including the failures.
