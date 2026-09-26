/**
 * @file packages/conditions/src/evaluate.ts
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

import { Clock, Data, Effect } from 'effect'
import picomatch from 'picomatch'
import { compilePattern } from './pattern.js'
import type { Condition, ConditionGroup, Not } from './schema.js'
import type { Commit, Facet, Review, Subject } from './subject.js'
import { hasKey, parseIdentity, parseTrailers } from './trailers.js'

/**
 * A condition needed a facet (files, reviews, pending reviewers or commits)
 * that was not loaded onto the subject. This is an engine bug, not a user
 * error: the engine loads every facet `requiredFacets` reports.
 *
 * @example
 * ```ts import.meta.vitest name="MissingFacet"
 * import { MissingFacet } from '@resnovas/conditions'
 *
 * new MissingFacet({ facet: 'files', condition: 'filesMatch' })._tag // => 'MissingFacet'
 * ```
 */
export class MissingFacet extends Data.TaggedError('MissingFacet')<{
  readonly facet: Facet
  readonly condition: string
}> {}

/** The outcome of one condition, with a line explaining it for reports. */
export interface ConditionResult {
  readonly type: string
  readonly passed: boolean
  readonly detail: string
  /** The nested evaluations of a combinator. */
  readonly groups?: ReadonlyArray<Evaluation>
}

/** The outcome of a condition group. */
export interface Evaluation {
  readonly passed: boolean
  readonly matched: number
  readonly required: number
  readonly results: ReadonlyArray<ConditionResult>
}

const DAY = 86_400_000

const result = (type: string, passed: boolean, detail: string): ConditionResult => ({ type, passed, detail })

const facet = <K extends Facet>(subject: Subject, key: K, condition: string) => {
  const value = subject[key]
  return value === undefined ? Effect.fail(new MissingFacet({ facet: key, condition })) : Effect.succeed(value)
}

// The latest decisive review per reviewer: comments and pending reviews do
// not change an earlier approval or change request.
const latestReviews = (reviews: ReadonlyArray<Review>): ReadonlyMap<string, Review['state']> => {
  const latest = new Map<string, Review['state']>()
  for (const review of reviews) {
    if (review.state === 'COMMENTED' || review.state === 'PENDING') continue
    latest.set(review.author.toLowerCase(), review.state)
  }
  return latest
}

// v1 wrote a $not group on its own, as a one-item list, or inline: a list of
// conditions with `requires` on the $not itself.
const notGroup = (not: Not): ConditionGroup => {
  const { condition } = not
  if (!isList(condition)) return condition
  const [first] = condition
  if (first !== undefined && !isCondition(first)) return first
  return not.requires === undefined ? { condition: [...condition].filter(isCondition) } : { requires: not.requires, condition: [...condition].filter(isCondition) }
}

const isList = (condition: Not['condition']): condition is readonly [ConditionGroup] | ReadonlyArray<Condition> =>
  Array.isArray(condition)

const isCondition = (entry: ConditionGroup | Condition): entry is Condition => 'type' in entry

const nonMerge = (commits: ReadonlyArray<Commit>) => commits.filter((commit) => commit.parents <= 1)

const signedOff = (commit: Commit) =>
  parseTrailers(commit.message).some(
    (trailer) =>
      hasKey(trailer, 'signed-off-by') && parseIdentity(trailer.value)?.email === commit.authorEmail.toLowerCase(),
  )

// One compiled pattern is tested against many commits or trailer values. A
// global or sticky pattern moves lastIndex after a hit, so every value must
// start again from the beginning or later matches would be missed.
const matches = (pattern: RegExp, value: string) => {
  pattern.lastIndex = 0
  return pattern.test(value)
}

const scoped = (scope: 'all' | 'any' | undefined, commits: ReadonlyArray<Commit>, test: (commit: Commit) => boolean) =>
  scope === 'any' ? commits.some(test) : commits.every(test)

const ageInDays = (subject: Subject) =>
  Effect.map(Clock.currentTimeMillis, (now) => (now - subject.updatedAt.getTime()) / DAY)

const hasLabel = (subject: Subject, label: string) =>
  subject.labels.some((name) => name.toLowerCase() === label.toLowerCase())

const PULL_REQUEST_ONLY = new Set([
  'branchMatches',
  'isDraft',
  'filesMatch',
  'changesSize',
  'pendingReview',
  'requestedChanges',
  'isApproved',
  'commitMessagesMatch',
  'commitsSignedOff',
  'hasTrailer',
])

const evaluateCondition = (condition: Condition, subject: Subject): Effect.Effect<ConditionResult, MissingFacet> => {
  if (subject.kind === 'issue' && PULL_REQUEST_ONLY.has(condition.type)) {
    return Effect.succeed(result(condition.type, false, 'only applies to pull requests'))
  }
  switch (condition.type) {
    case 'titleMatches': {
      const passed = compilePattern(condition.condition).test(subject.title)
      return Effect.succeed(result(condition.type, passed, `title ${passed ? 'matches' : 'does not match'} ${condition.condition}`))
    }
    case 'descriptionMatches': {
      const passed = subject.body !== '' && compilePattern(condition.condition).test(subject.body)
      return Effect.succeed(
        result(condition.type, passed, `description ${passed ? 'matches' : 'does not match'} ${condition.condition}`),
      )
    }
    case 'creatorMatches': {
      const passed = compilePattern(condition.condition).test(subject.author)
      return Effect.succeed(result(condition.type, passed, `author @${subject.author} ${passed ? 'matches' : 'does not match'}`))
    }
    case 'branchMatches': {
      const branch = subject.headBranch ?? ''
      const passed = compilePattern(condition.condition).test(branch)
      return Effect.succeed(result(condition.type, passed, `branch ${branch} ${passed ? 'matches' : 'does not match'}`))
    }
    case 'isOpen':
      return Effect.succeed(result(condition.type, subject.open === condition.condition, subject.open ? 'open' : 'closed'))
    case 'isLocked':
      return Effect.succeed(
        result(condition.type, subject.locked === condition.condition, subject.locked ? 'locked' : 'unlocked'),
      )
    case 'isDraft': {
      const draft = subject.draft ?? false
      return Effect.succeed(result(condition.type, draft === condition.condition, draft ? 'draft' : 'ready for review'))
    }
    case 'hasLabel': {
      const present = hasLabel(subject, condition.label)
      return Effect.succeed(
        result(condition.type, present === condition.condition, `label "${condition.label}" ${present ? 'present' : 'absent'}`),
      )
    }
    case 'isStale':
      return Effect.map(ageInDays(subject), (days) =>
        result(condition.type, days >= condition.condition, `${Math.floor(days)} day(s) since the last activity`),
      )
    case 'isAbandoned':
      return Effect.map(ageInDays(subject), (days) => {
        const labelled = hasLabel(subject, condition.label)
        return result(
          condition.type,
          labelled && days >= condition.condition,
          labelled ? `${Math.floor(days)} day(s) since the last activity` : `not labelled "${condition.label}"`,
        )
      })
    case 'filesMatch':
      return Effect.map(facet(subject, 'files', condition.type), (files) => {
        const isMatch = picomatch(condition.condition)
        const passed = files.some((file) => isMatch(file))
        return result(condition.type, passed, `${passed ? 'a changed file matches' : 'no changed file matches'} ${condition.condition}`)
      })
    case 'changesSize': {
      const changes = subject.changes ?? 0
      const passed = changes >= condition.min && (condition.max === undefined || changes < condition.max)
      return Effect.succeed(result(condition.type, passed, `${changes} changed line(s)`))
    }
    case 'pendingReview':
      return Effect.map(facet(subject, 'pendingReviewers', condition.type), (pending) =>
        result(condition.type, pending > 0 === condition.condition, `${pending} review(s) pending`),
      )
    case 'requestedChanges':
      return Effect.map(facet(subject, 'reviews', condition.type), (reviews) => {
        const requested = [...latestReviews(reviews).values()].includes('CHANGES_REQUESTED')
        return result(condition.type, requested === condition.condition, requested ? 'changes requested' : 'no changes requested')
      })
    case 'isApproved':
      return Effect.gen(function* () {
        const reviews = yield* facet(subject, 'reviews', condition.type)
        const pending = yield* facet(subject, 'pendingReviewers', condition.type)
        const states = [...latestReviews(reviews).values()]
        const approvals = states.filter((state) => state === 'APPROVED').length
        const passed = pending === 0 && !states.includes('CHANGES_REQUESTED') && approvals >= condition.condition
        return result(condition.type, passed, `${approvals} approval(s), ${pending} pending`)
      })
    case 'commitMessagesMatch':
      return Effect.map(facet(subject, 'commits', condition.type), (commits) => {
        const pattern = compilePattern(condition.condition)
        const passed = scoped(condition.scope, nonMerge(commits), (commit) => matches(pattern, commit.message))
        return result(condition.type, passed, `commit messages ${passed ? 'match' : 'do not match'} ${condition.condition}`)
      })
    case 'commitsSignedOff':
      return Effect.map(facet(subject, 'commits', condition.type), (commits) => {
        const unsigned = nonMerge(commits).filter((commit) => !signedOff(commit))
        return result(
          condition.type,
          (unsigned.length === 0) === condition.condition,
          unsigned.length === 0 ? 'every commit signed off' : `${unsigned.length} commit(s) not signed off`,
        )
      })
    case 'hasTrailer':
      return Effect.map(facet(subject, 'commits', condition.type), (commits) => {
        const value = condition.condition === undefined ? undefined : compilePattern(condition.condition)
        const carries = (commit: Commit) =>
          parseTrailers(commit.message).some(
            (trailer) => hasKey(trailer, condition.trailer) && (value === undefined || matches(value, trailer.value)),
          )
        const passed = scoped(condition.scope, nonMerge(commits), carries)
        return result(condition.type, passed, `${condition.trailer} trailer ${passed ? 'present' : 'missing'}`)
      })
    case '$and':
      return combine(condition.type, condition.condition, subject, (passed, total) => passed === total)
    case '$or':
      return combine(condition.type, condition.condition, subject, (passed) => passed > 0)
    case '$only':
      return combine(condition.type, condition.condition, subject, (passed) => passed === condition.requires)
    case '$not': {
      return Effect.map(evaluate(notGroup(condition), subject), (inner) => ({
        type: condition.type,
        passed: !inner.passed,
        detail: inner.passed ? 'the group passed' : 'the group failed',
        groups: [inner],
      }))
    }
  }
}

const combine = (
  type: string,
  groups: ReadonlyArray<ConditionGroup>,
  subject: Subject,
  decide: (passed: number, total: number) => boolean,
) =>
  Effect.map(
    Effect.forEach(groups, (group) => evaluate(group, subject)),
    (inner): ConditionResult => {
      const passed = inner.filter((evaluation) => evaluation.passed).length
      return { type, passed: decide(passed, inner.length), detail: `${passed} of ${inner.length} group(s) passed`, groups: inner }
    },
  )

/**
 * Evaluates a condition group against a subject.
 *
 * @remarks
 * A group passes when at least `requires` of its conditions pass; `requires`
 * defaults to all of them. Time-based conditions read Effect's `Clock`, so
 * tests control them with `TestClock`.
 *
 * @example
 * ```ts import.meta.vitest name="evaluate"
 * import { evaluate, type Subject } from '@resnovas/conditions'
 * import { Effect } from 'effect'
 *
 * const issue: Subject = { kind: 'issue', number: 3, title: 'feat: x', body: '', author: 'sam', open: true, locked: false, labels: [], updatedAt: new Date(0) }
 * const group = { condition: [{ type: 'isOpen', condition: true }, { type: 'titleMatches', condition: '^feat' }] } as const
 * Effect.runSync(evaluate(group, issue)).passed // => true
 * ```
 *
 * @param group - The conditions and how many must pass.
 * @param subject - The issue or pull request to test.
 * @returns The evaluation, with a result and explanation for every condition.
 */
export const evaluate = (group: ConditionGroup, subject: Subject): Effect.Effect<Evaluation, MissingFacet> =>
  Effect.map(
    Effect.forEach(group.condition, (condition) => evaluateCondition(condition, subject)),
    (results) => {
      const matched = results.filter((entry) => entry.passed).length
      const required = group.requires ?? group.condition.length
      return { passed: matched >= required, matched, required, results }
    },
  )

const FACETS: Partial<Record<Condition['type'], ReadonlyArray<Facet>>> = {
  filesMatch: ['files'],
  pendingReview: ['pendingReviewers'],
  requestedChanges: ['reviews'],
  isApproved: ['reviews', 'pendingReviewers'],
  commitMessagesMatch: ['commits'],
  commitsSignedOff: ['commits'],
  hasTrailer: ['commits'],
}

const groupsOf = (condition: Condition): ReadonlyArray<ConditionGroup> => {
  switch (condition.type) {
    case '$and':
    case '$or':
    case '$only':
      return condition.condition
    case '$not':
      return [notGroup(condition)]
    default:
      return []
  }
}

/**
 * The facets a set of condition groups needs loaded on the subject.
 *
 * @example
 * ```ts import.meta.vitest name="requiredFacets"
 * import { requiredFacets } from '@resnovas/conditions'
 *
 * requiredFacets([{ condition: [{ type: 'filesMatch', condition: 'docs/**' }] }]).has('files') // => true
 * ```
 *
 * @param groups - Every condition group that will be evaluated.
 * @returns The facets to load, each at most once.
 */
export const requiredFacets = (groups: ReadonlyArray<ConditionGroup>): ReadonlySet<Facet> => {
  const needed = new Set<Facet>()
  const visit = (group: ConditionGroup): void => {
    for (const condition of group.condition) {
      for (const each of FACETS[condition.type] ?? []) needed.add(each)
      groupsOf(condition).forEach(visit)
    }
  }
  groups.forEach(visit)
  return needed
}
