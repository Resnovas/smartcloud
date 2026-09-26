/**
 * @file tests/reporting/src/reporting.spec.ts
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
import { Effect } from 'effect'
import type { Finding, RunResult } from '@resnovas/engine'
import { DryRun, DryRunLog, Forbidden, GitHub, makeMemoryGitHub } from '@resnovas/integrations.github'
import {
  annotationLines,
  checkRunsFor,
  commentBody,
  conclusionOf,
  findingsTable,
  MARKER,
  publishReport,
  summaryMarkdown,
} from '@resnovas/reporting'

const subject = {
  kind: 'pullRequest' as const,
  number: 7,
  title: 'feat: x',
  body: '',
  author: 'jane',
  open: true,
  locked: false,
  labels: [],
  updatedAt: new Date(0),
}

const error: Finding = {
  feature: 'commits',
  rule: 'DCO',
  level: 'error',
  message: 'No Signed-off-by | for <a@b>',
  link: 'https://x/CONTRIBUTING.md#dco',
  commit: 'abcdef1234567890',
}
const warning: Finding = { feature: 'sync', rule: 'SYNC', level: 'warning', message: 'edits\na synced file', path: 'LICENSE', line: 3 }
const notice: Finding = { feature: 'reviews', rule: 'REVIEW', level: 'notice', message: 'gate open' }

const run = (overrides: Partial<RunResult> = {}): RunResult => ({
  envelope: { kind: 'pullRequest', event: 'pull_request', action: 'opened', subject, headSha: 'abc123' },
  ran: ['commits', 'sync', 'reviews'],
  skipped: [{ feature: 'stale', reason: 'does not handle pullRequest events' }],
  failed: [],
  findings: [error, warning, notice],
  changes: [{ feature: 'labels', description: 'added label bug to #7' }],
  ...overrides,
})

describe('formatting', () => {
  it('concludes failure on errors, neutral on warnings, success otherwise', () => {
    expect(conclusionOf([error, warning])).toBe('failure')
    expect(conclusionOf([warning, notice])).toBe('neutral')
    expect(conclusionOf([notice])).toBe('success')
  })

  it('renders findings as a table, escaping pipes and newlines from pull request text', () => {
    const table = findingsTable([error, warning])
    expect(table).toContain('| error | [`DCO`](https://x/CONTRIBUTING.md#dco) | abcdef123456 | No Signed-off-by \\| for <a@b> |')
    expect(table).toContain('| warning | `SYNC` | LICENSE:3 | edits a synced file |')
    expect(findingsTable([])).toBe('')
    const { line: _line, ...unlocated } = warning
    expect(findingsTable([{ ...unlocated, path: 'x' }])).toContain('| x |')
    expect(findingsTable([notice])).toContain('| notice | `REVIEW` |  | gate open |')
  })

  it('escapes pipes and line breaks in file names, so a path cannot add columns or rows', () => {
    const table = findingsTable([{ ...warning, path: 'docs/a|b\r\nc.md' }])
    expect(table).toContain('| warning | `SYNC` | docs/a\\|b c.md:3 | edits a synced file |')
    expect(table.split('\n')).toHaveLength(3)
  })

  it('writes one comment body with the marker, listing only actionable findings', () => {
    const body = commentBody([error, notice])
    expect(body.startsWith(MARKER)).toBe(true)
    expect(body).toContain('found 1 error(s), 0 warning(s)')
    expect(body).not.toContain('gate open')
    expect(commentBody([notice])).toBe(`${MARKER}\nAll smartcloud checks pass.`)
  })

  it('summarises features, failures, skips, findings and changes', () => {
    const summary = summaryMarkdown(run({ failed: [{ feature: 'broken', message: 'boom' }] }))
    expect(summary).toContain('Event: `pull_request` (opened) on #7')
    expect(summary).toContain('| commits | 1 error(s), 0 warning(s) |')
    expect(summary).toContain('| reviews | passed |')
    expect(summary).toContain('| broken | failed to run |')
    expect(summary).toContain('**broken** failed to run:')
    expect(summary).toContain('- stale: does not handle pullRequest events')
    expect(summary).toContain('- labels: added label bug to #7')
    const quiet = summaryMarkdown(run({ envelope: { kind: 'repository', event: 'schedule' }, ran: [], skipped: [], findings: [], changes: [] }))
    expect(quiet).toBe('## smartcloud\n\nEvent: `schedule`\n')
  })

  it('writes workflow commands with properties and data escaped', () => {
    expect(annotationLines([error, warning, notice])).toStrictEqual([
      '::error title=DCO::No Signed-off-by | for <a@b> (commit abcdef123456) See https://x/CONTRIBUTING.md#dco',
      '::warning title=SYNC,file=LICENSE,line=3::edits%0Aa synced file',
      '::notice title=REVIEW::gate open',
    ])
    expect(annotationLines([{ ...notice, rule: 'a:b,c', message: '100%\r' }])).toStrictEqual(['::notice title=a%3Ab%2Cc::100%25%0D'])
  })

  it('builds one check run per feature, failing features that broke, with annotations for located findings', () => {
    const runs = checkRunsFor(run({ failed: [{ feature: 'broken', message: 'boom' }] }), 'abc123')
    expect(runs.map((entry) => [entry.name, entry.conclusion, entry.title])).toStrictEqual([
      ['smartcloud / commits', 'failure', '1 error(s), 0 warning(s)'],
      ['smartcloud / sync', 'neutral', '0 error(s), 1 warning(s)'],
      ['smartcloud / reviews', 'success', 'passed'],
      ['smartcloud / broken', 'failure', 'failed to run'],
    ])
    expect(runs[1]?.annotations).toStrictEqual([{ path: 'LICENSE', line: 3, level: 'warning', message: 'edits\na synced file', title: 'SYNC' }])
    expect(runs[0]?.annotations).toStrictEqual([])
    expect(checkRunsFor(run({ ran: ['quiet'], findings: [] }), 'x')[0]?.summary).toBe('No findings.')
    expect(checkRunsFor(run({ ran: ['r'], findings: [{ ...notice, feature: 'r', path: 'a.ts', line: 1 }] }), 'x')[0]?.annotations).toStrictEqual([
      { path: 'a.ts', line: 1, level: 'notice', message: 'gate open', title: 'REVIEW' },
    ])
  })
})

describe('publishReport', () => {
  it.effect('creates check runs and one comment, then updates the comment in place', () =>
    Effect.gen(function* () {
      const { service, state } = makeMemoryGitHub()
      const first = yield* publishReport(run()).pipe(Effect.provideService(GitHub, service))
      expect(first).toMatchObject({ checkRuns: 3, comment: 'created', warnings: [] })
      expect(state.checkRuns.map((entry) => entry.name)).toStrictEqual(['smartcloud / commits', 'smartcloud / sync', 'smartcloud / reviews'])
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
          issues: new Map([[7, { labels: [], open: true, comments: [{ id: 1, body: 'a person quoting <!--smartcloud: x-->', author: 'jane', bot: false }, { id: 2, body: legacy, author: 'bot', bot: true }] }]]),
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
      const { service, state } = makeMemoryGitHub({ issues: new Map([[7, { labels: [], open: true, comments: [...forged] }]]) })
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
        issues: new Map([[7, { labels: [], open: true, comments: [{ id: 1, body: `${MARKER}\nold`, author: 'Release-Robot', bot: false }] }]]),
      })
      const published = yield* publishReport(run(), { trustedAuthors: ['@release-robot'] }).pipe(Effect.provideService(GitHub, service))
      expect(published.comment).toBe('updated')
      expect(state.issues.get(7)?.comments).toHaveLength(1)
      expect(state.issues.get(7)?.comments[0]?.body).not.toContain('old')
    }),
  )

  it.effect('under the dry-run layer records every check run and comment write, and changes nothing', () =>
    Effect.gen(function* () {
      const { service, state } = makeMemoryGitHub({
        issues: new Map([[7, { labels: [], open: true, comments: [{ id: 1, body: `${MARKER}\nold`, author: 'bot', bot: true }] }]]),
      })
      const { published, writes } = yield* Effect.gen(function* () {
        const published = yield* publishReport(run())
        return { published, writes: yield* Effect.flatMap(DryRunLog, (log) => log.writes) }
      }).pipe(Effect.provide(DryRun), Effect.provideService(GitHub, service))
      expect(published).toMatchObject({ checkRuns: 3, comment: 'updated', warnings: [] })
      expect(writes.map((write) => write.operation)).toStrictEqual(['createCheckRun', 'createCheckRun', 'createCheckRun', 'updateComment'])
      expect(writes[3]?.details).toMatchObject({ id: 1, body: expect.stringContaining('found 1 error(s), 1 warning(s)') })
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
      expect((yield* publishReport(run({ findings: [notice] })).pipe(Effect.provideService(GitHub, service))).comment).toBe('skipped')
      expect((yield* publishReport(run(), { comment: false }).pipe(Effect.provideService(GitHub, service))).comment).toBe('skipped')
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
        listComments: () => Effect.fail(new Forbidden({ operation: 'listComments', detail: 'Resource not accessible by integration' })),
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
