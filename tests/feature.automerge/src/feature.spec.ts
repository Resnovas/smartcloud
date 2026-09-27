/**
 * @file tests/feature.automerge/src/feature.spec.ts
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
import { autoMergeFeature } from '@resnovas/feature.automerge'
import { GitHub } from '@resnovas/integrations.github'
import { Effect } from 'effect'
import { config, memory, PATCH, payload, run } from './fixtures.js'

describe('autoMergeFeature', () => {
  it('is enabled only by an autoMerge section, and handles pull request events', () => {
    expect(autoMergeFeature.enabled?.({ version: 2 })).toBe(false)
    expect(autoMergeFeature.enabled?.({ version: 2, autoMerge: {} })).toBe(true)
    expect(autoMergeFeature.handles).toStrictEqual(['pullRequest'])
  })

  it('loads the facets its rules need', () => {
    const files = { condition: [{ type: 'filesMatch' as const, condition: 'package.json' }] }
    expect([...(autoMergeFeature.facets?.(config({ rules: { deps: { when: files } } })) ?? [])]).toStrictEqual([
      'files',
    ])
    expect(autoMergeFeature.facets?.({ version: 2 }).size).toBe(0)
    expect(autoMergeFeature.facets?.(config({ rules: { patch: { when: PATCH } } })).size).toBe(0)
  })

  it.effect('runs on review events too', () =>
    Effect.gen(function* () {
      const github = memory()
      const result = yield* run(config(), github, payload({ action: 'submitted' }), 'pull_request_review')
      expect(result.ran).toStrictEqual(['automerge'])
      expect(github.mutations).toHaveLength(1)
    }),
  )

  it.effect('does nothing for an envelope that is not a pull request, and falls back to its subject', () =>
    Effect.gen(function* () {
      const github = memory()
      const report = yield* makeReport
      const provide = <A, E>(effect: Effect.Effect<A, E, GitHub | Report>) =>
        effect.pipe(Effect.provideService(GitHub, github.service), Effect.provideService(Report, report))
      yield* provide(autoMergeFeature.run({ config: config(), envelope: { kind: 'repository', event: 'push' } }))
      expect(github.mutations).toStrictEqual([])
      const body = payload()
      yield* provide(
        autoMergeFeature.run({
          config: config(),
          envelope: {
            kind: 'pullRequest',
            event: 'pull_request',
            headSha: 'head',
            subject: {
              kind: 'pullRequest',
              number: 7,
              title: body.pull_request.title,
              body: '',
              author: 'dependabot[bot]',
              open: true,
              locked: false,
              labels: [],
              assignees: [],
              updatedAt: new Date(0),
            },
          },
        }),
      )
      expect(github.mutations).toHaveLength(1)
    }),
  )
})
