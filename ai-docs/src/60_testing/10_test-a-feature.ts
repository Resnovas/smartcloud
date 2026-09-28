/**
 * @file ai-docs/src/60_testing/10_test-a-feature.ts
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

/**
 * @title Testing a feature against the in-memory GitHub
 *
 * The shape of a spec in `tests/feature.<name>`: seed the memory GitHub, fix
 * the clock, run the feature through the engine and assert on the state it
 * left. Nothing is mocked; the feature runs as it would in the action.
 */
import { describe, expect, it } from '@effect/vitest'
import { runFeatures } from '@resnovas/engine'
import { GitHub, makeMemoryGitHub } from '@resnovas/integrations.github'
import { FEATURES } from '@resnovas/runtime'
import { Effect, TestClock } from 'effect'

const DAY = 86_400_000
const NOW = Date.UTC(2026, 8, 26)

describe('lock', () => {
  it.effect('locks an issue closed for longer than afterDays', () =>
    Effect.gen(function* () {
      const github = makeMemoryGitHub({
        closedIssues: [
          {
            number: 1,
            title: 'item 1',
            body: '',
            author: 'sam',
            open: false,
            locked: false,
            labels: [],
            updatedAt: new Date(NOW - 40 * DAY),
            closedAt: new Date(NOW - 40 * DAY),
            isPullRequest: false,
          },
        ],
      })
      github.state.issues.set(1, { labels: [], comments: [], open: false })
      // it.effect runs on the TestClock, which starts at 0 until it is set.
      yield* TestClock.setTime(NOW)

      const result = yield* runFeatures({
        config: { version: 2, lock: { afterDays: 30, on: ['issue'] } },
        event: 'schedule',
        payload: {},
        features: FEATURES.filter((feature) => feature.name === 'lock'),
      }).pipe(Effect.provideService(GitHub, github.service))

      expect(result.failed).toStrictEqual([])
      expect(github.state.issues.get(1)?.locked).toBe(true)
      expect(result.changes.map((change) => change.description)).toStrictEqual(['locked #1'])
    }),
  )
})
