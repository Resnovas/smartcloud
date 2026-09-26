/**
 * @file packages/conditions/src/index.ts
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

export { compilePattern, Pattern } from './pattern.js'
export {
  BranchMatches,
  ChangesSize,
  CommitMessagesMatch,
  CommitsSignedOff,
  Condition,
  ConditionGroup,
  CreatorMatches,
  DescriptionMatches,
  FilesMatch,
  HasConflict,
  HasLabel,
  HasTrailer,
  IsAbandoned,
  IsApproved,
  IsDraft,
  IsLocked,
  IsOpen,
  IsStale,
  PendingReview,
  RequestedChanges,
  TitleMatches,
} from './schema.js'
export type { And, LeafCondition, Not, Only, Or } from './schema.js'
export { Commit, Mergeable, Review, Subject } from './subject.js'
export type { Facet } from './subject.js'
export { hasKey, parseIdentity, parseTrailers } from './trailers.js'
export type { Trailer } from './trailers.js'
export { evaluate, MissingFacet, requiredFacets } from './evaluate.js'
export type { ConditionResult, Evaluation } from './evaluate.js'
