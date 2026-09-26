/**
 * @file packages/runtime/src/github.ts
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

import { Command, CommandExecutor } from '@effect/platform'
import { ConfigNotFound, ConfigSource, formatExtendsRef, type ExtendsRef } from '@resnovas/config'
import {
  makeLiveGitHub,
  type GitHubError,
  type GitHubService,
  type LiveOptions,
  type RepositoryCoordinates,
} from '@resnovas/integrations.github'
import { bindRepository, protect } from '@resnovas/integrations.posthog'
import { Config, Data, Effect, Layer, Redacted, Schedule } from 'effect'

/**
 * No GitHub token could be found.
 *
 * @example
 * ```ts import.meta.vitest name="MissingToken"
 * import { MissingToken } from '@resnovas/runtime'
 *
 * new MissingToken().message.includes('GITHUB_TOKEN') // => true
 * ```
 */
export class MissingToken extends Data.TaggedError('MissingToken')<Record<never, never>> {
  override get message() {
    return 'no GitHub token: set GITHUB_TOKEN, or sign in with `gh auth login`'
  }
}

/**
 * A repository was not given as `owner/name`.
 *
 * @example
 * ```ts import.meta.vitest name="InvalidRepository"
 * import { InvalidRepository } from '@resnovas/runtime'
 *
 * new InvalidRepository({ repository: 'x' }).message // => 'the repository must be owner/name, got "x"'
 * ```
 */
export class InvalidRepository extends Data.TaggedError('InvalidRepository')<{ readonly repository: string }> {
  override get message() {
    return `the repository must be owner/name, got "${this.repository}"`
  }
}

/**
 * The GitHub token for local runs: `GITHUB_TOKEN` if set and not blank, otherwise the
 * token of the signed-in GitHub CLI.
 *
 * @remarks
 * The token stays redacted from the moment it is read, so it can never be
 * logged. It is only resolved when something needs GitHub.
 *
 * @example
 * ```ts
 * import { resolveToken } from '@resnovas/runtime'
 * import { Effect, Redacted } from 'effect'
 *
 * // Needs a CommandExecutor for the `gh auth token` fallback.
 * const header = resolveToken.pipe(Effect.map((token) => `Bearer ${Redacted.value(token)}`))
 * ```
 *
 * @returns The redacted token.
 */
export const resolveToken = Config.redacted('GITHUB_TOKEN').pipe(
  // A GITHUB_TOKEN that is set but blank is no token: fall back to the GitHub CLI.
  Config.validate({ message: 'GITHUB_TOKEN is empty', validation: (token) => Redacted.value(token).trim() !== '' }),
  Effect.orElse(() =>
    Command.string(Command.make('gh', 'auth', 'token')).pipe(
      Effect.map((output) => output.trim()),
      Effect.filterOrFail((token) => token !== '', () => new MissingToken()),
      Effect.map(Redacted.make),
    ),
  ),
  Effect.catchAll(() => Effect.fail(new MissingToken())),
)

// Two non-empty parts without whitespace; no nested quantifiers, so linear time.
const REPOSITORY = /^[^/\s]+\/[^/\s]+$/

/**
 * Parses `owner/name`.
 *
 * @example
 * ```ts import.meta.vitest name="parseRepository"
 * import { parseRepository } from '@resnovas/runtime'
 * import { Effect } from 'effect'
 *
 * Effect.runSync(parseRepository('Resnovas/smartcloud')).repo // => 'smartcloud'
 * Effect.runSync(Effect.flip(parseRepository('a/b/c')))._tag // => 'InvalidRepository'
 * ```
 *
 * @param repository - The repository as given.
 * @returns Its coordinates.
 */
export const parseRepository = (repository: string): Effect.Effect<RepositoryCoordinates, InvalidRepository> => {
  const [owner = '', repo = ''] = repository.split('/')
  return REPOSITORY.test(repository) ? Effect.succeed({ owner, repo }) : Effect.fail(new InvalidRepository({ repository }))
}

/**
 * Parses the repository an invocation is about, and names it to telemetry:
 * the text as given is protected before it is parsed, so even an invalid
 * name never reaches error tracking, and the invocation's events and logs
 * then carry the repository's hashed identity.
 *
 * @example
 * ```ts import.meta.vitest name="targetRepository"
 * import { targetRepository } from '@resnovas/runtime'
 * import { Effect } from 'effect'
 *
 * Effect.runSync(targetRepository('Resnovas/smartcloud')).owner // => 'Resnovas'
 * ```
 *
 * @param repository - The repository as given.
 * @returns Its coordinates.
 */
export const targetRepository = (repository: string): Effect.Effect<RepositoryCoordinates, InvalidRepository> =>
  Effect.zipRight(protect(repository), Effect.tap(parseRepository(repository), bindRepository))

/** Opens the GitHub service for a repository. Tests pass an in-memory one. */
export type Connect = (
  coordinates: RepositoryCoordinates,
) => Effect.Effect<GitHubService, MissingToken, CommandExecutor.CommandExecutor>

/**
 * Connects to the real GitHub API with the token from {@link resolveToken}.
 *
 * @example
 * ```ts
 * import { liveConnect } from '@resnovas/runtime'
 *
 * const github = liveConnect()({ owner: 'Resnovas', repo: 'smartcloud' })
 * ```
 *
 * @param options - Set `fetch` to replace the global `fetch`, for tests.
 * @returns The connector.
 */
export const liveConnect =
  (options: Pick<LiveOptions, 'fetch'> = {}): Connect =>
  (coordinates) =>
    Effect.flatMap(resolveToken, (token) => makeLiveGitHub({ ...options, token, coordinates }))

/**
 * A preset that could not be read for a reason other than not existing, such
 * as a missing token or a GitHub outage.
 *
 * @remarks
 * It is still a `ConfigNotFound` to the config loader, but its message keeps
 * the reason, so the user is told to sign in or retry rather than that the
 * preset is missing.
 *
 * @example
 * ```ts import.meta.vitest name="PresetUnreadable"
 * import { PresetUnreadable } from '@resnovas/runtime'
 *
 * new PresetUnreadable({ owner: 'Resnovas', repo: '.github', path: 'a.yml' }, 'down').message // => 'the extends preset Resnovas/.github/a.yml could not be read: down'
 * ```
 */
export class PresetUnreadable extends ConfigNotFound {
  /** Why the preset could not be read. */
  readonly reason: string

  constructor(ref: ExtendsRef, reason: string) {
    super({ source: formatExtendsRef(ref) })
    this.reason = reason
  }

  override get message() {
    return `the extends preset ${this.source} could not be read: ${this.reason}`
  }
}

/**
 * The error for a preset read that failed: only GitHub saying the file is
 * not there means the preset is missing.
 *
 * @example
 * ```ts import.meta.vitest name="presetError"
 * import { NotFound, Unavailable } from '@resnovas/integrations.github'
 * import { presetError, PresetUnreadable } from '@resnovas/runtime'
 *
 * const toError = presetError({ owner: 'Resnovas', repo: '.github', path: 'a.yml' })
 * toError(new NotFound({ operation: 'getFile', detail: 'x' })) instanceof PresetUnreadable // => false
 * toError(new Unavailable({ operation: 'getFile', detail: 'down' })) instanceof PresetUnreadable // => true
 * ```
 *
 * @param ref - The preset.
 * @returns A mapper from the read's failure to the loader's error.
 */
export const presetError =
  (ref: ExtendsRef) =>
  (error: MissingToken | GitHubError): ConfigNotFound =>
    error._tag === 'NotFound' ? new ConfigNotFound({ source: formatExtendsRef(ref) }) : new PresetUnreadable(ref, error.message)

/**
 * Reads presets named in `extends` from GitHub. The token is resolved only
 * when a config actually extends something, so checking a config without
 * presets works offline.
 *
 * @example
 * ```ts
 * import { resolveConfig } from '@resnovas/config'
 * import { gitHubConfigSource } from '@resnovas/runtime'
 * import { Effect } from 'effect'
 *
 * const resolved = resolveConfig('version: 2\n', 'smartcloud.yml').pipe(Effect.provide(gitHubConfigSource()))
 * ```
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
            const github = yield* makeLiveGitHub({ ...options, token, coordinates: { owner: ref.owner, repo: ref.repo }, retry: Schedule.stop })
            return yield* github.getFile(ref)
          }).pipe(
            Effect.provideService(CommandExecutor.CommandExecutor, executor),
            Effect.mapError(presetError(ref)),
          ),
      }
    }),
  )
