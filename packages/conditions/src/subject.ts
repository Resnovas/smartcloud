/**
 * @file packages/conditions/src/subject.ts
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

import { Schema } from 'effect'

/**
 * A review on a pull request, reduced to what conditions need.
 *
 * @example
 * ```ts import.meta.vitest name="Review"
 * import { Review } from '@resnovas/conditions'
 * import { Schema } from 'effect'
 *
 * Schema.is(Review)({ author: 'jane', state: 'APPROVED' }) // => true
 * ```
 */
export const Review = Schema.Struct({
  author: Schema.String,
  state: Schema.Literal('APPROVED', 'CHANGES_REQUESTED', 'COMMENTED', 'DISMISSED', 'PENDING'),
})
/** A decoded {@link Review}. */
export type Review = typeof Review.Type

/**
 * A commit on a pull request, reduced to what conditions need.
 *
 * @example
 * ```ts import.meta.vitest name="Commit"
 * import { Commit } from '@resnovas/conditions'
 * import { Schema } from 'effect'
 *
 * const commit = { sha: 'abc', message: 'fix: x', authorName: 'Jane', authorEmail: 'jane@example.com', parents: 1 }
 * Schema.is(Commit)(commit) // => true
 * ```
 */
export const Commit = Schema.Struct({
  sha: Schema.String,
  message: Schema.String,
  authorName: Schema.String,
  authorEmail: Schema.String,
  /** Number of parents: more than one is a merge commit. */
  parents: Schema.Number,
})
/** A decoded {@link Commit}. */
export type Commit = typeof Commit.Type

/**
 * Whether a pull request can merge into its base branch, as GitHub reports
 * it: `UNKNOWN` while GitHub is still computing it.
 *
 * @example
 * ```ts import.meta.vitest name="Mergeable"
 * import { Mergeable } from '@resnovas/conditions'
 * import { Schema } from 'effect'
 *
 * Schema.is(Mergeable)('CONFLICTING') // => true
 * ```
 */
export const Mergeable = Schema.Literal('MERGEABLE', 'CONFLICTING', 'UNKNOWN')
/** A decoded {@link Mergeable}. */
export type Mergeable = typeof Mergeable.Type

/**
 * Where a CI check stands: `success` when it passed (or finished neutral or
 * skipped), `failure` when it finished any other way, and `pending` until it
 * has finished.
 *
 * @example
 * ```ts import.meta.vitest name="CheckState"
 * import { CheckState } from '@resnovas/conditions'
 * import { Schema } from 'effect'
 *
 * Schema.is(CheckState)('pending') // => true
 * ```
 */
export const CheckState = Schema.Literal('success', 'failure', 'pending')
/** A decoded {@link CheckState}. */
export type CheckState = typeof CheckState.Type

/**
 * A CI check on a pull request's head commit: a check run, or a commit
 * status under its context name.
 *
 * @example
 * ```ts import.meta.vitest name="Check"
 * import { Check } from '@resnovas/conditions'
 * import { Schema } from 'effect'
 *
 * Schema.is(Check)({ name: 'test', state: 'success' }) // => true
 * ```
 */
export const Check = Schema.Struct({
  name: Schema.String,
  state: CheckState,
})
/** A decoded {@link Check}. */
export type Check = typeof Check.Type

/**
 * How an author is associated with the repository, as GitHub reports it in
 * `author_association`.
 *
 * @example
 * ```ts import.meta.vitest name="Association"
 * import { Association } from '@resnovas/conditions'
 * import { Schema } from 'effect'
 *
 * Schema.is(Association)('FIRST_TIME_CONTRIBUTOR') // => true
 * Schema.is(Association)('first-time') // => false
 * ```
 */
export const Association = Schema.Literal(
  'OWNER',
  'MEMBER',
  'COLLABORATOR',
  'CONTRIBUTOR',
  'FIRST_TIME_CONTRIBUTOR',
  'FIRST_TIMER',
  'MANNEQUIN',
  'NONE',
)
/** A decoded {@link Association}. */
export type Association = typeof Association.Type

/**
 * The thing a condition is evaluated against: an issue or a pull request,
 * normalised from whichever GitHub event delivered it.
 *
 * @remarks
 * `files`, `reviews`, `pendingReviewers`, `requestedReviewers`, `commits`,
 * `mergeable` and `checks` are facets that cost an API call each, so the engine loads only the ones a
 * config needs (see `requiredFacets`). Evaluating a condition whose facet was not loaded fails
 * with `MissingFacet` rather than guessing.
 *
 * @example
 * ```ts import.meta.vitest name="Subject"
 * import { Subject } from '@resnovas/conditions'
 * import { Schema } from 'effect'
 *
 * const issue = { kind: 'issue', number: 3, title: 'Bug', body: '', author: 'sam', open: true, locked: false, labels: [], updatedAt: new Date(0) }
 * Schema.is(Subject)(issue) // => true
 * ```
 */
export const Subject = Schema.Struct({
  kind: Schema.Literal('pullRequest', 'issue'),
  number: Schema.Number,
  title: Schema.String,
  /** The description; an empty string when the body is empty or null. */
  body: Schema.String,
  author: Schema.String,
  /** How the author is associated with the repository. */
  association: Schema.optionalWith(Association, { exact: true }),
  /** Whether the author is a bot account, such as a GitHub App. */
  bot: Schema.optionalWith(Schema.Boolean, { exact: true }),
  open: Schema.Boolean,
  locked: Schema.Boolean,
  labels: Schema.Array(Schema.String),
  /** The logins of the people assigned; none when omitted. */
  assignees: Schema.optionalWith(Schema.Array(Schema.String), { exact: true }),
  /** The title of the milestone the subject is in; omitted when it is in none. */
  milestone: Schema.optionalWith(Schema.String, { exact: true }),
  updatedAt: Schema.DateFromSelf,
  draft: Schema.optionalWith(Schema.Boolean, { exact: true }),
  headBranch: Schema.optionalWith(Schema.String, { exact: true }),
  /** The branch the pull request merges into. */
  baseBranch: Schema.optionalWith(Schema.String, { exact: true }),
  /** Lines added plus lines deleted. */
  changes: Schema.optionalWith(Schema.Number, { exact: true }),
  files: Schema.optionalWith(Schema.Array(Schema.String), { exact: true }),
  reviews: Schema.optionalWith(Schema.Array(Review), { exact: true }),
  pendingReviewers: Schema.optionalWith(Schema.Number, { exact: true }),
  /** The logins and team slugs asked to review that have not reviewed yet. */
  requestedReviewers: Schema.optionalWith(Schema.Array(Schema.String), { exact: true }),
  commits: Schema.optionalWith(Schema.Array(Commit), { exact: true }),
  mergeable: Schema.optionalWith(Mergeable, { exact: true }),
  /** The CI checks on the head commit. */
  checks: Schema.optionalWith(Schema.Array(Check), { exact: true }),
})
/** A decoded {@link Subject}. */
export type Subject = typeof Subject.Type

/** A subject property that is loaded on demand. */
export type Facet = 'files' | 'reviews' | 'pendingReviewers' | 'requestedReviewers' | 'commits' | 'mergeable' | 'checks'
