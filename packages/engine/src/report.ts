/**
 * @file packages/engine/src/report.ts
 *
 * Copyright 2021 Jonathan Stevens trading as Resnovas. All rights reserved.
 * Licensed under the Fair Core License, Version 1.0, MIT Future License
 * (FCL-1.0-MIT); see LICENSE. You may not move, change, disable or circumvent
 * the licence key functionality, or modify any part of the software that the
 * licence key protects.
 *
 * Contributions are made under the Developer Certificate of Origin (DCO.md) and
 * the Contributing Guidelines (CONTRIBUTING.md), subject to the Code of Conduct
 * (CODE_OF_CONDUCT.md) and the Eventiva Cooperation Commitment
 * (COOPERATION_COMMITMENT.md).
 *
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE.
 */

import { Context, Effect, Ref } from 'effect'

/** Something a feature found: a broken rule, a warning, or a notice. */
export interface Finding {
  readonly feature: string
  /** The rule's id, for example `AI-02` or `labels.prune`. */
  readonly rule: string
  readonly level: 'error' | 'warning' | 'notice'
  readonly message: string
  /** Where the rule is explained. */
  readonly link?: string
  readonly commit?: string
  readonly path?: string
  readonly line?: number
}

/** Something a feature changed, or would change in a dry run. */
export interface Change {
  readonly feature: string
  readonly description: string
}

/** Everything a run found and changed. */
export interface ReportSnapshot {
  readonly findings: ReadonlyArray<Finding>
  readonly changes: ReadonlyArray<Change>
}

/**
 * Where features record findings and changes during a run. The reporters
 * turn the snapshot into check runs, comments and the job summary.
 */
export class Report extends Context.Tag('@resnovas/engine/Report')<
  Report,
  {
    readonly add: (finding: Finding) => Effect.Effect<void>
    readonly change: (change: Change) => Effect.Effect<void>
    readonly snapshot: Effect.Effect<ReportSnapshot>
  }
>() {}

/**
 * Creates an empty report.
 *
 * @returns The report service.
 */
export const makeReport = Effect.gen(function* () {
  const state = yield* Ref.make<ReportSnapshot>({ findings: [], changes: [] })
  return Report.of({
    add: (finding) => Ref.update(state, ({ findings, changes }) => ({ findings: [...findings, finding], changes })),
    change: (change) => Ref.update(state, ({ findings, changes }) => ({ findings, changes: [...changes, change] })),
    snapshot: Ref.get(state),
  })
})
