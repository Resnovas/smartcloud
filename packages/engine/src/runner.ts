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
 * (CODE_OF_CONDUCT.md) and the Eventiva Cooperation Commitment
 * (COOPERATION_COMMITMENT.md).
 *
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE.
 */

import type { Facet, Subject } from '@resnovas/conditions'
import type { SmartcloudConfig } from '@resnovas/config'
import { GitHub, type GitHubError } from '@resnovas/integrations.github'
import { Cause, Effect, Exit } from 'effect'
import { decodeEvent, type Envelope, type EventDecodeError, type IssueEnvelope, type PullRequestEnvelope, type RepositoryEnvelope } from './events.js'
import { makeReport, Report, type ReportSnapshot } from './report.js'

/** The events a feature can act on. */
export type SupportedEnvelope = PullRequestEnvelope | IssueEnvelope | RepositoryEnvelope
export type EnvelopeKind = SupportedEnvelope['kind']

/** What a feature is given to act on. */
export interface FeatureContext {
  readonly config: SmartcloudConfig
  readonly envelope: SupportedEnvelope
  /** The pull request or issue, with every facet the run's features asked for loaded. */
  readonly subject?: Subject
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
}

/**
 * Loads the facets a run needs onto a pull request subject, concurrently.
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
      ],
      { concurrency: 'unbounded' },
    )
    return Object.assign({}, subject, ...parts)
  })

/**
 * Runs every applicable feature against one GitHub event.
 *
 * @remarks
 * Features that handle the event's kind and are enabled by the config run
 * with bounded concurrency, each isolated: one feature failing is recorded
 * and does not stop the others. Results are listed in the order the
 * features were given, whatever order they finished in. An unsupported
 * event is a clean no-op with a notice.
 *
 * @example
 * ```ts
 * const result = yield* runFeatures({ config, event: 'pull_request', payload, features: [labels, conventions] })
 * result.findings.filter((finding) => finding.level === 'error')
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
}): Effect.Effect<RunResult, EventDecodeError | GitHubError, GitHub> =>
  Effect.gen(function* () {
    const envelope = yield* decodeEvent(options.event, options.payload)
    const report = yield* makeReport
    if (envelope.kind === 'unsupported') {
      yield* report.add({ feature: 'engine', rule: 'unsupported-event', level: 'notice', message: envelope.reason })
      return { envelope, ran: [], skipped: [], failed: [], ...(yield* report.snapshot) }
    }

    const skipped: Array<{ feature: string; reason: string }> = []
    const applicable = options.features.filter((feature) => {
      if (!feature.handles.includes(envelope.kind)) {
        skipped.push({ feature: feature.name, reason: `does not handle ${envelope.kind} events` })
        return false
      }
      if (feature.enabled !== undefined && !feature.enabled(options.config)) {
        skipped.push({ feature: feature.name, reason: 'not configured' })
        return false
      }
      return true
    })

    const facets = new Set(applicable.flatMap((feature) => [...(feature.facets?.(options.config) ?? [])]))
    const subject = envelope.kind === 'repository' ? undefined : yield* loadFacets(envelope.subject, facets)
    const context: FeatureContext = subject === undefined ? { config: options.config, envelope } : { config: options.config, envelope, subject }

    const exits = yield* Effect.forEach(
      applicable,
      (feature) => Effect.exit(feature.run(context).pipe(Effect.provideService(Report, report))),
      { concurrency: options.concurrency ?? 4 },
    )
    const ran: Array<string> = []
    const failed: Array<{ feature: string; message: string }> = []
    exits.forEach((exit, index) => {
      const name = applicable[index]?.name ?? ''
      if (Exit.isSuccess(exit)) ran.push(name)
      else failed.push({ feature: name, message: Cause.pretty(exit.cause) })
    })
    return { envelope, ran, skipped, failed, ...(yield* report.snapshot) }
  })
