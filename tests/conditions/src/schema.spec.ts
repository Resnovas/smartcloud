/**
 * @file tests/conditions/src/schema.spec.ts
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
import { Either, Schema } from 'effect'
import { Condition, ConditionGroup } from '@resnovas/conditions'

const decode = Schema.decodeUnknownEither(ConditionGroup)

describe('ConditionGroup', () => {
  it('decodes the v1 examples for every combinator', () => {
    const v1 = {
      requires: 1,
      condition: [
        { type: '$and', condition: [{ requires: 1, condition: [{ type: 'isDraft', condition: true }] }] },
        { type: '$or', condition: [{ requires: 1, condition: [{ type: 'isOpen', condition: true }] }] },
        { type: '$not', condition: { requires: 1, condition: [{ type: 'isDraft', condition: true }] } },
        { type: '$not', requires: 1, condition: [{ requires: 1, condition: [{ type: 'isDraft', condition: true }] }] },
        {
          type: '$only',
          requires: 1,
          condition: [{ requires: 1, condition: [{ type: 'isLocked', condition: false }] }],
        },
        { type: '$not', requires: 1, condition: [{ type: 'creatorMatches', condition: '/^dependabot/i' }] },
      ],
    }
    expect(Either.isRight(decode(v1))).toBe(true)
  })

  it('decodes every leaf condition', () => {
    const leaves = [
      { type: 'titleMatches', condition: '^feat' },
      { type: 'descriptionMatches', condition: 'x' },
      { type: 'creatorMatches', condition: 'x' },
      { type: 'branchMatches', condition: 'x' },
      { type: 'baseBranchMatches', condition: 'x' },
      { type: 'authorAssociation', condition: ['member', 'bot'] },
      { type: 'hasAssignee', condition: false },
      { type: 'assigneeMatches', condition: 'x' },
      { type: 'hasMilestone', condition: true },
      { type: 'milestoneMatches', condition: 'x' },
      { type: 'linksIssue', condition: true },
      { type: 'linksIssue', condition: false, keys: ['SMC', 'eng2'] },
      { type: 'isOpen', condition: true },
      { type: 'isLocked', condition: true },
      { type: 'isDraft', condition: true },
      { type: 'pendingReview', condition: true },
      { type: 'requestedChanges', condition: true },
      { type: 'reviewerMatches', condition: 'x' },
      { type: 'commitsSignedOff', condition: true },
      { type: 'commitsVerified', condition: false },
      { type: 'lockfileChanged', condition: true },
      { type: 'fileCount', min: 1, max: 20 },
      { type: 'binaryFilesAdded', condition: false },
      { type: 'hasConflict', condition: true },
      { type: 'checksPass', checks: ['build', 'test'], condition: true },
      { type: 'checkStatus', check: 'test', condition: 'pending' },
      { type: 'hasLabel', label: 'bug', condition: true },
      { type: 'isStale', condition: 30 },
      { type: 'isAbandoned', condition: 14, label: 'stale' },
      { type: 'filesMatch', condition: 'src/**' },
      { type: 'codeownersTouched', condition: '@resnovas/core' },
      { type: 'codeownersTouched', condition: '@jane' },
      { type: 'codeownersTouched', condition: 'jane@example.com' },
      { type: 'changesSize', min: 0, max: 10 },
      { type: 'isApproved', condition: 1 },
      { type: 'isApproved', condition: 2, allowPending: true },
      { type: 'commitMessagesMatch', condition: '^feat', scope: 'any' },
      { type: 'hasTrailer', trailer: 'Assisted-by', condition: ':', scope: 'all' },
      { type: 'commentMatches', condition: '^/lgtm' },
      { type: 'commentMatches', condition: 'x', bots: true },
      { type: 'reactionCount', min: 5 },
      { type: 'reactionCount', reaction: '+1', min: 10, max: 100 },
      { type: 'createdBefore', condition: 30 },
      { type: 'createdBefore', condition: '2028-02-29' },
      { type: 'createdBefore', condition: '2026-01-01' },
      { type: 'createdBefore', condition: '2026-01-01T09:30:00.5+01:00' },
      { type: 'timeWindow', condition: true },
      {
        type: 'timeWindow',
        condition: false,
        days: ['sat', 'sun'],
        from: '22:00',
        to: '06:00',
        timeZone: 'Asia/Tokyo',
      },
    ]
    for (const leaf of leaves) {
      expect(Either.isRight(Schema.decodeUnknownEither(Condition)(leaf)), leaf.type).toBe(true)
    }
  })

  it('rejects unknown condition types and bad values', () => {
    expect(Either.isLeft(decode({ condition: [{ type: 'isFriday', condition: true }] }))).toBe(true)
    expect(Either.isLeft(decode({ condition: [{ type: 'isStale', condition: -1 }] }))).toBe(true)
    expect(Either.isLeft(decode({ condition: [{ type: 'titleMatches', condition: '[' }] }))).toBe(true)
    expect(Either.isLeft(decode({ condition: [{ type: 'linksIssue', condition: true, keys: [] }] }))).toBe(true)
    expect(Either.isLeft(decode({ condition: [{ type: 'linksIssue', condition: true, keys: ['SMC-'] }] }))).toBe(true)
    expect(Either.isLeft(decode({ condition: [{ type: 'codeownersTouched', condition: 'core' }] }))).toBe(true)
    expect(Either.isLeft(decode({ condition: [{ type: 'commentMatches', condition: '(' }] }))).toBe(true)
    expect(Either.isLeft(decode({ condition: [{ type: 'reactionCount', reaction: 'thumbsup', min: 1 }] }))).toBe(true)
    expect(Either.isLeft(decode({ condition: [{ type: 'reactionCount', min: -1 }] }))).toBe(true)
    for (const bad of [
      -1,
      'yesterday',
      '2026-1-1',
      '2026-13-01',
      '2026-01-01T09:00',
      '2026-02-29',
      '2025-02-29',
      '2026-04-31T09:00:00Z',
    ]) {
      expect(Either.isLeft(decode({ condition: [{ type: 'createdBefore', condition: bad }] })), String(bad)).toBe(true)
    }
    for (const bad of [
      { days: [] },
      { days: ['monday'] },
      { from: '9:00' },
      { to: '24:00' },
      { timeZone: 'Nowhere' },
    ]) {
      expect(Either.isLeft(decode({ condition: [{ type: 'timeWindow', condition: true, ...bad }] }))).toBe(true)
    }
    expect(Either.isLeft(decode({ condition: [{ type: 'codeownersTouched', condition: '@org/core team' }] }))).toBe(
      true,
    )
  })

  it('round-trips: encoding then decoding returns the original', () => {
    const group = Either.getOrThrow(
      decode({
        requires: 1,
        condition: [{ type: '$not', condition: { condition: [{ type: 'isDraft', condition: true }] } }],
      }),
    )
    expect(Schema.decodeUnknownSync(ConditionGroup)(Schema.encodeSync(ConditionGroup)(group))).toStrictEqual(group)
  })
})
