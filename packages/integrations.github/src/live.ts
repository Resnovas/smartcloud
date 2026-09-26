/**
 * @file packages/integrations.github/src/live.ts
 *
 * Copyright 2021 Jonathan Stevens trading as Resnovas. All rights reserved.
 * Licensed under the Fair Core License, Version 1.0, MIT Future License
 * (FCL-1.0-MIT); see LICENSE. You may not move, change, disable or circumvent
 * the licence key functionality, or modify any part of the software that the
 * licence key protects.
 *
 * Contributions are made under the Developer Certificate of Origin (DCO.md) and
 * the Contributing Guidelines (CONTRIBUTING.md), subject to the Code of Conduct
 * (CODE_OF_CONDUCT.md) and the Eventiva Cooperation Commitment
 * (COOPERATION_COMMITMENT.md).
 *
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE.
 */

import { Octokit } from '@octokit/rest'
import type { Review } from '@resnovas/conditions'
import { Config, Effect, Layer, Redacted, Schedule } from 'effect'
import { fromStatus, type GitHubError, ValidationFailed } from './errors.js'
import { GitHub, type GitHubService, type RepositoryCoordinates } from './service.js'

/** Everything the live service needs. */
export interface LiveOptions {
  readonly token: Redacted.Redacted<string>
  readonly coordinates: RepositoryCoordinates
  /** Replaces the global `fetch`; tests use it to serve canned responses. */
  readonly fetch?: typeof globalThis.fetch
  /** How rate-limited and failed calls are retried. Defaults to three jittered, exponential retries. */
  readonly retry?: Schedule.Schedule<unknown, GitHubError>
}

const DEFAULT_RETRY = Schedule.exponential('1 second').pipe(Schedule.jittered, Schedule.intersect(Schedule.recurs(3)))

const statusOf = (error: unknown): number | undefined =>
  typeof error === 'object' && error !== null && 'status' in error && typeof error.status === 'number' ? error.status : undefined

const messageOf = (error: unknown): string => (error instanceof Error ? error.message : String(error))

const REVIEW_STATES: ReadonlySet<string> = new Set(['APPROVED', 'CHANGES_REQUESTED', 'COMMENTED', 'DISMISSED', 'PENDING'])
const isReviewState = (state: string): state is Review['state'] => REVIEW_STATES.has(state)
// An unknown future state is treated as a comment: it neither approves nor blocks.
const reviewState = (state: string): Review['state'] => (isReviewState(state) ? state : 'COMMENTED')

const labelName = (label: string | { readonly name?: string | undefined }): string =>
  typeof label === 'string' ? label : (label.name ?? '')

/**
 * Builds the live GitHub service on Octokit.
 *
 * @remarks
 * Rate limits and outages are retried with backoff; other failures surface
 * at once as typed errors. Pull request reads are cached for the life of the
 * service, because a run sees a single, fixed pull request.
 *
 * @param options - Token, repository and optional test hooks.
 * @returns The service.
 */
export const makeLiveGitHub = (options: LiveOptions): Effect.Effect<GitHubService> =>
  Effect.gen(function* () {
    const octokit = new Octokit({
      auth: Redacted.value(options.token),
      userAgent: 'smartcloud',
      ...(options.fetch === undefined ? {} : { request: { fetch: options.fetch } }),
    })
    const { owner, repo } = options.coordinates
    const retry = options.retry ?? DEFAULT_RETRY

    const call = <A>(operation: string, run: () => Promise<A>): Effect.Effect<A, GitHubError> =>
      Effect.tryPromise({ try: run, catch: (error) => fromStatus(operation, statusOf(error), messageOf(error)) }).pipe(
        Effect.retry({ schedule: retry, while: (error) => error._tag === 'RateLimited' || error._tag === 'Unavailable' }),
      )

    const listCommits = yield* Effect.cachedFunction((pull_number: number) =>
      call('listCommits', () => octokit.paginate(octokit.rest.pulls.listCommits, { owner, repo, pull_number, per_page: 100 })).pipe(
        Effect.map((commits) =>
          commits.map((commit) => ({
            sha: commit.sha,
            message: commit.commit.message,
            authorName: commit.commit.author?.name ?? '',
            authorEmail: commit.commit.author?.email ?? '',
            parents: commit.parents.length,
          })),
        ),
      ),
    )

    const listFiles = yield* Effect.cachedFunction((pull_number: number) =>
      call('listFiles', () => octokit.paginate(octokit.rest.pulls.listFiles, { owner, repo, pull_number, per_page: 100 })).pipe(
        Effect.map((files) => files.map((file) => file.filename)),
      ),
    )

    const listReviews = yield* Effect.cachedFunction((pull_number: number) =>
      call('listReviews', () => octokit.paginate(octokit.rest.pulls.listReviews, { owner, repo, pull_number, per_page: 100 })).pipe(
        Effect.map((reviews) => reviews.map((review) => ({ author: review.user?.login ?? '', state: reviewState(review.state) }))),
      ),
    )

    const countRequestedReviewers = yield* Effect.cachedFunction((pull_number: number) =>
      call('countRequestedReviewers', () => octokit.rest.pulls.listRequestedReviewers({ owner, repo, pull_number })).pipe(
        Effect.map(({ data }) => data.users.length + data.teams.length),
      ),
    )

    const getFile: GitHubService['getFile'] = (location) =>
      call('getFile', () =>
        octokit.rest.repos.getContent({
          owner: location.owner,
          repo: location.repo,
          path: location.path,
          ...(location.ref === undefined ? {} : { ref: location.ref }),
        }),
      ).pipe(
        Effect.flatMap(({ data }) =>
          !Array.isArray(data) && 'content' in data && typeof data.content === 'string'
            ? Effect.succeed(Buffer.from(data.content, 'base64').toString('utf8'))
            : Effect.fail(new ValidationFailed({ operation: 'getFile', detail: `${location.path} is not a file` })),
        ),
      )

    return {
      coordinates: options.coordinates,
      getRepository: call('getRepository', () => octokit.rest.repos.get({ owner, repo })).pipe(
        Effect.map(({ data }) => ({
          owner: data.owner.login,
          name: data.name,
          fullName: data.full_name,
          nodeId: data.node_id,
          private: data.private,
          defaultBranch: data.default_branch,
        })),
      ),
      listLabels: call('listLabels', () => octokit.paginate(octokit.rest.issues.listLabelsForRepo, { owner, repo, per_page: 100 })).pipe(
        Effect.map((labels) => labels.map((label) => ({ name: label.name, color: label.color, description: label.description ?? '' }))),
      ),
      createLabel: (label) =>
        Effect.asVoid(call('createLabel', () => octokit.rest.issues.createLabel({ owner, repo, ...label }))),
      updateLabel: (current, label) =>
        Effect.asVoid(
          call('updateLabel', () =>
            octokit.rest.issues.updateLabel({
              owner,
              repo,
              name: current,
              new_name: label.name,
              color: label.color,
              description: label.description,
            }),
          ),
        ),
      deleteLabel: (name) => Effect.asVoid(call('deleteLabel', () => octokit.rest.issues.deleteLabel({ owner, repo, name }))),
      addLabels: (issue_number, labels) =>
        Effect.asVoid(call('addLabels', () => octokit.rest.issues.addLabels({ owner, repo, issue_number, labels: [...labels] }))),
      removeLabel: (issue_number, name) =>
        Effect.asVoid(call('removeLabel', () => octokit.rest.issues.removeLabel({ owner, repo, issue_number, name }))),
      listComments: (issue_number) =>
        call('listComments', () => octokit.paginate(octokit.rest.issues.listComments, { owner, repo, issue_number, per_page: 100 })).pipe(
          Effect.map((comments) => comments.map((comment) => ({ id: comment.id, body: comment.body ?? '', author: comment.user?.login ?? '' }))),
        ),
      createComment: (issue_number, body) =>
        call('createComment', () => octokit.rest.issues.createComment({ owner, repo, issue_number, body })).pipe(
          Effect.map(({ data }) => ({ id: data.id, body: data.body ?? '', author: data.user?.login ?? '' })),
        ),
      updateComment: (comment_id, body) =>
        Effect.asVoid(call('updateComment', () => octokit.rest.issues.updateComment({ owner, repo, comment_id, body }))),
      listOpenIssues: call('listOpenIssues', () =>
        octokit.paginate(octokit.rest.issues.listForRepo, { owner, repo, state: 'open', per_page: 100 }),
      ).pipe(
        Effect.map((issues) =>
          issues.map((issue) => ({
            number: issue.number,
            title: issue.title,
            body: issue.body ?? '',
            author: issue.user?.login ?? '',
            open: issue.state === 'open',
            locked: issue.locked,
            labels: issue.labels.map(labelName),
            updatedAt: new Date(issue.updated_at),
            isPullRequest: issue.pull_request !== undefined,
          })),
        ),
      ),
      closeIssue: (issue_number) =>
        Effect.asVoid(call('closeIssue', () => octokit.rest.issues.update({ owner, repo, issue_number, state: 'closed' }))),
      listCommits,
      listFiles,
      listReviews,
      countRequestedReviewers,
      createReview: (pull_number, review) =>
        Effect.asVoid(call('createReview', () => octokit.rest.pulls.createReview({ owner, repo, pull_number, ...review }))),
      requestReviewers: (pull_number, logins) =>
        Effect.asVoid(
          call('requestReviewers', () => octokit.rest.pulls.requestReviewers({ owner, repo, pull_number, reviewers: [...logins] })),
        ),
      createCheckRun: (run) =>
        call('createCheckRun', () =>
          octokit.rest.checks.create({
            owner,
            repo,
            name: run.name,
            head_sha: run.headSha,
            status: run.status,
            ...(run.conclusion === undefined ? {} : { conclusion: run.conclusion }),
            output: { title: run.title, summary: run.summary, annotations: annotationsOf(run.annotations) },
          }),
        ).pipe(Effect.map(({ data }) => data.id)),
      updateCheckRun: (check_run_id, run) =>
        Effect.asVoid(
          call('updateCheckRun', () =>
            octokit.rest.checks.update({
              owner,
              repo,
              check_run_id,
              status: run.status,
              ...(run.conclusion === undefined ? {} : { conclusion: run.conclusion }),
              output: { title: run.title, summary: run.summary, annotations: annotationsOf(run.annotations) },
            }),
          ),
        ),
      getFile,
      repositoryRequest: (request) =>
        call(`${request.method} /repos/${owner}/${repo}${request.path}`, () =>
          octokit.request(`${request.method} /repos/{owner}/{repo}${request.path}`, { owner, repo, ...request.body }),
        ).pipe(Effect.map((response) => response.data)),
      graphql: (query, variables) => call('graphql', () => octokit.graphql(query, { ...variables })),
    }
  })

// GitHub accepts at most 50 annotations per request.
const annotationsOf = (annotations: GitHubServiceAnnotations) =>
  (annotations ?? []).slice(0, 50).map((annotation) => ({
    path: annotation.path,
    start_line: annotation.line,
    end_line: annotation.line,
    annotation_level: annotation.level,
    message: annotation.message,
    ...(annotation.title === undefined ? {} : { title: annotation.title }),
  }))

type GitHubServiceAnnotations = Parameters<GitHubService['createCheckRun']>[0]['annotations']

/**
 * The live GitHub service for the repository in `GITHUB_REPOSITORY`,
 * authenticated with `GITHUB_TOKEN`. Both are read through Effect Config,
 * and the token stays redacted.
 */
export const GitHubLive = Layer.effect(
  GitHub,
  Effect.gen(function* () {
    const token = yield* Config.redacted('GITHUB_TOKEN')
    const repository = yield* Config.string('GITHUB_REPOSITORY').pipe(
      Config.validate({ message: 'GITHUB_REPOSITORY must be owner/name', validation: (value) => /^[^/\s]+\/[^/\s]+$/.test(value) }),
    )
    const [owner = '', repo = ''] = repository.split('/')
    return yield* makeLiveGitHub({ token, coordinates: { owner, repo } })
  }),
)
