/**
 * @file packages/notifications/src/registry.ts
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

import { Context } from 'effect'
import type { ChannelRegistry } from './channel.js'
import { discord } from './channels/discord.js'
import { linear } from './channels/linear.js'
import { slack } from './channels/slack.js'

/**
 * Every built-in channel, by the `type` the config names it with.
 *
 * @remarks
 * To add a channel: add its options schema to the config's
 * `NotificationChannel` union, implement a `Channel` for it next to the
 * others, and list it here. The registry's type has a key for every `type`
 * in the union, so the compiler points at whatever is missing.
 *
 * @example
 * ```ts import.meta.vitest name="defaultChannels"
 * import { defaultChannels } from '@resnovas/notifications'
 *
 * Object.keys(defaultChannels).join(', ') // => 'slack, discord, linear'
 * ```
 */
export const defaultChannels: ChannelRegistry = { slack, discord, linear }

/**
 * The channel implementations notifications are sent through.
 *
 * @remarks
 * A context reference whose default is {@link defaultChannels}, so nothing
 * has to provide it. Provide another registry to replace or wrap a channel,
 * for example to record what would be sent in a test.
 *
 * @example
 * ```ts
 * import { Channels, defaultChannels } from '@resnovas/notifications'
 * import { Effect } from 'effect'
 *
 * const muted = { ...defaultChannels, discord: { ...defaultChannels.discord, send: () => Effect.void } }
 * const withoutDiscord = Effect.provideService(Channels, muted)
 * ```
 */
export class Channels extends Context.Reference<Channels>()('@resnovas/notifications/Channels', {
  defaultValue: (): ChannelRegistry => defaultChannels,
}) {}
