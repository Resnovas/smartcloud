# The five sections in detail

## 1. Goal

What outcome, and why it matters. One or two sentences, in terms of the
result rather than the steps.

> Exhibitors can reserve a stand and pay a deposit online, so stand sales
> stop running through email threads that nobody can reconcile.

Not "create a reservations module". That is a step, and stating it forecloses
a better design the specialist might see.

## 2. Context

What already exists that the work must fit. This is where the receiving agent
would otherwise spend its first ten minutes, or fail to.

- Which project and where: name it, so the receiving agent can resolve the
  path from the workspace's own project index rather than guessing.
- What it must integrate with, and anything already tried.
- Constraints that are real: a deadline, a dependency, a decision already
  made.
- Where the conventions live. Usually that is the target repository's own
  `AGENTS.md`; for library detail, Context7 rather than recalled examples.

## 3. Validation

How both of you will know it is done. State observable conditions, not
feelings:

> - A reservation with a paid deposit appears in the ERP within one sync
>   cycle.
> - Two exhibitors cannot hold the same stand; the second gets a clear
>   refusal.
> - Existing stand data is untouched by the migration.
> - `pnpm nx test bookings` passes.

"Works properly" and "is well tested" are not validation. If you cannot write
a condition someone could check, the requirement is not understood yet, and
the card is not ready.

## 4. Out of scope

What you are explicitly not asking for. Scope creep in agent work usually
comes from an agent being helpful about something adjacent.

> Not in scope: refunds, the public stand map, changing the payment provider.

## 5. Escalation

When to stop rather than proceed on a guess.

> Stop and ask if the deposit needs to be refundable, or if this requires a
> schema change rather than a new table.

An agent that stops with a good question has done better work than one that
guessed and delivered something plausible.
