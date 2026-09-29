/**
 * @file packages/notifications/src/channel.ts
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

import type { HttpClient } from '@effect/platform'
import { HttpClientError } from '@effect/platform'
import type { NotificationChannel } from '@resnovas/config'
import { Data, type Effect, Predicate, type Redacted } from 'effect'

/** What a notification is about: policy failures, or items the stale feature acted on. */
export type NotificationKind = 'failures' | 'stale'

/**
 * One message for the channels: a title, the lines under it, and where to
 * look. Every channel renders the same notification in its own format.
 */
export interface Notification {
  readonly kind: NotificationKind
  /** `owner/name`. */
  readonly repository: string
  readonly title: string
  /** Plain text, one finding or change per line. */
  readonly lines: ReadonlyArray<string>
  /** The pull request, issue or repository the notification is about. */
  readonly url: string
}

/**
 * A channel could not deliver a notification.
 *
 * @remarks
 * The reason never quotes the request, because webhook URLs carry their
 * secret in the path.
 *
 * @example
 * ```ts import.meta.vitest name="ChannelError"
 * import { ChannelError } from '@resnovas/notifications'
 *
 * new ChannelError({ channel: 'slack', reason: 'HTTP 404' }).message // => 'slack: HTTP 404'
 * ```
 */
export class ChannelError extends Data.TaggedError('ChannelError')<{
  readonly channel: string
  readonly reason: string
}> {
  override get message() {
    return `${this.channel}: ${this.reason}`
  }
}

// Response errors from the HTTP client and dfx's REST errors both carry the response.
const hasStatus = (error: unknown): error is { readonly response: { readonly status: number } } =>
  Predicate.hasProperty(error, 'response') &&
  Predicate.hasProperty(error.response, 'status') &&
  typeof error.response.status === 'number'

/**
 * Turns an HTTP client failure into a {@link ChannelError} that says what
 * went wrong without quoting the request or its URL.
 *
 * @example
 * ```ts
 * import { HttpClient } from '@effect/platform'
 * import { channelFailure } from '@resnovas/notifications'
 * import { Effect } from 'effect'
 *
 * const post = Effect.flatMap(HttpClient.HttpClient, (client) => client.post('https://example.com')).pipe(
 *   Effect.mapError(channelFailure('example')),
 * )
 * ```
 *
 * @param channel - The channel's type, for the message.
 * @returns A function from the failure to the error.
 */
export const channelFailure =
  (channel: string) =>
  (error: unknown): ChannelError =>
    new ChannelError({
      channel,
      reason: hasStatus(error)
        ? `HTTP ${error.response.status}`
        : HttpClientError.isHttpClientError(error)
          ? `the request failed (${error.reason})`
          : 'the request failed',
    })

/**
 * A place notifications can be sent. Implement one per `type` in the
 * config's `NotificationChannel` union and add it to the registry.
 *
 * @example
 * ```ts
 * import { HttpClient } from '@effect/platform'
 * import type { SlackChannel } from '@resnovas/config'
 * import { type Channel, channelFailure } from '@resnovas/notifications'
 * import { Effect, Redacted } from 'effect'
 *
 * const plain: Channel<typeof SlackChannel.Type> = {
 *   type: 'slack',
 *   defaultSecret: 'SLACK_WEBHOOK_URL',
 *   send: (notification, _options, secret) =>
 *     Effect.flatMap(HttpClient.HttpClient, (client) => client.post(Redacted.value(secret))).pipe(
 *       Effect.mapError(channelFailure('slack')),
 *       Effect.asVoid,
 *     ),
 * }
 * ```
 */
export interface Channel<Options extends NotificationChannel = NotificationChannel> {
  readonly type: Options['type']
  /** The environment variable the secret is read from when the config names none. */
  readonly defaultSecret: string
  /** Delivers one notification. */
  readonly send: (
    notification: Notification,
    options: Options,
    secret: Redacted.Redacted,
  ) => Effect.Effect<void, ChannelError, HttpClient.HttpClient>
}

/** One channel implementation for every `type` the config accepts. */
export type ChannelRegistry = {
  readonly [Type in NotificationChannel['type']]: Channel<Extract<NotificationChannel, { readonly type: Type }>>
}
