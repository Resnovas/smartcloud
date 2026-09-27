/**
 * @file apps/action/src/program.ts
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

import { FileSystem } from '@effect/platform'
import {
  DryRun,
  DryRunLog,
  GitHub,
  Restricted,
  SkippedWrites,
  type GitHubService,
  type RepositoryCoordinates,
} from '@resnovas/integrations.github'
import { conclusionOf } from '@resnovas/reporting'
import {
  accessFor,
  command,
  connectWithFallback,
  externalRun,
  noteOptions,
  optOut,
  targetRepository,
} from '@resnovas/runtime'
import { Config, Console, Data, Effect, Layer, Option, Redacted } from 'effect'
import { readInputs } from './inputs.js'
import { runAction } from './run.js'

/**
 * The event payload file could not be read as JSON.
 *
 * @example
 * ```ts import.meta.vitest name="BadEventPayload"
 * import { BadEventPayload } from '@resnovas/action'
 *
 * new BadEventPayload({ path: 'event.json', reason: 'not JSON' }).message // => 'could not read the event payload at event.json: not JSON'
 * ```
 */
export class BadEventPayload extends Data.TaggedError('BadEventPayload')<{
  readonly path: string
  readonly reason: string
}> {
  override get message() {
    return `could not read the event payload at ${this.path}: ${this.reason}`
  }
}

/** Opens the GitHub service for a repository. The entry point passes the live service. */
export type Connect = (options: {
  readonly token: Redacted.Redacted<string>
  readonly coordinates: RepositoryCoordinates
  /** The token the checks on a commit are read with, when it is not `token`. */
  readonly checksToken?: Redacted.Redacted<string>
}) => Effect.Effect<GitHubService>

// Workflow command data needs %, carriage returns and newlines escaped.
const escape = (text: string) => text.replaceAll('%', '%25').replaceAll('\r', '%0D').replaceAll('\n', '%0A')

const environment = Config.all({
  eventName: Config.string('GITHUB_EVENT_NAME'),
  eventPath: Config.string('GITHUB_EVENT_PATH'),
  repository: Config.string('GITHUB_REPOSITORY').pipe(
    Config.validate({ message: 'must be owner/name', validation: (value) => /^[^/\s]+\/[^/\s]+$/.test(value) }),
  ),
  summaryPath: Config.option(Config.string('GITHUB_STEP_SUMMARY')),
  actor: Config.option(Config.string('GITHUB_ACTOR')),
})

const readPayload = (path: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const text = yield* fs
      .readFileString(path)
      .pipe(Effect.mapError((error) => new BadEventPayload({ path, reason: error.message })))
    return yield* Effect.try({
      try: (): unknown => JSON.parse(text),
      catch: (error) => new BadEventPayload({ path, reason: error instanceof Error ? error.message : String(error) }),
    })
  })

const dryRunSummary = (writes: ReadonlyArray<{ readonly operation: string }>) =>
  writes.length === 0
    ? '\n**Dry run:** nothing would have been written.\n'
    : [
        '',
        '**Dry run:** these writes were recorded, not made:',
        ...writes.map((write) => `- ${write.operation}`),
        '',
      ].join('\n')

const skippedSummary = (writes: ReadonlyArray<{ readonly operation: string }>) =>
  writes.length === 0
    ? ''
    : [
        '',
        '**Restricted access:** the token was not allowed to make these writes, so they were skipped:',
        ...writes.map((write) => `- ${write.operation}`),
        '',
      ].join('\n')

/**
 * The whole action: reads inputs and the event, runs, then writes the job
 * summary, annotations and exit code.
 *
 * @remarks
 * Every failure, expected or not, ends as one `::error` annotation and exit
 * code 1, never an unhandled rejection. The run also exits 1 when any
 * finding is an error or any feature failed to run.
 *
 * A run from a fork or started by Dependabot acts with the workflow token
 * whatever token it was given, and a run acting with the workflow token is
 * restricted: see `accessFor`. A token GitHub rejects, such as an expired
 * or forbidden personal access token, is replaced with the workflow token
 * and warned about: see `connectWithFallback`. A restricted run skips what
 * its token cannot do, including writes GitHub refuses, and lists them in
 * the job summary rather than failing.
 *
 * The whole run is one telemetry invocation (`command run` with the command `run`), so any
 * failure, from reading the inputs on, is also sent to error tracking.
 *
 * @example
 * ```ts
 * import { program } from '@resnovas/action'
 * import { makeLiveGitHub } from '@resnovas/integrations.github'
 *
 * // Needs the platform's FileSystem and the Actions environment to run.
 * const action = program((options) => makeLiveGitHub(options))
 * ```
 *
 * @param connect - Opens the GitHub service.
 * @returns The run, which never fails.
 */
export const program = (connect: Connect) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const inputs = yield* readInputs
    if (!inputs.telemetry) yield* optOut
    yield* noteOptions(inputs.given)
    const env = yield* environment
    const coordinates = yield* targetRepository(env.repository)
    const payload = yield* readPayload(env.eventPath)
    // The workflow token reads the commit's checks: the job grants it checks and statuses read, which a personal access token may lack.
    const checksToken = Option.match(inputs.workflowToken, {
      onNone: () => ({}),
      onSome: (token) => ({ checksToken: token }),
    })
    const event = { name: env.eventName, payload }
    const chosen = accessFor({
      token: inputs.token,
      workflowToken: inputs.workflowToken,
      external: externalRun(event, env.repository, Option.getOrUndefined(env.actor)),
    })
    const { service, access, rejected } = yield* connectWithFallback({
      ...chosen,
      workflowToken: inputs.workflowToken,
      connect: (token) => connect({ token, coordinates, ...checksToken }),
    })
    if (rejected !== undefined) {
      yield* Console.log(
        `::warning title=smartcloud::${escape(`GitHub rejected GITHUB_TOKEN (${rejected}); this run acted with the workflow token and skipped what needs a stronger token. Replace the token.`)}`,
      )
    }
    // A restricted run skips the writes GitHub refuses; others are made or fail as usual.
    const base = access.restricted
      ? Restricted.pipe(Layer.provide(Layer.succeed(GitHub, service)))
      : Layer.merge(Layer.succeed(GitHub, service), Layer.succeed(SkippedWrites, { writes: Effect.succeed([]) }))

    // Reads the skipped writes inside the same layer the run used.
    const run = Effect.gen(function* () {
      const outcome = yield* runAction(inputs, event, access)
      const writes = yield* Effect.flatMap(SkippedWrites, (log) => log.writes)
      return { outcome, skipped: skippedSummary(writes) }
    })
    const { outcome, skipped, dryRun } = inputs.dryRun
      ? yield* Effect.gen(function* () {
          const done = yield* run
          const writes = yield* Effect.flatMap(DryRunLog, (log) => log.writes)
          return { ...done, dryRun: dryRunSummary(writes) }
        }).pipe(Effect.provide(Layer.provideMerge(DryRun, base)))
      : { ...(yield* run.pipe(Effect.provide(base))), dryRun: '' }

    for (const warning of outcome.warnings) yield* Console.log(`::warning title=smartcloud::${escape(warning)}`)
    for (const line of outcome.published.annotations) yield* Console.log(line)
    if (env.summaryPath._tag === 'Some') {
      yield* fs.writeFileString(env.summaryPath.value, `${outcome.published.summary}${dryRun}${skipped}\n`, {
        flag: 'a',
      })
    }
    const failed = conclusionOf(outcome.result.findings) === 'failure' || outcome.result.failed.length > 0
    if (failed) {
      yield* Console.log('::error title=smartcloud::smartcloud found problems; see the job summary.')
      process.exitCode = 1
    }
  }).pipe(
    // The whole run is one invocation, so a failure at any step, even reading the inputs, is reported.
    (run) => command(run, { command: 'run' }),
    Effect.catchAll((error) =>
      Effect.zipRight(
        Console.log(`::error title=smartcloud::${escape(error.message)}`),
        Effect.sync(() => {
          process.exitCode = 1
        }),
      ),
    ),
    Effect.catchAllDefect((defect) =>
      Effect.zipRight(
        Console.log(
          `::error title=smartcloud::unexpected failure: ${escape(defect instanceof Error ? defect.message : String(defect))}`,
        ),
        Effect.sync(() => {
          process.exitCode = 1
        }),
      ),
    ),
  )
