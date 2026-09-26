/**
 * @file tests/integrations.posthog/src/telemetry.spec.ts
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
import {
  anonymousIdentity,
  disabledTelemetry,
  evaluateFlag,
  identify,
  invocation,
  optOut,
  reportError,
  Telemetry,
  telemetryLayer,
  track,
} from '@resnovas/integrations.posthog'
import { ConfigError, ConfigProvider, Effect, Either, Exit, Fiber, HashSet, Layer, Logger, TestClock } from 'effect'
import { homedir } from 'node:os'
import { afterEach, vi } from 'vitest'
import { fakeFetch, type Reply } from './fake-fetch.js'

afterEach(() => {
  vi.restoreAllMocks()
})

const TOKEN = 'ghp_abcdefghijklmnopqrstuvwxyz0123'
const repository = { owner: 'Acme-Corp', repo: 'secret-project' }
const identity = identify(repository)

const withEnv = (env: Record<string, string>) => Effect.withConfigProvider(ConfigProvider.fromMap(new Map(Object.entries(env))))

// Runs an effect with the telemetry layer over a fake network, closing the
// layer (and so flushing) before returning what was sent.
const run = <A, E>(effect: Effect.Effect<A, E, Telemetry>, env: Record<string, string> = {}, routes: Readonly<Record<string, Reply>> = {}) =>
  Effect.gen(function* () {
    const fake = fakeFetch(routes)
    const exit = yield* effect.pipe(
      Effect.provide(telemetryLayer({ surface: 'cli', version: '9.9.9', fetch: fake.fetch, shutdownTimeoutMs: 2000 })),
      withEnv(env),
      Effect.exit,
    )
    return { exit, fake }
  })

// An invocation that reports itself as `command run`, as the surfaces' own do.
const invoked = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  invocation(effect, { command: 'run', completed: (summary) => ({ event: 'command run', properties: summary }) })

const work = Effect.gen(function* () {
  yield* Effect.logInfo(`reading acme-corp/secret-project with ${TOKEN} for jane@example.com`)
  return 42
})

describe('telemetryLayer, when turned off', () => {
  for (const env of [{ SMARTCLOUD_TELEMETRY: 'false' }, { DO_NOT_TRACK: '1' }, { INPUT_TELEMETRY: 'false' }]) {
    it.live(`sends nothing with ${Object.keys(env)[0]}`, () =>
      Effect.gen(function* () {
        const { exit, fake } = yield* run(
          Effect.gen(function* () {
            const value = yield* track(work, { operation: 'run', repository })
            const flag = yield* evaluateFlag(repository, 'smartcloud-labels', true)
            // @effect-diagnostics-next-line globalErrorInEffectFailure:off - a plain Error on purpose: any failure must be handled
            yield* track(Effect.fail(new Error('boom')), { operation: 'run', repository }).pipe(Effect.ignore)
            return { value, flag }
          }),
          env,
        )
        expect(exit).toStrictEqual(Exit.succeed({ value: 42, flag: true }))
        expect(fake.sent).toStrictEqual([])
      }),
    )
  }

  it.live('prints no diagnostic logs either', () =>
    Effect.gen(function* () {
      const printed: Array<string> = []
      vi.spyOn(console, 'log').mockImplementation((...args: Array<unknown>) => void printed.push(args.map(String).join(' ')))
      const { fake } = yield* run(Effect.logInfo('labels: 3 to create'), { SMARTCLOUD_TELEMETRY: 'false' })
      expect(fake.sent).toStrictEqual([])
      expect(printed).toStrictEqual([])
    }),
  )

  it.live('sends nothing when the settings cannot be read', () =>
    Effect.gen(function* () {
      const fake = fakeFetch()
      const broken = ConfigProvider.fromFlat(
        ConfigProvider.makeFlat({
          load: (path) => Effect.fail(ConfigError.InvalidData([...path], 'unreadable')),
          enumerateChildren: () => Effect.succeed(HashSet.empty<string>()),
          patch: ConfigProvider.fromMap(new Map()).flattened.patch,
        }),
      )
      const value = yield* track(work, { operation: 'run', repository }).pipe(
        Effect.provide(telemetryLayer({ surface: 'mcp', version: '1', fetch: fake.fetch })),
        Effect.withConfigProvider(broken),
      )
      expect(value).toBe(42)
      expect(fake.sent).toStrictEqual([])
    }),
  )
})

describe('telemetryLayer, when on', () => {
  it.live('sends the event, logs, spans and metrics, hashed and redacted, when it closes', () =>
    Effect.gen(function* () {
      const printed: Array<string> = []
      vi.spyOn(console, 'log').mockImplementation((...args: Array<unknown>) => void printed.push(args.map(String).join(' ')))
      const { exit, fake } = yield* run(invoked(track(work, { operation: 'run', repository, properties: { github_event: 'push' }, describe: (value) => ({ answer: value }) })), {
        GITHUB_TOKEN: 'plain-env-token-value',
      })
      expect(exit).toStrictEqual(Exit.succeed(42))
      const paths = new Set(fake.sent.map((request) => request.path))
      expect(paths).toStrictEqual(new Set(['/batch/', '/i/v1/logs', '/i/v1/traces', '/i/v1/metrics']))
      const everything = fake.text()
      expect(everything).toContain(identity.distinctId)
      expect(everything).toContain(identity.organization)
      expect(everything).not.toMatch(/acme-corp|secret-project/i)
      expect(everything).not.toContain(TOKEN)
      expect(everything).not.toContain('jane@example.com')
      const batch = fake.sent.find((request) => request.path === '/batch/')?.body ?? ''
      expect(batch).toContain('"event":"command run"')
      expect(batch).toContain('"$groupidentify"')
      expect(batch).toContain('"command":"run"')
      expect(batch).toContain('"outcome":"success"')
      expect(batch).toContain('"surface":"cli"')
      expect(batch).toContain('"smartcloud_version":"9.9.9"')
      expect(batch).toContain('"$set":{"smartcloud_version":"9.9.9","last_surface":"cli"}')
      const logs = fake.sent.find((request) => request.path === '/i/v1/logs')?.body ?? ''
      expect(logs).toContain('posthogDistinctId')
      expect(logs).toContain('smartcloud run: success')
      expect(logs).toContain('command run: success')
      expect(logs).toContain('"answer"')
      expect(fake.sent.find((request) => request.path === '/i/v1/traces')?.body).toContain('smartcloud.command')
      // The run's own log line goes to PostHog only; stdout belongs to the MCP protocol.
      expect(printed.some((line) => line.includes('smartcloud run: success'))).toBe(false)
      expect(fake.sent.every((request) => request.url.startsWith('https://eu.i.posthog.com/'))).toBe(true)
    }),
  )

  it.live('sends diagnostic logs from debug level up to PostHog, and never prints them', () =>
    Effect.gen(function* () {
      const printed: Array<string> = []
      vi.spyOn(console, 'log').mockImplementation((...args: Array<unknown>) => void printed.push(args.map(String).join(' ')))
      const { exit, fake } = yield* run(
        Effect.zipRight(Effect.logDebug('labels: 3 to create'), Effect.logWarning('labels: failed').pipe(Effect.annotateLogs({ feature: 'labels' }))),
      )
      expect(Exit.isSuccess(exit)).toBe(true)
      const logs = fake.sent.find((request) => request.path === '/i/v1/logs')?.body ?? ''
      expect(logs).toContain('labels: 3 to create')
      expect(logs).toContain('labels: failed')
      expect(logs).toContain('"feature"')
      expect(printed).toStrictEqual([])
    }),
  )

  it.live('records a failure for error tracking and returns it unchanged', () =>
    Effect.gen(function* () {
      const { exit, fake } = yield* run(
        // @effect-diagnostics-next-line globalErrorInEffectFailure:off - a plain Error on purpose: any failure must be handled
        invoked(track(Effect.fail(new Error(`cannot read Acme-Corp/secret-project with ${TOKEN}`)), { operation: 'run', repository })),
      )
      expect(Exit.isFailure(exit)).toBe(true)
      const batch = fake.sent.find((request) => request.path === '/batch/')?.body ?? ''
      expect(batch).toContain('"$exception"')
      expect(batch).toContain('"outcome":"failure"')
      expect(batch).toContain('"error_tag":"Error"')
      expect(batch).toContain('"expected":true')
      expect(batch).toContain('cannot read [redacted] with [redacted]')
      // One exception for the one failure: the operation leaves reporting to its invocation.
      expect(batch.split('"$exception"')).toHaveLength(2)
      expect(batch).not.toContain(homedir())
      expect(fake.sent.find((request) => request.path === '/i/v1/logs')?.body).toContain('smartcloud run: failure')
      // Stack frames carry source lines, so only the full name is checked here.
      expect(fake.text()).not.toMatch(/acme-corp\/secret-project/i)
    }),
  )

  it.live('records a defect, and an interruption without an exception', () =>
    Effect.gen(function* () {
      const defect = yield* run(invoked(track(Effect.die(new Error('broken')), { operation: 'run', repository })))
      expect(Exit.isFailure(defect.exit)).toBe(true)
      expect(defect.fake.text()).toContain('"$exception"')
      expect(defect.fake.text()).toContain('"expected":false')
      const interrupted = yield* run(invoked(track(Effect.interrupt, { operation: 'run', repository })))
      expect(Exit.isInterrupted(interrupted.exit)).toBe(true)
      expect(interrupted.fake.text()).toContain('"outcome":"interrupted"')
      expect(interrupted.fake.text()).not.toContain('"$exception"')
    }),
  )

  it.live('reports an error on its own, for a failed feature', () =>
    Effect.gen(function* () {
      const { fake } = yield* run(reportError(repository, new Error('labels failed for Acme-Corp/secret-project'), { feature: 'labels' }))
      const batch = fake.sent.find((request) => request.path === '/batch/')?.body ?? ''
      expect(batch).toContain('"$exception"')
      expect(batch).toContain('"feature":"labels"')
    }),
  )

  it.live('identifies each organisation once', () =>
    Effect.gen(function* () {
      const { fake } = yield* run(Effect.zipRight(invoked(track(work, { operation: 'run', repository })), invoked(track(work, { operation: 'run', repository }))))
      expect(fake.text().split('"$groupidentify"')).toHaveLength(2)
    }),
  )

  it.live('stops sending everything once a config opts out, including what is queued', () =>
    Effect.gen(function* () {
      const { exit, fake } = yield* run(
        Effect.gen(function* () {
          yield* Effect.logInfo('before the config was read')
          yield* optOut
          const enabled = yield* Effect.flatMap(Telemetry, (telemetry) => telemetry.isEnabled)
          const value = yield* invoked(track(work, { operation: 'run', repository }))
          // @effect-diagnostics-next-line globalErrorInEffectFailure:off - a plain Error on purpose: any failure must be handled
          yield* invoked(track(Effect.fail(new Error('boom')), { operation: 'run', repository })).pipe(Effect.ignore)
          const flag = yield* evaluateFlag(repository, 'smartcloud-labels', true)
          return { enabled, value, flag }
        }),
        {},
        { '/flags/': { body: { featureFlags: { 'smartcloud-labels': false } } } },
      )
      expect(exit).toStrictEqual(Exit.succeed({ enabled: false, value: 42, flag: true }))
      expect(fake.sent).toStrictEqual([])
    }),
  )

  it.live('keeps going when PostHog fails', () =>
    Effect.gen(function* () {
      const { exit, fake } = yield* run(invoked(track(work, { operation: 'run', repository })), {}, {
        '/batch/': { status: 500 },
        '/i/v1/logs': { networkError: 'offline' },
      })
      expect(exit).toStrictEqual(Exit.succeed(42))
      expect(fake.sent.some((request) => request.path === '/batch/')).toBe(true)
    }),
  )
})

describe('telemetryLayer, anonymous and organisation data', () => {
  it.live('sends an anonymous identity personless, with no group', () =>
    Effect.gen(function* () {
      const anonymous = anonymousIdentity()
      const { fake } = yield* run(
        Effect.flatMap(Telemetry, (telemetry) =>
          Effect.all([
            telemetry.capture(anonymous, 'command run', { command: 'validate' }),
            telemetry.captureException(anonymous, new Error('bad config')),
            telemetry.describeOrganization(anonymous, { uses_house_preset: true }),
            telemetry.evaluateFlag(anonymous, 'smartcloud-labels', true),
          ]),
        ),
        {},
        { '/flags/': { body: { featureFlags: {} } } },
      )
      const batch = fake.sent.find((request) => request.path === '/batch/')?.body ?? ''
      expect(batch).toContain('"$process_person_profile":false')
      expect(batch).not.toContain('"$set"')
      expect(batch).not.toContain('"$groupidentify"')
      expect(batch).toContain(anonymous.distinctId)
    }),
  )

  it.live("sets an organisation's properties", () =>
    Effect.gen(function* () {
      const { fake } = yield* run(Effect.flatMap(Telemetry, (telemetry) => telemetry.describeOrganization(identity, { features_enabled: ['labels'], uses_house_preset: true })))
      const batch = fake.sent.find((request) => request.path === '/batch/')?.body ?? ''
      expect(batch).toContain('"$groupidentify"')
      expect(batch).toContain('"uses_house_preset":true')
    }),
  )

  it.live('removes the pretty logger NodeRuntime.runMain installs, so nothing is printed', () =>
    Effect.gen(function* () {
      const printed: Array<string> = []
      const record = (...args: Array<unknown>) => void printed.push(args.map(String).join(' '))
      vi.spyOn(console, 'log').mockImplementation(record)
      vi.spyOn(console, 'error').mockImplementation(record)
      const pretty = <A, E, R>(effect: Effect.Effect<A, E, R>) => effect.pipe(Effect.provide(Logger.add(Logger.prettyLoggerDefault)))
      for (const env of [{}, { SMARTCLOUD_TELEMETRY: 'false' }]) {
        const fake = fakeFetch()
        yield* Effect.logDebug('github getRepository: NotFound (404)').pipe(
          Effect.zipRight(Effect.logError('failed')),
          Effect.provide(telemetryLayer({ surface: 'cli', version: '1', fetch: fake.fetch, shutdownTimeoutMs: 1000 })),
          pretty,
          withEnv(env),
        )
      }
      expect(printed).toStrictEqual([])
    }),
  )
})

describe('evaluateFlag', () => {
  it.live('reads a flag through OpenFeature, for the hashed repository and its organisation', () =>
    Effect.gen(function* () {
      const { exit, fake } = yield* run(
        Effect.all([evaluateFlag(repository, 'smartcloud-labels', true), evaluateFlag(repository, 'smartcloud-missing', true)]),
        {},
        { '/flags/': { body: { featureFlags: { 'smartcloud-labels': false } } } },
      )
      expect(exit).toStrictEqual(Exit.succeed([false, true]))
      const request = fake.sent.find((sent) => sent.path === '/flags/')?.body ?? ''
      expect(request).toContain(identity.distinctId)
      expect(request).toContain(`"organization":"${identity.organization}"`)
    }),
  )

  it.live('falls back when PostHog cannot be reached', () =>
    Effect.gen(function* () {
      const { exit } = yield* run(evaluateFlag(repository, 'smartcloud-labels', true), {}, { '/flags/': { networkError: 'offline' } })
      expect(exit).toStrictEqual(Exit.succeed(true))
    }),
  )

  it.effect('falls back when PostHog does not answer in time', () =>
    Effect.gen(function* () {
      const fake = fakeFetch({ '/flags/': { hang: true } })
      const fiber = yield* evaluateFlag(repository, 'smartcloud-labels', false).pipe(
        Effect.provide(telemetryLayer({ surface: 'action', version: '1', fetch: fake.fetch, shutdownTimeoutMs: 10 })),
        withEnv({}),
        Effect.fork,
      )
      yield* Effect.promise(() => new Promise((resolve) => setTimeout(resolve, 50)))
      yield* TestClock.adjust('10 seconds')
      expect(yield* Fiber.join(fiber)).toBe(false)
    }),
  )
})

describe('without the Telemetry service', () => {
  it.effect('runs the effect unchanged and uses the fallback', () =>
    Effect.gen(function* () {
      yield* reportError(repository, new Error('ignored'))
      expect(yield* track(Effect.succeed(1), { operation: 'run', repository })).toBe(1)
      expect(yield* Effect.either(track(Effect.fail('no'), { operation: 'run', repository }))).toStrictEqual(Either.left('no'))
      expect(yield* evaluateFlag(repository, 'smartcloud-labels', true)).toBe(true)
      yield* optOut
    }),
  )

  it.effect('the disabled service does nothing', () =>
    Effect.gen(function* () {
      const layer = Layer.succeed(Telemetry, disabledTelemetry)
      const result = yield* Effect.gen(function* () {
        const telemetry = yield* Telemetry
        yield* telemetry.protect('x/y')
        yield* telemetry.capture(identity, 'e')
        yield* telemetry.captureException(identity, new Error('e'))
        yield* telemetry.describeOrganization(identity, {})
        yield* telemetry.disable
        return [yield* telemetry.isEnabled, yield* telemetry.evaluateFlag(identity, 'k', true)]
      }).pipe(Effect.provide(layer))
      expect(result).toStrictEqual([false, true])
    }),
  )
})
