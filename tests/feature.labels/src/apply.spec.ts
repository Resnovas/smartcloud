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
 * (CODE_OF_CONDUCT.md) and the Eventiva Cooperation Commitment
 * (COOPERATION_COMMITMENT.md).
 *
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE.
 */

import { describe, expect, it } from '@effect/vitest'
import { Effect } from 'effect'
import type { Subject } from '@resnovas/conditions'
import type { SmartcloudConfig } from '@resnovas/config'
import { makeReport, Report, runFeatures } from '@resnovas/engine'
import { labellingFacets, labelName, labels } from '@resnovas/feature.labels'
import { GitHub, makeMemoryGitHub } from '@resnovas/integrations.github'

const pullRequest = (labelNames: ReadonlyArray<string>, title = 'feat: add sync') => ({
  action: 'synchronize',
  pull_request: {
    number: 7,
    title,
    body: 'Adds label sync.',
    user: { login: 'jane' },
    state: 'open',
    locked: false,
    labels: labelNames.map((name) => ({ name })),
    updated_at: '2026-09-01T00:00:00Z',
    draft: false,
    head: { ref: 'feat/sync', sha: 'abc123' },
    additions: 10,
    deletions: 2,
  },
})

const issue = (labelNames: ReadonlyArray<string>, title = 'bug: sync fails') => ({
  action: 'edited',
  issue: {
    number: 3,
    title,
    body: null,
    user: { login: 'sam' },
    state: 'open',
    locked: false,
    labels: labelNames.map((name) => ({ name })),
    updated_at: '2026-09-01T00:00:00Z',
  },
})

const titled = (pattern: string) => ({ condition: [{ type: 'titleMatches' as const, condition: pattern }] })

const config: SmartcloudConfig = {
  version: 2,
  labels: { feature: { name: 'Type: Feature', color: 'a2eeef' }, bug: { name: 'Type: Bug', color: 'd73a4a' } },
  labelling: {
    feature: { label: 'feature', when: titled('^feat') },
    bug: { label: 'bug', when: titled('^bug') },
    docs: { label: 'docs', on: ['pullRequest'], when: { condition: [{ type: 'filesMatch', condition: 'docs/**' }] } },
    triage: { label: 'triage', on: ['issue'], when: { condition: [] } },
  },
}

// Seeds GitHub's view of the subject's labels, so removals find them.
const memoryWith = (number: number, labelNames: ReadonlyArray<string>, files: ReadonlyArray<string> = []) => {
  const memory = makeMemoryGitHub({
    pulls: new Map([
      [7, { commits: [], files: [...files], reviews: [], requestedReviewers: [], submittedReviews: [] }],
    ]),
  })
  memory.state.issues.set(number, { labels: [...labelNames], comments: [], open: true })
  return memory
}

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

  it('asks for the facets of every rule, and none without labelling', () => {
    expect([...labellingFacets(config)]).toStrictEqual(['files'])
    expect(labellingFacets({ version: 2 }).size).toBe(0)
    expect(labels.facets?.(config)).toStrictEqual(new Set(['files']))
  })

  it('names a rule label by its configured name, or by the key itself', () => {
    expect(labelName(config, 'bug')).toBe('Type: Bug')
    expect(labelName(config, 'docs')).toBe('docs')
    expect(labelName({ version: 2 }, 'docs')).toBe('docs')
  })
})
