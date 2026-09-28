/**
 * @file tests/reporting/src/publish.spec.ts
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
import { Effect } from 'effect'
import { DryRun, DryRunLog, Forbidden, GitHub, makeMemoryGitHub } from '@resnovas/integrations.github'
import { MARKER, publishReport } from '@resnovas/reporting'
import { notice, run, subject } from './fixtures.js'

describe('publishReport', () => {
  it.effect('creates check runs and one comment, then updates the comment in place', () =>
    Effect.gen(function* () {
      const { service, state } = makeMemoryGitHub()
      const first = yield* publishReport(run()).pipe(Effect.provideService(GitHub, service))
      expect(first).toMatchObject({ checkRuns: 3, comment: 'created', warnings: [] })
      expect(state.checkRuns.map((entry) => entry.name)).toStrictEqual([
        'smartcloud / commits',
        'smartcloud / sync',
        'smartcloud / reviews',
      ])
      const again = yield* publishReport(run()).pipe(Effect.provideService(GitHub, service))
      expect(again.comment).toBe('unchanged')
      const fixed = yield* publishReport(run({ findings: [notice] })).pipe(Effect.provideService(GitHub, service))
      expect(fixed.comment).toBe('updated')
      expect(state.issues.get(7)?.comments).toHaveLength(1)
      expect(state.issues.get(7)?.comments[0]?.body).toBe(`${MARKER}\nAll smartcloud checks pass.`)
    }),
  )

  it.effect('takes over a comment left by v1 instead of adding a second one', () =>
    Effect.gen(function* () {
      for (const legacy of ['<!--undefined: Conventions-->\n\r\n\rTitle check failed', '<!--smartcloud: Labels-->']) {
        const { service, state } = makeMemoryGitHub({
          issues: new Map([
            [
              7,
              {
                labels: [],
                open: true,
                comments: [
                  { id: 1, body: 'a person quoting <!--smartcloud: x-->', author: 'jane', bot: false },
                  { id: 2, body: legacy, author: 'bot', bot: true },
                ],
              },
            ],
          ]),
        })
        const published = yield* publishReport(run()).pipe(Effect.provideService(GitHub, service))
        expect(published.comment).toBe('updated')
        const comments = state.issues.get(7)?.comments ?? []
        expect(comments.map((comment) => comment.id)).toStrictEqual([1, 2])
        expect(comments[1]?.body.startsWith(MARKER)).toBe(true)
        expect(comments[0]?.body).toBe('a person quoting <!--smartcloud: x-->')
      }
    }),
  )

  it.effect("never edits a person's comment that carries the marker, and creates its own instead", () =>
    Effect.gen(function* () {
      const forged = [
        { id: 1, body: `${MARKER}\nplease edit me`, author: 'mallory', bot: false },
        { id: 2, body: '<!--smartcloud: Labels-->', author: 'mallory', bot: false },
      ]
      const { service, state } = makeMemoryGitHub({
        issues: new Map([[7, { labels: [], open: true, comments: [...forged] }]]),
      })
      const published = yield* publishReport(run()).pipe(Effect.provideService(GitHub, service))
      expect(published.comment).toBe('created')
      const comments = state.issues.get(7)?.comments ?? []
      expect(comments.slice(0, 2)).toStrictEqual(forged)
      expect(comments[2]).toMatchObject({ author: 'smartcloud[bot]', body: expect.stringContaining(MARKER) })
    }),
  )

  it.effect('updates a marker comment from a trusted login that is not a bot account', () =>
    Effect.gen(function* () {
      const { service, state } = makeMemoryGitHub({
        issues: new Map([
          [
            7,
            {
              labels: [],
              open: true,
              comments: [{ id: 1, body: `${MARKER}\nold`, author: 'Release-Robot', bot: false }],
            },
          ],
        ]),
      })
      const published = yield* publishReport(run(), { trustedAuthors: ['@release-robot'] }).pipe(
        Effect.provideService(GitHub, service),
      )
      expect(published.comment).toBe('updated')
      expect(state.issues.get(7)?.comments).toHaveLength(1)
      expect(state.issues.get(7)?.comments[0]?.body).not.toContain('old')
    }),
  )

  it.effect('under the dry-run layer records every check run and comment write, and changes nothing', () =>
    Effect.gen(function* () {
      const { service, state } = makeMemoryGitHub({
        issues: new Map([
          [7, { labels: [], open: true, comments: [{ id: 1, body: `${MARKER}\nold`, author: 'bot', bot: true }] }],
        ]),
      })
      const { published, writes } = yield* Effect.gen(function* () {
        const published = yield* publishReport(run())
        return { published, writes: yield* Effect.flatMap(DryRunLog, (log) => log.writes) }
      }).pipe(Effect.provide(DryRun), Effect.provideService(GitHub, service))
      expect(published).toMatchObject({ checkRuns: 3, comment: 'updated', warnings: [] })
      expect(writes.map((write) => write.operation)).toStrictEqual([
        'createCheckRun',
        'createCheckRun',
        'createCheckRun',
        'updateComment',
      ])
      expect(writes[3]?.details).toMatchObject({
        id: 1,
        body: expect.stringContaining('found 1 error(s), 1 warning(s)'),
      })
      expect(state.checkRuns).toHaveLength(0)
      expect(state.issues.get(7)?.comments).toStrictEqual([{ id: 1, body: `${MARKER}\nold`, author: 'bot', bot: true }])

      const fresh = makeMemoryGitHub()
      const created = yield* Effect.gen(function* () {
        const published = yield* publishReport(run())
        return { published, writes: yield* Effect.flatMap(DryRunLog, (log) => log.writes) }
      }).pipe(Effect.provide(DryRun), Effect.provideService(GitHub, fresh.service))
      expect(created.published.comment).toBe('created')
      expect(created.writes.at(-1)).toMatchObject({ operation: 'createComment', details: { issue: 7 } })
      expect(fresh.state.issues.get(7)?.comments ?? []).toHaveLength(0)
    }),
  )

  it.effect('does not comment when there is nothing to act on, or when told not to', () =>
    Effect.gen(function* () {
      const { service, state } = makeMemoryGitHub()
      expect(
        (yield* publishReport(run({ findings: [notice] })).pipe(Effect.provideService(GitHub, service))).comment,
      ).toBe('skipped')
      expect(
        (yield* publishReport(run(), { comment: false }).pipe(Effect.provideService(GitHub, service))).comment,
      ).toBe('skipped')
      expect(state.issues.get(7)?.comments ?? []).toHaveLength(0)
    }),
  )

  it.effect('comments on issues but creates no check runs without a commit', () =>
    Effect.gen(function* () {
      const { service, state } = makeMemoryGitHub()
      const published = yield* publishReport(
        run({ envelope: { kind: 'issue', event: 'issues', subject: { ...subject, kind: 'issue', number: 3 } } }),
      ).pipe(Effect.provideService(GitHub, service))
      expect(published).toMatchObject({ checkRuns: 0, comment: 'created' })
      expect(state.checkRuns).toHaveLength(0)
      const repository = yield* publishReport(run({ envelope: { kind: 'repository', event: 'schedule' } })).pipe(
        Effect.provideService(GitHub, service),
      )
      expect(repository).toMatchObject({ checkRuns: 0, comment: 'skipped' })
    }),
  )

  it.effect("never fails on a fork's read-only token: it records warnings and still returns the summary", () =>
    Effect.gen(function* () {
      const { service } = makeMemoryGitHub()
      const denied = new Forbidden({ operation: 'createCheckRun', detail: 'Resource not accessible by integration' })
      const readOnly = {
        ...service,
        createCheckRun: () => Effect.fail(denied),
        listComments: () =>
          Effect.fail(new Forbidden({ operation: 'listComments', detail: 'Resource not accessible by integration' })),
      }
      const published = yield* publishReport(run()).pipe(Effect.provideService(GitHub, readOnly))
      expect(published.checkRuns).toBe(0)
      expect(published.comment).toBe('skipped')
      expect(published.warnings).toStrictEqual([
        'check runs: createCheckRun: forbidden (Resource not accessible by integration)',
        'comment: listComments: forbidden (Resource not accessible by integration)',
      ])
      expect(published.summary).toContain('## smartcloud')
      expect(published.annotations).toHaveLength(3)
    }),
  )
})
