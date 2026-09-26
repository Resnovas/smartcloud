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
 * (CODE_OF_CONDUCT.md) and the Eventiva Cooperation Commitment
 * (COOPERATION_COMMITMENT.md).
 *
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE.
 */

import { NodeContext } from '@effect/platform-node'
import { describe, expect, it } from '@effect/vitest'
import { program } from '@resnovas/action'
import { disabledTelemetry, Telemetry } from '@resnovas/integrations.posthog'
import { Effect, Layer } from 'effect'
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
})
