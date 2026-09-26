/**
 * @file tests/conditions/src/subject.spec.ts
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
import { Commit, Review, Subject } from '@resnovas/conditions'
import { commit, issue, pullRequest } from './fixtures.js'

describe('Subject', () => {
  it('accepts an issue without any pull request field, and a pull request with every facet', () => {
    expect(Schema.is(Subject)(issue())).toBe(true)
    expect(Schema.is(Subject)(pullRequest())).toBe(true)
  })

  it('rejects an unknown kind and a missing required field', () => {
    expect(Either.isLeft(Schema.decodeUnknownEither(Subject)({ ...issue(), kind: 'discussion' }))).toBe(true)
    const { title: _title, ...untitled } = issue()
    expect(Either.isLeft(Schema.decodeUnknownEither(Subject)(untitled))).toBe(true)
  })
})

describe('Review', () => {
  it('accepts the review states GitHub reports and nothing else', () => {
    expect(Schema.is(Review)({ author: 'jane', state: 'CHANGES_REQUESTED' })).toBe(true)
    expect(Schema.is(Review)({ author: 'jane', state: 'LGTM' })).toBe(false)
  })
})

describe('Commit', () => {
  it('needs the parent count that marks merge commits', () => {
    expect(Schema.is(Commit)(commit('fix: x', { parents: 2 }))).toBe(true)
    const { parents: _parents, ...orphan } = commit('fix: x')
    expect(Schema.is(Commit)(orphan)).toBe(false)
  })

  it('needs the signature verification', () => {
    expect(Schema.is(Commit)(commit('fix: x', { verified: false }))).toBe(true)
    const { verified: _verified, ...unchecked } = commit('fix: x')
    expect(Schema.is(Commit)(unchecked)).toBe(false)
  })
})
