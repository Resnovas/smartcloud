/**
 * @file tests/integrations.posthog/src/config.spec.ts
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
import { DEFAULT_HOST, DEFAULT_PROJECT_KEY, telemetrySettings } from '@resnovas/integrations.posthog'
import { ConfigProvider, Effect, Redacted } from 'effect'

const read = (env: Record<string, string>) => Effect.withConfigProvider(telemetrySettings, ConfigProvider.fromMap(new Map(Object.entries(env))))

describe('telemetrySettings', () => {
  it.effect('defaults to smartcloud project, on', () =>
    Effect.gen(function* () {
      const settings = yield* read({})
      expect(Redacted.value(settings.key)).toBe(DEFAULT_PROJECT_KEY)
      expect(settings.host).toBe(DEFAULT_HOST)
      expect(settings.enabled).toBe(true)
      expect(settings.secrets).toStrictEqual([])
    }),
  )

  it.effect('reads overrides and the GitHub tokens to protect', () =>
    Effect.gen(function* () {
      const settings = yield* read({
        SMARTCLOUD_POSTHOG_KEY: 'phc_other',
        SMARTCLOUD_POSTHOG_HOST: ' https://us.i.posthog.com// ',
        GITHUB_TOKEN: 'one',
        INPUT_GITHUB_TOKEN: 'two',
      })
      expect(Redacted.value(settings.key)).toBe('phc_other')
      expect(settings.host).toBe('https://us.i.posthog.com')
      expect(settings.secrets.map(Redacted.value)).toStrictEqual(['one', 'two'])
    }),
  )

  it.effect('ignores blank overrides', () =>
    Effect.gen(function* () {
      const settings = yield* read({ SMARTCLOUD_POSTHOG_KEY: ' ', SMARTCLOUD_POSTHOG_HOST: '/' })
      expect(Redacted.value(settings.key)).toBe(DEFAULT_PROJECT_KEY)
      expect(settings.host).toBe(DEFAULT_HOST)
    }),
  )

  it.effect('is turned off by SMARTCLOUD_TELEMETRY, DO_NOT_TRACK or the action input', () =>
    Effect.gen(function* () {
      for (const value of ['false', '0', 'OFF', 'no']) expect((yield* read({ SMARTCLOUD_TELEMETRY: value })).enabled).toBe(false)
      for (const value of ['1', 'true', 'yes']) expect((yield* read({ DO_NOT_TRACK: value })).enabled).toBe(false)
      expect((yield* read({ INPUT_TELEMETRY: 'False' })).enabled).toBe(false)
      expect((yield* read({ SMARTCLOUD_TELEMETRY: 'true', DO_NOT_TRACK: '0', INPUT_TELEMETRY: '' })).enabled).toBe(true)
    }),
  )
})
