/**
 * @file packages/feature.freeze/src/index.ts
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
 * Expose event handling and check construction for configured merge freezes.
 *
 * @example
 * ```ts
 * import { freezeCheck } from '@resnovas/feature.freeze'
 * const open = freezeCheck('head-sha', undefined, undefined)
 * ```
 */
export { FEATURE, FREEZE_CHECK, freezeCheck, freezeFeature, SWEEP_EVENTS } from './feature.js'
/**
 * Evaluate manual and recurring windows against caller-supplied epoch milliseconds.
 *
 * @example
 * ```ts
 * import { activeFreeze } from '@resnovas/feature.freeze'
 * const active = activeFreeze({ active: true, reason: 'Release preparation' }, Date.now())
 * ```
 */
export { activeFreeze, describeFreeze, MANUAL, windowEnd } from './window.js'
/**
 * Share the selected freeze's display metadata with report consumers.
 *
 * @example
 * ```ts
 * import type { ActiveFreeze } from '@resnovas/feature.freeze'
 * const manual: ActiveFreeze = { key: 'active', reason: undefined, until: undefined }
 * ```
 */
export type { ActiveFreeze } from './window.js'
