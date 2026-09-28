/**
 * @file packages/feature.lock/src/feature.ts
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

import type { Feature } from '@resnovas/engine'
import { Effect } from 'effect'
import { sweepLocks } from './sweep.js'

// A sweep searches every closed item, so it runs on a timetable or on demand,
// never on the pushes and merge queue entries that are also repository events.
const SWEEP_EVENTS = new Set(['schedule', 'workflow_dispatch'])

/**
 * The lock feature: locks the conversations of issues and pull requests that
 * have been closed for `lock.afterDays`.
 *
 * @remarks
 * It runs on `schedule` and `workflow_dispatch` events only, and is enabled
 * when the config has a `lock` section. Neither event comes from a fork, and
 * the workflow token's `issues: write` and `pull-requests: write` are enough
 * to comment, label and lock. It writes at most one
 * `<!-- smartcloud:lock -->` comment per item, editing an existing one a bot
 * account or a `roles.trustedBots` login wrote.
 *
 * @example
 * ```ts import.meta.vitest name="lock"
 * import { lock } from '@resnovas/feature.lock'
 *
 * lock.enabled?.({ version: 2, lock: { afterDays: 30 } }) // => true
 * lock.handles.join(', ') // => 'repository'
 * ```
 */
export const lock: Feature = {
  name: 'lock',
  handles: ['repository'],
  enabled: (config) => config.lock !== undefined,
  run: ({ config, envelope }) => (SWEEP_EVENTS.has(envelope.event) ? sweepLocks(config) : Effect.void),
}
