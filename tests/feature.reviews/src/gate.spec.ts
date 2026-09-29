/**
 * @file tests/feature.reviews/src/gate.spec.ts
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
import type { Review } from '@resnovas/conditions'
import { evaluateGate, gateMessage, type GateInput, latestDecisive, sameLogin } from '@resnovas/feature.reviews'

// Ported from Resnovas/.github test/policy.test.mjs (evaluateReviews), plus
// the v2 additions: configurable thresholds, dismissals and trusted bots.

const approved = (author: string): Review => ({ author, state: 'APPROVED' })

const input = (overrides: Partial<GateInput> = {}): GateInput => ({
  author: 'contributor',
  reviews: [],
  maintainers: ['owner-one', 'owner-two'],
  trustedBots: ['dependabot[bot]'],
  outside: 2,
  maintainer: 1,
  ...overrides,
})

describe('evaluateGate', () => {
  it('is open with fewer than two maintainers', () => {
    expect(evaluateGate(input({ maintainers: ['owner-one'] }))).toStrictEqual({
      status: 'open',
      reason: 'fewerThanTwoMaintainers',
    })
    expect(evaluateGate(input({ maintainers: [] }))).toStrictEqual({
      status: 'open',
      reason: 'fewerThanTwoMaintainers',
    })
  })

  it('counts each maintainer account once, however it is listed', () => {
    const aliases = ['ann', '@Ann', 'ANN', 'ann']
    expect(evaluateGate(input({ maintainers: aliases }))).toStrictEqual({
      status: 'open',
      reason: 'fewerThanTwoMaintainers',
    })
    const one = evaluateGate(input({ maintainers: [...aliases, 'bob'], reviews: [approved('ann')] }))
    expect(one).toMatchObject({ status: 'failed', required: 2, approvedBy: ['ann'] })
  })

  it('needs two maintainer approvals on outside contributions', () => {
    const one = evaluateGate(input({ reviews: [approved('owner-one')] }))
    expect(one).toMatchObject({ status: 'failed', required: 2, approvedBy: ['owner-one'], authorIsMaintainer: false })
    const both = evaluateGate(input({ reviews: [approved('owner-one'), approved('owner-two')] }))
    expect(both).toMatchObject({ status: 'passed', required: 2, approvedBy: ['owner-one', 'owner-two'] })
  })

  it('needs one other maintainer on a maintainer pull request, and ignores the author approving their own', () => {
    const self = evaluateGate(input({ author: 'owner-one', reviews: [approved('owner-one')] }))
    expect(self).toMatchObject({ status: 'failed', required: 1, approvedBy: [], authorIsMaintainer: true })
    const other = evaluateGate(input({ author: 'owner-one', reviews: [approved('owner-two')] }))
    expect(other).toMatchObject({ status: 'passed', required: 1, approvedBy: ['owner-two'] })
  })

  it('withdraws an approval on a later change request; comments and pending reviews change nothing', () => {
    const withdrawn = evaluateGate(
      input({
        author: 'owner-one',
        reviews: [
          approved('owner-two'),
          { author: 'owner-two', state: 'CHANGES_REQUESTED' },
          { author: 'owner-two', state: 'COMMENTED' },
        ],
      }),
    )
    expect(withdrawn).toMatchObject({ status: 'failed', approvedBy: [] })
    const kept = evaluateGate(
      input({
        author: 'owner-one',
        reviews: [
          approved('owner-two'),
          { author: 'owner-two', state: 'COMMENTED' },
          { author: 'owner-two', state: 'PENDING' },
        ],
      }),
    )
    expect(kept).toMatchObject({ status: 'passed', approvedBy: ['owner-two'] })
  })

  it('counts a fresh approval after a change request, and not a dismissed one', () => {
    const renewed = evaluateGate(
      input({
        author: 'owner-one',
        reviews: [{ author: 'owner-two', state: 'CHANGES_REQUESTED' }, approved('owner-two')],
      }),
    )
    expect(renewed.status).toBe('passed')
    const dismissed = evaluateGate(
      input({ author: 'owner-one', reviews: [{ author: 'owner-two', state: 'DISMISSED' }] }),
    )
    expect(dismissed.status).toBe('failed')
  })

  it('counts only maintainers', () => {
    const result = evaluateGate(input({ reviews: [approved('owner-one'), approved('passer-by')] }))
    expect(result).toMatchObject({ status: 'failed', approvedBy: ['owner-one'] })
  })

  it('compares logins case-insensitively and ignores a leading @ in the config', () => {
    const result = evaluateGate(
      input({
        author: 'Owner-One',
        maintainers: ['@owner-one', 'OWNER-TWO'],
        reviews: [approved('owner-one'), approved('Owner-Two')],
      }),
    )
    expect(result).toMatchObject({ status: 'passed', required: 1, approvedBy: ['OWNER-TWO'], authorIsMaintainer: true })
  })

  it('lets trusted bots skip the gate', () => {
    expect(evaluateGate(input({ author: 'Dependabot[bot]' }))).toStrictEqual({ status: 'open', reason: 'trustedBot' })
  })

  it('applies configured thresholds, including zero', () => {
    expect(evaluateGate(input({ outside: 1, reviews: [approved('owner-two')] })).status).toBe('passed')
    expect(evaluateGate(input({ author: 'owner-one', maintainer: 0 })).status).toBe('passed')
  })
})

describe('gateMessage', () => {
  it('says how many approvals are needed and who approved', () => {
    expect(gateMessage({ status: 'failed', required: 2, approvedBy: ['owner-one'], authorIsMaintainer: false })).toBe(
      'Needs 2 maintainer approval(s) from someone other than the author; has 1 (approved by @owner-one).',
    )
    expect(gateMessage({ status: 'failed', required: 1, approvedBy: [], authorIsMaintainer: true })).toBe(
      'Needs 1 other maintainer approval(s) from someone other than the author; has 0 (approved by nobody yet).',
    )
  })
})

describe('latestDecisive and sameLogin', () => {
  it('keeps each reviewer latest decisive state, keyed by lowercased login', () => {
    const latest = latestDecisive([
      approved('Ann'),
      { author: 'ann', state: 'COMMENTED' },
      { author: '@bo', state: 'CHANGES_REQUESTED' },
    ])
    expect([...latest]).toStrictEqual([
      ['ann', 'APPROVED'],
      ['bo', 'CHANGES_REQUESTED'],
    ])
  })

  it('matches logins regardless of case and a leading @', () => {
    expect(sameLogin('@Ann', 'ann')).toBe(true)
    expect(sameLogin('ann', 'bo')).toBe(false)
  })
})
