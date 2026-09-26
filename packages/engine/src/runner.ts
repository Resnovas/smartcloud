/**
 * @file packages/engine/src/runner.ts
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

import type { Facet, Subject } from '@resnovas/conditions'
import type { SmartcloudConfig } from '@resnovas/config'
import { GitHub, type GitHubError } from '@resnovas/integrations.github'
import { Cause, type Context, Duration, Effect, Exit, LogLevel, Metric, MetricBoundaries } from 'effect'
import { decodeEvent, type Envelope, type EventDecodeError, type IssueEnvelope, type PullRequestEnvelope, type RepositoryEnvelope } from './events.js'
import { makeReport, Report, type ReportSnapshot } from './report.js'

/** The events a feature can act on. */
export type SupportedEnvelope = PullRequestEnvelope | IssueEnvelope | RepositoryEnvelope
/** The kinds of event a feature can declare it handles. */
export type EnvelopeKind = SupportedEnvelope['kind']

/** What a feature is given to act on. */
export interface FeatureContext {
  readonly config: SmartcloudConfig
  readonly envelope: SupportedEnvelope
  /** The pull request or issue, with every facet the run's features asked for that could be loaded. */
  readonly subject?: Subject
  /** The check run of the Actions job running smartcloud, when the workflow passes it, so features reading a commit's checks can leave it out. */
  readonly checkRunId?: number
}

/**
 * A unit of smartcloud behaviour, such as labels or conventions.
 *
 * @remarks
 * A feature declares the events it handles and the facets its conditions
 * need, then records what it finds and changes through {@link Report}. It
 * must never throw: failures are typed errors, and the runner isolates them.
 */
export interface Feature {
  readonly name: string
  readonly handles: ReadonlyArray<EnvelopeKind>
  /** Whether the config asks for this feature at all. Defaults to always. */
  readonly enabled?: (config: SmartcloudConfig) => boolean
  /**
   * Runs only when the run was given the check run of the Actions job
   * running smartcloud, as a feature that waits on a commit's other checks
   * must be; skipped otherwise, such as in a CLI dry run.
   */
  readonly needsCheckRun?: boolean
  /** Facets the feature needs loaded on the subject. */
  readonly facets?: (config: SmartcloudConfig) => ReadonlySet<Facet>
  readonly run: (context: FeatureContext) => Effect.Effect<void, unknown, GitHub | Report>
}

/** The outcome of a run. */
export interface RunResult extends ReportSnapshot {
  readonly envelope: Envelope
  readonly ran: ReadonlyArray<string>
  readonly skipped: ReadonlyArray<{ readonly feature: string; readonly reason: string }>
  readonly failed: ReadonlyArray<{ readonly feature: string; readonly message: string }>
  /** How long each feature that ran or failed took, in milliseconds. */
  readonly durations: Readonly<Record<string, number>>
  /** What a restricted run left out of the config, as `ResolvedConfig.skipped` lists it; absent when nothing was. */
  readonly configSkipped?: ReadonlyArray<string>
}

/**
 * How long each feature takes, in milliseconds, tagged by `feature` and
 * `outcome` (`success` or `failure`).
 *
 * @example
 * ```ts
 * import { featureDuration } from '@resnovas/engine'
 * import { Effect, Metric } from 'effect'
 *
 * const runs = Effect.map(Metric.value(Metric.tagged(featureDuration, 'feature', 'labels')), (state) => state.count)
 * ```
 */
export const featureDuration = Metric.histogram(
  'smartcloud.feature.duration_ms',
  MetricBoundaries.exponential({ start: 10, factor: 2, count: 12 }),
  'How long each smartcloud feature takes, in milliseconds, by feature and outcome',
)

/**
 * Loads the facets a run needs onto a pull request subject, concurrently.
 *
 * @remarks
 * Traced as `smartcloud.engine.loadFacets`, with the subject's kind and the
 * facets asked for.
 *
 * @example
 * ```ts
 * import type { Subject } from '@resnovas/conditions'
 * import { loadFacets } from '@resnovas/engine'
 *
 * declare const pullRequest: Subject
 * const withFiles = loadFacets(pullRequest, new Set(['files', 'reviews'] as const))
 * ```
 *
 * @param subject - The pull request.
 * @param facets - The facets to load.
 * @returns The subject with those facets filled in.
 */
export const loadFacets = (subject: Subject, facets: ReadonlySet<Facet>): Effect.Effect<Subject, GitHubError, GitHub> =>
  Effect.gen(function* () {
    if (subject.kind !== 'pullRequest' || facets.size === 0) return subject
    const github = yield* GitHub
    const load = <A>(facet: Facet, read: (number: number) => Effect.Effect<A, GitHubError>) =>
      facets.has(facet) ? Effect.map(read(subject.number), (value) => ({ [facet]: value })) : Effect.succeed({})
    const parts = yield* Effect.all(
      [
        load('files', github.listFiles),
        load('reviews', github.listReviews),
        load('pendingReviewers', github.countRequestedReviewers),
        load('commits', github.listCommits),
        load('mergeable', github.getMergeable),
      ],
      { concurrency: 'unbounded' },
    )
    return Object.assign({}, subject, ...parts)
  }).pipe(Effect.withSpan('smartcloud.engine.loadFacets', { captureStackTrace: false, attributes: { 'subject.kind': subject.kind, facets: [...facets] } }))

type Outcome = { readonly feature: string; readonly failure: string | undefined; readonly duration: number }

// One span per feature, with its duration recorded and its outcome logged.
// Failure reasons can quote repository names, so only the outcome is recorded.
const instrument = <R>(
  feature: Feature,
  kind: EnvelopeKind,
  report: Context.Tag.Service<Report>,
  attempt: Effect.Effect<Omit<Outcome, 'duration'>, never, R>,
): Effect.Effect<Outcome, never, R> =>
  attempt.pipe(
    Effect.timed,
    Effect.tap(([elapsed, outcome]) =>
      Effect.gen(function* () {
        const result = outcome.failure === undefined ? 'success' : 'failure'
        const milliseconds = Math.round(Duration.toMillis(elapsed))
        const { findings, changes } = yield* report.snapshot
        const found = findings.filter((finding) => finding.feature === feature.name).length
        const changed = changes.filter((change) => change.feature === feature.name).length
        yield* Effect.annotateCurrentSpan({ outcome: result, findings: found, changes: changed })
        yield* Metric.update(Metric.tagged(Metric.tagged(featureDuration, 'feature', feature.name), 'outcome', result), milliseconds)
        yield* Effect.logWithLevel(
          result === 'success' ? LogLevel.Info : LogLevel.Warning,
          `${feature.name}: ${result} in ${milliseconds} ms, ${found} finding(s), ${changed} change(s)`,
        ).pipe(Effect.annotateLogs({ outcome: result, findings: found, changes: changed, duration_ms: milliseconds }))
      }),
    ),
    Effect.map(([elapsed, outcome]) => ({ ...outcome, duration: Math.round(Duration.toMillis(elapsed)) })),
    Effect.annotateLogs({ feature: feature.name }),
    Effect.withSpan(`smartcloud.feature.${feature.name}`, { captureStackTrace: false, attributes: { feature: feature.name, 'event.kind': kind } }),
  )

/**
 * Runs every applicable feature against one GitHub event.
 *
 * @remarks
 * Features that are not turned off, handle the event's kind, are enabled by the config and,
 * when they need it, were given the job's check run, run
 * with bounded concurrency, each isolated: one feature failing is recorded
 * and does not stop the others. Each facet is loaded on its own, so a facet
 * GitHub cannot serve fails only the features that need it, which are
 * recorded as failed without running. Interrupting the run interrupts the
 * features rather than recording them as failed. Results are listed in the order the
 * features were given, whatever order they finished in. An unsupported
 * event is a clean no-op with a notice.
 *
 * The run is traced as `smartcloud.engine.runFeatures` and each feature as
 * `smartcloud.feature.<name>`, with its duration in
 * {@link featureDuration}. Spans and logs carry only feature names, the
 * event, counts and outcomes, never what the event is about.
 *
 * @example
 * ```ts
 * import { type Feature, runFeatures } from '@resnovas/engine'
 * import { Effect } from 'effect'
 *
 * declare const features: ReadonlyArray<Feature>
 * const errors = runFeatures({ config: { version: 2 }, event: 'schedule', payload: {}, features }).pipe(
 *   Effect.map((result) => result.findings.filter((finding) => finding.level === 'error')),
 * )
 * ```
 *
 * @param options - The config, the event and the features to run.
 * @returns What ran, what was skipped and why, what failed, and the report.
 */
export const runFeatures = (options: {
  readonly config: SmartcloudConfig
  readonly event: string
  readonly payload: unknown
  readonly features: ReadonlyArray<Feature>
  readonly concurrency?: number
  /** Features switched off from outside the config, such as by a feature flag, and why. */
  readonly turnedOff?: ReadonlyMap<string, string>
  /** The check run of the Actions job running smartcloud, passed on to the features. */
  readonly checkRunId?: number | undefined
  /**
   * Whether a feature that needs the job's check run fails the run without
   * one, as in an Actions job whose workflow does not pass it, rather than
   * being skipped, as in a CLI dry run.
   */
  readonly checkRunRequired?: boolean | undefined
}): Effect.Effect<RunResult, EventDecodeError, GitHub> =>
  Effect.gen(function* () {
    const envelope = yield* decodeEvent(options.event, options.payload)
    yield* Effect.annotateCurrentSpan('event.kind', envelope.kind)
    const report = yield* makeReport
    if (envelope.kind === 'unsupported') {
      yield* report.add({ feature: 'engine', rule: 'unsupported-event', level: 'notice', message: envelope.reason })
      return { envelope, ran: [], skipped: [], failed: [], durations: {}, ...(yield* report.snapshot) }
    }

    const skipped: Array<{ feature: string; reason: string }> = []
    const missingCheckRun: Array<string> = []
    const applicable = options.features.filter((feature) => {
      const turnedOff = options.turnedOff?.get(feature.name)
      if (turnedOff !== undefined) {
        skipped.push({ feature: feature.name, reason: turnedOff })
        return false
      }
      if (!feature.handles.includes(envelope.kind)) {
        skipped.push({ feature: feature.name, reason: `does not handle ${envelope.kind} events` })
        return false
      }
      if (feature.enabled !== undefined && !feature.enabled(options.config)) {
        skipped.push({ feature: feature.name, reason: 'not configured' })
        return false
      }
      if (feature.needsCheckRun === true && options.checkRunId === undefined) {
        skipped.push({ feature: feature.name, reason: 'runs only in a job that passes checkRunId' })
        if (options.checkRunRequired === true) missingCheckRun.push(feature.name)
        return false
      }
      return true
    })
    // A configured feature the workflow cannot run fails closed, so its check never passes unchecked.
    for (const feature of missingCheckRun) {
      yield* report.add({
        feature,
        rule: `${feature}.check-run-missing`,
        level: 'error',
        message: `${feature} is configured but the workflow does not pass checkRunId: \${{ job.check_run_id }}, so it could not run. Update the workflow.`,
      })
    }
    for (const skip of skipped) yield* Effect.logDebug(`${skip.feature}: skipped, ${skip.reason}`).pipe(Effect.annotateLogs({ feature: skip.feature }))

    const needs = (feature: Feature) => feature.facets?.(options.config) ?? new Set<Facet>()
    const facets = [...new Set(applicable.flatMap((feature) => [...needs(feature)]))]
    const base = envelope.kind === 'repository' ? undefined : envelope.subject
    // One exit per facet, so a failed read costs only the features that need it.
    const loads =
      base === undefined
        ? []
        : yield* Effect.forEach(facets, (facet) => Effect.exit(loadFacets(base, new Set([facet]))), { concurrency: 'unbounded' })
    const unavailable = new Map<Facet, string>()
    const loaded: Array<Subject> = []
    loads.forEach((exit, index) => {
      const facet = facets[index]
      if (Exit.isSuccess(exit)) loaded.push(exit.value)
      else if (facet !== undefined) unavailable.set(facet, Cause.pretty(exit.cause))
    })
    const subject = base === undefined ? undefined : Object.assign({}, base, ...loaded)
    const context: FeatureContext = {
      config: options.config,
      envelope,
      ...(subject === undefined ? {} : { subject }),
      ...(options.checkRunId === undefined ? {} : { checkRunId: options.checkRunId }),
    }

    const outcomes = yield* Effect.forEach(
      applicable,
      (feature) => {
        const missing = [...needs(feature)].flatMap((facet) => {
          const reason = unavailable.get(facet)
          return reason === undefined ? [] : [`could not load ${facet}: ${reason}`]
        })
        // Effect.exit would turn an interruption into an ordinary failure, so
        // only failures and defects are caught; interrupting the run stops it.
        const attempt: Effect.Effect<Omit<Outcome, 'duration'>, never, GitHub> = missing.length > 0
          ? Effect.succeed({ feature: feature.name, failure: missing.join('\n') })
          : feature.run(context).pipe(
              Effect.provideService(Report, report),
              Effect.as({ feature: feature.name, failure: undefined }),
              Effect.catchAllCause((cause) =>
                Cause.isInterruptedOnly(cause)
                  ? Effect.interrupt
                  : Effect.succeed({ feature: feature.name, failure: Cause.pretty(cause) }),
              ),
            )
        return instrument(feature, envelope.kind, report, attempt)
      },
      { concurrency: options.concurrency ?? 4 },
    )
    const ran: Array<string> = []
    const failed: Array<{ feature: string; message: string }> = []
    const durations: Record<string, number> = {}
    for (const outcome of outcomes) {
      durations[outcome.feature] = outcome.duration
      if (outcome.failure === undefined) ran.push(outcome.feature)
      else failed.push({ feature: outcome.feature, message: outcome.failure })
    }
    const snapshot = yield* report.snapshot
    const counts = { ran: ran.length, skipped: skipped.length, failed: failed.length, findings: snapshot.findings.length }
    yield* Effect.annotateCurrentSpan(counts)
    yield* Effect.logInfo(
      `engine: ${counts.ran} ran, ${counts.skipped} skipped, ${counts.failed} failed, ${counts.findings} finding(s)`,
    ).pipe(Effect.annotateLogs(counts))
    return { envelope, ran, skipped, failed, durations, ...snapshot }
  }).pipe(
    Effect.annotateLogs({ github_event: options.event }),
    Effect.withSpan('smartcloud.engine.runFeatures', {
      captureStackTrace: false,
      attributes: { github_event: options.event },
    }),
  )
