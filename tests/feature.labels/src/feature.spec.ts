/**
 * @file tests/feature.labels/src/feature.spec.ts
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
import type { Subject } from '@resnovas/conditions'
import { makeReport, Report, runFeatures } from '@resnovas/engine'
import { labels } from '@resnovas/feature.labels'
import { GitHub } from '@resnovas/integrations.github'
import { config, memoryWith, pullRequest } from './fixtures.js'

describe('labels feature: apply', () => {
  it.effect('falls back to the envelope subject when the runner gave none', () =>
    Effect.gen(function* () {
      const { service, state } = memoryWith(3, [])
      const subject: Subject = {
        kind: 'issue',
        number: 3,
        title: 'bug: x',
        body: '',
        author: 'sam',
        open: true,
        locked: false,
        labels: [],
        updatedAt: new Date(0),
      }
      const report = yield* makeReport
      yield* labels
        .run({ config, envelope: { kind: 'issue', event: 'issues', subject } })
        .pipe(Effect.provideService(GitHub, service), Effect.provideService(Report, report))
      expect(state.issues.get(3)?.labels).toStrictEqual(['Type: Bug', 'triage'])
    }),
  )

  it('is enabled by a labels or labelling section, and not otherwise', () => {
    expect(labels.enabled?.({ version: 2 })).toBe(false)
    expect(labels.enabled?.({ version: 2, labels: {} })).toBe(true)
    expect(labels.enabled?.({ version: 2, labelling: {} })).toBe(true)
    expect(labels.enabled?.({ version: 2, sizeLabels: {} })).toBe(true)
  })
})

describe('labels feature: size labels', () => {
  it.effect('moves a pull request to the size its changed lines fall in', () =>
    Effect.gen(function* () {
      // The fixture pull request changes 10 + 2 lines: Size: S.
      const { service, state } = memoryWith(7, ['Size: XL', 'keep'])
      const result = yield* runFeatures({
        config: { version: 2, sizeLabels: {} },
        event: 'pull_request',
        payload: pullRequest(['Size: XL', 'keep']),
        features: [labels],
      }).pipe(Effect.provideService(GitHub, service))
      expect(result.failed).toStrictEqual([])
      expect(state.issues.get(7)?.labels).toStrictEqual(['keep', 'Size: S'])
    }),
  )

  it.effect('creates the size labels when it syncs the repository', () =>
    Effect.gen(function* () {
      const { service, state } = memoryWith(7, [])
      yield* runFeatures({
        config: { version: 2, sizeLabels: {} },
        event: 'schedule',
        payload: {},
        features: [labels],
      }).pipe(Effect.provideService(GitHub, service))
      expect(state.labels.map((label) => label.name)).toStrictEqual([
        'Size: XS',
        'Size: S',
        'Size: M',
        'Size: L',
        'Size: XL',
      ])
    }),
  )

  it('needs no facets beyond the pull request itself', () => {
    expect([...(labels.facets?.({ version: 2, sizeLabels: {} }) ?? [])]).toStrictEqual([])
  })
})
