/**
 * @file tests/feature.labels/src/apply.spec.ts
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
import type { SmartcloudConfig } from '@resnovas/config'
import { runFeatures } from '@resnovas/engine'
import { labellingFacets, labelName, labels } from '@resnovas/feature.labels'
import { Forbidden, GitHub, Unavailable } from '@resnovas/integrations.github'
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
