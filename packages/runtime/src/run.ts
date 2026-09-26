/**
 * @file packages/runtime/src/run.ts
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

import { runFeatures, type RunResult } from '@resnovas/engine'
import { DryRun, DryRunLog, GitHub, type RecordedWrite } from '@resnovas/integrations.github'
import { publishReport, type Published } from '@resnovas/reporting'
import { Data, Effect, Either, Schema } from 'effect'
import { loadConfig, readLocalConfig, type ConfigLocation } from './config.js'
import { selectFeatures } from './features.js'
import { parseRepository, type Connect } from './github.js'

/** A GitHub event, as the engine takes it. */
export interface GitHubEvent {
  readonly name: string
  readonly payload: unknown
}

/** What a run did. */
export interface RunOutcome {
  readonly result: RunResult
  readonly published: Published
  /** Config migration notes and reporting steps that could not complete. */
  readonly warnings: ReadonlyArray<string>
}

/**
 * Runs smartcloud for one event: loads and resolves the config, runs the
 * selected features, and publishes the report.
 *
 * @remarks
 * Everything goes through the provided GitHub service, so the same run is a
 * dry run under the dry-run layer.
 *
 * @param options - Where the config is, which features to run (all when omitted), and the event.
 * @returns What the run did.
 */
export const runEvent = (options: {
  readonly config: ConfigLocation
  readonly features?: ReadonlyArray<string> | undefined
  readonly event: GitHubEvent
}) =>
  Effect.gen(function* () {
    const resolved = yield* loadConfig(options.config)
    const features = yield* selectFeatures(options.features)
    const result = yield* runFeatures({ config: resolved.config, event: options.event.name, payload: options.event.payload, features })
    const published = yield* publishReport(result)
    const outcome: RunOutcome = { result, published, warnings: [...resolved.warnings, ...published.warnings] }
    return outcome
  })

/** The repository events a dry run can simulate. */
export const REPOSITORY_EVENTS = ['schedule', 'push', 'workflow_dispatch'] as const

/** A repository event a dry run can simulate. */
export type RepositoryEvent = (typeof REPOSITORY_EVENTS)[number]

/** What a dry run simulates. */
export type Trigger =
  | { readonly kind: 'pullRequest'; readonly number: number }
  | { readonly kind: 'issue'; readonly number: number }
  | { readonly kind: 'repository'; readonly event: RepositoryEvent }

/** A dry run was not told what to simulate, or was told more than one thing. */
export class InvalidTrigger extends Data.TaggedError('InvalidTrigger')<{ readonly reason: string }> {
  override get message() {
    return `${this.reason}: give exactly one of a pull request, an issue, or an event (${REPOSITORY_EVENTS.join(', ')})`
  }
}

/** GitHub answered a read with something other than the documented shape. */
export class UnexpectedResponse extends Data.TaggedError('UnexpectedResponse')<{ readonly operation: string }> {
  override get message() {
    return `${this.operation}: unexpected response from GitHub`
  }
}

const isRepositoryEvent = (name: string): name is RepositoryEvent => REPOSITORY_EVENTS.some((event) => event === name)

/**
 * Works out what to simulate from a pull request number, an issue number or
 * an event name, of which exactly one must be given.
 *
 * @param options - The pull request, issue or event.
 * @returns The trigger.
 */
export const triggerOf = (
  options: { readonly pr?: number | undefined; readonly issue?: number | undefined; readonly event?: string | undefined },
): Effect.Effect<Trigger, InvalidTrigger> => {
  const given = [options.pr, options.issue, options.event].filter((value) => value !== undefined).length
  if (given !== 1) return Effect.fail(new InvalidTrigger({ reason: given === 0 ? 'nothing to simulate' : 'more than one thing to simulate' }))
  if (options.pr !== undefined) return Effect.succeed({ kind: 'pullRequest', number: options.pr })
  if (options.issue !== undefined) return Effect.succeed({ kind: 'issue', number: options.issue })
  const event = options.event ?? ''
  return isRepositoryEvent(event)
    ? Effect.succeed({ kind: 'repository', event })
    : Effect.fail(new InvalidTrigger({ reason: `unknown event "${event}"` }))
}

const CommitRef = Schema.Struct({ sha: Schema.String })

/**
 * Builds the event GitHub would send for a trigger, from what the API says
 * about the pull request, issue or repository now.
 *
 * @remarks
 * The REST API returns pull requests and issues in the same shape as the
 * webhook payloads, so they are used as they come. A pull request is sent as
 * `synchronize`, an issue as `edited`, and a push as a push of the default
 * branch's head commit. Only reads are made.
 *
 * @param trigger - What to simulate.
 * @returns The event name and payload.
 */
export const syntheticEvent = (trigger: Trigger) =>
  Effect.gen(function* () {
    const github = yield* GitHub
    switch (trigger.kind) {
      case 'pullRequest': {
        const pull_request = yield* github.repositoryRequest({ method: 'GET', path: `/pulls/${trigger.number}` })
        return { name: 'pull_request', payload: { action: 'synchronize', pull_request } }
      }
      case 'issue': {
        const issue = yield* github.repositoryRequest({ method: 'GET', path: `/issues/${trigger.number}` })
        return { name: 'issues', payload: { action: 'edited', issue } }
      }
      case 'repository': {
        if (trigger.event !== 'push') return { name: trigger.event, payload: {} }
        const { defaultBranch } = yield* github.getRepository
        const operation = `GET /commits/${defaultBranch}`
        const commit = yield* github.repositoryRequest({ method: 'GET', path: `/commits/${encodeURIComponent(defaultBranch)}` })
        const head = yield* Either.mapLeft(Schema.decodeUnknownEither(CommitRef)(commit), () => new UnexpectedResponse({ operation }))
        return { name: 'push', payload: { ref: `refs/heads/${defaultBranch}`, after: head.sha } }
      }
    }
  }).pipe(Effect.map((event): GitHubEvent => event))

/** What a dry run would have done. */
export interface DryRunOutcome extends RunOutcome {
  readonly event: GitHubEvent
  /** Every write the run would have made, in order. */
  readonly writes: ReadonlyArray<RecordedWrite>
}

/**
 * Runs every selected feature for a simulated event through the dry-run
 * layer, so reads reach GitHub and every write is only recorded.
 *
 * @param options - What to simulate, where the config is, and which features to run.
 * @returns What the run found and the writes it would have made.
 */
export const dryRun = (options: {
  readonly trigger: Trigger
  readonly config: ConfigLocation
  readonly features?: ReadonlyArray<string> | undefined
}) =>
  Effect.gen(function* () {
    const event = yield* syntheticEvent(options.trigger)
    const outcome = yield* runEvent({ config: options.config, event, features: options.features })
    const writes = yield* Effect.flatMap(DryRunLog, (log) => log.writes)
    const result: DryRunOutcome = { ...outcome, event, writes }
    return result
  }).pipe(Effect.provide(DryRun))

// Long details, such as a whole report body, are cut short in the listing.
const DETAIL_LIMIT = 160

/**
 * One line for a recorded write.
 *
 * @param write - The write.
 * @returns The operation and a shortened copy of its details.
 */
export const describeWrite = (write: RecordedWrite): string => {
  const details = JSON.stringify(write.details)
  return `${write.operation} ${details.length > DETAIL_LIMIT ? `${details.slice(0, DETAIL_LIMIT)}...` : details}`
}

/**
 * A dry run as text: the job summary, warnings, then every write that would
 * have been made.
 *
 * @param outcome - The dry run.
 * @returns Markdown.
 */
export const dryRunText = (outcome: DryRunOutcome): string =>
  [
    outcome.published.summary,
    ...outcome.warnings.map((warning) => `warning: ${warning}`),
    ...(outcome.warnings.length > 0 ? [''] : []),
    ...(outcome.writes.length === 0
      ? ['**Dry run:** nothing would have been written.']
      : ['**Dry run:** these writes were recorded, not made:', ...outcome.writes.map((write) => `- ${describeWrite(write)}`)]),
  ].join('\n')

/** A dry run of one repository, as the CLI and the MCP server take it. */
export interface DryRunRequest {
  /** `owner/name`. */
  readonly repository: string
  readonly pr?: number | undefined
  readonly issue?: number | undefined
  readonly event?: string | undefined
  /** A local config file; the repository's own config when omitted. */
  readonly config?: string | undefined
  /** Only these features; all when omitted. */
  readonly features?: ReadonlyArray<string> | undefined
}

/**
 * The config location for a request: a local file when one is named,
 * otherwise the repository's config on its default branch.
 *
 * @param file - The local file, if any.
 * @returns The location.
 */
export const configLocationFor = (file: string | undefined) =>
  file === undefined ? Effect.succeed<ConfigLocation>({}) : Effect.map(readLocalConfig(file), (text): ConfigLocation => ({ text }))

/**
 * Connects to a repository and dry-runs it.
 *
 * @param connect - Opens the GitHub service.
 * @param request - The repository, what to simulate, the config and the features.
 * @returns The dry run.
 */
export const dryRunRepository = (connect: Connect, request: DryRunRequest) =>
  Effect.gen(function* () {
    const coordinates = yield* parseRepository(request.repository)
    const trigger = yield* triggerOf(request)
    const config = yield* configLocationFor(request.config)
    const service = yield* connect(coordinates)
    return yield* dryRun({ trigger, config, features: request.features }).pipe(Effect.provideService(GitHub, service))
  })
