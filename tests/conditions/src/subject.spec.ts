/**
 * @file tests/conditions/src/subject.spec.ts
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
import { Either, Schema } from 'effect'
import { ChangedFile, Comment, Commit, Reaction, Reactions, Review, Subject } from '@resnovas/conditions'
import { commit, issue, pullRequest, reactions } from './fixtures.js'

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

describe('ChangedFile', () => {
  it('accepts the statuses GitHub reports and nothing else', () => {
    expect(Schema.is(ChangedFile)({ path: 'logo.png', status: 'renamed', binary: true })).toBe(true)
    expect(Schema.is(ChangedFile)({ path: 'logo.png', status: 'moved', binary: true })).toBe(false)
    expect(Schema.is(ChangedFile)({ path: 'logo.png', status: 'added' })).toBe(false)
  })
})

describe('Comment', () => {
  it('needs the author, the body and whether a bot wrote it', () => {
    expect(Schema.is(Comment)({ author: 'sam', body: '+1', bot: false })).toBe(true)
    expect(Schema.is(Comment)({ author: 'sam', body: '+1' })).toBe(false)
  })
})

describe('Reactions', () => {
  it('counts every reaction GitHub offers, by its API name', () => {
    expect(Schema.is(Reaction)('rocket')).toBe(true)
    expect(Schema.is(Reaction)('total_count')).toBe(false)
    expect(Schema.is(Reactions)(reactions({ '+1': 3 }))).toBe(true)
    const { eyes: _eyes, ...partial } = reactions()
    expect(Schema.is(Reactions)(partial)).toBe(false)
    expect(Schema.is(Reactions)(reactions({ heart: -1 }))).toBe(false)
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
