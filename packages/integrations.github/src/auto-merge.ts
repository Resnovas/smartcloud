/**
 * @file packages/integrations.github/src/auto-merge.ts
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
import { type GitHubError, ValidationFailed } from './errors.js'
import { GitHub } from './service.js'

/**
 * How GitHub merges a pull request: a merge commit, one squashed commit, or
 * each commit rebased onto the base branch.
 *
 * @example
 * ```ts import.meta.vitest name="MERGE_METHODS"
 * import { MERGE_METHODS } from '@resnovas/integrations.github'
 *
 * MERGE_METHODS.join(', ') // => 'merge, squash, rebase'
 * ```
 */
export const MERGE_METHODS = ['merge', 'squash', 'rebase'] as const

/** One of {@link MERGE_METHODS}. */
export type MergeMethod = (typeof MERGE_METHODS)[number]

const ENABLE =
  'mutation($id: ID!, $method: PullRequestMergeMethod!) { enablePullRequestAutoMerge(input: { pullRequestId: $id, mergeMethod: $method }) { clientMutationId } }'
const DISABLE = 'mutation($id: ID!) { disablePullRequestAutoMerge(input: { pullRequestId: $id }) { clientMutationId } }'

/**
 * Turns on GitHub auto-merge for a pull request, so GitHub merges it with the
 * method once its required reviews and checks pass.
 *
 * @remarks
 * GitHub refuses when the repository does not allow auto-merge, and when the
 * pull request could be merged straight away (its merge state is clean), as a
 * `ValidationFailed` error; {@link autoMergeRefusal} tells the two apart.
 *
 * @example
 * ```ts
 * import { enableAutoMerge } from '@resnovas/integrations.github'
 *
 * // Needs the GitHub service; the id is the pull request's node id.
 * const program = enableAutoMerge('PR_kwDOA', 'squash')
 * ```
 *
 * @param nodeId - The pull request's GraphQL node id.
 * @param method - How to merge it.
 * @returns Completion once GitHub has accepted it.
 */
export const enableAutoMerge = (nodeId: string, method: MergeMethod): Effect.Effect<void, GitHubError, GitHub> =>
  Effect.flatMap(GitHub, (github) => github.graphql(ENABLE, { id: nodeId, method: method.toUpperCase() }))

/**
 * Turns off GitHub auto-merge for a pull request.
 *
 * @example
 * ```ts
 * import { disableAutoMerge } from '@resnovas/integrations.github'
 *
 * // Needs the GitHub service; the id is the pull request's node id.
 * const program = disableAutoMerge('PR_kwDOA')
 * ```
 *
 * @param nodeId - The pull request's GraphQL node id.
 * @returns Completion once GitHub has accepted it.
 */
export const disableAutoMerge = (nodeId: string): Effect.Effect<void, GitHubError, GitHub> =>
  Effect.flatMap(GitHub, (github) => github.graphql(DISABLE, { id: nodeId }))

const AutoMergePull = Schema.Struct({
  node_id: Schema.String,
  state: Schema.String,
  auto_merge: Schema.optionalWith(
    Schema.NullOr(
      Schema.Struct({
        enabled_by: Schema.NullishOr(Schema.Struct({ login: Schema.String })),
        merge_method: Schema.Literal(...MERGE_METHODS),
      }),
    ),
    { default: () => null },
  ),
})

/** A pull request's auto-merge, as {@link readAutoMerge} reads it. */
export interface AutoMergeState {
  /** The pull request's GraphQL node id, for {@link enableAutoMerge} and {@link disableAutoMerge}. */
  readonly nodeId: string
  readonly open: boolean
  /** Set while auto-merge is on. */
  readonly autoMerge?: {
    readonly method: MergeMethod
    /** Who turned it on; empty when GitHub no longer knows. */
    readonly enabledBy: string
  }
}

/**
 * Reads whether auto-merge is on for a pull request, how, and who turned it on.
 *
 * @example
 * ```ts
 * import { readAutoMerge } from '@resnovas/integrations.github'
 *
 * // Needs the GitHub service.
 * const program = readAutoMerge(7)
 * ```
 *
 * @param number - The pull request number.
 * @returns Its node id, whether it is open, and its auto-merge.
 */
export const readAutoMerge = (number: number): Effect.Effect<AutoMergeState, GitHubError, GitHub> =>
  Effect.gen(function* () {
    const github = yield* GitHub
    const value = yield* github.repositoryRequest({ method: 'GET', path: `/pulls/${number}` })
    const pull = yield* Schema.decodeUnknown(AutoMergePull)(value).pipe(
      Effect.mapError((error) => new ValidationFailed({ operation: 'readAutoMerge', detail: String(error) })),
    )
    const auto = pull.auto_merge
    return {
      nodeId: pull.node_id,
      open: pull.state === 'open',
      ...(auto === null ? {} : { autoMerge: { method: auto.merge_method, enabledBy: auto.enabled_by?.login ?? '' } }),
    }
  })

/**
 * Why GitHub refused to turn on auto-merge, when it is a refusal smartcloud
 * can explain rather than a failure.
 *
 * @remarks
 * `notAllowed` means the repository's "Allow auto-merge" setting is off.
 * `mergeable` means the pull request could be merged straight away, so there
 * is nothing for auto-merge to wait for; GitHub only turns it on while a
 * required review or check is outstanding.
 *
 * @example
 * ```ts import.meta.vitest name="autoMergeRefusal"
 * import { autoMergeRefusal, ValidationFailed } from '@resnovas/integrations.github'
 *
 * autoMergeRefusal(new ValidationFailed({ operation: 'graphql', detail: 'Pull request Auto merge is not allowed for this repository' })) // => 'notAllowed'
 * autoMergeRefusal(new ValidationFailed({ operation: 'graphql', detail: 'Pull request is in clean status' })) // => 'mergeable'
 * autoMergeRefusal(new ValidationFailed({ operation: 'graphql', detail: 'Something else' })) // => undefined
 * ```
 *
 * @param error - The error from {@link enableAutoMerge}.
 * @returns The kind of refusal, or undefined for any other error.
 */
export const autoMergeRefusal = (error: GitHubError): 'notAllowed' | 'mergeable' | undefined => {
  if (error._tag !== 'ValidationFailed') return undefined
  if (/auto[- ]?merge is not allowed/i.test(error.detail)) return 'notAllowed'
  if (/is in (?:clean|unstable|has_hooks) status/i.test(error.detail)) return 'mergeable'
  return undefined
}
