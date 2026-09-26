/**
 * @file tests/engine/src/telemetry.spec.ts
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
import { Effect, Metric, Option } from 'effect'
import type { Subject } from '@resnovas/conditions'
import type { SmartcloudConfig } from '@resnovas/config'
import { type Feature, featureDuration, findingsCounter, loadFacets, Report, runFeatures } from '@resnovas/engine'
import { GitHubMemory, makeMemoryGitHub, GitHub } from '@resnovas/integrations.github'
import { carried, observe, spanNamed } from './observe.js'
import { pullRequestPayload } from './fixtures.js'

const config: SmartcloudConfig = { version: 2 }

const findings = (level: string, feature: string) =>
  Effect.map(Metric.value(Metric.tagged(Metric.tagged(findingsCounter, 'level', level), 'feature', feature)), (state) => state.count)

const durations = (feature: string, outcome: string) =>
  Effect.map(Metric.value(Metric.tagged(Metric.tagged(featureDuration, 'feature', feature), 'outcome', outcome)), (state) => state.count)

const noting: Feature = {
  name: 'noting',
  handles: ['pullRequest'],
  run: () =>
    Effect.flatMap(Report, (report) =>
      Effect.zipRight(
        report.add({ feature: 'noting', rule: 'noting.rule', level: 'warning', message: 'jane broke "feat(labels): sync labels"' }),
        report.change({ feature: 'noting', description: 'labelled #7' }),
      ),
    ),
}
const broken: Feature = { name: 'broken', handles: ['pullRequest'], run: () => Effect.fail(new Error('boom in Resnovas/example')) }
const issuesOnly: Feature = { name: 'issues-only', handles: ['issue'], run: () => Effect.void }

describe('engine telemetry', () => {
  it.effect('traces the run and each feature, with outcomes and counts only', () =>
    Effect.gen(function* () {
      const warningsBefore = yield* findings('warning', 'noting')
      const successBefore = yield* durations('noting', 'success')
      const failureBefore = yield* durations('broken', 'failure')
      const observed = yield* observe(
        runFeatures({ config, event: 'pull_request', payload: pullRequestPayload, features: [noting, broken, issuesOnly] }),
      )

      const run = spanNamed(observed, 'smartcloud.engine.runFeatures')
      expect(Object.fromEntries(run.attributes)).toMatchObject({ github_event: 'pull_request', 'event.kind': 'pullRequest', ran: 1, skipped: 1, failed: 1, findings: 1 })
      const ok = spanNamed(observed, 'smartcloud.feature.noting')
      expect(Object.fromEntries(ok.attributes)).toMatchObject({ feature: 'noting', 'event.kind': 'pullRequest', outcome: 'success', findings: 1, changes: 1 })
      expect(Option.map(ok.parent, (parent) => parent.spanId)).toStrictEqual(Option.some(run.spanId))
      expect(spanNamed(observed, 'smartcloud.feature.broken').attributes.get('outcome')).toBe('failure')

      expect(yield* findings('warning', 'noting')).toBe(warningsBefore + 1)
      expect(yield* durations('noting', 'success')).toBe(successBefore + 1)
      expect(yield* durations('broken', 'failure')).toBe(failureBefore + 1)

      expect(observed.logs).toContainEqual({
        message: 'noting: finding noting.rule',
        level: 'DEBUG',
        annotations: expect.objectContaining({ feature: 'noting', rule: 'noting.rule', level: 'warning', github_event: 'pull_request' }),
      })
      expect(observed.logs).toContainEqual(
        expect.objectContaining({ message: 'noting: success in 0 ms, 1 finding(s), 1 change(s)', level: 'INFO', annotations: expect.objectContaining({ feature: 'noting' }) }),
      )
      expect(observed.logs).toContainEqual(
        expect.objectContaining({ message: 'broken: failure in 0 ms, 0 finding(s), 0 change(s)', level: 'WARN', annotations: expect.objectContaining({ feature: 'broken', outcome: 'failure' }) }),
      )
      expect(observed.logs).toContainEqual(
        expect.objectContaining({ message: 'issues-only: skipped, does not handle pullRequest events', level: 'DEBUG' }),
      )
      expect(observed.logs).toContainEqual(expect.objectContaining({ message: 'engine: 1 ran, 1 skipped, 1 failed, 1 finding(s)', level: 'INFO' }))

      // Messages, titles, logins and failure reasons stay out of spans and logs.
      for (const value of carried(observed)) {
        for (const secret of ['jane', 'feat(labels)', 'Resnovas', 'boom', 'labelled #7']) expect(value).not.toContain(secret)
      }
    }).pipe(Effect.provide(GitHubMemory())),
  )

  it.effect('traces loading facets with the facets asked for', () =>
    Effect.gen(function* () {
      const memory = makeMemoryGitHub({
        pulls: new Map([[7, { commits: [], files: ['src/a.ts'], reviews: [], requestedReviewers: [], submittedReviews: [] }]]),
      })
      const subject: Subject = { kind: 'pullRequest', number: 7, title: 't', body: '', author: 'jane', open: true, locked: false, labels: [], updatedAt: new Date(0) }
      const observed = yield* observe(loadFacets(subject, new Set(['files'] as const))).pipe(Effect.provideService(GitHub, memory.service))
      expect(observed.value).toMatchObject({ files: ['src/a.ts'] })
      expect(Object.fromEntries(spanNamed(observed, 'smartcloud.engine.loadFacets').attributes)).toStrictEqual({
        'subject.kind': 'pullRequest',
        facets: ['files'],
      })
    }),
  )
})
