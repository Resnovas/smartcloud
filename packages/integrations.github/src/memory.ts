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
 * (CODE_OF_CONDUCT.md) and the Eventiva Cooperation Commitment
 * (COOPERATION_COMMITMENT.md).
 *
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE.
 */

import type { Commit, Review } from '@resnovas/conditions'
import { Effect, Layer } from 'effect'
import { NotFound, ValidationFailed } from './errors.js'
import {
  type CheckRun,
  type Comment,
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
  checkRuns: Array<CheckRun & { readonly id: number }>
  requests: Array<RepositoryRequest>
  graphql: Array<{ readonly query: string; readonly variables: Readonly<Record<string, unknown>> }>
  nextId: number
}

/** The key the in-memory GitHub stores a file under. */
export const fileKey = (owner: string, repo: string, path: string, ref = '') => `${owner}/${repo}/${path}@${ref}`

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
  checkRuns: [],
  requests: [],
  graphql: [],
  nextId: 1,
})

/**
 * Builds an in-memory GitHub for tests.
 *
 * @remarks
 * It behaves like GitHub where features depend on it: labels are unique by
 * name ignoring case, renames carry a label on existing issues, and missing
 * things fail with `NotFound`.
 *
 * @example
 * ```ts
 * const { service, state } = makeMemoryGitHub({ labels: [{ name: 'bug', color: 'd73a4a', description: '' }] })
 * // run a feature with Effect.provideService(GitHub, service), then inspect state.labels
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
    return found === undefined ? Effect.fail(new NotFound({ operation, detail: `pull request #${number}` })) : Effect.succeed(found)
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
      Effect.suspend(() => {
        const index = state.labels.findIndex((existing) => same(existing.name, current))
        if (index === -1) return Effect.fail(new NotFound({ operation: 'updateLabel', detail: `label ${current}` }))
        state.labels[index] = label
        for (const entry of state.issues.values()) entry.labels = entry.labels.map((name) => (same(name, current) ? label.name : name))
        return Effect.void
      }),
    deleteLabel: (name) =>
      Effect.suspend(() => {
        const before = state.labels.length
        state.labels = state.labels.filter((existing) => !same(existing.name, name))
        if (state.labels.length === before) return Effect.fail(new NotFound({ operation: 'deleteLabel', detail: `label ${name}` }))
        for (const entry of state.issues.values()) entry.labels = entry.labels.filter((label) => !same(label, name))
        return Effect.void
      }),
    addLabels: (number, labels) =>
      Effect.sync(() => {
        const entry = issue(number)
        for (const label of labels) if (!entry.labels.some((existing) => same(existing, label))) entry.labels.push(label)
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
        const comment = { id: state.nextId++, body, author: 'smartcloud[bot]' }
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
    countRequestedReviewers: (number) => Effect.map(pull('countRequestedReviewers', number), (entry) => entry.requestedReviewers.length),
    createReview: (number, review) => Effect.map(pull('createReview', number), (entry) => void entry.submittedReviews.push(review)),
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
    getFile: (location) =>
      Effect.suspend(() => {
        const text = state.files.get(fileKey(location.owner, location.repo, location.path, location.ref))
        return text === undefined
          ? Effect.fail(new NotFound({ operation: 'getFile', detail: `${location.owner}/${location.repo}/${location.path}` }))
          : Effect.succeed(text)
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
 * @param seed - Initial state.
 * @returns The layer.
 */
export const GitHubMemory = (seed: Partial<MemoryState> = {}) => Layer.succeed(GitHub, makeMemoryGitHub(seed).service)
