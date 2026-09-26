/**
 * @file tests/action/src/inputs.spec.ts
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

import { describe, expect, it } from '@effect/vitest'
import { readInputs } from '@resnovas/action'
import { Effect, Option, Redacted } from 'effect'
import { withEnv } from './fixtures.js'

describe('readInputs', () => {
  it.effect('reads empty inputs as absent, and booleans strictly', () =>
    Effect.gen(function* () {
      const read = yield* readInputs.pipe(withEnv({ INPUT_GITHUB_TOKEN: 'abc', INPUT_CONFIG: '  ', INPUT_DRYRUN: 'false' }))
      expect(Redacted.value(read.token)).toBe('abc')
      expect(read.config).toStrictEqual(Option.none())
      expect(read.dryRun).toBe(false)
      expect(read.telemetry).toBe(true)
      expect(read.deprecations).toStrictEqual([])
      const off = yield* readInputs.pipe(withEnv({ INPUT_GITHUB_TOKEN: 'abc', INPUT_TELEMETRY: 'FALSE' }))
      expect(off.telemetry).toBe(false)
      const on = yield* readInputs.pipe(withEnv({ INPUT_GITHUB_TOKEN: 'abc', INPUT_TELEMETRY: 'true' }))
      expect(on.telemetry).toBe(true)
      const dry = yield* readInputs.pipe(
        withEnv({ INPUT_GITHUB_TOKEN: 'abc', INPUT_DRYRUN: 'TRUE', INPUT_FEATURES: 'labels, stale,', INPUT_CONFIGREF: 'v2' }),
      )
      expect(dry.dryRun).toBe(true)
      expect(dry.features).toStrictEqual(Option.some(['labels', 'stale']))
      expect(dry.configRef).toStrictEqual(Option.some('v2'))
      for (const empty of [',', ' , ,']) {
        const read = yield* readInputs.pipe(withEnv({ INPUT_GITHUB_TOKEN: 'abc', INPUT_FEATURES: empty }))
        expect(read.features).toStrictEqual(Option.none())
      }
    }),
  )

  it.effect('falls back to GITHUB_TOKEN, fails with no token, and flags v1 inputs', () =>
    Effect.gen(function* () {
      const read = yield* readInputs.pipe(withEnv({ INPUT_GITHUB_TOKEN: '', GITHUB_TOKEN: 'env', INPUT_FILLEMPTY: 'true', INPUT_SKIPDELETE: 'false' }))
      expect(Redacted.value(read.token)).toBe('env')
      expect(read.deprecations).toHaveLength(2)
      expect(read.deprecations[1]).toContain('labelSync.prune')
      const missing = yield* Effect.either(readInputs.pipe(withEnv({})))
      expect(missing._tag).toBe('Left')
    }),
  )
})
