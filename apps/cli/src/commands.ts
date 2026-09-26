/**
 * @file apps/cli/src/commands.ts
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

import { CommandExecutor, FileSystem, Path } from '@effect/platform'
import { ConfigNotFound, ConfigSource, formatExtendsRef, parseConfig, resolveConfig, SmartcloudConfig, type ExtendsRef, type ResolvedConfig } from '@resnovas/config'
import { GitHub, type GitHubError, makeLiveGitHub, type LiveOptions } from '@resnovas/integrations.github'
import { Console, Data, Effect, Layer, Schedule, Schema } from 'effect'
import { stringify } from 'yaml'
import { type MissingToken, resolveToken } from './token.js'

/** Where the CLI looks for a config when none is given, in order. */
export const CONFIG_CANDIDATES = ['.github/smartcloud.yml', '.github/smartcloud.yaml', '.github/config.json'] as const

/** No config file was found where smartcloud looks for one. */
export class NoConfig extends Data.TaggedError('NoConfig')<{ readonly directory: string }> {
  override get message() {
    return `no smartcloud config in ${this.directory}: expected one of ${CONFIG_CANDIDATES.join(', ')}`
  }
}

/**
 * Finds the config in a repository checkout.
 *
 * @param directory - The repository root.
 * @returns The path of the first config that exists.
 */
export const locateConfig = (directory: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const path = yield* Path.Path
    for (const candidate of CONFIG_CANDIDATES) {
      const full = path.join(directory, candidate)
      if (yield* fs.exists(full)) return full
    }
    return yield* new NoConfig({ directory })
  })

/**
 * Validates a config and its whole `extends` chain, printing where it came
 * from and every migration warning.
 *
 * @param file - The config file.
 * @returns The resolved config.
 */
export const validate = (file: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const resolved: ResolvedConfig = yield* resolveConfig(yield* fs.readFileString(file), file)
    yield* Console.log(`${file} is a valid smartcloud config.`)
    if (resolved.sources.length > 1) yield* Console.log(`Built from: ${resolved.sources.join(', ')}`)
    for (const warning of resolved.warnings) yield* Console.log(`warning: ${warning}`)
    return resolved
  })

// The schema hint lets editors complete and check the file.
const SCHEMA_HINT = '# yaml-language-server: $schema=https://raw.githubusercontent.com/Resnovas/smartcloud/main/schema/smartcloud.schema.json'

/**
 * Converts a v1 `.github/config.json` to v2 YAML, printing a warning for
 * everything the migration does not carry over.
 *
 * @remarks
 * Warnings go to stderr, so stdout holds only the YAML and can be
 * redirected straight into a config file.
 *
 * @param input - The v1 JSON file. A v2 file is rewritten unchanged.
 * @param output - Where to write the YAML; printed to stdout when omitted.
 * @returns The migrated config.
 */
export const migrate = (input: string, output: string | undefined) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    // parseConfig migrates anything that is not v2 and proves the result decodes.
    const { config, warnings } = yield* parseConfig(yield* fs.readFileString(input), input)
    const yaml = `${SCHEMA_HINT}\n${stringify(Schema.encodeSync(SmartcloudConfig)(config))}`
    if (output === undefined) yield* Console.log(yaml)
    else {
      yield* fs.writeFileString(output, yaml)
      yield* Console.log(`Wrote ${output}.`)
    }
    for (const warning of warnings) yield* Console.error(`warning: ${warning}`)
    return config
  })

const notFound = (ref: ExtendsRef) => new ConfigNotFound({ source: formatExtendsRef(ref) })

/**
 * A preset that could not be read for a reason other than not existing, such
 * as a missing token or a GitHub outage. It is still a `ConfigNotFound` to
 * the config loader, but its message keeps the reason, so the user is told
 * to sign in rather than that the preset is missing.
 */
class PresetUnreadable extends ConfigNotFound {
  readonly reason: string

  constructor(ref: ExtendsRef, reason: string) {
    super({ source: formatExtendsRef(ref) })
    this.reason = reason
  }

  override get message() {
    return `${this.source} could not be read: ${this.reason}`
  }
}

// Only GitHub saying the file is not there means the preset is missing.
const unreadable = (ref: ExtendsRef) => (error: MissingToken | GitHubError) =>
  error._tag === 'NotFound' ? notFound(ref) : new PresetUnreadable(ref, error.message)

/**
 * Reads presets named in `extends` from GitHub. The token is resolved only
 * when a config actually extends something, so validating a config without
 * presets works offline.
 *
 * @param options - Set `fetch` to replace the global `fetch`, for tests.
 * @returns The config source.
 */
export const gitHubConfigSource = (options: Pick<LiveOptions, 'fetch'> = {}) =>
  Layer.effect(
    ConfigSource,
    Effect.gen(function* () {
      const executor = yield* CommandExecutor.CommandExecutor
      return {
        read: (ref) =>
          Effect.gen(function* () {
            const token = yield* resolveToken
            const coordinates = { owner: ref.owner, repo: ref.repo }
            const github = yield* makeLiveGitHub({ ...options, token, coordinates, retry: Schedule.stop })
            return yield* github.getFile(ref)
          }).pipe(Effect.provideService(CommandExecutor.CommandExecutor, executor), Effect.mapError(unreadable(ref))),
      }
    }),
  )

/** Reads presets through whichever GitHub service is provided, for tests and the action. */
export const ConfigSourceFromGitHub = Layer.effect(
  ConfigSource,
  Effect.map(GitHub, (github) => ({
    read: (ref) =>
      github.getFile(ref).pipe(
        Effect.mapError(() => notFound(ref)),
      ),
  })),
)
