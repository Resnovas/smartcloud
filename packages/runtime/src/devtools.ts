/**
 * @file packages/runtime/src/devtools.ts
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

import * as DevTools from '@effect/experimental/DevTools'
import { Config, Effect, Layer } from 'effect'

/**
 * The Dev Tools layer for an `EFFECT_DEVTOOLS` setting.
 *
 * @remarks
 * Empty, `false` or `0` gives an empty layer. `true` or `1` connects to the
 * Dev Tools extension's default address (`ws://localhost:34437`); any other
 * value is used as the WebSocket address.
 *
 * @example
 * ```ts import.meta.vitest name="devToolsFor"
 * import { devToolsFor } from '@resnovas/runtime'
 * import { Layer } from 'effect'
 *
 * devToolsFor('false') === Layer.empty // => true
 * ```
 *
 * @param setting - The value of `EFFECT_DEVTOOLS`.
 * @returns The layer.
 */
export const devToolsFor = (setting: string): Layer.Layer<never> => {
  const value = setting.trim()
  if (value === '' || value === 'false' || value === '0') return Layer.empty
  return DevTools.layer(value === 'true' || value === '1' ? undefined : value)
}

/**
 * Connects the process to Effect Dev Tools when `EFFECT_DEVTOOLS` is set.
 *
 * @remarks
 * Off unless asked for; see {@link devToolsFor} for the values. Spans still
 * reach the tracer that was current before, so telemetry keeps working
 * alongside it.
 *
 * @example
 * ```ts
 * import { devTools } from '@resnovas/runtime'
 * import { Effect } from 'effect'
 *
 * const traced = Effect.log('hello').pipe(Effect.withSpan('greet'), Effect.provide(devTools))
 * ```
 */
export const devTools: Layer.Layer<never> = Layer.unwrapEffect(
  Effect.map(Config.withDefault(Config.string('EFFECT_DEVTOOLS'), ''), devToolsFor),
).pipe(Layer.orDie)
