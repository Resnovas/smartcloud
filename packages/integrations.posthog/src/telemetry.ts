/**
 * @file packages/integrations.posthog/src/telemetry.ts
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

import * as OtlpLogger from '@effect/opentelemetry/OtlpLogger'
import * as OtlpMetrics from '@effect/opentelemetry/OtlpMetrics'
import * as OtlpSerialization from '@effect/opentelemetry/OtlpSerialization'
import * as OtlpTracer from '@effect/opentelemetry/OtlpTracer'
import { FetchHttpClient } from '@effect/platform'
import { OpenFeature } from '@openfeature/server-sdk'
import { PostHogServerProvider } from '@posthog/openfeature-node-provider'
import { PostHog, type PostHogOptions } from 'posthog-node'
import { homedir } from 'node:os'
import { Cause, Clock, Context, Effect, Exit, FiberRef, HashSet, Layer, Logger, LogLevel, Metric, MetricBoundaries, Option, Redacted, Runtime } from 'effect'
import { telemetrySettings, type TelemetrySettings } from './config.js'
import { identify, ORGANIZATION_GROUP, type Identity, type Surface } from './identity.js'
import { makeTransport, type Fetch } from './transport.js'

/** A property value telemetry may send. */
export type PropertyValue = string | number | boolean | ReadonlyArray<string>

/** Properties sent with an event. Callers must only pass values that name nothing. */
export type Properties = Readonly<Record<string, PropertyValue>>

/**
 * Sends telemetry to PostHog.
 *
 * @remarks
 * Every operation swallows its own failures, logging them at debug level, so
 * telemetry can never fail or block a run.
 */
export interface TelemetryService {
  /** Whether anything is still being sent. */
  readonly isEnabled: Effect.Effect<boolean>
  /** Stops all sending for the rest of the process, including anything already queued. */
  readonly disable: Effect.Effect<void>
  /** Removes a value, such as a repository's full name, from everything sent from now on. */
  readonly protect: (value: string) => Effect.Effect<void>
  /** Records an event for a repository. */
  readonly capture: (identity: Identity, event: string, properties?: Properties) => Effect.Effect<void>
  /** Records an error for error tracking. */
  readonly captureException: (identity: Identity, error: unknown, properties?: Properties) => Effect.Effect<void>
  /** Writes a log line to PostHog Logs only, never to the console, linked to the repository. */
  readonly log: (identity: Identity, level: LogLevel.LogLevel, message: string, properties?: Properties) => Effect.Effect<void>
  /**
   * Evaluates a boolean feature flag through OpenFeature.
   *
   * @returns The flag, or `fallback` when telemetry is off, PostHog cannot be reached or the flag does not exist.
   */
  readonly evaluateFlag: (identity: Identity, key: string, fallback: boolean) => Effect.Effect<boolean>
}

/** The telemetry service. Absent, or disabled, it sends nothing. */
export class Telemetry extends Context.Tag('@resnovas/integrations.posthog/Telemetry')<Telemetry, TelemetryService>() {}

/** Telemetry that sends nothing, as used when it is turned off. */
export const disabledTelemetry: TelemetryService = {
  isEnabled: Effect.succeed(false),
  disable: Effect.void,
  protect: () => Effect.void,
  capture: () => Effect.void,
  captureException: () => Effect.void,
  log: () => Effect.void,
  evaluateFlag: (_identity, _key, fallback) => Effect.succeed(fallback),
}

/** How the telemetry layer is set up. */
export interface TelemetryOptions {
  /** Which smartcloud is running. */
  readonly surface: Surface
  /** The smartcloud version. */
  readonly version: string
  /** Replaces the global `fetch`, for tests. */
  readonly fetch?: Fetch | undefined
  /** How long flushing may take when the layer closes; 3 seconds by default. */
  readonly shutdownTimeoutMs?: number | undefined
}

// The OpenFeature domain smartcloud's flags are evaluated in.
const FLAG_DOMAIN = 'smartcloud'
const REQUEST_TIMEOUT_MS = 5000

// Failures are logged locally and never reach the caller.
const quietly =
  (what: string) =>
  <A, E>(effect: Effect.Effect<A, E>, fallback: A): Effect.Effect<A> =>
    effect.pipe(Effect.catchAllCause((cause) => Effect.as(Effect.logDebug(`telemetry: ${what} failed`, cause), fallback)))

const makeLive = (settings: TelemetrySettings, options: TelemetryOptions) =>
  Effect.gen(function* () {
    let enabled = true
    // Paths in stack traces name the user and, in Actions, the repository.
    const secrets = new Set([...settings.secrets.map(Redacted.value), homedir(), process.cwd()])
    const transport = makeTransport({
      fetch: options.fetch ?? globalThis.fetch,
      isEnabled: () => enabled,
      secrets: () => [...secrets],
      timeoutMs: REQUEST_TIMEOUT_MS,
    })
    const runtime = yield* Effect.runtime<never>()
    const shutdownMs = options.shutdownTimeoutMs ?? 3000

    // PostHog's client prints delivery failures to stderr, so it only ever
    // sees success: a failure is logged here at debug level instead, and a
    // flag request that fails reads as no flags, so the defaults apply.
    const debug = Runtime.runFork(runtime)
    const posthogFetch: NonNullable<PostHogOptions['fetch']> = async (url, request) => {
      const response = await transport(url, {
        method: request.method,
        headers: request.headers,
        ...(request.body === undefined ? {} : { body: request.body }),
      }).catch((error: unknown) => error)
      if (response instanceof Response && response.ok) return response
      debug(Effect.logDebug(`telemetry: ${request.method} ${url} failed`, response instanceof Response ? response.status : response))
      return new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } })
    }
    const client = yield* Effect.acquireRelease(
      Effect.sync(
        () =>
          new PostHog(Redacted.value(settings.key), {
            host: settings.host,
            fetch: posthogFetch,
            // Plain JSON bodies, so the transport can redact them.
            disableCompression: true,
            disableGeoip: true,
            flushAt: 20,
            flushInterval: 5000,
            requestTimeout: REQUEST_TIMEOUT_MS,
            featureFlagsRequestTimeoutMs: 3000,
            fetchRetryCount: 1,
            fetchRetryDelay: 500,
          }),
      ),
      (client) => Effect.ignore(Effect.tryPromise(() => client.shutdown(shutdownMs))),
    )

    // Flags come through OpenFeature; PostHog is only its provider.
    yield* quietly('registering the feature flag provider')(
      Effect.tryPromise(() => OpenFeature.setProviderAndWait(FLAG_DOMAIN, new PostHogServerProvider(client))),
      undefined,
    )
    const flags = OpenFeature.getClient(FLAG_DOMAIN)

    // Logs, traces and metrics go to PostHog over OTLP/JSON through the same transport.
    const otlpOptions = {
      resource: { serviceName: 'smartcloud', serviceVersion: options.version, attributes: { 'smartcloud.surface': options.surface } },
      headers: { authorization: `Bearer ${Redacted.value(settings.key)}` },
      shutdownTimeout: shutdownMs,
    }
    const http = Layer.mergeAll(
      FetchHttpClient.layer.pipe(Layer.provide(Layer.succeed(FetchHttpClient.Fetch, transport))),
      OtlpSerialization.layerJson,
    )
    const otlpLogger = yield* OtlpLogger.make({ ...otlpOptions, url: `${settings.host}/i/v1/logs`, excludeLogSpans: true }).pipe(Effect.provide(http))
    const otlp = Layer.mergeAll(
      OtlpTracer.layer({ ...otlpOptions, url: `${settings.host}/i/v1/traces` }),
      OtlpMetrics.layer({ ...otlpOptions, url: `${settings.host}/i/v1/metrics` }),
      // Everything the program logs goes to PostHog as well as the console.
      Logger.add(otlpLogger),
    ).pipe(Layer.provide(http))

    const base: Properties = { surface: options.surface, smartcloud_version: options.version }
    const identified = new Set<string>()

    const service: TelemetryService = {
      isEnabled: Effect.sync(() => enabled),
      disable: Effect.sync(() => {
        enabled = false
      }),
      protect: (value) =>
        Effect.sync(() => {
          secrets.add(value)
        }),
      capture: (identity, event, properties = {}) =>
        quietly('capturing an event')(
          Effect.sync(() => {
            if (!enabled) return
            if (!identified.has(identity.organization)) {
              identified.add(identity.organization)
              client.groupIdentify({ groupType: ORGANIZATION_GROUP, groupKey: identity.organization, distinctId: identity.distinctId })
            }
            client.capture({
              distinctId: identity.distinctId,
              event,
              properties: { ...base, ...properties },
              groups: { [ORGANIZATION_GROUP]: identity.organization },
            })
          }),
          undefined,
        ),
      captureException: (identity, error, properties = {}) =>
        quietly('capturing an exception')(
          Effect.sync(() => {
            if (!enabled) return
            client.captureException(error, identity.distinctId, {
              ...base,
              ...properties,
              $groups: { [ORGANIZATION_GROUP]: identity.organization },
            })
          }),
          undefined,
        ),
      log: (identity, level, message, properties = {}) =>
        Effect.suspend(() =>
          enabled
            ? Effect.logWithLevel(level, message).pipe(
                Effect.annotateLogs({ ...base, ...properties, posthogDistinctId: identity.distinctId }),
                // Only the OTLP logger, so nothing reaches stdout, which the MCP server's protocol owns.
                Effect.locally(FiberRef.currentLoggers, HashSet.make(otlpLogger)),
              )
            : Effect.void,
        ),
      evaluateFlag: (identity, key, fallback) =>
        Effect.suspend(() =>
          enabled
            ? quietly(`evaluating ${key}`)(
                Effect.tryPromise(() =>
                  flags.getBooleanValue(key, fallback, {
                    targetingKey: identity.distinctId,
                    groups: { [ORGANIZATION_GROUP]: identity.organization },
                  }),
                ).pipe(Effect.timeoutFail({ duration: REQUEST_TIMEOUT_MS, onTimeout: () => new Error('timed out') })),
                fallback,
              )
            : Effect.succeed(fallback),
        ),
    }

    return Layer.merge(Layer.succeed(Telemetry, service), otlp)
  })

/**
 * Telemetry for one smartcloud process: events and error tracking through
 * PostHog's client, logs, traces and metrics through OTLP, and feature flags
 * through OpenFeature.
 *
 * @remarks
 * When the environment turns telemetry off (see `telemetrySettings`), the
 * layer provides {@link disabledTelemetry} and builds nothing else, so
 * nothing is sent. Otherwise every request goes through one transport that
 * redacts it, and closing the layer flushes everything queued, within the
 * shutdown timeout, so a short CLI or action run still delivers its data.
 * The layer never fails: settings it cannot read turn telemetry off.
 *
 * @example
 * ```ts
 * program.pipe(Effect.provide(telemetryLayer({ surface: 'cli', version: VERSION })), NodeRuntime.runMain)
 * ```
 *
 * @param options - The surface, the version, and a `fetch` for tests.
 * @returns The layer.
 */
export const telemetryLayer = (options: TelemetryOptions): Layer.Layer<Telemetry> =>
  Layer.unwrapScoped(
    Effect.gen(function* () {
      const settings = yield* Effect.option(telemetrySettings)
      if (Option.isNone(settings) || !settings.value.enabled) return Layer.succeed(Telemetry, disabledTelemetry)
      return yield* makeLive(settings.value, options)
    }),
  )

/** The owner and name of a repository. */
export interface RepositoryName {
  readonly owner: string
  readonly repo: string
}

const withTelemetry = <A>(use: (telemetry: TelemetryService) => Effect.Effect<A>, fallback: A) =>
  Effect.flatMap(
    Effect.serviceOption(Telemetry),
    Option.match({ onNone: () => Effect.succeed(fallback), onSome: use }),
  )

/**
 * Turns telemetry off for the rest of the process, as a config's
 * `telemetry: false` asks.
 *
 * @example
 * ```ts
 * if (config.telemetry === false) yield* optOut
 * ```
 */
export const optOut: Effect.Effect<void> = withTelemetry((telemetry) => telemetry.disable, undefined)

/**
 * Evaluates a boolean feature flag for a repository.
 *
 * @example
 * ```ts
 * const on = yield* evaluateFlag({ owner, repo }, 'smartcloud-labels', true)
 * ```
 *
 * @param repository - The repository the flag is evaluated for.
 * @param key - The flag key.
 * @param fallback - The value when there is no telemetry, it is off, PostHog is unreachable or the flag is missing.
 * @returns The flag's value.
 */
export const evaluateFlag = (repository: RepositoryName, key: string, fallback: boolean): Effect.Effect<boolean> =>
  withTelemetry((telemetry) => telemetry.evaluateFlag(identify(repository), key, fallback), fallback)

/**
 * Records an error for a repository in error tracking, such as a feature that
 * failed while the run as a whole succeeded.
 *
 * @example
 * ```ts
 * yield* reportError(github.coordinates, new Error('labels failed'), { feature: 'labels' })
 * ```
 *
 * @param repository - The repository, hashed before it is sent.
 * @param error - The error; its message and stack are redacted before they are sent.
 * @param properties - Sent with it.
 * @returns Nothing; failing to report never fails the caller.
 */
export const reportError = (repository: RepositoryName, error: unknown, properties?: Properties): Effect.Effect<void> =>
  withTelemetry((telemetry) => telemetry.captureException(identify(repository), error, properties), undefined)

const runs = Metric.counter('smartcloud.runs', { description: 'smartcloud operations, by operation and outcome', incremental: true })
const durations = Metric.histogram(
  'smartcloud.duration_ms',
  MetricBoundaries.exponential({ start: 50, factor: 2, count: 12 }),
  'How long smartcloud operations take, in milliseconds',
)

/** What {@link track} records about an operation. */
export interface TrackOptions<A> {
  /** The operation, such as `run`; the event is `smartcloud <operation>` and the span `smartcloud.<operation>`. */
  readonly operation: string
  readonly repository: RepositoryName
  /** Sent with the event and on the span. */
  readonly properties?: Properties | undefined
  /** More properties from the result, when it succeeds. */
  readonly describe?: ((value: A) => Properties) | undefined
}

/**
 * Records an operation on a repository: a span around it, its logs linked to
 * the repository, a count and a duration, an event and a PostHog-only log
 * line with its outcome, and its failure or defect for error tracking.
 *
 * @remarks
 * The repository's full name is protected before anything is recorded, so
 * error messages that mention it are redacted. Without the {@link Telemetry}
 * service the effect runs unchanged. The effect's own result, failure or
 * interruption is returned as it was.
 *
 * @example
 * ```ts
 * track(runEvent(options), { operation: 'run', repository: github.coordinates, properties: { github_event: 'push' } })
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
          const identity = identify(options.repository)
          const properties = { operation: options.operation, ...options.properties }
          yield* telemetry.protect(`${options.repository.owner}/${options.repository.repo}`)
          const start = yield* Clock.currentTimeMillis
          const exit = yield* effect.pipe(
            Effect.withSpan(`smartcloud.${options.operation}`, { attributes: { ...properties, posthogDistinctId: identity.distinctId } }),
            Effect.annotateLogs({ posthogDistinctId: identity.distinctId }),
            Effect.exit,
          )
          const duration = (yield* Clock.currentTimeMillis) - start
          const outcome = Exit.isSuccess(exit) ? 'success' : Cause.isInterruptedOnly(exit.cause) ? 'interrupted' : 'failure'
          const tags = (metric: typeof runs) => metric.pipe(Metric.tagged('operation', options.operation), Metric.tagged('outcome', outcome))
          yield* Metric.increment(tags(runs))
          yield* Metric.update(durations.pipe(Metric.tagged('operation', options.operation)), duration)
          if (Exit.isFailure(exit) && outcome === 'failure') yield* telemetry.captureException(identity, Cause.squash(exit.cause), properties)
          const described = Exit.isSuccess(exit) && options.describe !== undefined ? options.describe(exit.value) : {}
          const summary = { ...properties, ...described, outcome, duration_ms: duration }
          yield* telemetry.capture(identity, `smartcloud ${options.operation}`, summary)
          yield* telemetry.log(identity, outcome === 'failure' ? LogLevel.Error : LogLevel.Info, `smartcloud ${options.operation}: ${outcome}`, summary)
          return yield* exit
        }),
    }),
  )
