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
 * (CODE_OF_CONDUCT.md) and the Eventiva Cooperation Commitment
 * (COOPERATION_COMMITMENT.md).
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
 * The thing a condition is evaluated against: an issue or a pull request,
 * normalised from whichever GitHub event delivered it.
 *
 * @remarks
 * `files`, `reviews`, `pendingReviewers` and `commits` are facets that cost an
 * API call each, so the engine loads only the ones a config needs (see
 * `requiredFacets`). Evaluating a condition whose facet was not loaded fails
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
  open: Schema.Boolean,
  locked: Schema.Boolean,
  labels: Schema.Array(Schema.String),
  updatedAt: Schema.DateFromSelf,
  draft: Schema.optionalWith(Schema.Boolean, { exact: true }),
  headBranch: Schema.optionalWith(Schema.String, { exact: true }),
  /** Lines added plus lines deleted. */
  changes: Schema.optionalWith(Schema.Number, { exact: true }),
  files: Schema.optionalWith(Schema.Array(Schema.String), { exact: true }),
  reviews: Schema.optionalWith(Schema.Array(Review), { exact: true }),
  pendingReviewers: Schema.optionalWith(Schema.Number, { exact: true }),
  commits: Schema.optionalWith(Schema.Array(Commit), { exact: true }),
})
/** A decoded {@link Subject}. */
export type Subject = typeof Subject.Type

/** A subject property that is loaded on demand. */
export type Facet = 'files' | 'reviews' | 'pendingReviewers' | 'commits'
