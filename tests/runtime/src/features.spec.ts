/**
 * @file tests/runtime/src/features.spec.ts
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
import { FEATURES, parseFeatureList, selectFeatures, UnknownFeatures } from '@resnovas/runtime'
import { Effect } from 'effect'

describe('features', () => {
  it.effect('splits lists, selects features in order, and names unknown ones', () =>
    Effect.gen(function* () {
      expect(parseFeatureList(' labels, stale,,')).toStrictEqual(['labels', 'stale'])
      expect(yield* selectFeatures(undefined)).toBe(FEATURES)
      expect((yield* selectFeatures(['stale', 'labels'])).map((feature) => feature.name)).toStrictEqual([
        'labels',
        'stale',
      ])
      const unknown = yield* Effect.flip(selectFeatures(['labels', 'nope']))
      expect(unknown).toBeInstanceOf(UnknownFeatures)
      expect(unknown.message).toMatch(/^unknown feature\(s\): nope; expected some of conventions, /)
    }),
  )
})
