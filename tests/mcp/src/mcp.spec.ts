/**
 * @file tests/mcp/src/mcp.spec.ts
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

import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { NodeContext } from '@effect/platform-node'
import { describe, expect, it } from '@effect/vitest'
import { fileKey, GitHub, type GitHubService, makeMemoryGitHub } from '@resnovas/integrations.github'
import { ConfigSourceFromGitHub, type Connect } from '@resnovas/runtime'
import {
  checkCommitMessageTool,
  ConfigRefused,
  dryRunTool,
  explainConfigTool,
  explainRuleTool,
  makeServer,
  migrateConfigTool,
  planSettingsTool,
  readConfinedConfig,
  stampedVersion,
  validateConfigTool,
  VERSION,
  type ToolContext,
  type ToolResult,
} from '@resnovas/smartcloud-mcp'
import { Effect, Layer } from 'effect'
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const fixture = (name: string) => join(import.meta.dirname, '../../config/src/fixtures', name)

const CONVENTIONS = 'version: 2\nconventions:\n  rules:\n    title:\n      preset: conventionalCommits\n'

const pull = {
  number: 7,
  title: 'Add things',
  body: '',
  user: { login: 'jane' },
  state: 'open',
  locked: false,
  labels: [],
  updated_at: '2026-09-01T00:00:00Z',
  head: { ref: 'feat/x', sha: 'abc123' },
}

// The in-memory GitHub: a repository with a config, a preset, and the pull request read a dry run makes.
const memory = () => {
  const github = makeMemoryGitHub()
  github.state.files.set(fileKey('Resnovas', 'example', '.github/smartcloud.yml'), `${CONVENTIONS}settings:\n  merging: { squash: true }\n`)
  github.state.files.set(fileKey('Resnovas', '.github', 'house.yml'), 'version: 2\nroles: { maintainers: [a] }\n')
  github.state.pulls.set(7, { commits: [], files: [], reviews: [], requestedReviewers: [], submittedReviews: [] })
  const service: GitHubService = {
    ...github.service,
    repositoryRequest: (request) =>
      request.method === 'GET' && request.path === '/pulls/7' ? Effect.succeed(pull) : github.service.repositoryRequest(request),
  }
  const connect: Connect = () => Effect.succeed(service)
  const layer = Layer.mergeAll(NodeContext.layer, ConfigSourceFromGitHub.pipe(Layer.provide(Layer.succeed(GitHub, service))))
  return { connect, layer, state: github.state }
}

// The directory the server may read config files from, in tests that read none.
const ROOT = import.meta.dirname

const textOf = (result: ToolResult) => result.content.map((part) => part.text).join('\n')

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

describe('the MCP server', () => {
  it('lists its tools and answers calls over a transport', async () => {
    const { connect, layer, state } = memory()
    const server = makeServer({ connect, run: (effect) => Effect.runPromise(Effect.provide(effect, layer)) })
    const client = new Client({ name: 'test', version: '1.0.0' })
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
    await server.connect(serverTransport)
    await client.connect(clientTransport)

    expect(client.getServerVersion()).toMatchObject({ name: 'smartcloud', version: VERSION })
    expect(VERSION).toBe('0.0.0')
    expect(stampedVersion('2.0.0')).toBe('2.0.0')
    const tools = await client.listTools()
    expect(tools.tools.map((tool) => tool.name)).toStrictEqual([
      'validate_config',
      'migrate_config',
      'explain_config',
      'dry_run',
      'plan_settings',
      'check_commit_message',
      'explain_rule',
    ])

    const call = async (name: string, args: Record<string, unknown>) => {
      const result = await client.callTool({ name, arguments: args })
      const content = Array.isArray(result.content) ? result.content : []
      return { isError: result.isError, text: content.map((part) => (typeof part.text === 'string' ? part.text : '')).join('\n') }
    }
    expect((await call('validate_config', { config: 'version: 2\n' })).text).toContain('"valid": true')
    expect((await call('migrate_config', { config: '{}', source: 'config.json' })).text).toContain('version: 2')
    expect((await call('explain_config', { config: CONVENTIONS })).text).toContain('"name": "conventions"')
    const dry = await call('dry_run', { repository: 'Resnovas/example', pr: 7 })
    expect(dry.isError).toBeFalsy()
    expect(dry.text).toContain('Event: `pull_request` (synchronize) on #7')
    expect((await call('plan_settings', { repository: 'Resnovas/example' })).text).toContain('Settings for Resnovas/example')
    // A host file outside the working directory is never read, however the path is given.
    const outside = await call('dry_run', { repository: 'Resnovas/example', pr: 7, config: '/etc/passwd' })
    expect(outside).toMatchObject({ isError: true, text: expect.stringContaining('refusing to read "/etc/passwd": it is an absolute path') })
    const escaped = await call('plan_settings', { repository: 'Resnovas/example', config: '../../../../../../../../../../etc/passwd' })
    expect(escaped).toMatchObject({ isError: true, text: expect.stringContaining('it resolves outside the working directory') })
    expect((await call('plan_settings', { repository: 'Resnovas/example', configText: 'version: 2\n' })).text).toContain('Nothing to apply')
    expect((await call('check_commit_message', { message: 'fix: x', authorName: 'Jane', authorEmail: 'jane@example.com' })).text).toContain('"passes": false')
    expect((await call('explain_rule', { rule: 'DCO' })).text).toContain('git commit -s')
    expect(state.checkRuns).toStrictEqual([])
    await client.close()
  })
})
