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
 * (CODE_OF_CONDUCT.md) and the Eventiva Cooperation Commitment
 * (COOPERATION_COMMITMENT.md).
 *
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE.
 */

import { describe, expect, it } from '@effect/vitest'
import { Either, Schema } from 'effect'
import { compilePattern, Condition, ConditionGroup, Pattern, requiredFacets } from '@resnovas/conditions'

const decode = Schema.decodeUnknownEither(ConditionGroup)

describe('Pattern', () => {
  it('compiles bare and delimited patterns the way v1 did', () => {
    expect(compilePattern('^feat').source).toBe('^feat')
    expect(compilePattern('/^feat/gi').flags).toBe('gi')
    expect(compilePattern('/a/b/').source).toBe('a\\/b')
  })

  it('rejects an invalid pattern when the config is decoded', () => {
    const result = Schema.decodeUnknownEither(Pattern)('(unclosed')
    expect(Either.isLeft(result)).toBe(true)
    expect(String(Either.isLeft(result) && result.left)).toContain('invalid pattern "(unclosed"')
  })
})

describe('ConditionGroup', () => {
  it('decodes the v1 examples for every combinator', () => {
    const v1 = {
      requires: 1,
      condition: [
        { type: '$and', condition: [{ requires: 1, condition: [{ type: 'isDraft', condition: true }] }] },
        { type: '$or', condition: [{ requires: 1, condition: [{ type: 'isOpen', condition: true }] }] },
        { type: '$not', condition: { requires: 1, condition: [{ type: 'isDraft', condition: true }] } },
        { type: '$not', requires: 1, condition: [{ requires: 1, condition: [{ type: 'isDraft', condition: true }] }] },
        { type: '$only', requires: 1, condition: [{ requires: 1, condition: [{ type: 'isLocked', condition: false }] }] },
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
      { type: 'isOpen', condition: true },
      { type: 'isLocked', condition: true },
      { type: 'isDraft', condition: true },
      { type: 'pendingReview', condition: true },
      { type: 'requestedChanges', condition: true },
      { type: 'commitsSignedOff', condition: true },
      { type: 'hasLabel', label: 'bug', condition: true },
      { type: 'isStale', condition: 30 },
      { type: 'isAbandoned', condition: 14, label: 'stale' },
      { type: 'filesMatch', condition: 'src/**' },
      { type: 'changesSize', min: 0, max: 10 },
      { type: 'isApproved', condition: 1 },
      { type: 'commitMessagesMatch', condition: '^feat', scope: 'any' },
      { type: 'hasTrailer', trailer: 'Assisted-by', condition: ':', scope: 'all' },
    ]
    for (const leaf of leaves) {
      expect(Either.isRight(Schema.decodeUnknownEither(Condition)(leaf)), leaf.type).toBe(true)
    }
  })

  it('rejects unknown condition types and bad values', () => {
    expect(Either.isLeft(decode({ condition: [{ type: 'isFriday', condition: true }] }))).toBe(true)
    expect(Either.isLeft(decode({ condition: [{ type: 'isStale', condition: -1 }] }))).toBe(true)
    expect(Either.isLeft(decode({ condition: [{ type: 'titleMatches', condition: '[' }] }))).toBe(true)
  })

  it('round-trips: encoding then decoding returns the original', () => {
    const group = Either.getOrThrow(
      decode({ requires: 1, condition: [{ type: '$not', condition: { condition: [{ type: 'isDraft', condition: true }] } }] }),
    )
    expect(Schema.decodeUnknownSync(ConditionGroup)(Schema.encodeSync(ConditionGroup)(group))).toStrictEqual(group)
  })
})

describe('requiredFacets', () => {
  it('collects the facets used anywhere, including inside combinators', () => {
    const facets = requiredFacets([
      { condition: [{ type: 'filesMatch', condition: '**' }] },
      {
        condition: [
          { type: '$or', condition: [{ condition: [{ type: 'isApproved', condition: 1 }] }] },
          { type: '$not', condition: [{ condition: [{ type: 'hasTrailer', trailer: 'X' }] }] },
          { type: 'titleMatches', condition: 'x' },
        ],
      },
    ])
    expect([...facets].sort()).toStrictEqual(['commits', 'files', 'pendingReviewers', 'reviews'])
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

  it('needs nothing for conditions on the event payload alone', () => {
    expect(requiredFacets([{ condition: [{ type: 'isOpen', condition: true }] }]).size).toBe(0)
  })
})
