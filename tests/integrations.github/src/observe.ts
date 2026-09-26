/**
 * @file tests/integrations.github/src/observe.ts
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

// Captures the spans and logs an effect produces, so tests can assert what
// telemetry would receive without sending anything.

import { Effect, HashMap, Logger, LogLevel, Tracer } from 'effect'

/** A log line as a logger received it. */
export interface CapturedLog {
  readonly message: string
  readonly level: string
  readonly annotations: Readonly<Record<string, unknown>>
}

/** What an effect sent to the tracer and the loggers. */
export interface Observed<A> {
  readonly value: A
  readonly spans: ReadonlyArray<Tracer.Span>
  readonly logs: ReadonlyArray<CapturedLog>
}

const text = (message: unknown): string => (Array.isArray(message) ? message.map(String).join(' ') : String(message))

/**
 * Runs an effect with a recording tracer and logger, debug level included.
 *
 * @param effect - The effect to observe.
 * @returns Its value, every span it started and every line it logged.
 */
export const observe = <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<Observed<A>, E, R> =>
  Effect.gen(function* () {
    const spans: Array<Tracer.Span> = []
    const logs: Array<CapturedLog> = []
    const native = yield* Effect.tracer
    const tracer = Tracer.make({
      span: (...args) => {
        const span = native.span(...args)
        spans.push(span)
        return span
      },
      context: (f, fiber) => native.context(f, fiber),
    })
    const logger = Logger.make(({ message, logLevel, annotations }) => {
      logs.push({ message: text(message), level: logLevel.label, annotations: Object.fromEntries(HashMap.toEntries(annotations)) })
    })
    const value = yield* effect.pipe(Effect.withTracer(tracer), Logger.withMinimumLogLevel(LogLevel.Debug), Effect.provide(Logger.add(logger)))
    return { value, spans, logs }
  })

/**
 * Every string telemetry would carry: span names and attributes, log
 * messages and annotations.
 *
 * @param observed - What was captured.
 * @returns The strings, for checking that nothing sensitive is among them.
 */
export const carried = (observed: Observed<unknown>): ReadonlyArray<string> => [
  ...observed.spans.flatMap((span) => [span.name, ...[...span.attributes.values()].map((value) => JSON.stringify(value))]),
  ...observed.logs.flatMap((log) => [log.message, JSON.stringify(log.annotations)]),
]

/**
 * The span with a name.
 *
 * @param observed - What was captured.
 * @param name - The span's name.
 * @returns The first span with that name; the test fails when there is none.
 */
export const spanNamed = (observed: Observed<unknown>, name: string): Tracer.Span => {
  const span = observed.spans.find((candidate) => candidate.name === name)
  if (span === undefined) throw new Error(`no span named ${name}; saw ${observed.spans.map((candidate) => candidate.name).join(', ')}`)
  return span
}
