/**
 * @file tools/ci/smoke/replay.ts
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

// Loaded through NODE_OPTIONS before the action in the CI smoke job. For
// `uses: ./` the runner sets GITHUB_EVENT_NAME, GITHUB_EVENT_PATH and
// GITHUB_STEP_SUMMARY itself, over anything the step's env gives, so this
// points them at a recorded event and at a summary file the next step checks.
// A missing variable stops the action, so it never runs on the live event.

const REPLAYED = {
  GITHUB_EVENT_NAME: 'SMOKE_EVENT_NAME',
  GITHUB_EVENT_PATH: 'SMOKE_EVENT_PATH',
  GITHUB_STEP_SUMMARY: 'SMOKE_SUMMARY',
} as const

for (const [target, source] of Object.entries(REPLAYED)) {
  const value = process.env[source]
  if (value === undefined || value === '') throw new Error(`${source} must be set to replay a recorded event.`)
  process.env[target] = value
}
