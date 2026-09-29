/**
 * @file packages/feature.labels/src/feature.ts
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

import type { Feature } from '@resnovas/engine'
import { applyLabels, labellingFacets } from './apply.js'
import { withSizeLabels } from './size.js'
import { syncLabels } from './sync.js'

/**
 * The labels feature: keeps repository labels in line with the config, and
 * applies labels to pull requests and issues by condition.
 *
 * @remarks
 * On repository events (push, schedule, dispatch, merge queue) it syncs the
 * `labels` section to the repository: see {@link syncLabels}. On pull request
 * and issue events it applies the `labelling` rules to the subject: see
 * {@link applyLabels}. Sync never runs on pull request events, because those
 * from forks carry a read-only token. A `sizeLabels` section adds the
 * built-in size labels and rules first: see {@link withSizeLabels}. The
 * feature is enabled when the config has a `labels`, `labelling` or
 * `sizeLabels` section.
 *
 * @example
 * ```ts import.meta.vitest name="labels"
 * import { runFeatures } from '@resnovas/engine'
 * import { labels } from '@resnovas/feature.labels'
 *
 * // Needs GitHub provided to run.
 * const program = runFeatures({ config: { version: 2, labels: {} }, event: 'schedule', payload: {}, features: [labels] })
 * labels.handles.length // => 3
 * ```
 */
export const labels: Feature = {
  name: 'labels',
  handles: ['repository', 'pullRequest', 'issue'],
  enabled: (config) => config.labels !== undefined || config.labelling !== undefined || config.sizeLabels !== undefined,
  facets: (config) => labellingFacets(withSizeLabels(config)),
  run: ({ config, envelope, subject }) => {
    const expanded = withSizeLabels(config)
    return envelope.kind === 'repository' ? syncLabels(expanded) : applyLabels(expanded, subject ?? envelope.subject)
  },
}
