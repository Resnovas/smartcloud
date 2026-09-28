/**
 * @file tests/feature.commits/src/fixtures.ts
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

import type { Commit } from '@resnovas/conditions'
import type { SmartcloudConfig } from '@resnovas/config'
import { type Feature, type Finding, type RunResult, runFeatures } from '@resnovas/engine'
import { GitHub, makeMemoryGitHub } from '@resnovas/integrations.github'
import { Effect } from 'effect'

// Fixtures mirror Resnovas/.github test/policy.test.mjs, so each ported case
// reads the same as the one it replaces.

export const signed = 'Signed-off-by: A Contributor <contrib@example.com>'
export const coAuthor =
  'Co-authored-by: Claude Opus 5.5 <noreply@anthropic.com>\nAssisted-by: claude-code:claude-opus-5-5'

export const commit = (message: string, extra: Partial<Commit> = {}): Commit => ({
  sha: 'a'.repeat(40),
  message,
  authorName: 'A Contributor',
  authorEmail: 'contrib@example.com',
  parents: 1,
  verified: false,
  ...extra,
})

export const roles = { maintainers: ['owner-one'], trustedBots: ['dependabot[bot]'] }

export interface PullRequest {
  readonly config: SmartcloudConfig
  readonly commits: ReadonlyArray<Commit>
  readonly body?: string
  readonly author?: string
  readonly draft?: boolean
  readonly action?: string
  readonly owner?: string
}

/**
 * Runs one feature through the engine against a pull request event, as the
 * action would, with an in-memory GitHub holding the pull request's commits.
 */
export const runOn = (feature: Feature, pr: PullRequest): Effect.Effect<RunResult, unknown> => {
  const { service } = makeMemoryGitHub({
    repository: {
      owner: pr.owner ?? 'Resnovas',
      name: 'example',
      fullName: `${pr.owner ?? 'Resnovas'}/example`,
      nodeId: 'R_example',
      private: false,
      defaultBranch: 'main',
    },
    pulls: new Map([
      [7, { commits: [...pr.commits], files: [], reviews: [], requestedReviewers: [], submittedReviews: [] }],
    ]),
  })
  const payload = {
    action: pr.action ?? 'edited',
    pull_request: {
      number: 7,
      title: 'fix(auth): reject expired tokens',
      body: pr.body ?? '',
      user: { login: pr.author ?? 'contrib' },
      state: 'open',
      locked: false,
      labels: [],
      updated_at: '2026-09-01T00:00:00Z',
      draft: pr.draft ?? false,
      head: { ref: 'fix/auth', sha: 'abc123' },
    },
  }
  return runFeatures({ config: pr.config, event: 'pull_request', payload, features: [feature] }).pipe(
    Effect.provideService(GitHub, service),
  )
}

/** The rule ids of the findings, optionally only those at one level. */
export const rules = (findings: ReadonlyArray<Finding>, level?: Finding['level']): ReadonlyArray<string> =>
  findings.filter((finding) => level === undefined || finding.level === level).map((finding) => finding.rule)
