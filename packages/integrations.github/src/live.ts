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
 * (CODE_OF_CONDUCT.md) and the Cooperation Commitment (COOPERATION_COMMITMENT.md).
 *
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE.
 */

import { Octokit } from '@octokit/rest'
import type { Mergeable, Review } from '@resnovas/conditions'
import { Config, Effect, Layer, Option, Redacted, Ref, Schedule } from 'effect'
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
const mergeableOf = (mergeable: boolean | null): Mergeable => (mergeable === null ? 'UNKNOWN' : mergeable ? 'MERGEABLE' : 'CONFLICTING')

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
  const state = run.status !== 'completed' ? 'pending' : PASSING_CONCLUSIONS.has(run.conclusion ?? '') ? 'success' : 'failure'
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

const statusCheck = (status: { readonly context: string; readonly state: string; readonly target_url: string | null }): CommitCheck => ({
  name: status.context,
  source: 'status',
  state: status.state === 'pending' ? 'pending' : status.state === 'success' ? 'success' : 'failure',
  detail: status.state,
  ...(status.target_url === null ? {} : { url: status.target_url }),
})

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
      new Octokit({
        auth: Redacted.value(token),
        userAgent: 'smartcloud',
        // Every failure already surfaces as a typed error, so Octokit's own request log would only repeat it.
        log: { debug: () => undefined, info: () => undefined, warn: console.warn, error: () => undefined },
        ...(options.fetch === undefined ? {} : { request: { fetch: options.fetch } }),
      })
    const octokit = client(options.token)
    const checksClient = options.checksToken === undefined ? octokit : client(options.checksToken)
    const { owner, repo } = options.coordinates
    const retry = options.retry ?? DEFAULT_RETRY
    const mergeablePoll = options.mergeablePoll ?? DEFAULT_MERGEABLE_POLL

    // One span, count and duration per call, however many attempts it takes.
    const call = <A>(
      operation: string,
      run: () => Promise<A>,
      retryWhile: (error: GitHubError) => boolean = transient,
      details: CallDetails = { operation },
    ): Effect.Effect<A, GitHubError> => {
      const status = statusTracker()
      return instrumentCall(
        Effect.tryPromise({ try: status.track(run), catch: (error) => toGitHubError(operation, error) }).pipe(
          Effect.retry({ schedule: retry, while: retryWhile }),
        ),
        status.last,
        details,
      )
    }

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
        // The operation names the repository and the path, so telemetry sees only the method.
        { operation: 'repositoryRequest', attributes: { 'http.method': request.method } },
      ).pipe(Effect.map((response) => response.data))
    }

    const graphql: GitHubService['graphql'] = (query, variables) => {
      const reserved = Object.keys(variables).filter((name) => OCTOKIT_OPTIONS.has(name))
      if (reserved.length > 0) {
        return Effect.fail(new ValidationFailed({ operation: 'graphql', detail: `variables cannot be named ${reserved.join(', ')}` }))
      }
      const write = isGraphqlWrite(query)
      return call('graphql', () => octokit.graphql(query, { ...variables }), write ? rateLimited : transient, {
        operation: 'graphql',
        attributes: { 'graphql.operation': write ? 'mutation' : 'query' },
      })
    }

    const listCommits: GitHubService['listCommits'] = (pull_number) =>
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
      )

    const listFiles: GitHubService['listFiles'] = (pull_number) =>
      call('listFiles', () => octokit.paginate(octokit.rest.pulls.listFiles, { owner, repo, pull_number, per_page: 100 })).pipe(
        Effect.map((files) => files.map((file) => file.filename)),
      )

    const listReviews: GitHubService['listReviews'] = (pull_number) =>
      call('listReviews', () => octokit.paginate(octokit.rest.pulls.listReviews, { owner, repo, pull_number, per_page: 100 })).pipe(
        Effect.map((reviews) => reviews.map((review) => ({ author: review.user?.login ?? '', state: reviewState(review.state) }))),
      )

    const countRequestedReviewers: GitHubService['countRequestedReviewers'] = (pull_number) =>
      call('countRequestedReviewers', () => octokit.rest.pulls.listRequestedReviewers({ owner, repo, pull_number })).pipe(
        Effect.map(({ data }) => data.users.length + data.teams.length),
      )

    // Reading the pull request starts GitHub's mergeability job, so a read that finds it unknown is repeated for a while.
    const getMergeable: GitHubService['getMergeable'] = (pull_number) =>
      call('getMergeable', () => octokit.rest.pulls.get({ owner, repo, pull_number })).pipe(
        Effect.map(({ data }) => mergeableOf(data.mergeable)),
        Effect.repeat({ schedule: Schedule.passthrough(mergeablePoll), until: (mergeable) => mergeable !== 'UNKNOWN' }),
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
                () => octokit.rest.git.createRef({ owner, repo, ref: `refs/heads/${proposal.branch}`, sha: commit.sha }),
                rateLimited,
              )
            : call('proposeChanges: update branch', () =>
                octokit.rest.git.updateRef({ owner, repo, ref: `heads/${proposal.branch}`, sha: commit.sha, force: true }),
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
      getMergeable,
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
            call('listCommitChecks: check runs', () =>
              checksClient.paginate(checksClient.rest.checks.listForRef, { owner, repo, ref, filter: 'all', per_page: 100 }),
            ),
            call('listCommitChecks: statuses', () =>
              checksClient.paginate(checksClient.rest.repos.listCommitStatusesForRef, { owner, repo, ref, per_page: 100 }),
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
      Config.validate({ message: 'GITHUB_REPOSITORY must be owner/name', validation: (value) => /^[^/\s]+\/[^/\s]+$/.test(value) }),
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
