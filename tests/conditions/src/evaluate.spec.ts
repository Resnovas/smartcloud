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
 * (CODE_OF_CONDUCT.md) and the Eventiva Cooperation Commitment
 * (COOPERATION_COMMITMENT.md).
 *
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE.
 */

import { describe, expect, it } from '@effect/vitest'
import { Effect, Exit, TestClock } from 'effect'
import { evaluate, MissingFacet, type Condition, type Subject } from '@resnovas/conditions'
import { commit, issue, pullRequest } from './fixtures.js'

const passes = (condition: Condition, subject: Subject) =>
  Effect.map(evaluate({ condition: [condition] }, subject), (evaluation) => evaluation.passed)

const signed = 'Signed-off-by: Jane Doe <jane@example.com>'
const approved = (author: string) => ({ author, state: 'APPROVED' as const })

// [name, condition, subject, expected]
const cases: ReadonlyArray<readonly [string, Condition, Subject, boolean]> = [
  ['titleMatches, bare pattern', { type: 'titleMatches', condition: '^feat' }, pullRequest(), true],
  ['titleMatches, delimited with flags', { type: 'titleMatches', condition: '/^FEAT/i' }, pullRequest(), true],
  ['titleMatches, no match', { type: 'titleMatches', condition: '^fix' }, pullRequest(), false],
  ['descriptionMatches', { type: 'descriptionMatches', condition: 'label' }, pullRequest(), true],
  ['descriptionMatches, empty body never matches', { type: 'descriptionMatches', condition: '.*' }, issue(), false],
  ['creatorMatches', { type: 'creatorMatches', condition: '^jane$' }, pullRequest(), true],
  ['creatorMatches, other author', { type: 'creatorMatches', condition: '^bot' }, pullRequest(), false],
  ['branchMatches', { type: 'branchMatches', condition: '^feat/' }, pullRequest(), true],
  ['branchMatches, missing branch', { type: 'branchMatches', condition: '^feat/' }, pullRequest({ headBranch: undefined }), false],
  ['isOpen', { type: 'isOpen', condition: true }, pullRequest(), true],
  ['isOpen false on a closed item', { type: 'isOpen', condition: false }, pullRequest({ open: false }), true],
  ['isLocked', { type: 'isLocked', condition: true }, issue({ locked: true }), true],
  ['isLocked, unlocked', { type: 'isLocked', condition: true }, issue(), false],
  ['isDraft', { type: 'isDraft', condition: true }, pullRequest({ draft: true }), true],
  ['isDraft, draft unknown counts as ready', { type: 'isDraft', condition: false }, pullRequest({ draft: undefined }), true],
  ['hasLabel, case-insensitive', { type: 'hasLabel', label: 'type - feature', condition: true }, pullRequest(), true],
  ['hasLabel false, label absent', { type: 'hasLabel', label: 'bug', condition: false }, pullRequest(), true],
  ['filesMatch', { type: 'filesMatch', condition: 'packages/**/*.ts' }, pullRequest(), true],
  ['filesMatch, no file', { type: 'filesMatch', condition: 'docs/**' }, pullRequest(), false],
  ['changesSize within range', { type: 'changesSize', min: 10, max: 50 }, pullRequest(), true],
  ['changesSize, max is exclusive', { type: 'changesSize', min: 0, max: 40 }, pullRequest(), false],
  ['changesSize, no max', { type: 'changesSize', min: 40 }, pullRequest(), true],
  ['changesSize, unknown counts as zero', { type: 'changesSize', min: 1 }, pullRequest({ changes: undefined }), false],
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
  ['isApproved', { type: 'isApproved', condition: 2 }, pullRequest({ reviews: [approved('ann'), approved('bo')] }), true],
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

describe('evaluate: facets', () => {
  it.effect('a facet that was not loaded fails with MissingFacet', () =>
    Effect.gen(function* () {
      const exit = yield* Effect.exit(
        evaluate({ condition: [{ type: 'isApproved', condition: 1 }] }, pullRequest({ reviews: undefined })),
      )
      expect(exit).toStrictEqual(Exit.fail(new MissingFacet({ facet: 'reviews', condition: 'isApproved' })))
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
      const young = yield* evaluate({ condition: [abandoned] }, pullRequest({ labels: ['stale'], updatedAt: new Date(10 * 86_400_000) }))
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
        { condition: [{ type: 'isOpen', condition: true }, { type: 'isDraft', condition: true }] },
        subject,
      )
      expect(evaluation).toMatchObject({ passed: false, matched: 1, required: 2 })
    }),
  )

  it.effect('requires counts the conditions that must pass (v1 form)', () =>
    Effect.map(
      evaluate({ requires: 1, condition: [{ type: 'isOpen', condition: true }, { type: 'isDraft', condition: true }] }, subject),
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

  it.effect('$not accepts the inline form from smartcloud\'s own v1 config', () =>
    Effect.gen(function* () {
      // requestApprovals in smartcloud's v1 .github/config.json
      const notDependabot = {
        type: '$not',
        requires: 1,
        condition: [{ type: 'creatorMatches', condition: '/^dependabot/i' }],
      } as const
      expect(yield* passes(notDependabot, subject)).toBe(true)
      expect(yield* passes(notDependabot, pullRequest({ author: 'dependabot[bot]' }))).toBe(false)
      const allOf = { type: '$not', condition: [{ type: 'isOpen', condition: true }, { type: 'isDraft', condition: true }] } as const
      expect(yield* passes(allOf, subject)).toBe(true)
    }),
  )

  it.effect('explains combinators with their nested groups', () =>
    Effect.gen(function* () {
      const evaluation = yield* evaluate({ condition: [{ type: '$or', condition: [draft, open] }] }, subject)
      expect(evaluation.results[0]).toMatchObject({ detail: '1 of 2 group(s) passed', groups: [{ passed: false }, { passed: true }] })
      const negated = yield* evaluate({ condition: [{ type: '$not', condition: open }] }, subject)
      expect(negated.results[0]?.detail).toBe('the group passed')
    }),
  )
})
