/**
 * @file apps/mcp/src/tools.ts
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

import type { CommandExecutor, FileSystem } from '@effect/platform'
import { resolveConfig, type ConfigSource } from '@resnovas/config'
import {
  dryRunRepository,
  dryRunText,
  explainConfig,
  migrateConfigText,
  planSettingsForRepository,
  settingsPlanText,
  type Connect,
} from '@resnovas/runtime'
import { Effect } from 'effect'

/** What a tool returns: text for the assistant, flagged when the call failed. */
export interface ToolResult {
  readonly content: Array<{ readonly type: 'text'; readonly text: string }>
  readonly isError?: boolean
  // The SDK's result type is open to extra fields.
  readonly [key: string]: unknown
}

/** Everything the tools may need from the host. */
export type ToolContext = ConfigSource | CommandExecutor.CommandExecutor | FileSystem.FileSystem

const text = (value: string) => ({ type: 'text' as const, text: value })

// Every failure is a result the assistant can read, never a protocol error.
const handle = <E extends { readonly message: string }, R>(effect: Effect.Effect<ReadonlyArray<string>, E, R>): Effect.Effect<ToolResult, never, R> =>
  effect.pipe(
    Effect.map((parts): ToolResult => ({ content: parts.map(text) })),
    Effect.catchAll((error) => Effect.succeed<ToolResult>({ content: [text(error.message)], isError: true })),
  )

const json = (value: unknown) => JSON.stringify(value, null, 2)

/** A config given as text. */
export interface ConfigInput {
  /** The config, YAML or JSON. */
  readonly config: string
  /** Its name, for errors and warnings. */
  readonly source?: string | undefined
}

/**
 * Checks a config and everything it extends.
 *
 * @param input - The config text and its name.
 * @returns The sources it was built from and every warning, as JSON.
 */
export const validateConfigTool = (input: ConfigInput) =>
  handle(
    Effect.map(resolveConfig(input.config, input.source ?? 'smartcloud.yml'), (resolved) => [
      json({ valid: true, sources: resolved.sources, warnings: resolved.warnings }),
    ]),
  )

/**
 * Converts a v1 JSON config to v2 YAML.
 *
 * @param input - The v1 config text and its name.
 * @returns The YAML, then the warnings as JSON.
 */
export const migrateConfigTool = (input: ConfigInput) =>
  handle(Effect.map(migrateConfigText(input.config, input.source ?? 'config.json'), (migrated) => [migrated.yaml, json({ warnings: migrated.warnings })]))

/**
 * Explains a config: which features it enables and the rules each one reads.
 *
 * @param input - The config text and its name.
 * @returns The explanation as JSON.
 */
export const explainConfigTool = (input: ConfigInput) =>
  handle(Effect.map(resolveConfig(input.config, input.source ?? 'smartcloud.yml'), (resolved) => [json(explainConfig(resolved))]))

/** The inputs of `dry_run`, as the CLI's `dry-run` takes them. */
export interface DryRunInput {
  readonly repository: string
  readonly pr?: number | undefined
  readonly issue?: number | undefined
  readonly event?: string | undefined
  /** A local config file; the repository's own config when omitted. */
  readonly config?: string | undefined
  readonly features?: ReadonlyArray<string> | undefined
}

/**
 * Dry-runs every feature against a repository. Nothing is written.
 *
 * @param connect - Opens the GitHub service.
 * @param input - The repository, what to simulate, the config and the features.
 * @returns The job summary and every write that would have been made.
 */
export const dryRunTool = (connect: Connect, input: DryRunInput) =>
  handle(Effect.map(dryRunRepository(connect, input), (outcome) => [dryRunText(outcome)]))

/**
 * Plans a repository's settings without applying them.
 *
 * @param connect - Opens the GitHub service.
 * @param input - The repository, and a local config file to use instead of its own.
 * @returns The planned steps.
 */
export const planSettingsTool = (connect: Connect, input: { readonly repository: string; readonly config?: string | undefined }) =>
  handle(Effect.map(planSettingsForRepository(connect, input), (plan) => [settingsPlanText(plan)]))
