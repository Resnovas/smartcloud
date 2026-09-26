/**
 * @file tests/mcp/src/tools.spec.ts
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
import {
  checkCommitMessageTool,
  ConfigRefused,
  dryRunTool,
  explainConfigTool,
  explainRuleTool,
  migrateConfigTool,
  planSettingsTool,
  readConfinedConfig,
  validateConfigTool,
  type ToolContext,
  type ToolResult,
} from '@resnovas/smartcloud-mcp'
import { Effect } from 'effect'
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { CONVENTIONS, fixture, memory, ROOT, textOf } from './fixtures.js'

describe('tool handlers', () => {
  const { connect, layer, state } = memory()

  it.effect('validates a config and its presets, and reports a broken one as an error result', () =>
    Effect.gen(function* () {
      const valid = yield* validateConfigTool({ config: 'version: 2\nextends: [Resnovas/.github/house.yml]\n' })
      expect(valid.isError).toBeUndefined()
      expect(JSON.parse(textOf(valid))).toStrictEqual({ valid: true, sources: ['Resnovas/.github/house.yml', 'smartcloud.yml'], warnings: [] })
      const broken = yield* validateConfigTool({ config: 'version: 2\nextends: [Resnovas/.github/missing.yml]\n', source: 'mine.yml' })
      expect(broken.isError).toBe(true)
      expect(textOf(broken)).toContain('Resnovas/.github/missing.yml')
    }).pipe(Effect.provide(layer)),
  )

  it.effect('migrates a v1 config to YAML with its warnings', () =>
    Effect.gen(function* () {
      const v1 = yield* Effect.promise(() => readFile(fixture('v1-smartcloud.json'), 'utf8'))
      const migrated = yield* migrateConfigTool({ config: v1 })
      expect(migrated.content[0]?.text).toMatch(/^# yaml-language-server: .*\nversion: 2\n/)
      expect(JSON.parse(migrated.content[1]?.text ?? '').warnings[0]).toMatch(/^config\.json: /)
    }),
  )

  it.effect('explains which features a config enables', () =>
    Effect.gen(function* () {
      const explained = JSON.parse(textOf(yield* explainConfigTool({ config: CONVENTIONS })))
      expect(explained.features[0]).toMatchObject({ name: 'conventions', enabled: true })
      expect(explained.features[1]).toMatchObject({ name: 'commits', enabled: false, rules: {} })
    }).pipe(Effect.provide(layer)),
  )

  it.effect('dry-runs a pull request without writing, and plans settings without applying them', () =>
    Effect.gen(function* () {
      const dry = yield* dryRunTool(connect, { repository: 'Resnovas/example', pr: 7, features: ['conventions'] }, ROOT)
      expect(textOf(dry)).toContain('**Dry run:** these writes were recorded, not made:\n- createCheckRun')
      expect(state.checkRuns).toStrictEqual([])
      const plan = yield* planSettingsTool(connect, { repository: 'Resnovas/example' }, ROOT)
      expect(textOf(plan)).toContain('PATCH /repos/{owner}/{repo} {"allow_squash_merge":true}')
      expect(state.requests).toStrictEqual([])
      const invalid = yield* dryRunTool(connect, { repository: 'Resnovas/example' }, ROOT)
      expect(invalid.isError).toBe(true)
      expect(textOf(invalid)).toMatch(/^nothing to simulate/)
    }).pipe(Effect.provide(layer)),
  )
})

describe('config files named by an assistant', () => {
  // A working directory holding a config, a subdirectory, and symlinks in and out; a secret sits beside it.
  const workspace = Effect.acquireRelease(
    Effect.promise(async () => {
      const base = await mkdtemp(join(tmpdir(), 'smartcloud-mcp-'))
      const root = join(base, 'work')
      await mkdir(join(root, 'nested'), { recursive: true })
      await writeFile(join(root, 'smartcloud.yml'), CONVENTIONS)
      await writeFile(join(base, 'secret.yml'), 'version: 2\n')
      await symlink(join(base, 'secret.yml'), join(root, 'escape.yml'))
      await symlink(join(root, 'smartcloud.yml'), join(root, 'inside.yml'))
      return { base, root }
    }),
    ({ base }) => Effect.promise(() => rm(base, { recursive: true, force: true })),
  )

  const refusal = (root: string, file: string) =>
    Effect.flip(readConfinedConfig(root, file)).pipe(Effect.map((error) => (error instanceof ConfigRefused ? error.message : 'not refused')))

  it.scoped('reads only a relative path to a regular file inside the working directory', () =>
    Effect.gen(function* () {
      const { base, root } = yield* workspace
      expect(yield* readConfinedConfig(root, 'smartcloud.yml')).toStrictEqual({ text: CONVENTIONS, source: 'smartcloud.yml' })
      expect((yield* readConfinedConfig(root, 'inside.yml')).text).toBe(CONVENTIONS)
      expect(yield* refusal(root, join(base, 'secret.yml'))).toMatch(/^refusing to read ".*secret\.yml": it is an absolute path\. /)
      expect(yield* refusal(root, '../secret.yml')).toContain('it resolves outside the working directory')
      expect(yield* refusal(root, 'escape.yml')).toContain('it resolves outside the working directory')
      expect(yield* refusal(root, '.')).toContain('it resolves outside the working directory')
      expect(yield* refusal(root, 'nested')).toContain('it is not a regular file')
      expect(yield* refusal(root, 'missing.yml')).toContain('it does not exist or cannot be read')
      expect(yield* refusal(root, 'missing.yml')).toContain('pass the config itself as configText instead')
    }).pipe(Effect.provide(NodeContext.layer)),
  )

  it.scoped('refuses such a path in dry_run and plan_settings, and takes the config as text instead', () =>
    Effect.gen(function* () {
      const { base, root } = yield* workspace
      const { connect, layer } = memory()
      const run = (effect: Effect.Effect<ToolResult, never, ToolContext>) =>
        Effect.map(Effect.provide(effect, layer), (result) => ({ error: result.isError === true, text: textOf(result) }))
      const repository = 'Resnovas/example'
      const absolute = yield* run(dryRunTool(connect, { repository, pr: 7, config: join(base, 'secret.yml') }, root))
      expect(absolute).toMatchObject({ error: true, text: expect.stringContaining('it is an absolute path') })
      const escaped = yield* run(planSettingsTool(connect, { repository, config: 'escape.yml' }, root))
      expect(escaped).toMatchObject({ error: true, text: expect.stringContaining('it resolves outside the working directory') })
      const inside = yield* run(dryRunTool(connect, { repository, pr: 7, config: 'smartcloud.yml' }, root))
      expect(inside).toMatchObject({ error: false, text: expect.stringContaining('on #7') })
      const inline = yield* run(planSettingsTool(connect, { repository, configText: 'version: 2\nsettings:\n  merging: { rebase: false }\n' }, root))
      expect(inline.text).toContain('{"allow_rebase_merge":false}')
      const both = yield* run(dryRunTool(connect, { repository, pr: 7, config: 'smartcloud.yml', configText: CONVENTIONS }, root))
      expect(both).toMatchObject({ error: true, text: expect.stringMatching(/^give config or configText, not both\. /) })
    }),
  )

  it.effect('runs every feature when the feature list is empty', () =>
    Effect.gen(function* () {
      const { connect, layer } = memory()
      const dry = (features: ReadonlyArray<string> | undefined) =>
        Effect.map(Effect.provide(dryRunTool(connect, { repository: 'Resnovas/example', pr: 7, configText: CONVENTIONS, features }, ROOT), layer), textOf)
      const all = yield* dry([])
      expect(all).toBe(yield* dry(undefined))
      expect(all).not.toBe(yield* dry(['conventions']))
    }),
  )
})

describe('agent self-checks', () => {
  const author = { authorName: 'Jane Doe', authorEmail: 'jane@example.com' }

  it.effect('checks a commit message against the defaults or the given config', () =>
    Effect.gen(function* () {
      const unsigned = JSON.parse(textOf(yield* checkCommitMessageTool({ ...author, message: 'fix: x' })))
      expect(unsigned.passes).toBe(false)
      expect(unsigned.findings[0]).toMatchObject({ rule: 'DCO', level: 'error' })
      const signed = yield* checkCommitMessageTool({ ...author, message: 'fix: x\n\nSigned-off-by: Jane Doe <jane@example.com>' })
      expect(JSON.parse(textOf(signed))).toStrictEqual({ passes: true, findings: [] })
      const off = yield* checkCommitMessageTool({ ...author, message: 'fix: x', config: 'version: 2\ncommits: { dco: false }\n' })
      expect(JSON.parse(textOf(off)).passes).toBe(true)
      const broken = yield* checkCommitMessageTool({ ...author, message: 'x', config: 'version: [2' })
      expect(broken.isError).toBe(true)
    }).pipe(Effect.provide(memory().layer)),
  )

  it.effect('explains a rule, and reports an unknown one as an error result', () =>
    Effect.gen(function* () {
      expect(JSON.parse(textOf(yield* explainRuleTool({ rule: 'AI-02' }))).link).toMatch(/AI_POLICY\.md#ai-02$/)
      expect(JSON.parse(textOf(yield* explainRuleTool({ rule: 'conventions.title', config: CONVENTIONS }))).rule).toBe('conventions.title')
      const unknown = yield* explainRuleTool({ rule: 'nope' })
      expect(unknown.isError).toBe(true)
    }).pipe(Effect.provide(memory().layer)),
  )
})
