/**
 * @file tests/engine/src/runner.spec.ts
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
import { Effect, Exit, Fiber, TestClock } from 'effect'
import type { SmartcloudConfig } from '@resnovas/config'
import { type Feature, loadFacets, Report, runFeatures } from '@resnovas/engine'
import { GitHubMemory, makeMemoryGitHub } from '@resnovas/integrations.github'
import { Forbidden, GitHub } from '@resnovas/integrations.github'
import { issuePayload, pullRequestPayload } from './fixtures.js'

const config: SmartcloudConfig = { version: 2 }

const feature = (name: string, overrides: Partial<Feature> = {}): Feature => ({
  name,
  handles: ['pullRequest', 'issue', 'repository'],
  run: () => Report.pipe(Effect.flatMap((report) => report.add({ feature: name, rule: `${name}.rule`, level: 'notice', message: 'ran' }))),
  ...overrides,
})

const memory = () =>
  makeMemoryGitHub({
    pulls: new Map([
      [
        7,
        {
          commits: [{ sha: 'a', message: 'feat: x', authorName: 'Jane', authorEmail: 'jane@example.com', parents: 1 }],
          files: ['src/a.ts'],
          reviews: [{ author: 'ann', state: 'APPROVED' }],
          requestedReviewers: ['bo'],
          submittedReviews: [],
        },
      ],
    ]),
  })

describe('runFeatures', () => {
  it.effect('runs the features that handle the event, in the order given, whatever order they finish in', () =>
    Effect.gen(function* () {
      const slow = feature('slow', { run: () => Effect.zipRight(Effect.sleep('2 seconds'), feature('slow').run(undefined as never)) })
      const fiber = yield* Effect.fork(
        runFeatures({ config, event: 'pull_request', payload: pullRequestPayload, features: [slow, feature('fast')] }),
      )
      yield* TestClock.adjust('2 seconds')
      const result = yield* Fiber.join(fiber)
      expect(result.ran).toStrictEqual(['slow', 'fast'])
      expect(result.findings.map((finding) => finding.feature)).toStrictEqual(['fast', 'slow'])
      expect(result.envelope.kind).toBe('pullRequest')
    }).pipe(Effect.provide(GitHubMemory())),
  )

  it.effect('isolates a failing feature: the others still run, and the failure is recorded', () =>
    Effect.gen(function* () {
      const broken = feature('broken', { run: () => Effect.fail(new Error('boom')) })
      const result = yield* runFeatures({ config, event: 'issues', payload: issuePayload, features: [broken, feature('ok')] })
      expect(result.ran).toStrictEqual(['ok'])
      expect(result.failed).toHaveLength(1)
      expect(result.failed[0]).toMatchObject({ feature: 'broken', message: expect.stringContaining('boom') })
    }).pipe(Effect.provide(GitHubMemory())),
  )

  it.effect('a facet GitHub cannot serve fails only the features that need it', () =>
    Effect.gen(function* () {
      const { service } = memory()
      const github = { ...service, listReviews: () => Effect.fail(new Forbidden({ operation: 'listReviews', detail: 'no access' })) }
      const seen: Array<unknown> = []
      const needsReviews = feature('reviews', { facets: () => new Set(['reviews', 'files'] as const) })
      const needsFiles = feature('files', {
        facets: () => new Set(['files'] as const),
        run: (context) => Effect.sync(() => void seen.push(context.subject)),
      })
      const result = yield* runFeatures({
        config,
        event: 'pull_request',
        payload: pullRequestPayload,
        features: [needsReviews, needsFiles, feature('plain')],
      }).pipe(Effect.provideService(GitHub, github))
      expect(result.ran).toStrictEqual(['files', 'plain'])
      expect(result.failed).toStrictEqual([
        { feature: 'reviews', message: expect.stringContaining('could not load reviews: Forbidden: listReviews: forbidden (no access)') },
      ])
      expect(seen[0]).toMatchObject({ files: ['src/a.ts'] })
      expect(seen[0]).not.toHaveProperty('reviews')
    }),
  )

  it.effect('interrupting the run interrupts the features instead of recording them as failed', () =>
    Effect.gen(function* () {
      let cleanedUp = false
      const endless = feature('endless', {
        run: () => Effect.never.pipe(Effect.ensuring(Effect.sync(() => void (cleanedUp = true)))),
      })
      const fiber = yield* Effect.fork(runFeatures({ config, event: 'issues', payload: issuePayload, features: [endless] }))
      yield* TestClock.adjust('1 second')
      const exit = yield* Fiber.interrupt(fiber)
      expect(Exit.isInterrupted(exit)).toBe(true)
      expect(cleanedUp).toBe(true)
    }).pipe(Effect.provide(GitHubMemory())),
  )

  it.effect('a feature that interrupts itself stops the run rather than passing as a failure', () =>
    Effect.gen(function* () {
      const quits = feature('quits', { run: () => Effect.interrupt })
      const exit = yield* Effect.exit(runFeatures({ config, event: 'issues', payload: issuePayload, features: [quits, feature('ok')] }))
      expect(Exit.isInterrupted(exit)).toBe(true)
    }).pipe(Effect.provide(GitHubMemory())),
  )

  it.effect('skips features for other kinds of event and features the config does not enable, saying why', () =>
    Effect.gen(function* () {
      const result = yield* runFeatures({
        config,
        event: 'schedule',
        payload: {},
        features: [
          feature('pr-only', { handles: ['pullRequest'] }),
          feature('off', { enabled: () => false }),
          feature('on', { enabled: () => true }),
        ],
      })
      expect(result.ran).toStrictEqual(['on'])
      expect(result.skipped).toStrictEqual([
        { feature: 'pr-only', reason: 'does not handle repository events' },
        { feature: 'off', reason: 'not configured' },
      ])
    }).pipe(Effect.provide(GitHubMemory())),
  )

  it.effect('skips a feature turned off from outside the config, whatever it handles, saying why', () =>
    Effect.gen(function* () {
      const result = yield* runFeatures({
        config,
        event: 'schedule',
        payload: {},
        features: [feature('flagged', { handles: ['pullRequest'] }), feature('on')],
        turnedOff: new Map([['flagged', 'turned off by feature flag smartcloud-flagged']]),
      })
      expect(result.ran).toStrictEqual(['on'])
      expect(result.skipped).toStrictEqual([{ feature: 'flagged', reason: 'turned off by feature flag smartcloud-flagged' }])
    }).pipe(Effect.provide(GitHubMemory())),
  )

  it.effect('loads only the facets the features ask for, and hands features the loaded subject', () =>
    Effect.gen(function* () {
      const seen: Array<unknown> = []
      const needsFiles = feature('files', {
        facets: () => new Set(['files', 'commits'] as const),
        run: (context) => Effect.sync(() => void seen.push(context.subject)),
      })
      yield* runFeatures({ config, event: 'pull_request', payload: pullRequestPayload, features: [needsFiles] })
      expect(seen[0]).toMatchObject({ files: ['src/a.ts'], commits: [{ sha: 'a' }] })
      expect(seen[0]).not.toHaveProperty('reviews')
    }).pipe(Effect.provideService(GitHub, memory().service)),
  )

  it.effect('an unsupported event is a notice and runs nothing', () =>
    Effect.gen(function* () {
      const result = yield* runFeatures({ config, event: 'release', payload: {}, features: [feature('any')] })
      expect(result.ran).toStrictEqual([])
      expect(result.findings).toStrictEqual([
        { feature: 'engine', rule: 'unsupported-event', level: 'notice', message: 'smartcloud does not act on release events' },
      ])
    }).pipe(Effect.provide(GitHubMemory())),
  )

  it.effect('records changes as well as findings', () =>
    Effect.gen(function* () {
      const changer = feature('changer', {
        run: () => Report.pipe(Effect.flatMap((report) => report.change({ feature: 'changer', description: 'added label bug' }))),
      })
      const result = yield* runFeatures({ config, event: 'issues', payload: issuePayload, features: [changer] })
      expect(result.changes).toStrictEqual([{ feature: 'changer', description: 'added label bug' }])
    }).pipe(Effect.provide(GitHubMemory())),
  )
})

describe('loadFacets', () => {
  it.effect('loads every facet concurrently onto a pull request', () =>
    Effect.gen(function* () {
      const { service } = memory()
      const subject = yield* loadFacets(
        { kind: 'pullRequest', number: 7, title: 't', body: '', author: 'a', open: true, locked: false, labels: [], updatedAt: new Date(0) },
        new Set(['files', 'reviews', 'pendingReviewers', 'commits'] as const),
      ).pipe(Effect.provideService(GitHub, service))
      expect(subject).toMatchObject({ files: ['src/a.ts'], reviews: [{ author: 'ann' }], pendingReviewers: 1, commits: [{ sha: 'a' }] })
    }),
  )

  it.effect('leaves issues and empty requests alone', () =>
    Effect.gen(function* () {
      const issue = { kind: 'issue' as const, number: 3, title: 't', body: '', author: 'a', open: true, locked: false, labels: [], updatedAt: new Date(0) }
      expect(yield* loadFacets(issue, new Set(['files'] as const))).toBe(issue)
      const pr = { ...issue, kind: 'pullRequest' as const }
      expect(yield* loadFacets(pr, new Set())).toBe(pr)
    }).pipe(Effect.provide(GitHubMemory())),
  )
})
