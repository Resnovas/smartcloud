/**
 * @file packages/feature.commits/src/index.ts
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

export { classifyAttribution, readAttribution } from './attribution.js'
export type { Attribution, ClassifiedAttribution } from './attribution.js'
export { checkCommitMessage, commitsFeature } from './feature.js'
export { isAiIdentity, makeAiIdentityMatcher } from './identity.js'
export type { AiIdentityPatterns, Identity } from './identity.js'
export {
  authorRole,
  CommitsNotLoaded,
  DEFAULT_POLICY_BASE,
  levelFor,
  policyBase,
  pullRequestCommits,
  sameLogin,
} from './policy.js'
export type { MaintainerLevel, Role } from './policy.js'
