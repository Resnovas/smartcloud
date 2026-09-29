/**
 * @file tests/runtime/src/flags.spec.ts
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
import type { Feature } from '@resnovas/engine'
import { FEATURE_FLAGS, featureEnabled, FEATURES, flagFor, turnedOffFeatures } from '@resnovas/runtime'
import { Effect } from 'effect'
import { recording, repository } from './fixtures.js'

describe('feature flags', () => {
  it('has one flag per feature, named for it and on by default', () => {
    expect(FEATURES.map((feature) => flagFor(feature.name)).sort()).toStrictEqual(Object.keys(FEATURE_FLAGS).sort())
    expect(Object.values(FEATURE_FLAGS).every((value) => value)).toBe(true)
  })

  it.effect('uses the defaults without telemetry, and the flag with it', () =>
    Effect.gen(function* () {
      expect(yield* featureEnabled(repository, 'smartcloud-labels')).toBe(true)
      const flagged = recording({ 'smartcloud-labels': false })
      expect(yield* featureEnabled(repository, 'smartcloud-labels').pipe(Effect.provide(flagged.layer))).toBe(false)
    }),
  )

  it.effect('names the features their flags turn off, and never one without a flag', () =>
    Effect.gen(function* () {
      const flagged = recording({ 'smartcloud-stale': false })
      const unflagged: Feature = { name: 'experimental', handles: ['repository'], run: () => Effect.void }
      const off = yield* turnedOffFeatures(repository, [...FEATURES, unflagged]).pipe(Effect.provide(flagged.layer))
      expect([...off]).toStrictEqual([['stale', 'turned off by feature flag smartcloud-stale']])
    }),
  )
})
