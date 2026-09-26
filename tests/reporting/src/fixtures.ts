/**
 * @file tests/reporting/src/fixtures.ts
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

// The findings and run the reporting tests format and publish.

import type { Finding, RunResult } from '@resnovas/engine'

export const subject = {
  kind: 'pullRequest' as const,
  number: 7,
  title: 'feat: x',
  body: '',
  author: 'jane',
  open: true,
  locked: false,
  labels: [],
  updatedAt: new Date(0),
}

export const error: Finding = {
  feature: 'commits',
  rule: 'DCO',
  level: 'error',
  message: 'No Signed-off-by | for <a@b>',
  link: 'https://x/CONTRIBUTING.md#dco',
  commit: 'abcdef1234567890',
}
export const warning: Finding = { feature: 'sync', rule: 'SYNC', level: 'warning', message: 'edits\na synced file', path: 'LICENSE', line: 3 }
export const notice: Finding = { feature: 'reviews', rule: 'REVIEW', level: 'notice', message: 'gate open' }

export const run = (overrides: Partial<RunResult> = {}): RunResult => ({
  envelope: { kind: 'pullRequest', event: 'pull_request', action: 'opened', subject, headSha: 'abc123' },
  ran: ['commits', 'sync', 'reviews'],
  skipped: [{ feature: 'stale', reason: 'does not handle pullRequest events' }],
  failed: [],
  findings: [error, warning, notice],
  changes: [{ feature: 'labels', description: 'added label bug to #7' }],
  facts: [],
  durations: {},
  ...overrides,
})
