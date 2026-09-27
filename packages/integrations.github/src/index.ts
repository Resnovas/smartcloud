/**
 * @file packages/integrations.github/src/index.ts
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
  Forbidden,
  fromGraphqlErrors,
  fromStatus,
  NotFound,
  RateLimited,
  Unavailable,
  ValidationFailed,
} from './errors.js'
export type { GitHubError } from './errors.js'
export { isTrustedComment } from './comments.js'
export { GitHub } from './service.js'
export type {
  Annotation,
  ChangeProposal,
  CheckRun,
  CheckRunFields,
  Comment,
  CommitCheck,
  CommitIdentity,
  DirectoryEntry,
  FileChange,
  FileLocation,
  GitHubService,
  IssueSummary,
  Label,
  NewReview,
  ProposalResult,
  Repository,
  RepositoryCoordinates,
  RepositoryRequest,
} from './service.js'
export { CHECK_RUN_EXTERNAL_ID, DEFAULT_COMMITTER, GitHubLive, makeLiveGitHub, signOff } from './live.js'
export type { LiveOptions } from './live.js'
export { DryRun, DryRunLog, dryRunGitHub } from './dry-run.js'
export { Restricted, restrictedGitHub, SkippedWrites } from './restricted.js'
export { githubDuration, githubRequests, githubSpanName } from './telemetry.js'
export type { RecordedWrite } from './dry-run.js'
export { fileKey, GitHubMemory, makeMemoryGitHub } from './memory.js'
export type { MemoryIssue, MemoryProposal, MemoryPullRequest, MemoryState } from './memory.js'
