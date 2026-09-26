/**
 * @file tests/runtime/src/fixtures.ts
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

// Config texts, event payloads, an in-memory GitHub and a recording
// Telemetry service shared by the runtime tests.

import { fileKey, type GitHubService, makeMemoryGitHub, type MemoryState } from '@resnovas/integrations.github'
import { disabledTelemetry, type Identity, type TelemetryService } from '@resnovas/integrations.posthog'
import { Telemetry } from '@resnovas/runtime'
import { ConfigProvider, Effect, Layer } from 'effect'
import { join } from 'node:path'

export const fixture = (name: string) => join(import.meta.dirname, '../../config/src/fixtures', name)
export const withEnv = (env: Record<string, string>) => Effect.withConfigProvider(ConfigProvider.fromMap(new Map(Object.entries(env))))

export const CONVENTIONS = 'version: 2\nconventions:\n  rules:\n    title:\n      preset: conventionalCommits\n'

export const pull = {
  number: 7,
  title: 'Add things',
  body: null,
  user: { login: 'jane' },
  state: 'open',
  locked: false,
  draft: false,
  labels: [],
  updated_at: '2026-09-01T00:00:00Z',
  head: { ref: 'feat/x', sha: 'abc123' },
  additions: 3,
  deletions: 1,
}
export const issue = { ...pull, number: 9, title: 'A bug' }

// The in-memory GitHub, answering the REST reads a dry run makes.
export const memory = (files: Record<string, string> = {}, seed: Partial<MemoryState> = {}, routes: Record<string, unknown> = {}) => {
  const github = makeMemoryGitHub(seed)
  for (const [path, text] of Object.entries(files)) github.state.files.set(fileKey('Resnovas', 'example', path), text)
  github.state.pulls.set(7, { commits: [], files: [], reviews: [], requestedReviewers: [], submittedReviews: [] })
  const answers = new Map(Object.entries({ '/pulls/7': pull, '/issues/9': issue, '/commits/main': { sha: 'def456' }, ...routes }))
  const service: GitHubService = {
    ...github.service,
    repositoryRequest: (request) =>
      request.method === 'GET' && answers.has(request.path) ? Effect.succeed(answers.get(request.path)) : github.service.repositoryRequest(request),
  }
  return { service, state: github.state }
}

export const repository = { owner: 'Resnovas', repo: 'example' }
export const LABELS = 'version: 2\nlabels:\n  bug: { name: bug, color: d73a4a }\n'
export const PUSH = { name: 'push', payload: { ref: 'refs/heads/main', after: 'abc123' } }

// A Telemetry service that records what it is asked to send, answering flags from a map.
export const recording = (flags: Readonly<Record<string, boolean>> = {}) => {
  const events: Array<{ readonly event: string; readonly properties: Readonly<Record<string, unknown>>; readonly identity: Identity }> = []
  const errors: Array<unknown> = []
  const exceptions: Array<{ readonly error: unknown; readonly properties: Readonly<Record<string, unknown>>; readonly identity: Identity }> = []
  const organisations: Array<Readonly<Record<string, unknown>>> = []
  const protectedValues: Array<string> = []
  let enabled = true
  const service: TelemetryService = {
    ...disabledTelemetry,
    isEnabled: Effect.sync(() => enabled),
    disable: Effect.sync(() => {
      enabled = false
    }),
    protect: (value) => Effect.sync(() => void protectedValues.push(value)),
    capture: (identity, event, properties = {}) => Effect.sync(() => void (enabled && events.push({ event, properties, identity }))),
    captureException: (identity, error, properties = {}) =>
      Effect.sync(() => {
        if (!enabled) return
        errors.push(error)
        exceptions.push({ error, properties, identity })
      }),
    describeOrganization: (_identity, properties) => Effect.sync(() => void (enabled && organisations.push(properties))),
    evaluateFlag: (_identity, key, fallback) => Effect.sync(() => (enabled ? (flags[key] ?? fallback) : fallback)),
  }
  const named = (name: string) => events.filter((event) => event.event === name)
  return { layer: Layer.succeed(Telemetry, service), events, errors, exceptions, organisations, protectedValues, named, enabled: () => enabled }
}

export const withConfig = (text: string, overrides: Partial<GitHubService> = {}) => {
  const github = makeMemoryGitHub()
  github.state.files.set(fileKey('Resnovas', 'example', '.github/smartcloud.yml'), text)
  const service: GitHubService = { ...github.service, ...overrides }
  return service
}
