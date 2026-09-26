/**
 * @file tests/action/src/program.spec.ts
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

import { NodeContext } from '@effect/platform-node'
import { describe, expect, it } from '@effect/vitest'
import { program } from '@resnovas/action'
import { disabledTelemetry, Telemetry, telemetryLayer } from '@resnovas/integrations.posthog'
import { Forbidden } from '@resnovas/integrations.github'
import { Effect, Layer, Logger, Redacted } from 'effect'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, vi } from 'vitest'
import { CONVENTIONS, memory, pullRequest, withEnv } from './fixtures.js'

describe('program', () => {
  let dir: string
  let out: Array<string>
  let exitCode: typeof process.exitCode
  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'smartcloud-action-'))
    out = []
    exitCode = process.exitCode
    vi.spyOn(console, 'log').mockImplementation((...args: Array<unknown>) => void out.push(args.join(' ')))
  })
  afterEach(() => {
    process.exitCode = exitCode
    vi.restoreAllMocks()
  })

  const env = async (payload: unknown, extra: Record<string, string> = {}) => {
    const eventPath = join(dir, 'event.json')
    await writeFile(eventPath, typeof payload === 'string' ? payload : JSON.stringify(payload))
    return {
      INPUT_GITHUB_TOKEN: 't',
      GITHUB_EVENT_NAME: 'pull_request',
      GITHUB_EVENT_PATH: eventPath,
      GITHUB_REPOSITORY: 'Resnovas/example',
      GITHUB_STEP_SUMMARY: join(dir, 'summary.md'),
      ...extra,
    }
  }

  it.effect('writes annotations and the summary, and exits 1 on an error finding', () =>
    Effect.gen(function* () {
      const { service } = memory({ '.github/smartcloud.yml': CONVENTIONS })
      const vars = yield* Effect.promise(() => env(pullRequest('Add things'), { INPUT_FILLEMPTY: 'true' }))
      yield* program(() => Effect.succeed(service)).pipe(withEnv(vars))
      expect(out[0]).toMatch(/^::warning title=smartcloud::the fillEmpty input is ignored/)
      expect(out.some((line) => line.startsWith('::error title=conventions.title::'))).toBe(true)
      expect(out.at(-1)).toBe('::error title=smartcloud::smartcloud found problems; see the job summary.')
      expect(process.exitCode).toBe(1)
      expect(yield* Effect.promise(() => readFile(vars.GITHUB_STEP_SUMMARY, 'utf8'))).toContain('## smartcloud')
    }).pipe(Effect.provide(NodeContext.layer)),
  )

  it.effect('passes quietly without a summary file', () =>
    Effect.gen(function* () {
      const { service } = memory({ '.github/smartcloud.yml': CONVENTIONS })
      const { GITHUB_STEP_SUMMARY: _summary, ...vars } = yield* Effect.promise(() => env(pullRequest('feat: x')))
      yield* program(() => Effect.succeed(service)).pipe(withEnv(vars))
      expect(out).toStrictEqual([])
      expect(process.exitCode).toBe(exitCode)
    }).pipe(Effect.provide(NodeContext.layer)),
  )

  it.effect('turns telemetry off when the telemetry input is false, and runs as before', () =>
    Effect.gen(function* () {
      const { service } = memory({ '.github/smartcloud.yml': CONVENTIONS })
      let enabled = true
      const telemetry = Layer.succeed(Telemetry, {
        ...disabledTelemetry,
        disable: Effect.sync(() => {
          enabled = false
        }),
      })
      const { GITHUB_STEP_SUMMARY: _summary, ...vars } = yield* Effect.promise(() => env(pullRequest('feat: x'), { INPUT_TELEMETRY: 'false' }))
      yield* program(() => Effect.succeed(service)).pipe(withEnv(vars), Effect.provide(telemetry))
      expect(enabled).toBe(false)
      expect(out).toStrictEqual([])
      expect(process.exitCode).toBe(exitCode)
    }).pipe(Effect.provide(NodeContext.layer)),
  )

  it.effect('records writes instead of making them in a dry run', () =>
    Effect.gen(function* () {
      const { service, state } = memory({ '.github/smartcloud.yml': CONVENTIONS })
      const vars = yield* Effect.promise(() => env(pullRequest('Add things'), { INPUT_DRYRUN: 'true' }))
      yield* program(() => Effect.succeed(service)).pipe(withEnv(vars))
      expect(state.checkRuns).toHaveLength(0)
      expect(state.issues.get(7)?.comments ?? []).toHaveLength(0)
      const summary = yield* Effect.promise(() => readFile(vars.GITHUB_STEP_SUMMARY, 'utf8'))
      expect(summary).toContain('**Dry run:** these writes were recorded, not made:\n- createCheckRun')
      const quiet = yield* Effect.promise(() => env({}, { INPUT_DRYRUN: 'true', GITHUB_EVENT_NAME: 'schedule' }))
      yield* program(() => Effect.succeed(service)).pipe(withEnv(quiet))
      expect(yield* Effect.promise(() => readFile(vars.GITHUB_STEP_SUMMARY, 'utf8'))).toContain('**Dry run:** nothing would have been written.')
    }).pipe(Effect.provide(NodeContext.layer)),
  )

  it.effect(
    'acts with the workflow token on a fork, skipping the private preset, PAT-only features and refused writes',
    () =>
      Effect.gen(function* () {
        const config = `version: 2\nextends: ['Resnovas/.github/smartcloud/house.yml@main']\n${CONVENTIONS.replace('version: 2\n', '')}`
        const { service, state } = memory({ '.github/smartcloud.yml': config })
        const readOnly = {
          ...service,
          createCheckRun: () => Effect.fail(new Forbidden({ operation: 'createCheckRun', detail: 'read-only' })),
        }
        const fork = pullRequest('feat: x')
        const payload = {
          ...fork,
          pull_request: {
            ...fork.pull_request,
            head: { ...fork.pull_request.head, repo: { full_name: 'someone/example' } },
          },
        }
        const vars = yield* Effect.promise(() =>
          env(payload, { INPUT_GITHUB_TOKEN: 'pat', INPUT_WORKFLOWTOKEN: 'workflow' }),
        )
        const tokens: Array<string> = []
        yield* program(({ token }) =>
          Effect.sync(() => tokens.push(Redacted.value(token))).pipe(Effect.as(readOnly)),
        ).pipe(withEnv(vars))
        expect(tokens).toStrictEqual(['workflow'])
        expect(state.checkRuns).toHaveLength(0)
        expect(process.exitCode).toBe(exitCode)
        const summary = yield* Effect.promise(() => readFile(vars.GITHUB_STEP_SUMMARY, 'utf8'))
        expect(summary).toContain('ran with restricted access (a pull request from a fork)')
        expect(summary).toContain('settings: restricted access (a pull request from a fork)')
        expect(summary).toContain(
          '**Restricted access:** the token was not allowed to make these writes, so they were skipped:\n- createCheckRun',
        )
        expect(out.some((line) => line.startsWith('::warning title=access.config-skipped::'))).toBe(true)
      }).pipe(Effect.provide(NodeContext.layer)),
  )

  it.effect('treats the workflow token as restricted, and a stronger token as full access', () =>
    Effect.gen(function* () {
      const { service } = memory({ '.github/smartcloud.yml': CONVENTIONS })
      const restricted = yield* Effect.promise(() =>
        env(pullRequest('feat: x'), { INPUT_GITHUB_TOKEN: 'same', INPUT_WORKFLOWTOKEN: 'same' }),
      )
      yield* program(() => Effect.succeed(service)).pipe(withEnv(restricted))
      const summary = yield* Effect.promise(() => readFile(restricted.GITHUB_STEP_SUMMARY, 'utf8'))
      expect(summary).toContain('ran with restricted access (the workflow token, without the ACCESS_TOKEN secret)')
      expect(summary).not.toContain('**Restricted access:**')
      const full = yield* Effect.promise(() =>
        env(pullRequest('feat: x'), {
          INPUT_GITHUB_TOKEN: 'pat',
          INPUT_WORKFLOWTOKEN: 'workflow',
          GITHUB_STEP_SUMMARY: join(dir, 'full.md'),
        }),
      )
      yield* program(() => Effect.succeed(service)).pipe(withEnv(full))
      expect(yield* Effect.promise(() => readFile(full.GITHUB_STEP_SUMMARY, 'utf8'))).not.toContain('restricted access')
    }).pipe(Effect.provide(NodeContext.layer)),
  )

  it.effect('turns every failure into one error annotation and exit code 1', () =>
    Effect.gen(function* () {
      const { service } = memory({ '.github/smartcloud.yml': CONVENTIONS })
      const bad = yield* Effect.promise(() => env('{ nope'))
      yield* program(() => Effect.succeed(service)).pipe(withEnv(bad))
      expect(out[0]).toMatch(/^::error title=smartcloud::could not read the event payload at .*event\.json: /)
      yield* program(() => Effect.succeed(service)).pipe(withEnv({ ...bad, GITHUB_EVENT_PATH: join(dir, 'missing.json') }))
      expect(out[1]).toContain('missing.json')
      const good = yield* Effect.promise(() => env(pullRequest('feat: x')))
      yield* program(() => Effect.die(new Error('socket\nclosed'))).pipe(withEnv(good))
      expect(out[2]).toBe('::error title=smartcloud::unexpected failure: socket%0Aclosed')
      yield* program(() => Effect.die('boom')).pipe(withEnv(good))
      expect(out[3]).toBe('::error title=smartcloud::unexpected failure: boom')
      expect(process.exitCode).toBe(1)
    }).pipe(Effect.provide(NodeContext.layer)),
  )

  // The live telemetry layer over a fetch that records every request, with
  // the pretty logger NodeRuntime.runMain adds around everything.
  const live = () => {
    const sent: Array<{ readonly path: string; readonly body: string }> = []
    const fetch: typeof globalThis.fetch = async (input, init) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
      sent.push({ path: new URL(url).pathname, body: typeof init?.body === 'string' ? init.body : '' })
      return new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } })
    }
    const layer = Layer.merge(telemetryLayer({ surface: 'action', version: '9.9.9', fetch }), Logger.add(Logger.prettyLoggerDefault))
    const batch = () => sent.filter((request) => request.path === '/batch/').map((request) => request.body).join('\n')
    return { layer, batch }
  }

  it.effect('reports a failed run as one exception, with the inputs it was given, and prints only the annotation', () =>
    Effect.gen(function* () {
      const printed: Array<string> = []
      vi.spyOn(console, 'error').mockImplementation((...args: Array<unknown>) => void printed.push(args.join(' ')))
      const { service } = memory()
      const vars = yield* Effect.promise(() => env({ action: 'opened' }, { GITHUB_EVENT_NAME: 'push', INPUT_DRYRUN: 'true', INPUT_CONFIGREF: 'main' }))
      const telemetry = live()
      yield* program(() => Effect.succeed(service)).pipe(Effect.provide(telemetry.layer), withEnv(vars))
      expect(process.exitCode).toBe(1)
      expect(out).toHaveLength(1)
      expect(out[0]).toMatch(/^::error title=smartcloud::no smartcloud config in \[redacted\]|^::error title=smartcloud::no smartcloud config in Resnovas\/example/)
      expect(printed).toStrictEqual([])
      const batch = telemetry.batch()
      expect(batch.split('"event":"$exception"')).toHaveLength(2)
      expect(batch).toContain('"error_tag":"NoConfig"')
      expect(batch).toContain('"command":"run"')
      expect(batch).toContain('"surface":"action"')
      expect(batch).toContain('"options":["configRef","dryRun"]')
      expect(batch).not.toContain('Resnovas/example')
    }).pipe(Effect.provide(NodeContext.layer)),
  )

  it.effect('reports a run that cannot read its inputs', () =>
    Effect.gen(function* () {
      const telemetry = live()
      yield* program(() => Effect.die('unreachable')).pipe(Effect.provide(telemetry.layer), withEnv({}))
      expect(process.exitCode).toBe(1)
      expect(out[0]).toMatch(/^::error title=smartcloud::/)
      expect(telemetry.batch()).toContain('"event":"$exception"')
      expect(telemetry.batch()).toContain('"error_tag":"ConfigError"')
    }).pipe(Effect.provide(NodeContext.layer)),
  )

})
