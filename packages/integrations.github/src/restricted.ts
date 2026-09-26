/**
 * @file packages/integrations.github/src/restricted.ts
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

import { Context, Effect, Layer, Ref } from 'effect'
import { dryRunGitHub, type RecordedWrite } from './dry-run.js'
import type { GitHubError } from './errors.js'
import { isGraphqlWrite } from './graphql.js'
import { GitHub, type GitHubService } from './service.js'

/**
 * The writes the restricted layer skipped because the token was not allowed
 * to make them, in the order they were attempted.
 *
 * @example
 * ```ts
 * import { Effect } from 'effect'
 * import { SkippedWrites } from '@resnovas/integrations.github'
 *
 * const operations = Effect.flatMap(SkippedWrites, (log) => log.writes).pipe(
 *   Effect.map((writes) => writes.map((write) => write.operation)),
 * )
 * ```
 */
export class SkippedWrites extends Context.Tag('@resnovas/integrations.github/SkippedWrites')<
  SkippedWrites,
  { readonly writes: Effect.Effect<ReadonlyArray<RecordedWrite>> }
>() {}

// Tries the write; when the token is not allowed to make it, runs the
// recorded placeholder instead.
const orSkip = <A>(
  write: Effect.Effect<A, GitHubError>,
  skip: Effect.Effect<A, GitHubError>,
): Effect.Effect<A, GitHubError> => write.pipe(Effect.catchTag('Forbidden', () => skip))

/**
 * Wraps a GitHub service for a restricted token: every call is made, but a
 * write GitHub refuses as forbidden is recorded and skipped instead of
 * failing.
 *
 * @remarks
 * A run with the read-only workflow token, such as a pull request from a
 * fork or from Dependabot, cannot label, comment or create check runs.
 * Rather than fail the feature that tried, the write is recorded in the log
 * and answered like a dry run would: comment and check run ids of `0`.
 * Reads, and writes that fail for any other reason, fail as before.
 *
 * @example
 * ```ts import.meta.vitest name="restrictedGitHub"
 * import { Effect, Ref } from 'effect'
 * import { Forbidden, makeMemoryGitHub, restrictedGitHub, type RecordedWrite } from '@resnovas/integrations.github'
 *
 * const log = Ref.unsafeMake<ReadonlyArray<RecordedWrite>>([])
 * const { service } = makeMemoryGitHub()
 * const readOnly = { ...service, closeIssue: () => Effect.fail(new Forbidden({ operation: 'closeIssue', detail: 'read-only' })) }
 * await Effect.runPromise(restrictedGitHub(readOnly, log).closeIssue(1))
 * Effect.runSync(Ref.get(log))[0]?.operation // => 'closeIssue'
 * ```
 *
 * @param inner - The service to act through.
 * @param log - Where skipped writes are recorded.
 * @returns The wrapped service.
 */
export const restrictedGitHub = (inner: GitHubService, log: Ref.Ref<ReadonlyArray<RecordedWrite>>): GitHubService => {
  const skip = dryRunGitHub(inner, log)
  return {
    ...inner,
    createLabel: (label) => orSkip(inner.createLabel(label), skip.createLabel(label)),
    updateLabel: (current, label) => orSkip(inner.updateLabel(current, label), skip.updateLabel(current, label)),
    deleteLabel: (name) => orSkip(inner.deleteLabel(name), skip.deleteLabel(name)),
    addLabels: (issue, labels) => orSkip(inner.addLabels(issue, labels), skip.addLabels(issue, labels)),
    removeLabel: (issue, label) => orSkip(inner.removeLabel(issue, label), skip.removeLabel(issue, label)),
    createComment: (issue, body) => orSkip(inner.createComment(issue, body), skip.createComment(issue, body)),
    updateComment: (id, body) => orSkip(inner.updateComment(id, body), skip.updateComment(id, body)),
    closeIssue: (issue) => orSkip(inner.closeIssue(issue), skip.closeIssue(issue)),
    createReview: (pullRequest, review) =>
      orSkip(inner.createReview(pullRequest, review), skip.createReview(pullRequest, review)),
    requestReviewers: (pullRequest, logins) =>
      orSkip(inner.requestReviewers(pullRequest, logins), skip.requestReviewers(pullRequest, logins)),
    createCheckRun: (run) => orSkip(inner.createCheckRun(run), skip.createCheckRun(run)),
    updateCheckRun: (id, run) => orSkip(inner.updateCheckRun(id, run), skip.updateCheckRun(id, run)),
    proposeChanges: (proposal) => orSkip(inner.proposeChanges(proposal), skip.proposeChanges(proposal)),
    repositoryRequest: (request) =>
      request.method === 'GET'
        ? inner.repositoryRequest(request)
        : orSkip(inner.repositoryRequest(request), skip.repositoryRequest(request)),
    graphql: (query, variables) =>
      isGraphqlWrite(query)
        ? orSkip(inner.graphql(query, variables), skip.graphql(query, variables))
        : inner.graphql(query, variables),
  }
}

/**
 * Wraps whichever GitHub layer is provided with {@link restrictedGitHub},
 * and provides the {@link SkippedWrites} it recorded.
 *
 * @example
 * ```ts import.meta.vitest name="Restricted"
 * import { Effect } from 'effect'
 * import { GitHub, GitHubMemory, Restricted, SkippedWrites } from '@resnovas/integrations.github'
 *
 * const program = Effect.gen(function* () {
 *   yield* (yield* GitHub).createLabel({ name: 'docs', color: '0075ca', description: '' })
 *   return yield* (yield* SkippedWrites).writes
 * })
 * const skipped = await Effect.runPromise(program.pipe(Effect.provide(Restricted), Effect.provide(GitHubMemory())))
 * skipped.length // => 0
 * ```
 */
export const Restricted = Layer.effectContext(
  Effect.gen(function* () {
    const inner = yield* GitHub
    const log = yield* Ref.make<ReadonlyArray<RecordedWrite>>([])
    return Context.make(GitHub, restrictedGitHub(inner, log)).pipe(Context.add(SkippedWrites, { writes: Ref.get(log) }))
  }),
)
