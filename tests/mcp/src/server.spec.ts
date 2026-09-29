/**
 * @file tests/mcp/src/server.spec.ts
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

import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { describe, expect, it } from '@effect/vitest'
import { makeServer, stampedVersion, VERSION } from '@resnovas/smartcloud-mcp'
import { Effect, Layer, Logger } from 'effect'
import { CONVENTIONS, memory } from './fixtures.js'

describe('the MCP server', () => {
  it('lists its tools and answers calls over a transport', async () => {
    const { connect, layer, state } = memory()
    // The engine logs each run at INFO; the test keeps Vitest's output to results.
    const quiet = Layer.merge(layer, Logger.remove(Logger.defaultLogger))
    const server = makeServer({ connect, run: (effect) => Effect.runPromise(Effect.provide(effect, quiet)) })
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
      return {
        isError: result.isError,
        text: content.map((part) => (typeof part.text === 'string' ? part.text : '')).join('\n'),
      }
    }
    expect((await call('validate_config', { config: 'version: 2\n' })).text).toContain('"valid": true')
    expect((await call('migrate_config', { config: '{}', source: 'config.json' })).text).toContain('version: 2')
    expect((await call('explain_config', { config: CONVENTIONS })).text).toContain('"name": "conventions"')
    const dry = await call('dry_run', { repository: 'Resnovas/example', pr: 7 })
    expect(dry.isError).toBeFalsy()
    expect(dry.text).toContain('Event: `pull_request` (synchronize) on #7')
    expect((await call('plan_settings', { repository: 'Resnovas/example' })).text).toContain(
      'Settings for Resnovas/example',
    )
    // A host file outside the working directory is never read, however the path is given.
    const outside = await call('dry_run', { repository: 'Resnovas/example', pr: 7, config: '/etc/passwd' })
    expect(outside).toMatchObject({
      isError: true,
      text: expect.stringContaining('refusing to read "/etc/passwd": it is an absolute path'),
    })
    const escaped = await call('plan_settings', {
      repository: 'Resnovas/example',
      config: '../../../../../../../../../../etc/passwd',
    })
    expect(escaped).toMatchObject({
      isError: true,
      text: expect.stringContaining('it resolves outside the working directory'),
    })
    expect(
      (await call('plan_settings', { repository: 'Resnovas/example', configText: 'version: 2\n' })).text,
    ).toContain('Nothing to apply')
    expect(
      (await call('check_commit_message', { message: 'fix: x', authorName: 'Jane', authorEmail: 'jane@example.com' }))
        .text,
    ).toContain('"passes": false')
    expect((await call('explain_rule', { rule: 'DCO' })).text).toContain('git commit -s')
    expect(state.checkRuns).toStrictEqual([])
    await client.close()
  })
})
