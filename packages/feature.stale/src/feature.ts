/**
 * @file packages/feature.stale/src/feature.ts
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

import type { Feature } from '@resnovas/engine'
import { Effect } from 'effect'
import { sweepStale } from './sweep.js'

// A sweep lists every open item, so it runs on a timetable or on demand,
// never on the pushes and merge queue entries that are also repository events.
const SWEEP_EVENTS = new Set(['schedule', 'workflow_dispatch'])

/**
 * The stale feature: marks inactive issues and pull requests stale, and
 * abandons (and optionally closes) those that stay inactive.
 *
 * @remarks
 * It runs on `schedule` and `workflow_dispatch` events only, and is enabled
 * when the config has a `stale` section. It writes its own comments, at most
 * one per marker per item: an existing `<!-- smartcloud:stale -->` or
 * `<!-- smartcloud:abandoned -->` comment is edited rather than repeated,
 * provided a bot account or a `roles.trustedBots` login wrote it.
 *
 * Labelling or commenting bumps GitHub's `updated_at`, which is the only
 * activity time a sweep sees. Marking an item stale therefore resets its age,
 * so the abandoned age effectively counts from the stale mark:
 * `abandonedAfterDays` is the quiet period after the mark, not since the last
 * human activity. For the same reason, activity after the mark is detected
 * against the mark time recorded in the stale comment; without a
 * `staleComment` there is no record, and the stale label stays until someone
 * removes it.
 *
 * @example
 * ```ts import.meta.vitest name="stale"
 * import { stale } from '@resnovas/feature.stale'
 *
 * stale.enabled?.({ version: 2, stale: { staleAfterDays: 30, staleLabel: 'stale' } }) // => true
 * stale.handles.join(', ') // => 'repository'
 * ```
 */
export const stale: Feature = {
  name: 'stale',
  handles: ['repository'],
  enabled: (config) => config.stale !== undefined,
  run: ({ config, envelope }) => (SWEEP_EVENTS.has(envelope.event) ? sweepStale(config) : Effect.void),
}
