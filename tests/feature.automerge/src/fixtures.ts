/**
 * @file tests/feature.automerge/src/fixtures.ts
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

import type { ConditionGroup } from '@resnovas/conditions'
import type { SmartcloudConfig } from '@resnovas/config'
import { runFeatures } from '@resnovas/engine'
import { autoMergeFeature } from '@resnovas/feature.automerge'
import { type Comment, GitHub, type GitHubError, makeMemoryGitHub } from '@resnovas/integrations.github'
import { Effect } from 'effect'

// Shared by the auto-merge specs: pull request #7 from Dependabot, and a
// memory GitHub whose `GET /pulls/7` answers with the pull request's
// auto-merge, which the enable and disable mutations change.

export interface AutoMergeFixture {
  enabledBy: string
  method: string
}

export const memory = (
  options: {
    readonly autoMerge?: AutoMergeFixture
    readonly comments?: ReadonlyArray<Comment>
    readonly state?: string
    /** Fails every GraphQL mutation with this. */
    readonly refuse?: GitHubError
    /** Fails the pull request read with this. */
    readonly readError?: GitHubError
  } = {},
) => {
  const github = makeMemoryGitHub({
    pulls: new Map([[7, { commits: [], files: [], reviews: [], requestedReviewers: [], submittedReviews: [] }]]),
    nextId: 100,
  })
  github.state.issues.set(7, { labels: [], comments: [...(options.comments ?? [])], open: true })
  const pull = { autoMerge: options.autoMerge }
  const mutations: Array<{ readonly query: string; readonly variables: Readonly<Record<string, unknown>> }> = []
  const service: GitHub['Type'] = {
    ...github.service,
    repositoryRequest: (request) =>
      Effect.suspend(() => {
        if (options.readError !== undefined) return Effect.fail(options.readError)
        return request.method === 'GET' && request.path === '/pulls/7'
          ? Effect.succeed({
              node_id: 'PR_7',
              state: options.state ?? 'open',
              auto_merge:
                pull.autoMerge === undefined
                  ? null
                  : { enabled_by: { login: pull.autoMerge.enabledBy }, merge_method: pull.autoMerge.method },
            })
          : Effect.succeed(null)
      }),
    graphql: (query, variables) =>
      Effect.suspend(() => {
        if (options.refuse !== undefined) return Effect.fail(options.refuse)
        mutations.push({ query, variables })
        if (query.includes('enablePullRequestAutoMerge')) {
          pull.autoMerge = { enabledBy: 'smartcloud[bot]', method: String(variables['method']).toLowerCase() }
        } else if (query.includes('disablePullRequestAutoMerge')) {
          pull.autoMerge = undefined
        }
        return Effect.succeed(null)
      }),
  }
  return { ...github, service, pull, mutations }
}

export type Memory = ReturnType<typeof memory>

export const payload = (
  options: {
    readonly action?: string
    readonly title?: string
    readonly author?: string
    readonly draft?: boolean
    readonly state?: 'open' | 'closed'
  } = {},
) => ({
  action: options.action ?? 'opened',
  pull_request: {
    number: 7,
    title: options.title ?? 'Bump effect from 3.1.0 to 3.1.1',
    body: '',
    user: { login: options.author ?? 'dependabot[bot]', type: 'Bot' },
    state: options.state ?? 'open',
    locked: false,
    labels: [],
    draft: options.draft ?? false,
    updated_at: '2026-09-01T00:00:00Z',
    head: { ref: 'dependabot/npm_and_yarn/effect-3.1.1', sha: 'head' },
    base: { ref: 'main' },
  },
})

export const PATCH: ConditionGroup = { condition: [{ type: 'dependencyUpdateType', condition: ['patch'] }] }
export const MINOR: ConditionGroup = { condition: [{ type: 'dependencyUpdateType', condition: ['minor'] }] }

export const config = (autoMerge: SmartcloudConfig['autoMerge'] = { rules: { patch: { when: PATCH } } }) => ({
  version: 2 as const,
  autoMerge,
})

export const run = (
  settings: SmartcloudConfig,
  github: Memory,
  body: ReturnType<typeof payload> = payload(),
  event = 'pull_request',
) =>
  runFeatures({ config: settings, event, payload: body, features: [autoMergeFeature] }).pipe(
    Effect.provideService(GitHub, github.service),
  )

export const commentsOf = (github: Memory) => github.state.issues.get(7)?.comments.map((comment) => comment.body) ?? []
