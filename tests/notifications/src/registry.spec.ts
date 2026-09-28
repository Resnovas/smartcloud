/**
 * @file tests/notifications/src/registry.spec.ts
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
import { Channels, defaultChannels, discord, linear, slack } from '@resnovas/notifications'
import { Effect } from 'effect'

describe('channel registry', () => {
  it('has an implementation for every channel type, under its own type', () => {
    expect(defaultChannels).toStrictEqual({ slack, discord, linear })
    for (const [type, channel] of Object.entries(defaultChannels)) expect(channel.type).toBe(type)
  })

  it.effect('defaults to the built-in channels and can be replaced', () =>
    Effect.gen(function* () {
      expect(yield* Channels).toBe(defaultChannels)
      const replaced = { ...defaultChannels, slack: { ...slack, defaultSecret: 'TEAM_HOOK' } }
      expect((yield* Effect.provideService(Channels, Channels, replaced)).slack.defaultSecret).toBe('TEAM_HOOK')
    }),
  )
})
