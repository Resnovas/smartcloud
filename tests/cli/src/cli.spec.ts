/**
 * @file tests/cli/src/cli.spec.ts
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
import { ConfigSource } from '@resnovas/config'
import { fileKey, GitHub, makeMemoryGitHub } from '@resnovas/integrations.github'
import {
  ConfigSourceFromGitHub,
  gitHubConfigSource,
  main,
  locateConfig,
  migrate,
  MissingToken,
  NoConfig,
  resolveToken,
  run,
  validate,
} from '@resnovas/smartcloud'
import { ConfigProvider, Effect, Either, Layer, Redacted } from 'effect'
import { chmod, mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, vi } from 'vitest'

const fixture = (name: string) => join(import.meta.dirname, '../../config/src/fixtures', name)

let dir: string
let logs: Array<string>
beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'smartcloud-cli-'))
  logs = []
  vi.spyOn(console, 'log').mockImplementation((...args: Array<unknown>) => void logs.push(args.join(' ')))
})
afterEach(() => vi.restoreAllMocks())

const withEnv = (env: Record<string, string>) => Effect.withConfigProvider(ConfigProvider.fromMap(new Map(Object.entries(env))))

// A fake `gh` on PATH, so the fallback is tested without the real CLI.
const withFakeGh = async (output: string) => {
  const bin = join(dir, 'bin')
  await mkdir(bin)
  await writeFile(join(bin, 'gh'), `#!/bin/sh\nprintf '%s\\n' '${output}'\n`)
  await chmod(join(bin, 'gh'), 0o755)
  vi.stubEnv('PATH', `${bin}:${process.env['PATH'] ?? ''}`)
}
afterEach(() => vi.unstubAllEnvs())

describe('resolveToken', () => {
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
    dir = await mkdtemp(join(tmpdir(), 'smartcloud-cli-'))
    await withFakeGh('')
    const missing = await Effect.runPromise(Effect.either(resolveToken.pipe(withEnv({}), Effect.provide(NodeContext.layer))))
    expect(missing).toStrictEqual(Either.left(new MissingToken()))
    expect(new MissingToken().message).toContain('GITHUB_TOKEN')
  })
})

describe('locateConfig', () => {
  it.effect('finds the first candidate, and says where it looked otherwise', () =>
    Effect.gen(function* () {
      const missing = yield* Effect.flip(locateConfig(dir))
      expect(missing).toBeInstanceOf(NoConfig)
      expect(missing.message).toContain('.github/smartcloud.yml')
      yield* Effect.promise(async () => {
        await mkdir(join(dir, '.github'))
        await writeFile(join(dir, '.github/config.json'), '{}')
      })
      expect(yield* locateConfig(dir)).toBe(join(dir, '.github/config.json'))
    }).pipe(Effect.provide(NodeContext.layer)),
  )
})

const memorySource = (files: Record<string, string>) => {
  const { service, state } = makeMemoryGitHub()
  for (const [key, text] of Object.entries(files)) state.files.set(key, text)
  return ConfigSourceFromGitHub.pipe(Layer.provide(Layer.succeed(GitHub, service)))
}

describe('validate', () => {
  it.effect('resolves extends and reports sources and warnings', () =>
    Effect.gen(function* () {
      const file = join(dir, 'smartcloud.yml')
      yield* Effect.promise(() =>
        writeFile(file, 'version: 2\nextends: [Resnovas/.github/smartcloud.yml@main]\nlabels:\n  bug: { name: bug, color: d73a4a }\n'),
      )
      const resolved = yield* validate(file).pipe(
        Effect.provide(memorySource({ [fileKey('Resnovas', '.github', 'smartcloud.yml', 'main')]: 'version: 2\nroles: { maintainers: [TGTGamer] }\n' })),
      )
      expect(resolved.config.roles?.maintainers).toStrictEqual(['TGTGamer'])
      expect(logs[0]).toBe(`${file} is a valid smartcloud config.`)
      expect(logs[1]).toContain('Resnovas/.github/smartcloud.yml@main')
    }).pipe(Effect.provide(NodeContext.layer)),
  )

  it.effect('prints migration warnings for a v1 config and fails on a missing preset', () =>
    Effect.gen(function* () {
      yield* validate(fixture('v1-smartcloud.json')).pipe(Effect.provide(memorySource({})))
      expect(logs.some((line) => line.startsWith('warning: '))).toBe(true)
      const file = join(dir, 'broken.yml')
      yield* Effect.promise(() => writeFile(file, 'version: 2\nextends: [Resnovas/.github/missing.yml]\n'))
      const error = yield* Effect.flip(validate(file).pipe(Effect.provide(memorySource({}))))
      expect(error._tag).toBe('ConfigNotFound')
    }).pipe(Effect.provide(NodeContext.layer)),
  )
})

const contents = (text: string) =>
  new Response(JSON.stringify({ type: 'file', content: Buffer.from(text).toString('base64'), encoding: 'base64' }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })

describe('gitHubConfigSource', () => {
  it.effect('reads presets from GitHub with the resolved token', () =>
    Effect.gen(function* () {
      const seen: Array<string> = []
      const fetch: typeof globalThis.fetch = (input, init) => {
        seen.push(`${String(input)} ${new Headers(init?.headers).get('authorization') ?? ''}`)
        return Promise.resolve(contents('version: 2\n'))
      }
      const text = yield* Effect.flatMap(ConfigSource, (source) => source.read({ owner: 'Resnovas', repo: '.github', path: 'a.yml', ref: 'v1' })).pipe(
        Effect.provide(gitHubConfigSource({ fetch })),
        withEnv({ GITHUB_TOKEN: 'secret' }),
      )
      expect(text).toBe('version: 2\n')
      expect(seen[0]).toContain('/repos/Resnovas/.github/contents/a.yml?ref=v1')
      expect(seen[0]).toContain('secret')
    }).pipe(Effect.provide(NodeContext.layer)),
  )

  it.effect('turns any failure into ConfigNotFound naming the preset', () =>
    Effect.gen(function* () {
      const fetch: typeof globalThis.fetch = () => Promise.resolve(new Response('{"message":"Not Found"}', { status: 404 }))
      const error = yield* Effect.flip(
        Effect.flatMap(ConfigSource, (source) => source.read({ owner: 'Resnovas', repo: '.github', path: 'a.yml' })).pipe(
          Effect.provide(gitHubConfigSource({ fetch })),
          withEnv({ GITHUB_TOKEN: 'secret' }),
        ),
      )
      expect(error).toMatchObject({ _tag: 'ConfigNotFound', source: 'Resnovas/.github/a.yml' })
    }).pipe(Effect.provide(NodeContext.layer)),
  )
})

describe('migrate', () => {
  it.effect('prints v2 YAML with a schema hint and every warning', () =>
    Effect.gen(function* () {
      const config = yield* migrate(fixture('v1-smartcloud.json'), undefined)
      expect(config.version).toBe(2)
      expect(logs[0]).toMatch(/^# yaml-language-server: \$schema=.*smartcloud\.schema\.json\nversion: 2\n/)
      expect(logs.some((line) => line.startsWith('warning: '))).toBe(true)
    }).pipe(Effect.provide(NodeContext.layer)),
  )

  it.effect('writes to a file, and round-trips through validate', () =>
    Effect.gen(function* () {
      const out = join(dir, 'smartcloud.yml')
      yield* migrate(fixture('v1-eventiva.json'), out)
      expect(logs).toContain(`Wrote ${out}.`)
      const written = yield* Effect.promise(() => readFile(out, 'utf8'))
      expect(written).toContain('version: 2')
      yield* validate(out).pipe(Effect.provide(memorySource({})))
    }).pipe(Effect.provide(NodeContext.layer)),
  )

  it.effect('rejects a file that does not parse, or is not a mapping', () =>
    Effect.gen(function* () {
      const bad = join(dir, 'bad.json')
      yield* Effect.promise(() => writeFile(bad, '{ nope'))
      expect((yield* Effect.flip(migrate(bad, undefined)))._tag).toBe('ConfigParseError')
      const list = join(dir, 'list.json')
      yield* Effect.promise(() => writeFile(list, '[]'))
      expect((yield* Effect.flip(migrate(list, undefined)))._tag).toBe('ConfigDecodeError')
    }).pipe(Effect.provide(NodeContext.layer)),
  )
})

describe('the smartcloud command', () => {
  it.effect('runs migrate and validate from an argument vector', () =>
    Effect.gen(function* () {
      const out = join(dir, 'out.yml')
      yield* run(['node', 'smartcloud', 'migrate', fixture('v1-eventiva.json'), '--out', out])
      expect(logs).toContain(`Wrote ${out}.`)
      yield* run(['node', 'smartcloud', 'validate', out])
      expect(logs).toContain(`${out} is a valid smartcloud config.`)
    }).pipe(Effect.provide(NodeContext.layer)),
  )

  it.effect('validate finds the config in the working directory', () =>
    Effect.gen(function* () {
      yield* Effect.promise(async () => {
        await mkdir(join(dir, '.github'))
        await writeFile(join(dir, '.github/smartcloud.yml'), 'version: 2\n')
      })
      const cwd = process.cwd()
      process.chdir(dir)
      yield* run(['node', 'smartcloud', 'validate']).pipe(Effect.ensuring(Effect.sync(() => process.chdir(cwd))))
      expect(logs).toContain('.github/smartcloud.yml is a valid smartcloud config.')
    }).pipe(Effect.provide(NodeContext.layer)),
  )

  it.effect('prints one line and sets exit code 1 on failure, and only the exit code on a usage error', () =>
    Effect.gen(function* () {
      const errors: Array<string> = []
      vi.spyOn(console, 'error').mockImplementation((...args: Array<unknown>) => void errors.push(args.join(' ')))
      const before = process.exitCode
      yield* main(['node', 'smartcloud', 'validate', join(dir, 'missing.yml')])
      expect(errors).toHaveLength(1)
      expect(errors[0]).toMatch(/^smartcloud: .*missing\.yml/)
      expect(process.exitCode).toBe(1)
      process.exitCode = before
      yield* main(['node', 'smartcloud', 'bogus'])
      expect(errors.filter((line) => line.startsWith('smartcloud: '))).toHaveLength(1)
      expect(process.exitCode).toBe(1)
      process.exitCode = before
      yield* main(['node', 'smartcloud', 'validate', fixture('v1-eventiva.json')])
      expect(process.exitCode).toBe(before)
    }).pipe(Effect.provide(NodeContext.layer)),
  )
})
