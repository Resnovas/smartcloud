/**
 * @file packages/notifications/src/channels/discord.ts
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

import { HttpClient, HttpClientRequest } from '@effect/platform'
import type { DiscordChannel } from '@resnovas/config'
import * as Discord from 'dfx/types'
import { Effect, Option, Redacted } from 'effect'
import { type Channel, ChannelError, channelFailure, type Notification } from '../channel.js'

const API = 'https://discord.com/api/v10'
// Discord's embed limits: 256 characters of title and 4096 of description.
const TITLE_LIMIT = 256
const DESCRIPTION_LIMIT = 4096
// Smartcloud purple, as the embed's side bar.
const COLOR = 0x6f42c1

const WEBHOOK = /^https:\/\/(?:(?:ptb|canary)\.)?discord(?:app)?\.com\/api(?:\/v\d+)?\/webhooks\/(\d+)\/([\w-]+)\/?$/

/**
 * Reads the id and token from a Discord webhook URL.
 *
 * @example
 * ```ts import.meta.vitest name="discordWebhook"
 * import { discordWebhook } from '@resnovas/notifications'
 * import { Option } from 'effect'
 *
 * Option.getOrThrow(discordWebhook('https://discord.com/api/webhooks/123/abc')).id // => '123'
 * Option.isNone(discordWebhook('https://example.com/webhooks/123/abc')) // => true
 * ```
 *
 * @param url - The webhook URL.
 * @returns The id and token, or none when the URL is not a Discord webhook.
 */
export const discordWebhook = (url: string): Option.Option<{ readonly id: string; readonly token: string }> => {
  const match = WEBHOOK.exec(url.trim())
  return match?.[1] !== undefined && match[2] !== undefined
    ? Option.some({ id: match[1], token: match[2] })
    : Option.none()
}

const cut = (text: string, limit: number) => (text.length > limit ? `${text.slice(0, limit - 1)}…` : text)

/**
 * The Discord webhook payload for a notification: one embed, with mentions
 * switched off so a title cannot ping `@everyone`.
 *
 * @example
 * ```ts import.meta.vitest name="discordMessage"
 * import { discordMessage } from '@resnovas/notifications'
 *
 * const message = discordMessage({ kind: 'stale', repository: 'o/r', title: '1 stale item', lines: ['closed #3'], url: 'https://github.com/o/r' }, 'bot')
 * message.embeds?.[0]?.description // => '- closed #3'
 * ```
 *
 * @param notification - The notification.
 * @param username - The name to post under, if any.
 * @returns The payload.
 */
export const discordMessage = (
  notification: Notification,
  username?: string,
): Discord.IncomingWebhookRequestPartial & { readonly username?: string } => ({
  ...(username === undefined ? {} : { username }),
  allowed_mentions: { parse: [] },
  embeds: [
    {
      title: cut(notification.title, TITLE_LIMIT),
      url: notification.url,
      description: cut(notification.lines.map((line) => `- ${line}`).join('\n'), DESCRIPTION_LIMIT),
      color: COLOR,
    },
  ],
})

/**
 * Sends notifications to a Discord webhook through dfx's REST client. The
 * secret is the webhook URL, `DISCORD_WEBHOOK_URL` by default.
 *
 * @remarks
 * Executing a webhook needs no bot token, so the client is dfx's generated
 * REST API over the plain HTTP client, without the bot authorisation and
 * gateway rate limiter its `DiscordREST` layer adds.
 *
 * @example
 * ```ts import.meta.vitest name="discord"
 * import { discord } from '@resnovas/notifications'
 *
 * discord.defaultSecret // => 'DISCORD_WEBHOOK_URL'
 * ```
 */
export const discord: Channel<typeof DiscordChannel.Type> = {
  type: 'discord',
  defaultSecret: 'DISCORD_WEBHOOK_URL',
  send: (notification, options, secret) =>
    Effect.gen(function* () {
      const webhook = discordWebhook(Redacted.value(secret))
      if (Option.isNone(webhook))
        return yield* new ChannelError({ channel: 'discord', reason: 'the secret is not a Discord webhook URL' })
      const client = (yield* HttpClient.HttpClient).pipe(HttpClient.mapRequest(HttpClientRequest.prependUrl(API)))
      yield* Discord.make(client)
        .executeWebhook(webhook.value.id, webhook.value.token, {
          params: { wait: true },
          payload: discordMessage(notification, options.username),
        })
        .pipe(Effect.mapError(channelFailure('discord')))
    }),
}
