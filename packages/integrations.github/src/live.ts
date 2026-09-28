/**
 * @file packages/integrations.github/src/live.ts
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

import { Octokit } from '@octokit/rest'
import { AsyncLocalStorage } from 'node:async_hooks'
import { Association, type CheckState, type Mergeable, type Reactions, type Review } from '@resnovas/conditions'
import { Config, Effect, Layer, Option, Redacted, Ref, Schedule, Schema } from 'effect'
import { cacheReads } from './cache.js'
import { fromGraphqlErrors, fromStatus, type GitHubError, ValidationFailed } from './errors.js'
import { isGraphqlWrite } from './graphql.js'
import { type CallDetails, instrumentCall, statusTracker } from './telemetry.js'
import {
  type Annotation,
  type CheckRun,
  type CommitCheck,
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
  /**
   * Who proposed changes are committed and signed off as. Left unset, GitHub
   * records the token's own identity and signs the commit.
   */
  readonly committer?: CommitIdentity
  /**
   * The token the checks on a commit are read with; defaults to `token`. The
   * action passes the workflow token, whose `checks: read` and
   * `statuses: read` the workflow grants, because `token` can be a personal
   * access token without those scopes.
   */
  readonly checksToken?: Redacted.Redacted<string>
  /** How often a pull request's mergeability is read again while GitHub is still computing it. Defaults to three more reads, two seconds apart. */
  readonly mergeablePoll?: Schedule.Schedule<unknown, Mergeable>
}

// The REST repository fields the settings feature compares against, so it
// can leave out a value the repository already has.
const SETTINGS_FIELDS = [
  'allow_merge_commit',
  'allow_squash_merge',
  'allow_rebase_merge',
  'allow_auto_merge',
  'allow_update_branch',
  'delete_branch_on_merge',
  'web_commit_signoff_required',
  'has_wiki',
  'has_discussions',
  'squash_merge_commit_title',
  'squash_merge_commit_message',
] as const

const currentSettings = (data: object): Record<string, boolean | string> => {
  const current: Record<string, boolean | string> = {}
  for (const field of SETTINGS_FIELDS) {
    const value: unknown = (data as Record<string, unknown>)[field]
    if (typeof value === 'boolean' || typeof value === 'string') current[field] = value
  }
  return current
}

/**
 * The `external_id` on every check run smartcloud creates, so a reader of a
 * commit's checks can tell smartcloud's runs from another publisher's run
 * of the same name.
 *
 * @example
 * ```ts import.meta.vitest name="CHECK_RUN_EXTERNAL_ID"
 * import { CHECK_RUN_EXTERNAL_ID } from '@resnovas/integrations.github'
 *
 * CHECK_RUN_EXTERNAL_ID // => 'smartcloud'
 * ```
 */
export const CHECK_RUN_EXTERNAL_ID = 'smartcloud'

/**
 * The identity the workflow token commits as, and the first guess at the
 * identity to sign a proposed commit off as.
 *
 * @remarks
 * A proposed commit names no author, so GitHub records the token's own
 * identity (the workflow token's `github-actions[bot]`, or a GitHub App's
 * bot) and signs the commit. When the identity GitHub recorded differs from
 * this guess, the commit is made again signed off as that identity, so the
 * sign-off always matches the author and the DCO check passes.
 *
 * @example
 * ```ts import.meta.vitest name="DEFAULT_COMMITTER"
 * import { DEFAULT_COMMITTER } from '@resnovas/integrations.github'
 *
 * DEFAULT_COMMITTER.name // => 'github-actions[bot]'
 * ```
 */
export const DEFAULT_COMMITTER: CommitIdentity = {
  name: 'github-actions[bot]',
  email: '41898282+github-actions[bot]@users.noreply.github.com',
}

/**
 * Appends a DCO `Signed-off-by` trailer for an identity to a commit message.
 *
 * @example
 * ```ts import.meta.vitest name="signOff"
 * import { signOff } from '@resnovas/integrations.github'
 *
 * signOff('fix: typo', { name: 'Ann', email: 'ann@example.com' }) // => 'fix: typo\n\nSigned-off-by: Ann <ann@example.com>'
 * ```
 *
 * @param message - The commit message.
 * @param identity - Who signs off.
 * @returns The message with the trailer.
 */
export const signOff = (message: string, identity: CommitIdentity): string =>
  `${message}\n\nSigned-off-by: ${identity.name} <${identity.email}>`

// Mode 120000 is a symbolic link and type `commit` a submodule: neither is a
// file whose text can be read, so listings leave them out.
// GitHub may add associations; an unknown one is left out of a listed item.
const isAssociation = Schema.is(Association)

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

const DEFAULT_MERGEABLE_POLL = Schedule.spaced('2 seconds').pipe(Schedule.intersect(Schedule.recurs(3)))

// GitHub leaves `mergeable` null until its background job has compared the branches.
const mergeableOf = (mergeable: boolean | null): Mergeable =>
  mergeable === null ? 'UNKNOWN' : mergeable ? 'MERGEABLE' : 'CONFLICTING'

// A completed check run passes when it succeeded, or finished neutral or skipped.
const PASSING = new Set(['success', 'neutral', 'skipped'])
const runState = (run: { readonly status: string; readonly conclusion: string | null }): CheckState =>
  run.status !== 'completed' ? 'pending' : PASSING.has(run.conclusion ?? '') ? 'success' : 'failure'
// Commit statuses are `error`, `failure`, `pending` or `success`.
const statusState = (state: string): CheckState => (state === 'success' || state === 'pending' ? state : 'failure')

const statusOf = (error: unknown): number | undefined =>
  typeof error === 'object' && error !== null && 'status' in error && typeof error.status === 'number'
    ? error.status
    : undefined

const messageOf = (error: unknown): string => (error instanceof Error ? error.message : String(error))

// Octokit throws this for a GraphQL response that carried an `errors` list.
const isGraphqlResponseError = (error: unknown): boolean =>
  error instanceof Error && error.name === 'GraphqlResponseError'

const toGitHubError = (operation: string, error: unknown): GitHubError =>
  isGraphqlResponseError(error)
    ? fromGraphqlErrors(operation, messageOf(error))
    : fromStatus(operation, statusOf(error), messageOf(error))

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
const OCTOKIT_OPTIONS: ReadonlySet<string> = new Set([
  'baseUrl',
  'headers',
  'mediaType',
  'method',
  'operationName',
  'query',
  'request',
  'url',
])

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

const REVIEW_STATES: ReadonlySet<string> = new Set([
  'APPROVED',
  'CHANGES_REQUESTED',
  'COMMENTED',
  'DISMISSED',
  'PENDING',
])
const isReviewState = (state: string): state is Review['state'] => REVIEW_STATES.has(state)
// An unknown future state is treated as a comment: it neither approves nor blocks.
const reviewState = (state: string): Review['state'] => (isReviewState(state) ? state : 'COMMENTED')

// Neutral and skipped runs let a pull request merge, as they do for GitHub's own required checks.
const PASSING_CONCLUSIONS: ReadonlySet<string> = new Set(['success', 'neutral', 'skipped'])

const checkRunCheck = (run: {
  readonly id: number
  readonly name: string
  readonly status: string
  readonly conclusion: string | null
  readonly html_url: string | null
  readonly details_url: string | null
  readonly external_id: string | null
  readonly app: { readonly slug?: string | undefined } | null
}): CommitCheck => {
  const url = run.html_url ?? run.details_url
  const state =
    run.status !== 'completed' ? 'pending' : PASSING_CONCLUSIONS.has(run.conclusion ?? '') ? 'success' : 'failure'
  const app = run.app?.slug
  return {
    name: run.name,
    source: 'checkRun',
    id: run.id,
    state,
    detail: run.status === 'completed' ? (run.conclusion ?? 'completed') : run.status,
    ...(app === undefined ? {} : { app }),
    // GitHub stores an empty string when a publisher gives none.
    ...(run.external_id === null || run.external_id === '' ? {} : { externalId: run.external_id }),
    ...(url === null ? {} : { url }),
  }
}

const statusCheck = (status: {
  readonly context: string
  readonly state: string
  readonly target_url: string | null
}): CommitCheck => ({
  name: status.context,
  source: 'status',
  state: status.state === 'pending' ? 'pending' : status.state === 'success' ? 'success' : 'failure',
  detail: status.state,
  ...(status.target_url === null ? {} : { url: status.target_url }),
})

// GitHub's reaction rollup on an issue or pull request, without its total and URL.
const reactionsOf = (rollup: Reactions): Reactions => ({
  '+1': rollup['+1'],
  '-1': rollup['-1'],
  laugh: rollup.laugh,
  hooray: rollup.hooray,
  confused: rollup.confused,
  heart: rollup.heart,
  rocket: rollup.rocket,
  eyes: rollup.eyes,
})

const NO_REACTIONS: Reactions = { '+1': 0, '-1': 0, laugh: 0, hooray: 0, confused: 0, heart: 0, rocket: 0, eyes: 0 }

// `X-OAuth-Scopes` is a comma-separated list, empty for a classic token with no scopes and absent for a token without scopes.
const scopesOf = (header: string | number | undefined): ReadonlyArray<string> | undefined =>
  header === undefined
    ? undefined
    : String(header)
        .split(',')
        .map((scope) => scope.trim())
        .filter((scope) => scope !== '')

const labelName = (label: string | { readonly name?: string | undefined }): string =>
  typeof label === 'string' ? label : (label.name ?? '')

// How many responses a client keeps ETags for, before it starts over.
const CONDITIONAL_CAPACITY = 1_000

type Response = Awaited<ReturnType<Octokit['request']>>

// The rate limit the latest response of the current call reported. Each call
// runs its requests inside its own cell, so concurrent calls on one client
// never read another call's value.
const callQuota = new AsyncLocalStorage<{ remaining?: number }>()

/** An Octokit client, and the rate limit its token had left after its last response. */
interface Client {
  readonly octokit: Octokit
  readonly remaining: () => number | undefined
}

/**
 * Makes every `GET` a client repeats conditional, and notes the rate limit
 * each response reports.
 *
 * @remarks
 * GitHub does not count a `304 Not Modified` against the rate limit, so a
 * read polled or repeated after a write sends the ETag of the last response
 * for the same URL and, when nothing changed, gets that response back with
 * status `304`.
 */
const observedClient = (octokit: Octokit): Client => {
  const seen = new Map<string, { readonly etag: string; readonly response: Response }>()
  let remaining: number | undefined
  const note = (headers: Response['headers'] | undefined) => {
    const value = headers?.['x-ratelimit-remaining']
    if (value === undefined) return
    remaining = Number(value)
    const cell = callQuota.getStore()
    if (cell !== undefined) cell.remaining = remaining
  }
  octokit.hook.wrap('request', async (request, options) => {
    const read = options.method === 'GET'
    const { url } = octokit.request.endpoint.parse(options)
    const last = read ? seen.get(url) : undefined
    // Octokit's hooks pass the options they were first given down the chain, so the header is set on them in place.
    if (last !== undefined) options.headers['if-none-match'] = last.etag
    try {
      const response = await request(options)
      note(response.headers)
      const etag = response.headers.etag
      // A long-lived service starts over rather than grow without bound.
      if (seen.size >= CONDITIONAL_CAPACITY) seen.clear()
      if (read && etag !== undefined) seen.set(url, { etag, response })
      return response
    } catch (error) {
      // A failed request carries its response, and so the rate limit, unless it never reached GitHub.
      const headers = (error as { readonly response?: Pick<Response, 'headers'> }).response?.headers
      note(headers)
      if (last === undefined || statusOf(error) !== 304) throw error
      return { ...last.response, status: 304, headers: { ...last.response.headers, ...headers } }
    }
  })
  return { octokit, remaining: () => remaining }
}

/**
 * Builds the live GitHub service on Octokit.
 *
 * @remarks
 * Rate limits are retried with backoff. Outages are retried too, except
 * for calls that create something (comments, reviews, labels, check runs,
 * branches, pull requests, REST `POST`s and GraphQL mutations), where
 * GitHub may already have acted and a repeat would duplicate it. Other
 * failures surface at once as typed errors. Every read is an Effect
 * Request, cached for the life of the service and invalidated by the
 * service's own writes (see {@link cacheReads}), so a run makes each read
 * once and never reads stale data after its own write.
 *
 * Each call is traced as `smartcloud.github.<operation>`, counted in
 * `smartcloud.github.requests` and timed in `smartcloud.github.duration_ms`
 * (see {@link instrumentCall}); only the operation, the outcome and the HTTP
 * status are recorded.
 *
 * @example
 * ```ts
 * import { Effect, Redacted } from 'effect'
 * import { makeLiveGitHub } from '@resnovas/integrations.github'
 *
 * const labels = Effect.gen(function* () {
 *   const github = yield* makeLiveGitHub({ token: Redacted.make('ghp_example'), coordinates: { owner: 'Resnovas', repo: 'smartcloud' } })
 *   return yield* github.listLabels
 * })
 * ```
 *
 * @param options - Token, repository and optional test hooks.
 * @returns The service.
 */
export const makeLiveGitHub = (options: LiveOptions): Effect.Effect<GitHubService> =>
  Effect.gen(function* () {
    const client = (token: Redacted.Redacted<string>) =>
      observedClient(
        new Octokit({
          auth: Redacted.value(token),
          userAgent: 'smartcloud',
          // Every failure already surfaces as a typed error, so Octokit's own request log would only repeat it.
          log: { debug: () => undefined, info: () => undefined, warn: console.warn, error: () => undefined },
          ...(options.fetch === undefined ? {} : { request: { fetch: options.fetch } }),
        }),
      )
    const main = client(options.token)
    const checks = options.checksToken === undefined ? main : client(options.checksToken)
    const { octokit } = main
    const checksClient = checks.octokit
    const { owner, repo } = options.coordinates
    const retry = options.retry ?? DEFAULT_RETRY
    const mergeablePoll = options.mergeablePoll ?? DEFAULT_MERGEABLE_POLL

    // One span, count and duration per call, however many attempts it takes.
    const call = <A>(
      operation: string,
      run: () => Promise<A>,
      retryWhile: (error: GitHubError) => boolean = transient,
      details: CallDetails = { operation },
      via: Client = main,
    ): Effect.Effect<A, GitHubError> => {
      const status = statusTracker()
      const quota: { remaining?: number } = {}
      return instrumentCall(
        Effect.tryPromise({
          try: status.track(() => callQuota.run(quota, run)),
          catch: (error) => toGitHubError(operation, error),
        }).pipe(Effect.retry({ schedule: retry, while: retryWhile })),
        status.last,
        details,
        // This call's own response, or the client's latest when it got none.
        () => quota.remaining ?? via.remaining(),
      )
    }
    // A read made with the checks token, whose rate limit is its own.
    const checksCall = <A>(operation: string, run: () => Promise<A>) =>
      call(operation, run, transient, { operation }, checks)

    // Appends every annotation batch after the first to a run, one request each.
    const appendAnnotations = (
      check_run_id: number,
      run: CheckRun,
      batches: ReadonlyArray<ReadonlyArray<Annotation>>,
    ) =>
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
        () =>
          octokit.request(`${request.method} /repos/{owner}/{repo}${request.path}`, {
            owner,
            repo,
            ...(request.body === undefined ? {} : { data: request.body }),
          }),
        request.method === 'POST' ? rateLimited : transient,
        // The operation names the repository and the path, so telemetry sees only the method.
        { operation: 'repositoryRequest', attributes: { 'http.method': request.method } },
      ).pipe(Effect.map((response) => response.data))
    }

    const graphql: GitHubService['graphql'] = (query, variables) => {
      const reserved = Object.keys(variables).filter((name) => OCTOKIT_OPTIONS.has(name))
      if (reserved.length > 0) {
        return Effect.fail(
          new ValidationFailed({ operation: 'graphql', detail: `variables cannot be named ${reserved.join(', ')}` }),
        )
      }
      const write = isGraphqlWrite(query)
      return call('graphql', () => octokit.graphql(query, { ...variables }), write ? rateLimited : transient, {
        operation: 'graphql',
        attributes: { 'graphql.operation': write ? 'mutation' : 'query' },
      })
    }

    const listCommits: GitHubService['listCommits'] = (pull_number) =>
      call('listCommits', () =>
        octokit.paginate(octokit.rest.pulls.listCommits, { owner, repo, pull_number, per_page: 100 }),
      ).pipe(
        Effect.map((commits) =>
          commits.map((commit) => ({
            sha: commit.sha,
            message: commit.commit.message,
            authorName: commit.commit.author?.name ?? '',
            authorEmail: commit.commit.author?.email ?? '',
            parents: commit.parents.length,
            verified: commit.commit.verification?.verified ?? false,
          })),
        ),
      )

    const listFiles: GitHubService['listFiles'] = (pull_number) =>
      call('listFiles', () =>
        octokit.paginate(octokit.rest.pulls.listFiles, { owner, repo, pull_number, per_page: 100 }),
      ).pipe(Effect.map((files) => files.map((file) => file.filename)))

    const listChangedFiles: GitHubService['listChangedFiles'] = (pull_number) =>
      call('listChangedFiles', () =>
        octokit.paginate(octokit.rest.pulls.listFiles, { owner, repo, pull_number, per_page: 100 }),
      ).pipe(
        Effect.map((files) =>
          files.map((file) => ({
            path: file.filename,
            status: file.status,
            // GitHub sends no patch and counts no lines for binary content.
            binary: file.patch === undefined && file.changes === 0,
          })),
        ),
      )

    const listReviews: GitHubService['listReviews'] = (pull_number) =>
      call('listReviews', () =>
        octokit.paginate(octokit.rest.pulls.listReviews, { owner, repo, pull_number, per_page: 100 }),
      ).pipe(
        Effect.map((reviews) =>
          reviews.map((review) => ({ author: review.user?.login ?? '', state: reviewState(review.state) })),
        ),
      )

    const countRequestedReviewers: GitHubService['countRequestedReviewers'] = (pull_number) =>
      call('countRequestedReviewers', () =>
        octokit.rest.pulls.listRequestedReviewers({ owner, repo, pull_number }),
      ).pipe(Effect.map(({ data }) => data.users.length + data.teams.length))

    const listRequestedReviewers: GitHubService['listRequestedReviewers'] = (pull_number) =>
      call('listRequestedReviewers', () =>
        octokit.rest.pulls.listRequestedReviewers({ owner, repo, pull_number }),
      ).pipe(
        Effect.map(({ data }) => [...data.users.map((user) => user.login), ...data.teams.map((team) => team.slug)]),
      )

    // Reading the pull request starts GitHub's mergeability job, so a read that finds it unknown is repeated for a while.
    const getMergeable: GitHubService['getMergeable'] = (pull_number) =>
      call('getMergeable', () => octokit.rest.pulls.get({ owner, repo, pull_number })).pipe(
        Effect.map(({ data }) => mergeableOf(data.mergeable)),
        Effect.repeat({ schedule: Schedule.passthrough(mergeablePoll), until: (mergeable) => mergeable !== 'UNKNOWN' }),
      )

    // Check runs (GitHub Actions and apps) and commit statuses (older CI) both report on the head commit.
    // They are read with the checks token, which has checks and statuses read when the main token may not.
    // GitHub's default `latest` filter is deliberate: a re-run replaces the run it repeats, as on the checks tab.
    const listChecks: GitHubService['listChecks'] = (pull_number) =>
      Effect.gen(function* () {
        const { data } = yield* call('listChecks: pull request', () =>
          octokit.rest.pulls.get({ owner, repo, pull_number }),
        )
        const ref = data.head.sha
        const [runs, statuses] = yield* Effect.all(
          [
            checksCall('listChecks: check runs', () =>
              checksClient.paginate(checksClient.rest.checks.listForRef, { owner, repo, ref, per_page: 100 }),
            ),
            checksCall('listChecks: commit statuses', () =>
              checksClient.paginate(checksClient.rest.repos.listCommitStatusesForRef, {
                owner,
                repo,
                ref,
                per_page: 100,
              }),
            ),
          ],
          { concurrency: 'unbounded' },
        )
        // Statuses come newest first, and only each context's latest counts.
        const latest = new Map<string, CheckState>()
        for (const status of statuses)
          if (!latest.has(status.context)) latest.set(status.context, statusState(status.state))
        return [
          ...runs.map((run) => ({ name: run.name, state: runState(run) })),
          ...[...latest].map(([name, state]) => ({ name, state })),
        ]
      })

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
            : Effect.fail(
                new ValidationFailed({
                  operation: 'getFile',
                  detail: `${location.path} is too large to read (over 1 MB)`,
                }),
              )
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
            ? Effect.fail(
                new ValidationFailed({
                  operation: 'listDirectory',
                  detail: `${location.path} has too many files to list`,
                }),
              )
            : Effect.succeed(
                data.tree
                  .filter((entry) => entry.type === 'blob' && (entry.mode === REGULAR || entry.mode === EXECUTABLE))
                  .map((entry) => ({ path: entry.path, executable: entry.mode === EXECUTABLE })),
              ),
        ),
      )

    // The identity GitHub last recorded for an unsigned-off commit, so later
    // proposals in the run sign off right the first time.
    const signer = yield* Ref.make<CommitIdentity>(DEFAULT_COMMITTER)

    const createCommit = (title: string, tree: string, parent: string, identity: CommitIdentity, named: boolean) =>
      call('proposeChanges: create commit', () =>
        octokit.rest.git.createCommit({
          owner,
          repo,
          message: signOff(title, identity),
          tree,
          parents: [parent],
          ...(named ? { author: identity, committer: identity } : {}),
        }),
      ).pipe(
        Effect.map(({ data }) => ({
          sha: data.sha,
          author: { name: data.author.name, email: data.author.email },
          verified: data.verification.verified,
        })),
      )

    // A named committer is written as author and committer, and GitHub leaves
    // the commit unsigned. Otherwise GitHub records the token's identity and
    // signs the commit; if that identity is not the one signed off, the
    // commit is made again with the right sign-off.
    const commitChanges = (title: string, tree: string, parent: string) =>
      options.committer === undefined
        ? Effect.gen(function* () {
            const guess = yield* Ref.get(signer)
            const first = yield* createCommit(title, tree, parent, guess, false)
            if (first.author.name === guess.name && first.author.email === guess.email) return first
            yield* Ref.set(signer, first.author)
            return yield* createCommit(title, tree, parent, first.author, false)
          })
        : createCommit(title, tree, parent, options.committer, true)

    const proposeChanges: GitHubService['proposeChanges'] = (proposal) =>
      Effect.gen(function* () {
        // The proposal branch is force-updated below, so it must never be the
        // branch the pull request merges into.
        if (proposal.branch === proposal.base) {
          return yield* new ValidationFailed({
            operation: 'proposeChanges',
            detail: `the proposal branch cannot be its base, ${proposal.base}`,
          })
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
              octokit.rest.git.createBlob({
                owner,
                repo,
                content: Buffer.from(file.content, 'utf8').toString('base64'),
                encoding: 'base64',
              }),
            ).pipe(Effect.map(({ data }) => treeEntry(file.path, file.executable, data.sha))),
          { concurrency: 4 },
        )
        const deleted = (proposal.deletions ?? []).map((path) => treeEntry(path, false, null))
        const tree = yield* call('proposeChanges: create tree', () =>
          octokit.rest.git.createTree({
            owner,
            repo,
            base_tree: baseCommit.data.tree.sha,
            tree: [...written, ...deleted],
          }),
        )

        const branchSha = yield* call('proposeChanges: read branch', () =>
          octokit.rest.git.getRef({ owner, repo, ref: `heads/${proposal.branch}` }),
        ).pipe(
          Effect.map(({ data }) => data.object.sha),
          Effect.catchTag('NotFound', () => Effect.succeed(undefined)),
        )
        // A branch already holding exactly these changes on this base is left
        // alone, so a scheduled run does not push an identical commit each time.
        // Without a named committer the commit must also be signed: an unsigned
        // tip (pushed by someone else, or before the token could sign) is made
        // again, so the pull request passes a signed-commits rule. The branch
        // only moves if the new commit is signed; a token GitHub does not sign
        // for would otherwise make the branch again on every run.
        const current =
          branchSha === undefined
            ? undefined
            : (yield* call('proposeChanges: read branch commit', () =>
                octokit.rest.git.getCommit({ owner, repo, commit_sha: branchSha }),
              )).data
        const sameChanges =
          current !== undefined &&
          current.tree.sha === tree.data.sha &&
          current.parents.map((parent) => parent.sha).join(' ') === baseSha
        const upToDate = sameChanges && (options.committer !== undefined || current.verification.verified)
        const commit = upToDate ? undefined : yield* commitChanges(proposal.title, tree.data.sha, baseSha)
        if (commit !== undefined && !(sameChanges && !commit.verified)) {
          yield* branchSha === undefined
            ? call(
                'proposeChanges: create branch',
                () =>
                  octokit.rest.git.createRef({ owner, repo, ref: `refs/heads/${proposal.branch}`, sha: commit.sha }),
                rateLimited,
              )
            : call('proposeChanges: update branch', () =>
                octokit.rest.git.updateRef({
                  owner,
                  repo,
                  ref: `heads/${proposal.branch}`,
                  sha: commit.sha,
                  force: true,
                }),
              )
        }

        const open = yield* call('proposeChanges: find pull request', () =>
          octokit.rest.pulls.list({
            owner,
            repo,
            head: `${owner}:${proposal.branch}`,
            base: proposal.base,
            state: 'open',
            per_page: 1,
          }),
        )
        const existing = open.data[0]
        if (existing !== undefined) {
          yield* call('proposeChanges: update pull request', () =>
            octokit.rest.pulls.update({
              owner,
              repo,
              pull_number: existing.number,
              title: proposal.title,
              body: proposal.body,
            }),
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

    // Only a rate limit is retried, and a branch already gone counts as deleted: a retry after a
    // deletion whose response was lost would otherwise fail on the 404.
    const deleteBranch = (branch: string) =>
      call(
        'backport: delete branch',
        () => octokit.rest.git.deleteRef({ owner, repo, ref: `heads/${branch}` }),
        rateLimited,
      ).pipe(Effect.catchTag('NotFound', () => Effect.void))

    const backport: GitHubService['backport'] = (request) =>
      Effect.gen(function* () {
        // The branch is reset below, so it must never be the branch the pull request merges into.
        if (request.branch === request.base) {
          return yield* new ValidationFailed({
            operation: 'backport',
            detail: `the backport branch cannot be its base, ${request.base}`,
          })
        }
        const open = yield* call('backport: find pull request', () =>
          octokit.rest.pulls.list({
            owner,
            repo,
            head: `${owner}:${request.branch}`,
            base: request.base,
            state: 'open',
            per_page: 1,
          }),
        )
        const existing = open.data[0]
        if (existing !== undefined)
          return { status: 'existing' as const, number: existing.number, url: existing.html_url }

        const baseSha = (yield* call('backport: read base', () =>
          octokit.rest.git.getRef({ owner, repo, ref: `heads/${request.base}` }),
        )).data.object.sha
        const baseTree = (yield* call('backport: read base commit', () =>
          octokit.rest.git.getCommit({ owner, repo, commit_sha: baseSha }),
        )).data.tree.sha
        // GitHub has no cherry-pick. A commit holding the base's files with
        // `from` as its parent shares `from` as merge base with `to`, so
        // merging `to` into it applies exactly the changes from `from` to
        // `to` to the base's files.
        const scratch = yield* call('backport: create scratch commit', () =>
          octokit.rest.git.createCommit({
            owner,
            repo,
            message: `smartcloud backport scratch for ${request.to}`,
            tree: baseTree,
            parents: [request.from],
          }),
        )
        const exists = yield* call('backport: read branch', () =>
          octokit.rest.git.getRef({ owner, repo, ref: `heads/${request.branch}` }),
        ).pipe(
          Effect.as(true),
          Effect.catchTag('NotFound', () => Effect.succeed(false)),
        )
        yield* exists
          ? call('backport: reset branch', () =>
              octokit.rest.git.updateRef({
                owner,
                repo,
                ref: `heads/${request.branch}`,
                sha: scratch.data.sha,
                force: true,
              }),
            )
          : call(
              'backport: create branch',
              () =>
                octokit.rest.git.createRef({ owner, repo, ref: `refs/heads/${request.branch}`, sha: scratch.data.sha }),
              rateLimited,
            )
        // A merge repeated after an outage would find nothing left to merge,
        // so only a rate limit, which GitHub rejects before acting, is retried.
        const merged = yield* call(
          'backport: merge',
          () =>
            octokit.rest.repos
              .merge({
                owner,
                repo,
                base: request.branch,
                head: request.to,
                commit_message: `smartcloud backport of ${request.to}`,
              })
              .then(
                (response) => ({
                  status: response.status,
                  tree: response.status === 201 ? response.data.commit.tree.sha : undefined,
                }),
                (error: unknown) => {
                  if (statusOf(error) === 409) return { status: 409, tree: undefined }
                  throw error
                },
              ),
          rateLimited,
        )
        if (merged.tree === undefined || merged.tree === baseTree) {
          yield* deleteBranch(request.branch)
          return merged.status === 409 ? { status: 'conflict' as const } : { status: 'empty' as const }
        }
        const { tree } = merged
        // Committed as the proposals are, so GitHub signs it and the sign-off matches its author.
        const commit = yield* commitChanges(request.message, tree, baseSha)
        yield* call('backport: update branch', () =>
          octokit.rest.git.updateRef({
            owner,
            repo,
            ref: `heads/${request.branch}`,
            sha: commit.sha,
            force: true,
          }),
        )
        const created = yield* call(
          'backport: open pull request',
          () =>
            octokit.rest.pulls.create({
              owner,
              repo,
              head: request.branch,
              base: request.base,
              title: request.title,
              body: request.body,
            }),
          rateLimited,
        )
        return { status: 'opened' as const, number: created.data.number, url: created.data.html_url }
      })

    return yield* cacheReads({
      coordinates: options.coordinates,
      getRepository: call('getRepository', () => octokit.rest.repos.get({ owner, repo })).pipe(
        Effect.map(({ data }) => ({
          owner: data.owner.login,
          name: data.name,
          fullName: data.full_name,
          nodeId: data.node_id,
          private: data.private,
          defaultBranch: data.default_branch,
          current: currentSettings(data),
        })),
      ),
      // Any authenticated call carries the header; reading the repository also proves the token can see it.
      tokenScopes: call('tokenScopes', () => octokit.rest.repos.get({ owner, repo })).pipe(
        Effect.map(({ headers }) => scopesOf(headers['x-oauth-scopes'])),
      ),
      listLabels: call('listLabels', () =>
        octokit.paginate(octokit.rest.issues.listLabelsForRepo, { owner, repo, per_page: 100 }),
      ).pipe(
        Effect.map((labels) =>
          labels.map((label) => ({ name: label.name, color: label.color, description: label.description ?? '' })),
        ),
      ),
      createLabel: (label) =>
        Effect.asVoid(
          call('createLabel', () => octokit.rest.issues.createLabel({ owner, repo, ...label }), rateLimited),
        ),
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
      deleteLabel: (name) =>
        Effect.asVoid(call('deleteLabel', () => octokit.rest.issues.deleteLabel({ owner, repo, name }))),
      addLabels: (issue_number, labels) =>
        Effect.asVoid(
          call('addLabels', () => octokit.rest.issues.addLabels({ owner, repo, issue_number, labels: [...labels] })),
        ),
      removeLabel: (issue_number, name) =>
        Effect.asVoid(call('removeLabel', () => octokit.rest.issues.removeLabel({ owner, repo, issue_number, name }))),
      listComments: (issue_number) =>
        call('listComments', () =>
          octokit.paginate(octokit.rest.issues.listComments, { owner, repo, issue_number, per_page: 100 }),
        ).pipe(
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
        call(
          'createComment',
          () => octokit.rest.issues.createComment({ owner, repo, issue_number, body }),
          rateLimited,
        ).pipe(
          Effect.map(({ data }) => ({
            id: data.id,
            body: data.body ?? '',
            author: data.user?.login ?? '',
            bot: data.user?.type === 'Bot',
          })),
        ),
      updateComment: (comment_id, body) =>
        Effect.asVoid(
          call('updateComment', () => octokit.rest.issues.updateComment({ owner, repo, comment_id, body })),
        ),
      listOpenIssues: call('listOpenIssues', () =>
        octokit.paginate(octokit.rest.issues.listForRepo, { owner, repo, state: 'open', per_page: 100 }),
      ).pipe(
        Effect.map((issues) =>
          issues.map((issue) => ({
            number: issue.number,
            title: issue.title,
            body: issue.body ?? '',
            author: issue.user?.login ?? '',
            ...(isAssociation(issue.author_association) ? { association: issue.author_association } : {}),
            ...(issue.user?.type === undefined ? {} : { bot: issue.user.type === 'Bot' }),
            open: issue.state === 'open',
            locked: issue.locked,
            labels: issue.labels.map(labelName),
            assignees: (issue.assignees ?? []).map((user) => user.login),
            ...(issue.milestone?.title === undefined ? {} : { milestone: issue.milestone.title }),
            updatedAt: new Date(issue.updated_at),
            createdAt: new Date(issue.created_at),
            isPullRequest: issue.pull_request !== undefined,
            ...(issue.reactions === undefined ? {} : { reactions: reactionsOf(issue.reactions) }),
          })),
        ),
      ),
      getReactions: (issue_number) =>
        call('getReactions', () => octokit.rest.issues.get({ owner, repo, issue_number })).pipe(
          Effect.map(({ data }) => reactionsOf(data.reactions ?? NO_REACTIONS)),
        ),
      listOpenPullRequests: call('listOpenPullRequests', () =>
        octokit.paginate(octokit.rest.pulls.list, { owner, repo, state: 'open', per_page: 100 }),
      ).pipe(
        Effect.map((pulls) =>
          pulls.map((pull) => ({
            number: pull.number,
            headSha: pull.head.sha,
            labels: pull.labels.map(labelName),
            draft: pull.draft === true,
          })),
        ),
      ),
      closeIssue: (issue_number) =>
        Effect.asVoid(
          call('closeIssue', () => octokit.rest.issues.update({ owner, repo, issue_number, state: 'closed' })),
        ),
      listClosedUnlocked: (kind, closedBefore) =>
        call('listClosedUnlocked', () =>
          octokit.paginate(octokit.rest.search.issuesAndPullRequests, {
            // Search takes whole seconds; apps with a user token must name the kind.
            q: `repo:${owner}/${repo} ${kind === 'issue' ? 'is:issue' : 'is:pr'} is:closed is:unlocked closed:<${closedBefore.toISOString().slice(0, 19)}Z`,
            per_page: 100,
          }),
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
              closedAt: new Date(issue.closed_at ?? issue.updated_at),
              isPullRequest: issue.pull_request !== undefined,
            })),
          ),
        ),
      lockIssue: (issue_number, reason) =>
        Effect.asVoid(
          call('lockIssue', () =>
            octokit.rest.issues.lock({
              owner,
              repo,
              issue_number,
              ...(reason === undefined ? {} : { lock_reason: reason }),
            }),
          ),
        ),
      listCommits,
      listFiles,
      listChangedFiles,
      listReviews,
      countRequestedReviewers,
      listRequestedReviewers,
      getMergeable,
      listChecks,
      createReview: (pull_number, review) =>
        Effect.asVoid(
          call(
            'createReview',
            () => octokit.rest.pulls.createReview({ owner, repo, pull_number, ...review }),
            rateLimited,
          ),
        ),
      requestReviewers: (pull_number, logins) =>
        Effect.asVoid(
          call('requestReviewers', () =>
            octokit.rest.pulls.requestReviewers({ owner, repo, pull_number, reviewers: [...logins] }),
          ),
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
              external_id: CHECK_RUN_EXTERNAL_ID,
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
      listCommitChecks: (ref) =>
        Effect.all(
          [
            checksCall('listCommitChecks: check runs', () =>
              checksClient.paginate(checksClient.rest.checks.listForRef, {
                owner,
                repo,
                ref,
                filter: 'all',
                per_page: 100,
              }),
            ),
            checksCall('listCommitChecks: statuses', () =>
              checksClient.paginate(checksClient.rest.repos.listCommitStatusesForRef, {
                owner,
                repo,
                ref,
                per_page: 100,
              }),
            ),
          ],
          { concurrency: 2 },
        ).pipe(
          Effect.map(([runs, statuses]) => {
            // Statuses come newest first, one per update, so the first of each context is its state now.
            const latest = new Map<string, (typeof statuses)[number]>()
            for (const status of statuses) if (!latest.has(status.context)) latest.set(status.context, status)
            return [...runs.map(checkRunCheck), ...[...latest.values()].map(statusCheck)]
          }),
        ),
      getFile,
      listDirectory,
      proposeChanges,
      getCommit: (commit_sha) =>
        call('getCommit', () => octokit.rest.git.getCommit({ owner, repo, commit_sha })).pipe(
          Effect.map(({ data }) => ({
            sha: data.sha,
            message: data.message,
            parents: data.parents.map((parent) => parent.sha),
          })),
        ),
      backport,
      repositoryRequest,
      graphql,
    })
  })

/**
 * The live GitHub service for the repository in `GITHUB_REPOSITORY`,
 * authenticated with `GITHUB_TOKEN`. Both are read through Effect Config,
 * and the token stays redacted. Proposed commits are made as the token's
 * own identity, which GitHub signs. `SMARTCLOUD_COMMITTER_NAME` and
 * `SMARTCLOUD_COMMITTER_EMAIL` name another identity to commit and sign off
 * as instead; GitHub does not sign such a commit.
 *
 * @example
 * ```ts
 * import { Effect } from 'effect'
 * import { GitHub, GitHubLive } from '@resnovas/integrations.github'
 *
 * const labels = Effect.flatMap(GitHub, (github) => github.listLabels).pipe(Effect.provide(GitHubLive))
 * ```
 */
export const GitHubLive = Layer.effect(
  GitHub,
  Effect.gen(function* () {
    const token = yield* Config.redacted('GITHUB_TOKEN')
    const repository = yield* Config.string('GITHUB_REPOSITORY').pipe(
      Config.validate({
        message: 'GITHUB_REPOSITORY must be owner/name',
        validation: (value) => /^[^/\s]+\/[^/\s]+$/.test(value),
      }),
    )
    const name = yield* Config.option(Config.string('SMARTCLOUD_COMMITTER_NAME'))
    const email = yield* Config.option(Config.string('SMARTCLOUD_COMMITTER_EMAIL'))
    const committer =
      Option.isNone(name) && Option.isNone(email)
        ? {}
        : {
            committer: {
              name: Option.getOrElse(name, () => DEFAULT_COMMITTER.name),
              email: Option.getOrElse(email, () => DEFAULT_COMMITTER.email),
            },
          }
    const [owner = '', repo = ''] = repository.split('/')
    return yield* makeLiveGitHub({ token, coordinates: { owner, repo }, ...committer })
  }),
)
