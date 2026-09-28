/**
 * @file packages/runtime/src/run.ts
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

import { FetchHttpClient } from '@effect/platform'
import { runFeatures, type RunResult } from '@resnovas/engine'
import { DryRun, DryRunLog, GitHub, type RecordedWrite } from '@resnovas/integrations.github'
import { reportError, track } from '@resnovas/integrations.posthog'
import { notify, type Delivery, type Notified } from '@resnovas/notifications'
import { publishReport, type Published } from '@resnovas/reporting'
import { Data, Effect, Either, Option, Schema } from 'effect'
import { configFindings, type ConfigLocation, loadConfig, readLocalConfig } from './config.js'
import { selectFeatures } from './features.js'
import { turnedOffFeatures } from './flags.js'
import { recordRun } from './analytics.js'
import { targetRepository, type Connect } from './github.js'
import { accessFindings, FULL_ACCESS, restrictedFeatures, skippablePreset, type Access } from './access.js'

/** A GitHub event, as the engine takes it. */
export interface GitHubEvent {
  readonly name: string
  readonly payload: unknown
}

/**
 * A feature failed during a run that otherwise completed; reported to error tracking.
 *
 * @example
 * ```ts import.meta.vitest name="FeatureFailed"
 * import { FeatureFailed } from '@resnovas/runtime'
 *
 * new FeatureFailed({ feature: 'labels', reason: 'down' }).message // => 'the labels feature failed: down'
 * ```
 */
export class FeatureFailed extends Data.TaggedError('FeatureFailed')<{
  readonly feature: string
  readonly reason: string
}> {
  override get message() {
    return `the ${this.feature} feature failed: ${this.reason}`
  }
}

/** What a run did. */
export interface RunOutcome {
  readonly result: RunResult
  readonly published: Published
  /** What was sent to the configured notification channels. */
  readonly notified: Notified
  /** Config migration notes, and reporting and notification steps that could not complete. */
  readonly warnings: ReadonlyArray<string>
}

/**
 * Runs smartcloud for one event: loads and resolves the config, runs the
 * selected features that their feature flags leave on, publishes the report
 * and sends the configured notifications.
 *
 * @remarks
 * Everything goes through the provided GitHub service, so the same run is a
 * dry run under the dry-run layer; a dry run plans notifications without
 * sending them. Failures are not notified again while the report comment on
 * the pull request or issue is unchanged. The run is recorded in telemetry when the
 * `Telemetry` service is provided: a span, a `feature run` event for each
 * feature, `sync proposed` and `settings applied` when those features
 * measured something, and each failed feature for error tracking. A
 * feature whose flag is off is skipped with the flag named as the reason;
 * with telemetry off or PostHog unreachable, every flag keeps its default.
 *
 * A restricted run (see `accessFor`) leaves out presets from other
 * repositories that its token cannot read, skips the features only a
 * stronger token can run, and reports both as findings rather than failing.
 * What it left out also reaches the check runs (see `checkRunsFor`).
 *
 * @example
 * ```ts
 * import { runEvent } from '@resnovas/runtime'
 *
 * // Needs the GitHub service; the event is as GitHub sends it.
 * const outcome = runEvent({ config: {}, features: ['labels'], event: { name: 'schedule', payload: {} } })
 * ```
 *
 * @param options - Where the config is, which features to run (all when omitted), the event, the run's access (full when omitted),
 *   and the check run of the job running smartcloud, when there is one.
 * @returns What the run did.
 */
export const runEvent = (options: {
  readonly config: ConfigLocation
  readonly features?: ReadonlyArray<string> | undefined
  readonly event: GitHubEvent
  readonly access?: Access | undefined
  /** The check run of the Actions job running smartcloud, which features reading a commit's checks leave out. */
  readonly checkRunId?: number | undefined
  /** Whether a feature that needs the check run fails without one, as in the action, instead of being skipped. */
  readonly checkRunRequired?: boolean | undefined
}) =>
  Effect.flatMap(GitHub, (github) => {
    const repository = github.coordinates
    const access = options.access ?? FULL_ACCESS
    const run = Effect.gen(function* () {
      const resolved = yield* loadConfig(options.config, { skipUnreadable: skippablePreset(access, repository) })
      const features = yield* selectFeatures(options.features)
      const turnedOff = new Map([...(yield* turnedOffFeatures(repository, features)), ...restrictedFeatures(access)])
      const featureRun = yield* runFeatures({
        config: resolved.config,
        event: options.event.name,
        payload: options.event.payload,
        features,
        turnedOff,
        checkRunId: options.checkRunId,
        checkRunRequired: options.checkRunRequired,
      })
      const result: RunResult = {
        ...featureRun,
        findings: [
          ...accessFindings(access, resolved.skipped ?? []),
          ...configFindings(resolved.ignored ?? [], resolved.loosened ?? []),
          ...featureRun.findings,
        ],
        ...(resolved.skipped === undefined ? {} : { configSkipped: resolved.skipped }),
      }
      for (const failure of result.failed)
        yield* reportError(repository, new FeatureFailed({ feature: failure.feature, reason: failure.message }))
      yield* recordRun(result, options.event.name)
      const published = yield* publishReport(result, { trustedAuthors: resolved.config.roles?.trustedBots ?? [] })
      // Ignored config is reported as findings, so it is not repeated as a warning.
      const ignored = new Set(resolved.ignored)
      const warnings = resolved.warnings.filter((warning) => !ignored.has(warning))
      const notified = yield* notify(result, resolved.config.notifications, {
        repository: `${repository.owner}/${repository.repo}`,
        dryRun: Option.isSome(yield* Effect.serviceOption(DryRunLog)),
        unchanged: published.comment === 'unchanged',
      }).pipe(Effect.provide(FetchHttpClient.layer))
      const outcome: RunOutcome = {
        result,
        published,
        notified,
        warnings: [...warnings, ...published.warnings, ...notified.warnings],
      }
      return outcome
    })
    return track(run, {
      operation: 'run',
      repository,
      properties: { github_event: options.event.name },
      describe: ({ result }) => ({
        ran: result.ran,
        skipped: result.skipped.map((skip) => skip.feature),
        failed: result.failed.map((failure) => failure.feature),
        findings: result.findings.length,
      }),
    })
  })

/**
 * The repository events a dry run can simulate.
 *
 * @example
 * ```ts import.meta.vitest name="REPOSITORY_EVENTS"
 * import { REPOSITORY_EVENTS } from '@resnovas/runtime'
 *
 * REPOSITORY_EVENTS.join(', ') // => 'schedule, push, workflow_dispatch'
 * ```
 */
export const REPOSITORY_EVENTS = ['schedule', 'push', 'workflow_dispatch'] as const

/** A repository event a dry run can simulate. */
export type RepositoryEvent = (typeof REPOSITORY_EVENTS)[number]

/** What a dry run simulates. */
export type Trigger =
  | { readonly kind: 'pullRequest'; readonly number: number }
  | { readonly kind: 'issue'; readonly number: number }
  | { readonly kind: 'repository'; readonly event: RepositoryEvent }

/**
 * A dry run was not told what to simulate, or was told more than one thing.
 *
 * @example
 * ```ts import.meta.vitest name="InvalidTrigger"
 * import { InvalidTrigger } from '@resnovas/runtime'
 *
 * new InvalidTrigger({ reason: 'nothing to simulate' }).message.startsWith('nothing to simulate: give exactly one') // => true
 * ```
 */
export class InvalidTrigger extends Data.TaggedError('InvalidTrigger')<{ readonly reason: string }> {
  override get message() {
    return `${this.reason}: give exactly one of a pull request, an issue, or an event (${REPOSITORY_EVENTS.join(', ')})`
  }
}

/**
 * GitHub answered a read with something other than the documented shape.
 *
 * @example
 * ```ts import.meta.vitest name="UnexpectedResponse"
 * import { UnexpectedResponse } from '@resnovas/runtime'
 *
 * new UnexpectedResponse({ operation: 'GET /commits/main' }).message // => 'GET /commits/main: unexpected response from GitHub'
 * ```
 */
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
 * @example
 * ```ts import.meta.vitest name="triggerOf"
 * import { triggerOf } from '@resnovas/runtime'
 * import { Effect } from 'effect'
 *
 * Effect.runSync(triggerOf({ pr: 7 })).kind // => 'pullRequest'
 * Effect.runSync(Effect.flip(triggerOf({ pr: 7, event: 'push' }))).reason // => 'more than one thing to simulate'
 * ```
 *
 * @param options - The pull request, issue or event.
 * @returns The trigger.
 */
export const triggerOf = (options: {
  readonly pr?: number | undefined
  readonly issue?: number | undefined
  readonly event?: string | undefined
}): Effect.Effect<Trigger, InvalidTrigger> => {
  const given = [options.pr, options.issue, options.event].filter((value) => value !== undefined).length
  if (given !== 1)
    return Effect.fail(
      new InvalidTrigger({ reason: given === 0 ? 'nothing to simulate' : 'more than one thing to simulate' }),
    )
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
 * @example
 * ```ts
 * import { syntheticEvent } from '@resnovas/runtime'
 *
 * // Needs the GitHub service, to read the pull request as it is now.
 * const event = syntheticEvent({ kind: 'pullRequest', number: 7 })
 * ```
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
        const commit = yield* github.repositoryRequest({
          method: 'GET',
          path: `/commits/${encodeURIComponent(defaultBranch)}`,
        })
        const head = yield* Either.mapLeft(
          Schema.decodeUnknownEither(CommitRef)(commit),
          () => new UnexpectedResponse({ operation }),
        )
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
 * @example
 * ```ts
 * import { dryRun } from '@resnovas/runtime'
 * import { Effect } from 'effect'
 *
 * const writes = dryRun({ trigger: { kind: 'repository', event: 'schedule' }, config: {} }).pipe(Effect.map((outcome) => outcome.writes))
 * ```
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
 * @example
 * ```ts import.meta.vitest name="describeWrite"
 * import { describeWrite } from '@resnovas/runtime'
 *
 * describeWrite({ operation: 'deleteLabel', details: { name: 'bug' } }) // => 'deleteLabel {"name":"bug"}'
 * ```
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
 * @example
 * ```ts
 * import { dryRun, dryRunText } from '@resnovas/runtime'
 * import { Effect } from 'effect'
 *
 * const text = dryRun({ trigger: { kind: 'pullRequest', number: 7 }, config: {} }).pipe(Effect.map(dryRunText))
 * ```
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
      : [
          '**Dry run:** these writes were recorded, not made:',
          ...outcome.writes.map((write) => `- ${describeWrite(write)}`),
        ]),
    ...plannedNotifications(outcome.notified.deliveries),
  ].join('\n')

/**
 * The notifications a dry run would have sent, as Markdown lines; none when
 * it would have sent nothing.
 *
 * @example
 * ```ts import.meta.vitest name="plannedNotifications"
 * import { plannedNotifications } from '@resnovas/runtime'
 *
 * plannedNotifications([{ channel: 'team', type: 'slack', kind: 'stale', title: '1 stale change in o/r', outcome: 'planned' }])[1] // => '- team (slack): 1 stale change in o/r'
 * ```
 *
 * @param deliveries - The run's deliveries.
 * @returns The lines.
 */
export const plannedNotifications = (deliveries: ReadonlyArray<Delivery>): ReadonlyArray<string> => {
  const planned = deliveries.filter((delivery) => delivery.outcome === 'planned')
  return planned.length === 0
    ? []
    : [
        '**Dry run:** these notifications were not sent:',
        ...planned.map((delivery) => `- ${delivery.channel} (${delivery.type}): ${delivery.title}`),
      ]
}

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
 * @example
 * ```ts
 * import { configLocationFor } from '@resnovas/runtime'
 *
 * const location = configLocationFor('smartcloud.yml')
 * ```
 *
 * @param file - The local file, if any.
 * @returns The location.
 */
export const configLocationFor = (file: string | undefined) =>
  file === undefined
    ? Effect.succeed<ConfigLocation>({})
    : Effect.map(readLocalConfig(file), (text): ConfigLocation => ({ text }))

/**
 * Connects to a repository and dry-runs it.
 *
 * @example
 * ```ts
 * import { dryRunRepository, liveConnect } from '@resnovas/runtime'
 *
 * const outcome = dryRunRepository(liveConnect(), { repository: 'Resnovas/smartcloud', pr: 7 })
 * ```
 *
 * @param connect - Opens the GitHub service.
 * @param request - The repository, what to simulate, the config and the features.
 * @returns The dry run.
 */
export const dryRunRepository = (connect: Connect, request: DryRunRequest) =>
  Effect.gen(function* () {
    const coordinates = yield* targetRepository(request.repository)
    const trigger = yield* triggerOf(request)
    const config = yield* configLocationFor(request.config)
    const service = yield* connect(coordinates)
    return yield* dryRun({ trigger, config, features: request.features }).pipe(Effect.provideService(GitHub, service))
  })
