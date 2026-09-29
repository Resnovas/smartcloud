/**
 * @file ai-docs/src/30_features/20_run-a-feature.ts
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

/**
 * @title Running features in a dry run
 *
 * `runFeatures` is the engine without config loading or publishing. Under
 * `DryRun` every read reaches the provided GitHub and every write is only
 * recorded, which is how the CLI previews a run.
 */
import { runFeatures } from '@resnovas/engine'
import { DryRun, DryRunLog, GitHubMemory } from '@resnovas/integrations.github'
import { FEATURES } from '@resnovas/runtime'
import { Effect, Layer } from 'effect'

export const example = Effect.gen(function* () {
  const result = yield* runFeatures({
    config: { version: 2, labels: { bug: { name: 'bug', color: 'd73a4a' } } },
    event: 'schedule',
    payload: {},
    features: FEATURES,
    // Switched off from outside the config, with the reason the report shows.
    turnedOff: new Map([['sync', 'turned off by feature flag smartcloud-sync']]),
  })
  const writes = yield* (yield* DryRunLog).writes
  return {
    ran: result.ran,
    // Each skipped feature says why: not configured, wrong event kind, a flag.
    skipped: result.skipped,
    // A failed feature is recorded here, never thrown.
    failed: result.failed,
    writes: writes.map((write) => write.operation),
  }
  // DryRun wraps whichever GitHub is provided below it.
}).pipe(Effect.provide(DryRun.pipe(Layer.provide(GitHubMemory()))))
