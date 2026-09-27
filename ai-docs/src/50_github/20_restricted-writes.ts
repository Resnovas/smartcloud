/**
 * @file ai-docs/src/50_github/20_restricted-writes.ts
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

/**
 * @title Running with a read-only token
 *
 * A pull request from a fork or Dependabot runs with the workflow token,
 * which cannot label, comment or create check runs. `Restricted` turns each
 * refused write into a recorded skip, so the feature that tried still
 * finishes and the report says what was not written.
 */
import { Forbidden, GitHub, makeMemoryGitHub, Restricted, SkippedWrites } from '@resnovas/integrations.github'
import { Effect, Layer } from 'effect'

// An in-memory GitHub that refuses to comment, as the workflow token on a
// fork's pull request does.
const { service } = makeMemoryGitHub()
const readOnly = Layer.succeed(GitHub, {
  ...service,
  createComment: () => Effect.fail(new Forbidden({ operation: 'createComment', detail: 'read-only token' })),
})

export const example = Effect.gen(function* () {
  const github = yield* GitHub
  // Answered like a dry run: a comment with id 0.
  const comment = yield* github.createComment(1, 'Thanks for the pull request!')
  const skipped = yield* (yield* SkippedWrites).writes
  return { commentId: comment.id, skipped: skipped.map((write) => write.operation) }
}).pipe(Effect.provide(Restricted.pipe(Layer.provide(readOnly))))
