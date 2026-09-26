/**
 * @file tests/feature.labels/src/fixtures.ts
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
import { makeMemoryGitHub } from '@resnovas/integrations.github'

// Payloads, the config and GitHub's state shared by the apply and feature specs.

export const pullRequest = (labelNames: ReadonlyArray<string>, title = 'feat: add sync') => ({
  action: 'synchronize',
  pull_request: {
    number: 7,
    title,
    body: 'Adds label sync.',
    user: { login: 'jane' },
    state: 'open',
    locked: false,
    labels: labelNames.map((name) => ({ name })),
    updated_at: '2026-09-01T00:00:00Z',
    draft: false,
    head: { ref: 'feat/sync', sha: 'abc123' },
    additions: 10,
    deletions: 2,
  },
})

export const issue = (labelNames: ReadonlyArray<string>, title = 'bug: sync fails') => ({
  action: 'edited',
  issue: {
    number: 3,
    title,
    body: null,
    user: { login: 'sam' },
    state: 'open',
    locked: false,
    labels: labelNames.map((name) => ({ name })),
    updated_at: '2026-09-01T00:00:00Z',
  },
})

export const titled = (pattern: string) => ({ condition: [{ type: 'titleMatches' as const, condition: pattern }] })

export const config: SmartcloudConfig = {
  version: 2,
  labels: { feature: { name: 'Type: Feature', color: 'a2eeef' }, bug: { name: 'Type: Bug', color: 'd73a4a' } },
  labelling: {
    feature: { label: 'feature', when: titled('^feat') },
    bug: { label: 'bug', when: titled('^bug') },
    docs: { label: 'docs', on: ['pullRequest'], when: { condition: [{ type: 'filesMatch', condition: 'docs/**' }] } },
    triage: { label: 'triage', on: ['issue'], when: { condition: [] } },
  },
}

// Seeds GitHub's view of the subject's labels, so removals find them.
export const memoryWith = (number: number, labelNames: ReadonlyArray<string>, files: ReadonlyArray<string> = []) => {
  const memory = makeMemoryGitHub({
    pulls: new Map([
      [7, { commits: [], files: [...files], reviews: [], requestedReviewers: [], submittedReviews: [] }],
    ]),
  })
  memory.state.issues.set(number, { labels: [...labelNames], comments: [], open: true })
  return memory
}
