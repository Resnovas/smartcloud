/**
 * @file tests/notifications/src/notify.spec.ts
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
import type { Finding } from '@resnovas/engine'
import { Channels, defaultChannels, notify, SEND_TIMEOUT } from '@resnovas/notifications'
import { ConfigError, ConfigProvider, ConfigProviderPathPatch, Effect, Fiber, HashSet, TestClock } from 'effect'
import { fakeHttp, json, run } from './fixtures.js'

const failure: Finding = { feature: 'commits', rule: 'AI-02', level: 'error', message: 'sign-off missing' }
const result = run({ findings: [failure], changes: [{ feature: 'stale', description: 'closed #4 as abandoned' }] })
const repository = 'o/r'

const withEnv = (env: Record<string, string>) =>
  Effect.withConfigProvider(ConfigProvider.fromMap(new Map(Object.entries(env))))

describe('notify', () => {
  it.effect('sends each channel the kinds it asks for, reading each secret from its variable', () =>
    Effect.gen(function* () {
      const http = fakeHttp((request) =>
        request.url.includes('linear') ? json({ data: { issueCreate: { success: true } } }) : new Response('ok'),
      )
      const notified = yield* notify(
        result,
        {
          channels: {
            team: { type: 'slack' },
            triage: { type: 'linear', team: 'T', on: ['stale'], secret: 'TRIAGE_KEY' },
          },
        },
        { repository },
      ).pipe(
        Effect.provide(http.layer),
        withEnv({ SLACK_WEBHOOK_URL: 'https://hooks.slack.com/x', TRIAGE_KEY: 'lin_api_x' }),
      )
      expect(notified.deliveries.map((delivery) => [delivery.channel, delivery.kind, delivery.outcome])).toStrictEqual([
        ['team', 'failures', 'sent'],
        ['team', 'stale', 'sent'],
        ['triage', 'stale', 'sent'],
      ])
      expect(notified.warnings).toStrictEqual([])
      expect(http.sent.map((sent) => sent.url).toSorted()).toStrictEqual([
        'https://api.linear.app/graphql',
        'https://hooks.slack.com/x',
        'https://hooks.slack.com/x',
      ])
    }),
  )

  it.effect('does nothing without channels, or when a run has nothing to say', () =>
    Effect.gen(function* () {
      const http = fakeHttp()
      expect(
        (yield* notify(result, undefined, { repository }).pipe(Effect.provide(http.layer))).deliveries,
      ).toStrictEqual([])
      const quiet = yield* notify(run(), { channels: { team: { type: 'slack' } } }, { repository }).pipe(
        Effect.provide(http.layer),
      )
      expect(quiet.deliveries).toStrictEqual([])
      expect(http.sent).toHaveLength(0)
    }),
  )

  it.effect('skips a channel with a warning when its secret is unset or empty, as on a fork', () =>
    Effect.gen(function* () {
      const http = fakeHttp()
      const config = {
        channels: {
          team: { type: 'slack' as const, on: ['failures' as const] },
          chat: { type: 'discord' as const, on: ['failures' as const] },
        },
      }
      const notified = yield* notify(result, config, { repository }).pipe(
        Effect.provide(http.layer),
        withEnv({ DISCORD_WEBHOOK_URL: '  ' }),
      )
      expect(notified.deliveries.map((delivery) => delivery.outcome)).toStrictEqual(['skipped', 'skipped'])
      expect(notified.warnings).toStrictEqual([
        'notifications: failures not sent on team: SLACK_WEBHOOK_URL is not set',
        'notifications: failures not sent on chat: DISCORD_WEBHOOK_URL is not set',
      ])
      expect(http.sent).toHaveLength(0)
    }),
  )

  it.effect('treats a secret the environment cannot read as unset', () =>
    Effect.gen(function* () {
      const unreadable = ConfigProvider.fromFlat(
        ConfigProvider.makeFlat({
          load: () => Effect.fail(ConfigError.InvalidData([], 'unreadable')),
          enumerateChildren: () => Effect.succeed(HashSet.empty()),
          patch: ConfigProviderPathPatch.empty,
        }),
      )
      const notified = yield* notify(
        result,
        { channels: { team: { type: 'slack', on: ['stale'] } } },
        { repository },
      ).pipe(Effect.provide(fakeHttp().layer), Effect.withConfigProvider(unreadable))
      expect(notified.deliveries.map((delivery) => delivery.outcome)).toStrictEqual(['skipped'])
    }),
  )

  it.effect('reports a failed channel as a warning and still sends to the others', () =>
    Effect.gen(function* () {
      const http = fakeHttp((request) =>
        request.url.includes('slack') ? new Response('no', { status: 500 }) : 'transport',
      )
      const notified = yield* notify(
        result,
        { channels: { team: { type: 'slack', on: ['failures'] }, chat: { type: 'discord', on: ['failures'] } } },
        { repository },
      ).pipe(
        Effect.provide(http.layer),
        withEnv({
          SLACK_WEBHOOK_URL: 'https://hooks.slack.com/x',
          DISCORD_WEBHOOK_URL: 'https://discord.com/api/webhooks/1/a',
        }),
      )
      expect(notified.warnings).toStrictEqual([
        'notifications: failures failed on team: slack: HTTP 500',
        'notifications: failures failed on chat: discord: the request failed (Transport)',
      ])
    }),
  )

  it.effect(`gives up on a channel that has not answered within ${SEND_TIMEOUT.toString()}`, () =>
    Effect.gen(function* () {
      const hanging = { ...defaultChannels, slack: { ...defaultChannels.slack, send: () => Effect.never } }
      const fiber = yield* notify(
        result,
        { channels: { team: { type: 'slack', on: ['stale'] } } },
        { repository },
      ).pipe(
        Effect.provideService(Channels, hanging),
        Effect.provide(fakeHttp().layer),
        withEnv({ SLACK_WEBHOOK_URL: 'https://hooks.slack.com/x' }),
        Effect.fork,
      )
      yield* TestClock.adjust(SEND_TIMEOUT)
      const notified = yield* Fiber.join(fiber)
      expect(notified.warnings).toStrictEqual(['notifications: stale failed on team: slack: no answer within 15s'])
    }),
  )

  it.effect('only plans deliveries in a dry run, without reading secrets or sending', () =>
    Effect.gen(function* () {
      const http = fakeHttp()
      const notified = yield* notify(
        result,
        { channels: { team: { type: 'slack' } } },
        { repository, dryRun: true },
      ).pipe(Effect.provide(http.layer))
      expect(notified.deliveries.map((delivery) => [delivery.kind, delivery.outcome, delivery.title])).toStrictEqual([
        ['failures', 'planned', '1 policy failure on o/r'],
        ['stale', 'planned', '1 stale change in o/r'],
      ])
      expect(notified.warnings).toStrictEqual([])
      expect(http.sent).toHaveLength(0)
    }),
  )

  it.effect('does not repeat failures that are unchanged since the last report, but still sends stale items', () =>
    Effect.gen(function* () {
      const notified = yield* notify(
        result,
        { channels: { team: { type: 'slack' } } },
        { repository, dryRun: true, unchanged: true },
      ).pipe(Effect.provide(fakeHttp().layer))
      expect(notified.deliveries.map((delivery) => delivery.kind)).toStrictEqual(['stale'])
    }),
  )
})
