/**
 * @file tests/runtime/src/flags.spec.ts
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

import { NodeContext } from '@effect/platform-node'
import { describe, expect, it } from '@effect/vitest'
import type { Feature } from '@resnovas/engine'
import { fileKey, GitHub, type GitHubService, makeMemoryGitHub, Unavailable } from '@resnovas/integrations.github'
import { disabledTelemetry, type TelemetryService } from '@resnovas/integrations.posthog'
import {
  FEATURE_FLAGS,
  FEATURES,
  featureEnabled,
  FeatureFailed,
  flagFor,
  planSettingsForRepository,
  renderSyncForRepository,
  runEvent,
  Telemetry,
  telemetry,
  turnedOffFeatures,
} from '@resnovas/runtime'
import { ConfigProvider, Effect, Layer } from 'effect'

const repository = { owner: 'Resnovas', repo: 'example' }
const LABELS = 'version: 2\nlabels:\n  bug: { name: bug, color: d73a4a }\n'
const PUSH = { name: 'push', payload: { ref: 'refs/heads/main', after: 'abc123' } }

// A Telemetry service that records what it is asked to send, answering flags from a map.
const recording = (flags: Readonly<Record<string, boolean>> = {}) => {
  const events: Array<{ readonly event: string; readonly properties: Readonly<Record<string, unknown>> }> = []
  const errors: Array<unknown> = []
  let enabled = true
  const service: TelemetryService = {
    ...disabledTelemetry,
    isEnabled: Effect.sync(() => enabled),
    disable: Effect.sync(() => {
      enabled = false
    }),
    capture: (_identity, event, properties = {}) => Effect.sync(() => void (enabled && events.push({ event, properties }))),
    captureException: (_identity, error) => Effect.sync(() => void (enabled && errors.push(error))),
    evaluateFlag: (_identity, key, fallback) => Effect.sync(() => (enabled ? (flags[key] ?? fallback) : fallback)),
  }
  return { layer: Layer.succeed(Telemetry, service), events, errors, enabled: () => enabled }
}

const withConfig = (text: string, overrides: Partial<GitHubService> = {}) => {
  const github = makeMemoryGitHub()
  github.state.files.set(fileKey('Resnovas', 'example', '.github/smartcloud.yml'), text)
  const service: GitHubService = { ...github.service, ...overrides }
  return service
}

describe('feature flags', () => {
  it('has one flag per feature, named for it and on by default', () => {
    expect(FEATURES.map((feature) => flagFor(feature.name)).sort()).toStrictEqual(Object.keys(FEATURE_FLAGS).sort())
    expect(Object.values(FEATURE_FLAGS).every((value) => value)).toBe(true)
  })

  it.effect('uses the defaults without telemetry, and the flag with it', () =>
    Effect.gen(function* () {
      expect(yield* featureEnabled(repository, 'smartcloud-labels')).toBe(true)
      const flagged = recording({ 'smartcloud-labels': false })
      expect(yield* featureEnabled(repository, 'smartcloud-labels').pipe(Effect.provide(flagged.layer))).toBe(false)
    }),
  )

  it.effect('names the features their flags turn off, and never one without a flag', () =>
    Effect.gen(function* () {
      const flagged = recording({ 'smartcloud-stale': false })
      const unflagged: Feature = { name: 'experimental', handles: ['repository'], run: () => Effect.void }
      const off = yield* turnedOffFeatures(repository, [...FEATURES, unflagged]).pipe(Effect.provide(flagged.layer))
      expect([...off]).toStrictEqual([['stale', 'turned off by feature flag smartcloud-stale']])
    }),
  )
})

describe('runEvent with telemetry', () => {
  it.effect('skips a feature its flag turns off and records the run', () =>
    Effect.gen(function* () {
      const flagged = recording({ 'smartcloud-labels': false })
      const outcome = yield* runEvent({ config: {}, event: PUSH }).pipe(
        Effect.provideService(GitHub, withConfig(LABELS)),
        Effect.provide(flagged.layer),
      )
      expect(outcome.result.skipped).toContainEqual({ feature: 'labels', reason: 'turned off by feature flag smartcloud-labels' })
      expect(outcome.result.ran).not.toContain('labels')
      expect(flagged.events).toHaveLength(1)
      expect(flagged.events[0]?.event).toBe('smartcloud run')
      expect(flagged.events[0]?.properties).toMatchObject({ github_event: 'push', outcome: 'success', ran: [], failed: [], findings: 0 })
      expect(flagged.events[0]?.properties['skipped']).toContain('labels')
    }),
  )

  it.effect('keeps the flag defaults, and sends nothing, when the config opts out', () =>
    Effect.gen(function* () {
      const flagged = recording({ 'smartcloud-labels': false })
      const outcome = yield* runEvent({ config: {}, event: PUSH }).pipe(
        Effect.provideService(GitHub, withConfig(`${LABELS}telemetry: false\n`)),
        Effect.provide(flagged.layer),
      )
      expect(flagged.enabled()).toBe(false)
      expect(outcome.result.ran).toContain('labels')
      expect(flagged.events).toStrictEqual([])
    }),
  )

  it.effect('reports a feature that failed', () =>
    Effect.gen(function* () {
      const recorded = recording()
      const unavailable = Effect.fail(new Unavailable({ operation: 'listLabels', detail: 'down' }))
      const outcome = yield* runEvent({ config: {}, event: PUSH }).pipe(
        Effect.provideService(GitHub, withConfig(LABELS, { listLabels: unavailable })),
        Effect.provide(recorded.layer),
      )
      expect(outcome.result.failed.map((failure) => failure.feature)).toStrictEqual(['labels'])
      expect(recorded.errors).toHaveLength(1)
      const error = recorded.errors[0]
      expect(error).toBeInstanceOf(FeatureFailed)
      expect(error instanceof FeatureFailed ? error.message : '').toMatch(/^the labels feature failed: /)
    }),
  )

  it.effect('records settings plans and sync renders', () =>
    Effect.gen(function* () {
      const recorded = recording()
      const service = withConfig('version: 2\nsettings:\n  merging: { squash: true }\n')
      yield* planSettingsForRepository(() => Effect.succeed(service), { repository: 'Resnovas/example' }).pipe(Effect.provide(recorded.layer))
      yield* Effect.flip(renderSyncForRepository(() => Effect.succeed(service), { repository: 'Resnovas/example' }).pipe(Effect.provide(recorded.layer)))
      expect(recorded.events.map((event) => [event.event, event.properties['outcome']])).toStrictEqual([
        ['smartcloud settings plan', 'success'],
        ['smartcloud sync render', 'failure'],
      ])
      expect(recorded.events[0]?.properties['steps']).toBe(1)
    }).pipe(Effect.provide(NodeContext.layer)),
  )

  it.effect('describes the files a sync render produced', () =>
    Effect.gen(function* () {
      const recorded = recording()
      const github = makeMemoryGitHub()
      github.state.files.set(fileKey('Resnovas', 'example', '.github/smartcloud.yml'), 'version: 2\nsync:\n  source: Resnovas/.github/templates@main\n')
      github.state.files.set(fileKey('Resnovas', '.github', 'templates/NEW.md', 'main'), 'new\n')
      const render = yield* renderSyncForRepository(() => Effect.succeed(github.service), { repository: 'Resnovas/example' }).pipe(
        Effect.provide(recorded.layer),
      )
      expect(recorded.events[0]?.properties['files']).toBe(render.files.length)
    }).pipe(Effect.provide(NodeContext.layer)),
  )
})

describe('telemetry', () => {
  it.effect('builds the layer for a surface, sending nothing when turned off', () =>
    Effect.gen(function* () {
      const sent: Array<string> = []
      const fetch: typeof globalThis.fetch = async (input) => {
        sent.push(String(input))
        return new Response('{}')
      }
      const enabled = yield* Effect.flatMap(Telemetry, (service) => service.isEnabled).pipe(
        Effect.provide(telemetry('cli', '1.0.0', { fetch })),
        Effect.withConfigProvider(ConfigProvider.fromMap(new Map([['SMARTCLOUD_TELEMETRY', 'false']]))),
      )
      expect(enabled).toBe(false)
      expect(sent).toStrictEqual([])
    }),
  )
})
