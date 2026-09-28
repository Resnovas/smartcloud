/**
 * @file ai-docs/src/50_github/10_handle-errors.ts
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
 * @title Calling GitHub and handling its errors
 *
 * Take the service from context and match the tags you expect. Rate limits
 * and outages have already been retried by the time an error arrives, so do
 * not add a retry of your own.
 */
import { GitHub } from '@resnovas/integrations.github'
import { Effect, Option } from 'effect'

// A file that may legitimately be absent: NotFound is an answer, not a
// failure. Every other GitHubError still fails the caller.
export const readOptionalFile = (path: string) =>
  Effect.gen(function* () {
    const github = yield* GitHub
    const { owner, repo } = github.coordinates
    return yield* github.getFile({ owner, repo, path }).pipe(
      Effect.map(Option.some),
      Effect.catchTag('NotFound', () => Effect.succeedNone),
    )
  })

// A write that a read-only token cannot make. Under the Restricted layer the
// Forbidden never reaches here; without it, report it as a finding's text
// rather than failing the whole feature.
export const labelIssue = (issue: number, label: string) =>
  Effect.gen(function* () {
    const github = yield* GitHub
    yield* github.addLabels(issue, [label])
    return `labelled #${issue} "${label}"`
  }).pipe(
    Effect.catchTags({
      Forbidden: (error) => Effect.succeed(`could not label #${issue}: ${error.message}`),
      // The request's own fault, such as a label GitHub rejects: retrying
      // would fail the same way.
      ValidationFailed: (error) => Effect.succeed(`GitHub rejected the label: ${error.detail}`),
    }),
  )
