/**
 * @file packages/integrations.github/src/reviewers.ts
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

import { Effect, Schema } from 'effect'
import { ValidationFailed, type GitHubError } from './errors.js'
import { GitHub } from './service.js'

const AssignmentPull = Schema.Struct({
  base: Schema.Struct({ sha: Schema.String }),
  requested_reviewers: Schema.Array(Schema.Struct({ login: Schema.String })),
  requested_teams: Schema.Array(Schema.Struct({ slug: Schema.String })),
})

/** The base commit and pending reviewers of a pull request. */
export interface ReviewAssignmentSnapshot {
  readonly baseSha: string
  /** User logins and org/team names, without an @ prefix. */
  readonly pending: ReadonlyArray<string>
}

/**
 * Reads current review requests and the trusted base commit, without caching.
 *
 * @example
 * ```ts
 * import { reviewAssignmentSnapshot } from '@resnovas/integrations.github'
 * const program = reviewAssignmentSnapshot(7)
 * ```
 * @param number - The pull request number.
 * @returns Its base commit and pending user and team review requests.
 */
export const reviewAssignmentSnapshot = (
  number: number,
): Effect.Effect<ReviewAssignmentSnapshot, GitHubError, GitHub> =>
  Effect.gen(function* () {
    const github = yield* GitHub
    const value = yield* github.repositoryRequest({ method: 'GET', path: `/pulls/${number}` })
    const pull = yield* Schema.decodeUnknown(AssignmentPull)(value).pipe(
      Effect.mapError(
        (error) => new ValidationFailed({ operation: 'reviewAssignmentSnapshot', detail: String(error) }),
      ),
    )
    return {
      baseSha: pull.base.sha,
      pending: [
        ...pull.requested_reviewers.map((user) => user.login),
        ...pull.requested_teams.map((team) => `${github.coordinates.owner}/${team.slug}`),
      ],
    }
  })

/**
 * Requests user and team reviews, using repository pull request write access.
 *
 * @example
 * ```ts
 * import { requestOwnerReviews } from '@resnovas/integrations.github'
 * const program = requestOwnerReviews(7, ['ann', 'Resnovas/docs'])
 * ```
 * @param number - The pull request number.
 * @param owners - User logins or repository-owner/team names, without @ prefixes.
 * @returns Completion after GitHub accepts the request.
 */
export const requestOwnerReviews = (
  number: number,
  owners: ReadonlyArray<string>,
): Effect.Effect<void, GitHubError, GitHub> =>
  Effect.gen(function* () {
    const github = yield* GitHub
    yield* github.repositoryRequest({
      method: 'POST',
      path: `/pulls/${number}/requested_reviewers`,
      body: {
        reviewers: owners.filter((owner) => !owner.includes('/')),
        team_reviewers: owners
          .filter((owner) => owner.includes('/'))
          .map((owner) => owner.slice(owner.indexOf('/') + 1)),
      },
    })
  })

const Timeline = Schema.Array(
  Schema.Struct({
    event: Schema.String,
    requested_team: Schema.optional(Schema.Struct({ slug: Schema.String })),
  }),
)

/**
 * Lists teams already requested on a PR, including requests cleared by reviews.
 *
 * @remarks
 * A team disappears from pending requests when a member reviews. Historical
 * requests prevent repeated notifications without reading private membership.
 * Explicitly removed team requests also remain satisfied.
 *
 * @example
 * ```ts
 * import { previouslyRequestedTeams } from '@resnovas/integrations.github'
 * const program = previouslyRequestedTeams(7)
 * ```
 * @param number - The pull request number.
 * @returns Previously requested organization/team names.
 */
export const previouslyRequestedTeams = (number: number): Effect.Effect<ReadonlyArray<string>, GitHubError, GitHub> =>
  Effect.gen(function* () {
    const github = yield* GitHub
    const teams = new Set<string>()
    for (let page = 1; ; page += 1) {
      const value = yield* github.repositoryRequest({
        method: 'GET',
        path: `/issues/${number}/timeline?per_page=100&page=${page}`,
      })
      const events = yield* Schema.decodeUnknown(Timeline)(value).pipe(
        Effect.mapError(
          (error) => new ValidationFailed({ operation: 'previouslyRequestedTeams', detail: String(error) }),
        ),
      )
      for (const event of events) {
        if (event.event === 'review_requested' && event.requested_team !== undefined)
          teams.add(`${github.coordinates.owner}/${event.requested_team.slug}`)
      }
      if (events.length < 100) return [...teams]
    }
  })
