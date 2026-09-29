/**
 * @file packages/feature.automerge/src/feature.ts
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

import { type Facet, requiredFacets } from '@resnovas/conditions'
import type { Feature } from '@resnovas/engine'
import { Effect } from 'effect'
import { FEATURE, runAutoMerge } from './automerge.js'

/**
 * The auto-merge feature: turns on GitHub auto-merge for an open pull request
 * when one of the `autoMerge.rules` passes, such as a Dependabot patch update.
 *
 * @remarks
 * It runs on every pull request event (`pull_request`, `pull_request_target`,
 * `pull_request_review` and `pull_request_review_comment`) and is enabled by
 * an `autoMerge` section. GitHub then merges the pull request once its
 * required reviews and checks pass. It needs `pull-requests: write` and
 * `contents: write` to turn auto-merge on and comment, and the repository's
 * "Allow auto-merge" setting. It loads whatever facets its rules' conditions
 * need.
 *
 * @example
 * ```ts import.meta.vitest name="autoMergeFeature"
 * import { autoMergeFeature } from '@resnovas/feature.automerge'
 *
 * autoMergeFeature.enabled?.({ version: 2, autoMerge: {} }) // => true
 * autoMergeFeature.enabled?.({ version: 2 }) // => false
 * autoMergeFeature.handles.join(', ') // => 'pullRequest'
 * ```
 */
export const autoMergeFeature: Feature = {
  name: FEATURE,
  handles: ['pullRequest'],
  enabled: (config) => config.autoMerge !== undefined,
  facets: (config) =>
    new Set<Facet>(requiredFacets(Object.values(config.autoMerge?.rules ?? {}).map((rule) => rule.when))),
  // The context's subject carries the facets the rules need; the envelope's does not.
  run: ({ config, envelope, subject }) =>
    envelope.kind === 'pullRequest' ? runAutoMerge(config, subject ?? envelope.subject) : Effect.void,
}
