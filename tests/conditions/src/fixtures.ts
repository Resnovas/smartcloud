/**
 * @file tests/conditions/src/fixtures.ts
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

import type { Commit, Subject } from '@resnovas/conditions'

/** A signed-off, ordinary commit by Jane. */
export const commit = (message: string, overrides: Partial<Commit> = {}): Commit => ({
  sha: 'a'.repeat(40),
  message,
  authorName: 'Jane Doe',
  authorEmail: 'jane@example.com',
  parents: 1,
  ...overrides,
})

/** An open pull request with every facet loaded and nothing notable about it. */
export const pullRequest = (overrides: Partial<Subject> = {}): Subject => ({
  kind: 'pullRequest',
  number: 7,
  title: 'feat(labels): sync labels',
  body: 'Adds label sync.',
  author: 'jane',
  open: true,
  locked: false,
  labels: ['Type - Feature'],
  updatedAt: new Date(0),
  draft: false,
  headBranch: 'feat/labels',
  changes: 40,
  files: ['packages/labels/src/sync.ts', 'README.md'],
  reviews: [],
  pendingReviewers: 0,
  commits: [commit('feat: sync\n\nSigned-off-by: Jane Doe <jane@example.com>')],
  ...overrides,
})

/** An open issue: no pull request fields at all. */
export const issue = (overrides: Partial<Subject> = {}): Subject => ({
  kind: 'issue',
  number: 3,
  title: 'Labels are not synced',
  body: '',
  author: 'sam',
  open: true,
  locked: false,
  labels: [],
  updatedAt: new Date(0),
  ...overrides,
})
