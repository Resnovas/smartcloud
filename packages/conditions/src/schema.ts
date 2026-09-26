/**
 * @file packages/conditions/src/schema.ts
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
import { Pattern } from './pattern.js'

// Field names follow v1 exactly (`type`, `condition`, `requires`, `label`,
// `min`, `max`), so every v1 condition decodes and evaluates unchanged.

const Days = Schema.NonNegative.annotations({ description: 'A number of days.' })
const Count = Schema.NonNegativeInt
const Scope = Schema.Literal('all', 'any').annotations({
  description: 'Whether every commit (all) or at least one commit (any) must match.',
})

const matches = <T extends string>(type: T, description: string) =>
  Schema.Struct({ type: Schema.Literal(type), condition: Pattern }).annotations({ identifier: type, description })

const flag = <T extends string>(type: T, description: string) =>
  Schema.Struct({ type: Schema.Literal(type), condition: Schema.Boolean }).annotations({ identifier: type, description })

/** The title matches a pattern. */
export const TitleMatches = matches('titleMatches', 'The title matches a pattern.')
/** The description matches a pattern. An empty description never matches. */
export const DescriptionMatches = matches('descriptionMatches', 'The description matches a pattern.')
/** The author's login matches a pattern. */
export const CreatorMatches = matches('creatorMatches', "The author's login matches a pattern.")
/** The pull request's head branch matches a pattern. */
export const BranchMatches = matches('branchMatches', "The pull request's head branch matches a pattern.")

/** The subject is open (true) or closed (false). */
export const IsOpen = flag('isOpen', 'The subject is open, or closed when false.')
/** The conversation is locked. */
export const IsLocked = flag('isLocked', 'The conversation is locked, or unlocked when false.')
/** The pull request is a draft. */
export const IsDraft = flag('isDraft', 'The pull request is a draft, or ready when false.')
/** The pull request has reviewers who have not yet reviewed. */
export const PendingReview = flag('pendingReview', 'Requested reviewers have not reviewed yet.')
/** A reviewer's latest review requests changes. */
export const RequestedChanges = flag('requestedChanges', "A reviewer's latest review requests changes.")
/** Every non-merge commit is signed off by its author (DCO). */
export const CommitsSignedOff = flag(
  'commitsSignedOff',
  'Every non-merge commit has a Signed-off-by trailer matching its author email.',
)

/** The subject has (or, when false, lacks) a label. */
export const HasLabel = Schema.Struct({
  type: Schema.Literal('hasLabel'),
  label: Schema.String,
  condition: Schema.Boolean,
}).annotations({ identifier: 'hasLabel', description: 'The subject has the label, or lacks it when false.' })

/** No activity for at least this many days. */
export const IsStale = Schema.Struct({ type: Schema.Literal('isStale'), condition: Days }).annotations({
  identifier: 'isStale',
  description: 'No activity for at least this many days.',
})

/** Already labelled stale, and no activity for at least this many more days. */
export const IsAbandoned = Schema.Struct({
  type: Schema.Literal('isAbandoned'),
  condition: Days,
  label: Schema.String,
}).annotations({
  identifier: 'isAbandoned',
  description: 'Carries the stale label and has had no activity for at least this many days.',
})

/** At least one changed file matches a glob. */
export const FilesMatch = Schema.Struct({ type: Schema.Literal('filesMatch'), condition: Schema.String }).annotations({
  identifier: 'filesMatch',
  description: 'At least one changed file matches a glob.',
})

/** Lines added plus deleted fall in `[min, max)`. */
export const ChangesSize = Schema.Struct({
  type: Schema.Literal('changesSize'),
  min: Count,
  max: Schema.optionalWith(Count, { exact: true }),
}).annotations({ identifier: 'changesSize', description: 'Lines added plus deleted are at least min and below max.' })

/** Every reviewer approved, none are pending, and at least `condition` approved. */
export const IsApproved = Schema.Struct({ type: Schema.Literal('isApproved'), condition: Count }).annotations({
  identifier: 'isApproved',
  description: 'No reviewer is pending or requesting changes, and at least this many approved.',
})

/** Commit messages match a pattern. */
export const CommitMessagesMatch = Schema.Struct({
  type: Schema.Literal('commitMessagesMatch'),
  condition: Pattern,
  scope: Schema.optionalWith(Scope, { exact: true }),
}).annotations({ identifier: 'commitMessagesMatch', description: 'Commit messages match a pattern.' })

/** Commits carry a trailer, optionally with a value matching a pattern. */
export const HasTrailer = Schema.Struct({
  type: Schema.Literal('hasTrailer'),
  trailer: Schema.String,
  condition: Schema.optionalWith(Pattern, { exact: true }),
  scope: Schema.optionalWith(Scope, { exact: true }),
}).annotations({
  identifier: 'hasTrailer',
  description: 'Commits carry the trailer, with a value matching the pattern when one is given.',
})

const Leaf = Schema.Union(
  TitleMatches,
  DescriptionMatches,
  CreatorMatches,
  BranchMatches,
  IsOpen,
  IsLocked,
  IsDraft,
  PendingReview,
  RequestedChanges,
  CommitsSignedOff,
  HasLabel,
  IsStale,
  IsAbandoned,
  FilesMatch,
  ChangesSize,
  IsApproved,
  CommitMessagesMatch,
  HasTrailer,
)
/** Any condition that does not contain other conditions. */
export type LeafCondition = typeof Leaf.Type

/**
 * A list of conditions and how many must pass.
 *
 * @remarks
 * `requires` defaults to the number of conditions, meaning all must pass. v1
 * always wrote it explicitly, and those configs evaluate the same.
 */
export interface ConditionGroup {
  readonly requires?: number
  readonly condition: ReadonlyArray<Condition>
}

/** Every group passes. */
export interface And {
  readonly type: '$and'
  readonly condition: ReadonlyArray<ConditionGroup>
}

/** At least one group passes. */
export interface Or {
  readonly type: '$or'
  readonly condition: ReadonlyArray<ConditionGroup>
}

/**
 * The group fails. v1 configs wrote the group three ways: on its own, as a
 * one-item list, or inline, with `requires` on the `$not` and a list of
 * conditions as `condition`.
 */
export interface Not {
  readonly type: '$not'
  readonly requires?: number
  readonly condition: ConditionGroup | readonly [ConditionGroup] | ReadonlyArray<Condition>
}

/** Exactly `requires` of the groups pass. */
export interface Only {
  readonly type: '$only'
  readonly requires: number
  readonly condition: ReadonlyArray<ConditionGroup>
}

/** Any condition, including the combinators. */
export type Condition = LeafCondition | And | Or | Not | Only

// Recursive references carry identifiers so the JSON Schema can name them.
const LazyCondition = Schema.suspend((): Schema.Schema<Condition> => Condition).annotations({ identifier: 'Condition' })

/** A list of conditions and how many must pass. */
export const ConditionGroup: Schema.Schema<ConditionGroup> = Schema.Struct({
  requires: Schema.optionalWith(Count, { exact: true }),
  condition: Schema.Array(LazyCondition),
}).annotations({ identifier: 'ConditionGroup' })

const LazyGroup = Schema.suspend((): Schema.Schema<ConditionGroup> => ConditionGroup).annotations({
  identifier: 'ConditionGroup',
})

const AndSchema: Schema.Schema<And> = Schema.Struct({
  type: Schema.Literal('$and'),
  condition: Schema.Array(LazyGroup),
}).annotations({ identifier: '$and', description: 'Every group passes.' })

const OrSchema: Schema.Schema<Or> = Schema.Struct({
  type: Schema.Literal('$or'),
  condition: Schema.Array(LazyGroup),
}).annotations({ identifier: '$or', description: 'At least one group passes.' })

const NotSchema: Schema.Schema<Not> = Schema.Struct({
  type: Schema.Literal('$not'),
  requires: Schema.optionalWith(Count, { exact: true }),
  condition: Schema.Union(LazyGroup, Schema.Tuple(LazyGroup), Schema.Array(LazyCondition)),
}).annotations({ identifier: '$not', description: 'The group fails.' })

const OnlySchema: Schema.Schema<Only> = Schema.Struct({
  type: Schema.Literal('$only'),
  requires: Count,
  condition: Schema.Array(LazyGroup),
}).annotations({ identifier: '$only', description: 'Exactly this many of the groups pass.' })

/** Any condition, including the combinators. */
export const Condition: Schema.Schema<Condition> = Schema.Union(Leaf, AndSchema, OrSchema, NotSchema, OnlySchema)
