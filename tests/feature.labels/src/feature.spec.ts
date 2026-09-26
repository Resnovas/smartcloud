/**
 * @file tests/feature.labels/src/feature.spec.ts
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
import type { Subject } from '@resnovas/conditions'
import { makeReport, Report } from '@resnovas/engine'
import { labels } from '@resnovas/feature.labels'
import { GitHub } from '@resnovas/integrations.github'
import { config, memoryWith } from './fixtures.js'

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
  })
})
