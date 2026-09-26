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
import { fromGraphqlErrors, fromStatus, type GitHubError, ValidationFailed } from './errors.js'
import { isGraphqlWrite } from './graphql.js'
import {
  type Annotation,
  type CheckRun,
  type CommitIdentity,
  GitHub,
  type GitHubService,
  type RepositoryCoordinates,
  type RepositoryRequest,
} from './service.js'

/** Everything the live service needs. */
export interface LiveOptions {
  readonly token: Redacted.Redacted<string>
  readonly coordinates: RepositoryCoordinates
  /** Replaces the global `fetch`; tests use it to serve canned responses. */
  readonly fetch?: typeof globalThis.fetch
  /** How rate-limited and failed calls are retried. Defaults to three jittered, exponential retries. */
  readonly retry?: Schedule.Schedule<unknown, GitHubError>
  /** Who proposed changes are committed and signed off as. Defaults to {@link DEFAULT_COMMITTER}. */
  readonly committer?: CommitIdentity
}

/**
 * The identity `GITHUB_TOKEN` pushes as. Commits name it as author and
 * committer explicitly, so the sign-off always matches the author and the
 * DCO check passes.
 */
export const DEFAULT_COMMITTER: CommitIdentity = {
  name: 'github-actions[bot]',
  email: '41898282+github-actions[bot]@users.noreply.github.com',
}

/**
 * Appends a DCO `Signed-off-by` trailer for an identity to a commit message.
 *
 * @param message - The commit message.
 * @param identity - Who signs off.
 * @returns The message with the trailer.
 */
export const signOff = (message: string, identity: CommitIdentity): string =>
  `${message}\n\nSigned-off-by: ${identity.name} <${identity.email}>`

// Mode 120000 is a symbolic link and type `commit` a submodule: neither is a
// file whose text can be read, so listings leave them out.
const EXECUTABLE = '100755'
const REGULAR = '100644'

interface TreeEntry {
  readonly path: string
  readonly mode: typeof EXECUTABLE | typeof REGULAR
  readonly type: 'blob'
  readonly sha: string | null
}

const treeEntry = (path: string, executable: boolean, sha: string | null): TreeEntry => ({
  path,
  mode: executable ? EXECUTABLE : REGULAR,
  type: 'blob',
  sha,
})

// `templates/`, `/templates` and `templates` name the same directory.
const directoryPath = (path: string) =>
  path
    .split('/')
    .filter((part) => part !== '')
    .join('/')

const DEFAULT_RETRY = Schedule.exponential('1 second').pipe(Schedule.jittered, Schedule.intersect(Schedule.recurs(3)))

const statusOf = (error: unknown): number | undefined =>
  typeof error === 'object' && error !== null && 'status' in error && typeof error.status === 'number' ? error.status : undefined

const messageOf = (error: unknown): string => (error instanceof Error ? error.message : String(error))

// Octokit throws this for a GraphQL response that carried an `errors` list.
const isGraphqlResponseError = (error: unknown): boolean => error instanceof Error && error.name === 'GraphqlResponseError'

const toGitHubError = (operation: string, error: unknown): GitHubError =>
  isGraphqlResponseError(error) ? fromGraphqlErrors(operation, messageOf(error)) : fromStatus(operation, statusOf(error), messageOf(error))

// A rate limit rejects a request before GitHub acts on it, so any call may repeat after one.
const rateLimited = (error: GitHubError) => error._tag === 'RateLimited'
// An outage can strike after GitHub has applied a write, so only calls that
// are safe to repeat also retry it; one that creates something would create it twice.
const transient = (error: GitHubError) => rateLimited(error) || error._tag === 'Unavailable'

// GitHub accepts at most 50 annotations per request; more are appended by updating the run.
const ANNOTATIONS_PER_REQUEST = 50

const annotationBatches = (annotations: ReadonlyArray<Annotation> = []): ReadonlyArray<ReadonlyArray<Annotation>> =>
  Array.from({ length: Math.max(1, Math.ceil(annotations.length / ANNOTATIONS_PER_REQUEST)) }, (_, index) =>
    annotations.slice(index * ANNOTATIONS_PER_REQUEST, (index + 1) * ANNOTATIONS_PER_REQUEST),
  )

const annotationsOf = (annotations: ReadonlyArray<Annotation> = []) =>
  annotations.map((annotation) => ({
    path: annotation.path,
    start_line: annotation.line,
    end_line: annotation.line,
    annotation_level: annotation.level,
    message: annotation.message,
    ...(annotation.title === undefined ? {} : { title: annotation.title }),
  }))

// Octokit reads these keys as request options rather than as body fields or
// variables, so a caller's map must never set them.
const OCTOKIT_OPTIONS: ReadonlySet<string> = new Set(['baseUrl', 'headers', 'mediaType', 'method', 'operationName', 'query', 'request', 'url'])

// A `.` or `..` segment, encoded or not, would climb out of `/repos/{owner}/{repo}`.
const isDotSegment = (segment: string) => {
  const decoded = segment.toLowerCase().replaceAll('%2e', '.')
  return decoded === '.' || decoded === '..'
}

// Why a repository request's path could leave the repository, or undefined when it cannot.
const unsafePath = (path: string): string | undefined => {
  if (path !== '' && !path.startsWith('/')) return 'must be empty or start with /'
  if (/[\\#{}]/.test(path)) return 'must not contain \\, #, { or }'
  const [route = ''] = path.split('?')
  return route.split('/').some(isDotSegment) ? 'must not contain . or .. segments' : undefined
}

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
 * Rate limits are retried with backoff. Outages are retried too, except
 * for calls that create something (comments, reviews, labels, check runs,
 * branches, pull requests, REST `POST`s and GraphQL mutations), where
 * GitHub may already have acted and a repeat would duplicate it. Other
 * failures surface at once as typed errors. Pull request reads are cached for the life of the
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
      // Every failure already surfaces as a typed error, so Octokit's own request log would only repeat it.
      log: { debug: () => undefined, info: () => undefined, warn: console.warn, error: () => undefined },
      ...(options.fetch === undefined ? {} : { request: { fetch: options.fetch } }),
    })
    const { owner, repo } = options.coordinates
    const retry = options.retry ?? DEFAULT_RETRY

    const call = <A>(
      operation: string,
      run: () => Promise<A>,
      retryWhile: (error: GitHubError) => boolean = transient,
    ): Effect.Effect<A, GitHubError> =>
      Effect.tryPromise({ try: run, catch: (error) => toGitHubError(operation, error) }).pipe(Effect.retry({ schedule: retry, while: retryWhile }))

    // Appends every annotation batch after the first to a run, one request each.
    const appendAnnotations = (check_run_id: number, run: CheckRun, batches: ReadonlyArray<ReadonlyArray<Annotation>>) =>
      Effect.forEach(
        batches,
        (annotations) =>
          call(
            'updateCheckRun: append annotations',
            () =>
              octokit.rest.checks.update({
                owner,
                repo,
                check_run_id,
                output: { title: run.title, summary: run.summary, annotations: annotationsOf(annotations) },
              }),
            rateLimited,
          ),
        { discard: true },
      )

    const repositoryRequest: GitHubService['repositoryRequest'] = (request: RepositoryRequest) => {
      const operation = `${request.method} /repos/${owner}/${repo}${request.path}`
      const problem = unsafePath(request.path)
      if (problem !== undefined) return Effect.fail(new ValidationFailed({ operation, detail: `the path ${problem}` }))
      return call(
        operation,
        // The body goes in `data`, so none of its keys can set the owner, the repository or a request option.
        () => octokit.request(`${request.method} /repos/{owner}/{repo}${request.path}`, { owner, repo, ...(request.body === undefined ? {} : { data: request.body }) }),
        request.method === 'POST' ? rateLimited : transient,
      ).pipe(Effect.map((response) => response.data))
    }

    const graphql: GitHubService['graphql'] = (query, variables) => {
      const reserved = Object.keys(variables).filter((name) => OCTOKIT_OPTIONS.has(name))
      if (reserved.length > 0) {
        return Effect.fail(new ValidationFailed({ operation: 'graphql', detail: `variables cannot be named ${reserved.join(', ')}` }))
      }
      return call('graphql', () => octokit.graphql(query, { ...variables }), isGraphqlWrite(query) ? rateLimited : transient)
    }

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
        Effect.flatMap(({ data }) => {
          if (Array.isArray(data) || !('content' in data) || typeof data.content !== 'string') {
            return Effect.fail(new ValidationFailed({ operation: 'getFile', detail: `${location.path} is not a file` }))
          }
          // Files over 1 MB come back with no inline content and an encoding of `none`: never read that as an empty file.
          return 'encoding' in data && data.encoding === 'base64'
            ? Effect.succeed(Buffer.from(data.content, 'base64').toString('utf8'))
            : Effect.fail(new ValidationFailed({ operation: 'getFile', detail: `${location.path} is too large to read (over 1 MB)` }))
        }),
      )

    const listDirectory: GitHubService['listDirectory'] = (location) =>
      call('listDirectory', () =>
        octokit.rest.git.getTree({
          owner: location.owner,
          repo: location.repo,
          // A tree-ish of `ref:path` names the directory's tree directly, so one call lists it.
          tree_sha: `${location.ref ?? 'HEAD'}:${directoryPath(location.path)}`,
          recursive: 'true',
        }),
      ).pipe(
        Effect.flatMap(({ data }) =>
          data.truncated
            ? Effect.fail(new ValidationFailed({ operation: 'listDirectory', detail: `${location.path} has too many files to list` }))
            : Effect.succeed(
                data.tree
                  .filter((entry) => entry.type === 'blob' && (entry.mode === REGULAR || entry.mode === EXECUTABLE))
                  .map((entry) => ({ path: entry.path, executable: entry.mode === EXECUTABLE })),
              ),
        ),
      )

    const committer = options.committer ?? DEFAULT_COMMITTER

    const proposeChanges: GitHubService['proposeChanges'] = (proposal) =>
      Effect.gen(function* () {
        // The proposal branch is force-updated below, so it must never be the
        // branch the pull request merges into.
        if (proposal.branch === proposal.base) {
          return yield* new ValidationFailed({ operation: 'proposeChanges', detail: `the proposal branch cannot be its base, ${proposal.base}` })
        }
        const baseRef = yield* call('proposeChanges: read base', () =>
          octokit.rest.git.getRef({ owner, repo, ref: `heads/${proposal.base}` }),
        )
        const baseSha = baseRef.data.object.sha
        const baseCommit = yield* call('proposeChanges: read base commit', () =>
          octokit.rest.git.getCommit({ owner, repo, commit_sha: baseSha }),
        )
        const written = yield* Effect.forEach(
          proposal.files,
          (file) =>
            call('proposeChanges: create blob', () =>
              octokit.rest.git.createBlob({ owner, repo, content: Buffer.from(file.content, 'utf8').toString('base64'), encoding: 'base64' }),
            ).pipe(Effect.map(({ data }) => treeEntry(file.path, file.executable, data.sha))),
          { concurrency: 4 },
        )
        const deleted = (proposal.deletions ?? []).map((path) => treeEntry(path, false, null))
        const tree = yield* call('proposeChanges: create tree', () =>
          octokit.rest.git.createTree({ owner, repo, base_tree: baseCommit.data.tree.sha, tree: [...written, ...deleted] }),
        )

        const branchSha = yield* call('proposeChanges: read branch', () =>
          octokit.rest.git.getRef({ owner, repo, ref: `heads/${proposal.branch}` }),
        ).pipe(
          Effect.map(({ data }) => data.object.sha),
          Effect.catchTag('NotFound', () => Effect.succeed(undefined)),
        )
        // A branch already holding exactly these changes on this base is left
        // alone, so a scheduled run does not push an identical commit each time.
        const current =
          branchSha === undefined
            ? undefined
            : (yield* call('proposeChanges: read branch commit', () =>
                octokit.rest.git.getCommit({ owner, repo, commit_sha: branchSha }),
              )).data
        const upToDate =
          current !== undefined &&
          current.tree.sha === tree.data.sha &&
          current.parents.map((parent) => parent.sha).join(' ') === baseSha
        if (!upToDate) {
          const commit = yield* call('proposeChanges: create commit', () =>
            octokit.rest.git.createCommit({
              owner,
              repo,
              message: signOff(proposal.title, committer),
              tree: tree.data.sha,
              parents: [baseSha],
              author: committer,
              committer,
            }),
          )
          yield* branchSha === undefined
            ? call(
                'proposeChanges: create branch',
                () => octokit.rest.git.createRef({ owner, repo, ref: `refs/heads/${proposal.branch}`, sha: commit.data.sha }),
                rateLimited,
              )
            : call('proposeChanges: update branch', () =>
                octokit.rest.git.updateRef({ owner, repo, ref: `heads/${proposal.branch}`, sha: commit.data.sha, force: true }),
              )
        }

        const open = yield* call('proposeChanges: find pull request', () =>
          octokit.rest.pulls.list({ owner, repo, head: `${owner}:${proposal.branch}`, base: proposal.base, state: 'open', per_page: 1 }),
        )
        const existing = open.data[0]
        if (existing !== undefined) {
          yield* call('proposeChanges: update pull request', () =>
            octokit.rest.pulls.update({ owner, repo, pull_number: existing.number, title: proposal.title, body: proposal.body }),
          )
          return { number: existing.number, url: existing.html_url, created: false }
        }
        const created = yield* call(
          'proposeChanges: open pull request',
          () =>
            octokit.rest.pulls.create({
              owner,
              repo,
              head: proposal.branch,
              base: proposal.base,
              title: proposal.title,
              body: proposal.body,
            }),
          rateLimited,
        )
        return { number: created.data.number, url: created.data.html_url, created: true }
      })

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
        Effect.asVoid(call('createLabel', () => octokit.rest.issues.createLabel({ owner, repo, ...label }), rateLimited)),
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
          Effect.map((comments) =>
            comments.map((comment) => ({
              id: comment.id,
              body: comment.body ?? '',
              author: comment.user?.login ?? '',
              bot: comment.user?.type === 'Bot',
            })),
          ),
        ),
      createComment: (issue_number, body) =>
        call('createComment', () => octokit.rest.issues.createComment({ owner, repo, issue_number, body }), rateLimited).pipe(
          Effect.map(({ data }) => ({ id: data.id, body: data.body ?? '', author: data.user?.login ?? '', bot: data.user?.type === 'Bot' })),
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
        Effect.asVoid(call('createReview', () => octokit.rest.pulls.createReview({ owner, repo, pull_number, ...review }), rateLimited)),
      requestReviewers: (pull_number, logins) =>
        Effect.asVoid(
          call('requestReviewers', () => octokit.rest.pulls.requestReviewers({ owner, repo, pull_number, reviewers: [...logins] })),
        ),
      createCheckRun: (run) => {
        const [first = [], ...rest] = annotationBatches(run.annotations)
        return call(
          'createCheckRun',
          () =>
            octokit.rest.checks.create({
              owner,
              repo,
              name: run.name,
              head_sha: run.headSha,
              status: run.status,
              ...(run.conclusion === undefined ? {} : { conclusion: run.conclusion }),
              output: { title: run.title, summary: run.summary, annotations: annotationsOf(first) },
            }),
          rateLimited,
        ).pipe(
          Effect.map(({ data }) => data.id),
          Effect.tap((id) => appendAnnotations(id, run, rest)),
        )
      },
      updateCheckRun: (check_run_id, run) => {
        const [first = [], ...rest] = annotationBatches(run.annotations)
        return call(
          'updateCheckRun',
          () =>
            octokit.rest.checks.update({
              owner,
              repo,
              check_run_id,
              status: run.status,
              ...(run.conclusion === undefined ? {} : { conclusion: run.conclusion }),
              output: { title: run.title, summary: run.summary, annotations: annotationsOf(first) },
            }),
          // Annotations are appended, so an update that carries them is not safe to repeat.
          first.length === 0 ? transient : rateLimited,
        ).pipe(Effect.zipRight(appendAnnotations(check_run_id, run, rest)))
      },
      getFile,
      listDirectory,
      proposeChanges,
      repositoryRequest,
      graphql,
    }
  })

/**
 * The live GitHub service for the repository in `GITHUB_REPOSITORY`,
 * authenticated with `GITHUB_TOKEN`. Both are read through Effect Config,
 * and the token stays redacted. `SMARTCLOUD_COMMITTER_NAME` and
 * `SMARTCLOUD_COMMITTER_EMAIL` override who proposed changes are committed
 * and signed off as, for a token that pushes as another identity.
 */
export const GitHubLive = Layer.effect(
  GitHub,
  Effect.gen(function* () {
    const token = yield* Config.redacted('GITHUB_TOKEN')
    const repository = yield* Config.string('GITHUB_REPOSITORY').pipe(
      Config.validate({ message: 'GITHUB_REPOSITORY must be owner/name', validation: (value) => /^[^/\s]+\/[^/\s]+$/.test(value) }),
    )
    const committer = yield* Config.all({
      name: Config.string('SMARTCLOUD_COMMITTER_NAME').pipe(Config.withDefault(DEFAULT_COMMITTER.name)),
      email: Config.string('SMARTCLOUD_COMMITTER_EMAIL').pipe(Config.withDefault(DEFAULT_COMMITTER.email)),
    })
    const [owner = '', repo = ''] = repository.split('/')
    return yield* makeLiveGitHub({ token, coordinates: { owner, repo }, committer })
  }),
)
