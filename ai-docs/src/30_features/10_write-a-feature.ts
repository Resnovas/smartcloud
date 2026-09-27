/**
 * @file ai-docs/src/30_features/10_write-a-feature.ts
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

/**
 * @title Writing a feature
 *
 * A feature declares what it handles, when the config enables it and which
 * facets it needs, then acts only through the `GitHub` service and records
 * through `Report`. It has no dry-run branch and no error handling of its
 * own for the engine to duplicate.
 */
import { evaluate, requiredFacets, type ConditionGroup } from '@resnovas/conditions'
import { Report, type Feature } from '@resnovas/engine'
import { GitHub } from '@resnovas/integrations.github'
import { Effect } from 'effect'

// A pull request that touches the workflows and is not yet labelled `ci`.
const touchesWorkflows: ConditionGroup = {
  condition: [
    { type: 'filesMatch', condition: '.github/workflows/**' },
    { type: 'hasLabel', label: 'ci', condition: false },
  ],
}

export const workflowLabel: Feature = {
  name: 'workflow-label',
  handles: ['pullRequest'],
  // Enabled by a section of its own in a real feature; here, by the label
  // being defined, so the repository has opted in to it.
  enabled: (config) => config.labels?.['ci'] !== undefined,
  // Declared, not fetched: the engine loads `files` once for every feature
  // that asks, and fails only the features that need a facet it cannot load.
  facets: () => requiredFacets([touchesWorkflows]),
  run: ({ subject }) =>
    Effect.gen(function* () {
      if (subject === undefined) return
      const report = yield* Report
      const evaluation = yield* evaluate(touchesWorkflows, subject)
      if (!evaluation.passed) return
      // In a dry run this is recorded in DryRunLog; in a restricted run a
      // Forbidden answer is recorded and skipped. The feature cannot tell.
      yield* (yield* GitHub).addLabels(subject.number, ['ci'])
      yield* report.change({ feature: 'workflow-label', description: `labelled #${subject.number} "ci"` })
      yield* report.add({
        feature: 'workflow-label',
        rule: 'workflow-label.applied',
        level: 'notice',
        message: 'This pull request changes the workflows, so a maintainer must review it.',
      })
    }),
}
