/**
 * @file packages/feature.commands/src/pulls.ts
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

import { GitHub, type GitHubError, type RepositoryRequest } from '@resnovas/integrations.github'
import { Data, Effect, Either, Schema } from 'effect'

/**
 * GitHub answered a request with something other than what it documents.
 *
 * @example
 * ```ts import.meta.vitest name="UnexpectedAnswer"
 * import { UnexpectedAnswer } from '@resnovas/feature.commands'
 *
 * new UnexpectedAnswer({ operation: 'GET /pulls/7' }).message // => 'GET /pulls/7: unexpected response from GitHub'
 * ```
 */
export class UnexpectedAnswer extends Data.TaggedError('UnexpectedAnswer')<{ readonly operation: string }> {
  override get message() {
    return `${this.operation}: unexpected response from GitHub`
  }
}

/**
 * Makes a repository request and decodes the answer.
 *
 * @example
 * ```ts
 * import { request } from '@resnovas/feature.commands'
 * import { Schema } from 'effect'
 *
 * // Needs the GitHub service.
 * const head = request({ method: 'GET', path: '/git/ref/heads/main' }, Schema.Struct({ object: Schema.Struct({ sha: Schema.String }) }))
 * ```
 *
 * @param call - The request.
 * @param schema - What the answer must look like.
 * @returns The decoded answer.
 */
export const request = <A, I>(
  call: RepositoryRequest,
  schema: Schema.Schema<A, I>,
): Effect.Effect<A, GitHubError | UnexpectedAnswer, GitHub> =>
  Effect.flatMap(GitHub, (github) => github.repositoryRequest(call)).pipe(
    Effect.flatMap((answer) =>
      Either.mapLeft(
        Schema.decodeUnknownEither(schema)(answer),
        () => new UnexpectedAnswer({ operation: `${call.method} ${call.path}` }),
      ),
    ),
  )

const Pull = Schema.Struct({
  node_id: Schema.String,
  number: Schema.Number,
  title: Schema.String,
  state: Schema.String,
  merged: Schema.optionalWith(Schema.Boolean, { default: () => false }),
  merge_commit_sha: Schema.optionalWith(Schema.NullOr(Schema.String), { default: () => null }),
  user: Schema.NullishOr(Schema.Struct({ login: Schema.String })),
  commits: Schema.optionalWith(Schema.Number, { default: () => 1 }),
  base: Schema.Struct({ ref: Schema.String }),
})

/** What the commands read about a pull request. */
export interface PullDetails {
  readonly nodeId: string
  readonly number: number
  readonly title: string
  readonly open: boolean
  readonly merged: boolean
  readonly mergeCommitSha: string | undefined
  readonly author: string
  /** How many commits the pull request has. */
  readonly commits: number
  readonly baseBranch: string
}

/**
 * Reads a pull request's details.
 *
 * @example
 * ```ts
 * import { getPull } from '@resnovas/feature.commands'
 *
 * // Needs the GitHub service.
 * const details = getPull(7)
 * ```
 *
 * @param number - The pull request.
 * @returns Its details.
 */
export const getPull = (number: number): Effect.Effect<PullDetails, GitHubError | UnexpectedAnswer, GitHub> =>
  Effect.map(request({ method: 'GET', path: `/pulls/${number}` }, Pull), (pull) => ({
    nodeId: pull.node_id,
    number: pull.number,
    title: pull.title,
    open: pull.state === 'open',
    merged: pull.merged,
    mergeCommitSha: pull.merge_commit_sha ?? undefined,
    author: pull.user?.login ?? '',
    commits: pull.commits,
    baseBranch: pull.base.ref,
  }))
