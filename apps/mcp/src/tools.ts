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

import { FileSystem, Path, type CommandExecutor } from '@effect/platform'
import { resolveConfig, type ConfigSource, type SmartcloudConfig } from '@resnovas/config'
import { GitHub } from '@resnovas/integrations.github'
import {
  checkCommitMessage,
  dryRun,
  explainRule,
  dryRunText,
  explainConfig,
  loadConfig,
  migrateConfigText,
  parseRepository,
  planRepositorySettings,
  settingsPlanText,
  triggerOf,
  type ConfigLocation,
  type ConfigText,
  type Connect,
} from '@resnovas/runtime'
import { Data, Effect } from 'effect'

/** What a tool returns: text for the assistant, flagged when the call failed. */
export interface ToolResult {
  readonly content: Array<{ readonly type: 'text'; readonly text: string }>
  readonly isError?: boolean
  // The SDK's result type is open to extra fields.
  readonly [key: string]: unknown
}

/** Everything the tools may need from the host. */
export type ToolContext = ConfigSource | CommandExecutor.CommandExecutor | FileSystem.FileSystem | Path.Path

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

const PASS_TEXT = 'pass the config itself as configText instead.'

/** The server will not read the config it was asked to. */
export class ConfigRefused extends Data.TaggedError('ConfigRefused')<{ readonly reason: string }> {
  override get message() {
    return `${this.reason}. The MCP server only reads a config file given as a relative path to a regular file inside its working directory; ${PASS_TEXT}`
  }
}

/**
 * Reads a config file named by an assistant, confined to the server's
 * working directory.
 *
 * @remarks
 * An assistant may be steered by what it reads, and clients may approve
 * read-only tools without asking, so the path is never trusted: it must be
 * relative, resolve (symlinks included) inside `root`, and be a regular file.
 *
 * @param root - The directory the server may read from, its working directory.
 * @param file - The path the assistant gave.
 * @returns The text, named by the path given, or {@link ConfigRefused}.
 */
export const readConfinedConfig = (root: string, file: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const path = yield* Path.Path
    const refuse = (why: string) => new ConfigRefused({ reason: `refusing to read "${file}": ${why}` })
    const unreadable = () => refuse('it does not exist or cannot be read')
    if (path.isAbsolute(file)) return yield* refuse('it is an absolute path')
    const realRoot = yield* Effect.mapError(fs.realPath(root), unreadable)
    const real = yield* Effect.mapError(fs.realPath(path.resolve(realRoot, file)), unreadable)
    const relative = path.relative(realRoot, real)
    if (relative === '' || relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative))
      return yield* refuse('it resolves outside the working directory')
    const info = yield* Effect.mapError(fs.stat(real), unreadable)
    if (info.type !== 'File') return yield* refuse('it is not a regular file')
    const text = yield* Effect.mapError(fs.readFileString(real), unreadable)
    const config: ConfigText = { text, source: file }
    return config
  })

/** Where a repository tool takes its config from. */
export interface RepositoryConfigInput {
  /** A config file, relative to the server's working directory; the repository's own config when omitted. */
  readonly config?: string | undefined
  /** The config itself, YAML or JSON, instead of a file. */
  readonly configText?: string | undefined
}

// Text given directly, a confined local file, or the repository's own config.
const configLocation = (root: string, input: RepositoryConfigInput) => {
  if (input.configText !== undefined && input.config !== undefined)
    return Effect.fail(new ConfigRefused({ reason: 'give config or configText, not both' }))
  if (input.configText !== undefined) return Effect.succeed<ConfigLocation>({ text: { text: input.configText, source: 'smartcloud.yml' } })
  if (input.config !== undefined) return Effect.map(readConfinedConfig(root, input.config), (text): ConfigLocation => ({ text }))
  return Effect.succeed<ConfigLocation>({})
}

/** The inputs of `dry_run`, as the CLI's `dry-run` takes them. */
export interface DryRunInput extends RepositoryConfigInput {
  readonly repository: string
  readonly pr?: number | undefined
  readonly issue?: number | undefined
  readonly event?: string | undefined
  /** Only these features; every feature when omitted or empty. */
  readonly features?: ReadonlyArray<string> | undefined
}

/**
 * Dry-runs every feature against a repository. Nothing is written.
 *
 * @param connect - Opens the GitHub service.
 * @param input - The repository, what to simulate, the config and the features.
 * @param root - The only directory a config file may be read from.
 * @returns The job summary and every write that would have been made.
 */
export const dryRunTool = (connect: Connect, input: DryRunInput, root: string) =>
  handle(
    Effect.gen(function* () {
      const coordinates = yield* parseRepository(input.repository)
      const trigger = yield* triggerOf(input)
      const config = yield* configLocation(root, input)
      const service = yield* connect(coordinates)
      // An empty list means no filter, as the action reads it.
      const features = input.features === undefined || input.features.length === 0 ? undefined : input.features
      const outcome = yield* dryRun({ trigger, config, features }).pipe(Effect.provideService(GitHub, service))
      return [dryRunText(outcome)]
    }),
  )

/** The inputs of `plan_settings`. */
export interface PlanSettingsInput extends RepositoryConfigInput {
  readonly repository: string
}

/**
 * Plans a repository's settings without applying them.
 *
 * @param connect - Opens the GitHub service.
 * @param input - The repository, and the config to use instead of its own.
 * @param root - The only directory a config file may be read from.
 * @returns The planned steps.
 */
export const planSettingsTool = (connect: Connect, input: PlanSettingsInput, root: string) =>
  handle(
    Effect.gen(function* () {
      const coordinates = yield* parseRepository(input.repository)
      const location = yield* configLocation(root, input)
      const service = yield* connect(coordinates)
      const plan = yield* Effect.flatMap(loadConfig(location), (resolved) => planRepositorySettings(resolved.config)).pipe(
        Effect.provideService(GitHub, service),
      )
      return [settingsPlanText(plan)]
    }),
  )

// A tool given no config checks against smartcloud's defaults.
const configOrDefault = (config: string | undefined, source: string) =>
  config === undefined
    ? Effect.succeed<SmartcloudConfig>({ version: 2 })
    : Effect.map(resolveConfig(config, source), (resolved) => resolved.config)

/** The inputs of `check_commit_message`. */
export interface CommitMessageInput {
  readonly message: string
  readonly authorName: string
  readonly authorEmail: string
  /** The repository's config, whose `commits` section applies; the defaults when omitted. */
  readonly config?: string | undefined
}

/**
 * Checks a commit message for DCO and AI attribution before committing.
 *
 * @param input - The message, its author, and optionally the config.
 * @returns Whether it passes and every finding, as JSON.
 */
export const checkCommitMessageTool = (input: CommitMessageInput) =>
  handle(
    Effect.map(configOrDefault(input.config, 'smartcloud.yml'), (config) => {
      const findings = checkCommitMessage(input, config)
      return [json({ passes: findings.length === 0, findings })]
    }),
  )

/**
 * Explains a rule from the id a finding reports, and how to satisfy it.
 *
 * @param input - The rule id, and the config for conventions and links.
 * @returns The explanation as JSON.
 */
export const explainRuleTool = (input: { readonly rule: string; readonly config?: string | undefined }) =>
  handle(Effect.map(Effect.flatMap(configOrDefault(input.config, 'smartcloud.yml'), (config) => explainRule(input.rule, config)), (explained) => [json(explained)]))
