/**
 * @file tests/runtime/src/features.spec.ts
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

import { describe, expect, it } from '@effect/vitest'
import { runFeatures } from '@resnovas/engine'
import { GitHub, makeMemoryGitHub } from '@resnovas/integrations.github'
import { FEATURES, parseFeatureList, selectFeatures, UnknownFeatures } from '@resnovas/runtime'
import { Effect } from 'effect'

const issue = {
  number: 3,
  title: 'Crash on start',
  body: '',
  user: { login: 'sam' },
  state: 'open',
  locked: false,
  labels: [],
  updated_at: '2026-09-01T00:00:00Z',
}

describe('features', () => {
  it.effect('splits lists, selects features in order, and names unknown ones', () =>
    Effect.gen(function* () {
      expect(parseFeatureList(' labels, stale,,')).toStrictEqual(['labels', 'stale'])
      expect(yield* selectFeatures(undefined)).toBe(FEATURES)
      expect((yield* selectFeatures(['stale', 'labels'])).map((feature) => feature.name)).toStrictEqual([
        'labels',
        'stale',
      ])
      const unknown = yield* Effect.flip(selectFeatures(['labels', 'nope']))
      expect(unknown).toBeInstanceOf(UnknownFeatures)
      expect(unknown.message).toMatch(/^unknown feature\(s\): nope; expected some of conventions, /)
    }),
  )

  it.effect('/run re-runs the named features on the item and publishes their result', () =>
    Effect.gen(function* () {
      const memory = makeMemoryGitHub({ labels: [{ name: 'bug', color: 'd73a4a', description: '' }] })
      const service: GitHub['Type'] = {
        ...memory.service,
        repositoryRequest: (request) =>
          Effect.succeed(
            request.path === '/collaborators/maya/permission'
              ? { permission: 'write', role_name: 'write' }
              : request.path === '/issues/3'
                ? issue
                : null,
          ),
      }
      const commands = FEATURES.filter((feature) => feature.name === 'commands')
      const result = yield* runFeatures({
        config: {
          version: 2,
          commands: {},
          labels: { bug: { name: 'bug', color: 'd73a4a' } },
          labelling: { bug: { label: 'bug', when: { condition: [{ type: 'titleMatches', condition: '^Crash' }] } } },
        },
        event: 'issue_comment',
        payload: {
          action: 'created',
          issue,
          comment: { id: 1, body: '/run labels', user: { login: 'maya', type: 'User' } },
        },
        features: commands,
      }).pipe(Effect.provideService(GitHub, service))
      expect(result.changes.map((change) => change.description)).toStrictEqual([
        '/run labels: ran labels on #3: 0 error(s), 0 warning(s)',
      ])
      expect(memory.state.issues.get(3)?.labels).toStrictEqual(['bug'])
    }),
  )
})
