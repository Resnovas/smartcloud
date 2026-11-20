# Sub-agent briefs

Both sub-agents run in parallel and share no context. Everything they need
must be pasted into their prompt: they cannot read this skill's files.

## Standards sub-agent

Include:

- The full diff command and the commit list.
- The standards-source files found in step 3.
- **The full text of `references/smell-baseline.md`.**
- **The full text of `references/confidence.md`.**

The brief:

> Report, per file or hunk where relevant: (a) every place the diff violates
> a documented standard, citing the standard by file and rule; and (b) any
> baseline smell you spot, naming it and quoting the hunk. Distinguish hard
> violations from judgement calls. Documented-standard breaches can be hard;
> baseline smells are always judgement calls, and a documented repo standard
> overrides the baseline. Skip anything tooling enforces. Apply the
> confidence gate you were given: cite file and line, state the concrete
> failure, and report zero findings if the diff is clean. Under 400 words.

## Spec sub-agent

Include:

- The diff command and the commit list.
- The path or fetched contents of the spec.
- **The full text of `references/confidence.md`.**

The brief:

> Report: (a) requirements the spec asked for that are missing or partial;
> (b) behaviour in the diff that was not asked for, meaning scope creep; and
> (c) requirements that look implemented but where the implementation looks
> wrong. Quote the spec line for each finding. Apply the confidence gate you
> were given; a faithful implementation reports zero findings. Under 400
> words.

If the spec is missing, skip this sub-agent entirely and note it in the final
report. Do not substitute the commit messages for a spec.

## Aggregation

Present the two reports under `## Standards` and `## Spec`, verbatim or
lightly cleaned. Do **not** merge or rerank findings across axes.

End with one summary line: total findings per axis, and the worst issue
*within each axis* if there is one. Do not pick a single winner across axes;
that is exactly the reranking the separation exists to prevent.

## Why two axes

A change can pass one and fail the other:

- Follows every standard, implements the wrong thing: Standards pass, Spec
  fail.
- Does exactly what the issue asked, breaks the project's conventions: Spec
  pass, Standards fail.

Reporting them separately stops one axis from masking the other.
