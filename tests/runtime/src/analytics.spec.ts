/**
 * @file tests/runtime/src/analytics.spec.ts
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
import type { ResolvedConfig } from '@resnovas/config'
import type { Feature, RunResult } from '@resnovas/engine'
import {
  ANALYTICS_EVENTS,
  command,
  commandRun,
  configResolved,
  featureRuns,
  measuredEvents,
  presetKind,
  recordConfig,
  recordRun,
  sanitiseRule,
} from '@resnovas/runtime'
import { Effect, Schema } from 'effect'
import { recording } from './fixtures.js'

const resolved = (config: ResolvedConfig['config'], sources: ReadonlyArray<string> = ['.github/smartcloud.yml']): ResolvedConfig => ({
  config,
  sources,
  locked: new Set(),
  warnings: [],
})

const result = (overrides: Partial<RunResult> = {}): RunResult => ({
  envelope: { kind: 'repository', event: 'push' },
  ran: [],
  skipped: [],
  failed: [],
  durations: {},
  findings: [],
  changes: [],
  facts: [],
  ...overrides,
})

describe('sanitiseRule', () => {
  it('keeps policy ids and fixed feature rules, and replaces anything a repository chose', () => {
    expect(['DCO', 'ai-21', 'SYNC', 'review'].map(sanitiseRule)).toStrictEqual(['DCO', 'AI-21', 'SYNC', 'REVIEW'])
    expect(sanitiseRule('conventions.title')).toBe('conventions.custom')
    expect(sanitiseRule('labels.prune')).toBe('labels.prune')
    expect(sanitiseRule('reviews.automaticApprove.dependabot')).toBe('reviews.automaticApprove')
    expect(sanitiseRule('settings.deployment-policies:Production')).toBe('settings.deployment-policies')
    expect(sanitiseRule('engine.unsupported-event')).toBe('engine.unsupported-event')
    expect(sanitiseRule('settings')).toBe('settings')
    expect(sanitiseRule('settings.2fa secret')).toBe('settings.other')
    expect(sanitiseRule('settings.')).toBe('settings.other')
    expect(sanitiseRule('unsupported-event')).toBe('other')
    expect(sanitiseRule('Acme/secret-project')).toBe('other')
  })
})

describe('presetKind', () => {
  it('names only the house preset', () => {
    expect(presetKind('Resnovas/.github/smartcloud/house.yml')).toBe('house')
    expect(presetKind('Resnovas/.github/smartcloud/other.yml')).toBe('other')
    expect(presetKind('not a preset')).toBe('other')
  })
})

describe('commandRun', () => {
  it('carries the failure only when there was one', () => {
    const ok = commandRun({ command: 'validate', options: ['path'], outcome: 'success', duration_ms: 12.4 })
    expect(ok.properties).toStrictEqual({ command: 'validate', options: ['path'], outcome: 'success', duration_ms: 12 })
    const failed = commandRun({ command: 'dry-run', options: [], outcome: 'failure', duration_ms: -1, error_tag: 'NotFound', expected: true })
    expect(failed.properties).toMatchObject({ duration_ms: 0, error_tag: 'NotFound', expected: true })
    expect(Schema.is(ANALYTICS_EVENTS['command run'])(failed.properties)).toBe(true)
  })
})

describe('configResolved', () => {
  it('counts presets, features and rules without naming any of them', () => {
    const event = configResolved(
      resolved(
        {
          version: 2,
          conventions: { rules: { title: { preset: 'conventionalCommits' }, 'no-jira': { preset: 'conventionalCommits' } } },
          labels: { bug: { name: 'bug', color: 'd73a4a' } },
          stale: { staleAfterDays: 30, staleLabel: 'stale' },
        },
        ['Resnovas/.github/smartcloud/house.yml@v2', 'Acme/presets/base.yml', '.github/smartcloud.yml'],
      ),
      'version: 2\nextends: []\n',
    )
    expect(event.properties.config_version).toBe(2)
    expect(event.properties.migrated_from_v1).toBe(false)
    expect(event.properties.extends_count).toBe(2)
    expect(event.properties.presets).toStrictEqual(['house', 'other'])
    expect(event.properties.features_enabled).toContain('labels')
    expect(event.properties.rule_counts['conventions']).toBe(2)
    expect(event.properties.rule_counts['labels']).toBe(1)
    expect(Object.keys(event.properties.rule_counts)).toStrictEqual(event.properties.features_enabled)
    expect(JSON.stringify(event)).not.toMatch(/no-jira|Acme|house\.yml/)
    expect(Schema.is(ANALYTICS_EVENTS['config resolved'])(event.properties)).toBe(true)
  })

  it('tells a v1 file apart, and reads unparsable text as v2', () => {
    expect(configResolved(resolved({ version: 2 }), '{"labels": {}}').properties).toMatchObject({ config_version: 1, migrated_from_v1: true })
    expect(configResolved(resolved({ version: 2 }), 'plain text').properties.config_version).toBe(1)
    expect(configResolved(resolved({ version: 2 }), 'a: [').properties.config_version).toBe(2)
  })

  it('counts the keys of each section a feature reads, and nothing for a feature with none', () => {
    const features: ReadonlyArray<Feature> = [
      { name: 'settings', handles: ['repository'], run: () => Effect.void },
      { name: 'reviews', handles: ['pullRequest'], run: () => Effect.void },
      { name: 'extra', handles: ['issue'], run: () => Effect.void },
    ]
    const event = configResolved(resolved({ version: 2, roles: { maintainers: ['a', 'b'] }, settings: { merging: { squash: true } } }), 'version: 2\n', features)
    expect(event.properties.rule_counts).toStrictEqual({ settings: 2, reviews: 1, extra: 0 })
  })
})

describe('featureRuns', () => {
  it('reports every feature considered, with findings by level and sanitised rule', () => {
    const events = featureRuns(
      result({
        envelope: { kind: 'repository', event: 'schedule' },
        ran: ['conventions'],
        failed: [{ feature: 'labels', message: 'Acme/secret-project is down' }],
        skipped: [
          { feature: 'stale', reason: 'turned off by feature flag smartcloud-stale' },
          { feature: 'sync', reason: 'not configured' },
          { feature: 'reviews', reason: 'does not handle repository events' },
        ],
        durations: { conventions: 5, labels: 9 },
        findings: [
          { feature: 'conventions', rule: 'conventions.no-jira', level: 'error', message: 'Title of Acme' },
          { feature: 'conventions', rule: 'conventions.other', level: 'warning', message: 'x' },
          { feature: 'labels', rule: 'labels.sync', level: 'notice', message: 'y' },
        ],
        changes: [{ feature: 'conventions', description: 'labelled #7' }],
      }),
      'weird-Event!',
    )
    expect(events.map((event) => [event.properties.feature, event.properties.outcome, event.properties.skip_reason])).toStrictEqual([
      ['conventions', 'success', undefined],
      ['labels', 'failure', undefined],
      ['stale', 'skipped', 'flag'],
      ['sync', 'skipped', 'not configured'],
      ['reviews', 'skipped', 'unsupported event'],
    ])
    const [conventions] = events
    expect(conventions?.properties).toMatchObject({
      github_event: 'other',
      event_kind: 'repository',
      findings: 2,
      findings_error: 1,
      findings_warning: 1,
      findings_notice: 0,
      findings_by_rule: { 'conventions.custom': 2 },
      rules: ['conventions.custom'],
      changes: 1,
      duration_ms: 5,
    })
    expect(events[2]?.properties.duration_ms).toBe(0)
    expect(JSON.stringify(events)).not.toMatch(/Acme|no-jira|#7/)
    for (const event of events) expect(Schema.is(ANALYTICS_EVENTS['feature run'])(event.properties)).toBe(true)
  })
})

describe('measuredEvents', () => {
  it('turns known measurements into events, and drops the rest', () => {
    const events = measuredEvents([
      { feature: 'sync', name: 'sync proposed', values: { created: 1, updated: 2, mode: 0, conflicts: 1, pull_request: 'updated' } },
      { feature: 'settings', name: 'settings applied', values: { applied: 3, failed: 0, skipped: 1, project_type: 'saas' } },
      { feature: 'sync', name: 'sync proposed', values: { created: -1, updated: 0, mode: 0, conflicts: 0, pull_request: 'created' } },
      { feature: 'settings', name: 'settings applied', values: { applied: 1 } },
      { feature: 'labels', name: 'labels synced', values: { created: 1 } },
    ])
    expect(events.map((event) => event.event)).toStrictEqual(['sync proposed', 'settings applied'])
  })
})

describe('recording', () => {
  it.effect('sends a run and a config inside an invocation, and nothing that fails its schema', () =>
    Effect.gen(function* () {
      const recorded = recording()
      yield* command(
        Effect.zipRight(
          recordConfig(resolved({ version: 2 }, ['Resnovas/.github/smartcloud/house.yml', 'smartcloud.yml']), 'version: 2\n'),
          recordRun(
            result({
              ran: ['labels', 'sync'],
              durations: { labels: 3, sync: -4 },
              facts: [{ feature: 'sync', name: 'sync proposed', values: { created: 1, updated: 0, mode: 0, conflicts: 0, pull_request: 'dry-run' } }],
            }),
            'push',
          ),
        ),
        { command: 'dry-run' },
      ).pipe(Effect.provide(recorded.layer))
      // The sync feature run has a negative duration, which its schema refuses, so it is not sent.
      expect(recorded.events.map((event) => event.event)).toStrictEqual(['config resolved', 'feature run', 'sync proposed', 'command run'])
      expect(recorded.organisations).toStrictEqual([{ features_enabled: expect.any(Array), uses_house_preset: true }])
    }),
  )
})
