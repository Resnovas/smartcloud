/**
 * @file packages/integrations.github/src/memory.ts
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

import type { ChangedFile, Check, Commit, Mergeable, Reactions, Review } from '@resnovas/conditions'
import { Effect, Layer } from 'effect'
import { type GitHubError, NotFound, ValidationFailed } from './errors.js'
import {
  type BackportRequest,
  type BackportResult,
  type ChangeProposal,
  type CheckRun,
  type Comment,
  type CommitCheck,
  type GitCommit,
  GitHub,
  type GitHubService,
  type ClosedIssueSummary,
  type IssueSummary,
  type Label,
  type LockReason,
  type NewReview,
  type PullRequestSummary,
  type Repository,
  type RepositoryRequest,
} from './service.js'

/** A pull request's data in the in-memory GitHub. */
export interface MemoryPullRequest {
  commits: Array<Commit>
  files: Array<string>
  /** The changed files with their status; `files` as modified text files when omitted. */
  changedFiles?: Array<ChangedFile>
  reviews: Array<Review>
  requestedReviewers: Array<string>
  submittedReviews: Array<NewReview>
  /** Whether it can merge into its base branch; `MERGEABLE` when omitted. */
  mergeable?: Mergeable
  /** The CI checks on its head commit; none when omitted. */
  checks?: Array<Check>
}

/** An issue's or pull request's labels, comments and reactions in the in-memory GitHub. */
export interface MemoryIssue {
  labels: Array<string>
  comments: Array<Comment>
  open: boolean
  /** The reactions on the item itself; none when omitted. */
  reactions?: Reactions
  /** Whether the conversation is locked, and why. */
  locked?: boolean
  lockReason?: LockReason
}

/** A proposal the in-memory GitHub received, with the pull request it opened. */
export interface MemoryProposal extends ChangeProposal {
  readonly number: number
  /** Whether the pull request is still open; tests close it to see a new one opened. */
  open: boolean
}

/** A backport the in-memory GitHub received, with the pull request it opened. */
export interface MemoryBackport extends BackportRequest {
  readonly number: number
  /** Whether the pull request is still open; tests close it to see a new one opened. */
  open: boolean
}

/**
 * Everything the in-memory GitHub holds. Tests seed it, run a feature, and
 * then read it to see what the feature did.
 */
export interface MemoryState {
  repository: Repository
  /** The scopes `tokenScopes` reports; undefined, as for a fine-grained or app token, by default. */
  tokenScopes: ReadonlyArray<string> | undefined
  labels: Array<Label>
  /** Labels, comments and reactions on each issue or pull request, by number. */
  issues: Map<number, MemoryIssue>
  openIssues: Array<IssueSummary>
  /** The closed issues and pull requests `listClosedUnlocked` searches. */
  closedIssues: Array<ClosedIssueSummary>
  /** The open pull requests `listOpenPullRequests` returns. */
  openPullRequests: Array<PullRequestSummary>
  pulls: Map<number, MemoryPullRequest>
  /** File contents keyed by `owner/repo/path@ref`, with an empty ref for the default branch. */
  files: Map<string, string>
  /** Keys of `files` that are executable. */
  executables: Set<string>
  /**
   * The commit SHA `resolveRef` answers for a ref, keyed by `owner/repo@ref`;
   * an unlisted ref resolves to itself (the empty string for the default
   * branch). `getArchive` at a SHA serves the files of every ref listed
   * with it, so a test can seed files under a branch and read them at the
   * commit the branch resolved to.
   */
  refs: Map<string, string>
  /** Every operation called, in order, by name; `coordinates` is not a call. */
  calls: Array<string>
  /** Pull requests opened by `proposeChanges`, latest content last. */
  proposals: Array<MemoryProposal>
  /** The commits `getCommit` reads, by SHA. */
  gitCommits: Map<string, GitCommit>
  /** The branches a backport can target; `main` unless seeded. */
  branches: Set<string>
  /** Branches a backport onto stops without a pull request, and why. */
  backportOutcomes: Map<string, 'conflict' | 'empty'>
  /** Pull requests opened by `backport`. */
  backports: Array<MemoryBackport>
  checkRuns: Array<CheckRun & { readonly id: number }>
  /** The checks on each commit, by SHA, as `listCommitChecks` returns them; tests change them between polls. */
  commitChecks: Map<string, Array<CommitCheck>>
  requests: Array<RepositoryRequest>
  graphql: Array<{ readonly query: string; readonly variables: Readonly<Record<string, unknown>> }>
  nextId: number
}

/**
 * The key the in-memory GitHub stores a file under.
 *
 * @example
 * ```ts import.meta.vitest name="fileKey"
 * import { fileKey } from '@resnovas/integrations.github'
 *
 * fileKey('Resnovas', '.github', 'labels.yml', 'main') // => 'Resnovas/.github/labels.yml@main'
 * fileKey('Resnovas', '.github', 'labels.yml') // => 'Resnovas/.github/labels.yml@'
 * ```
 *
 * @param owner - The repository owner.
 * @param repo - The repository name.
 * @param path - The file's path in the repository.
 * @param ref - The branch, tag or commit; empty for the default branch.
 * @returns The key for `MemoryState.files`.
 */
export const fileKey = (owner: string, repo: string, path: string, ref = ''): string =>
  `${owner}/${repo}/${path}@${ref}`

const NO_REACTIONS: Reactions = { '+1': 0, '-1': 0, laugh: 0, hooray: 0, confused: 0, heart: 0, rocket: 0, eyes: 0 }

const defaults = (): MemoryState => ({
  repository: {
    owner: 'Resnovas',
    name: 'example',
    fullName: 'Resnovas/example',
    nodeId: 'R_example',
    private: false,
    defaultBranch: 'main',
  },
  tokenScopes: undefined,
  labels: [],
  issues: new Map(),
  openIssues: [],
  closedIssues: [],
  openPullRequests: [],
  pulls: new Map(),
  files: new Map(),
  executables: new Set(),
  refs: new Map(),
  calls: [],
  proposals: [],
  gitCommits: new Map(),
  branches: new Set(['main']),
  backportOutcomes: new Map(),
  backports: [],
  checkRuns: [],
  commitChecks: new Map(),
  requests: [],
  graphql: [],
  nextId: 1,
})

/**
 * The key `MemoryState.refs` stores a ref under.
 *
 * @example
 * ```ts import.meta.vitest name="refKey"
 * import { refKey } from '@resnovas/integrations.github'
 *
 * refKey('Resnovas', '.github', 'main') // => 'Resnovas/.github@main'
 * refKey('Resnovas', '.github') // => 'Resnovas/.github@'
 * ```
 *
 * @param owner - The repository owner.
 * @param repo - The repository name.
 * @param ref - The branch, tag or commit; empty for the default branch.
 * @returns The key for `MemoryState.refs`.
 */
export const refKey = (owner: string, repo: string, ref = ''): string => `${owner}/${repo}@${ref}`

// Wraps every operation so `state.calls` records it, whatever it does next.
const counting = (service: GitHubService, calls: Array<string>): GitHubService => {
  const counted: Record<string, unknown> = {}
  for (const [name, member] of Object.entries(service)) {
    if (Effect.isEffect(member)) {
      counted[name] = Effect.suspend(() => {
        calls.push(name)
        return member as Effect.Effect<unknown>
      })
    } else if (typeof member === 'function') {
      const operation = member as (...args: ReadonlyArray<unknown>) => Effect.Effect<unknown, unknown>
      counted[name] = (...args: ReadonlyArray<unknown>) =>
        Effect.suspend(() => {
          calls.push(name)
          return operation(...args)
        })
    } else {
      counted[name] = member
    }
  }
  return counted as unknown as GitHubService
}

/**
 * Builds an in-memory GitHub for tests.
 *
 * @remarks
 * It behaves like GitHub where features depend on it: labels are unique by
 * name ignoring case, renames carry a label on existing issues, missing
 * things fail with `NotFound`, a proposal updates the open pull request
 * from its branch rather than opening another, and a backport leaves one
 * open from its branch alone. Every call is recorded by name in
 * `state.calls`, so a test can assert how many reads a feature makes.
 *
 * @example
 * ```ts import.meta.vitest name="makeMemoryGitHub"
 * import { Effect } from 'effect'
 * import { makeMemoryGitHub } from '@resnovas/integrations.github'
 *
 * const { service, state } = makeMemoryGitHub({ labels: [{ name: 'bug', color: 'd73a4a', description: '' }] })
 * await Effect.runPromise(service.addLabels(1, ['bug']))
 * state.issues.get(1)?.labels.length // => 1
 * ```
 *
 * @param seed - Initial state; anything omitted starts empty.
 * @returns The service and its live, mutable state.
 */
export const makeMemoryGitHub = (seed: Partial<MemoryState> = {}): { service: GitHubService; state: MemoryState } => {
  const state: MemoryState = { ...defaults(), ...seed }
  const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase()
  const issue = (number: number) => {
    const existing = state.issues.get(number)
    if (existing !== undefined) return existing
    const created: MemoryIssue = { labels: [], comments: [], open: true }
    state.issues.set(number, created)
    return created
  }
  const pull = (operation: string, number: number) => {
    const found = state.pulls.get(number)
    return found === undefined
      ? Effect.fail(new NotFound({ operation, detail: `pull request #${number}` }))
      : Effect.succeed(found)
  }

  // The refs whose files a read at `ref` serves: the ref itself, every ref
  // that resolves to it, and the default branch's (an empty ref) when `ref`
  // names the service's own default branch.
  const refsFor = (owner: string, repo: string, ref: string): ReadonlySet<string> => {
    const refs = new Set([ref])
    const prefix = `${owner}/${repo}@`
    for (const [key, sha] of state.refs) if (sha === ref && key.startsWith(prefix)) refs.add(key.slice(prefix.length))
    if (
      same(owner, state.repository.owner) &&
      same(repo, state.repository.name) &&
      ref === state.repository.defaultBranch
    )
      refs.add('')
    return refs
  }
  const directoryOf = (path: string | undefined) =>
    (path ?? '')
      .split('/')
      .filter((part) => part !== '')
      .join('/')

  const service: GitHubService = {
    coordinates: { owner: state.repository.owner, repo: state.repository.name },
    getRepository: Effect.sync(() => state.repository),
    tokenScopes: Effect.sync(() => state.tokenScopes),
    listLabels: Effect.sync(() => [...state.labels]),
    createLabel: (label) =>
      state.labels.some((existing) => same(existing.name, label.name))
        ? Effect.fail(new ValidationFailed({ operation: 'createLabel', detail: `label ${label.name} already exists` }))
        : Effect.sync(() => void state.labels.push(label)),
    updateLabel: (current, label) =>
      Effect.suspend((): Effect.Effect<void, GitHubError> => {
        const index = state.labels.findIndex((existing) => same(existing.name, current))
        if (index === -1) return Effect.fail(new NotFound({ operation: 'updateLabel', detail: `label ${current}` }))
        // GitHub refuses a rename onto a name another label already has, ignoring case.
        if (state.labels.some((existing, other) => other !== index && same(existing.name, label.name))) {
          return Effect.fail(
            new ValidationFailed({ operation: 'updateLabel', detail: `label ${label.name} already exists` }),
          )
        }
        state.labels[index] = label
        for (const entry of state.issues.values())
          entry.labels = entry.labels.map((name) => (same(name, current) ? label.name : name))
        return Effect.void
      }),
    deleteLabel: (name) =>
      Effect.suspend(() => {
        const before = state.labels.length
        state.labels = state.labels.filter((existing) => !same(existing.name, name))
        if (state.labels.length === before)
          return Effect.fail(new NotFound({ operation: 'deleteLabel', detail: `label ${name}` }))
        for (const entry of state.issues.values()) entry.labels = entry.labels.filter((label) => !same(label, name))
        return Effect.void
      }),
    addLabels: (number, labels) =>
      Effect.sync(() => {
        const entry = issue(number)
        for (const label of labels)
          if (!entry.labels.some((existing) => same(existing, label))) entry.labels.push(label)
      }),
    removeLabel: (number, label) =>
      Effect.suspend(() => {
        const entry = issue(number)
        if (!entry.labels.some((existing) => same(existing, label))) {
          return Effect.fail(new NotFound({ operation: 'removeLabel', detail: `label ${label} on #${number}` }))
        }
        entry.labels = entry.labels.filter((existing) => !same(existing, label))
        return Effect.void
      }),
    listComments: (number) => Effect.sync(() => [...issue(number).comments]),
    createComment: (number, body) =>
      Effect.sync(() => {
        const comment = { id: state.nextId++, body, author: 'smartcloud[bot]', bot: true }
        issue(number).comments.push(comment)
        return comment
      }),
    updateComment: (id, body) =>
      Effect.suspend(() => {
        for (const entry of state.issues.values()) {
          const index = entry.comments.findIndex((comment) => comment.id === id)
          const found = entry.comments[index]
          if (found !== undefined) {
            entry.comments[index] = { ...found, body }
            return Effect.void
          }
        }
        return Effect.fail(new NotFound({ operation: 'updateComment', detail: `comment ${id}` }))
      }),
    listOpenIssues: Effect.sync(() => state.openIssues.filter((summary) => issue(summary.number).open)),
    getReactions: (number) => Effect.sync(() => ({ ...(issue(number).reactions ?? NO_REACTIONS) })),
    listOpenPullRequests: Effect.sync(() => [...state.openPullRequests]),
    closeIssue: (number) => Effect.sync(() => void (issue(number).open = false)),
    listClosedUnlocked: (kind, closedBefore) =>
      Effect.sync(() =>
        state.closedIssues.filter(
          (summary) =>
            summary.isPullRequest === (kind === 'pullRequest') &&
            !summary.locked &&
            state.issues.get(summary.number)?.locked !== true &&
            summary.closedAt.getTime() < closedBefore.getTime(),
        ),
      ),
    lockIssue: (number, reason) =>
      Effect.sync(() => {
        const entry = issue(number)
        entry.locked = true
        if (reason !== undefined) entry.lockReason = reason
      }),
    listCommits: (number) => Effect.map(pull('listCommits', number), (entry) => [...entry.commits]),
    listFiles: (number) => Effect.map(pull('listFiles', number), (entry) => [...entry.files]),
    listChangedFiles: (number) =>
      Effect.map(pull('listChangedFiles', number), (entry) => [
        ...(entry.changedFiles ?? entry.files.map((path) => ({ path, status: 'modified' as const, binary: false }))),
      ]),
    listReviews: (number) => Effect.map(pull('listReviews', number), (entry) => [...entry.reviews]),
    countRequestedReviewers: (number) =>
      Effect.map(pull('countRequestedReviewers', number), (entry) => entry.requestedReviewers.length),
    listRequestedReviewers: (number) =>
      Effect.map(pull('listRequestedReviewers', number), (entry) => [...entry.requestedReviewers]),
    getMergeable: (number) => Effect.map(pull('getMergeable', number), (entry) => entry.mergeable ?? 'MERGEABLE'),
    listChecks: (number) => Effect.map(pull('listChecks', number), (entry) => [...(entry.checks ?? [])]),
    createReview: (number, review) =>
      Effect.map(pull('createReview', number), (entry) => void entry.submittedReviews.push(review)),
    requestReviewers: (number, logins) =>
      Effect.map(pull('requestReviewers', number), (entry) => void entry.requestedReviewers.push(...logins)),
    createCheckRun: (run) =>
      Effect.sync(() => {
        const id = state.nextId++
        state.checkRuns.push({ ...run, id })
        return id
      }),
    updateCheckRun: (id, run) =>
      Effect.suspend(() => {
        const index = state.checkRuns.findIndex((existing) => existing.id === id)
        if (index === -1) return Effect.fail(new NotFound({ operation: 'updateCheckRun', detail: `check run ${id}` }))
        state.checkRuns[index] = { ...run, id }
        return Effect.void
      }),
    listCommitChecks: (sha) => Effect.sync(() => [...(state.commitChecks.get(sha) ?? [])]),
    getFile: (location) =>
      Effect.suspend(() => {
        const text = state.files.get(fileKey(location.owner, location.repo, location.path, location.ref))
        return text === undefined
          ? Effect.fail(
              new NotFound({ operation: 'getFile', detail: `${location.owner}/${location.repo}/${location.path}` }),
            )
          : Effect.succeed(text)
      }),
    listDirectory: (location) =>
      Effect.sync(() => {
        const directory = directoryOf(location.path)
        const prefix = `${location.owner}/${location.repo}/${directory === '' ? '' : `${directory}/`}`
        const suffix = `@${location.ref ?? ''}`
        return [...state.files.keys()]
          .filter((key) => key.startsWith(prefix) && key.endsWith(suffix))
          .sort()
          .map((key) => ({
            path: key.slice(prefix.length, key.length - suffix.length),
            executable: state.executables.has(key),
          }))
      }),
    resolveRef: (location) =>
      Effect.sync(() => state.refs.get(refKey(location.owner, location.repo, location.ref)) ?? location.ref ?? ''),
    getArchive: (location) =>
      Effect.suspend(() => {
        const directory = directoryOf(location.path)
        const prefix = `${location.owner}/${location.repo}/${directory === '' ? '' : `${directory}/`}`
        const suffixes = [...refsFor(location.owner, location.repo, location.ref ?? '')].map((ref) => `@${ref}`)
        const wanted = location.paths === undefined ? undefined : new Set(location.paths)
        const entries = [...state.files]
          .filter(([key]) => key.startsWith(prefix) && suffixes.some((suffix) => key.endsWith(suffix)))
          .map(([key, content]) => {
            const suffix = suffixes.find((candidate) => key.endsWith(candidate)) ?? ''
            return {
              path: key.slice(prefix.length, key.length - suffix.length),
              content,
              executable: state.executables.has(key),
            }
          })
          .filter((entry) => wanted === undefined || wanted.has(entry.path))
          .sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0))
        const bytes = entries.reduce((total, entry) => total + Buffer.byteLength(entry.content), 0)
        return location.maxBytes !== undefined && bytes > location.maxBytes
          ? Effect.fail(
              new ValidationFailed({
                operation: 'getArchive',
                detail: `the archive is larger than ${location.maxBytes} bytes`,
              }),
            )
          : Effect.succeed(entries)
      }),
    proposeChanges: (proposal) =>
      Effect.sync(() => {
        const index = state.proposals.findIndex((existing) => existing.open && existing.branch === proposal.branch)
        const existing = state.proposals[index]
        const number = existing === undefined ? state.nextId++ : existing.number
        const entry = { ...proposal, number, open: true }
        if (existing === undefined) state.proposals.push(entry)
        else state.proposals[index] = entry
        return {
          number,
          url: `https://github.com/${state.repository.fullName}/pull/${number}`,
          created: existing === undefined,
        }
      }),
    getCommit: (sha) =>
      Effect.suspend(() => {
        const commit = state.gitCommits.get(sha)
        return commit === undefined
          ? Effect.fail(new NotFound({ operation: 'getCommit', detail: `commit ${sha}` }))
          : Effect.succeed(commit)
      }),
    backport: (request) =>
      Effect.suspend((): Effect.Effect<BackportResult, GitHubError> => {
        if (!state.branches.has(request.base))
          return Effect.fail(new NotFound({ operation: 'backport: read base', detail: `branch ${request.base}` }))
        const url = (number: number) => `https://github.com/${state.repository.fullName}/pull/${number}`
        const existing = state.backports.find(
          (entry) => entry.open && entry.branch === request.branch && entry.base === request.base,
        )
        if (existing !== undefined)
          return Effect.succeed({ status: 'existing' as const, number: existing.number, url: url(existing.number) })
        const outcome = state.backportOutcomes.get(request.base)
        if (outcome !== undefined)
          return Effect.succeed(outcome === 'conflict' ? { status: 'conflict' as const } : { status: 'empty' as const })
        const number = state.nextId++
        state.backports.push({ ...request, number, open: true })
        return Effect.succeed({ status: 'opened' as const, number, url: url(number) })
      }),
    repositoryRequest: (request) => Effect.sync(() => (state.requests.push(request), null)),
    graphql: (query, variables) => Effect.sync(() => (state.graphql.push({ query, variables }), null)),
  }
  return { service: counting(service, state.calls), state }
}

/**
 * A layer providing an in-memory GitHub, for tests that do not need to
 * inspect the state afterwards.
 *
 * @example
 * ```ts import.meta.vitest name="GitHubMemory"
 * import { Effect } from 'effect'
 * import { GitHub, GitHubMemory } from '@resnovas/integrations.github'
 *
 * const layer = GitHubMemory({ labels: [{ name: 'bug', color: 'd73a4a', description: '' }] })
 * const labels = await Effect.runPromise(Effect.flatMap(GitHub, (github) => github.listLabels).pipe(Effect.provide(layer)))
 * labels.length // => 1
 * ```
 *
 * @param seed - Initial state.
 * @returns The layer.
 */
export const GitHubMemory = (seed: Partial<MemoryState> = {}) => Layer.succeed(GitHub, makeMemoryGitHub(seed).service)
