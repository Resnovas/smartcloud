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
 * (CODE_OF_CONDUCT.md) and the Cooperation Commitment (COOPERATION_COMMITMENT.md).
 *
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { REPOSITORY_EVENTS, type Connect } from '@resnovas/runtime'
import type { Effect } from 'effect'
import { z } from 'zod'
import {
  checkCommitMessageTool,
  dryRunTool,
  explainConfigTool,
  explainRuleTool,
  migrateConfigTool,
  planSettingsTool,
  validateConfigTool,
  type ToolContext,
  type ToolResult,
} from './tools.js'
import { VERSION } from './version.js'

/** Runs a tool's effect with everything the host provides. */
export type RunTool = (effect: Effect.Effect<ToolResult, never, ToolContext>) => Promise<ToolResult>

const configInput = {
  config: z.string().describe('The smartcloud config, YAML or JSON.'),
  source: z.string().optional().describe('The file name, for errors and warnings.'),
}

const repository = z.string().describe('The repository, as owner/name.')
const localConfig = z
  .string()
  .optional()
  .describe(
    "A config file to use instead of the repository's own config on its default branch: " +
      "a relative path to a regular file inside the server's working directory. Anything else is refused.",
  )
const configText = z
  .string()
  .optional()
  .describe("The config itself, YAML or JSON, to use instead of the repository's own config. Give this or config, not both.")

/**
 * Builds the smartcloud MCP server and registers its tools.
 *
 * @remarks
 * Every tool only reads: `dry_run` goes through the dry-run layer, so writes
 * are recorded and listed, never made. A config file named by an assistant is
 * only read when it is a regular file inside `root`.
 *
 * @example
 * ```ts
 * import { NodeContext } from '@effect/platform-node'
 * import { gitHubConfigSource, liveConnect } from '@resnovas/runtime'
 * import { makeServer } from '@resnovas/smartcloud-mcp'
 * import { Effect, Layer } from 'effect'
 *
 * const layer = Layer.provideMerge(gitHubConfigSource(), NodeContext.layer)
 * const server = makeServer({ connect: liveConnect(), run: (effect) => Effect.runPromise(Effect.provide(effect, layer)) })
 * ```
 *
 * @param options - `connect` opens the GitHub service; `run` runs a tool's
 * effect; `root` is the only directory a config file may be read from, the
 * working directory when the server is made, if omitted.
 * @returns The server, ready to connect to a transport.
 */
export const makeServer = (options: { readonly connect: Connect; readonly run: RunTool; readonly root?: string | undefined }): McpServer => {
  const root = options.root ?? process.cwd()
  const server = new McpServer({ name: 'smartcloud', version: VERSION })
  const readOnly = { readOnlyHint: true, openWorldHint: true }

  server.registerTool(
    'validate_config',
    {
      title: 'Validate a smartcloud config',
      description:
        'Check a smartcloud config and every preset it extends, strictly: unknown keys and invalid values are errors, though a run only warns about them. Returns the sources it was built from and any migration warnings.',
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
        configText,
        features: z.array(z.string()).optional().describe('Only these features; all when omitted or empty.'),
      },
      annotations: readOnly,
    },
    (input) => options.run(dryRunTool(options.connect, input, root)),
  )
  server.registerTool(
    'plan_settings',
    {
      title: 'Plan repository settings',
      description: 'List the repository settings the config would apply, in order, without applying them.',
      inputSchema: { repository, config: localConfig, configText },
      annotations: readOnly,
    },
    (input) => options.run(planSettingsTool(options.connect, input, root)),
  )
  server.registerTool(
    'check_commit_message',
    {
      title: 'Check a commit message',
      description:
        'Check a commit message and its author for the DCO sign-off and AI attribution rules before committing. Use it before every commit an agent makes.',
      inputSchema: {
        message: z.string().describe('The full commit message, including trailers.'),
        authorName: z.string().describe('The commit author name.'),
        authorEmail: z.string().describe('The commit author email, which the Signed-off-by must match.'),
        config: z.string().optional().describe("The repository's smartcloud config, YAML or JSON; smartcloud's defaults when omitted."),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    (input) => options.run(checkCommitMessageTool(input)),
  )
  server.registerTool(
    'explain_rule',
    {
      title: 'Explain a rule',
      description: 'Explain a smartcloud rule from the id a finding reports, such as AI-02, DCO or conventions.title, and how to satisfy it.',
      inputSchema: {
        rule: z.string().describe('The rule id from the finding.'),
        config: z.string().optional().describe('The smartcloud config, for convention rules and policy links.'),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    (input) => options.run(explainRuleTool(input)),
  )
  return server
}
