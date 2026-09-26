/**
 * @file tests/engine/src/fixtures.ts
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

// Minimal payloads with the fields GitHub sends for each event, as
// documented in GitHub's webhook payload reference.

const issueFields = {
  number: 3,
  title: 'Labels are not synced',
  body: null,
  user: { login: 'sam' },
  state: 'open',
  locked: false,
  labels: [{ name: 'bug' }],
  updated_at: '2026-09-01T00:00:00Z',
}

export const pullRequestPayload = {
  action: 'opened',
  pull_request: {
    ...issueFields,
    number: 7,
    title: 'feat(labels): sync labels',
    body: 'Adds label sync.',
    user: { login: 'jane' },
    draft: true,
    head: { ref: 'feat/labels', sha: 'abc123' },
    additions: 30,
    deletions: 10,
  },
}

export const issuePayload = { action: 'labeled', issue: issueFields }

export const commentOnPullRequestPayload = { action: 'created', issue: { ...issueFields, pull_request: { url: 'x' } } }

export const mergeGroupPayload = { action: 'checks_requested', merge_group: { head_sha: 'def456', head_ref: 'gh-readonly-queue/main/pr-7' } }

export const pushPayload = { ref: 'refs/heads/main', after: 'fed789' }
