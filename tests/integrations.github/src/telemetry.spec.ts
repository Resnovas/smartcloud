/**
 * @file tests/integrations.github/src/telemetry.spec.ts
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
import { Effect, Metric, Redacted, Schedule } from 'effect'
import { DryRun, GitHub, GitHubMemory, githubDuration, githubRequests, githubSpanName, makeLiveGitHub } from '@resnovas/integrations.github'
import { fakeFetch, type Routes } from './fake-fetch.js'
import { carried, observe, spanNamed } from './observe.js'

const REPO = '/repos/Resnovas/example'

const live = (routes: Routes) =>
  makeLiveGitHub({
    token: Redacted.make('test-token'),
    coordinates: { owner: 'Resnovas', repo: 'example' },
    fetch: fakeFetch(routes).fetch,
    retry: Schedule.recurs(2),
  })

const requests = (operation: string, outcome: string) =>
  Effect.map(Metric.value(Metric.tagged(Metric.tagged(githubRequests, 'operation', operation), 'outcome', outcome)), (state) => state.count)

const timings = (operation: string, outcome: string) =>
  Effect.map(Metric.value(Metric.tagged(Metric.tagged(githubDuration, 'operation', operation), 'outcome', outcome)), (state) => state.count)

describe('GitHub telemetry', () => {
  it('names spans after the operation, with steps as children', () => {
    expect(githubSpanName('listLabels')).toBe('smartcloud.github.listLabels')
    expect(githubSpanName('proposeChanges: create blob')).toBe('smartcloud.github.proposeChanges.createBlob')
    expect(githubSpanName('updateCheckRun: append annotations')).toBe('smartcloud.github.updateCheckRun.appendAnnotations')
  })

  it.effect('traces, counts and times each call once, with its operation, outcome and status', () =>
    Effect.gen(function* () {
      const github = yield* live({
        [`GET ${REPO}`]: {
          body: { owner: { login: 'Resnovas' }, name: 'example', full_name: 'Resnovas/example', node_id: 'R_1', private: false, default_branch: 'main' },
        },
        [`GET ${REPO}/contents/missing.yml`]: { status: 404, body: { message: 'Not Found' } },
        [`GET ${REPO}/labels`]: [{ status: 502, body: {} }, { body: [{ name: 'bug', color: 'd73a4a', description: null }] }],
      })
      const before = {
        success: yield* requests('getRepository', 'success'),
        missing: yield* requests('getFile', 'NotFound'),
        labels: yield* requests('listLabels', 'success'),
        timed: yield* timings('getRepository', 'success'),
      }
      const observed = yield* observe(
        Effect.all([github.getRepository, Effect.flip(github.getFile({ owner: 'Resnovas', repo: 'example', path: 'missing.yml' })), github.listLabels]),
      )

      const repository = spanNamed(observed, 'smartcloud.github.getRepository')
      expect(repository.kind).toBe('client')
      expect(Object.fromEntries(repository.attributes)).toStrictEqual({ 'github.operation': 'getRepository', outcome: 'success', 'http.status_code': 200 })
      expect(Object.fromEntries(spanNamed(observed, 'smartcloud.github.getFile').attributes)).toStrictEqual({
        'github.operation': 'getFile',
        outcome: 'NotFound',
        'http.status_code': 404,
      })
      // A paginated listing has no single status; one retried call is still one span.
      expect(observed.spans.filter((span) => span.name === 'smartcloud.github.listLabels')).toHaveLength(1)
      expect(Object.fromEntries(spanNamed(observed, 'smartcloud.github.listLabels').attributes)).toStrictEqual({ 'github.operation': 'listLabels', outcome: 'success' })

      expect(yield* requests('getRepository', 'success')).toBe(before.success + 1)
      expect(yield* requests('getFile', 'NotFound')).toBe(before.missing + 1)
      expect(yield* requests('listLabels', 'success')).toBe(before.labels + 1)
      expect(yield* timings('getRepository', 'success')).toBe(before.timed + 1)

      expect(observed.logs).toContainEqual({
        message: 'github getFile: NotFound (404) in 0 ms',
        level: 'DEBUG',
        annotations: { 'github.operation': 'getFile', outcome: 'NotFound', 'http.status_code': 404, duration_ms: 0 },
      })
      expect(observed.logs).toContainEqual(expect.objectContaining({ message: 'github listLabels: success in 0 ms' }))
      for (const value of carried(observed)) for (const secret of ['Resnovas', 'example', 'missing.yml']) expect(value).not.toContain(secret)
    }),
  )

  it.effect('records only the method of a repository request and the kind of a GraphQL document', () =>
    Effect.gen(function* () {
      const github = yield* live({
        [`GET ${REPO}/rulesets`]: { body: [] },
        [`POST ${REPO}/rulesets`]: { status: 403, body: { message: 'Resource not accessible by integration' } },
        [`POST /graphql`]: { body: { data: { x: 1 } } },
      })
      const observed = yield* observe(
        Effect.all([
          github.repositoryRequest({ method: 'GET', path: '/rulesets' }),
          Effect.flip(github.repositoryRequest({ method: 'POST', path: '/rulesets', body: { name: 'main' } })),
          github.graphql('query { x }', {}),
          github.graphql('mutation { x }', {}),
        ]),
      )
      const rest = observed.spans.filter((span) => span.name === 'smartcloud.github.repositoryRequest').map((span) => Object.fromEntries(span.attributes))
      expect(rest).toStrictEqual([
        { 'github.operation': 'repositoryRequest', 'http.method': 'GET', outcome: 'success', 'http.status_code': 200 },
        { 'github.operation': 'repositoryRequest', 'http.method': 'POST', outcome: 'Forbidden', 'http.status_code': 403 },
      ])
      expect(observed.spans.filter((span) => span.name === 'smartcloud.github.graphql').map((span) => span.attributes.get('graphql.operation'))).toStrictEqual([
        'query',
        'mutation',
      ])
      for (const value of carried(observed)) for (const secret of ['Resnovas', 'example', 'rulesets']) expect(value).not.toContain(secret)
    }),
  )

  it.effect('logs each write a dry run records, by operation only', () =>
    Effect.gen(function* () {
      const observed = yield* observe(Effect.flatMap(GitHub, (github) => github.createLabel({ name: 'secret-label', color: '000000', description: '' })))
      expect(observed.logs).toStrictEqual([
        { message: 'dry run: recorded createLabel', level: 'DEBUG', annotations: { 'github.operation': 'createLabel', dry_run: true } },
      ])
    }).pipe(Effect.provide(DryRun), Effect.provide(GitHubMemory())),
  )
})
