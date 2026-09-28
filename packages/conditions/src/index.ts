/**
 * @file packages/conditions/src/index.ts
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

export { backtrackingRisk } from './backtracking.js'
export { codeownersOf, parseCodeowners } from './codeowners.js'
export type { CodeownersRule } from './codeowners.js'
export { dependencyUpdate, updateTypeOf, UpdateType } from './dependency.js'
export type { DependencyUpdate } from './dependency.js'
export { compilePattern, Pattern } from './pattern.js'
export {
  AssigneeMatches,
  AuthorAssociation,
  BaseBranchMatches,
  BinaryFilesAdded,
  BranchMatches,
  ChangesSize,
  CheckStatus,
  ChecksPass,
  CodeownersTouched,
  CommentMatches,
  CommitMessagesMatch,
  CommitsSignedOff,
  CommitsVerified,
  CreatedBefore,
  Condition,
  ConditionGroup,
  CreatorMatches,
  DependencyUpdateType,
  DescriptionMatches,
  FileCount,
  FilesMatch,
  HasAssignee,
  HasConflict,
  HasLabel,
  HasMilestone,
  HasTrailer,
  IsAbandoned,
  IsApproved,
  IsDraft,
  IsLocked,
  IsOpen,
  IsStale,
  LinksIssue,
  LockfileChanged,
  MilestoneMatches,
  PendingReview,
  ReactionCount,
  RequestedChanges,
  ReviewerMatches,
  TimeWindow,
  TitleMatches,
} from './schema.js'
export type { And, LeafCondition, Not, Only, Or } from './schema.js'
export {
  Association,
  ChangedFile,
  Check,
  CheckState,
  Comment,
  Commit,
  Mergeable,
  Reaction,
  Reactions,
  Review,
  Subject,
} from './subject.js'
export type { Facet } from './subject.js'
export { inWindow, localTime, minutesOf, TimeOfDay, TimeZone, Weekday } from './time.js'
export type { LocalTime, Window } from './time.js'
export { hasKey, parseIdentity, parseTrailers } from './trailers.js'
export type { Trailer } from './trailers.js'
export { evaluate, MissingFacet, requiredFacets } from './evaluate.js'
export type { ConditionResult, Evaluation } from './evaluate.js'
