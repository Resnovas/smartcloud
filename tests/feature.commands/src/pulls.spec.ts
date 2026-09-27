/**
 * @file tests/feature.commands/src/pulls.spec.ts
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
import { getPull, request } from '@resnovas/feature.commands'
import { GitHub } from '@resnovas/integrations.github'
import { Effect, Schema } from 'effect'
import { makeGitHub, ok, pull } from './fixtures.js'

describe('pull request reads', () => {
  it.effect('reads a pull request, with defaults for what GitHub may leave out', () =>
    Effect.gen(function* () {
      const github = makeGitHub({
        'GET /pulls/7': ok({
          node_id: 'PR_7',
          number: 7,
          title: 'x',
          state: 'closed',
          user: null,
          base: { ref: 'main' },
        }),
      })
      const details = yield* getPull(7).pipe(Effect.provideService(GitHub, github.service))
      expect(details).toStrictEqual({
        nodeId: 'PR_7',
        number: 7,
        title: 'x',
        open: false,
        merged: false,
        mergeCommitSha: undefined,
        author: '',
        commits: 1,
        baseBranch: 'main',
      })
      const merged = yield* getPull(7).pipe(
        Effect.provideService(
          GitHub,
          makeGitHub({ 'GET /pulls/7': ok(pull({ merged: true, merge_commit_sha: 'm1' })) }).service,
        ),
      )
      expect([merged.open, merged.merged, merged.mergeCommitSha, merged.author]).toStrictEqual([
        true,
        true,
        'm1',
        'sam',
      ])
    }),
  )

  it.effect('fails with UnexpectedAnswer when GitHub answers something else', () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip(
        request({ method: 'GET', path: '/pulls/7' }, Schema.Struct({ number: Schema.Number })).pipe(
          Effect.provideService(GitHub, makeGitHub().service),
        ),
      )
      expect(error.message).toBe('GET /pulls/7: unexpected response from GitHub')
    }),
  )
})
