/**
 * @file packages/integrations.github/src/memory.ts
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
import { Effect, Layer } from 'effect'
import { type GitHubError, NotFound, ValidationFailed } from './errors.js'
import {
  type ChangeProposal,
  type CheckRun,
  type Comment,
  type CommitCheck,
  GitHub,
  type GitHubService,
  type IssueSummary,
  type Label,
  type NewReview,
  type Repository,
  type RepositoryRequest,
} from './service.js'

/** A pull request's data in the in-memory GitHub. */
export interface MemoryPullRequest {
  commits: Array<Commit>
  files: Array<string>
  reviews: Array<Review>
  requestedReviewers: Array<string>
  submittedReviews: Array<NewReview>
  /** Whether it can merge into its base branch; `MERGEABLE` when omitted. */
  mergeable?: Mergeable
  /** The CI checks on its head commit; none when omitted. */
  checks?: Array<Check>
}

/** A proposal the in-memory GitHub received, with the pull request it opened. */
export interface MemoryProposal extends ChangeProposal {
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
  labels: Array<Label>
  /** Labels and comments on each issue or pull request, by number. */
  issues: Map<number, { labels: Array<string>; comments: Array<Comment>; open: boolean }>
  openIssues: Array<IssueSummary>
  pulls: Map<number, MemoryPullRequest>
  /** File contents keyed by `owner/repo/path@ref`, with an empty ref for the default branch. */
  files: Map<string, string>
  /** Keys of `files` that are executable. */
  executables: Set<string>
  /** Pull requests opened by `proposeChanges`, latest content last. */
  proposals: Array<MemoryProposal>
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

const defaults = (): MemoryState => ({
  repository: {
    owner: 'Resnovas',
    name: 'example',
    fullName: 'Resnovas/example',
    nodeId: 'R_example',
    private: false,
    defaultBranch: 'main',
  },
  labels: [],
  issues: new Map(),
  openIssues: [],
  pulls: new Map(),
  files: new Map(),
  executables: new Set(),
  proposals: [],
  checkRuns: [],
  commitChecks: new Map(),
  requests: [],
  graphql: [],
  nextId: 1,
})

/**
 * Builds an in-memory GitHub for tests.
 *
 * @remarks
 * It behaves like GitHub where features depend on it: labels are unique by
 * name ignoring case, renames carry a label on existing issues, missing
 * things fail with `NotFound`, and a proposal updates the open pull request
 * from its branch rather than opening another.
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
    const created = { labels: [], comments: [], open: true }
    state.issues.set(number, created)
    return created
  }
  const pull = (operation: string, number: number) => {
    const found = state.pulls.get(number)
    return found === undefined
      ? Effect.fail(new NotFound({ operation, detail: `pull request #${number}` }))
      : Effect.succeed(found)
  }

  const service: GitHubService = {
    coordinates: { owner: state.repository.owner, repo: state.repository.name },
    getRepository: Effect.sync(() => state.repository),
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
    closeIssue: (number) => Effect.sync(() => void (issue(number).open = false)),
    listCommits: (number) => Effect.map(pull('listCommits', number), (entry) => [...entry.commits]),
    listFiles: (number) => Effect.map(pull('listFiles', number), (entry) => [...entry.files]),
    listReviews: (number) => Effect.map(pull('listReviews', number), (entry) => [...entry.reviews]),
    countRequestedReviewers: (number) =>
      Effect.map(pull('countRequestedReviewers', number), (entry) => entry.requestedReviewers.length),
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
        const directory = location.path
          .split('/')
          .filter((part) => part !== '')
          .join('/')
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
    repositoryRequest: (request) => Effect.sync(() => (state.requests.push(request), null)),
    graphql: (query, variables) => Effect.sync(() => (state.graphql.push({ query, variables }), null)),
  }
  return { service, state }
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
