/**
 * @file tests/ci/src/coverage-goal.spec.ts
 *
 * Copyright 2026 Jonathan Stevens trading as Resnovas. All rights reserved.
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

import { afterEach, beforeEach, describe, expect, it, vi } from '@effect/vitest'
import { fileURLToPath } from 'node:url'

// Load the reporter as a file, as Vitest does from its path in vitest.shared.ts.
const { default: CoverageGoalReporter, coverageTotals } = (await import(
  fileURLToPath(new URL('../../../tools/ci/coverage-goal.ts', import.meta.url))
)) as {
  default: new (options?: { readonly project?: string; readonly goal?: number }) => {
    onCoverage: (coverage: unknown) => void
  }
  coverageTotals: (coverage: unknown) => Record<string, number> | undefined
}

// An istanbul coverage map, as far as the reporter reads it.
const map = (pct: Record<string, number | string>) => ({
  getCoverageSummary: () => ({
    toJSON: () => Object.fromEntries(Object.entries(pct).map(([metric, value]) => [metric, { pct: value }])),
  }),
})

const logged = () => vi.mocked(console.log).mock.calls.map(([line]) => String(line))

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => undefined)
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
})

describe('coverageTotals', () => {
  it('reads each metric, counting one with nothing to cover as full', () => {
    expect(coverageTotals(map({ lines: 95, statements: 96, functions: 'Unknown' }))).toStrictEqual({
      lines: 95,
      statements: 96,
      functions: 100,
      branches: 100,
    })
  })

  it('ignores anything that is not a coverage map', () => {
    expect(coverageTotals(undefined)).toBeUndefined()
    expect(coverageTotals({})).toBeUndefined()
    expect(coverageTotals({ getCoverageSummary: 'no' })).toBeUndefined()
  })
})

describe('the coverage goal reporter', () => {
  it('says nothing at the goal', () => {
    new CoverageGoalReporter({ project: 'config' }).onCoverage(
      map({ lines: 100, statements: 100, functions: 100, branches: 100 }),
    )
    expect(logged()).toStrictEqual([])
  })

  it('warns on CI with an annotation naming the project and each metric short of the goal', () => {
    vi.stubEnv('GITHUB_ACTIONS', 'true')
    new CoverageGoalReporter({ project: 'config' }).onCoverage(
      map({ lines: 92.5, statements: 100, functions: 100, branches: 91 }),
    )
    expect(logged()).toStrictEqual([
      // Annotations escape a percent sign as %25.
      '::warning title=Coverage below the goal::config cover less than the 100%25 goal: lines 92.5%25, branches 91%25. The run still passes above the enforced minimum; add the missing tests when you can.',
    ])
  })

  it('prints a plain warning locally, and takes another goal', () => {
    vi.stubEnv('GITHUB_ACTIONS', '')
    new CoverageGoalReporter({ goal: 95 }).onCoverage(map({ lines: 94, statements: 99, functions: 99, branches: 99 }))
    expect(logged()).toStrictEqual([
      'warning: The tests cover less than the 95% goal: lines 94%. The run still passes above the enforced minimum; add the missing tests when you can.',
    ])
  })

  it('ignores a coverage value it cannot read', () => {
    new CoverageGoalReporter().onCoverage(undefined)
    expect(logged()).toStrictEqual([])
  })
})
