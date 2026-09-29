/**
 * @file tests/feature.lock/src/fixtures.ts
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

import type { SmartcloudConfig } from '@resnovas/config'
import { runFeatures } from '@resnovas/engine'
import { lock } from '@resnovas/feature.lock'
import { GitHub, makeMemoryGitHub, type ClosedIssueSummary, type Comment } from '@resnovas/integrations.github'
import { Effect, TestClock } from 'effect'

// Shared by the sweep and feature specs: a fixed clock, closed items, and a
// memory GitHub seeded with each item's labels and comments.

export const DAY = 86_400_000
export const NOW = Date.UTC(2026, 8, 26)
export const daysAgo = (days: number) => new Date(NOW - days * DAY)

export const closed = (number: number, overrides: Partial<ClosedIssueSummary> = {}): ClosedIssueSummary => ({
  number,
  title: `item ${number}`,
  body: '',
  author: 'sam',
  open: false,
  locked: false,
  labels: [],
  updatedAt: daysAgo(40),
  closedAt: daysAgo(40),
  isPullRequest: false,
  ...overrides,
})

export const memory = (
  items: ReadonlyArray<ClosedIssueSummary>,
  comments: Readonly<Record<number, ReadonlyArray<Comment>>> = {},
) => {
  const github = makeMemoryGitHub({ closedIssues: [...items], nextId: 100 })
  for (const entry of items) {
    github.state.issues.set(entry.number, {
      labels: [...entry.labels],
      comments: [...(comments[entry.number] ?? [])],
      open: false,
    })
  }
  return github
}

export const lockedOf = (github: ReturnType<typeof memory>) =>
  [...github.state.issues.entries()].filter(([, entry]) => entry.locked === true).map(([number]) => number)

export const sweep = (
  config: SmartcloudConfig,
  github: ReturnType<typeof memory>,
  event = 'schedule',
  service: GitHub['Type'] = github.service,
) =>
  Effect.gen(function* () {
    yield* TestClock.setTime(NOW)
    const payload = event === 'push' ? { ref: 'refs/heads/main', after: 'abc123' } : {}
    return yield* runFeatures({ config, event, payload, features: [lock] }).pipe(Effect.provideService(GitHub, service))
  })
