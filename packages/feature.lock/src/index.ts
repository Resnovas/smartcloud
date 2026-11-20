/**
 * @file packages/feature.lock/src/index.ts
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

/**
 * Register scheduled conversation locking with the feature engine.
 *
 * @example
 * ```ts
 * import { lock } from '@resnovas/feature.lock'
 * const enabled = lock.enabled?.({ version: 2, lock: { afterDays: 30 } })
 * ```
 */
export { lock } from './feature.js'
/**
 * Expose retention calculations and GitHub-backed operations for custom sweeps.
 *
 * @example
 * ```ts
 * import { closedBefore } from '@resnovas/feature.lock'
 * const cutoff = closedBefore(30, Date.parse('2026-02-01T00:00:00Z'))
 * ```
 */
export { closedBefore, LOCK_MARKER, lockItem, sweepLocks } from './sweep.js'
/**
 * Share the non-optional locking policy accepted by individual-item operations.
 *
 * @example
 * ```ts
 * import type { LockConfig } from '@resnovas/feature.lock'
 * const policy: LockConfig = { afterDays: 30, reason: 'resolved' }
 * ```
 */
export type { LockConfig } from './sweep.js'
