/**
 * @file tests/notifications/src/channels/discord.spec.ts
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
import { discord, discordMessage, discordWebhook } from '@resnovas/notifications'
import { Effect, Option, Redacted } from 'effect'
import { fakeHttp, json, notification } from '../fixtures.js'

const hook = Redacted.make('https://discord.com/api/webhooks/123/tok-en_1')

describe('discordWebhook', () => {
  it('reads the id and token from every Discord webhook host and API version', () => {
    for (const url of [
      'https://discord.com/api/webhooks/1/a',
      'https://discordapp.com/api/webhooks/1/a/',
      'https://ptb.discord.com/api/v10/webhooks/1/a',
      'https://canary.discord.com/api/webhooks/1/a',
    ])
      expect(Option.getOrThrow(discordWebhook(url))).toStrictEqual({ id: '1', token: 'a' })
  })

  it('rejects anything else', () => {
    expect(Option.isNone(discordWebhook('https://discord.com/api/webhooks/abc/a'))).toBe(true)
    expect(Option.isNone(discordWebhook('https://evil.example/discord.com/api/webhooks/1/a'))).toBe(true)
  })
})

describe('discordMessage', () => {
  it('turns mentions off and posts under the configured name only when one is set', () => {
    const message = discordMessage(notification)
    expect(message.allowed_mentions).toStrictEqual({ parse: [] })
    expect('username' in message).toBe(false)
    expect(discordMessage(notification, 'smartcloud').username).toBe('smartcloud')
  })

  it('cuts the title and description to Discord embed limits', () => {
    const long = { ...notification, title: 't'.repeat(300), lines: ['l'.repeat(5000)] }
    const embed = discordMessage(long).embeds?.[0]
    expect(embed?.title).toHaveLength(256)
    expect(embed?.title?.endsWith('…')).toBe(true)
    expect(embed?.description).toHaveLength(4096)
  })
})

describe('discord channel', () => {
  it.effect('executes the webhook through the Discord API and waits for the message', () =>
    Effect.gen(function* () {
      const http = fakeHttp(() => json({ id: '9' }))
      yield* discord
        .send(notification, { type: 'discord', username: 'smartcloud' }, hook)
        .pipe(Effect.provide(http.layer))
      expect(http.sent).toHaveLength(1)
      expect(http.sent[0]?.url).toBe('https://discord.com/api/v10/webhooks/123/tok-en_1')
      expect(http.sent[0]?.body).toStrictEqual(discordMessage(notification, 'smartcloud'))
      expect(http.sent[0]?.headers['authorization']).toBeUndefined()
    }),
  )

  it.effect('fails without sending when the secret is not a Discord webhook URL', () =>
    Effect.gen(function* () {
      const http = fakeHttp()
      const error = yield* Effect.flip(
        discord
          .send(notification, { type: 'discord' }, Redacted.make('https://example.com/hook'))
          .pipe(Effect.provide(http.layer)),
      )
      expect(error.message).toBe('discord: the secret is not a Discord webhook URL')
      expect(http.sent).toHaveLength(0)
    }),
  )

  it.effect('fails with the status when Discord refuses', () =>
    Effect.gen(function* () {
      const http = fakeHttp(() => json({ message: 'Unknown Webhook', code: 10015 }, 404))
      const error = yield* Effect.flip(
        discord.send(notification, { type: 'discord' }, hook).pipe(Effect.provide(http.layer)),
      )
      expect(error.message).toBe('discord: HTTP 404')
    }),
  )
})
