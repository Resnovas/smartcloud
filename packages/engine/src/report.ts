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

import { Context, Effect, Metric, Ref } from 'effect'

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
 *
 * @example
 * ```ts
 * import { Report } from '@resnovas/engine'
 * import { Effect } from 'effect'
 *
 * const warn = Effect.flatMap(Report, (report) =>
 *   report.add({ feature: 'labels', rule: 'labels.prune', level: 'warning', message: 'Would delete "wontfix".' }),
 * )
 * ```
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
 * Counts findings as features record them, tagged by `level` and `feature`.
 *
 * @remarks
 * The tags name only the feature and the level, never what a finding is
 * about, so the counter is safe to send to telemetry.
 *
 * @example
 * ```ts
 * import { findingsCounter } from '@resnovas/engine'
 * import { Effect, Metric } from 'effect'
 *
 * const errors = Effect.map(Metric.value(Metric.tagged(findingsCounter, 'level', 'error')), (state) => state.count)
 * ```
 */
export const findingsCounter = Metric.counter('smartcloud.findings', { description: 'Findings recorded by smartcloud features, by level and feature', incremental: true })

// A finding's message can quote titles and logins, so only its rule, level and feature are logged.
const recordFinding = (finding: Finding) =>
  Effect.zipRight(
    Metric.increment(Metric.tagged(Metric.tagged(findingsCounter, 'level', finding.level), 'feature', finding.feature)),
    Effect.logDebug(`${finding.feature}: finding ${finding.rule}`).pipe(
      Effect.annotateLogs({ feature: finding.feature, rule: finding.rule, level: finding.level }),
    ),
  )

/**
 * Creates an empty report.
 *
 * @remarks
 * Every finding added also increments {@link findingsCounter} and writes a
 * debug log naming its feature, rule and level.
 *
 * @example
 * ```ts import.meta.vitest name="makeReport"
 * import { makeReport } from '@resnovas/engine'
 * import { Effect } from 'effect'
 *
 * const snapshot = Effect.runSync(
 *   Effect.flatMap(makeReport, (report) => Effect.zipRight(report.change({ feature: 'labels', description: 'labelled #7' }), report.snapshot)),
 * )
 * snapshot.changes.length // => 1
 * ```
 *
 * @returns The report service.
 */
export const makeReport = Effect.gen(function* () {
  const state = yield* Ref.make<ReportSnapshot>({ findings: [], changes: [] })
  return Report.of({
    add: (finding) =>
      Effect.zipRight(
        Ref.update(state, ({ findings, changes }) => ({ findings: [...findings, finding], changes })),
        recordFinding(finding),
      ),
    change: (change) => Ref.update(state, ({ findings, changes }) => ({ findings, changes: [...changes, change] })),
    snapshot: Ref.get(state),
  })
})
