/**
 * @file tests/feature.stale/src/feature.spec.ts
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

import { describe, expect, it } from '@effect/vitest'
import { makeReport, Report } from '@resnovas/engine'
import { stale, sweepStale } from '@resnovas/feature.stale'
import { GitHub } from '@resnovas/integrations.github'
import { Effect } from 'effect'
import { daysAgo, item, labelsOf, memory, settings, sweep } from './fixtures.js'

describe('stale feature: when it runs', () => {
  it.effect('runs on schedule and workflow_dispatch, and does nothing on other repository events', () =>
    Effect.gen(function* () {
      const onPush = memory([item(1, { updatedAt: daysAgo(40) })])
      const pushed = yield* sweep({ version: 2, stale: settings }, onPush, 'push')
      expect(pushed.ran).toStrictEqual(['stale'])
      expect(labelsOf(onPush, 1)).toStrictEqual([])
      const onDispatch = memory([item(1, { updatedAt: daysAgo(40) })])
      yield* sweep({ version: 2, stale: settings }, onDispatch, 'workflow_dispatch')
      expect(labelsOf(onDispatch, 1)).toStrictEqual(['stale'])
    }),
  )

  it.effect('is enabled only by a stale section, and a sweep without one does nothing', () =>
    Effect.gen(function* () {
      expect(stale.enabled?.({ version: 2 })).toBe(false)
      expect(stale.enabled?.({ version: 2, stale: settings })).toBe(true)
      const github = memory([item(1, { updatedAt: daysAgo(40) })])
      const report = yield* makeReport
      yield* sweepStale({ version: 2 }).pipe(
        Effect.provideService(GitHub, github.service),
        Effect.provideService(Report, report),
      )
      expect(labelsOf(github, 1)).toStrictEqual([])
    }),
  )
})
