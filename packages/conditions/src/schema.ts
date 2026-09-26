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
 * (CODE_OF_CONDUCT.md) and the Cooperation Commitment (COOPERATION_COMMITMENT.md).
 *
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE.
 */

import { Schema } from 'effect'
import { Pattern } from './pattern.js'
import { CheckState } from './subject.js'

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
  Schema.Struct({ type: Schema.Literal(type), condition: Schema.Boolean }).annotations({
    identifier: type,
    description,
  })

/**
 * The title matches a pattern.
 *
 * @example
 * ```ts import.meta.vitest name="TitleMatches"
 * import { TitleMatches } from '@resnovas/conditions'
 * import { Schema } from 'effect'
 *
 * Schema.is(TitleMatches)({ type: 'titleMatches', condition: '^feat' }) // => true
 * ```
 */
export const TitleMatches = matches('titleMatches', 'The title matches a pattern.')
/**
 * The description matches a pattern. An empty description never matches.
 *
 * @example
 * ```ts import.meta.vitest name="DescriptionMatches"
 * import { DescriptionMatches } from '@resnovas/conditions'
 * import { Schema } from 'effect'
 *
 * Schema.is(DescriptionMatches)({ type: 'descriptionMatches', condition: 'Fixes #\\d+' }) // => true
 * ```
 */
export const DescriptionMatches = matches('descriptionMatches', 'The description matches a pattern.')
/**
 * The author's login matches a pattern.
 *
 * @example
 * ```ts import.meta.vitest name="CreatorMatches"
 * import { CreatorMatches } from '@resnovas/conditions'
 * import { Schema } from 'effect'
 *
 * Schema.is(CreatorMatches)({ type: 'creatorMatches', condition: '/^dependabot/i' }) // => true
 * ```
 */
export const CreatorMatches = matches('creatorMatches', "The author's login matches a pattern.")
/**
 * The pull request's head branch matches a pattern.
 *
 * @example
 * ```ts import.meta.vitest name="BranchMatches"
 * import { BranchMatches } from '@resnovas/conditions'
 * import { Schema } from 'effect'
 *
 * Schema.is(BranchMatches)({ type: 'branchMatches', condition: '^feat/' }) // => true
 * ```
 */
export const BranchMatches = matches('branchMatches', "The pull request's head branch matches a pattern.")
/**
 * The pull request's base branch, the one it merges into, matches a pattern.
 *
 * @example
 * ```ts import.meta.vitest name="BaseBranchMatches"
 * import { BaseBranchMatches } from '@resnovas/conditions'
 * import { Schema } from 'effect'
 *
 * Schema.is(BaseBranchMatches)({ type: 'baseBranchMatches', condition: '^(main|release/.*)$' }) // => true
 * ```
 */
export const BaseBranchMatches = matches(
  'baseBranchMatches',
  "The pull request's base branch, the one it merges into, matches a pattern.",
)

/**
 * The author is associated with the repository in one of the listed ways, or
 * is a bot when `bot` is listed.
 *
 * @remarks
 * The associations are GitHub's `author_association`, in camel case: `owner`,
 * `member` (of the owning organisation), `collaborator` (an outside
 * collaborator), `contributor` (has a merged contribution), `firstTimeContributor`,
 * `firstTimer` (a first contribution anywhere on GitHub), `mannequin` and `none`.
 * `firstTimeContributor` also matches a first-timer, since their first
 * contribution anywhere is also their first here. `bot` matches a bot
 * account whatever its association.
 *
 * @example
 * ```ts import.meta.vitest name="AuthorAssociation"
 * import { AuthorAssociation } from '@resnovas/conditions'
 * import { Schema } from 'effect'
 *
 * Schema.is(AuthorAssociation)({ type: 'authorAssociation', condition: ['firstTimeContributor', 'bot'] }) // => true
 * Schema.is(AuthorAssociation)({ type: 'authorAssociation', condition: [] }) // => false
 * ```
 */
export const AuthorAssociation = Schema.Struct({
  type: Schema.Literal('authorAssociation'),
  condition: Schema.NonEmptyArray(
    Schema.Literal(
      'owner',
      'member',
      'collaborator',
      'contributor',
      'firstTimeContributor',
      'firstTimer',
      'mannequin',
      'none',
      'bot',
    ).annotations({
      description:
        'owner, member, collaborator (an outside collaborator), contributor, firstTimeContributor (includes first-timers), firstTimer, mannequin, none or bot.',
    }),
  ).annotations({ description: 'The associations that pass; any one is enough.' }),
}).annotations({
  identifier: 'authorAssociation',
  description:
    "The author's association with the repository is one of these, or the author is a bot when bot is listed.",
})

/**
 * Someone is assigned (true), or nobody is (false).
 *
 * @example
 * ```ts import.meta.vitest name="HasAssignee"
 * import { HasAssignee } from '@resnovas/conditions'
 * import { Schema } from 'effect'
 *
 * Schema.is(HasAssignee)({ type: 'hasAssignee', condition: false }) // => true
 * ```
 */
export const HasAssignee = flag('hasAssignee', 'Someone is assigned, or nobody is when false.')
/**
 * An assignee's login matches a pattern.
 *
 * @example
 * ```ts import.meta.vitest name="AssigneeMatches"
 * import { AssigneeMatches } from '@resnovas/conditions'
 * import { Schema } from 'effect'
 *
 * Schema.is(AssigneeMatches)({ type: 'assigneeMatches', condition: '^jane$' }) // => true
 * ```
 */
export const AssigneeMatches = matches('assigneeMatches', "An assignee's login matches a pattern.")
/**
 * A reviewer of the pull request matches a pattern: someone asked to review,
 * or someone who has reviewed.
 *
 * @remarks
 * A requested team is matched by its slug, such as `security`. Someone asked
 * to review stops being requested once they review, and is then matched as a
 * reviewer, so the condition holds either side of the review.
 *
 * @example
 * ```ts import.meta.vitest name="ReviewerMatches"
 * import { ReviewerMatches } from '@resnovas/conditions'
 * import { Schema } from 'effect'
 *
 * Schema.is(ReviewerMatches)({ type: 'reviewerMatches', condition: '^security$' }) // => true
 * ```
 */
export const ReviewerMatches = matches(
  'reviewerMatches',
  "A requested reviewer's login or team slug, or a reviewer's login, matches a pattern.",
)

/**
 * The subject is in a milestone (true), or in none (false).
 *
 * @example
 * ```ts import.meta.vitest name="HasMilestone"
 * import { HasMilestone } from '@resnovas/conditions'
 * import { Schema } from 'effect'
 *
 * Schema.is(HasMilestone)({ type: 'hasMilestone', condition: true }) // => true
 * ```
 */
export const HasMilestone = flag('hasMilestone', 'The subject is in a milestone, or in none when false.')
/**
 * The title of the subject's milestone matches a pattern.
 *
 * @remarks
 * A subject in no milestone never matches.
 *
 * @example
 * ```ts import.meta.vitest name="MilestoneMatches"
 * import { MilestoneMatches } from '@resnovas/conditions'
 * import { Schema } from 'effect'
 *
 * Schema.is(MilestoneMatches)({ type: 'milestoneMatches', condition: '^v2' }) // => true
 * ```
 */
export const MilestoneMatches = matches('milestoneMatches', "The title of the subject's milestone matches a pattern.")

/**
 * The pull request links an issue (true), or links none (false): its
 * description closes an issue, or its head branch or title carries a Linear
 * issue key.
 *
 * @remarks
 * A description closes an issue with one of GitHub's closing keywords
 * (`close`, `fix` or `resolve`, in any tense) followed by `#12`,
 * `owner/repo#12`, an issue URL or a Linear key such as `SMC-55`. A Linear key
 * is a team key, a dash and a number, matched in any case in the branch and
 * description, since Linear writes branch names in lower case. `keys` limits
 * Linear keys to the listed teams. Without it any key counts, in upper case
 * only in the title, so text such as `utf-8` in a branch also passes: list the
 * keys to rule that out.
 *
 * @example
 * ```ts import.meta.vitest name="LinksIssue"
 * import { LinksIssue } from '@resnovas/conditions'
 * import { Schema } from 'effect'
 *
 * Schema.is(LinksIssue)({ type: 'linksIssue', condition: true, keys: ['SMC'] }) // => true
 * Schema.is(LinksIssue)({ type: 'linksIssue', condition: true, keys: ['SMC-1'] }) // => false
 * ```
 */
export const LinksIssue = Schema.Struct({
  type: Schema.Literal('linksIssue'),
  condition: Schema.Boolean,
  keys: Schema.optionalWith(
    Schema.NonEmptyArray(
      Schema.String.pipe(Schema.pattern(/^[A-Za-z][A-Za-z0-9]*$/)).annotations({
        description: 'A Linear team key, such as SMC.',
      }),
    ).annotations({ description: 'The Linear team keys that count; any key when omitted.' }),
    { exact: true },
  ),
}).annotations({
  identifier: 'linksIssue',
  description:
    'The pull request closes an issue in its description, or carries a Linear key in its branch or title; links none when false.',
})

/**
 * The subject is open (true) or closed (false).
 *
 * @example
 * ```ts import.meta.vitest name="IsOpen"
 * import { IsOpen } from '@resnovas/conditions'
 * import { Schema } from 'effect'
 *
 * Schema.is(IsOpen)({ type: 'isOpen', condition: true }) // => true
 * ```
 */
export const IsOpen = flag('isOpen', 'The subject is open, or closed when false.')
/**
 * The conversation is locked.
 *
 * @example
 * ```ts import.meta.vitest name="IsLocked"
 * import { IsLocked } from '@resnovas/conditions'
 * import { Schema } from 'effect'
 *
 * Schema.is(IsLocked)({ type: 'isLocked', condition: false }) // => true
 * ```
 */
export const IsLocked = flag('isLocked', 'The conversation is locked, or unlocked when false.')
/**
 * The pull request is a draft.
 *
 * @example
 * ```ts import.meta.vitest name="IsDraft"
 * import { IsDraft } from '@resnovas/conditions'
 * import { Schema } from 'effect'
 *
 * Schema.is(IsDraft)({ type: 'isDraft', condition: true }) // => true
 * ```
 */
export const IsDraft = flag('isDraft', 'The pull request is a draft, or ready when false.')
/**
 * The pull request has reviewers who have not yet reviewed.
 *
 * @example
 * ```ts import.meta.vitest name="PendingReview"
 * import { PendingReview } from '@resnovas/conditions'
 * import { Schema } from 'effect'
 *
 * Schema.is(PendingReview)({ type: 'pendingReview', condition: true }) // => true
 * ```
 */
export const PendingReview = flag('pendingReview', 'Requested reviewers have not reviewed yet.')
/**
 * A reviewer's latest review requests changes.
 *
 * @example
 * ```ts import.meta.vitest name="RequestedChanges"
 * import { RequestedChanges } from '@resnovas/conditions'
 * import { Schema } from 'effect'
 *
 * Schema.is(RequestedChanges)({ type: 'requestedChanges', condition: false }) // => true
 * ```
 */
export const RequestedChanges = flag('requestedChanges', "A reviewer's latest review requests changes.")
/**
 * Every non-merge commit is signed off by its author (DCO).
 *
 * @example
 * ```ts import.meta.vitest name="CommitsSignedOff"
 * import { CommitsSignedOff } from '@resnovas/conditions'
 * import { Schema } from 'effect'
 *
 * Schema.is(CommitsSignedOff)({ type: 'commitsSignedOff', condition: true }) // => true
 * ```
 */
export const CommitsSignedOff = flag(
  'commitsSignedOff',
  'Every non-merge commit has a Signed-off-by trailer matching its author email.',
)

/**
 * The pull request conflicts (or, when false, does not conflict) with its
 * base branch.
 *
 * @remarks
 * GitHub computes mergeability asynchronously. While it is still unknown, the
 * pull request is treated as not conflicting.
 *
 * @example
 * ```ts import.meta.vitest name="HasConflict"
 * import { HasConflict } from '@resnovas/conditions'
 * import { Schema } from 'effect'
 *
 * Schema.is(HasConflict)({ type: 'hasConflict', condition: true }) // => true
 * ```
 */
export const HasConflict = flag(
  'hasConflict',
  'The pull request conflicts with its base branch, or does not when false. Unknown mergeability counts as not conflicting.',
)

const CheckName = Schema.NonEmptyString.annotations({
  description: 'A check run name or commit status context, matched exactly.',
})

/**
 * Every named CI check on the pull request's head commit succeeded (or, when
 * false, at least one has not).
 *
 * @remarks
 * Names are matched exactly against check run names and commit status
 * contexts. A named check that has not reported yet does not pass, and when a
 * name is reported more than once, a failure outranks a pending run, which
 * outranks a success.
 *
 * @example
 * ```ts import.meta.vitest name="ChecksPass"
 * import { ChecksPass } from '@resnovas/conditions'
 * import { Schema } from 'effect'
 *
 * Schema.is(ChecksPass)({ type: 'checksPass', checks: ['build', 'test'], condition: true }) // => true
 * ```
 */
export const ChecksPass = Schema.Struct({
  type: Schema.Literal('checksPass'),
  checks: Schema.NonEmptyArray(CheckName).annotations({
    description: 'Check run names or commit status contexts, matched exactly.',
  }),
  condition: Schema.Boolean,
}).annotations({
  identifier: 'checksPass',
  description:
    'Every named check succeeded, or at least one has not when false. A check that has not reported yet has not succeeded.',
})

/**
 * A named CI check on the pull request's head commit is in a state:
 * `success`, `failure` or `pending`.
 *
 * @remarks
 * A check that has not reported yet counts as `pending`. When the name is
 * reported more than once, a failure outranks a pending run, which outranks
 * a success.
 *
 * @example
 * ```ts import.meta.vitest name="CheckStatus"
 * import { CheckStatus } from '@resnovas/conditions'
 * import { Schema } from 'effect'
 *
 * Schema.is(CheckStatus)({ type: 'checkStatus', check: 'test', condition: 'failure' }) // => true
 * ```
 */
export const CheckStatus = Schema.Struct({
  type: Schema.Literal('checkStatus'),
  check: CheckName,
  condition: CheckState.annotations({
    description: 'success, failure or pending; a check that has not reported yet is pending.',
  }),
}).annotations({
  identifier: 'checkStatus',
  description: 'The named check is in this state. A check that has not reported yet is pending.',
})

/**
 * The subject has (or, when false, lacks) a label.
 *
 * @example
 * ```ts import.meta.vitest name="HasLabel"
 * import { HasLabel } from '@resnovas/conditions'
 * import { Schema } from 'effect'
 *
 * Schema.is(HasLabel)({ type: 'hasLabel', label: 'bug', condition: true }) // => true
 * ```
 */
export const HasLabel = Schema.Struct({
  type: Schema.Literal('hasLabel'),
  label: Schema.String,
  condition: Schema.Boolean,
}).annotations({ identifier: 'hasLabel', description: 'The subject has the label, or lacks it when false.' })

/**
 * No activity for at least this many days.
 *
 * @example
 * ```ts import.meta.vitest name="IsStale"
 * import { IsStale } from '@resnovas/conditions'
 * import { Schema } from 'effect'
 *
 * Schema.is(IsStale)({ type: 'isStale', condition: 30 }) // => true
 * ```
 */
export const IsStale = Schema.Struct({ type: Schema.Literal('isStale'), condition: Days }).annotations({
  identifier: 'isStale',
  description: 'No activity for at least this many days.',
})

/**
 * Already labelled stale, and no activity for at least this many more days.
 *
 * @example
 * ```ts import.meta.vitest name="IsAbandoned"
 * import { IsAbandoned } from '@resnovas/conditions'
 * import { Schema } from 'effect'
 *
 * Schema.is(IsAbandoned)({ type: 'isAbandoned', condition: 14, label: 'stale' }) // => true
 * ```
 */
export const IsAbandoned = Schema.Struct({
  type: Schema.Literal('isAbandoned'),
  condition: Days,
  label: Schema.String,
}).annotations({
  identifier: 'isAbandoned',
  description: 'Carries the stale label and has had no activity for at least this many days.',
})

/**
 * At least one changed file matches a glob.
 *
 * @example
 * ```ts import.meta.vitest name="FilesMatch"
 * import { FilesMatch } from '@resnovas/conditions'
 * import { Schema } from 'effect'
 *
 * Schema.is(FilesMatch)({ type: 'filesMatch', condition: 'src/**' }) // => true
 * ```
 */
export const FilesMatch = Schema.Struct({ type: Schema.Literal('filesMatch'), condition: Schema.String }).annotations({
  identifier: 'filesMatch',
  description: 'At least one changed file matches a glob.',
})

/**
 * Lines added plus deleted fall in `[min, max)`.
 *
 * @example
 * ```ts import.meta.vitest name="ChangesSize"
 * import { ChangesSize } from '@resnovas/conditions'
 * import { Schema } from 'effect'
 *
 * Schema.is(ChangesSize)({ type: 'changesSize', min: 0, max: 100 }) // => true
 * ```
 */
export const ChangesSize = Schema.Struct({
  type: Schema.Literal('changesSize'),
  min: Count,
  max: Schema.optionalWith(Count, { exact: true }),
}).annotations({ identifier: 'changesSize', description: 'Lines added plus deleted are at least min and below max.' })

/**
 * No reviewer is requesting changes, at least `condition` approved, and none
 * are pending unless `allowPending` is set.
 *
 * @remarks
 * `allowPending` defaults to `false`, so a condition without it keeps its v1
 * meaning: every requested reviewer must have reviewed first.
 *
 * @example
 * ```ts import.meta.vitest name="IsApproved"
 * import { IsApproved } from '@resnovas/conditions'
 * import { Schema } from 'effect'
 *
 * Schema.is(IsApproved)({ type: 'isApproved', condition: 2, allowPending: true }) // => true
 * ```
 */
export const IsApproved = Schema.Struct({
  type: Schema.Literal('isApproved'),
  condition: Count,
  allowPending: Schema.optionalWith(
    Schema.Boolean.annotations({
      description: 'Count approvals while other requested reviewers are still pending (default false).',
    }),
    { exact: true },
  ),
}).annotations({
  identifier: 'isApproved',
  description:
    'No reviewer is requesting changes, at least this many approved, and none are pending unless allowPending is set.',
})

/**
 * Commit messages match a pattern.
 *
 * @example
 * ```ts import.meta.vitest name="CommitMessagesMatch"
 * import { CommitMessagesMatch } from '@resnovas/conditions'
 * import { Schema } from 'effect'
 *
 * Schema.is(CommitMessagesMatch)({ type: 'commitMessagesMatch', condition: '^feat', scope: 'any' }) // => true
 * ```
 */
export const CommitMessagesMatch = Schema.Struct({
  type: Schema.Literal('commitMessagesMatch'),
  condition: Pattern,
  scope: Schema.optionalWith(Scope, { exact: true }),
}).annotations({ identifier: 'commitMessagesMatch', description: 'Commit messages match a pattern.' })

/**
 * Commits carry a trailer, optionally with a value matching a pattern.
 *
 * @example
 * ```ts import.meta.vitest name="HasTrailer"
 * import { HasTrailer } from '@resnovas/conditions'
 * import { Schema } from 'effect'
 *
 * Schema.is(HasTrailer)({ type: 'hasTrailer', trailer: 'Signed-off-by', scope: 'all' }) // => true
 * ```
 */
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
  BaseBranchMatches,
  AuthorAssociation,
  HasAssignee,
  AssigneeMatches,
  HasMilestone,
  MilestoneMatches,
  LinksIssue,
  IsOpen,
  IsLocked,
  IsDraft,
  PendingReview,
  RequestedChanges,
  ReviewerMatches,
  CommitsSignedOff,
  HasConflict,
  ChecksPass,
  CheckStatus,
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

/**
 * A list of conditions and how many must pass.
 *
 * @example
 * ```ts import.meta.vitest name="ConditionGroup"
 * import { ConditionGroup } from '@resnovas/conditions'
 * import { Schema } from 'effect'
 *
 * Schema.is(ConditionGroup)({ requires: 1, condition: [{ type: 'isDraft', condition: true }] }) // => true
 * ```
 */
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

/**
 * Any condition, including the combinators.
 *
 * @example
 * ```ts import.meta.vitest name="Condition"
 * import { Condition } from '@resnovas/conditions'
 * import { Schema } from 'effect'
 *
 * Schema.is(Condition)({ type: '$not', condition: { condition: [{ type: 'isDraft', condition: true }] } }) // => true
 * ```
 */
export const Condition: Schema.Schema<Condition> = Schema.Union(Leaf, AndSchema, OrSchema, NotSchema, OnlySchema)
