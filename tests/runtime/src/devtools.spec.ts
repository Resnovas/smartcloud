/**
 * @file tests/runtime/src/devtools.spec.ts
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
import { devTools, devToolsFor } from '@resnovas/runtime'
import { ConfigProvider, Effect, Layer } from 'effect'

describe('devTools', () => {
  it.effect('is an empty layer unless EFFECT_DEVTOOLS asks for it', () =>
    Effect.gen(function* () {
      for (const setting of [undefined, 'false']) {
        const ran = yield* Effect.succeed('ran').pipe(
          Effect.withSpan('probe'),
          Effect.provide(devTools),
          Effect.withConfigProvider(
            ConfigProvider.fromMap(new Map(setting === undefined ? [] : [['EFFECT_DEVTOOLS', setting]])),
          ),
        )
        expect(ran).toBe('ran')
      }
    }),
  )

  it('chooses the layer from the setting without connecting', () => {
    for (const setting of ['', ' ', 'false', '0']) expect(devToolsFor(setting)).toBe(Layer.empty)
    for (const setting of ['true', '1', 'ws://127.0.0.1:34437']) expect(devToolsFor(setting)).not.toBe(Layer.empty)
  })
})
