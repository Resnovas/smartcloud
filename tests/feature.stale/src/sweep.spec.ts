/**
 * @file tests/feature.stale/src/sweep.spec.ts
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
import { Effect, Layer, TestClock } from 'effect'
import type { SmartcloudConfig } from '@resnovas/config'
import { makeReport, Report, runFeatures } from '@resnovas/engine'
import {
  ABANDONED_MARKER,
  MARK_GRACE_MS,
  markedSince,
  stale,
  STALE_MARKER,
  staleBody,
  sweepStale,
  type StaleConfig,
} from '@resnovas/feature.stale'
import {
  DryRun,
  DryRunLog,
  GitHub,
  makeMemoryGitHub,
  Unavailable,
  type Comment,
  type IssueSummary,
} from '@resnovas/integrations.github'

const DAY = 86_400_000
const NOW = Date.UTC(2026, 8, 26)
const daysAgo = (days: number) => new Date(NOW - days * DAY)

const item = (number: number, overrides: Partial<IssueSummary> = {}): IssueSummary => ({
  number,
  title: `item ${number}`,
  body: '',
  author: 'sam',
  open: true,
  locked: false,
  labels: [],
  updatedAt: daysAgo(0),
  isPullRequest: false,
  ...overrides,
})

// Seeds the listing and GitHub's own view of each item's labels and comments.
const memory = (
  items: ReadonlyArray<IssueSummary>,
  comments: Readonly<Record<number, ReadonlyArray<Comment>>> = {},
) => {
  const github = makeMemoryGitHub({ openIssues: [...items], nextId: 100 })
  for (const entry of items) {
    github.state.issues.set(entry.number, {
      labels: [...entry.labels],
      comments: [...(comments[entry.number] ?? [])],
      open: true,
    })
  }
  return github
}

const settings: StaleConfig = {
  staleAfterDays: 30,
  staleLabel: 'stale',
  staleComment: 'This has been quiet for a while.',
  abandonedAfterDays: 7,
  abandonedComment: 'Closing as abandoned.',
  close: true,
}

const sweep = (
  config: SmartcloudConfig,
  github: ReturnType<typeof memory>,
  event = 'schedule',
  service: GitHub['Type'] = github.service,
) =>
  Effect.gen(function* () {
    yield* TestClock.setTime(NOW)
    // A push payload must carry what GitHub sends for one; the others need nothing.
    const payload = event === 'push' ? { ref: 'refs/heads/main', after: 'abc123' } : {}
    return yield* runFeatures({ config, event, payload, features: [stale] }).pipe(Effect.provideService(GitHub, service))
  })

const labelsOf = (github: ReturnType<typeof memory>, number: number) => github.state.issues.get(number)?.labels
const commentsOf = (github: ReturnType<typeof memory>, number: number) =>
  github.state.issues.get(number)?.comments.map((c) => c.body)

describe('stale feature: marking', () => {
  it.effect('marks items inactive for staleAfterDays or more, with one comment carrying the marker and mark time', () =>
    Effect.gen(function* () {
      const github = memory([
        item(1, { updatedAt: daysAgo(30) }),
        item(2, { updatedAt: daysAgo(29.9) }),
        item(3, { updatedAt: daysAgo(90), isPullRequest: true }),
      ])
      const result = yield* sweep({ version: 2, stale: settings }, github)
      expect(labelsOf(github, 1)).toStrictEqual(['stale'])
      expect(labelsOf(github, 2)).toStrictEqual([])
      expect(labelsOf(github, 3)).toStrictEqual(['stale'])
      expect(commentsOf(github, 1)).toStrictEqual([staleBody(settings.staleComment ?? '', new Date(NOW))])
      expect(commentsOf(github, 1)?.[0]).toContain(STALE_MARKER)
      expect(result.changes.map((change) => change.description)).toStrictEqual([
        'commented on #1 that it is stale',
        'labelled #1 "stale"',
        'commented on #3 that it is stale',
        'labelled #3 "stale"',
      ])
    }),
  )

  it.effect('stamps each mark with the time it is written, not the start of the sweep', () =>
    Effect.gen(function* () {
      const github = memory([item(1, { updatedAt: daysAgo(40) }), item(2, { updatedAt: daysAgo(40) })])
      // Each item's comment listing takes twenty minutes, longer than the grace period.
      const slow: GitHub['Type'] = {
        ...github.service,
        listComments: (number) => Effect.zipRight(TestClock.adjust('20 minutes'), github.service.listComments(number)),
      }
      yield* sweep({ version: 2, stale: settings }, github, 'schedule', slow)
      expect(commentsOf(github, 2)).toStrictEqual([staleBody(settings.staleComment ?? '', new Date(NOW + 40 * 60_000))])
    }),
  )

  it.effect('writes the label last, so a failed comment leaves the item to be marked again', () =>
    Effect.gen(function* () {
      const github = memory([item(1, { updatedAt: daysAgo(40) })])
      const failing: GitHub['Type'] = {
        ...github.service,
        createComment: () => Effect.fail(new Unavailable({ operation: 'createComment', detail: 'boom' })),
      }
      yield* sweep({ version: 2, stale: settings }, github, 'schedule', failing)
      expect(labelsOf(github, 1)).toStrictEqual([])
    }),
  )

  it.effect('reports an item GitHub fails on, and still sweeps the items after it', () =>
    Effect.gen(function* () {
      const github = memory([item(1, { updatedAt: daysAgo(40) }), item(2, { updatedAt: daysAgo(40) })])
      const failing: GitHub['Type'] = {
        ...github.service,
        listComments: (number) =>
          number === 1 ? Effect.fail(new Unavailable({ operation: 'listComments', detail: 'boom' })) : github.service.listComments(number),
      }
      const result = yield* sweep({ version: 2, stale: settings }, github, 'schedule', failing)
      expect(result.failed).toStrictEqual([])
      expect(labelsOf(github, 2)).toStrictEqual(['stale'])
      expect(result.findings).toStrictEqual([
        {
          feature: 'stale',
          rule: 'stale.sweep',
          level: 'error',
          message: '#1 was not swept: listComments: GitHub unavailable (boom)',
        },
      ])
    }),
  )

  it.effect('refuses to sweep when the stale and abandoned labels are the same', () =>
    Effect.gen(function* () {
      const github = memory([item(1, { updatedAt: daysAgo(40) })])
      const result = yield* sweep({ version: 2, stale: { ...settings, staleLabel: 'Abandoned' } }, github)
      expect(labelsOf(github, 1)).toStrictEqual([])
      expect(result.findings).toStrictEqual([
        {
          feature: 'stale',
          rule: 'stale.config',
          level: 'error',
          message:
            'stale.staleLabel and stale.abandonedLabel are both "abandoned", so a stale item would look abandoned; give them different names',
        },
      ])
    }),
  )

  it.effect('in a dry run, records every write it would make and changes nothing', () =>
    Effect.gen(function* () {
      yield* TestClock.setTime(NOW)
      const github = memory([item(1, { updatedAt: daysAgo(40) }), item(2, { labels: ['stale'], updatedAt: daysAgo(10) })])
      const layer = DryRun.pipe(Layer.provide(Layer.succeed(GitHub, github.service)))
      const { result, writes } = yield* Effect.gen(function* () {
        const result = yield* runFeatures({ config: { version: 2, stale: settings }, event: 'schedule', payload: {}, features: [stale] })
        return { result, writes: yield* (yield* DryRunLog).writes }
      }).pipe(Effect.provide(layer))
      expect(result.failed).toStrictEqual([])
      expect(writes.map((write) => write.operation)).toStrictEqual([
        'createComment',
        'addLabels',
        'addLabels',
        'createComment',
        'closeIssue',
      ])
      expect(labelsOf(github, 1)).toStrictEqual([])
      expect(labelsOf(github, 2)).toStrictEqual(['stale'])
      expect(commentsOf(github, 1)).toStrictEqual([])
      expect(github.state.issues.get(2)?.open).toBe(true)
    }),
  )

  it.effect('edits an existing stale comment instead of adding another', () =>
    Effect.gen(function* () {
      const old = { id: 5, author: 'smartcloud[bot]', body: `${STALE_MARKER}\nold text` }
      const github = memory([item(1, { updatedAt: daysAgo(40) })], {
        1: [{ id: 4, author: 'sam', body: 'hello' }, old],
      })
      yield* sweep({ version: 2, stale: settings }, github)
      expect(github.state.issues.get(1)?.comments).toStrictEqual([
        { id: 4, author: 'sam', body: 'hello' },
        { ...old, body: staleBody(settings.staleComment ?? '', new Date(NOW)) },
      ])
    }),
  )

  it.effect('labels without commenting when no staleComment is set', () =>
    Effect.gen(function* () {
      const github = memory([item(1, { updatedAt: daysAgo(40) })])
      const { staleComment: _omitted, ...quiet } = settings
      yield* sweep({ version: 2, stale: quiet }, github)
      expect(labelsOf(github, 1)).toStrictEqual(['stale'])
      expect(commentsOf(github, 1)).toStrictEqual([])
    }),
  )

  it.effect('respects on, exempt labels ignoring case, and exempt.when', () =>
    Effect.gen(function* () {
      const github = memory([
        item(1, { updatedAt: daysAgo(40), isPullRequest: true }),
        item(2, { updatedAt: daysAgo(40), labels: ['Pinned'] }),
        item(3, { updatedAt: daysAgo(40), title: 'RFC: keep me' }),
        item(4, { updatedAt: daysAgo(40) }),
      ])
      const result = yield* sweep(
        {
          version: 2,
          stale: {
            ...settings,
            on: ['issue'],
            exempt: { labels: ['pinned'], when: { condition: [{ type: 'titleMatches', condition: '^RFC' }] } },
          },
        },
        github,
      )
      expect([1, 2, 3, 4].map((number) => labelsOf(github, number))).toStrictEqual([[], ['Pinned'], [], ['stale']])
      expect(result.findings).toStrictEqual([])
    }),
  )

  it.effect('loads the facets exempt.when needs for pull requests', () =>
    Effect.gen(function* () {
      const github = memory([
        item(1, { updatedAt: daysAgo(40), isPullRequest: true }),
        item(2, { updatedAt: daysAgo(40), isPullRequest: true }),
        item(3, { updatedAt: daysAgo(40) }),
      ])
      for (const [number, files] of [[1, ['docs/a.md']], [2, ['src/a.ts']]] as const) {
        github.state.pulls.set(number, { commits: [], files: [...files], reviews: [], requestedReviewers: [], submittedReviews: [] })
      }
      const result = yield* sweep(
        {
          version: 2,
          stale: { ...settings, exempt: { when: { condition: [{ type: 'filesMatch', condition: 'docs/**' }] } } },
        },
        github,
      )
      expect([1, 2, 3].map((number) => labelsOf(github, number))).toStrictEqual([[], ['stale'], ['stale']])
      expect(result.findings).toStrictEqual([])
    }),
  )

  it.effect('warns once when exempt.when needs pull request details a sweep cannot read, and skips pull requests', () =>
    Effect.gen(function* () {
      const github = memory([
        item(1, { updatedAt: daysAgo(40), isPullRequest: true }),
        item(2, { updatedAt: daysAgo(40) }),
      ])
      const result = yield* sweep(
        {
          version: 2,
          stale: {
            ...settings,
            // Exempting drafts: nested, and a draft pull request looks ready in a sweep's listing.
            exempt: { when: { condition: [{ type: '$or', condition: [{ condition: [{ type: 'isDraft', condition: true }] }] }] } },
          },
        },
        github,
      )
      expect(labelsOf(github, 1)).toStrictEqual([])
      expect(labelsOf(github, 2)).toStrictEqual(['stale'])
      expect(result.findings).toStrictEqual([
        {
          feature: 'stale',
          rule: 'stale.exempt',
          level: 'warning',
          message:
            'stale.exempt.when uses isDraft, branchMatches or changesSize, which a sweep cannot read for a pull request; pull requests are skipped',
        },
      ])
    }),
  )
})

describe('stale feature: unmarking', () => {
  const markedAt = daysAgo(3)
  const marker = { id: 9, author: 'smartcloud[bot]', body: staleBody('quiet', markedAt) }

  it.effect('removes the stale label when there was activity after the mark, beyond the grace period', () =>
    Effect.gen(function* () {
      const github = memory(
        [
          item(1, { labels: ['stale'], updatedAt: new Date(markedAt.getTime() + MARK_GRACE_MS + 1) }),
          item(2, { labels: ['stale'], updatedAt: new Date(markedAt.getTime() + MARK_GRACE_MS) }),
          item(3, { labels: ['stale'], updatedAt: daysAgo(1) }),
        ],
        { 1: [marker], 2: [marker] },
      )
      const result = yield* sweep({ version: 2, stale: settings }, github)
      expect(labelsOf(github, 1)).toStrictEqual([])
      // Within the grace period the update is smartcloud's own mark.
      expect(labelsOf(github, 2)).toStrictEqual(['stale'])
      // Without a stale comment there is no mark time, so no activity can be told apart.
      expect(labelsOf(github, 3)).toStrictEqual(['stale'])
      expect(result.changes.map((change) => change.description)).toStrictEqual([
        'removed "stale" from #1 after new activity',
      ])
    }),
  )

  it.effect('turns a stale label that vanished before removal into a warning', () =>
    Effect.gen(function* () {
      const github = memory([item(1, { labels: ['stale'], updatedAt: daysAgo(1) })], { 1: [marker] })
      github.state.issues.set(1, { labels: [], comments: [marker], open: true })
      const result = yield* sweep({ version: 2, stale: settings }, github)
      expect(result.failed).toStrictEqual([])
      expect(result.findings).toStrictEqual([
        {
          feature: 'stale',
          rule: 'stale.unmark',
          level: 'warning',
          message: '"stale" was already gone from #1 when smartcloud removed it',
        },
      ])
    }),
  )
})

describe('stale feature: abandoning', () => {
  it.effect('abandons a stale item quiet for abandonedAfterDays: label, one marked comment, and close', () =>
    Effect.gen(function* () {
      const github = memory([
        item(1, { labels: ['stale'], updatedAt: daysAgo(7) }),
        item(2, { labels: ['stale'], updatedAt: daysAgo(6) }),
      ])
      const result = yield* sweep({ version: 2, stale: settings }, github)
      expect(labelsOf(github, 1)).toStrictEqual(['stale', 'abandoned'])
      expect(commentsOf(github, 1)).toStrictEqual([`${ABANDONED_MARKER}\nClosing as abandoned.`])
      expect(github.state.issues.get(1)?.open).toBe(false)
      expect(labelsOf(github, 2)).toStrictEqual(['stale'])
      expect(github.state.issues.get(2)?.open).toBe(true)
      expect(result.changes.map((change) => change.description)).toStrictEqual([
        'labelled #1 "abandoned"',
        'commented on #1 that it is abandoned',
        'closed #1 as abandoned',
      ])
    }),
  )

  it.effect('uses a custom abandoned label, and neither comments nor closes unless asked', () =>
    Effect.gen(function* () {
      const github = memory([item(1, { labels: ['STALE'], updatedAt: daysAgo(10) })], {
        1: [{ id: 3, author: 'smartcloud[bot]', body: `${ABANDONED_MARKER}\nold` }],
      })
      const { abandonedComment: _comment, close: _close, ...rest } = settings
      yield* sweep({ version: 2, stale: { ...rest, abandonedLabel: 'gone' } }, github)
      expect(labelsOf(github, 1)).toStrictEqual(['STALE', 'gone'])
      expect(commentsOf(github, 1)).toStrictEqual([`${ABANDONED_MARKER}\nold`])
      expect(github.state.issues.get(1)?.open).toBe(true)
    }),
  )

  it.effect('edits an existing abandoned comment instead of adding another', () =>
    Effect.gen(function* () {
      const github = memory([item(1, { labels: ['stale'], updatedAt: daysAgo(10) })], {
        1: [{ id: 3, author: 'smartcloud[bot]', body: `${ABANDONED_MARKER}\nold` }],
      })
      yield* sweep({ version: 2, stale: { ...settings, close: false } }, github)
      expect(commentsOf(github, 1)).toStrictEqual([`${ABANDONED_MARKER}\nClosing as abandoned.`])
      expect(github.state.issues.get(1)?.open).toBe(true)
    }),
  )

  it.effect('leaves items already abandoned, and stale items when abandoning is not configured', () =>
    Effect.gen(function* () {
      const github = memory([
        item(1, { labels: ['stale', 'abandoned'], updatedAt: daysAgo(40) }),
        item(2, { labels: ['stale'], updatedAt: daysAgo(400) }),
      ])
      const { abandonedAfterDays: _days, ...never } = settings
      const once = yield* sweep(
        { version: 2, stale: settings },
        memory([item(1, { labels: ['stale', 'abandoned'], updatedAt: daysAgo(40) })]),
      )
      expect(once.changes).toStrictEqual([])
      const result = yield* sweep({ version: 2, stale: never }, github)
      expect(result.changes).toStrictEqual([])
      expect(labelsOf(github, 2)).toStrictEqual(['stale'])
    }),
  )
})

describe('stale feature: when it runs', () => {
  it.effect('runs on schedule and workflow_dispatch, and does nothing on other repository events', () =>
    Effect.gen(function* () {
      const onPush = memory([item(1, { updatedAt: daysAgo(40) })])
      const pushed = yield* sweep({ version: 2, stale: settings }, onPush, 'push')
      expect(pushed.ran).toStrictEqual(['stale'])
      expect(labelsOf(onPush, 1)).toStrictEqual([])
      const onDispatch = memory([item(1, { updatedAt: daysAgo(40) })])
      yield* sweep({ version: 2, stale: settings }, onDispatch, 'workflow_dispatch')
      expect(labelsOf(onDispatch, 1)).toStrictEqual(['stale'])
    }),
  )

  it.effect('is enabled only by a stale section, and a sweep without one does nothing', () =>
    Effect.gen(function* () {
      expect(stale.enabled?.({ version: 2 })).toBe(false)
      expect(stale.enabled?.({ version: 2, stale: settings })).toBe(true)
      const github = memory([item(1, { updatedAt: daysAgo(40) })])
      const report = yield* makeReport
      yield* sweepStale({ version: 2 }).pipe(
        Effect.provideService(GitHub, github.service),
        Effect.provideService(Report, report),
      )
      expect(labelsOf(github, 1)).toStrictEqual([])
    }),
  )
})

describe('markedSince', () => {
  it.each([
    [
      'reads the mark time from the stale comment',
      [{ id: 1, author: 'a', body: staleBody('x', new Date(0)) }],
      new Date(0),
    ],
    [
      'ignores comments without the marker',
      [{ id: 1, author: 'a', body: '<!-- smartcloud:stale-since 2026-01-01T00:00:00.000Z -->' }],
      undefined,
    ],
    ['ignores a stale comment without a mark time', [{ id: 1, author: 'a', body: `${STALE_MARKER}\ntext` }], undefined],
    [
      'ignores an unreadable mark time',
      [{ id: 1, author: 'a', body: `${STALE_MARKER}\n<!-- smartcloud:stale-since 2026-99-99T99:99 -->` }],
      undefined,
    ],
    ['finds nothing on an item without comments', [], undefined],
  ] as const)('%s', (_name, comments, expected) => {
    expect(markedSince(comments)).toStrictEqual(expected)
  })
})
