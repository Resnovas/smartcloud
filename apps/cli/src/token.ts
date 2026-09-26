/**
 * @file apps/cli/src/token.ts
 *
 * Copyright 2021 Jonathan Stevens trading as Resnovas. All rights reserved.
 * Licensed under the Fair Core License, Version 1.0, MIT Future License
 * (FCL-1.0-MIT); see LICENSE. You may not move, change, disable or circumvent
 * the licence key functionality, or modify any part of the software that the
 * licence key protects.
 *
 * Contributions are made under the Developer Certificate of Origin (DCO.md) and
 * the Contributing Guidelines (CONTRIBUTING.md), subject to the Code of Conduct
 * (CODE_OF_CONDUCT.md) and the Eventiva Cooperation Commitment
 * (COOPERATION_COMMITMENT.md).
 *
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE.
 */

import { Command } from '@effect/platform'
import { Config, Data, Effect, Redacted } from 'effect'

/** No GitHub token could be found. */
export class MissingToken extends Data.TaggedError('MissingToken')<Record<never, never>> {
  override get message() {
    return 'no GitHub token: set GITHUB_TOKEN, or sign in with `gh auth login`'
  }
}

/**
 * The GitHub token for local runs: `GITHUB_TOKEN` if set, otherwise the
 * token of the signed-in GitHub CLI.
 *
 * @remarks
 * The token stays redacted from the moment it is read, so it can never be
 * logged. It is only resolved when a command needs GitHub, for example to
 * read a preset named in `extends`.
 *
 * @returns The redacted token.
 */
export const resolveToken = Config.redacted('GITHUB_TOKEN').pipe(
  Effect.orElse(() =>
    Command.string(Command.make('gh', 'auth', 'token')).pipe(
      Effect.map((output) => output.trim()),
      Effect.filterOrFail((token) => token !== '', () => new MissingToken()),
      Effect.map(Redacted.make),
    ),
  ),
  Effect.catchAll(() => Effect.fail(new MissingToken())),
)
