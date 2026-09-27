/**
 * @file tests/feature.backport/src/fixtures.ts
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
import { backport } from '@resnovas/feature.backport'
import { type Comment, GitHub, type GitCommit, makeMemoryGitHub } from '@resnovas/integrations.github'
import { Effect } from 'effect'

// Shared by the backport and feature specs: pull request #7, merged into
// main by a squash, a merge commit or a rebase, and a memory GitHub holding
// the commits each kind of merge leaves.

const commit = (sha: string, message: string, parents: ReadonlyArray<string>): [string, GitCommit] => [
  sha,
  { sha, message, parents },
]

export const COMMITS = new Map<string, GitCommit>([
  commit('base', 'chore: earlier work', ['older']),
  commit('squash', 'fix: a bug (#7)', ['base']),
  commit('merge', 'Merge pull request #7', ['base', 'two']),
  commit('rebased-one', 'fix: one', ['base']),
  commit('rebased-two', 'fix: two', ['rebased-one']),
  commit('lookalike', 'fix: two', ['base']),
  commit('root', 'initial commit', []),
])

const prCommit = (sha: string, message: string) => ({
  sha,
  message,
  authorName: 'Jane',
  authorEmail: 'jane@example.com',
  parents: 1,
  verified: true,
})

export const memory = (options: { readonly comments?: ReadonlyArray<Comment>; readonly commits?: number } = {}) => {
  const github = makeMemoryGitHub({
    gitCommits: new Map(COMMITS),
    branches: new Set(['main', 'v1', 'v2', 'v3']),
    pulls: new Map([
      [
        7,
        {
          commits: [prCommit('one', 'fix: one'), prCommit('two', 'fix: two')].slice(0, options.commits ?? 2),
          files: [],
          reviews: [],
          requestedReviewers: [],
          submittedReviews: [],
        },
      ],
    ]),
    nextId: 100,
  })
  github.state.issues.set(7, { labels: [], comments: [...(options.comments ?? [])], open: false })
  return github
}

export const payload = (
  options: {
    readonly action?: string
    readonly labels?: ReadonlyArray<string>
    readonly label?: string
    readonly merged?: boolean
    readonly sha?: string
    readonly body?: string | null
  } = {},
) => ({
  action: options.action ?? 'closed',
  ...(options.label === undefined ? {} : { label: { name: options.label } }),
  pull_request: {
    number: 7,
    title: 'fix: a bug',
    body: options.body === undefined ? 'Fixes the bug.' : options.body,
    user: { login: 'jane' },
    state: 'closed',
    locked: false,
    labels: (options.labels ?? ['backport v1']).map((name) => ({ name })),
    updated_at: '2026-09-01T00:00:00Z',
    head: { ref: 'fix/bug', sha: 'head' },
    base: { ref: 'main' },
    merged: options.merged ?? true,
    merge_commit_sha: options.sha ?? 'squash',
  },
})

export const run = (
  config: SmartcloudConfig,
  github: ReturnType<typeof memory>,
  body: ReturnType<typeof payload> = payload(),
  event = 'pull_request',
  service: GitHub['Type'] = github.service,
) => runFeatures({ config, event, payload: body, features: [backport] }).pipe(Effect.provideService(GitHub, service))

export const commentsOf = (github: ReturnType<typeof memory>) =>
  github.state.issues.get(7)?.comments.map((comment) => comment.body) ?? []
