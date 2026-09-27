/**
 * @file ai-docs/src/40_conditions/10_evaluate-a-group.ts
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
 * @title Evaluating conditions
 *
 * `evaluate` is pure apart from the Clock, so the same group gives the same
 * answer in a run, a dry run and a test. `requiredFacets` says what to load
 * before calling it; the engine does that loading for a feature.
 */
import { evaluate, requiredFacets, type ConditionGroup, type Subject } from '@resnovas/conditions'
import { Effect } from 'effect'

// Two of three must pass. The `$not` group passes when its own group fails.
const ready: ConditionGroup = {
  requires: 2,
  condition: [
    { type: 'titleMatches', condition: '/^(feat|fix)(\\(.+\\))?: /i' },
    { type: 'filesMatch', condition: 'packages/**' },
    { type: '$not', condition: { condition: [{ type: 'isDraft', condition: true }] } },
  ],
}

const pullRequest: Subject = {
  kind: 'pullRequest',
  number: 7,
  title: 'feat(labels): prune unused labels',
  body: '',
  author: 'sam',
  open: true,
  locked: false,
  labels: [],
  updatedAt: new Date(0),
  draft: false,
  // A facet: loaded only because filesMatch asked for it.
  files: ['packages/feature.labels/src/sync.ts'],
}

export const example = Effect.gen(function* () {
  const facets = requiredFacets([ready])
  const evaluation = yield* evaluate(ready, pullRequest)
  return {
    facets: [...facets],
    passed: evaluation.passed,
    // Each result's detail is what reports print to explain the outcome.
    details: evaluation.results.map((entry) => `${entry.type}: ${entry.detail}`),
  }
  // Forgetting to load a facet is an engine bug, surfaced as MissingFacet.
}).pipe(Effect.catchTag('MissingFacet', (error) => Effect.die(error)))
