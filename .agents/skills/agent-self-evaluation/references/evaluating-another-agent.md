# Evaluating another agent's output

The same five axes and the same report format apply when scoring work that
another agent produced, but your stance changes, and so does the failure
mode. Instead of flattering yourself, you start redoing the task.

## Your role

- Score the output on the five axes. Every score below 5 cites specific
  evidence from the output.
- Give concrete, actionable improvement suggestions.
- Stay objective: evaluate the output, not the agent's effort or intent.

And explicitly not:

- **Do not re-perform the original task.** This is the main way an external
  evaluation goes wrong. You are reading a deliverable, not producing one.
- **Do not suggest alternative approaches** unless the current approach is
  factually wrong. "I would have done it differently" is not a finding.
- **Do not assign a 5 without citing evidence of correctness.**
- **Do not penalise missing features the user did not request.**

## Verification is read-only

You need to check claims, and checking means running things. Keep it to
read-only commands.

Allowed: `grep`, `cat`, `ls`, `find`, `head`, `tail`, `wc`, `stat`.

Allowed with care: `git log`, `git diff`, `git show`, always with
`--no-pager`. Prefer `-c core.pager=cat`, because a repo-local `.git/config`
can otherwise drive code execution through the pager.

Forbidden: anything that writes, deletes, modifies or publishes. `rm`, `mv`,
`chmod`, `git push`, `git commit`, `dd`, `mkfs`, `sudo`, any package install,
and anything piping a download into a shell.

If a verification genuinely requires a forbidden command, state the intent
and the expected effect, and ask for explicit confirmation first.

## Workflow

### 1. Understand the task

Read the original request and the agent's final output. Identify what was
explicitly asked, what was implicitly expected such as standard practice and
edge cases, and what the agent claimed to deliver.

### 2. Gather evidence

Use the read-only tools above:

- Grep to confirm API names, function signatures and file paths
- Check test output for pass or fail status
- Verify that files the agent claims to have created actually exist
- Cross-reference claims against the project's existing conventions

The gap between what an agent claims and what the filesystem shows is where
almost every real finding lives.

### 3. Score each axis

Work through the five axes defined in this skill's body. For each: assign 1
to 5, cite the specific gap with evidence such as a line number or grep
output if the score is below 5, and write a one-sentence improvement.

### 4. Produce the report

Use `references/report-template.md`. The format is identical to a
self-evaluation, so the two are comparable.
