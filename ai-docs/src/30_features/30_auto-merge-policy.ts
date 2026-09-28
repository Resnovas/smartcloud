/**
 * @file ai-docs/src/30_features/30_auto-merge-policy.ts
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
 * @title Turning on auto-merge by rule
 *
 * An `autoMerge` rule turns on GitHub auto-merge for an open pull request its
 * conditions match. Here a Dependabot patch update matches, so the feature
 * reads the pull request, turns auto-merge on with the rule's method through
 * a GraphQL mutation (recorded, not made, under `DryRun`) and comments why.
 */
import { runFeatures } from '@resnovas/engine'
import { DryRun, DryRunLog, GitHub, makeMemoryGitHub } from '@resnovas/integrations.github'
import { FEATURES } from '@resnovas/runtime'
import { Effect, Layer } from 'effect'

const memory = makeMemoryGitHub()
// The memory service answers raw requests with null, so answer the pull
// request read the way GitHub does: auto-merge is off.
const github = Layer.succeed(GitHub, {
  ...memory.service,
  repositoryRequest: () => Effect.succeed({ node_id: 'PR_7', state: 'open', auto_merge: null }),
})

export const example = Effect.gen(function* () {
  const result = yield* runFeatures({
    config: {
      version: 2,
      autoMerge: {
        rules: {
          'dependabot-patch': {
            when: { condition: [{ type: 'dependencyUpdateType', condition: ['patch'] }] },
            method: 'squash',
          },
        },
      },
    },
    event: 'pull_request',
    payload: {
      action: 'opened',
      pull_request: {
        number: 7,
        title: 'Bump effect from 3.1.0 to 3.1.1',
        body: '',
        user: { login: 'dependabot[bot]', type: 'Bot' },
        state: 'open',
        locked: false,
        labels: [],
        updated_at: '2026-09-01T00:00:00Z',
        head: { ref: 'dependabot/npm_and_yarn/effect-3.1.1', sha: 'abc' },
      },
    },
    features: FEATURES.filter((feature) => feature.name === 'automerge'),
  })
  const writes = yield* (yield* DryRunLog).writes
  return {
    // "Turned on auto-merge (squash) for #7 (dependabot-patch)."
    changes: result.changes.map((change) => change.description),
    // The enablePullRequestAutoMerge mutation and the explaining comment.
    writes: writes.map((write) => write.operation),
  }
}).pipe(Effect.provide(DryRun.pipe(Layer.provide(github))))
