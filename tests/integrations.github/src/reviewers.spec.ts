/**
 * @file tests/integrations.github/src/reviewers.spec.ts
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

import { expect, it } from '@effect/vitest'
import {
  dryRunGitHub,
  GitHub,
  makeMemoryGitHub,
  previouslyRequestedTeams,
  requestOwnerReviews,
  type RecordedWrite,
  reviewAssignmentSnapshot,
} from '@resnovas/integrations.github'
import { Effect, Ref } from 'effect'

it.effect('reads base commit and pending users and teams', () =>
  Effect.gen(function* () {
    const memory = makeMemoryGitHub()
    const service = {
      ...memory.service,
      repositoryRequest: () =>
        Effect.succeed({
          base: { sha: 'abc' },
          requested_reviewers: [{ login: 'ann' }],
          requested_teams: [{ slug: 'docs' }],
        }),
    }
    const snapshot = yield* reviewAssignmentSnapshot(7).pipe(Effect.provideService(GitHub, service))
    expect(snapshot).toEqual({ baseSha: 'abc', pending: ['ann', 'Resnovas/docs'] })
  }),
)

it.effect('rejects malformed snapshots instead of assigning from incomplete information', () =>
  Effect.gen(function* () {
    const result = yield* Effect.either(
      reviewAssignmentSnapshot(7).pipe(Effect.provideService(GitHub, makeMemoryGitHub().service)),
    )
    expect(result._tag).toBe('Left')
    if (result._tag === 'Left') expect(result.left._tag).toBe('ValidationFailed')
  }),
)

it.effect('separates user and team requests and honours dry run', () =>
  Effect.gen(function* () {
    const memory = makeMemoryGitHub()
    yield* requestOwnerReviews(7, ['ann', 'Resnovas/docs']).pipe(Effect.provideService(GitHub, memory.service))
    expect(memory.state.requests).toEqual([
      { method: 'POST', path: '/pulls/7/requested_reviewers', body: { reviewers: ['ann'], team_reviewers: ['docs'] } },
    ])
    const dry = dryRunGitHub(memory.service, yield* Ref.make<ReadonlyArray<RecordedWrite>>([]))
    yield* requestOwnerReviews(8, ['bo']).pipe(Effect.provideService(GitHub, dry))
    expect(memory.state.requests).toHaveLength(1)
  }),
)

it.effect('paginates historical team requests without confusing other events', () =>
  Effect.gen(function* () {
    const memory = makeMemoryGitHub()
    const paths: Array<string> = []
    const service = {
      ...memory.service,
      repositoryRequest: (request: { readonly path: string }) => {
        paths.push(request.path)
        return Effect.succeed(
          paths.length === 1
            ? Array.from({ length: 100 }, () => ({ event: 'commented' }))
            : [
                { event: 'review_requested', requested_team: { slug: 'docs' } },
                { event: 'review_requested' },
                { event: 'review_request_removed', requested_team: { slug: 'other' } },
              ],
        )
      },
    }
    expect(yield* previouslyRequestedTeams(7).pipe(Effect.provideService(GitHub, service))).toEqual(['Resnovas/docs'])
    expect(paths).toEqual(['/issues/7/timeline?per_page=100&page=1', '/issues/7/timeline?per_page=100&page=2'])
    const result = yield* Effect.either(previouslyRequestedTeams(7).pipe(Effect.provideService(GitHub, memory.service)))
    expect(result._tag).toBe('Left')
  }),
)
