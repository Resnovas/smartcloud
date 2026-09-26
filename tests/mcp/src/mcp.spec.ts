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
  dryRunTool,
  explainConfigTool,
  makeServer,
  migrateConfigTool,
  planSettingsTool,
  validateConfigTool,
  VERSION,
  type ToolResult,
} from '@resnovas/smartcloud-mcp'
import { Effect, Layer } from 'effect'
import { readFile } from 'node:fs/promises'
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
      const dry = yield* dryRunTool(connect, { repository: 'Resnovas/example', pr: 7, features: ['conventions'] })
      expect(textOf(dry)).toContain('**Dry run:** these writes were recorded, not made:\n- createCheckRun')
      expect(state.checkRuns).toStrictEqual([])
      const plan = yield* planSettingsTool(connect, { repository: 'Resnovas/example' })
      expect(textOf(plan)).toContain('PATCH /repos/{owner}/{repo} {"allow_squash_merge":true}')
      expect(state.requests).toStrictEqual([])
      const invalid = yield* dryRunTool(connect, { repository: 'Resnovas/example' })
      expect(invalid.isError).toBe(true)
      expect(textOf(invalid)).toMatch(/^nothing to simulate/)
    }).pipe(Effect.provide(layer)),
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
    const tools = await client.listTools()
    expect(tools.tools.map((tool) => tool.name)).toStrictEqual(['validate_config', 'migrate_config', 'explain_config', 'dry_run', 'plan_settings'])

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
    expect(state.checkRuns).toStrictEqual([])
    await client.close()
  })
})
