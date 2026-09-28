/**
 * @file ai-docs/src/70_telemetry-and-flags/10_flags-and-facts.ts
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

/**
 * @title Reading a flag and recording a measurement
 *
 * Flags are read through the runtime, which knows each flag's default; with
 * telemetry off or PostHog unreachable the default is the answer. A feature
 * measures what it did as a `Fact` on the report rather than sending an
 * event itself.
 */
import { Report } from '@resnovas/engine'
import { featureEnabled, flagFor, turnedOffFeatures, FEATURES } from '@resnovas/runtime'
import { Effect } from 'effect'

const repository = { owner: 'Resnovas', repo: 'smartcloud' }

// Without the Telemetry service (as here) every flag keeps its default from
// FEATURE_FLAGS, so opting out of telemetry never changes behaviour.
export const flags = Effect.gen(function* () {
  const labelsOn = yield* featureEnabled(repository, 'smartcloud-labels')
  const off = yield* turnedOffFeatures(repository, FEATURES)
  return { flag: flagFor('labels'), labelsOn, turnedOff: [...off.keys()] }
})

// Counts, outcomes and fixed names only: the values reach product analytics.
// `measuredEvents` turns the facts it knows, such as `sync proposed`, into
// events once the run is over.
export const measure = Effect.flatMap(Report, (report) =>
  report.measure({
    feature: 'sync',
    name: 'sync proposed',
    values: { created: 2, updated: 1, mode: 0, conflicts: 0, pull_request: 'created' },
  }),
)
