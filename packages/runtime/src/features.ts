/**
 * @file packages/runtime/src/features.ts
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

import type { SmartcloudConfig } from '@resnovas/config'
import { type Feature, runFeatures } from '@resnovas/engine'
import { autoMergeFeature } from '@resnovas/feature.automerge'
import { backport } from '@resnovas/feature.backport'
import { branchesFeature } from '@resnovas/feature.branches'
import { codeownersFeature } from '@resnovas/feature.codeowners'
import { makeCommandsFeature, type Runner } from '@resnovas/feature.commands'
import { commitsFeature } from '@resnovas/feature.commits'
import { conventions } from '@resnovas/feature.conventions'
import { disclosureFeature } from '@resnovas/feature.disclosure'
import { freezeFeature } from '@resnovas/feature.freeze'
import { labels } from '@resnovas/feature.labels'
import { lock } from '@resnovas/feature.lock'
import { requiredFeature } from '@resnovas/feature.required'
import { reviewsFeature } from '@resnovas/feature.reviews'
import { settingsFeature } from '@resnovas/feature.settings'
import { stale } from '@resnovas/feature.stale'
import { syncFeature } from '@resnovas/feature.sync'
import { FetchHttpClient } from '@effect/platform'
import { DryRunLog, GitHub } from '@resnovas/integrations.github'
import { notify } from '@resnovas/notifications'
import { publishReport } from '@resnovas/reporting'
import { Data, Effect, Option } from 'effect'
import { turnedOffFeatures } from './flags.js'

// What /run uses: the other features, run on the event the command builds
// and published as their own run would be, feature flags included.
const runner: Runner = {
  get features() {
    return FEATURES
  },
  run: (request) =>
    Effect.gen(function* () {
      const github = yield* GitHub
      const features = FEATURES.filter((feature) => request.features.includes(feature.name))
      const turnedOff = yield* turnedOffFeatures(github.coordinates, features)
      const result = yield* runFeatures({
        config: request.config,
        event: request.event.name,
        payload: request.event.payload,
        features,
        turnedOff,
      })
      const published = yield* publishReport(result, { trustedAuthors: request.config.roles?.trustedBots ?? [] })
      // Notified as an ordinary event run would be, so a rerun's failures reach
      // the configured channels too.
      yield* notify(result, request.config.notifications, {
        repository: `${github.coordinates.owner}/${github.coordinates.repo}`,
        dryRun: Option.isSome(yield* Effect.serviceOption(DryRunLog)),
        unchanged: published.comment === 'unchanged',
      }).pipe(Effect.provide(FetchHttpClient.layer))
      return result
    }),
}

/**
 * Every feature smartcloud can run, in the order their results are reported.
 *
 * @example
 * ```ts import.meta.vitest name="FEATURES"
 * import { FEATURES } from '@resnovas/runtime'
 *
 * FEATURES[0]?.name // => 'conventions'
 * ```
 */
export const FEATURES: ReadonlyArray<Feature> = [
  conventions,
  commitsFeature,
  disclosureFeature,
  reviewsFeature,
  labels,
  stale,
  settingsFeature,
  syncFeature,
  requiredFeature,
  freezeFeature,
  branchesFeature,
  codeownersFeature,
  lock,
  backport,
  autoMergeFeature,
  makeCommandsFeature({ runner }),
]

/** A top-level config section a feature can read. */
export type SectionKey = Exclude<keyof typeof SmartcloudConfig.Encoded, 'version' | 'extends' | '$schema'>

/**
 * The config sections each feature reads.
 *
 * @internal
 */
export const FEATURE_SECTIONS: ReadonlyMap<string, ReadonlyArray<SectionKey>> = new Map<
  string,
  ReadonlyArray<SectionKey>
>([
  ['conventions', ['conventions']],
  ['commits', ['commits']],
  ['disclosure', ['disclosure']],
  ['reviews', ['reviews', 'roles']],
  ['labels', ['labels', 'labelSync', 'labelling', 'sizeLabels']],
  ['stale', ['stale']],
  ['settings', ['settings', 'roles']],
  ['sync', ['sync']],
  ['required', ['required']],
  ['freeze', ['freeze']],
  ['branches', ['branches']],
  ['codeowners', ['codeowners']],
  ['lock', ['lock', 'roles']],
  ['backport', ['backport', 'roles']],
  ['automerge', ['autoMerge', 'roles']],
  ['commands', ['commands']],
])

/**
 * A feature was asked for by a name that does not exist.
 *
 * @example
 * ```ts import.meta.vitest name="UnknownFeatures"
 * import { UnknownFeatures } from '@resnovas/runtime'
 *
 * new UnknownFeatures({ names: ['nope'] }).message.startsWith('unknown feature(s): nope;') // => true
 * ```
 */
export class UnknownFeatures extends Data.TaggedError('UnknownFeatures')<{ readonly names: ReadonlyArray<string> }> {
  override get message() {
    return `unknown feature(s): ${this.names.join(', ')}; expected some of ${FEATURES.map((feature) => feature.name).join(', ')}`
  }
}

/**
 * Splits a comma-separated feature list, as the action input and the CLI
 * flag give it.
 *
 * @example
 * ```ts import.meta.vitest name="parseFeatureList"
 * import { parseFeatureList } from '@resnovas/runtime'
 *
 * parseFeatureList(' labels, stale,,').join('|') // => 'labels|stale'
 * ```
 *
 * @param list - For example `labels, stale`.
 * @returns The names, trimmed, with empty entries dropped.
 */
export const parseFeatureList = (list: string): ReadonlyArray<string> =>
  list
    .split(',')
    .map((name) => name.trim())
    .filter((name) => name !== '')

/**
 * Picks the features to run.
 *
 * @example
 * ```ts import.meta.vitest name="selectFeatures"
 * import { selectFeatures } from '@resnovas/runtime'
 * import { Effect } from 'effect'
 *
 * Effect.runSync(selectFeatures(['stale', 'labels'])).map((feature) => feature.name).join(',') // => 'labels,stale'
 * Effect.runSync(Effect.flip(selectFeatures(['nope'])))._tag // => 'UnknownFeatures'
 * ```
 *
 * @param names - The features asked for; every feature when omitted.
 * @returns The features in reporting order, or the names that do not exist.
 */
export const selectFeatures = (
  names: ReadonlyArray<string> | undefined,
): Effect.Effect<ReadonlyArray<Feature>, UnknownFeatures> => {
  if (names === undefined) return Effect.succeed(FEATURES)
  const unknown = names.filter((name) => !FEATURES.some((feature) => feature.name === name))
  return unknown.length > 0
    ? Effect.fail(new UnknownFeatures({ names: unknown }))
    : Effect.succeed(FEATURES.filter((feature) => names.includes(feature.name)))
}
