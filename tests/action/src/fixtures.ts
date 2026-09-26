/**
 * @file tests/action/src/fixtures.ts
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

// Shared setup for the action tests: the environment, a pull request payload,
// the in-memory GitHub and the inputs.

import type { Inputs } from '@resnovas/action'
import { fileKey, makeMemoryGitHub, type MemoryState } from '@resnovas/integrations.github'
import { ConfigProvider, Effect, Option, Redacted } from 'effect'

export const withEnv = (env: Record<string, string>) => Effect.withConfigProvider(ConfigProvider.fromMap(new Map(Object.entries(env))))

// A pull request payload with the fields GitHub sends.
export const pullRequest = (title: string) => ({
  action: 'opened',
  pull_request: {
    number: 7,
    title,
    body: '',
    user: { login: 'jane' },
    state: 'open',
    locked: false,
    draft: false,
    labels: [],
    updated_at: '2026-09-01T00:00:00Z',
    head: { ref: 'feat/x', sha: 'abc123' },
  },
})

export const CONVENTIONS = 'version: 2\nconventions:\n  rules:\n    title:\n      preset: conventionalCommits\n'

export const memory = (files: Record<string, string> = {}, seed: Partial<MemoryState> = {}) => {
  const github = makeMemoryGitHub(seed)
  for (const [path, text] of Object.entries(files)) github.state.files.set(fileKey('Resnovas', 'example', path), text)
  github.state.pulls.set(7, { commits: [], files: [], reviews: [], requestedReviewers: [], submittedReviews: [] })
  return github
}

export const inputs = (overrides: Partial<Inputs> = {}): Inputs => ({
  token: Redacted.make('t'),
  workflowToken: Option.none(),
  config: Option.none(),
  configJson: Option.none(),
  configRef: Option.none(),
  dryRun: false,
  features: Option.none(),
  checkRunId: Option.none(),
  telemetry: true,
  deprecations: [],
  given: [],
  ...overrides,
})
