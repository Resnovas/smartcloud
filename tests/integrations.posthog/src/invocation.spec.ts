/**
 * @file tests/integrations.posthog/src/invocation.spec.ts
 *
 * Copyright 2021 Jonathan Stevens trading as Resnovas. All rights reserved.
 * Licensed under the Fair Core License, Version 1.0, MIT Future License
 * (FCL-1.0-MIT); see LICENSE. You may not move, change, disable or circumvent
 * the licence key functionality, or modify any part of the software that the
 * licence key protects.
 *
 * Contributions are made under the Developer Certificate of Origin (DCO.md) and
 * the Contributing Guidelines (CONTRIBUTING.md), subject to the Code of Conduct
 * (CODE_OF_CONDUCT.md) and the Eventiva Cooperation Commitment
 * (COOPERATION_COMMITMENT.md).
 *
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE.
 */

import { describe, expect, it } from '@effect/vitest'
import {
  bindRepository,
  describeOrganization,
  disabledTelemetry,
  emit,
  errorTag,
  identify,
  invocation,
  noteOptions,
  protect,
  Telemetry,
  telemetryLayer,
  type Identity,
  type Properties,
  type TelemetryService,
} from '@resnovas/integrations.posthog'
import { ConfigProvider, Data, Effect, Exit, Fiber, Layer } from 'effect'
import { afterEach, vi } from 'vitest'
import { fakeFetch } from './fake-fetch.js'

afterEach(() => {
  vi.restoreAllMocks()
})

const repository = { owner: 'Acme-Corp', repo: 'secret-project' }
const bound = identify(repository)

class RepositoryMissing extends Data.TaggedError('RepositoryMissing')<Record<never, never>> {}

// A Telemetry service that records what it is asked to send, and for whom.
const recording = () => {
  const events: Array<{ readonly identity: Identity; readonly event: string; readonly properties: Properties }> = []
  const exceptions: Array<{ readonly identity: Identity; readonly error: unknown; readonly properties: Properties }> = []
  const organisations: Array<{ readonly identity: Identity; readonly properties: Properties }> = []
  const protectedValues: Array<string> = []
  const service: TelemetryService = {
    ...disabledTelemetry,
    protect: (value) => Effect.sync(() => void protectedValues.push(value)),
    capture: (identity, event, properties = {}) => Effect.sync(() => void events.push({ identity, event, properties })),
    captureException: (identity, error, properties = {}) => Effect.sync(() => void exceptions.push({ identity, error, properties })),
    describeOrganization: (identity, properties) => Effect.sync(() => void organisations.push({ identity, properties })),
  }
  return { layer: Layer.succeed(Telemetry, service), events, exceptions, organisations, protectedValues }
}

const completed = { completed: (summary: Properties) => ({ event: 'command run', properties: summary }) }

describe('invocation', () => {
  it.effect('sends the completion event, anonymously until a repository is bound', () =>
    Effect.gen(function* () {
      const recorded = recording()
      const value = yield* invocation(Effect.as(emit('config resolved', { presets: ['house'] }), 7), { command: 'validate', options: ['path', 'path'], ...completed }).pipe(
        Effect.provide(recorded.layer),
      )
      expect(value).toBe(7)
      expect(recorded.events.map((sent) => sent.event)).toStrictEqual(['config resolved', 'command run'])
      const [first, last] = recorded.events
      expect(first?.identity.organization).toBeUndefined()
      expect(last?.identity.distinctId).toBe(first?.identity.distinctId)
      expect(last?.properties).toMatchObject({ command: 'validate', options: ['path'], outcome: 'success' })
      expect(last?.properties['error_tag']).toBeUndefined()
      expect(recorded.exceptions).toStrictEqual([])
    }),
  )

  it.effect('switches to the repository once it is bound, and protects its name', () =>
    Effect.gen(function* () {
      const recorded = recording()
      const work = Effect.gen(function* () {
        yield* noteOptions(['dryRun'])
        yield* bindRepository(repository)
        yield* emit('feature run', { feature: 'labels' })
        yield* describeOrganization({ uses_house_preset: false })
      })
      yield* invocation(work, { command: 'run', ...completed }).pipe(Effect.provide(recorded.layer))
      expect(recorded.protectedValues).toStrictEqual(['Acme-Corp/secret-project'])
      expect(recorded.events.map((sent) => sent.identity)).toStrictEqual([bound, bound])
      expect(recorded.events[1]?.properties['options']).toStrictEqual(['dryRun'])
      expect(recorded.organisations).toStrictEqual([{ identity: bound, properties: { uses_house_preset: false } }])
    }),
  )

  it.effect('reports a typed failure as expected, with its tag, and returns it unchanged', () =>
    Effect.gen(function* () {
      const recorded = recording()
      const exit = yield* invocation(Effect.zipRight(bindRepository(repository), new RepositoryMissing()), { command: 'dry-run', ...completed }).pipe(
        Effect.provide(recorded.layer),
        Effect.exit,
      )
      expect(Exit.isFailure(exit)).toBe(true)
      expect(recorded.exceptions).toHaveLength(1)
      expect(recorded.exceptions[0]?.identity).toStrictEqual(bound)
      expect(recorded.exceptions[0]?.error).toBeInstanceOf(RepositoryMissing)
      expect(recorded.exceptions[0]?.properties).toMatchObject({ command: 'dry-run', outcome: 'failure', error_tag: 'RepositoryMissing', expected: true })
      expect(recorded.events[0]?.properties).toMatchObject({ outcome: 'failure', error_tag: 'RepositoryMissing', expected: true })
    }),
  )

  it.effect('reports a defect as unexpected, and an interruption not at all', () =>
    Effect.gen(function* () {
      const recorded = recording()
      yield* invocation(Effect.die(new TypeError('boom')), { command: 'sync', ...completed }).pipe(Effect.provide(recorded.layer), Effect.exit)
      expect(recorded.exceptions[0]?.properties).toMatchObject({ error_tag: 'TypeError', expected: false })
      const interrupted = yield* invocation(Effect.interrupt, { command: 'sync', ...completed }).pipe(Effect.provide(recorded.layer), Effect.exit)
      expect(Exit.isInterrupted(interrupted)).toBe(true)
      expect(recorded.exceptions).toHaveLength(1)
      expect(recorded.events.map((sent) => sent.properties['outcome'])).toStrictEqual(['failure', 'interrupted'])
    }),
  )

  it.effect('sends no completion event when the caller defines none', () =>
    Effect.gen(function* () {
      const recorded = recording()
      yield* invocation(Effect.void, { command: 'validate' }).pipe(Effect.provide(recorded.layer))
      expect(recorded.events).toStrictEqual([])
    }),
  )

  it.effect('runs unchanged without the Telemetry service, and the helpers do nothing', () =>
    Effect.gen(function* () {
      expect(yield* invocation(Effect.succeed(1), { command: 'validate' })).toBe(1)
      yield* protect('x/y')
      yield* bindRepository(repository)
      yield* emit('feature run', {})
      yield* describeOrganization({})
      yield* noteOptions(['x'])
    }),
  )

  it.effect('the helpers do nothing outside an invocation, apart from protecting the name', () =>
    Effect.gen(function* () {
      const recorded = recording()
      yield* Effect.all([bindRepository(repository), emit('feature run', {}), describeOrganization({}), noteOptions(['x'])]).pipe(Effect.provide(recorded.layer))
      expect(recorded.events).toStrictEqual([])
      expect(recorded.organisations).toStrictEqual([])
      expect(recorded.protectedValues).toStrictEqual(['Acme-Corp/secret-project'])
    }),
  )

  it.live('links logs and the span to the bound repository, through the live layer', () =>
    Effect.gen(function* () {
      const fake = fakeFetch()
      const work = Effect.zipRight(bindRepository(repository), Effect.logDebug('github getRepository: NotFound (404)'))
      const fiber = yield* invocation(work, { command: 'dry-run', ...completed }).pipe(
        Effect.provide(telemetryLayer({ surface: 'cli', version: '1', fetch: fake.fetch, shutdownTimeoutMs: 1000 })),
        Effect.withConfigProvider(ConfigProvider.fromMap(new Map())),
        Effect.fork,
      )
      yield* Fiber.join(fiber)
      const logs = fake.sent.find((request) => request.path === '/i/v1/logs')?.body ?? ''
      expect(logs).toContain('github getRepository: NotFound (404)')
      expect(logs).toContain(bound.distinctId)
      const traces = fake.sent.find((request) => request.path === '/i/v1/traces')?.body ?? ''
      expect(traces).toContain('"smartcloud.command"')
      expect(traces).toContain(bound.distinctId)
      expect(fake.text()).not.toMatch(/acme-corp\/secret-project/i)
    }),
  )
})

describe('errorTag', () => {
  it('names a plain object, and an error without a tag', () => {
    expect(errorTag({})).toBe('Object')
    expect(errorTag(null)).toBe('object')
    expect(errorTag({ _tag: 7 })).toBe('Object')
  })
})
