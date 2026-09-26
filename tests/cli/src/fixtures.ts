/**
 * @file tests/cli/src/fixtures.ts
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

// Shared setup for the CLI tests: the v1 fixtures, a config source over the
// in-memory GitHub, and a repository answering the reads a dry run makes.

import { GitHub, type GitHubService, makeMemoryGitHub } from '@resnovas/integrations.github'
import type { Connect } from '@resnovas/runtime'
import { ConfigSourceFromGitHub } from '@resnovas/smartcloud'
import { Effect, Layer } from 'effect'
import { join } from 'node:path'

export const fixture = (name: string) => join(import.meta.dirname, '../../config/src/fixtures', name)

export const memorySource = (files: Record<string, string>) => {
  const { service, state } = makeMemoryGitHub()
  for (const [key, text] of Object.entries(files)) state.files.set(key, text)
  return ConfigSourceFromGitHub.pipe(Layer.provide(Layer.succeed(GitHub, service)))
}

export const CONVENTIONS = 'version: 2\nconventions:\n  rules:\n    title:\n      preset: conventionalCommits\n'

export const pull = {
  number: 7,
  title: 'Add things',
  body: '',
  user: { login: 'jane' },
  state: 'open',
  locked: false,
  labels: [],
  updated_at: '2026-09-01T00:00:00Z',
  head: { ref: 'feat/x', sha: 'abc123' },
}

// The in-memory GitHub, answering the pull request read a dry run makes.
export const repository = (files: Record<string, string>) => {
  const github = makeMemoryGitHub()
  for (const [key, text] of Object.entries(files)) github.state.files.set(key, text)
  github.state.pulls.set(7, { commits: [], files: [], reviews: [], requestedReviewers: [], submittedReviews: [] })
  const service: GitHubService = {
    ...github.service,
    repositoryRequest: (request) =>
      request.method === 'GET' && request.path === '/pulls/7' ? Effect.succeed(pull) : github.service.repositoryRequest(request),
  }
  const connect: Connect = () => Effect.succeed(service)
  return { connect, state: github.state }
}
