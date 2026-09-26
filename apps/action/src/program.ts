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
 * (CODE_OF_CONDUCT.md) and the Eventiva Cooperation Commitment
 * (COOPERATION_COMMITMENT.md).
 *
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE.
 */

import { FileSystem } from '@effect/platform'
import { DryRun, DryRunLog, GitHub, type GitHubService, type RepositoryCoordinates } from '@resnovas/integrations.github'
import { conclusionOf } from '@resnovas/reporting'
import { Config, Console, Data, Effect, Layer, Redacted } from 'effect'
import { readInputs } from './inputs.js'
import { runAction } from './run.js'

/** The event payload file could not be read as JSON. */
export class BadEventPayload extends Data.TaggedError('BadEventPayload')<{ readonly path: string; readonly reason: string }> {
  override get message() {
    return `could not read the event payload at ${this.path}: ${this.reason}`
  }
}

/** Opens the GitHub service for a repository. The entry point passes the live service. */
export type Connect = (options: {
  readonly token: Redacted.Redacted<string>
  readonly coordinates: RepositoryCoordinates
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
})

const readPayload = (path: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const text = yield* fs.readFileString(path).pipe(Effect.mapError((error) => new BadEventPayload({ path, reason: error.message })))
    return yield* Effect.try({
      try: (): unknown => JSON.parse(text),
      catch: (error) => new BadEventPayload({ path, reason: error instanceof Error ? error.message : String(error) }),
    })
  })

const dryRunSummary = (writes: ReadonlyArray<{ readonly operation: string }>) =>
  writes.length === 0
    ? '\n**Dry run:** nothing would have been written.\n'
    : ['', '**Dry run:** these writes were recorded, not made:', ...writes.map((write) => `- ${write.operation}`), ''].join('\n')

/**
 * The whole action: reads inputs and the event, runs, then writes the job
 * summary, annotations and exit code.
 *
 * @remarks
 * Every failure, expected or not, ends as one `::error` annotation and exit
 * code 1, never an unhandled rejection. The run also exits 1 when any
 * finding is an error or any feature failed to run.
 *
 * @param connect - Opens the GitHub service.
 * @returns The run, which never fails.
 */
export const program = (connect: Connect) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const inputs = yield* readInputs
    const env = yield* environment
    const payload = yield* readPayload(env.eventPath)
    const [owner = '', repo = ''] = env.repository.split('/')
    const service = yield* connect({ token: inputs.token, coordinates: { owner, repo } })
    const base = Layer.succeed(GitHub, service)

    const event = { name: env.eventName, payload }
    const { outcome, dryRun } = inputs.dryRun
      ? yield* Effect.gen(function* () {
          const outcome = yield* runAction(inputs, event)
          const writes = yield* Effect.flatMap(DryRunLog, (log) => log.writes)
          return { outcome, dryRun: dryRunSummary(writes) }
        }).pipe(Effect.provide(DryRun.pipe(Layer.provide(base))))
      : { outcome: yield* runAction(inputs, event).pipe(Effect.provide(base)), dryRun: '' }

    for (const warning of outcome.warnings) yield* Console.log(`::warning title=smartcloud::${escape(warning)}`)
    for (const line of outcome.published.annotations) yield* Console.log(line)
    if (env.summaryPath._tag === 'Some') {
      yield* fs.writeFileString(env.summaryPath.value, `${outcome.published.summary}${dryRun}\n`, { flag: 'a' })
    }
    const failed = conclusionOf(outcome.result.findings) === 'failure' || outcome.result.failed.length > 0
    if (failed) {
      yield* Console.log('::error title=smartcloud::smartcloud found problems; see the job summary.')
      process.exitCode = 1
    }
  }).pipe(
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
        Console.log(`::error title=smartcloud::unexpected failure: ${escape(defect instanceof Error ? defect.message : String(defect))}`),
        Effect.sync(() => {
          process.exitCode = 1
        }),
      ),
    ),
  )
