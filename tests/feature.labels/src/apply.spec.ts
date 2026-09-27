/**
 * @file tests/feature.labels/src/apply.spec.ts
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
import { Effect, Layer } from 'effect'
import type { SmartcloudConfig } from '@resnovas/config'
import { runFeatures } from '@resnovas/engine'
import { aliasesOf, labellingFacets, labelName, labels } from '@resnovas/feature.labels'
import { DryRun, DryRunLog, Forbidden, GitHub, Unavailable } from '@resnovas/integrations.github'
import { config, issue, memoryWith, pullRequest, titled } from './fixtures.js'

describe('labels feature: apply', () => {
  it.effect(
    'adds labels whose rules pass and removes those whose rules fail, by configured name and ignoring case',
    () =>
      Effect.gen(function* () {
        const { service, state } = memoryWith(7, ['type: bug', 'type: feature'], ['docs/readme.md'])
        const result = yield* runFeatures({
          config,
          event: 'pull_request',
          payload: pullRequest(['type: bug', 'type: feature']),
          features: [labels],
        }).pipe(Effect.provideService(GitHub, service))
        expect(state.issues.get(7)?.labels).toStrictEqual(['type: feature', 'docs'])
        expect(result.changes.map((change) => change.description)).toStrictEqual([
          'added label "docs" to #7',
          'removed label "Type: Bug" from #7',
        ])
      }),
  )

  it.effect('applies only the rules for the subject kind, loading the facets the rules need', () =>
    Effect.gen(function* () {
      const { service, state } = memoryWith(3, [])
      const result = yield* runFeatures({ config, event: 'issues', payload: issue([]), features: [labels] }).pipe(
        Effect.provideService(GitHub, service),
      )
      expect(result.failed).toStrictEqual([])
      expect(state.issues.get(3)?.labels).toStrictEqual(['Type: Bug', 'triage'])
    }),
  )

  it.effect('wants a label when any of its rules passes, so two rules never fight', () =>
    Effect.gen(function* () {
      const { service, state } = memoryWith(3, ['shared'])
      const twoRules: SmartcloudConfig = {
        version: 2,
        labelling: {
          first: { label: 'shared', when: titled('^nope') },
          second: { label: 'SHARED', when: titled('^bug') },
        },
      }
      const result = yield* runFeatures({
        config: twoRules,
        event: 'issues',
        payload: issue(['shared']),
        features: [labels],
      }).pipe(Effect.provideService(GitHub, service))
      expect(result.changes).toStrictEqual([])
      expect(state.issues.get(3)?.labels).toStrictEqual(['shared'])
    }),
  )

  it.effect('turns a label that vanished before removal into a warning, not a failure', () =>
    Effect.gen(function* () {
      const { service } = memoryWith(3, [])
      const result = yield* runFeatures({
        config,
        event: 'issues',
        payload: issue(['Type: Feature', 'triage'], 'question: how?'),
        features: [labels],
      }).pipe(Effect.provideService(GitHub, service))
      expect(result.failed).toStrictEqual([])
      expect(result.changes).toStrictEqual([])
      expect(result.findings).toStrictEqual([
        {
          feature: 'labels',
          rule: 'labels.remove',
          level: 'warning',
          message: 'label "Type: Feature" was already gone from #3 when smartcloud removed it',
        },
      ])
    }),
  )

  it.effect('warns rather than fails when a read-only token, as on a fork pull request, forbids the writes', () =>
    Effect.gen(function* () {
      const { service, state } = memoryWith(7, ['type: bug'], ['docs/readme.md'])
      const forbidden = (operation: string) => () =>
        Effect.fail(new Forbidden({ operation, detail: 'Resource not accessible by integration' }))
      const result = yield* runFeatures({
        config,
        event: 'pull_request',
        payload: pullRequest(['type: bug']),
        features: [labels],
      }).pipe(
        Effect.provideService(GitHub, {
          ...service,
          addLabels: forbidden('addLabels'),
          removeLabel: forbidden('removeLabel'),
        }),
      )
      expect(result.failed).toStrictEqual([])
      expect(result.changes).toStrictEqual([])
      expect(state.issues.get(7)?.labels).toStrictEqual(['type: bug'])
      expect(result.findings).toStrictEqual([
        {
          feature: 'labels',
          rule: 'labels.add',
          level: 'warning',
          message:
            'could not add "Type: Feature", "docs" to #7 on a read-only token, for example a pull request from a fork',
        },
        {
          feature: 'labels',
          rule: 'labels.remove',
          level: 'warning',
          message: 'could not remove "Type: Bug" from #7 on a read-only token, for example a pull request from a fork',
        },
      ])
    }),
  )

  it.effect('still fails on any other error from a label write', () =>
    Effect.gen(function* () {
      const { service } = memoryWith(7, [], ['docs/readme.md'])
      const result = yield* runFeatures({
        config,
        event: 'pull_request',
        payload: pullRequest([]),
        features: [labels],
      }).pipe(
        Effect.provideService(GitHub, {
          ...service,
          addLabels: () => Effect.fail(new Unavailable({ operation: 'addLabels', detail: 'HTTP 502' })),
        }),
      )
      expect(result.failed).toStrictEqual([
        { feature: 'labels', message: expect.stringContaining('addLabels: GitHub unavailable (HTTP 502)') },
      ])
    }),
  )

  it.effect('does nothing on a subject when only labels are configured', () =>
    Effect.gen(function* () {
      const { service, state } = memoryWith(3, [])
      const result = yield* runFeatures({
        config: { version: 2, labels: config.labels ?? {} },
        event: 'issues',
        payload: issue([]),
        features: [labels],
      }).pipe(Effect.provideService(GitHub, service))
      expect(result.ran).toStrictEqual(['labels'])
      expect(state.issues.get(3)?.labels).toStrictEqual([])
    }),
  )

  it('asks for the facets of every rule, and none without labelling', () => {
    expect([...labellingFacets(config)]).toStrictEqual(['files'])
    expect(labellingFacets({ version: 2 }).size).toBe(0)
    const issueOnly: SmartcloudConfig = {
      version: 2,
      labelling: {
        big: { label: 'big', on: ['issue'], when: { condition: [{ type: 'filesMatch', condition: '**' }] } },
        both: {
          label: 'both',
          on: ['issue', 'pullRequest'],
          when: { condition: [{ type: 'commitsSignedOff', condition: true }] },
        },
      },
    }
    expect([...labellingFacets(issueOnly)]).toStrictEqual(['commits'])
    expect(labels.facets?.(config)).toStrictEqual(new Set(['files']))
  })

  it('names a rule label by its configured name, or by the key itself', () => {
    expect(labelName(config, 'bug')).toBe('Type: Bug')
    expect(labelName(config, 'docs')).toBe('docs')
    expect(labelName({ version: 2 }, 'docs')).toBe('docs')
  })
})

// `bug` was once called "defect" and "Type: Feature", and `feature` was once "enhancement".
const renamed: SmartcloudConfig = {
  version: 2,
  labels: {
    feature: { name: 'Type: Feature', color: 'a2eeef', aliases: ['enhancement'] },
    bug: { name: 'Type: Bug', color: 'd73a4a', aliases: ['defect', 'Type: Feature', 'docs'] },
  },
  labelling: config.labelling ?? {},
}

describe('labels feature: apply with renamed labels', () => {
  it.effect('replaces the old name a wanted label still carries on an open pull request with its current name', () =>
    Effect.gen(function* () {
      const { service, state } = memoryWith(7, ['Enhancement'])
      const result = yield* runFeatures({
        config: renamed,
        event: 'pull_request',
        payload: pullRequest(['Enhancement']),
        features: [labels],
      }).pipe(Effect.provideService(GitHub, service))
      expect(state.issues.get(7)?.labels).toStrictEqual(['Type: Feature'])
      expect(result.changes.map((change) => change.description)).toStrictEqual([
        'added label "Type: Feature" to #7, replacing its old name "Enhancement"',
        'removed label "Enhancement" (an old name of "Type: Feature") from #7',
      ])
    }),
  )

  it.effect('removes an old name left beside the current one, so the label is on the item once', () =>
    Effect.gen(function* () {
      const { service, state } = memoryWith(7, ['Type: Feature', 'enhancement'])
      const result = yield* runFeatures({
        config: renamed,
        event: 'pull_request',
        payload: pullRequest(['Type: Feature', 'enhancement']),
        features: [labels],
      }).pipe(Effect.provideService(GitHub, service))
      expect(state.issues.get(7)?.labels).toStrictEqual(['Type: Feature'])
      expect(result.changes.map((change) => change.description)).toStrictEqual([
        'removed label "enhancement" (an old name of "Type: Feature") from #7',
      ])
    }),
  )

  it.effect('removes an unwanted label under its old name as well as its current name', () =>
    Effect.gen(function* () {
      const { service, state } = memoryWith(7, ['defect', 'Type: Bug'])
      const result = yield* runFeatures({
        config: renamed,
        event: 'pull_request',
        payload: pullRequest(['defect', 'Type: Bug']),
        features: [labels],
      }).pipe(Effect.provideService(GitHub, service))
      expect(state.issues.get(7)?.labels).toStrictEqual(['Type: Feature'])
      expect(result.changes.map((change) => change.description)).toStrictEqual([
        'added label "Type: Feature" to #7',
        'removed label "Type: Bug" from #7',
        'removed label "defect" (an old name of "Type: Bug") from #7',
      ])
    }),
  )

  it.effect("lets current names win over an alias that is another label's name", () =>
    Effect.gen(function* () {
      // "Type: Feature" and "docs" are aliases of `bug`, but also labels of their own.
      const { service, state } = memoryWith(7, ['Type: Feature', 'docs'], ['docs/readme.md'])
      const result = yield* runFeatures({
        config: renamed,
        event: 'pull_request',
        payload: pullRequest(['Type: Feature', 'docs'], 'bug: crash'),
        features: [labels],
      }).pipe(Effect.provideService(GitHub, service))
      expect(state.issues.get(7)?.labels).toStrictEqual(['docs', 'Type: Bug'])
      expect(result.changes.map((change) => change.description)).toStrictEqual([
        'added label "Type: Bug" to #7',
        'removed label "Type: Feature" from #7',
      ])
    }),
  )

  it.effect('keeps the old name when a read-only token refuses to add the current one', () =>
    Effect.gen(function* () {
      const { service, state } = memoryWith(7, ['enhancement'])
      const result = yield* runFeatures({
        config: renamed,
        event: 'pull_request',
        payload: pullRequest(['enhancement']),
        features: [labels],
      }).pipe(
        Effect.provideService(GitHub, {
          ...service,
          addLabels: () => Effect.fail(new Forbidden({ operation: 'addLabels', detail: 'read-only' })),
        }),
      )
      expect(state.issues.get(7)?.labels).toStrictEqual(['enhancement'])
      expect(result.changes).toStrictEqual([])
      expect(result.findings.map((finding) => finding.rule)).toStrictEqual(['labels.add'])
    }),
  )

  it.effect('only records the replacement in a dry run', () =>
    Effect.gen(function* () {
      const { service, state } = memoryWith(7, ['enhancement'])
      const layer = DryRun.pipe(Layer.provide(Layer.succeed(GitHub, service)))
      const writes = yield* Effect.gen(function* () {
        yield* runFeatures({
          config: renamed,
          event: 'pull_request',
          payload: pullRequest(['enhancement']),
          features: [labels],
        })
        return yield* (yield* DryRunLog).writes
      }).pipe(Effect.provide(layer))
      expect(state.issues.get(7)?.labels).toStrictEqual(['enhancement'])
      expect(writes).toStrictEqual([
        { operation: 'addLabels', details: { issue: 7, labels: ['Type: Feature'] } },
        { operation: 'removeLabel', details: { issue: 7, label: 'enhancement' } },
      ])
    }),
  )

  it.effect('gives a renamed size label one size on a pull request that still has the preset name', () =>
    Effect.gen(function* () {
      const { service, state } = memoryWith(7, ['Size: S'])
      const result = yield* runFeatures({
        config: { version: 2, sizeLabels: {}, labels: { 'size-s': { name: 'small', color: '5D9801' } } },
        event: 'pull_request',
        payload: pullRequest(['Size: S']),
        features: [labels],
      }).pipe(Effect.provideService(GitHub, service))
      expect(result.failed).toStrictEqual([])
      expect(state.issues.get(7)?.labels).toStrictEqual(['small'])
    }),
  )

  it('maps each alias of a decided label to its current name, first claim winning', () => {
    const aliases = aliasesOf(
      {
        version: 2,
        labels: {
          a: { name: 'medium', color: '000000', aliases: ['Size: M', 'mid'] },
          b: { name: 'middle', color: '000000', aliases: ['MID'] },
          c: { name: 'unused', color: '000000', aliases: ['gone'] },
          d: { name: 'plain', color: '000000' },
        },
      },
      ['medium', 'middle', 'plain'],
    )
    expect([...aliases]).toStrictEqual([
      ['size: m', 'medium'],
      ['mid', 'medium'],
    ])
    expect(aliasesOf({ version: 2 }, ['bug']).size).toBe(0)
  })
})
