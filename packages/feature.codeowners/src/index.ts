/**
 * @file packages/feature.codeowners/src/index.ts
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

export {
  CodeOwnersBranchIsBase,
  codeownersErrors,
  codeownersFeature,
  combineProblems,
  DEFAULT_CODEOWNERS_BRANCH,
  editsGenerated,
  FEATURE,
  GENERATED_RULE,
  SHADOWED_RULE,
  SYNTAX_RULE,
} from './feature.js'
export type { LocatedProblem } from './feature.js'
export {
  CODEOWNERS_PATHS,
  GENERATED_BEGIN,
  GENERATED_END,
  generatedBlock,
  lintCodeOwners,
  mergeGenerated,
  parseCodeOwners,
  renderGenerated,
} from './file.js'
export type { CodeOwnersEntry, CodeOwnersProblem } from './file.js'
