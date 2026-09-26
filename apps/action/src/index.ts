/**
 * @file apps/action/src/index.ts
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

export { CONFIG_CANDIDATES, readInputs } from './inputs.js'
export type { Inputs } from './inputs.js'
export { BadEventPayload, program } from './program.js'
export type { Connect } from './program.js'
export { FEATURES, NoConfig, runAction, UnknownFeatures } from './run.js'
export type { Outcome } from './run.js'
