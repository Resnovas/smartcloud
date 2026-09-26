/**
 * @file tests/mcp/src/fixtures.ts
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

// Shared setup for the MCP tests: the v1 fixtures, a config, and the
// in-memory GitHub answering the reads a dry run makes.

import { NodeContext } from '@effect/platform-node'
import { fileKey, GitHub, type GitHubService, makeMemoryGitHub } from '@resnovas/integrations.github'
import { ConfigSourceFromGitHub, type Connect } from '@resnovas/runtime'
import type { ToolResult } from '@resnovas/smartcloud-mcp'
import { Effect, Layer } from 'effect'
import { join } from 'node:path'

export const fixture = (name: string) => join(import.meta.dirname, '../../config/src/fixtures', name)

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

// The in-memory GitHub: a repository with a config, a preset, and the pull request read a dry run makes.
export const memory = () => {
  const github = makeMemoryGitHub()
  github.state.files.set(fileKey('Resnovas', 'example', '.github/smartcloud.yml'), `${CONVENTIONS}settings:\n  merging: { squash: true }\n`)
  github.state.files.set(fileKey('Resnovas', '.github', 'house.yml'), 'version: 2\nroles: { maintainers: [a] }\n')
  github.state.pulls.set(7, { commits: [], files: [], reviews: [], requestedReviewers: [], submittedReviews: [] })
  const service: GitHubService = {
    ...github.service,
    repositoryRequest: (request) =>
      request.method === 'GET' && request.path === '/pulls/7' ? Effect.succeed(pull) : github.service.repositoryRequest(request),
  }
  const connect: Connect = () => Effect.succeed(service)
  const layer = Layer.mergeAll(NodeContext.layer, ConfigSourceFromGitHub.pipe(Layer.provide(Layer.succeed(GitHub, service))))
  return { connect, layer, state: github.state }
}

// The directory the server may read config files from, in tests that read none.
export const ROOT = import.meta.dirname

export const textOf = (result: ToolResult) => result.content.map((part) => part.text).join('\n')
