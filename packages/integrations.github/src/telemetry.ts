/**
 * @file packages/integrations.github/src/telemetry.ts
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

import { Clock, Effect, Either, Metric, MetricBoundaries, MetricState } from 'effect'
import type { GitHubError } from './errors.js'

/**
 * Counts GitHub API calls, tagged by `operation` (such as `listLabels`) and
 * `outcome` (`success`, or the typed error's tag, such as `NotFound`).
 *
 * @remarks
 * One call counts once, however many times it was retried. Like every
 * Effect metric it can also be applied to an effect, which adds the effect's
 * result to the count.
 *
 * @example
 * ```ts
 * import { Effect, Metric } from 'effect'
 * import { githubRequests } from '@resnovas/integrations.github'
 *
 * const calls = Metric.value(githubRequests).pipe(Effect.map((state) => state.count))
 * ```
 */
export const githubRequests = Metric.counter('smartcloud.github.requests', {
  description: 'GitHub API calls smartcloud made, by operation and outcome',
  incremental: true,
})

/**
 * How long GitHub API calls take, in milliseconds, retries included, tagged by `operation` and `outcome`.
 *
 * @remarks
 * Like every Effect metric it can also be applied to an effect, which
 * records the effect's result as a duration.
 *
 * @example
 * ```ts
 * import { Effect, Metric } from 'effect'
 * import { githubDuration } from '@resnovas/integrations.github'
 *
 * const timedCalls = Metric.value(githubDuration).pipe(Effect.map((state) => state.count))
 * ```
 */
export const githubDuration = Metric.histogram(
  'smartcloud.github.duration_ms',
  MetricBoundaries.exponential({ start: 25, factor: 2, count: 12 }),
  'How long GitHub API calls take, in milliseconds, by operation and outcome',
)

/**
 * The rate limit GitHub reported left after the last call of each
 * operation, tagged by `operation`.
 *
 * @remarks
 * Set from the `X-RateLimit-Remaining` header, so it tracks the quota of
 * whichever token the operation used: the checks on a commit are read with
 * the workflow token, everything else with the main token.
 *
 * @example
 * ```ts
 * import { Effect, Metric } from 'effect'
 * import { githubRateLimitRemaining } from '@resnovas/integrations.github'
 *
 * const left = Metric.value(Metric.tagged(githubRateLimitRemaining, 'operation', 'listLabels')).pipe(
 *   Effect.map((state) => state.value),
 * )
 * ```
 */
export const githubRateLimitRemaining = Metric.gauge('smartcloud.github.rate_limit_remaining', {
  description: 'The GitHub rate limit left after the last call, by operation',
})

/** What a process has spent on one GitHub operation, from {@link githubUsage}. */
export interface GitHubUsage {
  readonly operation: string
  /** Calls made, whatever their outcome; a retried call counts once. */
  readonly requests: number
  /** The rate limit left after the operation's last call, when GitHub reported it. */
  readonly remaining?: number
}

const tagOf = (tags: ReadonlyArray<{ readonly key: string; readonly value: string }>, key: string) =>
  tags.find((tag) => tag.key === key)?.value

/**
 * The GitHub calls this process has made so far, by operation, with the
 * rate limit left after each operation's last call, most-called first.
 *
 * @remarks
 * Read from {@link githubRequests} and {@link githubRateLimitRemaining}, so
 * a run can report what it spent and a regression in its API use shows.
 *
 * @example
 * ```ts
 * import { Effect } from 'effect'
 * import { githubUsage } from '@resnovas/integrations.github'
 *
 * const report = Effect.map(githubUsage, (usage) => usage.map((entry) => `${entry.operation}: ${entry.requests}`))
 * ```
 */
export const githubUsage: Effect.Effect<ReadonlyArray<GitHubUsage>> = Effect.map(Metric.snapshot, (pairs) => {
  const requests = new Map<string, number>()
  const remaining = new Map<string, number>()
  for (const { metricKey, metricState } of pairs) {
    const operation = tagOf(metricKey.tags, 'operation')
    if (operation === undefined) continue
    if (metricKey.name === 'smartcloud.github.requests' && MetricState.isCounterState(metricState))
      requests.set(operation, (requests.get(operation) ?? 0) + Number(metricState.count))
    if (metricKey.name === 'smartcloud.github.rate_limit_remaining' && MetricState.isGaugeState(metricState))
      remaining.set(operation, Number(metricState.value))
  }
  return [...requests]
    .map(([operation, count]) => {
      const left = remaining.get(operation)
      return left === undefined ? { operation, requests: count } : { operation, requests: count, remaining: left }
    })
    .sort((a, b) => b.requests - a.requests || a.operation.localeCompare(b.operation))
})

/**
 * The span name for a GitHub operation.
 *
 * @remarks
 * A step of a larger operation, such as `proposeChanges: create blob`, is
 * named as a child of it in camel case: `smartcloud.github.proposeChanges.createBlob`.
 *
 * @example
 * ```ts import.meta.vitest name="githubSpanName"
 * import { githubSpanName } from '@resnovas/integrations.github'
 *
 * githubSpanName('listLabels') // => 'smartcloud.github.listLabels'
 * githubSpanName('proposeChanges: create blob') // => 'smartcloud.github.proposeChanges.createBlob'
 * ```
 *
 * @param operation - The operation, which must name nothing about the repository.
 * @returns The span name.
 */
export const githubSpanName = (operation: string): string =>
  `smartcloud.github.${operation
    .split(': ')
    .map((part) => part.replace(/ (\w)/g, (_, letter: string) => letter.toUpperCase()))
    .join('.')}`

/** What {@link instrumentCall} records about one GitHub call. */
export interface CallDetails {
  /** The operation, such as `listLabels`: never a path, a repository name or a login. */
  readonly operation: string
  /** Attributes that are safe to send, such as the HTTP method. */
  readonly attributes?: Readonly<Record<string, string>> | undefined
}

const statusOf = (value: unknown): number | undefined =>
  typeof value === 'object' && value !== null && 'status' in value && typeof value.status === 'number'
    ? value.status
    : undefined

/**
 * Traces, logs and counts one GitHub call.
 *
 * @remarks
 * The call runs in a span named by {@link githubSpanName}, carrying the
 * operation, the outcome, the typed error's tag and the HTTP status of the
 * last attempt when there is one. It is counted in {@link githubRequests},
 * timed in {@link githubDuration} and logged at debug level. The error's
 * detail and the request itself are never recorded: they can name the
 * repository, its files and its people.
 *
 * @internal
 *
 * @example
 * ```ts
 * instrumentCall(attempts, statusRef, { operation: 'listLabels' }, client.remaining)
 * ```
 *
 * @param call - The call, retries included.
 * @param lastStatus - Reads the HTTP status of the last attempt, if it had one.
 * @param details - The operation and any safe attributes.
 * @param lastRemaining - Reads the rate limit GitHub reported left after the last attempt, if it did.
 * @returns The call, instrumented; its result and error are unchanged.
 */
export const instrumentCall = <A>(
  call: Effect.Effect<A, GitHubError>,
  lastStatus: () => number | undefined,
  details: CallDetails,
  lastRemaining: () => number | undefined,
): Effect.Effect<A, GitHubError> =>
  Effect.gen(function* () {
    const start = yield* Clock.currentTimeMillis
    // A defect is a bug, not a GitHub answer: it passes through, and the span records it.
    const result = yield* Effect.either(call)
    const duration = (yield* Clock.currentTimeMillis) - start
    const outcome = Either.isRight(result) ? 'success' : result.left._tag
    const status = lastStatus()
    const attributes = {
      'github.operation': details.operation,
      outcome,
      ...(status === undefined ? {} : { 'http.status_code': status }),
    }
    yield* Effect.annotateCurrentSpan(attributes)
    const tagged = <T, I, O>(metric: Metric.Metric<T, I, O>) =>
      Metric.tagged(Metric.tagged(metric, 'operation', details.operation), 'outcome', outcome)
    yield* Metric.increment(tagged(githubRequests))
    yield* Metric.update(tagged(githubDuration), duration)
    const remaining = lastRemaining()
    if (remaining !== undefined)
      yield* Metric.set(Metric.tagged(githubRateLimitRemaining, 'operation', details.operation), remaining)
    yield* Effect.logDebug(
      `github ${details.operation}: ${outcome}${status === undefined ? '' : ` (${status})`} in ${duration} ms`,
    ).pipe(Effect.annotateLogs({ ...attributes, duration_ms: duration }))
    return yield* result
  }).pipe(
    Effect.withSpan(githubSpanName(details.operation), {
      kind: 'client',
      captureStackTrace: false,
      attributes: { 'github.operation': details.operation, ...details.attributes },
    }),
  )

/**
 * Records the HTTP status of each attempt a call makes, for {@link instrumentCall}.
 *
 * @internal
 *
 * @returns `track`, which wraps a promise-returning attempt, and `last`, which reads the status of the latest attempt.
 */
export const statusTracker = () => {
  let latest: number | undefined
  const track =
    <A>(attempt: () => Promise<A>) =>
    () =>
      attempt().then(
        (value) => {
          latest = statusOf(value)
          return value
        },
        (error: unknown) => {
          latest = statusOf(error)
          throw error
        },
      )
  return { track, last: () => latest }
}
