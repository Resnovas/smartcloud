/**
 * @file tests/runtime/src/github.spec.ts
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

import { NodeContext } from '@effect/platform-node'
import { describe, expect, it } from '@effect/vitest'
import { ConfigSource } from '@resnovas/config'
import { Forbidden, NotFound, RateLimited, Unavailable } from '@resnovas/integrations.github'
import {
  gitHubConfigSource,
  InvalidRepository,
  liveConnect,
  MissingToken,
  parseRepository,
  presetError,
  PresetUnreadable,
  resolveToken,
} from '@resnovas/runtime'
import { Effect, Either, Redacted } from 'effect'
import { fakeCommand, withEnv } from './fixtures.js'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, vi } from 'vitest'

let dir: string
beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'smartcloud-runtime-'))
})
afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

// A fake `gh` on PATH, so the fallback is tested without the real CLI.
const withFakeGh = async (output: string) => fakeCommand(await mkdtemp(join(dir, 'bin-')), 'gh', output)

describe('tokens and connections', () => {
  it.effect('prefers GITHUB_TOKEN and keeps it redacted', () =>
    Effect.gen(function* () {
      const token = yield* resolveToken.pipe(withEnv({ GITHUB_TOKEN: 'from-env' }))
      expect(Redacted.value(token)).toBe('from-env')
      expect(String(token)).not.toContain('from-env')
    }).pipe(Effect.provide(NodeContext.layer)),
  )

  it('falls back to the GitHub CLI, and fails when neither has a token', async () => {
    await withFakeGh('from-gh')
    const token = await Effect.runPromise(resolveToken.pipe(withEnv({}), Effect.provide(NodeContext.layer)))
    expect(Redacted.value(token)).toBe('from-gh')
    vi.unstubAllEnvs()
    await withFakeGh('')
    const missing = await Effect.runPromise(
      Effect.either(resolveToken.pipe(withEnv({}), Effect.provide(NodeContext.layer))),
    )
    expect(missing).toStrictEqual(Either.left(new MissingToken()))
    expect(new MissingToken().message).toContain('GITHUB_TOKEN')
  })

  it('falls back to the GitHub CLI when GITHUB_TOKEN is set but blank', async () => {
    await withFakeGh('from-gh')
    const token = await Effect.runPromise(
      resolveToken.pipe(withEnv({ GITHUB_TOKEN: ' ' }), Effect.provide(NodeContext.layer)),
    )
    expect(Redacted.value(token)).toBe('from-gh')
  })

  it.effect('parses owner/name, rejecting anything else', () =>
    Effect.gen(function* () {
      expect(yield* parseRepository('Resnovas/smartcloud')).toStrictEqual({ owner: 'Resnovas', repo: 'smartcloud' })
      for (const bad of ['Resnovas', 'a/b/c', 'a /b', '/b'])
        expect(yield* Effect.flip(parseRepository(bad))).toBeInstanceOf(InvalidRepository)
      expect(new InvalidRepository({ repository: 'x' }).message).toBe('the repository must be owner/name, got "x"')
    }),
  )

  const contents = (text: string) =>
    new Response(JSON.stringify({ type: 'file', content: Buffer.from(text).toString('base64'), encoding: 'base64' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })

  it.effect('connects to the live API with the resolved token', () =>
    Effect.gen(function* () {
      const seen: Array<string> = []
      const fetch: typeof globalThis.fetch = (input, init) => {
        seen.push(`${String(input)} ${new Headers(init?.headers).get('authorization') ?? ''}`)
        return Promise.resolve(contents('hello'))
      }
      const github = yield* liveConnect({ fetch })({ owner: 'Resnovas', repo: 'example' }).pipe(
        withEnv({ GITHUB_TOKEN: 'secret' }),
      )
      expect(yield* github.getFile({ owner: 'Resnovas', repo: 'example', path: 'a.txt' })).toBe('hello')
      expect(seen[0]).toContain('/repos/Resnovas/example/contents/a.txt')
      expect(seen[0]).toContain('secret')
      expect(liveConnect()).toBeTypeOf('function')
    }).pipe(Effect.provide(NodeContext.layer)),
  )

  it.effect('reads presets from GitHub, turning any failure into ConfigNotFound', () =>
    Effect.gen(function* () {
      const ok: typeof globalThis.fetch = () => Promise.resolve(contents('version: 2\n'))
      const read = (fetch: typeof globalThis.fetch) =>
        Effect.flatMap(ConfigSource, (source) =>
          source.read({ owner: 'Resnovas', repo: '.github', path: 'a.yml', ref: 'v1' }),
        ).pipe(Effect.provide(gitHubConfigSource({ fetch })), withEnv({ GITHUB_TOKEN: 'secret' }))
      expect(yield* read(ok)).toBe('version: 2\n')
      const error = yield* Effect.flip(
        read(() => Promise.resolve(new Response('{"message":"Not Found"}', { status: 404 }))),
      )
      expect(error).toMatchObject({ _tag: 'ConfigNotFound', source: 'Resnovas/.github/a.yml@v1' })
      expect(gitHubConfigSource()).toBeDefined()
    }).pipe(Effect.provide(NodeContext.layer)),
  )
})

describe('preset read errors', () => {
  it.effect('keep why a preset could not be read when it is not simply missing', () =>
    Effect.gen(function* () {
      const read = (fetch: typeof globalThis.fetch, env: Record<string, string>) =>
        Effect.flip(
          Effect.flatMap(ConfigSource, (source) =>
            source.read({ owner: 'Resnovas', repo: '.github', path: 'a.yml' }),
          ).pipe(Effect.provide(gitHubConfigSource({ fetch })), withEnv(env)),
        )
      const unauthorised: typeof globalThis.fetch = () =>
        Promise.resolve(
          new Response('{"message":"Bad credentials"}', {
            status: 401,
            headers: { 'content-type': 'application/json' },
          }),
        )
      const denied = yield* read(unauthorised, { GITHUB_TOKEN: 'secret' })
      expect(denied).toBeInstanceOf(PresetUnreadable)
      expect(denied).toMatchObject({ _tag: 'ConfigNotFound', source: 'Resnovas/.github/a.yml' })
      expect(denied.message).toBe(
        'the extends preset Resnovas/.github/a.yml could not be read: getFile: forbidden (Bad credentials)',
      )
      expect(denied.message).not.toContain('secret')
      yield* Effect.promise(() => withFakeGh(''))
      const unused: typeof globalThis.fetch = () =>
        Promise.reject(new Error('GitHub must not be called without a token'))
      const signedOut = yield* read(unused, {})
      expect(signedOut.message).toBe(
        `the extends preset Resnovas/.github/a.yml could not be read: ${new MissingToken().message}`,
      )
    }).pipe(Effect.provide(NodeContext.layer)),
  )

  it('map a GitHub NotFound to a missing preset and anything else to PresetUnreadable', () => {
    const ref = { owner: 'Resnovas', repo: '.github', path: 'a.yml' }
    expect(presetError(ref)(new NotFound({ operation: 'getFile', detail: 'x' }))).not.toBeInstanceOf(PresetUnreadable)
    expect(presetError(ref)(new Unavailable({ operation: 'getFile', detail: 'down' }))).toBeInstanceOf(PresetUnreadable)
    expect(presetError(ref)(new Unavailable({ operation: 'getFile', detail: 'down' }))).toMatchObject({
      transient: true,
    })
    expect(presetError(ref)(new RateLimited({ operation: 'getFile', detail: 'slow down' }))).toMatchObject({
      transient: true,
    })
    expect(presetError(ref)(new Forbidden({ operation: 'getFile', detail: 'no' }))).toMatchObject({ transient: false })
  })
})
