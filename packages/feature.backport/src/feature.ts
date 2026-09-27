/**
 * @file packages/feature.backport/src/feature.ts
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
import { Effect } from 'effect'
import { runBackports } from './backport.js'

// Review events carry the pull request too, but never a merge or a label change.
const BACKPORT_EVENTS = new Set(['pull_request', 'pull_request_target'])

/**
 * The backport feature: cherry-picks a merged pull request onto the branches
 * its `backport <branch>` labels name, each as a new pull request.
 *
 * @remarks
 * It runs on `pull_request` and `pull_request_target` events, when a merged
 * pull request is closed or labelled, and is enabled by a `backport` section.
 * It needs `contents: write` to push the backport branch and
 * `pull-requests: write` to open the pull request and comment. A pull request
 * event from a fork has a read-only token, so there it only warns; run it on
 * `pull_request_target` to backport merged fork pull requests. Pull requests
 * opened with the workflow token do not start other workflows, so the
 * feature is `privileged`: in the action it acts with the app or access
 * token when the run has one, as the house workflow mints for a merged pull
 * request's `closed` event, and CI then runs on the backport.
 *
 * @example
 * ```ts import.meta.vitest name="backport"
 * import { backport } from '@resnovas/feature.backport'
 *
 * backport.enabled?.({ version: 2, backport: {} }) // => true
 * backport.handles.join(', ') // => 'pullRequest'
 * backport.privileged // => true
 * ```
 */
export const backport: Feature = {
  name: 'backport',
  // Backport pull requests must start CI, which the workflow token's never do.
  privileged: true,
  handles: ['pullRequest'],
  enabled: (config) => config.backport !== undefined,
  run: ({ config, envelope }) =>
    envelope.kind === 'pullRequest' && BACKPORT_EVENTS.has(envelope.event)
      ? runBackports(config, envelope)
      : Effect.void,
}
