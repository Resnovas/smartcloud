/**
 * @file packages/notifications/src/channels/slack.ts
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

import { HttpClient, HttpClientRequest } from '@effect/platform'
import type { SlackChannel } from '@resnovas/config'
import { Effect, Redacted } from 'effect'
import { type Channel, channelFailure, type Notification } from '../channel.js'

/**
 * Escapes text for Slack's `mrkdwn`, so a title cannot inject a link or
 * mention such as `<!channel>`.
 *
 * @example
 * ```ts import.meta.vitest name="slackEscape"
 * import { slackEscape } from '@resnovas/notifications'
 *
 * slackEscape('<!channel> & co') // => '&lt;!channel&gt; &amp; co'
 * ```
 *
 * @param text - Plain text.
 * @returns The text, safe to put in a Slack message.
 */
export const slackEscape = (text: string): string =>
  text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

/**
 * The Slack message for a notification: a linked title and a bulleted list.
 *
 * @example
 * ```ts import.meta.vitest name="slackMessage"
 * import { slackMessage } from '@resnovas/notifications'
 *
 * const message = slackMessage({ kind: 'stale', repository: 'o/r', title: '1 stale item', lines: ['closed #3'], url: 'https://github.com/o/r' })
 * message.text // => '1 stale item'
 * ```
 *
 * @param notification - The notification.
 * @returns The webhook payload.
 */
export const slackMessage = (notification: Notification) => ({
  text: notification.title,
  blocks: [
    { type: 'section', text: { type: 'mrkdwn', text: `*<${notification.url}|${slackEscape(notification.title)}>*` } },
    {
      type: 'section',
      text: { type: 'mrkdwn', text: notification.lines.map((line) => `• ${slackEscape(line)}`).join('\n') },
    },
  ],
})

/**
 * Sends notifications to a Slack incoming webhook. The secret is the
 * webhook URL, `SLACK_WEBHOOK_URL` by default.
 *
 * @example
 * ```ts import.meta.vitest name="slack"
 * import { slack } from '@resnovas/notifications'
 *
 * slack.defaultSecret // => 'SLACK_WEBHOOK_URL'
 * ```
 */
export const slack: Channel<typeof SlackChannel.Type> = {
  type: 'slack',
  defaultSecret: 'SLACK_WEBHOOK_URL',
  send: (notification, _options, secret) =>
    Effect.gen(function* () {
      const client = HttpClient.filterStatusOk(yield* HttpClient.HttpClient)
      const request = yield* HttpClientRequest.post(Redacted.value(secret)).pipe(
        HttpClientRequest.bodyJson(slackMessage(notification)),
      )
      yield* client.execute(request)
    }).pipe(Effect.scoped, Effect.mapError(channelFailure('slack'))),
}
