/**
 * @file tests/feature.backport/src/feature.spec.ts
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
import { backport } from '@resnovas/feature.backport'
import { Effect } from 'effect'
import { memory, payload, run } from './fixtures.js'

describe('backport feature', () => {
  it('is enabled only by a backport section, and handles pull request events', () => {
    expect(backport.enabled?.({ version: 2 })).toBe(false)
    expect(backport.enabled?.({ version: 2, backport: {} })).toBe(true)
    expect(backport.handles).toStrictEqual(['pullRequest'])
  })

  it.effect('backports on pull_request and pull_request_target, never on review events', () =>
    Effect.gen(function* () {
      const bases = (github: ReturnType<typeof memory>) => github.state.backports.map(({ base }) => base)
      const onTarget = memory()
      yield* run({ version: 2, backport: {} }, onTarget, payload(), 'pull_request_target')
      expect(bases(onTarget)).toStrictEqual(['v1'])
      const onReview = memory()
      const reviewed = yield* run({ version: 2, backport: {} }, onReview, payload(), 'pull_request_review')
      expect(reviewed.ran).toStrictEqual(['backport'])
      expect(bases(onReview)).toStrictEqual([])
    }),
  )
})
