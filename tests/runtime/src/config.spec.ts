/**
 * @file tests/runtime/src/config.spec.ts
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
import { ConfigSource, parseConfig } from '@resnovas/config'
import { fileKey, GitHub } from '@resnovas/integrations.github'
import {
  CONFIG_CANDIDATES,
  configLocationFor,
  ConfigSourceFromGitHub,
  explainConfig,
  loadConfig,
  loadConfigText,
  migrateConfigText,
  NoConfig,
  readLocalConfig,
} from '@resnovas/runtime'
import { Effect } from 'effect'
import { CONVENTIONS, fixture, memory } from './fixtures.js'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { beforeEach } from 'vitest'

let dir: string
beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'smartcloud-runtime-'))
})

describe('loading config', () => {
  it.effect('prefers text, then the named path at a ref, then the candidates', () =>
    Effect.gen(function* () {
      const { service, state } = memory({ '.github/smartcloud.yaml': CONVENTIONS })
      state.files.set(fileKey('Resnovas', 'example', 'custom.yml', 'v2'), 'version: 2\n')
      const run = <A, E>(effect: Effect.Effect<A, E, GitHub>) => Effect.provideService(effect, GitHub, service)
      expect(yield* run(loadConfigText({ text: { text: 'x', source: 'given' } }))).toStrictEqual({
        text: 'x',
        source: 'given',
      })
      expect(yield* run(loadConfigText({ path: 'custom.yml', ref: 'v2' }))).toStrictEqual({
        text: 'version: 2\n',
        source: 'custom.yml',
      })
      expect((yield* run(loadConfigText({}))).source).toBe('.github/smartcloud.yaml')
      const none = yield* Effect.flip(run(loadConfigText({ path: 'missing.yml', ref: 'v3' })))
      expect(none).toBeInstanceOf(NoConfig)
      expect(none.message).toBe('no smartcloud config in Resnovas/example@v3: looked for missing.yml')
      const empty = memory()
      const nothing = yield* Effect.flip(Effect.provideService(loadConfigText({}), GitHub, empty.service))
      expect(nothing.message).toBe(
        `no smartcloud config in Resnovas/example: looked for ${CONFIG_CANDIDATES.join(', ')}`,
      )
    }),
  )

  it.effect('resolves presets through GitHub, and names a missing one', () =>
    Effect.gen(function* () {
      const { service, state } = memory({
        '.github/smartcloud.yml': 'version: 2\nextends: [Resnovas/.github/house.yml]\n',
      })
      state.files.set(fileKey('Resnovas', '.github', 'house.yml'), CONVENTIONS)
      const resolved = yield* loadConfig({}).pipe(Effect.provideService(GitHub, service))
      expect(resolved.sources).toStrictEqual(['Resnovas/.github/house.yml', '.github/smartcloud.yml'])
      const read = yield* Effect.flip(
        Effect.flatMap(ConfigSource, (source) =>
          source.read({ owner: 'Resnovas', repo: '.github', path: 'gone.yml' }),
        ).pipe(Effect.provide(ConfigSourceFromGitHub), Effect.provideService(GitHub, service)),
      )
      expect(read).toMatchObject({ _tag: 'ConfigNotFound', source: 'Resnovas/.github/gone.yml' })
    }),
  )

  it.effect('reads a local file, and says where a request reads its config from', () =>
    Effect.gen(function* () {
      const file = join(dir, 'local.yml')
      yield* Effect.promise(() => writeFile(file, CONVENTIONS))
      expect(yield* readLocalConfig(file)).toStrictEqual({ text: CONVENTIONS, source: file })
      expect(yield* configLocationFor(file)).toStrictEqual({ text: { text: CONVENTIONS, source: file } })
      expect(yield* configLocationFor(undefined)).toStrictEqual({})
    }).pipe(Effect.provide(NodeContext.layer)),
  )
})

describe('migrateConfigText', () => {
  it.effect('turns a v1 config into v2 YAML with a schema hint and warnings', () =>
    Effect.gen(function* () {
      const text = yield* Effect.promise(() => readFile(fixture('v1-smartcloud.json'), 'utf8'))
      const migrated = yield* migrateConfigText(text, 'config.json')
      expect(migrated.config.version).toBe(2)
      expect(migrated.yaml).toMatch(/^# yaml-language-server: \$schema=.*smartcloud\.schema\.json\nversion: 2\n/)
      expect(migrated.warnings.length).toBeGreaterThan(0)
      expect((yield* Effect.flip(migrateConfigText('[]', 'list.json')))._tag).toBe('ConfigDecodeError')
    }),
  )
})

describe('explainConfig', () => {
  it.effect('lists every feature, whether it is enabled, and the sections it reads', () =>
    Effect.gen(function* () {
      const { config } = yield* parseConfig(
        'version: 2\nlabels:\n  bug: { name: bug, color: d73a4a }\nroles: { maintainers: [a] }\nstale: { staleAfterDays: 30, staleLabel: stale }\n',
        'x.yml',
      )
      const explained = explainConfig({
        config,
        sources: ['b.yml', 'a.yml'],
        locked: new Set(['z', 'roles.maintainers']),
        warnings: ['w'],
      })
      expect(explained.sources).toStrictEqual(['b.yml', 'a.yml'])
      expect(explained.locked).toStrictEqual(['roles.maintainers', 'z'])
      expect(explained.warnings).toStrictEqual(['w'])
      expect(explained.features.map((feature) => [feature.name, feature.enabled])).toStrictEqual([
        ['conventions', false],
        ['commits', false],
        ['disclosure', false],
        ['reviews', false],
        ['labels', true],
        ['stale', true],
        ['settings', false],
        ['sync', false],
        ['required', false],
        ['freeze', false],
        ['branches', false],
        ['codeowners', false],
        ['lock', false],
        ['backport', false],
        ['commands', false],
      ])
      expect(explained.features[4]?.rules).toStrictEqual({ labels: { bug: { name: 'bug', color: 'd73a4a' } } })
      expect(explained.features[3]?.rules).toStrictEqual({ roles: { maintainers: ['a'] } })
      expect(explained.features[4]?.handles).toContain('pullRequest')
      const custom = explainConfig({ config, sources: [], locked: new Set(), warnings: [] }, [
        { name: 'custom', handles: ['issue'], run: () => Effect.void },
      ])
      expect(custom.features).toStrictEqual([{ name: 'custom', enabled: true, handles: ['issue'], rules: {} }])
    }),
  )
})
