/**
 * @file tests/feature.required/src/assess.spec.ts
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

import { describe, expect, it } from '@effect/vitest'
import { assessChecks, OWN_CHECK_PREFIX } from '@resnovas/feature.required'
import type { CommitCheck } from '@resnovas/integrations.github'

const checks: ReadonlyArray<CommitCheck> = [
  { name: 'smartcloud', source: 'checkRun', id: 1, state: 'pending', detail: 'in_progress' },
  { name: 'smartcloud', source: 'status', state: 'failure', detail: 'failure' },
  { name: 'smartcloud / reviews', source: 'checkRun', id: 2, state: 'failure', detail: 'failure' },
  { name: 'ci / test', source: 'checkRun', id: 3, state: 'success', detail: 'success' },
  { name: 'ci / build', source: 'checkRun', id: 4, state: 'pending', detail: 'queued' },
  { name: 'Codecov/patch', source: 'status', state: 'failure', detail: 'failure' },
]

describe('assessChecks', () => {
  it('leaves out the job itself and smartcloud feature check runs, but not a status of the same name', () => {
    expect(OWN_CHECK_PREFIX).toBe('smartcloud / ')
    const assessment = assessChecks(checks, { checkRunId: 1, ignore: [] })
    expect(assessment.counted.map((check) => check.name)).toStrictEqual([
      'smartcloud',
      'ci / test',
      'ci / build',
      'Codecov/patch',
    ])
    expect(assessment.pending.map((check) => check.name)).toStrictEqual(['ci / build'])
    expect(assessment.failed.map((check) => check.name)).toStrictEqual(['smartcloud', 'Codecov/patch'])
  })

  it('leaves out checks an ignore pattern matches, bare or delimited with flags', () => {
    const assessment = assessChecks(checks, { checkRunId: 1, ignore: ['/^codecov\\//i', '^smartcloud$'] })
    expect(assessment.counted.map((check) => check.name)).toStrictEqual(['ci / test', 'ci / build'])
    expect(assessment.failed).toStrictEqual([])
  })

  it('leaves out every name a global or sticky ignore pattern matches', () => {
    for (const pattern of ['/^ci/g', '/^ci/y']) {
      const assessment = assessChecks(checks, { checkRunId: 1, ignore: [pattern] })
      expect(assessment.counted.map((check) => check.name)).toStrictEqual(['smartcloud', 'Codecov/patch'])
    }
  })
})
