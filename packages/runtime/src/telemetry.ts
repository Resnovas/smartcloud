/**
 * @file packages/runtime/src/telemetry.ts
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

import { telemetryLayer, type Surface, type Telemetry, type TelemetryOptions } from '@resnovas/integrations.posthog'
import type { Layer } from 'effect'

/**
 * The telemetry a smartcloud process runs with: PostHog events, error
 * tracking, logs, traces, metrics and feature flags.
 *
 * @remarks
 * Every surface provides this once, around everything it runs. It sends
 * nothing when `SMARTCLOUD_TELEMETRY=false`, `DO_NOT_TRACK=1` or the action
 * input `telemetry: false` is set, and stops sending once a config says
 * `telemetry: false`. Closing it flushes what is queued.
 *
 * @example
 * ```ts
 * import { telemetry, Telemetry } from '@resnovas/runtime'
 * import { Effect } from 'effect'
 *
 * const enabled = Effect.flatMap(Telemetry, (service) => service.isEnabled).pipe(Effect.provide(telemetry('cli', '2.0.0')))
 * ```
 *
 * @param surface - Which smartcloud is running.
 * @param version - The smartcloud version.
 * @param options - A `fetch` to use instead of the global one, for tests.
 * @returns The layer.
 */
export const telemetry = (surface: Surface, version: string, options: Pick<TelemetryOptions, 'fetch'> = {}): Layer.Layer<Telemetry> =>
  telemetryLayer({ surface, version, ...options })
