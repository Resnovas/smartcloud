/**
 * @file tests/conditions/src/evaluate.spec.ts
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

import { describe, expect, it } from '@effect/vitest'
import { Effect, Exit, TestClock } from 'effect'
import { evaluate, MissingFacet, requiredFacets, type Condition, type Subject } from '@resnovas/conditions'
import { commit, issue, pullRequest, reactions } from './fixtures.js'

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
    'linksIssue, a closing keyword in code',
    { type: 'linksIssue', condition: true },
    pullRequest({ body: 'Write `Closes #12`, or:\n\n```md\nFixes #13\n```\n\n~~~\nResolves #14' }),
    false,
  ],
  [
    'linksIssue, a closing keyword after code',
    { type: 'linksIssue', condition: true },
    pullRequest({ body: '```\nx\n```\nCloses #12' }),
    true,
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
  ['lockfileChanged, none changed', { type: 'lockfileChanged', condition: true }, pullRequest(), false],
  [
    'lockfileChanged cannot rule out files past the 3,000 GitHub lists',
    { type: 'lockfileChanged', condition: false },
    pullRequest({ files: Array.from({ length: 3000 }, (_, index) => `src/${index}.ts`) }),
    false,
  ],
  [
    'binaryFilesAdded cannot rule out files past the 3,000 GitHub lists',
    { type: 'binaryFilesAdded', condition: false },
    pullRequest({
      changedFiles: Array.from({ length: 3000 }, (_, index) => ({
        path: `src/${index}.ts`,
        status: 'added' as const,
        binary: false,
      })),
    }),
    false,
  ],
  ['lockfileChanged false, none changed', { type: 'lockfileChanged', condition: false }, pullRequest(), true],
  [
    'lockfileChanged finds a lockfile in any directory',
    { type: 'lockfileChanged', condition: true },
    pullRequest({ files: ['apps/web/pnpm-lock.yaml'] }),
    true,
  ],
  [
    'lockfileChanged matches the whole file name',
    { type: 'lockfileChanged', condition: true },
    pullRequest({ files: ['docs/yarn.lock.md', 'my-Cargo.lock'] }),
    false,
  ],
  ['fileCount within range', { type: 'fileCount', min: 1, max: 3 }, pullRequest(), true],
  ['fileCount, max is exclusive', { type: 'fileCount', min: 0, max: 2 }, pullRequest(), false],
  ['fileCount, below min', { type: 'fileCount', min: 3 }, pullRequest(), false],
  ['fileCount, no max', { type: 'fileCount', min: 2 }, pullRequest(), true],
  ['binaryFilesAdded, none added', { type: 'binaryFilesAdded', condition: true }, pullRequest(), false],
  [
    'binaryFilesAdded',
    { type: 'binaryFilesAdded', condition: true },
    pullRequest({ changedFiles: [{ path: 'logo.png', status: 'added', binary: true }] }),
    true,
  ],
  [
    'binaryFilesAdded ignores changed and added text files',
    { type: 'binaryFilesAdded', condition: false },
    pullRequest({
      changedFiles: [
        { path: 'logo.png', status: 'modified', binary: true },
        { path: 'old.png', status: 'removed', binary: true },
        { path: 'new.ts', status: 'added', binary: false },
      ],
    }),
    true,
  ],
  ['commentMatches, no comments', { type: 'commentMatches', condition: '.*' }, pullRequest(), false],
  [
    'commentMatches',
    { type: 'commentMatches', condition: '/^\\/lgtm/m' },
    issue({ comments: [{ author: 'ann', body: 'Looks fine\n/lgtm', bot: false }] }),
    true,
  ],
  [
    'commentMatches ignores comments by bots',
    { type: 'commentMatches', condition: 'fixed' },
    issue({ comments: [{ author: 'smartcloud[bot]', body: 'fixed in #3', bot: true }] }),
    false,
  ],
  [
    'commentMatches counts bots when asked',
    { type: 'commentMatches', condition: 'fixed', bots: true },
    issue({ comments: [{ author: 'smartcloud[bot]', body: 'fixed in #3', bot: true }] }),
    true,
  ],
  [
    'commentMatches, a global pattern restarts on every comment',
    { type: 'commentMatches', condition: '/repro/g' },
    issue({
      comments: [
        { author: 'ann', body: 'repro attached', bot: false },
        { author: 'bo', body: 'repro too', bot: false },
      ],
    }),
    true,
  ],
  ['reactionCount, none', { type: 'reactionCount', min: 1 }, pullRequest(), false],
  [
    'reactionCount counts one reaction',
    { type: 'reactionCount', reaction: '+1', min: 10 },
    issue({ reactions: reactions({ '+1': 10, heart: 5 }) }),
    true,
  ],
  [
    'reactionCount counts every reaction without one',
    { type: 'reactionCount', min: 15 },
    issue({ reactions: reactions({ '+1': 10, heart: 5 }) }),
    true,
  ],
  [
    'reactionCount, max is exclusive',
    { type: 'reactionCount', reaction: '-1', min: 0, max: 3 },
    issue({ reactions: reactions({ '-1': 3 }) }),
    false,
  ],
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
  ['commitsVerified', { type: 'commitsVerified', condition: true }, pullRequest(), true],
  [
    'commitsVerified fails on an unsigned commit',
    { type: 'commitsVerified', condition: true },
    pullRequest({ commits: [commit('x'), commit('y', { verified: false })] }),
    false,
  ],
  [
    'commitsVerified counts merge commits',
    { type: 'commitsVerified', condition: false },
    pullRequest({ commits: [commit('x'), commit('Merge main', { parents: 2, verified: false })] }),
    true,
  ],
  [
    'commitsVerified cannot vouch for commits past the 250 GitHub lists',
    { type: 'commitsVerified', condition: true },
    pullRequest({ commits: Array.from({ length: 250 }, (_, index) => commit(`c${index}`)) }),
    false,
  ],
  [
    'commitsVerified false cannot vouch for them either',
    { type: 'commitsVerified', condition: false },
    pullRequest({ commits: Array.from({ length: 250 }, (_, index) => commit(`c${index}`)) }),
    false,
  ],
  [
    'commitsVerified is not a sign-off',
    { type: 'commitsVerified', condition: true },
    pullRequest({ commits: [commit(`x\n\n${signed}`, { verified: false })] }),
    false,
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

  it.effect('commitsVerified explains how many commits are not verified', () =>
    Effect.gen(function* () {
      const detail = (subject: Subject) =>
        Effect.map(
          evaluate({ condition: [{ type: 'commitsVerified', condition: true }] }, subject),
          (evaluation) => evaluation.results[0]?.detail,
        )
      expect(yield* detail(pullRequest())).toBe('every commit has a verified signature')
      expect(
        yield* detail(pullRequest({ commits: [commit('x', { verified: false }), commit('y', { verified: false })] })),
      ).toBe('2 commit(s) without a verified signature')
      expect(yield* detail(issue())).toBe('only applies to pull requests')
      const { commits: _, ...unread } = pullRequest()
      expect(
        yield* Effect.exit(evaluate({ condition: [{ type: 'commitsVerified', condition: true }] }, unread)),
      ).toStrictEqual(Exit.fail(new MissingFacet({ facet: 'commits', condition: 'commitsVerified' })))
      expect([...requiredFacets([{ condition: [{ type: 'commitsVerified', condition: true }] }])]).toStrictEqual([
        'commits',
      ])
    }),
  )

  it.effect('lockfileChanged, fileCount and binaryFilesAdded explain what they found', () =>
    Effect.gen(function* () {
      const detail = (condition: Condition, subject: Subject) =>
        Effect.map(evaluate({ condition: [condition] }, subject), (evaluation) => evaluation.results[0]?.detail)
      const lockfile = { type: 'lockfileChanged', condition: true } as const
      const count = { type: 'fileCount', min: 0 } as const
      const binary = { type: 'binaryFilesAdded', condition: true } as const
      expect(yield* detail(lockfile, pullRequest())).toBe('no lockfile changed')
      expect(yield* detail(lockfile, pullRequest({ files: ['package-lock.json', 'go/go.sum', 'a.ts'] }))).toBe(
        'lockfile(s) changed: package-lock.json, go/go.sum',
      )
      expect(yield* detail(count, pullRequest())).toBe('2 changed file(s)')
      expect(yield* detail(binary, pullRequest())).toBe('no binary file added')
      expect(
        yield* detail(
          binary,
          pullRequest({
            changedFiles: [
              { path: 'a.png', status: 'added', binary: true },
              { path: 'b.woff2', status: 'added', binary: true },
            ],
          }),
        ),
      ).toBe('binary file(s) added: a.png, b.woff2')
      for (const condition of [lockfile, count, binary]) {
        expect(yield* detail(condition, issue())).toBe('only applies to pull requests')
      }
    }),
  )

  it.effect('lockfileChanged and fileCount need files, binaryFilesAdded needs changedFiles', () =>
    Effect.gen(function* () {
      const { files: _files, changedFiles: _changed, ...unread } = pullRequest()
      const fails = (condition: Condition, facet: 'files' | 'changedFiles') =>
        Effect.map(Effect.exit(evaluate({ condition: [condition] }, unread)), (exit) =>
          expect(exit).toStrictEqual(Exit.fail(new MissingFacet({ facet, condition: condition.type }))),
        )
      yield* fails({ type: 'lockfileChanged', condition: true }, 'files')
      yield* fails({ type: 'fileCount', min: 1 }, 'files')
      yield* fails({ type: 'binaryFilesAdded', condition: true }, 'changedFiles')
      expect([
        ...requiredFacets([
          {
            condition: [
              { type: 'lockfileChanged', condition: true },
              { type: 'fileCount', min: 1 },
              { type: 'binaryFilesAdded', condition: false },
            ],
          },
        ]),
      ]).toStrictEqual(['files', 'changedFiles'])
    }),
  )

  it.effect('commentMatches and reactionCount explain what they found', () =>
    Effect.gen(function* () {
      const detail = (condition: Condition, subject: Subject) =>
        Effect.map(evaluate({ condition: [condition] }, subject), (evaluation) => evaluation.results[0]?.detail)
      const comments = [
        { author: 'smartcloud[bot]', body: 'wontfix?', bot: true },
        { author: 'ann', body: 'please fix', bot: false },
        { author: 'bo', body: 'wontfix', bot: false },
      ]
      const matching = { type: 'commentMatches', condition: 'wontfix' } as const
      expect(yield* detail(matching, issue({ comments }))).toBe('a comment by @bo matches wontfix')
      expect(yield* detail(matching, issue({ comments: comments.slice(0, 2) }))).toBe(
        'none of 1 comment(s) matches wontfix',
      )
      const liked = issue({ reactions: reactions({ '+1': 7, rocket: 2 }) })
      expect(yield* detail({ type: 'reactionCount', reaction: '+1', min: 1 }, liked)).toBe('7 +1 reaction(s)')
      expect(yield* detail({ type: 'reactionCount', min: 1 }, liked)).toBe('9 reaction(s)')
    }),
  )

  it.effect('commentMatches needs comments and reactionCount needs reactions, on issues too', () =>
    Effect.gen(function* () {
      const fails = (condition: Condition, facet: 'comments' | 'reactions') =>
        Effect.map(Effect.exit(evaluate({ condition: [condition] }, issue())), (exit) =>
          expect(exit).toStrictEqual(Exit.fail(new MissingFacet({ facet, condition: condition.type }))),
        )
      yield* fails({ type: 'commentMatches', condition: 'x' }, 'comments')
      yield* fails({ type: 'reactionCount', min: 1 }, 'reactions')
      expect([
        ...requiredFacets([
          {
            condition: [
              { type: 'commentMatches', condition: 'x' },
              { type: 'reactionCount', reaction: '+1', min: 1 },
            ],
          },
        ]),
      ]).toStrictEqual(['comments', 'reactions'])
    }),
  )

  it.effect('codeownersTouched needs the files and CODEOWNERS facets', () =>
    Effect.gen(function* () {
      const condition = { condition: [{ type: 'codeownersTouched', condition: '@org/core' }] } as const
      const { codeowners: _, ...unread } = pullRequest({ codeowners: '' })
      expect(yield* Effect.exit(evaluate(condition, unread))).toStrictEqual(
        Exit.fail(new MissingFacet({ facet: 'codeowners', condition: 'codeownersTouched' })),
      )
      const { files: __, ...unlisted } = pullRequest({ codeowners: '' })
      expect(yield* Effect.exit(evaluate(condition, unlisted))).toStrictEqual(
        Exit.fail(new MissingFacet({ facet: 'files', condition: 'codeownersTouched' })),
      )
    }),
  )

  it.effect('codeownersTouched passes when a changed file is owned by the owner, in any case', () =>
    Effect.gen(function* () {
      const codeowners = '* @org/core\n/docs/ @org/docs @Jane\n/docs/legal/ # unowned\n'
      const touched = (owner: string, files: ReadonlyArray<string>) =>
        Effect.map(
          evaluate(
            { condition: [{ type: 'codeownersTouched', condition: owner }] },
            pullRequest({ codeowners, files }),
          ),
          (evaluation) => evaluation.results[0],
        )
      expect(yield* touched('@org/docs', ['src/a.ts', 'docs/a.md', 'docs/b.md'])).toMatchObject({
        passed: true,
        detail: '2 changed file(s) owned by @org/docs',
      })
      expect(yield* touched('@jane', ['docs/a.md'])).toMatchObject({ passed: true })
      expect(yield* touched('@ORG/CORE', ['src/a.ts'])).toMatchObject({ passed: true })
      // The last matching rule wins, so docs belong to the docs team alone.
      expect(yield* touched('@org/core', ['docs/a.md'])).toMatchObject({
        passed: false,
        detail: 'no changed file owned by @org/core',
      })
      // A rule without owners leaves its files unowned.
      expect(yield* touched('@org/docs', ['docs/legal/terms.md'])).toMatchObject({ passed: false })
      expect(
        yield* Effect.map(
          evaluate(
            { condition: [{ type: 'codeownersTouched', condition: '@org/core' }] },
            pullRequest({ codeowners: '# nothing here\n' }),
          ),
          (evaluation) => evaluation.results[0],
        ),
      ).toMatchObject({ passed: false, detail: 'no CODEOWNERS rules' })
      expect(
        yield* Effect.map(
          evaluate({ condition: [{ type: 'codeownersTouched', condition: '@org/core' }] }, issue()),
          (evaluation) => evaluation.results[0]?.detail,
        ),
      ).toBe('only applies to pull requests')
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

describe('evaluate: creation time and time windows', () => {
  const detail = (condition: Condition, subject: Subject) =>
    Effect.map(evaluate({ condition: [condition] }, subject), (evaluation) => evaluation.results[0]?.detail)

  it.effect('createdBefore with a number of days measures the age from now', () =>
    Effect.gen(function* () {
      const old = { type: 'createdBefore', condition: 30 } as const
      const opened = pullRequest({ createdAt: new Date(0) })
      yield* TestClock.adjust('29 days')
      expect(yield* passes(old, opened)).toBe(false)
      yield* TestClock.adjust('1 day')
      expect(yield* passes(old, opened)).toBe(true)
      expect(yield* detail(old, opened)).toBe('created 30 day(s) ago')
    }),
  )

  it.effect('createdBefore with a date compares against it, a bare date meaning midnight UTC', () =>
    Effect.gen(function* () {
      const opened = pullRequest({ createdAt: new Date('2025-12-31T23:59:59Z') })
      expect(yield* passes({ type: 'createdBefore', condition: '2026-01-01' }, opened)).toBe(true)
      expect(yield* passes({ type: 'createdBefore', condition: '2025-12-31T23:59:59Z' }, opened)).toBe(false)
      expect(yield* passes({ type: 'createdBefore', condition: '2026-01-01T00:59:59+01:00' }, opened)).toBe(false)
      expect(yield* detail({ type: 'createdBefore', condition: '2026-01-01' }, opened)).toBe(
        'created 2025-12-31, before 2026-01-01',
      )
      expect(yield* detail({ type: 'createdBefore', condition: '2025-06-01' }, opened)).toBe(
        'created 2025-12-31, not before 2025-06-01',
      )
    }),
  )

  it.effect('createdBefore fails, with a reason, when the creation time is unknown', () =>
    Effect.gen(function* () {
      yield* TestClock.adjust('365 days')
      expect(yield* passes({ type: 'createdBefore', condition: 1 }, pullRequest())).toBe(false)
      expect(yield* detail({ type: 'createdBefore', condition: 1 }, issue())).toBe('creation time unknown')
    }),
  )

  // 2026-09-28 is a Monday.
  const at = (iso: string) => TestClock.setTime(Date.parse(iso))
  const workingHours = {
    type: 'timeWindow',
    condition: true,
    days: ['mon', 'tue', 'wed', 'thu', 'fri'],
    from: '09:00',
    to: '17:30',
    timeZone: 'Europe/London',
  } as const

  it.effect('timeWindow passes inside the days and hours, in the time zone', () =>
    Effect.gen(function* () {
      yield* at('2026-09-28T08:00:00Z')
      expect(yield* passes(workingHours, issue())).toBe(true)
      expect(yield* detail(workingHours, issue())).toBe('mon 09:00 Europe/London is inside the window')
      yield* at('2026-09-28T07:59:00Z')
      expect(yield* passes(workingHours, issue())).toBe(false)
      yield* at('2026-09-28T16:30:00Z')
      expect(yield* passes(workingHours, issue())).toBe(false)
      yield* at('2026-10-03T12:00:00Z')
      expect(yield* passes(workingHours, issue())).toBe(false)
      expect(yield* detail(workingHours, issue())).toBe('sat 13:00 Europe/London is outside the window')
    }),
  )

  it.effect('timeWindow with condition false passes outside the window', () =>
    Effect.gen(function* () {
      yield* at('2026-10-03T12:00:00Z')
      expect(yield* passes({ ...workingHours, condition: false }, issue())).toBe(true)
    }),
  )

  it.effect('timeWindow defaults to UTC, every day and the whole day', () =>
    Effect.gen(function* () {
      yield* at('2026-10-04T23:59:00Z')
      expect(yield* passes({ type: 'timeWindow', condition: true, days: ['sun'] }, issue())).toBe(true)
      expect(yield* passes({ type: 'timeWindow', condition: true, from: '12:00' }, issue())).toBe(true)
      expect(yield* passes({ type: 'timeWindow', condition: true, to: '12:00' }, issue())).toBe(false)
      expect(yield* detail({ type: 'timeWindow', condition: true }, issue())).toBe('sun 23:59 UTC is inside the window')
    }),
  )
})

describe('evaluate: dependency update type', () => {
  const bump = (title: string, author = 'dependabot[bot]', body = '') => pullRequest({ author, bot: true, title, body })
  const detail = (condition: Condition, subject: Subject) =>
    Effect.map(evaluate({ condition: [condition] }, subject), (evaluation) => evaluation.results[0]?.detail)
  const safe = { type: 'dependencyUpdateType', condition: ['patch', 'minor'] } as const

  it.effect('passes for the listed types of a Dependabot or Renovate update', () =>
    Effect.gen(function* () {
      expect(yield* passes(safe, bump('Bump x from 1.0.0 to 1.1.0'))).toBe(true)
      expect(yield* passes(safe, bump('Bump x from 1.0.0 to 2.0.0'))).toBe(false)
      expect(yield* detail(safe, bump('Bump x from 1.0.0 to 2.0.0'))).toBe('major update from 1.0.0 to 2.0.0')
      const renovate = bump('Update dependency x to v1.0.1', 'Renovate[bot]', '| x | `1.0.0` -> `1.0.1` |')
      expect(yield* passes(safe, renovate)).toBe(true)
    }),
  )

  it.effect('fails for anyone else, unless listed in bots', () =>
    Effect.gen(function* () {
      const human = bump('Bump x from 1.0.0 to 1.0.1', 'jane')
      expect(yield* passes(safe, human)).toBe(false)
      expect(yield* detail(safe, human)).toBe('author @jane is not a dependency bot')
      expect(yield* passes({ ...safe, bots: ['Jane'] }, human)).toBe(true)
    }),
  )

  it.effect('fails without a version change, and on issues', () =>
    Effect.gen(function* () {
      expect(yield* detail(safe, bump('Lock file maintenance', 'renovate[bot]'))).toBe(
        'no version change in the title or description',
      )
      expect(yield* passes(safe, bump('Lock file maintenance', 'renovate[bot]'))).toBe(false)
      expect(yield* passes(safe, issue({ author: 'dependabot[bot]', title: 'Bump x from 1.0.0 to 1.0.1' }))).toBe(false)
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

  it('needs the files and CODEOWNERS for codeownersTouched', () => {
    const facets = requiredFacets([{ condition: [{ type: 'codeownersTouched', condition: '@org/core' }] }])
    expect([...facets].sort()).toStrictEqual(['codeowners', 'files'])
  })

  it('needs nothing for conditions on the event payload alone', () => {
    expect(requiredFacets([{ condition: [{ type: 'isOpen', condition: true }] }]).size).toBe(0)
    expect(requiredFacets([{ condition: [{ type: 'milestoneMatches', condition: 'x' }] }]).size).toBe(0)
    expect(requiredFacets([{ condition: [{ type: 'linksIssue', condition: true }] }]).size).toBe(0)
  })
})
