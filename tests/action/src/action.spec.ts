/**
 * @file tests/action/src/action.spec.ts
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
import { FEATURES, NoConfig, program, readInputs, runAction, UnknownFeatures, type Inputs } from '@resnovas/action'
import { fileKey, GitHub, makeMemoryGitHub, type MemoryState } from '@resnovas/integrations.github'
import { ConfigProvider, Effect, Option, Redacted } from 'effect'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, vi } from 'vitest'

const withEnv = (env: Record<string, string>) => Effect.withConfigProvider(ConfigProvider.fromMap(new Map(Object.entries(env))))

// A pull request payload with the fields GitHub sends.
const pullRequest = (title: string) => ({
  action: 'opened',
  pull_request: {
    number: 7,
    title,
    body: '',
    user: { login: 'jane' },
    state: 'open',
    locked: false,
    draft: false,
    labels: [],
    updated_at: '2026-09-01T00:00:00Z',
    head: { ref: 'feat/x', sha: 'abc123' },
  },
})

const CONVENTIONS = 'version: 2\nconventions:\n  rules:\n    title:\n      preset: conventionalCommits\n'

const memory = (files: Record<string, string> = {}, seed: Partial<MemoryState> = {}) => {
  const github = makeMemoryGitHub(seed)
  for (const [path, text] of Object.entries(files)) github.state.files.set(fileKey('Resnovas', 'example', path), text)
  github.state.pulls.set(7, { commits: [], files: [], reviews: [], requestedReviewers: [], submittedReviews: [] })
  return github
}

const inputs = (overrides: Partial<Inputs> = {}): Inputs => ({
  token: Redacted.make('t'),
  config: Option.none(),
  configJson: Option.none(),
  configRef: Option.none(),
  dryRun: false,
  features: Option.none(),
  deprecations: [],
  ...overrides,
})

describe('readInputs', () => {
  it.effect('reads empty inputs as absent, and booleans strictly', () =>
    Effect.gen(function* () {
      const read = yield* readInputs.pipe(withEnv({ INPUT_GITHUB_TOKEN: 'abc', INPUT_CONFIG: '  ', INPUT_DRYRUN: 'false' }))
      expect(Redacted.value(read.token)).toBe('abc')
      expect(read.config).toStrictEqual(Option.none())
      expect(read.dryRun).toBe(false)
      expect(read.deprecations).toStrictEqual([])
      const dry = yield* readInputs.pipe(
        withEnv({ INPUT_GITHUB_TOKEN: 'abc', INPUT_DRYRUN: 'TRUE', INPUT_FEATURES: 'labels, stale,', INPUT_CONFIGREF: 'v2' }),
      )
      expect(dry.dryRun).toBe(true)
      expect(dry.features).toStrictEqual(Option.some(['labels', 'stale']))
      expect(dry.configRef).toStrictEqual(Option.some('v2'))
    }),
  )

  it.effect('falls back to GITHUB_TOKEN, fails with no token, and flags v1 inputs', () =>
    Effect.gen(function* () {
      const read = yield* readInputs.pipe(withEnv({ INPUT_GITHUB_TOKEN: '', GITHUB_TOKEN: 'env', INPUT_FILLEMPTY: 'true', INPUT_SKIPDELETE: 'false' }))
      expect(Redacted.value(read.token)).toBe('env')
      expect(read.deprecations).toHaveLength(2)
      expect(read.deprecations[1]).toContain('labelSync.prune')
      const missing = yield* Effect.either(readInputs.pipe(withEnv({})))
      expect(missing._tag).toBe('Left')
    }),
  )
})

describe('runAction', () => {
  it.effect('reads the config from the default branch, runs features and publishes the report', () =>
    Effect.gen(function* () {
      const { service, state } = memory({ '.github/smartcloud.yml': CONVENTIONS })
      const outcome = yield* runAction(inputs(), { name: 'pull_request', payload: pullRequest('Add things') }).pipe(
        Effect.provideService(GitHub, service),
      )
      expect(outcome.result.ran).toContain('conventions')
      expect(outcome.result.findings.map((finding) => finding.rule)).toStrictEqual(['conventions.title'])
      expect(state.checkRuns.map((run) => [run.name, run.conclusion])).toContainEqual(['smartcloud / conventions', 'failure'])
      expect(state.issues.get(7)?.comments).toHaveLength(1)
    }),
  )

  it.effect('prefers configJson, then the config input, and honours configRef', () =>
    Effect.gen(function* () {
      const { service, state } = memory()
      const json = yield* runAction(inputs({ configJson: Option.some(CONVENTIONS) }), { name: 'pull_request', payload: pullRequest('feat: x') }).pipe(
        Effect.provideService(GitHub, service),
      )
      expect(json.result.findings).toStrictEqual([])
      state.files.set(fileKey('Resnovas', 'example', 'custom.yml', 'v2'), CONVENTIONS)
      const custom = yield* runAction(inputs({ config: Option.some('custom.yml'), configRef: Option.some('v2') }), {
        name: 'pull_request',
        payload: pullRequest('feat: x'),
      }).pipe(Effect.provideService(GitHub, service))
      expect(custom.result.ran).toContain('conventions')
    }),
  )

  it.effect('migrates a v1 config.json, passing on its warnings with the deprecations', () =>
    Effect.gen(function* () {
      const v1 = yield* Effect.promise(() => readFile(join(import.meta.dirname, '../../config/src/fixtures/v1-smartcloud.json'), 'utf8'))
      const { service } = memory({ '.github/config.json': v1 })
      const outcome = yield* runAction(inputs({ deprecations: ['old input'] }), { name: 'pull_request', payload: pullRequest('feat: x') }).pipe(
        Effect.provideService(GitHub, service),
      )
      expect(outcome.warnings[0]).toBe('old input')
      expect(outcome.warnings.some((warning) => warning.startsWith('.github/config.json: '))).toBe(true)
    }),
  )

  it.effect('reads extends presets through GitHub, and names a missing one', () =>
    Effect.gen(function* () {
      const { service, state } = memory({ '.github/smartcloud.yml': 'version: 2\nextends: [Resnovas/.github/house.yml]\n' })
      state.files.set(fileKey('Resnovas', '.github', 'house.yml'), CONVENTIONS)
      const outcome = yield* runAction(inputs(), { name: 'pull_request', payload: pullRequest('nope') }).pipe(Effect.provideService(GitHub, service))
      expect(outcome.result.findings).toHaveLength(1)
      state.files.delete(fileKey('Resnovas', '.github', 'house.yml'))
      const error = yield* Effect.flip(runAction(inputs(), { name: 'pull_request', payload: pullRequest('nope') }).pipe(Effect.provideService(GitHub, service)))
      expect(error).toMatchObject({ _tag: 'ConfigNotFound', source: 'Resnovas/.github/house.yml' })
    }),
  )

  it.effect('fails clearly with no config, or an unknown feature, and runs only selected features', () =>
    Effect.gen(function* () {
      const empty = memory()
      const none = yield* Effect.flip(runAction(inputs(), { name: 'pull_request', payload: pullRequest('x') }).pipe(Effect.provideService(GitHub, empty.service)))
      expect(none).toBeInstanceOf(NoConfig)
      expect(none.message).toContain('.github/smartcloud.yml, .github/smartcloud.yaml, .github/config.json')
      const { service } = memory({ '.github/smartcloud.yml': CONVENTIONS })
      const unknown = yield* Effect.flip(
        runAction(inputs({ features: Option.some(['labels', 'nope']) }), { name: 'pull_request', payload: pullRequest('x') }).pipe(
          Effect.provideService(GitHub, service),
        ),
      )
      expect(unknown).toBeInstanceOf(UnknownFeatures)
      expect(unknown.message).toContain('nope')
      const only = yield* runAction(inputs({ features: Option.some(['labels']) }), { name: 'pull_request', payload: pullRequest('x') }).pipe(
        Effect.provideService(GitHub, service),
      )
      expect([...only.result.ran, ...only.result.skipped.map((skip) => skip.feature)]).toStrictEqual(['labels'])
      expect(FEATURES.map((feature) => feature.name)).toStrictEqual(['conventions', 'commits', 'disclosure', 'reviews', 'labels', 'stale', 'settings', 'sync'])
    }),
  )
})

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
