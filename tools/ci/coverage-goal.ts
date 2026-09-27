/**
 * @file tools/ci/coverage-goal.ts
 *
 * Copyright 2021 Jonathan Stevens trading as Resnovas. All rights reserved.
 * Licensed under the Fair Core License, Version 1.0, MIT Future License
 * (FCL-1.0-MIT); see LICENSE. You may not move, change, disable or circumvent
 * the licence key functionality, or modify any part of the software that the
 * licence key protects.
 *
 * Contributions are made under the Developer Certificate of Origin (DCO.md) and
 * the Contributing Guidelines (CONTRIBUTING.md), subject to the Code of Conduct
 * (CODE_OF_CONDUCT.md) and the Cooperation Commitment (COOPERATION_COMMITMENT.md).
 *
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE.
 */

// Warns when a test project's coverage is below the goal. vitest.shared.ts
// fails a run below the enforced minimum (90%); between that and the goal
// (100%) the run passes, and this reporter says how far short it fell, as a
// warning annotation on CI and a plain line locally, so a gap is never silent.

import type { Reporter } from 'vitest/node'

/** The coverage totals Vitest measures, in percent. */
export type Metric = 'lines' | 'statements' | 'functions' | 'branches'
const METRICS: ReadonlyArray<Metric> = ['lines', 'statements', 'functions', 'branches']

/** How the reporter is set up in vitest.shared.ts. */
export interface CoverageGoalOptions {
  /** The test project, named in the warning. */
  readonly project?: string
  /** The coverage to aim for, in percent; 100 when omitted. */
  readonly goal?: number
}

// Workflow command escaping, as in @actions/core.
const escapeData = (text: string) => text.replaceAll('%', '%25').replaceAll('\r', '%0D').replaceAll('\n', '%0A')

/**
 * Reads the totals from the coverage map Vitest hands its reporters.
 *
 * @param coverage - The istanbul coverage map from `onCoverage`.
 * @returns Each metric's percentage, 100 for a metric with nothing to cover, or `undefined` when the value is not a coverage map.
 */
export const coverageTotals = (coverage: unknown): Record<Metric, number> | undefined => {
  if (typeof coverage !== 'object' || coverage === null || !('getCoverageSummary' in coverage)) return undefined
  const summarise = coverage.getCoverageSummary
  if (typeof summarise !== 'function') return undefined
  const json = (summarise.call(coverage) as { toJSON: () => Record<string, { pct: number | string }> }).toJSON()
  const pct = (metric: Metric) => {
    const value = json[metric]?.pct
    return typeof value === 'number' ? value : 100
  }
  return { lines: pct('lines'), statements: pct('statements'), functions: pct('functions'), branches: pct('branches') }
}

export default class CoverageGoalReporter implements Reporter {
  constructor(private readonly options: CoverageGoalOptions = {}) {}

  onCoverage(coverage: unknown) {
    const totals = coverageTotals(coverage)
    if (totals === undefined) return
    const goal = this.options.goal ?? 100
    const short = METRICS.filter((metric) => totals[metric] < goal).map((metric) => `${metric} ${totals[metric]}%`)
    if (short.length === 0) return
    const message = `${this.options.project ?? 'The tests'} cover less than the ${goal}% goal: ${short.join(', ')}. The run still passes above the enforced minimum; add the missing tests when you can.`
    console.log(
      process.env['GITHUB_ACTIONS'] === 'true'
        ? `::warning title=Coverage below the goal::${escapeData(message)}`
        : `warning: ${message}`,
    )
  }
}
