/**
 * @file tests/feature.settings/src/feature.spec.ts
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
import type { SmartcloudConfig } from '@resnovas/config'
import { makeReport, Report, runFeatures } from '@resnovas/engine'
import { settingsFeature } from '@resnovas/feature.settings'
import { DryRun, DryRunLog, GitHub, makeMemoryGitHub } from '@resnovas/integrations.github'
import { Effect, Layer } from 'effect'
import { houseSettings, privateRepository, publicRepository } from './fixtures.js'

const config: SmartcloudConfig = { version: 2, roles: { maintainers: ['TGTGamer'] }, settings: houseSettings }

const pushLimit = {
  feature: 'settings',
  rule: 'settings.push-limit',
  level: 'notice',
  message: 'The push limit has no API, so set it by hand: Settings > General > Pushes > limit branch and tag updates per push.',
}

describe('settingsFeature', () => {
  it('handles repository events, and is enabled only by a settings section', () => {
    expect(settingsFeature.name).toBe('settings')
    expect(settingsFeature.handles).toStrictEqual(['repository'])
    expect(settingsFeature.enabled?.(config)).toBe(true)
    expect(settingsFeature.enabled?.({ version: 2 })).toBe(false)
  })

  const events: ReadonlyArray<{ readonly event: string; readonly payload: unknown }> = [
    { event: 'schedule', payload: {} },
    { event: 'workflow_dispatch', payload: {} },
    { event: 'push', payload: { ref: 'refs/heads/main', after: 'fed789' } },
  ]
  for (const { event, payload } of events) {
    it.effect(`applies the settings on ${event} and records the push limit notice`, () =>
      Effect.gen(function* () {
        const { service, state } = makeMemoryGitHub({ repository: publicRepository })
        const result = yield* runFeatures({ config, event, payload, features: [settingsFeature] }).pipe(Effect.provideService(GitHub, service))
        expect(result.ran).toStrictEqual(['settings'])
        // The in-memory GitHub answers the rulesets and deployment policy
        // listings with null, which is not a list, so both steps are reported
        // rather than guessed.
        expect(result.findings).toStrictEqual([
          {
            feature: 'settings',
            rule: 'settings.ruleset',
            level: 'error',
            message: 'Ruleset "house: default branch": GET /rulesets: unexpected response (expected a list of rulesets)',
          },
          {
            feature: 'settings',
            rule: 'settings.deployment-policies:Production',
            level: 'error',
            message:
              'Deployment policies for "Production": branch main, tag v*: GET /environments/Production/deployment-branch-policies: unexpected response (expected a list of deployment branch policies)',
          },
          pushLimit,
        ])
        expect(result.changes).toHaveLength(11)
        // Only counts are measured: 11 steps applied, the ruleset and deployment policies failed.
        expect(result.facts).toStrictEqual([
          { feature: 'settings', name: 'settings applied', values: { applied: 11, failed: 2, skipped: 0, project_type: houseSettings.environments?.projectType ?? 'none' } },
        ])
        expect(state.requests).toHaveLength(12)
        expect(state.graphql).toHaveLength(1)
      }),
    )
  }

  it.effect('does nothing on other repository events', () =>
    Effect.gen(function* () {
      const { service, state } = makeMemoryGitHub()
      const result = yield* runFeatures({ config, event: 'repository_dispatch', payload: {}, features: [settingsFeature] }).pipe(
        Effect.provideService(GitHub, service),
      )
      expect(result.ran).toStrictEqual(['settings'])
      expect(result.findings).toStrictEqual([])
      expect(state.requests).toStrictEqual([])
    }),
  )

  it.effect('is skipped when the config has no settings section', () =>
    Effect.gen(function* () {
      const { service } = makeMemoryGitHub()
      const result = yield* runFeatures({ config: { version: 2 }, event: 'schedule', payload: {}, features: [settingsFeature] }).pipe(
        Effect.provideService(GitHub, service),
      )
      expect(result.skipped).toStrictEqual([{ feature: 'settings', reason: 'not configured' }])
    }),
  )

  it.effect('run directly without a settings section, it does nothing', () =>
    Effect.gen(function* () {
      const { service, state } = makeMemoryGitHub()
      const report = yield* makeReport
      yield* settingsFeature
        .run({ config: { version: 2 }, envelope: { kind: 'repository', event: 'schedule' } })
        .pipe(Effect.provideService(Report, report), Effect.provideService(GitHub, service))
      expect(yield* report.snapshot).toStrictEqual({ findings: [], changes: [], facts: [] })
      expect(state.requests).toStrictEqual([])
    }),
  )

  it.effect('says why secret scanning and private vulnerability reporting are left alone on a private repository', () =>
    Effect.gen(function* () {
      const { service } = makeMemoryGitHub({ repository: privateRepository })
      const result = yield* runFeatures({ config, event: 'schedule', payload: {}, features: [settingsFeature] }).pipe(
        Effect.provideService(GitHub, service),
      )
      expect(result.findings.map(({ rule, level }) => `${level} ${rule}`)).toStrictEqual([
        'warning settings.ruleset',
        'error settings.deployment-policies:Production',
        'notice settings.secret-scanning',
        'notice settings.private-vulnerability-reporting',
        'notice settings.push-limit',
      ])
    }),
  )

  it.effect('says why the Actions access level is left alone on a public repository, and counts it as skipped', () =>
    Effect.gen(function* () {
      const { service, state } = makeMemoryGitHub({ repository: publicRepository })
      const result = yield* runFeatures({
        config: { version: 2, settings: { actions: { accessLevel: 'organization', workflowPermissions: 'read' } } },
        event: 'schedule',
        payload: {},
        features: [settingsFeature],
      }).pipe(Effect.provideService(GitHub, service))
      expect(result.findings).toStrictEqual([
        {
          feature: 'settings',
          rule: 'settings.actions-access',
          level: 'notice',
          message:
            'The Actions access level was not changed: GitHub only has one for private and internal repositories, and every repository can use the actions and reusable workflows of a public one.',
        },
        pushLimit,
      ])
      expect(result.facts[0]?.values).toMatchObject({ applied: 1, failed: 0, skipped: 1 })
      expect(state.requests.map(({ path }) => path)).toStrictEqual(['/actions/permissions/workflow'])
    }),
  )

  it.effect('sets the Actions access level on a private repository', () =>
    Effect.gen(function* () {
      const { service, state } = makeMemoryGitHub({ repository: privateRepository })
      const result = yield* runFeatures({
        config: { version: 2, settings: { actions: { accessLevel: 'organization' } } },
        event: 'schedule',
        payload: {},
        features: [settingsFeature],
      }).pipe(Effect.provideService(GitHub, service))
      expect(result.findings).toStrictEqual([pushLimit])
      expect(state.requests).toStrictEqual([{ method: 'PUT', path: '/actions/permissions/access', body: { access_level: 'organization' } }])
    }),
  )

  it.effect('under a dry run, reads pass through and writes are only recorded', () =>
    Effect.gen(function* () {
      const memory = makeMemoryGitHub({ repository: publicRepository })
      const layer = DryRun.pipe(Layer.provide(Layer.succeed(GitHub, memory.service)))
      const { result, writes } = yield* Effect.gen(function* () {
        const result = yield* runFeatures({
          config: { version: 2, settings: { merging: { squash: true }, features: { discussions: true } } },
          event: 'schedule',
          payload: {},
          features: [settingsFeature],
        })
        const writes = yield* Effect.flatMap(DryRunLog, (log) => log.writes)
        return { result, writes }
      }).pipe(Effect.provide(layer))
      expect(memory.state.requests).toStrictEqual([])
      expect(memory.state.graphql).toStrictEqual([])
      expect(writes.map((write) => write.operation)).toStrictEqual(['repositoryRequest', 'graphql'])
      expect(result.changes.map((change) => change.description)).toStrictEqual([
        'Merging, branches, sign-off and wiki',
        'Repository features: hasDiscussionsEnabled: true',
      ])
      expect(result.findings).toStrictEqual([pushLimit])
    }),
  )
})
