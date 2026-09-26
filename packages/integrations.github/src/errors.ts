/**
 * @file packages/integrations.github/src/errors.ts
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

import { Data } from 'effect'

/** The thing asked for does not exist, or the token cannot see it. */
export class NotFound extends Data.TaggedError('NotFound')<{ readonly operation: string; readonly detail: string }> {
  override get message() {
    return `${this.operation}: not found (${this.detail})`
  }
}

/** The token is not allowed to do this. */
export class Forbidden extends Data.TaggedError('Forbidden')<{ readonly operation: string; readonly detail: string }> {
  override get message() {
    return `${this.operation}: forbidden (${this.detail})`
  }
}

/** GitHub rate-limited the request. Retried with backoff before surfacing. */
export class RateLimited extends Data.TaggedError('RateLimited')<{ readonly operation: string; readonly detail: string }> {
  override get message() {
    return `${this.operation}: rate limited (${this.detail})`
  }
}

/** GitHub rejected the request as invalid, for example a duplicate label. */
export class ValidationFailed extends Data.TaggedError('ValidationFailed')<{
  readonly operation: string
  readonly detail: string
}> {
  override get message() {
    return `${this.operation}: rejected (${this.detail})`
  }
}

/** GitHub or the network failed. Retried with backoff before surfacing. */
export class Unavailable extends Data.TaggedError('Unavailable')<{ readonly operation: string; readonly detail: string }> {
  override get message() {
    return `${this.operation}: GitHub unavailable (${this.detail})`
  }
}

/** Every way a GitHub call can fail. */
export type GitHubError = NotFound | Forbidden | RateLimited | ValidationFailed | Unavailable

/**
 * Maps an HTTP status and message from GitHub to a typed error.
 *
 * @remarks
 * GitHub reports primary rate limits as 403 or 429 with a "rate limit"
 * message, so those are distinguished from a plain 403.
 *
 * @param operation - The operation that failed, for the error message.
 * @param status - The HTTP status, or undefined for a network failure.
 * @param detail - GitHub's message.
 * @returns The typed error.
 */
export const fromStatus = (operation: string, status: number | undefined, detail: string): GitHubError => {
  if (status === 404) return new NotFound({ operation, detail })
  if (status === 429 || ((status === 403 || status === 401) && /rate limit/i.test(detail))) {
    return new RateLimited({ operation, detail })
  }
  if (status === 401 || status === 403) return new Forbidden({ operation, detail })
  if (status === 409 || status === 422) return new ValidationFailed({ operation, detail })
  return new Unavailable({ operation, detail })
}
