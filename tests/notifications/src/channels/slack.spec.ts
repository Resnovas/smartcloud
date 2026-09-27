/**
 * @file tests/notifications/src/channels/slack.spec.ts
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
import { slack, slackMessage } from '@resnovas/notifications'
import { Effect, Redacted } from 'effect'
import { fakeHttp, notification } from '../fixtures.js'

const hook = Redacted.make('https://hooks.slack.com/services/T/B/SECRET')

describe('slack channel', () => {
  it('escapes the title and lines, and links the title', () => {
    const message = slackMessage(notification)
    expect(message.text).toBe(notification.title)
    expect(message.blocks[0]?.text.text).toBe(`*<${notification.url}|${notification.title}>*`)
    expect(message.blocks[1]?.text.text).toBe('• error AI-02: &lt;!channel&gt; sign-off missing')
  })

  it.effect('posts the message to the webhook', () =>
    Effect.gen(function* () {
      const http = fakeHttp()
      yield* slack.send(notification, { type: 'slack' }, hook).pipe(Effect.provide(http.layer))
      expect(http.sent).toHaveLength(1)
      expect(http.sent[0]?.method).toBe('POST')
      expect(http.sent[0]?.url).toBe('https://hooks.slack.com/services/T/B/SECRET')
      expect(http.sent[0]?.body).toStrictEqual(slackMessage(notification))
    }),
  )

  it.effect('fails with the status, not the webhook URL, when Slack refuses', () =>
    Effect.gen(function* () {
      const http = fakeHttp(() => new Response('invalid_token', { status: 403 }))
      const error = yield* Effect.flip(
        slack.send(notification, { type: 'slack' }, hook).pipe(Effect.provide(http.layer)),
      )
      expect(error.message).toBe('slack: HTTP 403')
    }),
  )
})
