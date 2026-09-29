/**
 * @file ai-docs/src/30_features/40_label-aliases.ts
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
 * @title Applying a renamed label that is still on a pull request
 *
 * `bug` was renamed from `defect`. The pull request still carries `defect`
 * because label sync has not run yet, so labelling swaps the old name for the
 * current one instead of leaving both.
 */
import { runFeatures } from '@resnovas/engine'
import { GitHub, makeMemoryGitHub } from '@resnovas/integrations.github'
import { FEATURES } from '@resnovas/runtime'
import { Effect } from 'effect'

const memory = makeMemoryGitHub()
memory.state.issues.set(3, { labels: ['defect'], comments: [], open: true })

export const example = Effect.gen(function* () {
  const result = yield* runFeatures({
    config: {
      version: 2,
      labels: { bug: { name: 'Type: Bug', color: 'd73a4a', aliases: ['defect'] } },
      labelling: { bug: { label: 'bug', when: { condition: [{ type: 'titleMatches', condition: '^bug' }] } } },
    },
    event: 'issues',
    payload: {
      action: 'edited',
      issue: {
        number: 3,
        title: 'bug: sync fails',
        body: null,
        user: { login: 'sam' },
        state: 'open',
        locked: false,
        labels: [{ name: 'defect' }],
        updated_at: '2026-09-01T00:00:00Z',
      },
    },
    // Only the labels feature has a section here, so only it runs.
    features: FEATURES,
  })
  // ['added label "Type: Bug" to #3, replacing its old name "defect"',
  //  'removed label "defect" (an old name of "Type: Bug") from #3']
  return result.changes.map((change) => change.description)
}).pipe(Effect.provideService(GitHub, memory.service))
