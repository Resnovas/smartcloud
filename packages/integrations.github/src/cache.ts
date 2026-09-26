/**
 * @file packages/integrations.github/src/cache.ts
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

import type { Check, Commit, Mergeable, Review } from '@resnovas/conditions'
import { Duration, Effect, Request, RequestResolver } from 'effect'
import type { GitHubError } from './errors.js'
import { isGraphqlWrite } from './graphql.js'
import type { Comment, DirectoryEntry, FileLocation, GitHubService, IssueSummary, Label, Repository } from './service.js'

// Every read the service makes is an Effect Request, so equal reads share one
// cache entry and concurrent equal reads share one call.

interface GetRepository extends Request.Request<Repository, GitHubError> {
  readonly _tag: 'GetRepository'
}
interface ListLabels extends Request.Request<ReadonlyArray<Label>, GitHubError> {
  readonly _tag: 'ListLabels'
}
interface ListOpenIssues extends Request.Request<ReadonlyArray<IssueSummary>, GitHubError> {
  readonly _tag: 'ListOpenIssues'
}
interface ListComments extends Request.Request<ReadonlyArray<Comment>, GitHubError> {
  readonly _tag: 'ListComments'
  readonly issue: number
}
interface ListCommits extends Request.Request<ReadonlyArray<Commit>, GitHubError> {
  readonly _tag: 'ListCommits'
  readonly pullRequest: number
}
interface ListFiles extends Request.Request<ReadonlyArray<string>, GitHubError> {
  readonly _tag: 'ListFiles'
  readonly pullRequest: number
}
interface ListReviews extends Request.Request<ReadonlyArray<Review>, GitHubError> {
  readonly _tag: 'ListReviews'
  readonly pullRequest: number
}
interface CountRequestedReviewers extends Request.Request<number, GitHubError> {
  readonly _tag: 'CountRequestedReviewers'
  readonly pullRequest: number
}
interface GetMergeable extends Request.Request<Mergeable, GitHubError> {
  readonly _tag: 'GetMergeable'
  readonly pullRequest: number
}
interface ListChecks extends Request.Request<ReadonlyArray<Check>, GitHubError> {
  readonly _tag: 'ListChecks'
  readonly pullRequest: number
}
// `ref` is always present, so every key for the default branch has the same shape.
interface Location {
  readonly owner: string
  readonly repo: string
  readonly path: string
  readonly ref: string | undefined
}
interface GetFile extends Request.Request<string, GitHubError>, Location {
  readonly _tag: 'GetFile'
}
interface ListDirectory extends Request.Request<ReadonlyArray<DirectoryEntry>, GitHubError>, Location {
  readonly _tag: 'ListDirectory'
}
interface RepositoryGet extends Request.Request<unknown, GitHubError> {
  readonly _tag: 'RepositoryGet'
  readonly path: string
}

const GetRepository = Request.tagged<GetRepository>('GetRepository')
const ListLabels = Request.tagged<ListLabels>('ListLabels')
const ListOpenIssues = Request.tagged<ListOpenIssues>('ListOpenIssues')
const ListComments = Request.tagged<ListComments>('ListComments')
const ListCommits = Request.tagged<ListCommits>('ListCommits')
const ListFiles = Request.tagged<ListFiles>('ListFiles')
const ListReviews = Request.tagged<ListReviews>('ListReviews')
const CountRequestedReviewers = Request.tagged<CountRequestedReviewers>('CountRequestedReviewers')
const GetMergeable = Request.tagged<GetMergeable>('GetMergeable')
const ListChecks = Request.tagged<ListChecks>('ListChecks')
const GetFile = Request.tagged<GetFile>('GetFile')
const ListDirectory = Request.tagged<ListDirectory>('ListDirectory')
const RepositoryGet = Request.tagged<RepositoryGet>('RepositoryGet')

const locationKey = (location: FileLocation): Location => ({
  owner: location.owner,
  repo: location.repo,
  path: location.path,
  ref: location.ref,
})

const locationOf = ({ owner, repo, path, ref }: Location): FileLocation => (ref === undefined ? { owner, repo, path } : { owner, repo, path, ref })

// Large enough that a run never evicts; entries live until a write invalidates them or the service goes.
const CAPACITY = 65_536

/**
 * The request caches a cached service keeps, one per family of reads, so a
 * write can invalidate exactly the families it affects.
 */
interface Caches {
  readonly repository: Request.Cache
  readonly labels: Request.Cache
  readonly issues: Request.Cache
  readonly comments: Request.Cache
  readonly pulls: Request.Cache
  readonly checks: Request.Cache
  readonly contents: Request.Cache
  readonly requests: Request.Cache
}

/**
 * Routes every read of a GitHub service through Effect Requests, cached for
 * the life of the returned service and invalidated by its own writes.
 *
 * @remarks
 * Each read is a `Request` resolved by a `RequestResolver` over the inner
 * service, run with request caching on against caches this service owns.
 * Equal reads are served from the cache, and concurrent equal reads wait on
 * the same call. Reads batch when a caller runs them with batching on,
 * though GitHub's REST API has no batch endpoints, so a batch still makes
 * one call per distinct read. A failed read is dropped from the cache so the
 * next one tries again.
 *
 * Writes invalidate what they may change, whether they succeed or fail,
 * since a failed write may still have been applied:
 *
 * - label writes invalidate the label list, and renames and deletions the
 *   open issues whose labels they change;
 * - adding or removing an issue's labels, and closing it, invalidate the
 *   open issues;
 * - a new comment invalidates that issue's comments, and an edit every
 *   issue's, since only the comment id is known;
 * - a review invalidates that pull request's reviews and requested
 *   reviewers, and a review request its requested reviewers;
 * - a proposal invalidates every file and directory read, the open
 *   issues, which gain its pull request, and every pull request read, since
 *   updating its branch changes that pull request's commits, files and
 *   mergeability;
 * - a check run write invalidates the CI checks, since smartcloud's own run
 *   is one of them, and a proposal invalidates them too, since it moves a
 *   pull request's head commit;
 * - a mergeability GitHub has not computed yet (`UNKNOWN`) is not cached,
 *   so the next read asks again;
 * - the checks on a commit are never cached, because a caller polling them
 *   needs every change;
 * - every write invalidates raw repository `GET`s, which can read anything,
 *   and a raw repository write or a GraphQL mutation invalidates everything.
 *
 * @internal
 *
 * @example
 * ```ts
 * const github = yield* cacheReads(raw)
 * yield* github.listLabels // one call
 * yield* github.listLabels // from the cache
 * yield* github.createLabel({ name: 'bug', color: 'd73a4a', description: '' })
 * yield* github.listLabels // a fresh call
 * ```
 *
 * @param inner - The service whose reads are cached; its writes are called as they are.
 * @returns The service with cached reads.
 */
export const cacheReads = (inner: GitHubService): Effect.Effect<GitHubService> =>
  Effect.gen(function* () {
    const makeCache = Request.makeCache({ capacity: CAPACITY, timeToLive: Duration.infinity })
    const caches: Caches = {
      repository: yield* makeCache,
      labels: yield* makeCache,
      issues: yield* makeCache,
      comments: yield* makeCache,
      pulls: yield* makeCache,
      checks: yield* makeCache,
      contents: yield* makeCache,
      requests: yield* makeCache,
    }

    const lookup =
      <R extends Request.Request<unknown, GitHubError>>(cache: Request.Cache, resolver: RequestResolver.RequestResolver<R>) =>
      (request: R): Effect.Effect<Request.Request.Success<R>, Request.Request.Error<R>> =>
        Effect.request(request, resolver).pipe(
          Effect.withRequestCaching(true),
          Effect.withRequestCache(cache),
          Effect.tapErrorCause(() => cache.invalidate(request)),
        )

    const getRepository = lookup(caches.repository, RequestResolver.fromEffect((_: GetRepository) => inner.getRepository))
    const listLabels = lookup(caches.labels, RequestResolver.fromEffect((_: ListLabels) => inner.listLabels))
    const listOpenIssues = lookup(caches.issues, RequestResolver.fromEffect((_: ListOpenIssues) => inner.listOpenIssues))
    const listComments = lookup(caches.comments, RequestResolver.fromEffect(({ issue }: ListComments) => inner.listComments(issue)))
    const listCommits = lookup(caches.pulls, RequestResolver.fromEffect(({ pullRequest }: ListCommits) => inner.listCommits(pullRequest)))
    const listFiles = lookup(caches.pulls, RequestResolver.fromEffect(({ pullRequest }: ListFiles) => inner.listFiles(pullRequest)))
    const listReviews = lookup(caches.pulls, RequestResolver.fromEffect(({ pullRequest }: ListReviews) => inner.listReviews(pullRequest)))
    const countRequestedReviewers = lookup(
      caches.pulls,
      RequestResolver.fromEffect(({ pullRequest }: CountRequestedReviewers) => inner.countRequestedReviewers(pullRequest)),
    )
    const readMergeable = lookup(caches.pulls, RequestResolver.fromEffect(({ pullRequest }: GetMergeable) => inner.getMergeable(pullRequest)))
    const getMergeable = (request: GetMergeable) =>
      Effect.tap(readMergeable(request), (mergeable) => (mergeable === 'UNKNOWN' ? caches.pulls.invalidate(request) : Effect.void))
    const listChecks = lookup(caches.checks, RequestResolver.fromEffect(({ pullRequest }: ListChecks) => inner.listChecks(pullRequest)))
    const getFile = lookup(caches.contents, RequestResolver.fromEffect((request: GetFile) => inner.getFile(locationOf(request))))
    const listDirectory = lookup(caches.contents, RequestResolver.fromEffect((request: ListDirectory) => inner.listDirectory(locationOf(request))))
    const repositoryGet = lookup(
      caches.requests,
      RequestResolver.fromEffect(({ path }: RepositoryGet) => inner.repositoryRequest({ method: 'GET', path })),
    )

    const everything = Object.values(caches)
    // Runs a write, then drops what it may have changed, even when it failed.
    const writing = <A>(write: Effect.Effect<A, GitHubError>, stale: ReadonlyArray<Effect.Effect<void>>): Effect.Effect<A, GitHubError> =>
      Effect.ensuring(write, Effect.all([caches.requests.invalidateAll, ...stale], { discard: true }))
    const invalidateAll = everything.map((cache) => cache.invalidateAll)

    return {
      coordinates: inner.coordinates,
      getRepository: getRepository(GetRepository({})),

      listLabels: listLabels(ListLabels({})),
      createLabel: (label) => writing(inner.createLabel(label), [caches.labels.invalidateAll]),
      updateLabel: (current, label) => writing(inner.updateLabel(current, label), [caches.labels.invalidateAll, caches.issues.invalidateAll]),
      deleteLabel: (name) => writing(inner.deleteLabel(name), [caches.labels.invalidateAll, caches.issues.invalidateAll]),

      addLabels: (issue, labels) => writing(inner.addLabels(issue, labels), [caches.issues.invalidateAll]),
      removeLabel: (issue, label) => writing(inner.removeLabel(issue, label), [caches.issues.invalidateAll]),
      listComments: (issue) => listComments(ListComments({ issue })),
      createComment: (issue, body) => writing(inner.createComment(issue, body), [caches.comments.invalidate(ListComments({ issue }))]),
      updateComment: (id, body) => writing(inner.updateComment(id, body), [caches.comments.invalidateAll]),
      listOpenIssues: listOpenIssues(ListOpenIssues({})),
      closeIssue: (issue) => writing(inner.closeIssue(issue), [caches.issues.invalidateAll]),

      listCommits: (pullRequest) => listCommits(ListCommits({ pullRequest })),
      listFiles: (pullRequest) => listFiles(ListFiles({ pullRequest })),
      listReviews: (pullRequest) => listReviews(ListReviews({ pullRequest })),
      countRequestedReviewers: (pullRequest) => countRequestedReviewers(CountRequestedReviewers({ pullRequest })),
      getMergeable: (pullRequest) => getMergeable(GetMergeable({ pullRequest })),
      listChecks: (pullRequest) => listChecks(ListChecks({ pullRequest })),
      createReview: (pullRequest, review) =>
        writing(inner.createReview(pullRequest, review), [
          caches.pulls.invalidate(ListReviews({ pullRequest })),
          caches.pulls.invalidate(CountRequestedReviewers({ pullRequest })),
        ]),
      requestReviewers: (pullRequest, logins) =>
        writing(inner.requestReviewers(pullRequest, logins), [caches.pulls.invalidate(CountRequestedReviewers({ pullRequest }))]),

      createCheckRun: (run) => writing(inner.createCheckRun(run), [caches.checks.invalidateAll]),
      updateCheckRun: (id, run) => writing(inner.updateCheckRun(id, run), [caches.checks.invalidateAll]),
      listCommitChecks: inner.listCommitChecks,

      getFile: (location) => getFile(GetFile(locationKey(location))),
      listDirectory: (location) => listDirectory(ListDirectory(locationKey(location))),
      proposeChanges: (proposal) =>
        writing(inner.proposeChanges(proposal), [caches.contents.invalidateAll, caches.issues.invalidateAll, caches.pulls.invalidateAll, caches.checks.invalidateAll]),

      repositoryRequest: (request) =>
        request.method === 'GET' && request.body === undefined
          ? repositoryGet(RepositoryGet({ path: request.path }))
          : request.method === 'GET'
            ? inner.repositoryRequest(request)
            : writing(inner.repositoryRequest(request), invalidateAll),
      graphql: (query, variables) =>
        isGraphqlWrite(query) ? writing(inner.graphql(query, variables), invalidateAll) : inner.graphql(query, variables),
    }
  })
