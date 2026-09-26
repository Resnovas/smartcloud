/**
 * @file tests/action/src/run.spec.ts
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
import { FEATURES, NoConfig, PresetUnreadable, runAction, UnknownFeatures } from '@resnovas/action'
import { fileKey, Forbidden, GitHub } from '@resnovas/integrations.github'
import { Effect, Option } from 'effect'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { CONVENTIONS, inputs, memory, pullRequest } from './fixtures.js'

describe('runAction', () => {
  it.effect('reads the config from the default branch, runs features and publishes the report', () =>
    Effect.gen(function* () {
      const { service, state } = memory({ '.github/smartcloud.yml': CONVENTIONS })
      const outcome = yield* runAction(inputs(), { name: 'pull_request', payload: pullRequest('Add things') }).pipe(
        Effect.provideService(GitHub, service),
      )
      expect(outcome.result.ran).toContain('conventions')
      expect(outcome.result.findings.map((finding) => finding.rule)).toStrictEqual(['conventions.title'])
      expect(state.checkRuns.map((run) => [run.name, run.conclusion])).toContainEqual([
        'smartcloud / conventions',
        'failure',
      ])
      expect(state.issues.get(7)?.comments).toHaveLength(1)
    }),
  )

  it.effect('passes the job check run to the features, so the required feature leaves the job out', () =>
    Effect.gen(function* () {
      const { service, state } = memory({ '.github/smartcloud.yml': 'version: 2\nrequired: {}\n' })
      state.commitChecks.set('abc123', [
        { name: 'smartcloud', source: 'checkRun', id: 42, state: 'pending', detail: 'in_progress' },
        { name: 'ci', source: 'checkRun', id: 43, state: 'failure', detail: 'failure' },
      ])
      const outcome = yield* runAction(inputs({ checkRunId: Option.some(42) }), {
        name: 'pull_request',
        payload: pullRequest('feat: x'),
      }).pipe(Effect.provideService(GitHub, service))
      expect(outcome.result.findings.map((finding) => finding.message)).toStrictEqual([
        'The ci check concluded failure.',
      ])
      const skipped = yield* runAction(inputs(), { name: 'pull_request', payload: pullRequest('feat: x') }).pipe(
        Effect.provideService(GitHub, service),
      )
      expect(skipped.result.skipped).toContainEqual({
        feature: 'required',
        reason: 'runs only in a job that passes checkRunId',
      })
    }),
  )

  it.effect('prefers configJson, then the config input, and honours configRef', () =>
    Effect.gen(function* () {
      const { service, state } = memory()
      const json = yield* runAction(inputs({ configJson: Option.some(CONVENTIONS) }), {
        name: 'pull_request',
        payload: pullRequest('feat: x'),
      }).pipe(Effect.provideService(GitHub, service))
      expect(json.result.findings).toStrictEqual([])
      state.files.set(fileKey('Resnovas', 'example', 'custom.yml', 'v2'), CONVENTIONS)
      const custom = yield* runAction(inputs({ config: Option.some('custom.yml'), configRef: Option.some('v2') }), {
        name: 'pull_request',
        payload: pullRequest('feat: x'),
      }).pipe(Effect.provideService(GitHub, service))
      expect(custom.result.ran).toContain('conventions')
    }),
  )

  it.effect('migrates a v1 config.json, passing on its warnings with the deprecations', () =>
    Effect.gen(function* () {
      const v1 = yield* Effect.promise(() =>
        readFile(join(import.meta.dirname, '../../config/src/fixtures/v1-smartcloud.json'), 'utf8'),
      )
      const { service } = memory({ '.github/config.json': v1 })
      const outcome = yield* runAction(inputs({ deprecations: ['old input'] }), {
        name: 'pull_request',
        payload: pullRequest('feat: x'),
      }).pipe(Effect.provideService(GitHub, service))
      expect(outcome.warnings[0]).toBe('old input')
      expect(outcome.warnings.some((warning) => warning.startsWith('.github/config.json: '))).toBe(true)
    }),
  )

  it.effect('reads extends presets through GitHub, and names a missing one', () =>
    Effect.gen(function* () {
      const { service, state } = memory({
        '.github/smartcloud.yml': 'version: 2\nextends: [Resnovas/.github/house.yml]\n',
      })
      state.files.set(fileKey('Resnovas', '.github', 'house.yml'), CONVENTIONS)
      const outcome = yield* runAction(inputs(), { name: 'pull_request', payload: pullRequest('nope') }).pipe(
        Effect.provideService(GitHub, service),
      )
      expect(outcome.result.findings).toHaveLength(1)
      state.files.delete(fileKey('Resnovas', '.github', 'house.yml'))
      const error = yield* Effect.flip(
        runAction(inputs(), { name: 'pull_request', payload: pullRequest('nope') }).pipe(
          Effect.provideService(GitHub, service),
        ),
      )
      expect(error).toMatchObject({ _tag: 'ConfigNotFound', source: 'Resnovas/.github/house.yml' })
    }),
  )

  it.effect('says why a preset GitHub would not return could not be read', () =>
    Effect.gen(function* () {
      const { service } = memory({ '.github/smartcloud.yml': 'version: 2\nextends: [Resnovas/.github/house.yml]\n' })
      const forbidden: GitHub['Type'] = {
        ...service,
        getFile: (location) =>
          location.repo === '.github'
            ? Effect.fail(new Forbidden({ operation: 'getFile', detail: 'Resource not accessible by integration' }))
            : service.getFile(location),
      }
      const error = yield* Effect.flip(
        runAction(inputs(), { name: 'pull_request', payload: pullRequest('nope') }).pipe(
          Effect.provideService(GitHub, forbidden),
        ),
      )
      expect(error).toBeInstanceOf(PresetUnreadable)
      expect(error.message).toBe(
        'the extends preset Resnovas/.github/house.yml could not be read: getFile: forbidden (Resource not accessible by integration)',
      )
    }),
  )

  it.effect('fails clearly with no config, or an unknown feature, and runs only selected features', () =>
    Effect.gen(function* () {
      const empty = memory()
      const none = yield* Effect.flip(
        runAction(inputs(), { name: 'pull_request', payload: pullRequest('x') }).pipe(
          Effect.provideService(GitHub, empty.service),
        ),
      )
      expect(none).toBeInstanceOf(NoConfig)
      expect(none.message).toContain('.github/smartcloud.yml, .github/smartcloud.yaml, .github/config.json')
      const { service } = memory({ '.github/smartcloud.yml': CONVENTIONS })
      const unknown = yield* Effect.flip(
        runAction(inputs({ features: Option.some(['labels', 'nope']) }), {
          name: 'pull_request',
          payload: pullRequest('x'),
        }).pipe(Effect.provideService(GitHub, service)),
      )
      expect(unknown).toBeInstanceOf(UnknownFeatures)
      expect(unknown.message).toContain('nope')
      const only = yield* runAction(inputs({ features: Option.some(['labels']) }), {
        name: 'pull_request',
        payload: pullRequest('x'),
      }).pipe(Effect.provideService(GitHub, service))
      expect([...only.result.ran, ...only.result.skipped.map((skip) => skip.feature)]).toStrictEqual(['labels'])
      expect(FEATURES.map((feature) => feature.name)).toStrictEqual([
        'conventions',
        'commits',
        'disclosure',
        'reviews',
        'labels',
        'stale',
        'settings',
        'sync',
        'required',
        'freeze',
        'branches',
        'codeowners',
        'lock',
        'backport',
      ])
    }),
  )
})
