/**
 * @file packages/notifications/src/index.ts
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

export { ChannelError, channelFailure } from './channel.js'
export type { Channel, ChannelRegistry, Notification, NotificationKind } from './channel.js'
export { discord, discordMessage, discordWebhook } from './channels/discord.js'
export { linear, linearIssue } from './channels/linear.js'
export { slack, slackEscape, slackMessage } from './channels/slack.js'
export { composeNotification, LINE_LIMIT } from './compose.js'
export { notify, SEND_TIMEOUT } from './notify.js'
export type { Delivery, Notified } from './notify.js'
export { Channels, defaultChannels } from './registry.js'
