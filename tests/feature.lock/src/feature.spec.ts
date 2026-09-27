/**
 * @file tests/feature.lock/src/feature.spec.ts
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
import { lock } from '@resnovas/feature.lock'
import { Effect } from 'effect'
import { closed, lockedOf, memory, sweep } from './fixtures.js'

describe('lock feature', () => {
  it('is enabled only by a lock section, and handles repository events', () => {
    expect(lock.enabled?.({ version: 2 })).toBe(false)
    expect(lock.enabled?.({ version: 2, lock: { afterDays: 30 } })).toBe(true)
    expect(lock.handles).toStrictEqual(['repository'])
  })

  it.effect('sweeps on schedule and workflow_dispatch, and does nothing on other repository events', () =>
    Effect.gen(function* () {
      const onPush = memory([closed(1)])
      const pushed = yield* sweep({ version: 2, lock: { afterDays: 30 } }, onPush, 'push')
      expect(pushed.ran).toStrictEqual(['lock'])
      expect(lockedOf(onPush)).toStrictEqual([])
      const onSchedule = memory([closed(1)])
      yield* sweep({ version: 2, lock: { afterDays: 30 } }, onSchedule)
      expect(lockedOf(onSchedule)).toStrictEqual([1])
      const onDispatch = memory([closed(1)])
      yield* sweep({ version: 2, lock: { afterDays: 30 } }, onDispatch, 'workflow_dispatch')
      expect(lockedOf(onDispatch)).toStrictEqual([1])
    }),
  )
})
