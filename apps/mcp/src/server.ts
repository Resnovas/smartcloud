/**
 * @file apps/mcp/src/server.ts
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

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { REPOSITORY_EVENTS, type Connect } from '@resnovas/runtime'
import type { Effect } from 'effect'
import { z } from 'zod'
import { dryRunTool, explainConfigTool, migrateConfigTool, planSettingsTool, validateConfigTool, type ToolContext, type ToolResult } from './tools.js'
import { VERSION } from './version.js'

/** Runs a tool's effect with everything the host provides. */
export type RunTool = (effect: Effect.Effect<ToolResult, never, ToolContext>) => Promise<ToolResult>

const configInput = {
  config: z.string().describe('The smartcloud config, YAML or JSON.'),
  source: z.string().optional().describe('The file name, for errors and warnings.'),
}

const repository = z.string().describe('The repository, as owner/name.')
const localConfig = z.string().optional().describe("A local config file to use instead of the repository's own config on its default branch.")

/**
 * Builds the smartcloud MCP server and registers its tools.
 *
 * @remarks
 * Every tool only reads: `dry_run` goes through the dry-run layer, so writes
 * are recorded and listed, never made.
 *
 * @param options - `connect` opens the GitHub service; `run` runs a tool's effect.
 * @returns The server, ready to connect to a transport.
 */
export const makeServer = (options: { readonly connect: Connect; readonly run: RunTool }): McpServer => {
  const server = new McpServer({ name: 'smartcloud', version: VERSION })
  const readOnly = { readOnlyHint: true, openWorldHint: true }

  server.registerTool(
    'validate_config',
    {
      title: 'Validate a smartcloud config',
      description: 'Check a smartcloud config and every preset it extends. Returns the sources it was built from and any migration warnings.',
      inputSchema: configInput,
      annotations: readOnly,
    },
    (input) => options.run(validateConfigTool(input)),
  )
  server.registerTool(
    'migrate_config',
    {
      title: 'Migrate a v1 config',
      description: 'Convert a v1 .github/config.json to v2 YAML, with a warning for everything not carried over.',
      inputSchema: configInput,
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    (input) => options.run(migrateConfigTool(input)),
  )
  server.registerTool(
    'explain_config',
    {
      title: 'Explain a smartcloud config',
      description: 'Resolve a config and list every feature, whether the config enables it, the events it acts on and the rules it reads.',
      inputSchema: configInput,
      annotations: readOnly,
    },
    (input) => options.run(explainConfigTool(input)),
  )
  server.registerTool(
    'dry_run',
    {
      title: 'Dry-run smartcloud',
      description:
        'Run every smartcloud feature against a pull request, an issue or a repository event, recording writes instead of making them. Give exactly one of pr, issue or event.',
      inputSchema: {
        repository,
        pr: z.number().int().positive().optional().describe('Simulate this pull request.'),
        issue: z.number().int().positive().optional().describe('Simulate this issue.'),
        event: z.enum(REPOSITORY_EVENTS).optional().describe('Simulate this repository event.'),
        config: localConfig,
        features: z.array(z.string()).optional().describe('Only these features; all when omitted.'),
      },
      annotations: readOnly,
    },
    (input) => options.run(dryRunTool(options.connect, input)),
  )
  server.registerTool(
    'plan_settings',
    {
      title: 'Plan repository settings',
      description: 'List the repository settings the config would apply, in order, without applying them.',
      inputSchema: { repository, config: localConfig },
      annotations: readOnly,
    },
    (input) => options.run(planSettingsTool(options.connect, input)),
  )
  return server
}
