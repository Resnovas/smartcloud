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
 * (CODE_OF_CONDUCT.md) and the Cooperation Commitment (COOPERATION_COMMITMENT.md).
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
import {
  Context,
  Effect,
  FiberRef,
  FiberRefs,
  HashMap,
  HashSet,
  Layer,
  Logger,
  LogLevel,
  Option,
  Redacted,
  Runtime,
  type Tracer,
} from 'effect'
import { telemetrySettings, type TelemetrySettings } from './config.js'
import { identify, ORGANIZATION_GROUP, type Identity, type Surface } from './identity.js'
import { makeTransport, type Fetch } from './transport.js'

/** A property value telemetry may send: text, a number, a flag, a list of names, or counts by name. */
export type PropertyValue = string | number | boolean | ReadonlyArray<string> | Readonly<Record<string, number>>

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
  /**
   * Records an event. For a repository it also sets the person's
   * `smartcloud_version` and `last_surface`; for an anonymous identity it
   * creates no person.
   */
  readonly capture: (identity: Identity, event: string, properties?: Properties) => Effect.Effect<void>
  /** Records an error for error tracking. */
  readonly captureException: (identity: Identity, error: unknown, properties?: Properties) => Effect.Effect<void>
  /** Sets properties on the identity's `organization` group; does nothing for an anonymous identity. */
  readonly describeOrganization: (identity: Identity, properties: Properties) => Effect.Effect<void>
  /** Writes a log line to PostHog Logs only, never to the console, linked to the repository. */
  readonly log: (identity: Identity, level: LogLevel.LogLevel, message: string, properties?: Properties) => Effect.Effect<void>
  /**
   * Evaluates a boolean feature flag through OpenFeature.
   *
   * @returns The flag, or `fallback` when telemetry is off, PostHog cannot be reached or the flag does not exist.
   */
  readonly evaluateFlag: (identity: Identity, key: string, fallback: boolean) => Effect.Effect<boolean>
}

/**
 * The telemetry service. Absent, or disabled, it sends nothing.
 *
 * @example
 * ```ts import.meta.vitest name="Telemetry"
 * import { Effect } from 'effect'
 * import { disabledTelemetry, Telemetry } from '@resnovas/integrations.posthog'
 *
 * const enabled = Effect.flatMap(Telemetry, (telemetry) => telemetry.isEnabled)
 * Effect.runSync(enabled.pipe(Effect.provideService(Telemetry, disabledTelemetry))) // => false
 * ```
 */
export class Telemetry extends Context.Tag('@resnovas/integrations.posthog/Telemetry')<Telemetry, TelemetryService>() {}

/**
 * Telemetry that sends nothing, as used when it is turned off.
 *
 * @example
 * ```ts import.meta.vitest name="disabledTelemetry"
 * import { Effect } from 'effect'
 * import { disabledTelemetry, evaluateFlag, Telemetry } from '@resnovas/integrations.posthog'
 *
 * const flag = evaluateFlag({ owner: 'Resnovas', repo: 'smartcloud' }, 'smartcloud-labels', true)
 * Effect.runSync(flag.pipe(Effect.provideService(Telemetry, disabledTelemetry))) // => true
 * ```
 */
export const disabledTelemetry: TelemetryService = {
  isEnabled: Effect.succeed(false),
  disable: Effect.void,
  protect: () => Effect.void,
  capture: () => Effect.void,
  captureException: () => Effect.void,
  describeOrganization: () => Effect.void,
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

/**
 * What telemetry knows about the invocation a fiber belongs to.
 *
 * @internal
 */
export interface InvocationState {
  /** Who the invocation is about: anonymous until a repository is bound. */
  identity: Identity
  /** The invocation's span, which is given the identity once it is known. */
  span: Option.Option<Tracer.Span>
  /** The names of the options given, which may be added to once they are read. */
  readonly options: Set<string>
}

/**
 * The invocation the current fiber belongs to, if any. Set by `invocation`
 * and read by the loggers, so every diagnostic log is linked to it.
 *
 * @internal
 *
 * @example
 * ```ts
 * import { Effect, FiberRef } from 'effect'
 * import { currentInvocation } from './telemetry.js'
 *
 * const inside = Effect.map(FiberRef.get(currentInvocation), (state) => state._tag === 'Some')
 * ```
 */
export const currentInvocation: FiberRef.FiberRef<Option.Option<InvocationState>> = FiberRef.unsafeMake<
  Option.Option<InvocationState>
>(Option.none())

// Adds the invocation's distinct id to a log line, so logs link to the
// repository's person in PostHog however deep they were written.
const linkedToInvocation = <O>(logger: Logger.Logger<unknown, O>): Logger.Logger<unknown, O> =>
  Logger.mapInputOptions(logger, (options) =>
    Option.match(FiberRefs.getOrDefault(options.context, currentInvocation), {
      onNone: () => options,
      onSome: (state) => ({
        ...options,
        annotations: HashMap.set(options.annotations, 'posthogDistinctId', state.identity.distinctId),
      }),
    }),
  )

// Every logger that writes to the console is dropped, whichever the runtime
// installed (the default logger, or the pretty logger NodeRuntime.runMain
// adds), and only the tracer's span-event logger and the given ones remain.
const onlyLoggers = (loggers: ReadonlyArray<Logger.Logger<unknown, unknown>>) =>
  Layer.scopedDiscard(
    Effect.locallyScopedWith(FiberRef.currentLoggers, (current) =>
      HashSet.union(
        HashSet.filter(current, (logger) => logger === Logger.tracerLogger),
        HashSet.fromIterable(loggers),
      ),
    ),
  )

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
    const otlpLogger = linkedToInvocation(
      yield* OtlpLogger.make({ ...otlpOptions, url: `${settings.host}/i/v1/logs`, excludeLogSpans: true }).pipe(
        Effect.provide(http),
      ),
    )
    const otlp = Layer.mergeAll(
      OtlpTracer.layer({ ...otlpOptions, url: `${settings.host}/i/v1/traces` }),
      OtlpMetrics.layer({ ...otlpOptions, url: `${settings.host}/i/v1/metrics` }),
      // Diagnostic logs, debug level included, go to PostHog only: the
      // console belongs to each surface's own output and the MCP protocol.
      onlyLoggers([otlpLogger]),
      Logger.minimumLogLevel(LogLevel.Debug),
    ).pipe(Layer.provide(http))

    const base: Properties = { surface: options.surface, smartcloud_version: options.version }
    // Set on the repository's person with every event it sends.
    const person = { smartcloud_version: options.version, last_surface: options.surface }
    const identified = new Set<string>()
    // PostHog creates no person for an anonymous identity's events.
    const about = (identity: Identity) =>
      identity.organization === undefined
        ? { properties: { $process_person_profile: false }, groups: {} }
        : { properties: { $set: person }, groups: { [ORGANIZATION_GROUP]: identity.organization } }

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
            if (identity.organization !== undefined && !identified.has(identity.organization)) {
              identified.add(identity.organization)
              client.groupIdentify({ groupType: ORGANIZATION_GROUP, groupKey: identity.organization, distinctId: identity.distinctId })
            }
            const { properties: extra, groups } = about(identity)
            client.capture({
              distinctId: identity.distinctId,
              event,
              properties: { ...base, ...properties, ...extra },
              groups,
            })
          }),
          undefined,
        ),
      captureException: (identity, error, properties = {}) =>
        quietly('capturing an exception')(
          Effect.sync(() => {
            if (!enabled) return
            const { properties: extra, groups } = about(identity)
            client.captureException(error, identity.distinctId, { ...base, ...properties, ...extra, $groups: groups })
          }),
          undefined,
        ),
      describeOrganization: (identity, properties) =>
        quietly('describing an organisation')(
          Effect.sync(() => {
            if (!enabled || identity.organization === undefined) return
            identified.add(identity.organization)
            client.groupIdentify({
              groupType: ORGANIZATION_GROUP,
              groupKey: identity.organization,
              distinctId: identity.distinctId,
              properties,
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
                    ...(identity.organization === undefined
                      ? {}
                      : { groups: { [ORGANIZATION_GROUP]: identity.organization } }),
                  }),
                ).pipe(Effect.timeout(REQUEST_TIMEOUT_MS)),
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
 * Diagnostic logs (`Effect.log*`) never reach the console: with telemetry
 * on they go to PostHog Logs from debug level up, and with it off they are
 * dropped, so a surface's output is only what it prints itself. Every
 * console logger is removed, including the pretty logger that
 * `NodeRuntime.runMain` installs.
 *
 * @example
 * ```ts
 * import { Effect } from 'effect'
 * import { telemetryLayer, track } from '@resnovas/integrations.posthog'
 *
 * const run = track(Effect.succeed('done'), { operation: 'run', repository: { owner: 'Resnovas', repo: 'smartcloud' } })
 * const main = run.pipe(Effect.provide(telemetryLayer({ surface: 'cli', version: '2.0.0' })))
 * ```
 *
 * @param options - The surface, the version, and a `fetch` for tests.
 * @returns The layer.
 */
export const telemetryLayer = (options: TelemetryOptions): Layer.Layer<Telemetry> =>
  Layer.unwrapScoped(
    Effect.gen(function* () {
      const settings = yield* Effect.option(telemetrySettings)
      // With telemetry off, diagnostic logs go nowhere rather than to the console.
      if (Option.isNone(settings) || !settings.value.enabled)
        return Layer.merge(Layer.succeed(Telemetry, disabledTelemetry), onlyLoggers([]))
      return yield* makeLive(settings.value, options)
    }),
  )

/** The owner and name of a repository. */
export interface RepositoryName {
  readonly owner: string
  readonly repo: string
}

/**
 * Uses the telemetry service when it is provided, and returns the fallback
 * when it is not.
 *
 * @internal
 *
 * @example
 * ```ts
 * import { Effect } from 'effect'
 * import { withTelemetry } from './telemetry.js'
 *
 * const enabled = withTelemetry((telemetry) => telemetry.isEnabled, false)
 * ```
 *
 * @param use - What to do with the service.
 * @param fallback - The result without it.
 * @returns The result.
 */
export const withTelemetry = <A>(
  use: (telemetry: TelemetryService) => Effect.Effect<A>,
  fallback: A,
): Effect.Effect<A> =>
  Effect.flatMap(Effect.serviceOption(Telemetry), Option.match({ onNone: () => Effect.succeed(fallback), onSome: use }))

/**
 * Turns telemetry off for the rest of the process, as a config's
 * `telemetry: false` asks.
 *
 * @example
 * ```ts import.meta.vitest name="optOut"
 * import { Effect } from 'effect'
 * import { disabledTelemetry, optOut, Telemetry } from '@resnovas/integrations.posthog'
 *
 * Effect.runSync(optOut.pipe(Effect.provideService(Telemetry, disabledTelemetry)))
 * ```
 */
export const optOut: Effect.Effect<void> = withTelemetry((telemetry) => telemetry.disable, undefined)

/**
 * Evaluates a boolean feature flag for a repository.
 *
 * @example
 * ```ts import.meta.vitest name="evaluateFlag"
 * import { Effect } from 'effect'
 * import { evaluateFlag } from '@resnovas/integrations.posthog'
 *
 * // Without the Telemetry service the fallback is the answer.
 * Effect.runSync(evaluateFlag({ owner: 'Resnovas', repo: 'smartcloud' }, 'smartcloud-labels', false)) // => false
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
 * ```ts import.meta.vitest name="reportError"
 * import { Effect } from 'effect'
 * import { reportError } from '@resnovas/integrations.posthog'
 *
 * Effect.runSync(reportError({ owner: 'Resnovas', repo: 'smartcloud' }, new Error('labels failed'), { feature: 'labels' }))
 * ```
 *
 * @param repository - The repository, hashed before it is sent.
 * @param error - The error; its message and stack are redacted before they are sent.
 * @param properties - Sent with it.
 * @returns Nothing; failing to report never fails the caller.
 */
export const reportError = (repository: RepositoryName, error: unknown, properties?: Properties): Effect.Effect<void> =>
  withTelemetry((telemetry) => telemetry.captureException(identify(repository), error, properties), undefined)
