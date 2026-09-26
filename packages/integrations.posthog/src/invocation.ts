/**
 * @file packages/integrations.posthog/src/invocation.ts
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

import { Cause, Clock, Effect, Exit, FiberRef, LogLevel, Metric, MetricBoundaries, Option } from 'effect'
import { anonymousIdentity, identify } from './identity.js'
import {
  currentInvocation,
  Telemetry,
  withTelemetry,
  type InvocationState,
  type Properties,
  type RepositoryName,
} from './telemetry.js'

/** How an invocation ended, as {@link invocation} hands it to the caller's event. A type rather than an interface, so it is also a set of {@link Properties}. */
export type InvocationSummary = {
  readonly command: string
  /** The option names, sorted and without repeats. */
  readonly options: ReadonlyArray<string>
  readonly outcome: 'success' | 'failure' | 'interrupted'
  readonly duration_ms: number
  /** The failure's tag, when it failed. */
  readonly error_tag?: string
  /** Whether the failure was a typed, expected one rather than a defect, when it failed. */
  readonly expected?: boolean
}

/** An event to send: its name and properties. */
export interface TelemetryEvent {
  readonly event: string
  readonly properties: Properties
}

/** What {@link invocation} records about one command, tool call or action run. */
export interface InvocationOptions {
  /** What was invoked: a CLI command such as `dry-run` or `plan settings`, an MCP tool such as `dry_run`, or the action's `run`. */
  readonly command: string
  /** The names of the options or inputs given, never their values. */
  readonly options?: ReadonlyArray<string> | undefined
  /** The event sent when the invocation ends; none when omitted. */
  readonly completed?: ((summary: InvocationSummary) => TelemetryEvent) | undefined
}

const commands = Metric.counter('smartcloud.commands', {
  description: 'smartcloud invocations, by command and outcome',
  incremental: true,
})
const commandDurations = Metric.histogram(
  'smartcloud.command.duration_ms',
  MetricBoundaries.exponential({ start: 50, factor: 2, count: 12 }),
  'How long smartcloud invocations take, in milliseconds',
)

/**
 * The name error tracking groups a failure under: the tag of a tagged
 * error, otherwise the name of its class.
 *
 * @remarks
 * Both come from smartcloud's code or its libraries, never from input, so
 * they are safe to send as they are.
 *
 * @example
 * ```ts import.meta.vitest name="errorTag"
 * import { Data } from 'effect'
 * import { errorTag } from '@resnovas/integrations.posthog'
 *
 * class NotFound extends Data.TaggedError('NotFound')<{}> {}
 * errorTag(new NotFound()) // => 'NotFound'
 * errorTag(new TypeError('x')) // => 'TypeError'
 * errorTag('text') // => 'string'
 * ```
 *
 * @param error - The failure or defect.
 * @returns Its tag.
 */
export const errorTag = (error: unknown): string => {
  if (typeof error !== 'object' || error === null) return typeof error
  if ('_tag' in error && typeof error._tag === 'string') return error._tag
  return error instanceof Error ? error.name : 'Object'
}

const outcomeOf = <A, E>(exit: Exit.Exit<A, E>): InvocationSummary['outcome'] =>
  Exit.isSuccess(exit) ? 'success' : Cause.isInterruptedOnly(exit.cause) ? 'interrupted' : 'failure'

/**
 * Records one whole invocation of smartcloud: an action run, a CLI command or
 * an MCP tool call.
 *
 * @remarks
 * The invocation runs inside a `smartcloud.command` span, so everything it
 * does, including the GitHub reads that come before a run, joins one trace.
 * When it ends, the caller's `completed` event is sent, built from the
 * command, the option names, the outcome and the duration, and a PostHog-only
 * log line records the outcome. A failure or defect is also sent to
 * error tracking as one redacted `$exception` with the surface, the command,
 * the outcome and the error's tag; `expected` is true for a typed failure,
 * such as an invalid config or a missing repository, and false for a
 * defect. Interruption is not an error.
 *
 * Until {@link bindRepository} names a repository, the invocation is
 * anonymous: its events create no person in PostHog. Without the
 * `Telemetry` service the effect runs unchanged, and its own result, failure
 * or interruption is always returned as it was.
 *
 * @example
 * ```ts import.meta.vitest name="invocation"
 * import { Effect } from 'effect'
 * import { invocation } from '@resnovas/integrations.posthog'
 *
 * const command = invocation(Effect.succeed('done'), {
 *   command: 'validate',
 *   options: ['path'],
 *   completed: (summary) => ({ event: 'command run', properties: { ...summary } }),
 * })
 * await Effect.runPromise(command) // => 'done'
 * ```
 *
 * @param effect - The invocation.
 * @param options - The command and the names of the options given.
 * @returns The invocation, recorded.
 */
export const invocation = <A, E, R>(
  effect: Effect.Effect<A, E, R>,
  options: InvocationOptions,
): Effect.Effect<A, E, R> =>
  Effect.flatMap(
    Effect.serviceOption(Telemetry),
    Option.match({
      onNone: () => effect,
      onSome: (telemetry) =>
        Effect.gen(function* () {
          const state: InvocationState = {
            identity: anonymousIdentity(),
            span: Option.none(),
            options: new Set(options.options ?? []),
          }
          const start = yield* Clock.currentTimeMillis
          const exit = yield* Effect.option(Effect.currentSpan).pipe(
            Effect.flatMap((span) => {
              state.span = span
              return effect
            }),
            Effect.withSpan('smartcloud.command', { attributes: { command: options.command } }),
            Effect.locally(currentInvocation, Option.some(state)),
            Effect.exit,
          )
          const duration = (yield* Clock.currentTimeMillis) - start
          const outcome = outcomeOf(exit)
          const names = [...state.options].sort()
          const base = { command: options.command, options: names, outcome, duration_ms: duration }
          const failure = Exit.isFailure(exit) && outcome === 'failure' ? Option.some(exit.cause) : Option.none()
          const summary: InvocationSummary = Option.match(failure, {
            onNone: () => base,
            onSome: (cause) => {
              const typed = Cause.failureOption(cause)
              return {
                ...base,
                error_tag: errorTag(Option.getOrElse(typed, () => Cause.squash(cause))),
                expected: Option.isSome(typed),
              }
            },
          })
          if (Option.isSome(failure))
            yield* telemetry.captureException(state.identity, Cause.squash(failure.value), summary)
          yield* Metric.increment(
            Metric.tagged(Metric.tagged(commands, 'command', options.command), 'outcome', outcome),
          )
          yield* Metric.update(commandDurations.pipe(Metric.tagged('command', options.command)), duration)
          if (options.completed !== undefined) {
            const completed = options.completed(summary)
            yield* telemetry.capture(state.identity, completed.event, completed.properties)
          }
          // The outcome line joins the invocation's trace, although its span has ended.
          const line = telemetry.log(
            state.identity,
            outcome === 'failure' ? LogLevel.Error : LogLevel.Info,
            `command ${options.command}: ${outcome}`,
            summary,
          )
          yield* Option.isSome(state.span) ? Effect.withParentSpan(line, state.span.value) : line
          return yield* exit
        }),
    }),
  )

/**
 * Removes a value, such as a repository name as it was typed, from
 * everything telemetry sends from now on.
 *
 * @example
 * ```ts import.meta.vitest name="protect"
 * import { Effect } from 'effect'
 * import { protect } from '@resnovas/integrations.posthog'
 *
 * Effect.runSync(protect('Acme/secret'))
 * ```
 *
 * @param value - The value.
 * @returns Nothing.
 */
export const protect = (value: string): Effect.Effect<void> =>
  withTelemetry((telemetry) => telemetry.protect(value), undefined)

const withInvocation = (use: (state: InvocationState) => Effect.Effect<void>): Effect.Effect<void> =>
  Effect.flatMap(FiberRef.get(currentInvocation), Option.match({ onNone: () => Effect.void, onSome: use }))

/**
 * Names the repository the current invocation is about: its full name is
 * protected, and from now on the invocation's events, logs and span carry
 * the repository's hashed identity instead of an anonymous one.
 *
 * @example
 * ```ts import.meta.vitest name="bindRepository"
 * import { Effect } from 'effect'
 * import { bindRepository } from '@resnovas/integrations.posthog'
 *
 * Effect.runSync(bindRepository({ owner: 'Resnovas', repo: 'smartcloud' }))
 * ```
 *
 * @param repository - The owner and name.
 * @returns Nothing.
 */
export const bindRepository = (repository: RepositoryName): Effect.Effect<void> =>
  Effect.zipRight(
    protect(`${repository.owner}/${repository.repo}`),
    withInvocation((state) =>
      Effect.sync(() => {
        state.identity = identify(repository)
        const distinctId = state.identity.distinctId
        Option.map(state.span, (span) => span.attribute('posthogDistinctId', distinctId))
      }),
    ),
  )

/**
 * Adds option or input names to the current invocation, for a surface that
 * only knows them once it has read them, such as the action's inputs.
 *
 * @example
 * ```ts import.meta.vitest name="noteOptions"
 * import { Effect } from 'effect'
 * import { noteOptions } from '@resnovas/integrations.posthog'
 *
 * Effect.runSync(noteOptions(['config', 'dryRun']))
 * ```
 *
 * @param names - The names, never the values.
 * @returns Nothing.
 */
export const noteOptions = (names: ReadonlyArray<string>): Effect.Effect<void> =>
  withInvocation((state) =>
    Effect.sync(() => {
      for (const name of names) state.options.add(name)
    }),
  )

/**
 * Sends a product analytics event for the current invocation, as its
 * repository or, before one is bound, anonymously.
 *
 * @remarks
 * Callers pass only values that name nothing: counts, outcomes and fixed
 * names. Outside an invocation nothing is sent.
 *
 * @example
 * ```ts import.meta.vitest name="emit"
 * import { Effect } from 'effect'
 * import { emit } from '@resnovas/integrations.posthog'
 *
 * Effect.runSync(emit('feature run', { feature: 'labels', outcome: 'success' }))
 * ```
 *
 * @param event - The event name.
 * @param properties - Its properties.
 * @returns Nothing; failing to send never fails the caller.
 */
export const emit = (event: string, properties: Properties): Effect.Effect<void> =>
  withTelemetry(
    (telemetry) => withInvocation((state) => telemetry.capture(state.identity, event, properties)),
    undefined,
  )

/**
 * Sets properties on the current invocation's organisation group, once a
 * repository is bound.
 *
 * @example
 * ```ts import.meta.vitest name="describeOrganization"
 * import { Effect } from 'effect'
 * import { describeOrganization } from '@resnovas/integrations.posthog'
 *
 * Effect.runSync(describeOrganization({ uses_house_preset: true }))
 * ```
 *
 * @param properties - The group's properties.
 * @returns Nothing.
 */
export const describeOrganization = (properties: Properties): Effect.Effect<void> =>
  withTelemetry(
    (telemetry) => withInvocation((state) => telemetry.describeOrganization(state.identity, properties)),
    undefined,
  )

const runs = Metric.counter('smartcloud.runs', {
  description: 'smartcloud operations, by operation and outcome',
  incremental: true,
})
const durations = Metric.histogram(
  'smartcloud.duration_ms',
  MetricBoundaries.exponential({ start: 50, factor: 2, count: 12 }),
  'How long smartcloud operations take, in milliseconds',
)

/** What {@link track} records about an operation. */
export interface TrackOptions<A> {
  /** The operation, such as `run`; the span is `smartcloud.<operation>`. */
  readonly operation: string
  readonly repository: RepositoryName
  /** Set on the span and the log line. */
  readonly properties?: Properties | undefined
  /** More properties from the result, when it succeeds. */
  readonly describe?: ((value: A) => Properties) | undefined
}

/**
 * Records an operation on a repository inside an invocation: binds the
 * repository, and adds a span, a count and a duration, and a PostHog-only
 * log line with its outcome.
 *
 * @remarks
 * The enclosing {@link invocation} sends the event and reports any failure,
 * so an operation is never counted or reported twice. Without the
 * `Telemetry` service the effect runs unchanged, and its own result,
 * failure or interruption is always returned as it was.
 *
 * @example
 * ```ts import.meta.vitest name="track"
 * import { Effect } from 'effect'
 * import { track } from '@resnovas/integrations.posthog'
 *
 * const run = track(Effect.succeed(3), { operation: 'run', repository: { owner: 'Resnovas', repo: 'smartcloud' } })
 * await Effect.runPromise(run) // => 3
 * ```
 *
 * @param effect - The operation.
 * @param options - Its name, repository and properties.
 * @returns The operation, recorded.
 */
export const track = <A, E, R>(effect: Effect.Effect<A, E, R>, options: TrackOptions<A>): Effect.Effect<A, E, R> =>
  Effect.flatMap(
    Effect.serviceOption(Telemetry),
    Option.match({
      onNone: () => effect,
      onSome: (telemetry) =>
        Effect.gen(function* () {
          yield* bindRepository(options.repository)
          const identity = identify(options.repository)
          const properties = { operation: options.operation, ...options.properties }
          const start = yield* Clock.currentTimeMillis
          const exit = yield* effect.pipe(
            Effect.withSpan(`smartcloud.${options.operation}`, {
              attributes: { ...properties, posthogDistinctId: identity.distinctId },
            }),
            Effect.exit,
          )
          const duration = (yield* Clock.currentTimeMillis) - start
          const outcome = outcomeOf(exit)
          const tags = (metric: typeof runs) =>
            metric.pipe(Metric.tagged('operation', options.operation), Metric.tagged('outcome', outcome))
          yield* Metric.increment(tags(runs))
          yield* Metric.update(durations.pipe(Metric.tagged('operation', options.operation)), duration)
          const described = Exit.isSuccess(exit) && options.describe !== undefined ? options.describe(exit.value) : {}
          const summary = { ...properties, ...described, outcome, duration_ms: duration }
          yield* telemetry.log(
            identity,
            outcome === 'failure' ? LogLevel.Error : LogLevel.Info,
            `smartcloud ${options.operation}: ${outcome}`,
            summary,
          )
          return yield* exit
        }),
    }),
  )
