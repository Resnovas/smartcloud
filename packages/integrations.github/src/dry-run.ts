/**
 * @file packages/integrations.github/src/dry-run.ts
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
import { isGraphqlWrite } from './graphql.js'
import { GitHub, type GitHubService } from './service.js'

/** A write the dry-run layer recorded instead of performing. */
export interface RecordedWrite {
  readonly operation: string
  readonly details: Readonly<Record<string, unknown>>
}

/**
 * The writes recorded by the dry-run layer, in the order they were made.
 *
 * @example
 * ```ts import.meta.vitest name="DryRunLog"
 * import { Effect } from 'effect'
 * import { DryRun, DryRunLog, GitHub, GitHubMemory } from '@resnovas/integrations.github'
 *
 * const program = Effect.gen(function* () {
 *   yield* (yield* GitHub).closeIssue(1)
 *   return yield* (yield* DryRunLog).writes
 * })
 * const writes = await Effect.runPromise(program.pipe(Effect.provide(DryRun), Effect.provide(GitHubMemory())))
 * writes[0]?.operation // => 'closeIssue'
 * ```
 */
export class DryRunLog extends Context.Tag('@resnovas/integrations.github/DryRunLog')<
  DryRunLog,
  { readonly writes: Effect.Effect<ReadonlyArray<RecordedWrite>> }
>() {}

// A URL in a request body, such as a webhook's, can carry a token in its
// userinfo, path, query or fragment, so the recorded copy keeps only its origin.
const originOnly = (value: string): string => {
  try {
    const url = new URL(value)
    return url.href === `${url.origin}/` ? value : `${url.origin}/...`
  } catch {
    return '[redacted]'
  }
}

const redactUrls = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(redactUrls)
  if (typeof value !== 'object' || value === null) return value
  return Object.fromEntries(
    Object.entries(value).map(([key, inner]) => [
      key,
      key === 'url' && typeof inner === 'string' ? originOnly(inner) : redactUrls(inner),
    ]),
  )
}

/**
 * Wraps a GitHub service so reads reach GitHub and writes are only recorded.
 *
 * @remarks
 * Used by the action's `dryRun` input and every CLI dry run. Writes that
 * return a value return a placeholder: comment and check run ids, and
 * proposed and backported pull request numbers, of `0`.
 * GraphQL mutations count as writes wherever they appear in the document,
 * after comments or fragments included; queries pass through.
 *
 * @example
 * ```ts import.meta.vitest name="dryRunGitHub"
 * import { Effect, Ref } from 'effect'
 * import { dryRunGitHub, makeMemoryGitHub, type RecordedWrite } from '@resnovas/integrations.github'
 *
 * const log = Ref.unsafeMake<ReadonlyArray<RecordedWrite>>([])
 * const memory = makeMemoryGitHub({ labels: [{ name: 'bug', color: 'd73a4a', description: '' }] })
 * await Effect.runPromise(dryRunGitHub(memory.service, log).deleteLabel('bug'))
 * Effect.runSync(Ref.get(log)).length // => 1
 * memory.state.labels.length // => 1
 * ```
 *
 * @param inner - The service to read through.
 * @param log - Where writes are recorded.
 * @returns The wrapped service.
 */
export const dryRunGitHub = (inner: GitHubService, log: Ref.Ref<ReadonlyArray<RecordedWrite>>): GitHubService => {
  // The details can name labels, people and files, so only the operation is logged.
  const record = (operation: string, details: Readonly<Record<string, unknown>>) =>
    Ref.update(log, (writes) => [...writes, { operation, details }]).pipe(
      Effect.zipRight(
        Effect.logDebug(`dry run: recorded ${operation}`).pipe(
          Effect.annotateLogs({ 'github.operation': operation, dry_run: true }),
        ),
      ),
    )
  return {
    ...inner,
    createLabel: (label) => record('createLabel', { label }),
    updateLabel: (current, label) => record('updateLabel', { current, label }),
    deleteLabel: (name) => record('deleteLabel', { name }),
    addLabels: (issue, labels) => record('addLabels', { issue, labels }),
    removeLabel: (issue, label) => record('removeLabel', { issue, label }),
    createComment: (issue, body) =>
      Effect.as(record('createComment', { issue, body }), { id: 0, body, author: '', bot: true }),
    updateComment: (id, body) => record('updateComment', { id, body }),
    closeIssue: (issue) => record('closeIssue', { issue }),
    lockIssue: (issue, reason) => record('lockIssue', { issue, reason }),
    createReview: (pullRequest, review) => record('createReview', { pullRequest, review }),
    requestReviewers: (pullRequest, logins) => record('requestReviewers', { pullRequest, logins }),
    createCheckRun: (run) => Effect.as(record('createCheckRun', { run }), 0),
    updateCheckRun: (id, run) => record('updateCheckRun', { id, run }),
    proposeChanges: (proposal) =>
      Effect.as(record('proposeChanges', { proposal }), { number: 0, url: '', created: false }),
    backport: (request) =>
      Effect.as(record('backport', { request }), { status: 'opened' as const, number: 0, url: '' }),
    repositoryRequest: (request) =>
      request.method === 'GET'
        ? inner.repositoryRequest(request)
        : Effect.as(record('repositoryRequest', { request: redactUrls(request) }), null),
    graphql: (query, variables) =>
      isGraphqlWrite(query)
        ? Effect.as(record('graphql', { query, variables }), null)
        : inner.graphql(query, variables),
  }
}

/**
 * Turns whichever GitHub layer is provided into a dry run, and provides the
 * {@link DryRunLog} of what it would have written.
 *
 * @example
 * ```ts import.meta.vitest name="DryRun"
 * import { Effect } from 'effect'
 * import { DryRun, GitHub, GitHubMemory } from '@resnovas/integrations.github'
 *
 * const program = Effect.flatMap(GitHub, (github) => github.createComment(7, 'Thanks!'))
 * const comment = await Effect.runPromise(program.pipe(Effect.provide(DryRun), Effect.provide(GitHubMemory())))
 * comment.id // => 0
 * ```
 */
export const DryRun = Layer.effectContext(
  Effect.gen(function* () {
    const inner = yield* GitHub
    const log = yield* Ref.make<ReadonlyArray<RecordedWrite>>([])
    return Context.make(GitHub, dryRunGitHub(inner, log)).pipe(Context.add(DryRunLog, { writes: Ref.get(log) }))
  }),
)
