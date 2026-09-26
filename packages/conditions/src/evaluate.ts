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
 * (CODE_OF_CONDUCT.md) and the Cooperation Commitment (COOPERATION_COMMITMENT.md).
 *
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE.
 */

import { Clock, Data, Effect } from 'effect'
import picomatch from 'picomatch'
import { codeownersOf, parseCodeowners } from './codeowners.js'
import { compilePattern } from './pattern.js'
import type { AuthorAssociation, Condition, ConditionGroup, Not } from './schema.js'
import type { Association, Check, CheckState, Commit, Facet, Review, Subject } from './subject.js'
import { hasKey, parseIdentity, parseTrailers } from './trailers.js'

/**
 * A condition needed a facet (files, changed files with their status, reviews, pending or requested reviewers,
 * commits, mergeability, checks or CODEOWNERS) that was not loaded onto the subject. This is an
 * engine bug, not a user error: the engine loads every facet `requiredFacets`
 * reports.
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

// Dependency lockfiles, matched by file name in any directory.
const LOCKFILES = new Set([
  'package-lock.json',
  'npm-shrinkwrap.json',
  'pnpm-lock.yaml',
  'yarn.lock',
  'bun.lock',
  'bun.lockb',
  'deno.lock',
  'Cargo.lock',
  'go.sum',
  'Gemfile.lock',
  'composer.lock',
  'poetry.lock',
  'Pipfile.lock',
  'uv.lock',
  'pdm.lock',
  'gradle.lockfile',
  'packages.lock.json',
  'Podfile.lock',
  'Package.resolved',
  'pubspec.lock',
  'mix.lock',
  'flake.lock',
  '.terraform.lock.hcl',
])

const isLockfile = (path: string) => LOCKFILES.has(path.slice(path.lastIndexOf('/') + 1))

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
  return not.requires === undefined
    ? { condition: [...condition].filter(isCondition) }
    : { requires: not.requires, condition: [...condition].filter(isCondition) }
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

// A name can be reported more than once (by two workflows, or by both a check
// run and a commit status): the worst state wins, and an unreported check is
// pending.
const RANK: Record<CheckState, number> = { success: 0, pending: 1, failure: 2 }

const checkState = (checks: ReadonlyArray<Check>, name: string): CheckState =>
  checks
    .filter((check) => check.name === name)
    .reduce<CheckState | undefined>(
      (worst, check) => (worst === undefined || RANK[check.state] > RANK[worst] ? check.state : worst),
      undefined,
    ) ?? 'pending'

type AssociationName = (typeof AuthorAssociation.Type)['condition'][number]

// The names each GitHub association answers to: a first-timer's first
// contribution anywhere is also their first here.
const ASSOCIATION_NAMES: Record<Association, ReadonlyArray<AssociationName>> = {
  OWNER: ['owner'],
  MEMBER: ['member'],
  COLLABORATOR: ['collaborator'],
  CONTRIBUTOR: ['contributor'],
  FIRST_TIME_CONTRIBUTOR: ['firstTimeContributor'],
  FIRST_TIMER: ['firstTimer', 'firstTimeContributor'],
  MANNEQUIN: ['mannequin'],
  NONE: ['none'],
}

const associationNames = (subject: Subject): ReadonlyArray<AssociationName> => [
  ...(subject.association === undefined ? [] : ASSOCIATION_NAMES[subject.association]),
  ...(subject.bot === true ? (['bot'] as const) : []),
]

// Everyone asked to review who has not yet, and everyone who has reviewed,
// in the order GitHub lists them and each once.
const reviewersOf = (requested: ReadonlyArray<string>, reviews: ReadonlyArray<Review>): ReadonlyArray<string> => [
  ...new Set([...requested, ...reviews.map((review) => review.author)].filter((login) => login !== '')),
]

const logins = (names: ReadonlyArray<string>) => names.map((name) => `@${name}`).join(', ')

// GitHub's closing keywords, followed by an issue reference or a Linear key:
// `#12`, `owner/repo#12`, an issue URL or `SMC-55`.
const CLOSING =
  /\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?):?\s+(#\d+|[\w.-]+\/[\w.-]+#\d+|https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/issues\/\d+|[A-Za-z][A-Za-z0-9]*-\d+)(?![\w-])/gi

// A Linear key: one of the listed team keys in any case, or without a list,
// any key (in upper case only when `upper` is set), then a dash and a number.
const linearKey = (keys: ReadonlyArray<string> | undefined, upper: boolean) =>
  new RegExp(
    `(?<![A-Za-z0-9])(?:${keys === undefined ? '[A-Z][A-Z0-9]*' : keys.join('|')})-\\d+(?![A-Za-z0-9])`,
    keys === undefined && upper ? '' : 'i',
  )

// The first issue a pull request links, described for the report: a closing
// reference in the description, then a Linear key in the branch or title.
const issueLink = (subject: Subject, keys: ReadonlyArray<string> | undefined): string | undefined => {
  const key = linearKey(keys, false)
  const closes = [...subject.body.matchAll(CLOSING)]
    .map((match) => match[1] ?? '')
    .find((ref) => ref.includes('#') || ref.includes('/') || key.test(ref))
  if (closes !== undefined) return `closes ${closes}`
  const branch = key.exec(subject.headBranch ?? '')?.[0]
  if (branch !== undefined) return `Linear key ${branch} in the branch`
  const title = linearKey(keys, true).exec(subject.title)?.[0]
  return title === undefined ? undefined : `Linear key ${title} in the title`
}

const PULL_REQUEST_ONLY = new Set([
  'branchMatches',
  'baseBranchMatches',
  'isDraft',
  'filesMatch',
  'changesSize',
  'lockfileChanged',
  'fileCount',
  'binaryFilesAdded',
  'pendingReview',
  'requestedChanges',
  'isApproved',
  'commitMessagesMatch',
  'commitsSignedOff',
  'commitsVerified',
  'hasTrailer',
  'hasConflict',
  'checksPass',
  'checkStatus',
  'reviewerMatches',
  'linksIssue',
  'codeownersTouched',
])

const evaluateCondition = (condition: Condition, subject: Subject): Effect.Effect<ConditionResult, MissingFacet> => {
  if (subject.kind === 'issue' && PULL_REQUEST_ONLY.has(condition.type)) {
    return Effect.succeed(result(condition.type, false, 'only applies to pull requests'))
  }
  switch (condition.type) {
    case 'titleMatches': {
      const passed = compilePattern(condition.condition).test(subject.title)
      return Effect.succeed(
        result(condition.type, passed, `title ${passed ? 'matches' : 'does not match'} ${condition.condition}`),
      )
    }
    case 'descriptionMatches': {
      const passed = subject.body !== '' && compilePattern(condition.condition).test(subject.body)
      return Effect.succeed(
        result(condition.type, passed, `description ${passed ? 'matches' : 'does not match'} ${condition.condition}`),
      )
    }
    case 'creatorMatches': {
      const passed = compilePattern(condition.condition).test(subject.author)
      return Effect.succeed(
        result(condition.type, passed, `author @${subject.author} ${passed ? 'matches' : 'does not match'}`),
      )
    }
    case 'branchMatches': {
      const branch = subject.headBranch ?? ''
      const passed = compilePattern(condition.condition).test(branch)
      return Effect.succeed(result(condition.type, passed, `branch ${branch} ${passed ? 'matches' : 'does not match'}`))
    }
    case 'baseBranchMatches': {
      // No target branch never matches, so a pattern like ^$ or .* cannot pass on its absence.
      if (subject.baseBranch === undefined) return Effect.succeed(result(condition.type, false, 'no base branch'))
      const branch = subject.baseBranch
      const passed = compilePattern(condition.condition).test(branch)
      return Effect.succeed(
        result(condition.type, passed, `base branch ${branch} ${passed ? 'matches' : 'does not match'}`),
      )
    }
    case 'authorAssociation': {
      const names = associationNames(subject)
      const passed = names.some((name) => condition.condition.includes(name))
      const detail =
        names.length === 0
          ? `author @${subject.author}'s association is unknown`
          : `author @${subject.author} is ${names.join(', ')}`
      return Effect.succeed(result(condition.type, passed, detail))
    }
    case 'hasAssignee': {
      const assignees = subject.assignees ?? []
      const assigned = assignees.length > 0
      return Effect.succeed(
        result(
          condition.type,
          assigned === condition.condition,
          assigned ? `assigned to ${logins(assignees)}` : 'unassigned',
        ),
      )
    }
    case 'assigneeMatches': {
      const assignees = subject.assignees ?? []
      const pattern = compilePattern(condition.condition)
      const passed = assignees.some((login) => pattern.test(login))
      return Effect.succeed(
        result(
          condition.type,
          passed,
          assignees.length === 0
            ? 'unassigned'
            : `${passed ? 'an assignee matches' : 'no assignee matches'} among ${logins(assignees)}`,
        ),
      )
    }
    case 'hasMilestone': {
      const { milestone } = subject
      return Effect.succeed(
        result(
          condition.type,
          (milestone !== undefined) === condition.condition,
          milestone === undefined ? 'in no milestone' : `in milestone ${milestone}`,
        ),
      )
    }
    case 'milestoneMatches': {
      const { milestone } = subject
      const passed = milestone !== undefined && compilePattern(condition.condition).test(milestone)
      return Effect.succeed(
        result(
          condition.type,
          passed,
          milestone === undefined
            ? 'in no milestone'
            : `milestone ${milestone} ${passed ? 'matches' : 'does not match'}`,
        ),
      )
    }
    case 'linksIssue': {
      const link = issueLink(subject, condition.keys)
      return Effect.succeed(
        result(condition.type, (link !== undefined) === condition.condition, link ?? 'links no issue'),
      )
    }
    case 'isOpen':
      return Effect.succeed(
        result(condition.type, subject.open === condition.condition, subject.open ? 'open' : 'closed'),
      )
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
        result(
          condition.type,
          present === condition.condition,
          `label "${condition.label}" ${present ? 'present' : 'absent'}`,
        ),
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
        return result(
          condition.type,
          passed,
          `${passed ? 'a changed file matches' : 'no changed file matches'} ${condition.condition}`,
        )
      })
    case 'codeownersTouched':
      return Effect.gen(function* () {
        const files = yield* facet(subject, 'files', condition.type)
        const rules = parseCodeowners(yield* facet(subject, 'codeowners', condition.type))
        const owner = condition.condition.toLowerCase()
        const owned = files.filter((file) => codeownersOf(rules, file).some((each) => each.toLowerCase() === owner))
        const detail =
          rules.length === 0
            ? 'no CODEOWNERS rules'
            : owned.length === 0
              ? `no changed file owned by ${condition.condition}`
              : `${owned.length} changed file(s) owned by ${condition.condition}`
        return result(condition.type, owned.length > 0, detail)
      })
    case 'changesSize': {
      const changes = subject.changes ?? 0
      const passed = changes >= condition.min && (condition.max === undefined || changes < condition.max)
      return Effect.succeed(result(condition.type, passed, `${changes} changed line(s)`))
    }
    case 'lockfileChanged':
      return Effect.map(facet(subject, 'files', condition.type), (files) => {
        const lockfiles = files.filter(isLockfile)
        return result(
          condition.type,
          lockfiles.length > 0 === condition.condition,
          lockfiles.length === 0 ? 'no lockfile changed' : `lockfile(s) changed: ${lockfiles.join(', ')}`,
        )
      })
    case 'fileCount':
      return Effect.map(facet(subject, 'files', condition.type), (files) => {
        const count = files.length
        const passed = count >= condition.min && (condition.max === undefined || count < condition.max)
        return result(condition.type, passed, `${count} changed file(s)`)
      })
    case 'binaryFilesAdded':
      return Effect.map(facet(subject, 'changedFiles', condition.type), (files) => {
        const added = files.filter((file) => file.status === 'added' && file.binary).map((file) => file.path)
        return result(
          condition.type,
          added.length > 0 === condition.condition,
          added.length === 0 ? 'no binary file added' : `binary file(s) added: ${added.join(', ')}`,
        )
      })
    case 'pendingReview':
      return Effect.map(facet(subject, 'pendingReviewers', condition.type), (pending) =>
        result(condition.type, pending > 0 === condition.condition, `${pending} review(s) pending`),
      )
    case 'requestedChanges':
      return Effect.map(facet(subject, 'reviews', condition.type), (reviews) => {
        const requested = [...latestReviews(reviews).values()].includes('CHANGES_REQUESTED')
        return result(
          condition.type,
          requested === condition.condition,
          requested ? 'changes requested' : 'no changes requested',
        )
      })
    case 'isApproved':
      return Effect.gen(function* () {
        const reviews = yield* facet(subject, 'reviews', condition.type)
        const states = [...latestReviews(reviews).values()]
        const approvals = states.filter((state) => state === 'APPROVED').length
        const approved = !states.includes('CHANGES_REQUESTED') && approvals >= condition.condition
        // Pending reviews cannot change the outcome when they are allowed, so
        // they are not read, and a failed lookup of them skips nothing.
        if (condition.allowPending === true) return result(condition.type, approved, `${approvals} approval(s)`)
        const pending = yield* facet(subject, 'pendingReviewers', condition.type)
        return result(condition.type, approved && pending === 0, `${approvals} approval(s), ${pending} pending`)
      })
    case 'reviewerMatches':
      return Effect.gen(function* () {
        const requested = yield* facet(subject, 'requestedReviewers', condition.type)
        const reviewers = reviewersOf(requested, yield* facet(subject, 'reviews', condition.type))
        const pattern = compilePattern(condition.condition)
        const passed = reviewers.some((login) => pattern.test(login))
        return result(
          condition.type,
          passed,
          reviewers.length === 0
            ? 'no reviewers'
            : `${passed ? 'a reviewer matches' : 'no reviewer matches'} among ${logins(reviewers)}`,
        )
      })
    case 'commitMessagesMatch':
      return Effect.map(facet(subject, 'commits', condition.type), (commits) => {
        const pattern = compilePattern(condition.condition)
        const passed = scoped(condition.scope, nonMerge(commits), (commit) => matches(pattern, commit.message))
        return result(
          condition.type,
          passed,
          `commit messages ${passed ? 'match' : 'do not match'} ${condition.condition}`,
        )
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
    case 'commitsVerified':
      return Effect.map(facet(subject, 'commits', condition.type), (commits) => {
        const unverified = commits.filter((commit) => !commit.verified)
        return result(
          condition.type,
          (unverified.length === 0) === condition.condition,
          unverified.length === 0
            ? 'every commit has a verified signature'
            : `${unverified.length} commit(s) without a verified signature`,
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
    case 'hasConflict':
      return Effect.map(facet(subject, 'mergeable', condition.type), (mergeable) => {
        // GitHub computes mergeability asynchronously; until it has, treat the pull request as not conflicting.
        const conflicting = mergeable === 'CONFLICTING'
        const detail =
          mergeable === 'UNKNOWN'
            ? 'mergeability not yet known'
            : conflicting
              ? 'conflicts with the base branch'
              : 'no conflicts'
        return result(condition.type, conflicting === condition.condition, detail)
      })
    case 'checksPass':
      return Effect.map(facet(subject, 'checks', condition.type), (checks) => {
        const unfinished = condition.checks.filter((name) => checkState(checks, name) !== 'success')
        const detail =
          unfinished.length === 0 ? 'every named check succeeded' : `not succeeded: ${unfinished.join(', ')}`
        return result(condition.type, (unfinished.length === 0) === condition.condition, detail)
      })
    case 'checkStatus':
      return Effect.map(facet(subject, 'checks', condition.type), (checks) => {
        const state = checkState(checks, condition.check)
        const reported = checks.some((check) => check.name === condition.check)
        return result(
          condition.type,
          state === condition.condition,
          `${condition.check} ${reported ? state : 'has not reported'}`,
        )
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
      return {
        type,
        passed: decide(passed, inner.length),
        detail: `${passed} of ${inner.length} group(s) passed`,
        groups: inner,
      }
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
  lockfileChanged: ['files'],
  fileCount: ['files'],
  binaryFilesAdded: ['changedFiles'],
  pendingReview: ['pendingReviewers'],
  requestedChanges: ['reviews'],
  isApproved: ['reviews', 'pendingReviewers'],
  reviewerMatches: ['requestedReviewers', 'reviews'],
  commitMessagesMatch: ['commits'],
  commitsSignedOff: ['commits'],
  commitsVerified: ['commits'],
  hasTrailer: ['commits'],
  hasConflict: ['mergeable'],
  checksPass: ['checks'],
  checkStatus: ['checks'],
  codeownersTouched: ['files', 'codeowners'],
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
      const facets =
        condition.type === 'isApproved' && condition.allowPending === true
          ? ['reviews' as const]
          : FACETS[condition.type]
      for (const each of facets ?? []) needed.add(each)
      groupsOf(condition).forEach(visit)
    }
  }
  groups.forEach(visit)
  return needed
}
