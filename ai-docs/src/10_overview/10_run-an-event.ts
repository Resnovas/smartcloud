/**
 * @file ai-docs/src/10_overview/10_run-an-event.ts
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
 * @title Running smartcloud for one event
 *
 * `runEvent` is the pipeline every surface shares: config, features, report,
 * notifications. Only the `GitHub` service decides where it acts, so this
 * runs against the in-memory GitHub exactly as the action runs against the
 * real one.
 */
import { GitHubMemory } from '@resnovas/integrations.github'
import { runEvent } from '@resnovas/runtime'
import { Effect } from 'effect'

// Config given as text is used as it is; without `text`, runEvent reads the
// first of CONFIG_CANDIDATES from the repository through the GitHub service.
const config = {
  text: { text: 'version: 2\nlabels: { bug: { name: bug, color: d73a4a } }\n', source: '.github/smartcloud.yml' },
}

export const example = runEvent({
  config,
  // Omit `features` to run every feature; a name that does not exist fails
  // with UnknownFeatures rather than being ignored.
  features: ['labels'],
  // As GitHub sends it: the event name and the payload.
  event: { name: 'schedule', payload: {} },
}).pipe(
  Effect.map(({ result, published, warnings }) => ({
    ran: result.ran,
    skipped: result.skipped,
    findings: result.findings.length,
    summary: published.summary,
    warnings,
  })),
  Effect.provide(GitHubMemory()),
)
