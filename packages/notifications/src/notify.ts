/**
 * @file packages/notifications/src/notify.ts
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

import type { HttpClient } from '@effect/platform'
import type { NotificationChannel, SmartcloudConfig } from '@resnovas/config'
import type { RunResult } from '@resnovas/engine'
import { Config, Duration, Effect, Option, Redacted } from 'effect'
import type { Channel, ChannelRegistry, Notification, NotificationKind } from './channel.js'
import { composeNotification } from './compose.js'
import { Channels } from './registry.js'

/** What happened to one notification on one channel. */
export interface Delivery {
  /** The channel's key in `notifications.channels`. */
  readonly channel: string
  readonly type: NotificationChannel['type']
  readonly kind: NotificationKind
  readonly title: string
  /** `planned` in a dry run; `skipped` when the channel's secret is not set. */
  readonly outcome: 'sent' | 'planned' | 'skipped' | 'failed'
  /** Why it was skipped or failed. */
  readonly reason?: string
}

/** What notifying did. */
export interface Notified {
  readonly deliveries: ReadonlyArray<Delivery>
  /** One line for every skipped or failed delivery. */
  readonly warnings: ReadonlyArray<string>
}

/**
 * How long one channel may take to accept a notification.
 *
 * @example
 * ```ts import.meta.vitest name="SEND_TIMEOUT"
 * import { SEND_TIMEOUT } from '@resnovas/notifications'
 * import { Duration } from 'effect'
 *
 * Duration.toSeconds(SEND_TIMEOUT) // => 15
 * ```
 */
export const SEND_TIMEOUT = Duration.seconds(15)

// The registry has one implementation per type, so the one for a config's
// type takes that config; TypeScript cannot follow the correlation itself.
const implementationFor = <Options extends NotificationChannel>(
  registry: ChannelRegistry,
  options: Options,
): Channel<Options> => registry[options.type] as unknown as Channel<Options>

// GitHub passes an unset secret, such as any secret on a fork's pull
// request, as an empty string, so empty counts as unset.
const readSecret = (name: string) =>
  Config.option(Config.redacted(name)).pipe(
    Effect.map(Option.filter((secret) => Redacted.value(secret).trim() !== '')),
    Effect.orElseSucceed(() => Option.none<Redacted.Redacted>()),
  )

const deliver = (
  name: string,
  options: NotificationChannel,
  notifications: ReadonlyArray<Notification>,
  dryRun: boolean,
) =>
  Effect.gen(function* () {
    const channel = implementationFor(yield* Channels, options)
    const secretName = options.secret ?? channel.defaultSecret
    const base = (notification: Notification) => ({
      channel: name,
      type: options.type,
      kind: notification.kind,
      title: notification.title,
    })
    if (dryRun) return notifications.map((notification): Delivery => ({ ...base(notification), outcome: 'planned' }))
    const secret = yield* readSecret(secretName)
    if (Option.isNone(secret))
      return notifications.map((notification): Delivery => ({
        ...base(notification),
        outcome: 'skipped',
        reason: `${secretName} is not set`,
      }))
    return yield* Effect.forEach(notifications, (notification) =>
      channel.send(notification, options, secret.value).pipe(
        Effect.timeoutFail({
          duration: SEND_TIMEOUT,
          onTimeout: () => ({ message: `${options.type}: no answer within ${Duration.format(SEND_TIMEOUT)}` }),
        }),
        Effect.match({
          onFailure: (error): Delivery => ({ ...base(notification), outcome: 'failed', reason: error.message }),
          onSuccess: (): Delivery => ({ ...base(notification), outcome: 'sent' }),
        }),
      ),
    )
  })

const warningOf = (delivery: Delivery): ReadonlyArray<string> =>
  delivery.outcome === 'skipped' || delivery.outcome === 'failed'
    ? [
        `notifications: ${delivery.kind} ${delivery.outcome === 'skipped' ? 'not sent' : 'failed'} on ${delivery.channel}: ${delivery.reason ?? ''}`,
      ]
    : []

/**
 * Sends a run's policy failures and stale items to the configured channels.
 *
 * @remarks
 * Each channel gets the kinds in its `on` (both by default) that the run has
 * something to say about, with failures counted from its `level` (`error`
 * by default). A channel's secret is read from the environment variable it
 * names, or the channel's default; when that is unset or empty, as for every
 * secret on a fork's pull request, the channel is skipped with a warning.
 * Notifying never fails the run: a failed or slow channel
 * ({@link SEND_TIMEOUT}) is a warning, and channels are sent to in parallel.
 *
 * In a dry run nothing is read or sent and every delivery is `planned`.
 * When `unchanged` is set, the run's findings are what was already reported
 * on its pull request or issue, so failures are not sent again.
 *
 * Traced as `smartcloud.notifications.notify`, with counts only.
 *
 * @example
 * ```ts
 * import type { RunResult } from '@resnovas/engine'
 * import { notify } from '@resnovas/notifications'
 * import { FetchHttpClient } from '@effect/platform'
 * import { Effect } from 'effect'
 *
 * declare const result: RunResult
 * const notified = notify(result, { channels: { team: { type: 'slack' } } }, { repository: 'Resnovas/smartcloud' }).pipe(
 *   Effect.provide(FetchHttpClient.layer),
 * )
 * ```
 *
 * @param result - The run.
 * @param config - The config's `notifications` section.
 * @param options - The repository as `owner/name`, whether this is a dry run, and whether the findings are unchanged.
 * @returns What was sent, planned, skipped or failed.
 */
export const notify = (
  result: RunResult,
  config: SmartcloudConfig['notifications'],
  options: { readonly repository: string; readonly dryRun?: boolean; readonly unchanged?: boolean },
): Effect.Effect<Notified, never, HttpClient.HttpClient> =>
  Effect.gen(function* () {
    const channels = Object.entries(config?.channels ?? {})
    const deliveries = yield* Effect.forEach(
      channels,
      ([name, channel]) => {
        const kinds = (channel.on ?? ['failures', 'stale']).filter(
          (kind) => !(kind === 'failures' && options.unchanged === true),
        )
        const notifications = kinds.flatMap((kind) =>
          Option.toArray(
            composeNotification(result, kind, { repository: options.repository, level: channel.level ?? 'error' }),
          ),
        )
        return notifications.length === 0
          ? Effect.succeed([])
          : deliver(name, channel, notifications, options.dryRun === true)
      },
      { concurrency: 4 },
    ).pipe(Effect.map((each) => each.flat()))
    const count = (outcome: Delivery['outcome']) => deliveries.filter((delivery) => delivery.outcome === outcome).length
    const counts = {
      channels: channels.length,
      sent: count('sent'),
      planned: count('planned'),
      skipped: count('skipped'),
      failed: count('failed'),
    }
    yield* Effect.annotateCurrentSpan(counts)
    yield* Effect.logInfo(
      `notifications: ${counts.sent} sent, ${counts.planned} planned, ${counts.skipped} skipped, ${counts.failed} failed`,
    ).pipe(Effect.annotateLogs(counts))
    return { deliveries, warnings: deliveries.flatMap(warningOf) }
  }).pipe(
    Effect.withSpan('smartcloud.notifications.notify', {
      captureStackTrace: false,
      attributes: { 'event.kind': result.envelope.kind },
    }),
  )
