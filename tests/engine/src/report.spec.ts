/**
 * @file tests/engine/src/report.spec.ts
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
import { Effect, Metric } from 'effect'
import { findingsCounter, makeReport } from '@resnovas/engine'

const count = (level: string, feature: string) =>
  Effect.map(
    Metric.value(Metric.tagged(Metric.tagged(findingsCounter, 'level', level), 'feature', feature)),
    (state) => state.count,
  )

describe('makeReport', () => {
  it.effect('starts empty and keeps findings and changes in the order they were recorded', () =>
    Effect.gen(function* () {
      const report = yield* makeReport
      expect(yield* report.snapshot).toStrictEqual({ findings: [], changes: [], facts: [] })
      yield* report.add({ feature: 'labels', rule: 'labels.one', level: 'error', message: 'first' })
      yield* report.change({ feature: 'labels', description: 'labelled #7' })
      yield* report.add({ feature: 'labels', rule: 'labels.two', level: 'notice', message: 'second' })
      const snapshot = yield* report.snapshot
      expect(snapshot.findings.map((finding) => finding.rule)).toStrictEqual(['labels.one', 'labels.two'])
      expect(snapshot.changes).toStrictEqual([{ feature: 'labels', description: 'labelled #7' }])
    }),
  )

  it.effect('keeps what features measured, in order', () =>
    Effect.gen(function* () {
      const report = yield* makeReport
      yield* report.measure({ feature: 'sync', name: 'sync proposed', values: { created: 1, pull_request: 'created' } })
      yield* report.add({ feature: 'sync', rule: 'SYNC', level: 'warning', message: 'edited' })
      const snapshot = yield* report.snapshot
      expect(snapshot.facts).toStrictEqual([
        { feature: 'sync', name: 'sync proposed', values: { created: 1, pull_request: 'created' } },
      ])
      expect(snapshot.findings).toHaveLength(1)
    }),
  )

  it.effect('gives each report its own state', () =>
    Effect.gen(function* () {
      const one = yield* makeReport
      const two = yield* makeReport
      yield* one.change({ feature: 'sync', description: 'wrote a file' })
      expect((yield* two.snapshot).changes).toStrictEqual([])
    }),
  )
})

describe('findingsCounter', () => {
  it.effect('counts each finding by level and feature, and not changes', () =>
    Effect.gen(function* () {
      const errorsBefore = yield* count('error', 'report-spec')
      const noticesBefore = yield* count('notice', 'report-spec')
      const report = yield* makeReport
      yield* report.add({ feature: 'report-spec', rule: 'r', level: 'error', message: 'm' })
      yield* report.add({ feature: 'report-spec', rule: 'r', level: 'error', message: 'm' })
      yield* report.change({ feature: 'report-spec', description: 'd' })
      expect(yield* count('error', 'report-spec')).toBe(errorsBefore + 2)
      expect(yield* count('notice', 'report-spec')).toBe(noticesBefore)
    }),
  )
})
