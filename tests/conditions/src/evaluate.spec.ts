/**
 * @file tests/conditions/src/evaluate.spec.ts
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

import { describe, expect, it } from '@effect/vitest'
import { Effect, Exit, TestClock } from 'effect'
import { evaluate, MissingFacet, requiredFacets, type Condition, type Subject } from '@resnovas/conditions'
import { commit, issue, pullRequest } from './fixtures.js'

const passes = (condition: Condition, subject: Subject) =>
  Effect.map(evaluate({ condition: [condition] }, subject), (evaluation) => evaluation.passed)

const signed = 'Signed-off-by: Jane Doe <jane@example.com>'
const approved = (author: string) => ({ author, state: 'APPROVED' as const })
const green = (name: string) => ({ name, state: 'success' as const })
const red = (name: string) => ({ name, state: 'failure' as const })
const running = (name: string) => ({ name, state: 'pending' as const })

// [name, condition, subject, expected]
// Subjects without an optional field, which is how a decoded event leaves it out.
const { headBranch: _headBranch, ...withoutBranch } = pullRequest()
const { baseBranch: _baseBranch, ...withoutBase } = pullRequest()
const { association: _association, bot: _bot, ...withoutAssociation } = pullRequest()
const { assignees: _assignees, ...withoutAssignees } = pullRequest()
const { draft: _draft, ...withoutDraft } = pullRequest()
const { changes: _changes, ...withoutChanges } = pullRequest()
const { reviews: _reviews, ...withoutReviews } = pullRequest()
const { pendingReviewers: _pending, ...withoutPending } = pullRequest({ reviews: [approved('ann')] })

const cases: ReadonlyArray<readonly [string, Condition, Subject, boolean]> = [
  ['titleMatches, bare pattern', { type: 'titleMatches', condition: '^feat' }, pullRequest(), true],
  ['titleMatches, delimited with flags', { type: 'titleMatches', condition: '/^FEAT/i' }, pullRequest(), true],
  ['titleMatches, no match', { type: 'titleMatches', condition: '^fix' }, pullRequest(), false],
  ['descriptionMatches', { type: 'descriptionMatches', condition: 'label' }, pullRequest(), true],
  ['descriptionMatches, empty body never matches', { type: 'descriptionMatches', condition: '.*' }, issue(), false],
  ['creatorMatches', { type: 'creatorMatches', condition: '^jane$' }, pullRequest(), true],
  ['creatorMatches, other author', { type: 'creatorMatches', condition: '^bot' }, pullRequest(), false],
  ['branchMatches', { type: 'branchMatches', condition: '^feat/' }, pullRequest(), true],
  ['branchMatches, missing branch', { type: 'branchMatches', condition: '^feat/' }, withoutBranch, false],
  ['baseBranchMatches', { type: 'baseBranchMatches', condition: '^main$' }, pullRequest(), true],
  ['baseBranchMatches, other base', { type: 'baseBranchMatches', condition: '^release/' }, pullRequest(), false],
  ['baseBranchMatches, missing base', { type: 'baseBranchMatches', condition: '.*' }, withoutBase, false],
  ['baseBranchMatches, missing base, anchored', { type: 'baseBranchMatches', condition: '^main$' }, withoutBase, false],
  ['baseBranchMatches, on an issue', { type: 'baseBranchMatches', condition: '.*' }, issue(), false],
  ['authorAssociation', { type: 'authorAssociation', condition: ['contributor'] }, pullRequest(), true],
  [
    'authorAssociation, other association',
    { type: 'authorAssociation', condition: ['member', 'owner'] },
    pullRequest(),
    false,
  ],
  [
    'authorAssociation, first-timer is a first-time contributor',
    { type: 'authorAssociation', condition: ['firstTimeContributor'] },
    pullRequest({ association: 'FIRST_TIMER' }),
    true,
  ],
  [
    'authorAssociation, first-time contributor is not a first-timer',
    { type: 'authorAssociation', condition: ['firstTimer'] },
    pullRequest({ association: 'FIRST_TIME_CONTRIBUTOR' }),
    false,
  ],
  [
    'authorAssociation, bot whatever its association',
    { type: 'authorAssociation', condition: ['bot'] },
    pullRequest({ association: 'NONE', bot: true }),
    true,
  ],
  ['authorAssociation, not a bot', { type: 'authorAssociation', condition: ['bot'] }, pullRequest(), false],
  [
    'authorAssociation, unknown association',
    { type: 'authorAssociation', condition: ['none'] },
    withoutAssociation,
    false,
  ],
  [
    'authorAssociation, on an issue',
    { type: 'authorAssociation', condition: ['collaborator'] },
    issue({ association: 'COLLABORATOR' }),
    true,
  ],
  ['hasAssignee', { type: 'hasAssignee', condition: true }, pullRequest(), true],
  ['hasAssignee false, assigned', { type: 'hasAssignee', condition: false }, pullRequest(), false],
  ['hasAssignee false, unassigned', { type: 'hasAssignee', condition: false }, issue({ assignees: [] }), true],
  ['hasAssignee, assignees not reported', { type: 'hasAssignee', condition: true }, withoutAssignees, false],
  ['hasAssignee, on an issue', { type: 'hasAssignee', condition: true }, issue({ assignees: ['sam'] }), true],
  ['assigneeMatches', { type: 'assigneeMatches', condition: '^jane$' }, pullRequest(), true],
  [
    'assigneeMatches, any assignee',
    { type: 'assigneeMatches', condition: '^ann$' },
    issue({ assignees: ['sam', 'ann'] }),
    true,
  ],
  ['assigneeMatches, no match', { type: 'assigneeMatches', condition: '^ann$' }, pullRequest(), false],
  ['assigneeMatches, unassigned', { type: 'assigneeMatches', condition: '.*' }, issue(), false],
  [
    'reviewerMatches, requested reviewer',
    { type: 'reviewerMatches', condition: '^ann$' },
    pullRequest({ requestedReviewers: ['ann'] }),
    true,
  ],
  [
    'reviewerMatches, requested team',
    { type: 'reviewerMatches', condition: '^security$' },
    pullRequest({ requestedReviewers: ['ann', 'security'] }),
    true,
  ],
  [
    'reviewerMatches, someone who reviewed',
    { type: 'reviewerMatches', condition: '^ann$' },
    pullRequest({ reviews: [{ author: 'ann', state: 'COMMENTED' }] }),
    true,
  ],
  [
    'reviewerMatches, no match',
    { type: 'reviewerMatches', condition: '^ann$' },
    pullRequest({ requestedReviewers: ['bob'], reviews: [approved('sam')] }),
    false,
  ],
  ['reviewerMatches, no reviewers', { type: 'reviewerMatches', condition: '.*' }, pullRequest(), false],
  [
    'reviewerMatches, on an issue',
    { type: 'reviewerMatches', condition: '.*' },
    issue({ requestedReviewers: ['ann'] }),
    false,
  ],
  ['hasMilestone', { type: 'hasMilestone', condition: true }, issue({ milestone: 'v2.0' }), true],
  ['hasMilestone, in none', { type: 'hasMilestone', condition: true }, issue(), false],
  ['hasMilestone false, in none', { type: 'hasMilestone', condition: false }, pullRequest(), true],
  ['hasMilestone false, in one', { type: 'hasMilestone', condition: false }, pullRequest({ milestone: 'v2.0' }), false],
  ['milestoneMatches', { type: 'milestoneMatches', condition: '^v2' }, pullRequest({ milestone: 'v2.0' }), true],
  ['milestoneMatches, no match', { type: 'milestoneMatches', condition: '^v3' }, issue({ milestone: 'v2.0' }), false],
  ['milestoneMatches, in no milestone', { type: 'milestoneMatches', condition: '.*' }, issue(), false],
  ['linksIssue, none', { type: 'linksIssue', condition: true }, pullRequest(), false],
  ['linksIssue false, none', { type: 'linksIssue', condition: false }, pullRequest(), true],
  ['linksIssue, closes #12', { type: 'linksIssue', condition: true }, pullRequest({ body: 'Closes #12' }), true],
  ['linksIssue false, closes #12', { type: 'linksIssue', condition: false }, pullRequest({ body: 'fixes #12' }), false],
  [
    'linksIssue, a closing keyword with a colon and another repository',
    { type: 'linksIssue', condition: true, keys: ['SMC'] },
    pullRequest({ body: 'Resolved: Resnovas/smartcloud#12' }),
    true,
  ],
  [
    'linksIssue, a closing issue URL',
    { type: 'linksIssue', condition: true },
    pullRequest({ body: 'Fixed https://github.com/Resnovas/smartcloud/issues/12.' }),
    true,
  ],
  [
    'linksIssue, a mention without a closing keyword',
    { type: 'linksIssue', condition: true },
    pullRequest({ body: 'See #12, prefix #13' }),
    false,
  ],
  [
    'linksIssue, closes a Linear key',
    { type: 'linksIssue', condition: true },
    pullRequest({ body: 'Closes SMC-55' }),
    true,
  ],
  [
    'linksIssue, closes a Linear key of another team',
    { type: 'linksIssue', condition: true, keys: ['SMC'] },
    pullRequest({ body: 'Closes ENG-55' }),
    false,
  ],
  [
    'linksIssue, a Linear key in a lower-case branch',
    { type: 'linksIssue', condition: true, keys: ['SMC'] },
    pullRequest({ headBranch: 'claude/smc-55-links-issue' }),
    true,
  ],
  [
    'linksIssue, a listed key must stand alone',
    { type: 'linksIssue', condition: true, keys: ['SMC'] },
    pullRequest({ headBranch: 'feat/xsmc-55', title: 'feat: SMC-55a' }),
    false,
  ],
  [
    'linksIssue, a Linear key in the title',
    { type: 'linksIssue', condition: true },
    pullRequest({ title: 'feat(conditions): linksIssue (SMC-55)' }),
    true,
  ],
  [
    'linksIssue, a lower-case key in the title needs a listed key',
    { type: 'linksIssue', condition: true },
    pullRequest({ title: 'fix: decode utf-8' }),
    false,
  ],
  [
    'linksIssue, a listed key in the title in any case',
    { type: 'linksIssue', condition: true, keys: ['ENG', 'SMC'] },
    pullRequest({ title: 'fix: smc-55' }),
    true,
  ],
  ['linksIssue, missing branch', { type: 'linksIssue', condition: true }, withoutBranch, false],
  ['linksIssue, on an issue', { type: 'linksIssue', condition: true }, issue({ body: 'Closes #12' }), false],
  ['isOpen', { type: 'isOpen', condition: true }, pullRequest(), true],
  ['isOpen false on a closed item', { type: 'isOpen', condition: false }, pullRequest({ open: false }), true],
  ['isLocked', { type: 'isLocked', condition: true }, issue({ locked: true }), true],
  ['isLocked, unlocked', { type: 'isLocked', condition: true }, issue(), false],
  ['isDraft', { type: 'isDraft', condition: true }, pullRequest({ draft: true }), true],
  ['isDraft, draft unknown counts as ready', { type: 'isDraft', condition: false }, withoutDraft, true],
  ['hasLabel, case-insensitive', { type: 'hasLabel', label: 'type - feature', condition: true }, pullRequest(), true],
  ['hasLabel false, label absent', { type: 'hasLabel', label: 'bug', condition: false }, pullRequest(), true],
  ['filesMatch', { type: 'filesMatch', condition: 'packages/**/*.ts' }, pullRequest(), true],
  ['filesMatch, no file', { type: 'filesMatch', condition: 'docs/**' }, pullRequest(), false],
  ['changesSize within range', { type: 'changesSize', min: 10, max: 50 }, pullRequest(), true],
  ['changesSize, max is exclusive', { type: 'changesSize', min: 0, max: 40 }, pullRequest(), false],
  ['changesSize, no max', { type: 'changesSize', min: 40 }, pullRequest(), true],
  ['changesSize, unknown counts as zero', { type: 'changesSize', min: 1 }, withoutChanges, false],
  ['pendingReview', { type: 'pendingReview', condition: true }, pullRequest({ pendingReviewers: 1 }), true],
  ['pendingReview, none', { type: 'pendingReview', condition: true }, pullRequest(), false],
  [
    'requestedChanges uses the latest decisive review',
    { type: 'requestedChanges', condition: true },
    pullRequest({
      reviews: [
        { author: 'ann', state: 'APPROVED' },
        { author: 'ann', state: 'CHANGES_REQUESTED' },
        { author: 'ann', state: 'COMMENTED' },
      ],
    }),
    true,
  ],
  [
    'requestedChanges, later approval clears it',
    { type: 'requestedChanges', condition: false },
    pullRequest({
      reviews: [
        { author: 'ann', state: 'CHANGES_REQUESTED' },
        { author: 'ANN', state: 'APPROVED' },
      ],
    }),
    true,
  ],
  [
    'isApproved',
    { type: 'isApproved', condition: 2 },
    pullRequest({ reviews: [approved('ann'), approved('bo')] }),
    true,
  ],
  ['isApproved, too few', { type: 'isApproved', condition: 2 }, pullRequest({ reviews: [approved('ann')] }), false],
  [
    'isApproved, a comment does not block (v1 bug)',
    { type: 'isApproved', condition: 1 },
    pullRequest({ reviews: [approved('ann'), { author: 'bo', state: 'COMMENTED' }] }),
    true,
  ],
  [
    'isApproved, pending reviewer blocks',
    { type: 'isApproved', condition: 1 },
    pullRequest({ reviews: [approved('ann')], pendingReviewers: 1 }),
    false,
  ],
  [
    'isApproved, allowPending counts approvals while reviews are pending',
    { type: 'isApproved', condition: 2, allowPending: true },
    pullRequest({ reviews: [approved('ann'), approved('bo')], pendingReviewers: 1 }),
    true,
  ],
  [
    'isApproved, allowPending still needs enough approvals',
    { type: 'isApproved', condition: 2, allowPending: true },
    pullRequest({ reviews: [approved('ann')], pendingReviewers: 2 }),
    false,
  ],
  [
    'isApproved, allowPending does not need pending reviewers loaded',
    { type: 'isApproved', condition: 1, allowPending: true },
    withoutPending,
    true,
  ],
  [
    'isApproved, allowPending: false keeps pending reviewers blocking',
    { type: 'isApproved', condition: 1, allowPending: false },
    pullRequest({ reviews: [approved('ann')], pendingReviewers: 1 }),
    false,
  ],
  [
    'isApproved, allowPending does not ignore a change request',
    { type: 'isApproved', condition: 1, allowPending: true },
    pullRequest({ reviews: [approved('ann'), { author: 'bo', state: 'CHANGES_REQUESTED' }], pendingReviewers: 1 }),
    false,
  ],
  [
    'isApproved, a change request blocks',
    { type: 'isApproved', condition: 1 },
    pullRequest({ reviews: [approved('ann'), { author: 'bo', state: 'CHANGES_REQUESTED' }] }),
    false,
  ],
  ['commitMessagesMatch, all', { type: 'commitMessagesMatch', condition: '^feat' }, pullRequest(), true],
  [
    'commitMessagesMatch, all fails on one',
    { type: 'commitMessagesMatch', condition: '^feat' },
    pullRequest({ commits: [commit('feat: a'), commit('fix: b')] }),
    false,
  ],
  [
    'commitMessagesMatch, any',
    { type: 'commitMessagesMatch', condition: '^fix', scope: 'any' },
    pullRequest({ commits: [commit('feat: a'), commit('fix: b')] }),
    true,
  ],
  [
    'commitMessagesMatch ignores merge commits',
    { type: 'commitMessagesMatch', condition: '^feat' },
    pullRequest({ commits: [commit('feat: a'), commit('Merge main', { parents: 2 })] }),
    true,
  ],
  [
    'commitMessagesMatch, a global pattern restarts on every commit',
    { type: 'commitMessagesMatch', condition: '/^feat/g' },
    pullRequest({ commits: [commit('feat: a'), commit('feat: b')] }),
    true,
  ],
  [
    'commitMessagesMatch, a sticky pattern restarts on every commit',
    { type: 'commitMessagesMatch', condition: '/feat/y' },
    pullRequest({ commits: [commit('feat: a'), commit('feat: b')] }),
    true,
  ],
  [
    'hasConflict, conflicting',
    { type: 'hasConflict', condition: true },
    pullRequest({ mergeable: 'CONFLICTING' }),
    true,
  ],
  ['hasConflict, mergeable', { type: 'hasConflict', condition: true }, pullRequest(), false],
  ['hasConflict false, mergeable', { type: 'hasConflict', condition: false }, pullRequest(), true],
  [
    'hasConflict false, conflicting',
    { type: 'hasConflict', condition: false },
    pullRequest({ mergeable: 'CONFLICTING' }),
    false,
  ],
  [
    'hasConflict, unknown counts as not conflicting',
    { type: 'hasConflict', condition: true },
    pullRequest({ mergeable: 'UNKNOWN' }),
    false,
  ],
  [
    'hasConflict false, unknown counts as not conflicting',
    { type: 'hasConflict', condition: false },
    pullRequest({ mergeable: 'UNKNOWN' }),
    true,
  ],
  [
    'checksPass, every named check succeeded',
    { type: 'checksPass', checks: ['build', 'test'], condition: true },
    pullRequest({ checks: [green('build'), green('test'), red('lint')] }),
    true,
  ],
  [
    'checksPass, one failed',
    { type: 'checksPass', checks: ['build', 'test'], condition: true },
    pullRequest({ checks: [green('build'), red('test')] }),
    false,
  ],
  [
    'checksPass, one still running',
    { type: 'checksPass', checks: ['build', 'test'], condition: true },
    pullRequest({ checks: [green('build'), running('test')] }),
    false,
  ],
  [
    'checksPass, one not reported',
    { type: 'checksPass', checks: ['build', 'test'], condition: true },
    pullRequest({ checks: [green('build')] }),
    false,
  ],
  [
    'checksPass, names match exactly',
    { type: 'checksPass', checks: ['Test'], condition: true },
    pullRequest({ checks: [green('test')] }),
    false,
  ],
  [
    'checksPass, a failure outranks a success under the same name',
    { type: 'checksPass', checks: ['test'], condition: true },
    pullRequest({ checks: [green('test'), red('test')] }),
    false,
  ],
  [
    'checksPass false, one failed',
    { type: 'checksPass', checks: ['test'], condition: false },
    pullRequest({ checks: [red('test')] }),
    true,
  ],
  [
    'checksPass false, all succeeded',
    { type: 'checksPass', checks: ['test'], condition: false },
    pullRequest({ checks: [green('test')] }),
    false,
  ],
  [
    'checkStatus success',
    { type: 'checkStatus', check: 'test', condition: 'success' },
    pullRequest({ checks: [green('test')] }),
    true,
  ],
  [
    'checkStatus failure outranks pending and success',
    { type: 'checkStatus', check: 'test', condition: 'failure' },
    pullRequest({ checks: [green('test'), running('test'), red('test')] }),
    true,
  ],
  [
    'checkStatus pending outranks success',
    { type: 'checkStatus', check: 'test', condition: 'pending' },
    pullRequest({ checks: [green('test'), running('test')] }),
    true,
  ],
  [
    'checkStatus, not reported is pending',
    { type: 'checkStatus', check: 'test', condition: 'pending' },
    pullRequest(),
    true,
  ],
  [
    'checkStatus, not reported is not success',
    { type: 'checkStatus', check: 'test', condition: 'success' },
    pullRequest(),
    false,
  ],
  ['commitsSignedOff', { type: 'commitsSignedOff', condition: true }, pullRequest(), true],
  [
    'commitsSignedOff, email must match the author',
    { type: 'commitsSignedOff', condition: false },
    pullRequest({ commits: [commit('x\n\nSigned-off-by: Someone <else@example.com>')] }),
    true,
  ],
  [
    'commitsSignedOff, email match ignores case',
    { type: 'commitsSignedOff', condition: true },
    pullRequest({ commits: [commit('x\n\nsigned-off-by: Jane <JANE@example.com>')] }),
    true,
  ],
  [
    'hasTrailer, any value',
    { type: 'hasTrailer', trailer: 'Assisted-by', scope: 'any' },
    pullRequest({ commits: [commit('x'), commit(`y\n\nAssisted-by: claude-code:claude-opus-5-5\n${signed}`)] }),
    true,
  ],
  [
    'hasTrailer, value must match',
    { type: 'hasTrailer', trailer: 'co-authored-by', condition: 'anthropic\\.com' },
    pullRequest({ commits: [commit(`x\n\nCo-authored-by: Claude <noreply@anthropic.com>`)] }),
    true,
  ],
  [
    'hasTrailer, all commits by default',
    { type: 'hasTrailer', trailer: 'Assisted-by' },
    pullRequest({ commits: [commit('x'), commit('y\n\nAssisted-by: aider:gpt-5')] }),
    false,
  ],
  [
    'hasTrailer, a global value pattern restarts on every commit',
    { type: 'hasTrailer', trailer: 'co-authored-by', condition: '/anthropic\\.com/g' },
    pullRequest({
      commits: [
        commit('x\n\nCo-authored-by: Claude <noreply@anthropic.com>'),
        commit('y\n\nCo-authored-by: Claude <noreply@anthropic.com>'),
      ],
    }),
    true,
  ],
]

describe('evaluate: every condition', () => {
  for (const [name, condition, subject, expected] of cases) {
    it.effect(name, () => Effect.map(passes(condition, subject), (passed) => expect(passed).toBe(expected)))
  }
})

describe('evaluate: pull request conditions on issues', () => {
  it.effect('are false with an explanation, never an error', () =>
    Effect.gen(function* () {
      const evaluation = yield* evaluate({ condition: [{ type: 'filesMatch', condition: '**' }] }, issue())
      expect(evaluation.passed).toBe(false)
      expect(evaluation.results[0]?.detail).toBe('only applies to pull requests')
    }),
  )
})

describe('evaluate: base branch', () => {
  it.effect('explains the match', () =>
    Effect.gen(function* () {
      const detail = (condition: string) =>
        Effect.map(
          evaluate({ condition: [{ type: 'baseBranchMatches', condition }] }, pullRequest({ baseBranch: 'release/2' })),
          (evaluation) => evaluation.results[0]?.detail,
        )
      expect(yield* detail('^release/')).toBe('base branch release/2 matches')
      expect(yield* detail('^main$')).toBe('base branch release/2 does not match')
    }),
  )
})

describe('evaluate: author association', () => {
  it.effect('explains the association', () =>
    Effect.gen(function* () {
      const detail = (subject: Subject) =>
        Effect.map(
          evaluate({ condition: [{ type: 'authorAssociation', condition: ['member'] }] }, subject),
          (evaluation) => evaluation.results[0]?.detail,
        )
      expect(yield* detail(pullRequest({ association: 'FIRST_TIMER' }))).toBe(
        'author @jane is firstTimer, firstTimeContributor',
      )
      expect(yield* detail(pullRequest({ author: 'ci[bot]', association: 'NONE', bot: true }))).toBe(
        'author @ci[bot] is none, bot',
      )
      expect(yield* detail(withoutAssociation)).toBe("author @jane's association is unknown")
    }),
  )
})

describe('evaluate: assignees and reviewers', () => {
  const detail = (condition: Condition, subject: Subject) =>
    Effect.map(evaluate({ condition: [condition] }, subject), (evaluation) => evaluation.results[0]?.detail)

  it.effect('explains the assignees', () =>
    Effect.gen(function* () {
      const assigned = issue({ assignees: ['sam', 'ann'] })
      expect(yield* detail({ type: 'hasAssignee', condition: true }, assigned)).toBe('assigned to @sam, @ann')
      expect(yield* detail({ type: 'hasAssignee', condition: true }, issue())).toBe('unassigned')
      expect(yield* detail({ type: 'assigneeMatches', condition: '^ann$' }, assigned)).toBe(
        'an assignee matches among @sam, @ann',
      )
      expect(yield* detail({ type: 'assigneeMatches', condition: '^bob$' }, assigned)).toBe(
        'no assignee matches among @sam, @ann',
      )
      expect(yield* detail({ type: 'assigneeMatches', condition: '.*' }, issue())).toBe('unassigned')
    }),
  )

  it.effect('explains the reviewers, each once, leaving out reviews by a deleted account', () =>
    Effect.gen(function* () {
      const reviewed = pullRequest({
        requestedReviewers: ['ann', 'security'],
        reviews: [{ author: 'bob', state: 'COMMENTED' }, approved('bob'), approved('')],
      })
      expect(yield* detail({ type: 'reviewerMatches', condition: '^bob$' }, reviewed)).toBe(
        'a reviewer matches among @ann, @security, @bob',
      )
      expect(yield* detail({ type: 'reviewerMatches', condition: '^sam$' }, reviewed)).toBe(
        'no reviewer matches among @ann, @security, @bob',
      )
      expect(yield* detail({ type: 'reviewerMatches', condition: '.*' }, pullRequest())).toBe('no reviewers')
    }),
  )
})

describe('evaluate: milestones', () => {
  const detail = (condition: Condition, subject: Subject) =>
    Effect.map(evaluate({ condition: [condition] }, subject), (evaluation) => evaluation.results[0]?.detail)

  it.effect('explains the milestone', () =>
    Effect.gen(function* () {
      const planned = issue({ milestone: 'v2.0' })
      expect(yield* detail({ type: 'hasMilestone', condition: true }, planned)).toBe('in milestone v2.0')
      expect(yield* detail({ type: 'hasMilestone', condition: true }, issue())).toBe('in no milestone')
      expect(yield* detail({ type: 'milestoneMatches', condition: '^v2' }, planned)).toBe('milestone v2.0 matches')
      expect(yield* detail({ type: 'milestoneMatches', condition: '^v3' }, planned)).toBe(
        'milestone v2.0 does not match',
      )
      expect(yield* detail({ type: 'milestoneMatches', condition: '.*' }, issue())).toBe('in no milestone')
    }),
  )
})

describe('evaluate: linked issues', () => {
  const detail = (condition: Condition, subject: Subject) =>
    Effect.map(evaluate({ condition: [condition] }, subject), (evaluation) => evaluation.results[0]?.detail)

  it.effect('explains the first link, from the description, then the branch, then the title', () =>
    Effect.gen(function* () {
      const linked = { type: 'linksIssue', condition: true } as const
      const everywhere = pullRequest({ body: 'Closes #12', headBranch: 'smc-55-x', title: 'feat: SMC-56' })
      expect(yield* detail(linked, everywhere)).toBe('closes #12')
      expect(yield* detail(linked, pullRequest({ headBranch: 'smc-55-x', title: 'feat: SMC-56' }))).toBe(
        'Linear key smc-55 in the branch',
      )
      expect(yield* detail(linked, pullRequest({ title: 'feat: SMC-56' }))).toBe('Linear key SMC-56 in the title')
      expect(yield* detail(linked, pullRequest())).toBe('links no issue')
    }),
  )
})

describe('evaluate: facets', () => {
  it.effect('a facet that was not loaded fails with MissingFacet', () =>
    Effect.gen(function* () {
      const exit = yield* Effect.exit(evaluate({ condition: [{ type: 'isApproved', condition: 1 }] }, withoutReviews))
      expect(exit).toStrictEqual(Exit.fail(new MissingFacet({ facet: 'reviews', condition: 'isApproved' })))
    }),
  )

  it.effect('hasConflict needs the mergeable facet', () =>
    Effect.gen(function* () {
      const { mergeable: _, ...unloaded } = pullRequest()
      const exit = yield* Effect.exit(evaluate({ condition: [{ type: 'hasConflict', condition: true }] }, unloaded))
      expect(exit).toStrictEqual(Exit.fail(new MissingFacet({ facet: 'mergeable', condition: 'hasConflict' })))
    }),
  )

  it.effect('reviewerMatches needs the requested reviewers and reviews facets', () =>
    Effect.gen(function* () {
      const { requestedReviewers: _, ...unrequested } = pullRequest()
      const condition = { condition: [{ type: 'reviewerMatches', condition: 'x' }] } as const
      expect(yield* Effect.exit(evaluate(condition, unrequested))).toStrictEqual(
        Exit.fail(new MissingFacet({ facet: 'requestedReviewers', condition: 'reviewerMatches' })),
      )
      expect(yield* Effect.exit(evaluate(condition, withoutReviews))).toStrictEqual(
        Exit.fail(new MissingFacet({ facet: 'reviews', condition: 'reviewerMatches' })),
      )
    }),
  )

  it.effect('checksPass and checkStatus need the checks facet', () =>
    Effect.gen(function* () {
      const { checks: _, ...unloaded } = pullRequest()
      const status = yield* Effect.exit(
        evaluate({ condition: [{ type: 'checkStatus', check: 'test', condition: 'success' }] }, unloaded),
      )
      expect(status).toStrictEqual(Exit.fail(new MissingFacet({ facet: 'checks', condition: 'checkStatus' })))
      const pass = yield* Effect.exit(
        evaluate({ condition: [{ type: 'checksPass', checks: ['test'], condition: true }] }, unloaded),
      )
      expect(pass).toStrictEqual(Exit.fail(new MissingFacet({ facet: 'checks', condition: 'checksPass' })))
    }),
  )

  it.effect('explains the check states', () =>
    Effect.gen(function* () {
      const detail = (condition: Condition, subject: Subject) =>
        Effect.map(evaluate({ condition: [condition] }, subject), (evaluation) => evaluation.results[0]?.detail)
      const checks = [green('build'), red('test'), running('lint')]
      expect(yield* detail({ type: 'checksPass', checks: ['build'], condition: true }, pullRequest({ checks }))).toBe(
        'every named check succeeded',
      )
      expect(
        yield* detail(
          { type: 'checksPass', checks: ['build', 'test', 'lint', 'e2e'], condition: true },
          pullRequest({ checks }),
        ),
      ).toBe('not succeeded: test, lint, e2e')
      expect(yield* detail({ type: 'checkStatus', check: 'test', condition: 'failure' }, pullRequest({ checks }))).toBe(
        'test failure',
      )
      expect(yield* detail({ type: 'checkStatus', check: 'e2e', condition: 'pending' }, pullRequest({ checks }))).toBe(
        'e2e has not reported',
      )
      expect(yield* detail({ type: 'checkStatus', check: 'e2e', condition: 'pending' }, issue())).toBe(
        'only applies to pull requests',
      )
    }),
  )

  it.effect('explains the mergeable state', () =>
    Effect.gen(function* () {
      const detail = (mergeable: Subject['mergeable']) =>
        Effect.map(
          evaluate(
            { condition: [{ type: 'hasConflict', condition: true }] },
            pullRequest(mergeable === undefined ? {} : { mergeable }),
          ),
          (evaluation) => evaluation.results[0]?.detail,
        )
      expect(yield* detail('CONFLICTING')).toBe('conflicts with the base branch')
      expect(yield* detail('MERGEABLE')).toBe('no conflicts')
      expect(yield* detail('UNKNOWN')).toBe('mergeability not yet known')
    }),
  )
})

describe('evaluate: stale and abandoned (v1 had these inverted)', () => {
  it.effect('isStale is false for recent activity and true once enough days pass', () =>
    Effect.gen(function* () {
      const stale = { type: 'isStale', condition: 30 } as const
      expect(yield* passes(stale, pullRequest())).toBe(false)
      yield* TestClock.adjust('29 days')
      expect(yield* passes(stale, pullRequest())).toBe(false)
      yield* TestClock.adjust('1 day')
      expect(yield* passes(stale, pullRequest())).toBe(true)
    }),
  )

  it.effect('isAbandoned needs the stale label as well as the age', () =>
    Effect.gen(function* () {
      const abandoned = { type: 'isAbandoned', condition: 14, label: 'stale' } as const
      yield* TestClock.adjust('20 days')
      expect(yield* passes(abandoned, pullRequest())).toBe(false)
      expect(yield* passes(abandoned, pullRequest({ labels: ['Stale'] }))).toBe(true)
      const young = yield* evaluate(
        { condition: [abandoned] },
        pullRequest({ labels: ['stale'], updatedAt: new Date(10 * 86_400_000) }),
      )
      expect(young.passed).toBe(false)
    }),
  )
})

describe('evaluate: groups and combinators', () => {
  const draft = { condition: [{ type: 'isDraft', condition: true }] } as const
  const open = { condition: [{ type: 'isOpen', condition: true }] } as const
  const subject = pullRequest()

  it.effect('requires defaults to every condition', () =>
    Effect.gen(function* () {
      const evaluation = yield* evaluate(
        {
          condition: [
            { type: 'isOpen', condition: true },
            { type: 'isDraft', condition: true },
          ],
        },
        subject,
      )
      expect(evaluation).toMatchObject({ passed: false, matched: 1, required: 2 })
    }),
  )

  it.effect('requires counts the conditions that must pass (v1 form)', () =>
    Effect.map(
      evaluate(
        {
          requires: 1,
          condition: [
            { type: 'isOpen', condition: true },
            { type: 'isDraft', condition: true },
          ],
        },
        subject,
      ),
      (evaluation) => expect(evaluation.passed).toBe(true),
    ),
  )

  it.effect('$and, $or and $only', () =>
    Effect.gen(function* () {
      expect(yield* passes({ type: '$and', condition: [draft, open] }, subject)).toBe(false)
      expect(yield* passes({ type: '$and', condition: [open, open] }, subject)).toBe(true)
      expect(yield* passes({ type: '$or', condition: [draft, open] }, subject)).toBe(true)
      expect(yield* passes({ type: '$or', condition: [draft] }, subject)).toBe(false)
      expect(yield* passes({ type: '$only', requires: 1, condition: [draft, open] }, subject)).toBe(true)
      expect(yield* passes({ type: '$only', requires: 1, condition: [open, open] }, subject)).toBe(false)
    }),
  )

  it.effect('$not accepts a group or a one-item list, as v1 did', () =>
    Effect.gen(function* () {
      expect(yield* passes({ type: '$not', condition: draft }, subject)).toBe(true)
      expect(yield* passes({ type: '$not', requires: 1, condition: [open] }, subject)).toBe(false)
    }),
  )

  it.effect("$not accepts the inline form from smartcloud's own v1 config", () =>
    Effect.gen(function* () {
      // requestApprovals in smartcloud's v1 .github/config.json
      const notDependabot = {
        type: '$not',
        requires: 1,
        condition: [{ type: 'creatorMatches', condition: '/^dependabot/i' }],
      } as const
      expect(yield* passes(notDependabot, subject)).toBe(true)
      expect(yield* passes(notDependabot, pullRequest({ author: 'dependabot[bot]' }))).toBe(false)
      const allOf = {
        type: '$not',
        condition: [
          { type: 'isOpen', condition: true },
          { type: 'isDraft', condition: true },
        ],
      } as const
      expect(yield* passes(allOf, subject)).toBe(true)
    }),
  )

  it.effect('explains combinators with their nested groups', () =>
    Effect.gen(function* () {
      const evaluation = yield* evaluate({ condition: [{ type: '$or', condition: [draft, open] }] }, subject)
      expect(evaluation.results[0]).toMatchObject({
        detail: '1 of 2 group(s) passed',
        groups: [{ passed: false }, { passed: true }],
      })
      const negated = yield* evaluate({ condition: [{ type: '$not', condition: open }] }, subject)
      expect(negated.results[0]?.detail).toBe('the group passed')
    }),
  )
})

describe('requiredFacets', () => {
  it('collects the facets used anywhere, including inside combinators', () => {
    const facets = requiredFacets([
      { condition: [{ type: 'filesMatch', condition: '**' }] },
      {
        condition: [
          { type: '$or', condition: [{ condition: [{ type: 'isApproved', condition: 1 }] }] },
          { type: '$not', condition: [{ condition: [{ type: 'hasTrailer', trailer: 'X' }] }] },
          { type: '$not', requires: 1, condition: [{ type: 'isApproved', condition: 1 }] },
          { type: 'titleMatches', condition: 'x' },
          { type: 'hasConflict', condition: true },
          { type: 'checkStatus', check: 'test', condition: 'success' },
        ],
      },
    ])
    expect([...facets].sort()).toStrictEqual(['checks', 'commits', 'files', 'mergeable', 'pendingReviewers', 'reviews'])
  })

  it('looks inside $and and $only too', () => {
    const facets = requiredFacets([
      {
        condition: [
          { type: '$and', condition: [{ condition: [{ type: 'filesMatch', condition: '**' }] }] },
          { type: '$only', requires: 1, condition: [{ condition: [{ type: 'commitsSignedOff', condition: true }] }] },
        ],
      },
    ])
    expect([...facets].sort()).toStrictEqual(['commits', 'files'])
  })

  it('needs only reviews for isApproved when pending reviews are allowed', () => {
    const facets = requiredFacets([{ condition: [{ type: 'isApproved', condition: 1, allowPending: true }] }])
    expect([...facets]).toStrictEqual(['reviews'])
  })

  it('needs requested reviewers and reviews for reviewerMatches', () => {
    const facets = requiredFacets([{ condition: [{ type: 'reviewerMatches', condition: 'x' }] }])
    expect([...facets].sort()).toStrictEqual(['requestedReviewers', 'reviews'])
  })

  it('needs nothing for conditions on the event payload alone', () => {
    expect(requiredFacets([{ condition: [{ type: 'isOpen', condition: true }] }]).size).toBe(0)
    expect(requiredFacets([{ condition: [{ type: 'milestoneMatches', condition: 'x' }] }]).size).toBe(0)
    expect(requiredFacets([{ condition: [{ type: 'linksIssue', condition: true }] }]).size).toBe(0)
  })
})
