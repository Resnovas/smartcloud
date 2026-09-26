/**
 * @file tests/feature.lock/src/sweep.spec.ts
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
import { makeReport, Report } from '@resnovas/engine'
import { closedBefore, LOCK_MARKER, lockItem, sweepLocks } from '@resnovas/feature.lock'
import { GitHub, Unavailable } from '@resnovas/integrations.github'
import { Effect } from 'effect'
import { closed, daysAgo, lockedOf, memory, sweep } from './fixtures.js'

describe('closedBefore', () => {
  it('counts back whole and part days from now', () => {
    expect(closedBefore(0, 5).getTime()).toBe(5)
    expect(closedBefore(2, 3 * 86_400_000).toISOString()).toBe('1970-01-02T00:00:00.000Z')
  })
})

describe('sweepLocks', () => {
  it.effect('locks issues and pull requests closed for afterDays, and leaves newer ones', () =>
    Effect.gen(function* () {
      const github = memory([
        closed(1),
        closed(2, { isPullRequest: true }),
        closed(3, { closedAt: daysAgo(10) }),
        closed(4, { locked: true }),
      ])
      const result = yield* sweep({ version: 2, lock: { afterDays: 30, reason: 'resolved' } }, github)
      expect(lockedOf(github)).toStrictEqual([1, 2])
      expect(github.state.issues.get(1)?.lockReason).toBe('resolved')
      expect(result.changes.map((change) => change.description)).toStrictEqual([
        'locked #2 as resolved',
        'locked #1 as resolved',
      ])
      expect(result.findings).toStrictEqual([])
    }),
  )

  it.effect('searches only the kinds in on, and skips exempt labels ignoring case', () =>
    Effect.gen(function* () {
      const github = memory([closed(1), closed(2, { isPullRequest: true }), closed(3, { labels: ['Pinned'] })])
      yield* sweep({ version: 2, lock: { afterDays: 30, on: ['issue'], exempt: { labels: ['pinned'] } } }, github)
      expect(lockedOf(github)).toStrictEqual([1])
    }),
  )

  it.effect('comments and labels before locking, without a reason when none is set', () =>
    Effect.gen(function* () {
      const github = memory([closed(1)])
      const result = yield* sweep(
        { version: 2, lock: { afterDays: 30, comment: 'Closed a while ago.', label: 'locked' } },
        github,
      )
      const entry = github.state.issues.get(1)
      expect(entry?.comments.map((comment) => comment.body)).toStrictEqual([`${LOCK_MARKER}\nClosed a while ago.`])
      expect(entry?.labels).toStrictEqual(['locked'])
      expect(entry?.locked).toBe(true)
      expect(entry?.lockReason).toBeUndefined()
      expect(result.changes.map((change) => change.description)).toStrictEqual([
        'commented on #1 before locking it',
        'labelled #1 "locked"',
        'locked #1',
      ])
    }),
  )

  it.effect("edits its own or a trusted login's lock comment, and leaves anyone else's alone", () =>
    Effect.gen(function* () {
      const mine = { id: 1, body: `${LOCK_MARKER}\nold`, author: 'smartcloud[bot]', bot: true }
      const trusted = { id: 2, body: `${LOCK_MARKER}\nold`, author: 'helper', bot: false }
      const forged = { id: 3, body: `${LOCK_MARKER}\nforged`, author: 'mallory', bot: false }
      const github = memory([closed(1), closed(2), closed(3)], { 1: [mine], 2: [trusted], 3: [forged] })
      yield* sweep({ version: 2, roles: { trustedBots: ['@Helper'] }, lock: { afterDays: 30, comment: 'new' } }, github)
      const bodies = (number: number) => github.state.issues.get(number)?.comments.map((comment) => comment.body)
      expect(bodies(1)).toStrictEqual([`${LOCK_MARKER}\nnew`])
      expect(bodies(2)).toStrictEqual([`${LOCK_MARKER}\nnew`])
      expect(bodies(3)).toStrictEqual([`${LOCK_MARKER}\nforged`, `${LOCK_MARKER}\nnew`])
    }),
  )

  it.effect('reports an item GitHub fails on, and still locks the items after it', () =>
    Effect.gen(function* () {
      const github = memory([closed(1), closed(2)])
      const failing: GitHub['Type'] = {
        ...github.service,
        lockIssue: (number, reason) =>
          number === 1
            ? Effect.fail(new Unavailable({ operation: 'lockIssue', detail: 'boom' }))
            : github.service.lockIssue(number, reason),
      }
      const result = yield* sweep({ version: 2, lock: { afterDays: 30 } }, github, 'schedule', failing)
      expect(result.failed).toStrictEqual([])
      expect(lockedOf(github)).toStrictEqual([2])
      expect(result.findings).toStrictEqual([
        {
          feature: 'lock',
          rule: 'lock.sweep',
          level: 'error',
          message: '#1 was not locked: lockIssue: GitHub unavailable (boom)',
        },
      ])
    }),
  )

  it.effect('does nothing without a lock section', () =>
    Effect.gen(function* () {
      const github = memory([closed(1)])
      const report = yield* makeReport
      yield* sweepLocks({ version: 2 }).pipe(
        Effect.provideService(GitHub, github.service),
        Effect.provideService(Report, report),
      )
      expect(lockedOf(github)).toStrictEqual([])
    }),
  )
})

describe('lockItem', () => {
  it.effect('locks one item, trusting only bot comments by default', () =>
    Effect.gen(function* () {
      const github = memory([closed(1)], { 1: [{ id: 1, body: LOCK_MARKER, author: 'helper', bot: false }] })
      const report = yield* makeReport
      yield* lockItem({ afterDays: 0, comment: 'c' }, closed(1)).pipe(
        Effect.provideService(GitHub, github.service),
        Effect.provideService(Report, report),
      )
      expect(github.state.issues.get(1)?.comments).toHaveLength(2)
      expect(lockedOf(github)).toStrictEqual([1])
    }),
  )
})
