/**
 * @file tests/feature.commands/src/fixtures.ts
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

import type { SmartcloudConfig } from '@resnovas/config'
import { runFeatures } from '@resnovas/engine'
import { makeCommandsFeature, type Runner } from '@resnovas/feature.commands'
import { GitHub, type GitHubError, makeMemoryGitHub, type RepositoryRequest } from '@resnovas/integrations.github'
import { Effect, TestClock } from 'effect'

// Shared by the commands specs: a memory GitHub whose repository requests are
// answered by routes, and issue_comment events to run the feature on.

export const NOW = Date.UTC(2026, 8, 26)

/** Answers a repository request; the key is `METHOD /path`. */
export type Route = (request: RepositoryRequest) => Effect.Effect<unknown, GitHubError>

export const ok =
  (value: unknown): Route =>
  () =>
    Effect.succeed(value)

export const fail =
  (error: GitHubError): Route =>
  () =>
    Effect.fail(error)

export const pull = (overrides: Record<string, unknown> = {}) => ({
  node_id: 'PR_7',
  number: 7,
  title: 'Fix the thing',
  state: 'open',
  merged: false,
  merge_commit_sha: null,
  user: { login: 'sam' },
  commits: 1,
  base: { ref: 'main' },
  ...overrides,
})

export const role = (name: string, permission = name) => ({ permission, role_name: name })

export const makeGitHub = (
  routes: Record<string, Route> = {},
  labels: ReadonlyArray<string> = ['bug', 'good first issue'],
  itemLabels: ReadonlyArray<string> = [],
) => {
  const memory = makeMemoryGitHub({
    labels: labels.map((name) => ({ name, color: 'ededed', description: '' })),
    pulls: new Map([[7, { commits: [], files: [], reviews: [], requestedReviewers: [], submittedReviews: [] }]]),
  })
  memory.state.issues.set(7, { labels: [...itemLabels], comments: [], open: true })
  const requests: Array<RepositoryRequest> = []
  const service: GitHub['Type'] = {
    ...memory.service,
    // Recorded when run, not when built, as the live service would.
    repositoryRequest: (request) =>
      Effect.suspend(() => {
        requests.push(request)
        const route = routes[`${request.method} ${request.path}`]
        return route === undefined ? Effect.succeed(null) : route(request)
      }),
  }
  return { service, state: memory.state, requests }
}

export type TestGitHub = ReturnType<typeof makeGitHub>

export const commentEvent = (
  body: string,
  options: {
    readonly commenter?: string
    readonly author?: string
    readonly pullRequest?: boolean
    readonly labels?: ReadonlyArray<string>
    readonly action?: string
    readonly bot?: boolean
  } = {},
) => ({
  name: 'issue_comment',
  payload: {
    action: options.action ?? 'created',
    issue: {
      number: 7,
      title: 'Fix the thing',
      body: '',
      user: { login: options.author ?? 'sam' },
      state: 'open',
      locked: false,
      labels: (options.labels ?? []).map((name) => ({ name })),
      updated_at: '2026-09-01T00:00:00Z',
      ...(options.pullRequest === false ? {} : { pull_request: { url: 'x' } }),
    },
    comment: {
      id: 99,
      body,
      user: { login: options.commenter ?? 'maya', type: options.bot === true ? 'Bot' : 'User' },
    },
  },
})

export const pullRequestEvent = (action: string, labels: ReadonlyArray<string>) => ({
  name: 'pull_request',
  payload: {
    action,
    pull_request: {
      number: 7,
      title: 'Fix the thing',
      body: '',
      user: { login: 'sam' },
      state: 'closed',
      locked: false,
      labels: labels.map((name) => ({ name })),
      updated_at: '2026-09-01T00:00:00Z',
      head: { ref: 'fix', sha: 'abc' },
    },
  },
})

export const base: SmartcloudConfig = { version: 2, commands: {} }

export const run = (
  github: TestGitHub,
  event: { readonly name: string; readonly payload: unknown },
  config: SmartcloudConfig = base,
  runner?: Runner,
) =>
  Effect.gen(function* () {
    yield* TestClock.setTime(NOW)
    return yield* runFeatures({
      config,
      event: event.name,
      payload: event.payload,
      features: [makeCommandsFeature(runner === undefined ? {} : { runner })],
    }).pipe(Effect.provideService(GitHub, github.service))
  })

/** The bodies of the comments smartcloud wrote on #7. */
export const replies = (github: TestGitHub) => github.state.issues.get(7)?.comments.map((comment) => comment.body) ?? []

/** The requests made, as `METHOD /path`. */
export const calls = (github: TestGitHub) => github.requests.map((request) => `${request.method} ${request.path}`)

/** A write role for the default commenter. */
export const writer = { 'GET /collaborators/maya/permission': ok(role('write')) }
