/**
 * @file tests/feature.labels/src/sync.spec.ts
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
import { Effect, HashMap, Layer, Logger } from 'effect'
import { readFileSync } from 'node:fs'
import { parseConfig, type SmartcloudConfig } from '@resnovas/config'
import { runFeatures } from '@resnovas/engine'
import { labels, normaliseColor, planSync, sameName, type SyncStep } from '@resnovas/feature.labels'
import { DryRun, DryRunLog, GitHub, makeMemoryGitHub, type Label } from '@resnovas/integrations.github'

const bug: Label = { name: 'bug', color: 'd73a4a', description: 'Something is broken' }

// [name, configured, existing, prune, expected steps]
const plans: ReadonlyArray<
  readonly [string, SmartcloudConfig['labels'] & object, ReadonlyArray<Label>, boolean, ReadonlyArray<SyncStep>]
> = [
  [
    'creates a missing label, colour without # and description defaulting to empty',
    { bug: { name: 'bug', color: '#D73A4A' } },
    [],
    false,
    [{ action: 'create', label: { name: 'bug', color: 'd73a4a', description: '' } }],
  ],
  [
    'leaves a label alone when only colour case or # differ',
    { bug: { name: 'bug', color: '#D73A4A', description: 'Something is broken' } },
    [{ ...bug, color: 'D73A4A' }],
    false,
    [],
  ],
  [
    'updates a label whose colour differs',
    { bug: { name: 'bug', color: '00ff00', description: 'Something is broken' } },
    [bug],
    false,
    [{ action: 'update', current: 'bug', label: { ...bug, color: '00ff00' } }],
  ],
  [
    'updates a label whose description differs',
    { bug: { name: 'bug', color: 'd73a4a', description: 'Broken' } },
    [bug],
    false,
    [{ action: 'update', current: 'bug', label: { ...bug, description: 'Broken' } }],
  ],
  [
    'keeps the repository description when the config omits one',
    { bug: { name: 'bug', color: 'd73a4a' } },
    [bug],
    false,
    [],
  ],
  [
    'matches names ignoring case, and fixes the case',
    { bug: { name: 'Bug', color: 'd73a4a', description: 'Something is broken' } },
    [bug],
    false,
    [{ action: 'update', current: 'bug', label: { ...bug, name: 'Bug' } }],
  ],
  [
    'renames a label found by alias, ignoring case',
    { defect: { name: 'defect', color: 'd73a4a', aliases: ['old', 'BUG'] } },
    [bug],
    false,
    [{ action: 'rename', current: 'bug', label: { ...bug, name: 'defect' } }],
  ],
  [
    'never lets an alias take a label another entry names directly',
    { bug: { name: 'bug', color: 'd73a4a' }, defect: { name: 'defect', color: 'd73a4a', aliases: ['bug'] } },
    [bug],
    false,
    [{ action: 'create', label: { name: 'defect', color: 'd73a4a', description: '' } }],
  ],
  ['leaves labels the config does not define when pruning is off', {}, [bug], false, []],
  [
    'deletes labels the config does not define when pruning is on, after the other steps',
    { docs: { name: 'docs', color: '0075ca' } },
    [bug],
    true,
    [
      { action: 'create', label: { name: 'docs', color: '0075ca', description: '' } },
      { action: 'delete', name: 'bug' },
    ],
  ],
  [
    'plans only the first of two entries naming one label, ignoring case',
    { first: { name: 'Bug', color: 'd73a4a' }, second: { name: 'bug', color: '00ff00' } },
    [],
    false,
    [{ action: 'create', label: { name: 'Bug', color: 'd73a4a', description: '' } }],
  ],
  [
    'does not prune an alias whose configured name already exists',
    { bug: { name: 'bug', color: 'd73a4a', description: 'Something is broken', aliases: ['defect'] } },
    [bug, { name: 'Defect', color: 'ffffff', description: '' }, { name: 'wontfix', color: 'ffffff', description: '' }],
    true,
    [{ action: 'delete', name: 'wontfix' }],
  ],
  [
    'does not prune a label claimed by alias',
    { defect: { name: 'defect', color: 'd73a4a', aliases: ['bug'] } },
    [bug],
    true,
    [{ action: 'rename', current: 'bug', label: { ...bug, name: 'defect' } }],
  ],
]

describe('planSync', () => {
  it.each(plans)('%s', (_name, configured, existing, prune, expected) => {
    expect(planSync(configured, existing, prune)).toStrictEqual(expected)
  })

  it('normalises colours and compares names as GitHub does', () => {
    expect(normaliseColor('#0E8A16')).toBe('0e8a16')
    expect(sameName('Bug', 'bUG')).toBe(true)
    expect(sameName('bug', 'bugs')).toBe(false)
  })
})

describe('labels feature: sync', () => {
  it.effect('creates, updates, renames and prunes on a repository event, and records each change', () =>
    Effect.gen(function* () {
      const { service, state } = makeMemoryGitHub({
        labels: [
          bug,
          { name: 'docs', color: 'FFFFFF', description: '' },
          { name: 'wontfix', color: 'ffffff', description: '' },
        ],
      })
      yield* service.addLabels(4, ['bug'])
      const config: SmartcloudConfig = {
        version: 2,
        labels: {
          defect: { name: 'defect', color: 'd73a4a', description: 'Something is broken', aliases: ['bug'] },
          docs: { name: 'docs', color: '#0075CA', description: '' },
          feature: { name: 'feature', color: 'a2eeef', description: 'New behaviour' },
        },
        labelSync: { prune: true },
      }
      const result = yield* runFeatures({ config, event: 'workflow_dispatch', payload: {}, features: [labels] }).pipe(
        Effect.provideService(GitHub, service),
      )
      expect(result.ran).toStrictEqual(['labels'])
      expect(state.labels).toStrictEqual([
        { name: 'defect', color: 'd73a4a', description: 'Something is broken' },
        { name: 'docs', color: '0075ca', description: '' },
        { name: 'feature', color: 'a2eeef', description: 'New behaviour' },
      ])
      expect(state.issues.get(4)?.labels).toStrictEqual(['defect'])
      expect(result.changes.map((change) => change.description)).toStrictEqual([
        'renamed label "bug" to "defect"',
        'updated label "docs"',
        'created label "feature"',
        'deleted label "wontfix"',
      ])
    }),
  )

  it.effect('logs what the sync decided, as counts', () =>
    Effect.gen(function* () {
      const { service } = makeMemoryGitHub({ labels: [bug, { name: 'wontfix', color: 'ffffff', description: '' }] })
      const lines: Array<{ readonly message: unknown; readonly annotations: Readonly<Record<string, unknown>> }> = []
      const capture = Logger.make(({ message, annotations }) => void lines.push({ message, annotations: Object.fromEntries(HashMap.toEntries(annotations)) }))
      const config: SmartcloudConfig = {
        version: 2,
        labels: {
          defect: { name: 'defect', color: 'd73a4a', aliases: ['bug'] },
          feature: { name: 'feature', color: 'a2eeef' },
          docs: { name: 'docs', color: '0075ca' },
        },
        labelSync: { prune: true },
      }
      yield* runFeatures({ config, event: 'schedule', payload: {}, features: [labels] }).pipe(
        Effect.provideService(GitHub, service),
        Effect.provide(Logger.add(capture)),
      )
      expect(lines).toContainEqual({
        message: ['labels: 2 to create, 0 to update, 1 to rename, 1 to delete'],
        annotations: expect.objectContaining({ feature: 'labels', rule: 'labels.sync', create: 2, update: 0, rename: 1, delete: 1 }),
      })
    }),
  )

  it.effect('warns about a repeated name and syncs its first entry only', () =>
    Effect.gen(function* () {
      const { service, state } = makeMemoryGitHub({ labels: [] })
      const config: SmartcloudConfig = {
        version: 2,
        labels: { bug: { name: 'bug', color: 'd73a4a' }, Bug: { name: 'Bug', color: '00ff00' } },
      }
      const result = yield* runFeatures({ config, event: 'workflow_dispatch', payload: {}, features: [labels] }).pipe(
        Effect.provideService(GitHub, service),
      )
      expect(result.failed).toStrictEqual([])
      expect(state.labels).toStrictEqual([{ name: 'bug', color: 'd73a4a', description: '' }])
      expect(result.findings).toStrictEqual([
        {
          feature: 'labels',
          rule: 'labels.sync',
          level: 'warning',
          message: 'labels.Bug names "Bug", which labels.bug already names; only the first is synced',
        },
      ])
    }),
  )

  it.effect('leaves a label whose description is longer than GitHub accepts, and syncs the rest', () =>
    Effect.gen(function* () {
      const long = { name: 'long', color: 'ffffff', description: 'short' }
      const { service, state } = makeMemoryGitHub({ labels: [bug, long] })
      const config: SmartcloudConfig = {
        version: 2,
        labels: {
          docs: { name: 'docs', color: '0075ca', description: 'd'.repeat(100) },
          long: { name: 'long', color: '0075ca', description: 'd'.repeat(101) },
        },
        labelSync: { prune: true },
      }
      const result = yield* runFeatures({ config, event: 'workflow_dispatch', payload: {}, features: [labels] }).pipe(
        Effect.provideService(GitHub, service),
      )
      expect(result.failed).toStrictEqual([])
      expect(state.labels).toStrictEqual([long, { name: 'docs', color: '0075ca', description: 'd'.repeat(100) }])
      expect(result.changes.map((change) => change.description)).toStrictEqual(['created label "docs"', 'deleted label "bug"'])
      expect(result.findings).toStrictEqual([
        {
          feature: 'labels',
          rule: 'labels.sync',
          level: 'error',
          message: `label "long" was not synced: its description is longer than GitHub's 100 characters`,
        },
      ])
    }),
  )

  it.effect('does not sync on a repository event when only labelling is configured', () =>
    Effect.gen(function* () {
      const { service, state } = makeMemoryGitHub({ labels: [bug] })
      const config: SmartcloudConfig = {
        version: 2,
        labelSync: { prune: true },
        labelling: { bug: { label: 'bug', when: { condition: [] } } },
      }
      const result = yield* runFeatures({ config, event: 'schedule', payload: {}, features: [labels] }).pipe(
        Effect.provideService(GitHub, service),
      )
      expect(result.ran).toStrictEqual(['labels'])
      expect(result.changes).toStrictEqual([])
      expect(state.labels).toStrictEqual([bug])
    }),
  )

  it.effect(
    "runs Eventiva's labels-only v1 config, migrated, in a dry run: every label would be created, none is",
    () =>
      Effect.gen(function* () {
        const text = readFileSync(new URL('../../config/src/fixtures/v1-eventiva.json', import.meta.url), 'utf8')
        const { config } = yield* parseConfig(text, 'eventiva/.github/config.json')
        const { service, state } = makeMemoryGitHub({ labels: [bug] })
        const layer = DryRun.pipe(Layer.provide(Layer.succeed(GitHub, service)))
        const { result, writes } = yield* Effect.gen(function* () {
          const result = yield* runFeatures({ config, event: 'workflow_dispatch', payload: {}, features: [labels] })
          return { result, writes: yield* (yield* DryRunLog).writes }
        }).pipe(Effect.provide(layer))

        expect(result.ran).toStrictEqual(['labels'])
        expect(result.failed).toStrictEqual([])
        // One of Eventiva's descriptions is 106 characters, which GitHub rejects.
        expect(result.findings.map((finding) => finding.message)).toStrictEqual([
          `label "type:extension" was not synced: its description is longer than GitHub's 100 characters`,
        ])
        expect(writes.map((write) => write.operation)).toStrictEqual(Array.from({ length: 9 }, () => 'createLabel'))
        expect(writes[0]?.details).toStrictEqual({
          label: {
            name: 'type:core',
            color: '0e8a16',
            description: 'Core module - can be depended on by any other module',
          },
        })
        expect(result.changes).toHaveLength(9)
        expect(result.changes[0]).toStrictEqual({ feature: 'labels', description: 'created label "type:core"' })
        // Pruning is off by default, so the unrelated label is not even proposed for deletion.
        expect(state.labels).toStrictEqual([bug])
      }),
  )
})
