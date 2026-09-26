/**
 * @file tests/runtime/src/telemetry.spec.ts
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
import { Telemetry, telemetry } from '@resnovas/runtime'
import { ConfigProvider, Effect } from 'effect'

describe('telemetry', () => {
  it.effect('builds the layer for a surface, sending nothing when turned off', () =>
    Effect.gen(function* () {
      const sent: Array<string> = []
      const fetch: typeof globalThis.fetch = async (input) => {
        sent.push(String(input))
        return new Response('{}')
      }
      const enabled = yield* Effect.flatMap(Telemetry, (service) => service.isEnabled).pipe(
        Effect.provide(telemetry('cli', '1.0.0', { fetch })),
        Effect.withConfigProvider(ConfigProvider.fromMap(new Map([['SMARTCLOUD_TELEMETRY', 'false']]))),
      )
      expect(enabled).toBe(false)
      expect(sent).toStrictEqual([])
    }),
  )
})
