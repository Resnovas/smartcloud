/**
 * @file tests/feature.stale/src/fixtures.ts
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
import { stale, type StaleConfig } from '@resnovas/feature.stale'
import { GitHub, makeMemoryGitHub, type Comment, type IssueSummary } from '@resnovas/integrations.github'
import { Effect, TestClock } from 'effect'

// Shared by the sweep and feature specs: a fixed clock, open items, and a
// memory GitHub seeded with each item's labels and comments.

export const DAY = 86_400_000
export const NOW = Date.UTC(2026, 8, 26)
export const daysAgo = (days: number) => new Date(NOW - days * DAY)

export const item = (number: number, overrides: Partial<IssueSummary> = {}): IssueSummary => ({
  number,
  title: `item ${number}`,
  body: '',
  author: 'sam',
  open: true,
  locked: false,
  labels: [],
  updatedAt: daysAgo(0),
  isPullRequest: false,
  ...overrides,
})

// Seeds the listing and GitHub's own view of each item's labels and comments.
export const memory = (
  items: ReadonlyArray<IssueSummary>,
  comments: Readonly<Record<number, ReadonlyArray<Comment>>> = {},
) => {
  const github = makeMemoryGitHub({ openIssues: [...items], nextId: 100 })
  for (const entry of items) {
    github.state.issues.set(entry.number, {
      labels: [...entry.labels],
      comments: [...(comments[entry.number] ?? [])],
      open: true,
    })
  }
  return github
}

export const settings: StaleConfig = {
  staleAfterDays: 30,
  staleLabel: 'stale',
  staleComment: 'This has been quiet for a while.',
  abandonedAfterDays: 7,
  abandonedComment: 'Closing as abandoned.',
  close: true,
}

export const sweep = (
  config: SmartcloudConfig,
  github: ReturnType<typeof memory>,
  event = 'schedule',
  service: GitHub['Type'] = github.service,
) =>
  Effect.gen(function* () {
    yield* TestClock.setTime(NOW)
    // A push payload must carry what GitHub sends for one; the others need nothing.
    const payload = event === 'push' ? { ref: 'refs/heads/main', after: 'abc123' } : {}
    return yield* runFeatures({ config, event, payload, features: [stale] }).pipe(
      Effect.provideService(GitHub, service),
    )
  })

export const labelsOf = (github: ReturnType<typeof memory>, number: number) => github.state.issues.get(number)?.labels
export const commentsOf = (github: ReturnType<typeof memory>, number: number) =>
  github.state.issues.get(number)?.comments.map((c) => c.body)
