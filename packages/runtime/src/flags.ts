/**
 * @file packages/runtime/src/flags.ts
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

import type { Feature } from '@resnovas/engine'
import { evaluateFlag, type RepositoryName } from '@resnovas/integrations.posthog'
import { Effect } from 'effect'

/**
 * Every feature flag smartcloud evaluates, with the value the code uses when
 * PostHog cannot answer.
 *
 * @remarks
 * This map is the only place a flag default lives. A default applies when
 * telemetry is off, PostHog is unreachable or the flag does not exist, so
 * opting out of telemetry never changes what smartcloud does. Each flag is
 * named `smartcloud-<feature>` and turns that whole feature on or off.
 *
 * @example
 * ```ts import.meta.vitest name="FEATURE_FLAGS"
 * import { FEATURE_FLAGS } from '@resnovas/runtime'
 *
 * FEATURE_FLAGS['smartcloud-labels'] // => true
 * ```
 */
export const FEATURE_FLAGS = {
  'smartcloud-conventions': true,
  'smartcloud-commits': true,
  'smartcloud-disclosure': true,
  'smartcloud-reviews': true,
  'smartcloud-labels': true,
  'smartcloud-stale': true,
  'smartcloud-settings': true,
  'smartcloud-sync': true,
  'smartcloud-required': true,
  'smartcloud-freeze': true,
} as const satisfies Readonly<Record<string, boolean>>

/** A feature flag smartcloud evaluates. */
export type FeatureFlag = keyof typeof FEATURE_FLAGS

const isFeatureFlag = (key: string): key is FeatureFlag => Object.hasOwn(FEATURE_FLAGS, key)

/**
 * The flag that turns a feature on or off.
 *
 * @example
 * ```ts import.meta.vitest name="flagFor"
 * import { flagFor } from '@resnovas/runtime'
 *
 * flagFor('labels') // => 'smartcloud-labels'
 * ```
 *
 * @param feature - The feature's name, such as `labels`.
 * @returns Its flag key, such as `smartcloud-labels`.
 */
export const flagFor = (feature: string): string => `smartcloud-${feature}`

/**
 * Evaluates a feature flag for a repository.
 *
 * @example
 * ```ts import.meta.vitest name="featureEnabled"
 * import { featureEnabled } from '@resnovas/runtime'
 * import { Effect } from 'effect'
 *
 * // Without the Telemetry service every flag keeps its default.
 * Effect.runSync(featureEnabled({ owner: 'Resnovas', repo: 'smartcloud' }, 'smartcloud-labels')) // => true
 * ```
 *
 * @param repository - The repository the flag is evaluated for, hashed before it is sent.
 * @param flag - The flag.
 * @returns Its value, or its default from {@link FEATURE_FLAGS}.
 */
export const featureEnabled = (repository: RepositoryName, flag: FeatureFlag): Effect.Effect<boolean> =>
  evaluateFlag(repository, flag, FEATURE_FLAGS[flag])

/**
 * The features a repository's flags turn off, and why, for the engine to skip.
 *
 * @remarks
 * Traced as `smartcloud.flags.evaluate`, naming the features turned off.
 *
 * @example
 * ```ts import.meta.vitest name="turnedOffFeatures"
 * import { FEATURES, turnedOffFeatures } from '@resnovas/runtime'
 * import { Effect } from 'effect'
 *
 * Effect.runSync(turnedOffFeatures({ owner: 'Resnovas', repo: 'smartcloud' }, FEATURES)).size // => 0
 * ```
 *
 * @param repository - The repository.
 * @param features - The features about to run.
 * @returns Each turned-off feature's name and reason; features without a flag are never turned off.
 */
export const turnedOffFeatures = (
  repository: RepositoryName,
  features: ReadonlyArray<Feature>,
): Effect.Effect<ReadonlyMap<string, string>> =>
  Effect.map(
    Effect.forEach(
      features,
      (feature) => {
        const flag = flagFor(feature.name)
        return isFeatureFlag(flag)
          ? Effect.map(featureEnabled(repository, flag), (enabled) =>
              enabled ? [] : [[feature.name, `turned off by feature flag ${flag}`] as const],
            )
          : Effect.succeed([])
      },
      { concurrency: 'unbounded' },
    ),
    (entries) => new Map(entries.flat()),
  ).pipe(
    Effect.tap((off) =>
      Effect.zipRight(
        Effect.annotateCurrentSpan({ features: features.length, turned_off: [...off.keys()] }),
        Effect.logDebug(`flags: ${off.size} of ${features.length} feature(s) turned off`).pipe(
          Effect.annotateLogs({ turned_off: [...off.keys()] }),
        ),
      ),
    ),
    Effect.withSpan('smartcloud.flags.evaluate', { captureStackTrace: false }),
  )
